import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:8000/api';

const useStore = create((set) => ({
  activeLayers: {
    landslide: true,
    flood: true,
    blocked: true,
    monsoon: false,
  },
  vehicles: [],
  incidents: [],
  riskPrediction: null,
  loading: false,

  // Routing State
  routes: [],
  selectedRouteIndex: 0,
  routeLoading: false,
  routeWaypoints: [], // To show markers on the map

  toggleLayer: (key) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [key]: !state.activeLayers[key],
      },
    })),

  fetchVehicles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      const data = await response.json();
      set({ vehicles: data });
    } catch (error) {
      console.warn('Backend not connected. Loading mock vehicles for UI testing.');
      const mockVehicles = [
        {
          id: 'TRK-9001',
          driver: 'Ramesh Singh',
          type: 'Heavy Truck',
          cargo: 'Medical Supplies',
          location: 'NH-15, Tezpur, Assam',
          status: 'In Transit',
          eta: '2h 15m',
          risk: 'Medium',
          lastUpdate: '5 mins ago'
        },
        {
          id: 'VAN-4002',
          driver: 'Amit Das',
          type: 'Delivery Van',
          cargo: 'Food & Water',
          location: 'Guwahati Depot, Assam',
          status: 'Idle',
          eta: 'N/A',
          risk: 'Low',
          lastUpdate: '10 mins ago'
        },
        {
          id: 'TRK-9045',
          driver: 'Suresh Kumar',
          type: 'Heavy Truck',
          cargo: 'Rescue Equipment',
          location: 'Shillong Bypass, Meghalaya',
          status: 'In Transit',
          eta: '45m',
          risk: 'High',
          lastUpdate: '2 mins ago'
        },
        {
          id: 'VAN-4122',
          driver: 'Prakash B',
          type: 'Delivery Van',
          cargo: 'Blankets & Tents',
          location: 'Dimapur, Nagaland',
          status: 'Delivering',
          eta: '10m',
          risk: 'Medium',
          lastUpdate: '1 min ago'
        },
        {
          id: 'TRK-8833',
          driver: 'John Doe',
          type: 'Heavy Truck',
          cargo: 'Heavy Machinery',
          location: 'Silchar, Assam',
          status: 'Maintenance',
          eta: 'N/A',
          risk: 'Low',
          lastUpdate: '1 hour ago'
        }
      ];
      set({ vehicles: mockVehicles });
    }
  },

  updateVehicleStatus: async (id, newStatus) => {
    // Optimistic UI update
    set((state) => ({
      vehicles: state.vehicles.map(v => 
        v.id === id ? { ...v, status: newStatus } : v
      )
    }));
    try {
      await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("Backend update failed, but UI is updated locally.");
    }
  },

  fetchIncidents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents`);
      const data = await response.json();
      set({ incidents: data });
    } catch (error) {
      console.warn('Backend not connected. Loading mock incidents for UI testing.');
      // Fallback Mock Data
      const mockIncidents = [
        {
          id: 'INC-1001',
          type: 'Landslide',
          severity: 'Critical',
          location: 'NH-13, West Kameng, Arunachal Pradesh',
          status: 'Active',
          timestamp: '10 mins ago',
          description: 'Massive landslide blocking both lanes. Immediate rerouting of supplies required.'
        },
        {
          id: 'INC-1002',
          type: 'Flood',
          severity: 'High',
          location: 'Dhemaji District, Assam',
          status: 'Responding',
          timestamp: '1 hour ago',
          description: 'Brahmaputra river overflow. NH-15 submerged under 3ft of water. Evacuation ongoing.'
        },
        {
          id: 'INC-1003',
          type: 'Blocked Road',
          severity: 'Medium',
          location: 'Shillong Bypass, Meghalaya',
          status: 'Under Investigation',
          timestamp: '3 hours ago',
          description: 'Fallen trees due to heavy monsoon winds. Single lane currently open.'
        },
        {
          id: 'INC-1004',
          type: 'Landslide',
          severity: 'High',
          location: 'Dimapur-Kohima Road, Nagaland',
          status: 'Active',
          timestamp: '5 hours ago',
          description: 'Mudslide reported near Chumukedima. Risk of further soil destabilization.'
        }
      ];
      set({ incidents: mockIncidents });
    }
  },

  updateIncidentStatus: async (id, newStatus) => {
    // Optimistic update
    set((state) => ({
      incidents: state.incidents.map(inc => 
        inc.id === id ? { ...inc, status: newStatus } : inc
      )
    }));
    try {
      await fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("Backend update failed, but UI is updated locally.");
    }
  },

  fetchRiskPrediction: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/risk-prediction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather_condition: "Heavy Rain",
          road_condition: "Slippery",
          terrain_risk: "Mountainous",
          incident_count: 5
        })
      });
      const data = await response.json();
      set({ riskPrediction: data });
    } catch (error) {
      console.warn('Backend not connected. Loading mock AI Risk Score.');
      set({ 
        riskPrediction: {
          risk_score: 88,
          status: "Critical",
          breakdown: {
            "Terrain": 92,
            "Weather": 85,
            "Density": 78
          }
        } 
      });
    }
  },

  setSelectedRouteIndex: (index) => set({ selectedRouteIndex: index }),

  fetchRoute: async (originStr, destinationStr, vehicleType = 'car', stops = []) => {
    set({ routeLoading: true, routes: [], routeWaypoints: [] });
    try {
      // 1. Geocode Origin and Destination first
      const geocode = async (query) => {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const data = await res.json();
        if (!data.length) throw new Error(`Location not found: ${query}`);
        return { lon: parseFloat(data[0].lon), lat: parseFloat(data[0].lat), name: query };
      };

      const origin = await geocode(originStr);
      const dest = await geocode(destinationStr);

      // 2. Geocode Stops using a Bounding Box between Origin and Destination
      // This ensures we find e.g., a "Hospital" that is actually between the two cities
      const minLon = Math.min(origin.lon, dest.lon) - 0.5;
      const maxLon = Math.max(origin.lon, dest.lon) + 0.5;
      const minLat = Math.min(origin.lat, dest.lat) - 0.5;
      const maxLat = Math.max(origin.lat, dest.lat) + 0.5;
      const viewBox = `${minLon},${minLat},${maxLon},${maxLat}`;

      const geocodeBounded = async (query) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&viewbox=${viewBox}&bounded=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.length) {
          console.warn(`Bounded location not found for: ${query}. Falling back to global search.`);
          return await geocode(query);
        }
        return { lon: parseFloat(data[0].lon), lat: parseFloat(data[0].lat), name: query };
      };
      
      const geocodedStops = [];
      for (const stop of stops) {
        if (stop.location) {
          const pt = await geocodeBounded(stop.location);
          geocodedStops.push({ ...pt, duration: stop.duration || 0 });
        }
      }

      // 3. Guarantee Real Multiple Routes by forcing detours through offset waypoints
      const fetchOSRM = async (waypointsStr) => {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypointsStr}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes.length > 0) return data.routes[0];
        return null;
      };

      // Base coordinates without forced detours
      const baseCoords = [
        `${origin.lon},${origin.lat}`,
        ...geocodedStops.map(s => `${s.lon},${s.lat}`),
        `${dest.lon},${dest.lat}`
      ];

      // Calculate midpoint to place offsets
      const midLon = (origin.lon + dest.lon) / 2;
      const midLat = (origin.lat + dest.lat) / 2;
      
      // We will try 3 variations: Direct, Detour North (+lat), Detour East (+lon)
      const requests = [
        fetchOSRM(baseCoords.join(';')),
        fetchOSRM([`${origin.lon},${origin.lat}`, `${midLon},${midLat + 0.1}`, `${dest.lon},${dest.lat}`].join(';')),
        fetchOSRM([`${origin.lon},${origin.lat}`, `${midLon + 0.1},${midLat}`, `${dest.lon},${dest.lat}`].join(';'))
      ];

      const results = await Promise.all(requests);
      
      // Filter out failed requests and deduplicate by distance (so we don't show identical routes)
      let rawRoutes = [];
      const seenDistances = new Set();
      for (const r of results) {
        if (r) {
          const distKey = Math.round(r.distance / 100); // round to nearest 100m
          if (!seenDistances.has(distKey)) {
            seenDistances.add(distKey);
            rawRoutes.push(r);
          }
        }
      }

      if (rawRoutes.length === 0) {
        throw new Error("Route calculation failed");
      }

      // 5. Apply Vehicle multipliers and mock Risk Assessment
      const multipliers = {
        'car': 1,
        'bike': 0.8, // Bikes are faster in traffic/shortcuts
        'small_goods': 1.2,
        'truck': 1.5 // Trucks are slower
      };
      const multiplier = multipliers[vehicleType] || 1;
      const extraStopSeconds = geocodedStops.reduce((acc, curr) => acc + (curr.duration * 60), 0);

      let parsedRoutes = rawRoutes.map((route, idx) => {
        const distKm = route.distance / 1000;
        const adjustedDurationSeconds = (route.duration * multiplier) + extraStopSeconds;
        
        const hrs = Math.floor(adjustedDurationSeconds / 3600);
        const mins = Math.floor((adjustedDurationSeconds % 3600) / 60);
        const eta = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

        // Mock a risk factor based on distance and route index
        let riskScore = (distKm > 300 ? 50 : distKm > 100 ? 20 : 0) + (idx * 25); // Synthesized routes get higher risk
        let riskLabel = riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low';
        let riskNumeric = riskScore > 60 ? 3 : riskScore > 30 ? 2 : 1;

        return {
          id: idx,
          geojson: route.geometry,
          distanceVal: distKm,
          distance: `${distKm.toFixed(1)} km`,
          durationVal: adjustedDurationSeconds,
          eta: eta,
          risk: riskLabel,
          riskNumeric: riskNumeric,
          issues: riskLabel === 'Low' ? 'Clear route.' : riskLabel === 'Medium' ? 'Proceed with caution.' : 'Severe hazards detected.'
        };
      });

      // 6. Custom Route Sorting based on Vehicle Type
      if (vehicleType === 'truck') {
        parsedRoutes.sort((a, b) => {
          if (a.riskNumeric !== b.riskNumeric) return a.riskNumeric - b.riskNumeric;
          return a.distanceVal - b.distanceVal;
        });
      } else if (vehicleType === 'bike') {
        parsedRoutes.sort((a, b) => a.distanceVal - b.distanceVal);
      } else {
        parsedRoutes.sort((a, b) => a.durationVal - b.durationVal);
      }

      // Re-assign Primary vs Alternate
      parsedRoutes = parsedRoutes.map((route, idx) => ({
        ...route,
        name: idx === 0 ? `Primary: ${originStr} → ${destinationStr}` : `Alternate Route ${idx}`,
        isPrimary: idx === 0,
        issues: idx === 0 ? `AI Optimized for ${vehicleType}. ${route.issues}` : route.issues
      }));

      // Ensure we only return top 3 if more somehow slipped in
      parsedRoutes = parsedRoutes.slice(0, 3);

      set({
        routes: parsedRoutes,
        selectedRouteIndex: 0,
        routeWaypoints: [origin, ...geocodedStops, dest],
        routeLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch route:', error);
      set({ routeLoading: false });
    }
  },

  clearRoute: () => set({ routes: [], routeWaypoints: [] })
}));

export default useStore;
