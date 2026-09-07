import requests
import feedparser
import json
import random
from typing import Dict, Any

# Bounding box for North Eastern Region (approximate)
NER_BOUNDS = {
    "min_lat": 21.9,
    "max_lat": 29.5,
    "min_lon": 89.6,
    "max_lon": 97.4
}

def generate_mock_weather_geojson() -> Dict[str, Any]:
    """Generates mock weather GeoJSON for NER region when API fails or is unavailable."""
    features = []
    
    # Generate some random mock polygons for weather warnings
    for i in range(5):
        lat = random.uniform(NER_BOUNDS["min_lat"], NER_BOUNDS["max_lat"])
        lon = random.uniform(NER_BOUNDS["min_lon"], NER_BOUNDS["max_lon"])
        
        feature = {
            "type": "Feature",
            "properties": {
                "id": f"weather-{i}",
                "type": random.choice(["Heavy Rain", "Thunderstorm", "Flash Flood Watch"]),
                "severity": random.choice(["Moderate", "Severe", "Extreme"]),
                "source": "IMD (Mock)",
                "rainfall_mm": random.randint(50, 200)
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [lon - 0.2, lat - 0.2],
                    [lon + 0.2, lat - 0.2],
                    [lon + 0.2, lat + 0.2],
                    [lon - 0.2, lat + 0.2],
                    [lon - 0.2, lat - 0.2]
                ]]
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

def generate_mock_alert_geojson() -> Dict[str, Any]:
    """Generates mock NDMA CAP alert GeoJSON for NER region."""
    features = []
    
    # Generate some random mock points for incidents
    for i in range(3):
        lat = random.uniform(NER_BOUNDS["min_lat"], NER_BOUNDS["max_lat"])
        lon = random.uniform(NER_BOUNDS["min_lon"], NER_BOUNDS["max_lon"])
        
        feature = {
            "type": "Feature",
            "properties": {
                "id": f"alert-{i}",
                "headline": random.choice(["Landslide warning along NH", "Bridge structurally compromised", "Road blocked by debris"]),
                "severity": random.choice(["Extreme", "Severe"]),
                "source": "NDMA CAP (Mock)"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

NER_CITIES = [
    {"name": "Guwahati, Assam", "lat": 26.1445, "lon": 91.7362},
    {"name": "Shillong, Meghalaya", "lat": 25.5788, "lon": 91.8933},
    {"name": "Itanagar, Arunachal Pradesh", "lat": 27.0844, "lon": 93.6053},
    {"name": "Imphal, Manipur", "lat": 24.8170, "lon": 93.9368},
    {"name": "Aizawl, Mizoram", "lat": 23.7271, "lon": 92.7176},
    {"name": "Kohima, Nagaland", "lat": 25.6701, "lon": 94.1077},
    {"name": "Agartala, Tripura", "lat": 23.8315, "lon": 91.2868},
    {"name": "Gangtok, Sikkim", "lat": 27.3389, "lon": 88.6065}
]

def fetch_imd_weather_geojson() -> Dict[str, Any]:
    """
    Fetches live weather data from Open-Meteo for NER cities.
    Converts areas with significant precipitation or bad weather codes into GeoJSON polygons.
    """
    try:
        # Prepare latitude and longitude arrays for Open-Meteo batch request
        lats = ",".join([str(city["lat"]) for city in NER_CITIES])
        lons = ",".join([str(city["lon"]) for city in NER_CITIES])
        
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lats}&longitude={lons}&current=precipitation,weather_code"
        response = requests.get(url, timeout=5)
        
        features = []
        if response.status_code == 200:
            data = response.json()
            # Open-Meteo returns a list if multiple coordinates are provided
            results = data if isinstance(data, list) else [data]
            
            for i, city_data in enumerate(results):
                city = NER_CITIES[i]
                current = city_data.get("current", {})
                precip = current.get("precipitation", 0.0)
                code = current.get("weather_code", 0)
                
                # Check for significant weather: precipitation > 0 or specific WMO weather codes
                # WMO Codes: 51-69 (Drizzle/Rain), 80-82 (Rain showers), 95-99 (Thunderstorms)
                if precip > 0 or (code >= 51 and code <= 69) or (code >= 80 and code <= 82) or (code >= 95 and code <= 99):
                    severity = "Extreme" if precip > 10.0 or code >= 95 else ("Severe" if precip > 2.0 or code >= 80 else "Moderate")
                    event_type = "Thunderstorm" if code >= 95 else ("Heavy Rain" if precip > 2.0 else "Light Rain")
                    
                    # Create a polygon box around the city to represent the weather zone (approx 40km box)
                    offset = 0.2
                    polygon = [[
                        [city["lon"] - offset, city["lat"] - offset],
                        [city["lon"] + offset, city["lat"] - offset],
                        [city["lon"] + offset, city["lat"] + offset],
                        [city["lon"] - offset, city["lat"] + offset],
                        [city["lon"] - offset, city["lat"] - offset]
                    ]]
                    
                    features.append({
                        "type": "Feature",
                        "properties": {
                            "id": f"weather-{i}",
                            "type": event_type,
                            "severity": severity,
                            "source": "Open-Meteo",
                            "rainfall_mm": precip,
                            "label": f"Weather Alert: {city['name']}"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": polygon
                        }
                    })
                    
        return {
            "type": "FeatureCollection",
            "features": features
        }
    except Exception as e:
        print(f"Error fetching Open-Meteo data: {e}")
        return {
            "type": "FeatureCollection",
            "features": []
        }


ndma_cache = {}
NDMA_URLS = [
    "https://sachet.ndma.gov.in/cap_public_website/rss/rss_assam.xml",
    "https://sachet.ndma.gov.in/cap_public_website/rss/rss_arunachal.xml",
    "https://sachet.ndma.gov.in/cap_public_website/rss/rss_manipur.xml",
    "https://sachet.ndma.gov.in/cap_public_website/rss/rss_meghalaya.xml",
    "https://sachet.ndma.gov.in/cap_public_website/rss/rss_mizoram.xml",
    "https://sachet.ndma.gov.in/cap_public_website/rss/rss_nagaland.xml",
    "https://sachet.ndma.gov.in/cap_public_website/rss/rss_tripura.xml",
    "https://sachet.ndma.gov.in/cap_public_website/rss/rss_sikkim.xml"
]

def fetch_ndma_alerts_geojson() -> Dict[str, Any]:
    """
    Attempts to fetch and parse NDMA CAP alerts using ETag caching.
    Falls back to mock data if all feeds fail or are empty.
    """
    features = []
    has_real_data = False
    
    for url in NDMA_URLS:
        try:
            headers = {}
            if url in ndma_cache and ndma_cache[url].get('etag'):
                headers['If-None-Match'] = ndma_cache[url]['etag']
                
            response = requests.get(url, headers=headers, timeout=5)
            
            if response.status_code == 304:
                # Use cached XML
                xml_content = ndma_cache[url]['xml']
            elif response.status_code == 200:
                # Update cache
                xml_content = response.content
                etag = response.headers.get('ETag')
                ndma_cache[url] = {'xml': xml_content, 'etag': etag}
            else:
                continue
                
            feed = feedparser.parse(xml_content)
            
            random_count = 0
            for entry in feed.entries:
                # Extract lat/lon if available in standard CAP
                lat = float(entry.geo_lat) if hasattr(entry, 'geo_lat') else None
                lon = float(entry.geo_long) if hasattr(entry, 'geo_long') else None
                
                # If no lat/lon in the feed, place it randomly within NER bounds for the prototype
                if lat is None or lon is None:
                    if random_count >= 1:
                        continue
                    lat = random.uniform(NER_BOUNDS["min_lat"], NER_BOUNDS["max_lat"])
                    lon = random.uniform(NER_BOUNDS["min_lon"], NER_BOUNDS["max_lon"])
                    random_count += 1
                    
                features.append({
                    "type": "Feature",
                    "properties": {
                        "id": entry.get("id", str(random.randint(1000, 9999))),
                        "headline": entry.get("title", "Disaster Alert"),
                        "severity": "Extreme", # Real CAP feeds have <cap:severity> but feedparser might abstract it
                        "source": "NDMA CAP"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    }
                })
            
            if feed.entries:
                has_real_data = True
                
        except Exception as e:
            print(f"Error fetching NDMA CAP data from {url}: {e}")
            
    if features:
        return {
            "type": "FeatureCollection",
            "features": features
        }
    else:
        # Return empty collection if no live alerts in NER region
        return {
            "type": "FeatureCollection",
            "features": []
        }

