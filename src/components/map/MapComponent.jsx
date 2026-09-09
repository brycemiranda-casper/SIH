import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { defaults as defaultInteractions } from 'ol/interaction';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Fill, Stroke, Circle as CircleStyle, Text as TextStyle } from 'ol/style';
import { fromLonLat, transformExtent } from 'ol/proj';
import Overlay from 'ol/Overlay';
import useStore from '../../store/useStore';

const SEVERITY_COLOR = {
  CRITICAL: '#ef4444',
  HIGH:     '#f59e0b',
  MEDIUM:   '#3b82f6',
};

const FACILITY_EMOJI = {
  Hospital: '🏥',
  'Relief Camp': '⛺',
  Warehouse: '🏭',
};

const MapComponent = ({ activeLayers = {} }) => {
  const mapElement = useRef(null);
  const popupRef = useRef(null);
  const [map, setMap] = useState(null);
  const [popupContent, setPopupContent] = useState(null);

  const layersRef = useRef({ 
    landslide: null, 
    flood: null, 
    blocked: null, 
    monsoon: null,
    facilities: null,
    vehicles: null,
    route: null,
    waypoints: null
  });

  const { routes, selectedRouteIndex, routeWaypoints, facilities, vehicles, fetchFacilities } = useStore();

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  useEffect(() => {
    // Base Layer
    const baseLayer = new TileLayer({ source: new OSM() });

    // Incident / Hazard Marker Layer
    const incidentsSource = new VectorSource();
    const incidentsLayer = new VectorLayer({
      source: incidentsSource,
      zIndex: 10,
    });
    layersRef.current.blocked = incidentsLayer;

    // Critical Facilities Layer
    const facilitiesSource = new VectorSource();
    const facilitiesLayer = new VectorLayer({
      source: facilitiesSource,
      zIndex: 12,
    });
    layersRef.current.facilities = facilitiesLayer;

    // Vehicles Layer (Live Telemetry)
    const vehiclesSource = new VectorSource();
    const vehiclesLayer = new VectorLayer({
      source: vehiclesSource,
      zIndex: 15,
    });
    layersRef.current.vehicles = vehiclesLayer;

    // Monsoon / IMD Layer
    const monsoonSource = new VectorSource();
    fetch('http://localhost:8000/api/geojson/weather')
      .then(res => res.json())
      .then(data => {
        const features = new GeoJSON().readFeatures(data, { featureProjection: 'EPSG:3857' });
        monsoonSource.addFeatures(features);
      })
      .catch(() => {});

    const monsoonLayer = new VectorLayer({
      source: monsoonSource,
      style: new Style({
        fill: new Fill({ color: 'rgba(139, 92, 246, 0.15)' }),
        stroke: new Stroke({ color: 'rgba(139, 92, 246, 0.6)', width: 2, lineDash: [8, 5] })
      }),
      visible: false,
      zIndex: 3,
    });
    layersRef.current.monsoon = monsoonLayer;

    // State Borders
    const nerExtent = transformExtent([89.6, 21.8, 97.5, 29.5], 'EPSG:4326', 'EPSG:3857');
    const borderSource = new VectorSource();
    const nerStateNames = ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'];

    fetch('https://raw.githubusercontent.com/AbhinavSwami28/india-official-geojson/main/india-states-simplified.geojson')
      .then(res => res.json())
      .then(data => {
        const features = new GeoJSON().readFeatures(data, { featureProjection: 'EPSG:3857' });
        borderSource.addFeatures(
          features.filter(f => {
            const name = f.get('st_nm') || f.get('name') || f.get('NAME_1') || f.get('state');
            return nerStateNames.includes(name);
          })
        );
      })
      .catch(() => {});

    const borderLayer = new VectorLayer({
      source: borderSource,
      style: new Style({
        stroke: new Stroke({ color: '#334155', width: 2 }),
        fill: new Fill({ color: 'rgba(15,23,42,0.05)' })
      }),
      zIndex: 1,
    });

    // Popup Overlay
    const overlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: true,
      offset: [0, -14],
    });

    // Initialize Map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [baseLayer, monsoonLayer, borderLayer, incidentsLayer, facilitiesLayer, vehiclesLayer],
      overlays: [overlay],
      view: new View({
        center: fromLonLat([93.0, 26.0]),
        zoom: 6.5,
        minZoom: 5.5,
        extent: nerExtent,
        showFullExtent: true,
      }),
      interactions: defaultInteractions({
        dragPan: true,
        pinchZoom: true,
        mouseWheelZoom: true,
      }),
    });

    initialMap.on('click', (evt) => {
      const feature = initialMap.forEachFeatureAtPixel(evt.pixel, f => f, { hitTolerance: 8 });
      if (feature && feature.get('details')) {
        overlay.setPosition(evt.coordinate);
        setPopupContent(feature.get('details'));
      } else {
        overlay.setPosition(undefined);
        setPopupContent(null);
      }
    });

    initialMap.on('pointermove', (evt) => {
      const hit = initialMap.hasFeatureAtPixel(evt.pixel, { hitTolerance: 8 });
      initialMap.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    setMap(initialMap);
    return () => initialMap.setTarget(null);
  }, []);

  // Sync Facility Markers
  useEffect(() => {
    if (!map || !layersRef.current.facilities) return;
    const source = layersRef.current.facilities.getSource();
    source.clear();

    (facilities || []).forEach(fac => {
      if (!fac.lat || !fac.lon) return;
      const feat = new Feature({
        geometry: new Point(fromLonLat([fac.lon, fac.lat])),
        details: {
          title: `${FACILITY_EMOJI[fac.type] || '🏥'} ${fac.name}`,
          severity: fac.accessibility === 'Open' ? 'MEDIUM' : 'CRITICAL',
          detail: `Type: ${fac.type} | District: ${fac.district} | Access: ${fac.accessibility}`
        }
      });
      feat.setStyle(new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: fac.accessibility === 'Open' ? '#10b981' : '#ef4444' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        }),
        text: new TextStyle({
          text: FACILITY_EMOJI[fac.type] || '🏥',
          offsetY: -18,
          font: '13px sans-serif'
        })
      }));
      source.addFeature(feat);
    });

    layersRef.current.facilities.setVisible(activeLayers.facilities ?? true);
  }, [map, facilities, activeLayers.facilities]);

  // Sync Vehicle Markers
  useEffect(() => {
    if (!map || !layersRef.current.vehicles) return;
    const source = layersRef.current.vehicles.getSource();
    source.clear();

    (vehicles || []).forEach(v => {
      if (!v.lat || !v.lon) return;
      const feat = new Feature({
        geometry: new Point(fromLonLat([v.lon, v.lat])),
        details: {
          title: `🚚 ${v.id} (${v.driver})`,
          severity: v.risk === 'High' ? 'CRITICAL' : 'MEDIUM',
          detail: `Cargo: ${v.cargo} | Location: ${v.location} | Speed: ${v.speed || 35} km/h (SIMULATED GPS)`
        }
      });
      feat.setStyle(new Style({
        image: new CircleStyle({
          radius: 9,
          fill: new Fill({ color: '#3b82f6' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        }),
        text: new TextStyle({
          text: `🚛 ${v.id}`,
          offsetY: -18,
          font: 'bold 11px sans-serif',
          fill: new Fill({ color: '#60a5fa' })
        })
      }));
      source.addFeature(feat);
    });
  }, [map, vehicles]);

  // Sync Calculated Safe Routes & Waypoints onto Map
  useEffect(() => {
    if (!map) return;

    // Clear old route layer if present
    if (layersRef.current.route) {
      map.removeLayer(layersRef.current.route);
      layersRef.current.route = null;
    }
    // Clear old waypoints layer if present
    if (layersRef.current.waypoints) {
      map.removeLayer(layersRef.current.waypoints);
      layersRef.current.waypoints = null;
    }

    if (routes && routes.length > 0) {
      const routeFeatures = routes.map((route, idx) => {
        const isSelected = idx === selectedRouteIndex;
        const feature = new Feature({
          geometry: new GeoJSON().readGeometry(route.geojson, { featureProjection: 'EPSG:3857' })
        });

        let color = '#3b82f6';
        if (route.risk === 'Low') color = '#10b981';
        if (route.risk === 'Medium') color = '#f59e0b';
        if (route.risk === 'High') color = '#ef4444';

        feature.setStyle(new Style({
          stroke: new Stroke({
            color: isSelected ? color : color + '77',
            width: isSelected ? 7 : 4,
            lineDash: isSelected ? undefined : [8, 8]
          })
        }));

        feature.set('zIndex', isSelected ? 100 : 10);
        return feature;
      });

      const routeSource = new VectorSource({ features: routeFeatures });
      const routeLayer = new VectorLayer({
        source: routeSource,
        zIndex: 50
      });

      map.addLayer(routeLayer);
      layersRef.current.route = routeLayer;

      // Add Waypoint markers (A -> Stops -> B)
      if (routeWaypoints && routeWaypoints.length > 0) {
        const wpFeatures = routeWaypoints.map((wp, i) => {
          const isOrigin = i === 0;
          const isDest = i === routeWaypoints.length - 1;
          const label = isOrigin ? 'ORIGIN (A)' : isDest ? 'DEST (B)' : `STOP ${i}`;
          
          const feature = new Feature({
            geometry: new Point(fromLonLat([wp.lon, wp.lat])),
            details: {
              title: label,
              severity: 'MEDIUM',
              detail: wp.name
            }
          });
          feature.setStyle(new Style({
            image: new CircleStyle({
              radius: 12,
              fill: new Fill({ color: isOrigin ? '#10b981' : isDest ? '#ef4444' : '#f59e0b' }),
              stroke: new Stroke({ color: '#ffffff', width: 3 }),
            }),
            text: new TextStyle({
              text: isOrigin ? 'A' : isDest ? 'B' : `${i}`,
              fill: new Fill({ color: '#ffffff' }),
              font: 'bold 12px sans-serif'
            })
          }));
          return feature;
        });

        const wpLayer = new VectorLayer({
          source: new VectorSource({ features: wpFeatures }),
          zIndex: 55
        });
        map.addLayer(wpLayer);
        layersRef.current.waypoints = wpLayer;
      }

      // Auto-fit view to route extent
      try {
        const extent = routeSource.getExtent();
        if (extent && !extent.includes(Infinity)) {
          map.getView().fit(extent, {
            padding: [60, 60, 60, 60],
            duration: 1000
          });
        }
      } catch (err) {
        console.warn('Map fit extent error:', err);
      }
    }
  }, [map, routes, selectedRouteIndex, routeWaypoints]);

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <div ref={mapElement} style={{ width: '100%', height: '100%' }} />

      {/* Map Legend */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '16px',
        background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(8px)',
        border: '1px solid #334155', borderRadius: '10px', padding: '12px 16px',
        color: '#e2e8f0', fontSize: '0.75rem', zIndex: 100,
      }}>
        <div style={{ fontWeight: '700', marginBottom: '6px', color: '#94a3b8', textTransform: 'uppercase' }}>
          NER Layer Legend
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>🏥 Hospital / Facility (Open / Impaired)</div>
          <div>🚚 Live Fleet Truck (SIMULATED GPS)</div>
          <div>🚨 Active Incident / Hazard Zone</div>
          {routes && routes.length > 0 && (
            <div style={{ color: '#10b981', fontWeight: 'bold' }}>🛣️ Active Safe Route Calculated</div>
          )}
        </div>
      </div>

      {/* Popup */}
      <div ref={popupRef}>
        {popupContent && (
          <div style={{
            background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
            border: `1px solid ${SEVERITY_COLOR[popupContent.severity] || '#3b82f6'}55`,
            borderRadius: '10px', padding: '12px 16px', minWidth: '220px', maxWidth: '320px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            color: '#e2e8f0', fontSize: '0.8rem', position: 'relative',
          }}>
            <strong style={{ color: '#f1f5f9', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
              {popupContent.title}
            </strong>
            <p style={{ color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>{popupContent.detail}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
