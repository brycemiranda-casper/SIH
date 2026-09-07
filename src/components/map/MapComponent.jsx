import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { defaults as defaultInteractions } from 'ol/interaction';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Fill, Stroke, Circle as CircleStyle, Text as TextStyle } from 'ol/style';
import { fromLonLat, transformExtent } from 'ol/proj';
import Overlay from 'ol/Overlay';
import useStore from '../../store/useStore';

// ── Risk Incident Data ────────────────────────────────────────────────────────
const INCIDENTS = []; // Completely real-time now

const SEVERITY_COLOR = {
  CRITICAL: '#ef4444',
  HIGH:     '#f59e0b',
  MEDIUM:   '#3b82f6',
};

const TYPE_EMOJI = {
  landslide: '⛰️',
  flood:     '🌊',
  blocked:   '🚧',
};

// ── Component ─────────────────────────────────────────────────────────────────
const MapComponent = ({ activeLayers }) => {
  const mapElement   = useRef(null);
  const popupRef     = useRef(null);
  const [map, setMap] = useState(null);
  const [popup, setPopup] = useState(null);
  const [popupContent, setPopupContent] = useState(null);

  const layersRef = useRef({ landslide: null, flood: null, blocked: null, monsoon: null });

  // Build a styled point feature
  const makeMarker = (inc) => {
    const feat = new Feature({ geometry: new Point(fromLonLat([inc.lon, inc.lat])), incident: inc });
    const color = SEVERITY_COLOR[inc.severity] || '#64748b';
    feat.setStyle(
      new Style({
        image: new CircleStyle({
          radius: inc.severity === 'CRITICAL' ? 11 : inc.severity === 'HIGH' ? 9 : 7,
          fill:   new Fill({ color }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
        text: new TextStyle({
          text: TYPE_EMOJI[inc.type],
          offsetY: -20,
          font: '14px sans-serif',
        }),
      })
    );
    return feat;
  };

  useEffect(() => {
    // ── Base Layer ──────────────────────────────────────────────────────────
    const baseLayer = new TileLayer({ source: new OSM() });

    // ── Landslide Zone Polygon Layer ────────────────────────────────────────
    const landslideZoneData = {
      type: 'FeatureCollection',
      features: []
    };

    const landslideLayer = new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON().readFeatures(landslideZoneData, { featureProjection: 'EPSG:3857' })
      }),
      style: new Style({
        fill:   new Fill({ color: 'rgba(245, 158, 11, 0.18)' }),
        stroke: new Stroke({ color: 'rgba(245, 158, 11, 0.8)', width: 2, lineDash: [6, 4] })
      }),
      visible: activeLayers.landslide,
      zIndex: 2,
    });
    layersRef.current.landslide = landslideLayer;

    // ── Flood Path Layer ────────────────────────────────────────────────────
    const floodData = {
      type: 'FeatureCollection',
      features: []
    };

    const floodLayer = new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON().readFeatures(floodData, { featureProjection: 'EPSG:3857' })
      }),
      style: new Style({
        stroke: new Stroke({ color: 'rgba(59,130,246,0.85)', width: 5, lineCap: 'round' })
      }),
      visible: activeLayers.flood,
      zIndex: 2,
    });
    layersRef.current.flood = floodLayer;

    // ── Incident Marker Layers ──────────────────────────────────────────────
    const makeMarkerLayer = (type) => {
      const features = INCIDENTS.filter(i => i.type === type).map(makeMarker);
      return new VectorLayer({
        source: new VectorSource({ features }),
        zIndex: 10,
      });
    };

    const landslideMarkers = makeMarkerLayer('landslide');
    const floodMarkers     = makeMarkerLayer('flood');
    const blockedMarkers   = makeMarkerLayer('blocked');
    layersRef.current.blocked = blockedMarkers;

    // ── Monsoon Activity Layer (purple rainfall zone polygons) ─────────────
    const monsoonSource = new VectorSource();
    fetch('http://localhost:8000/api/geojson/weather')
      .then(res => res.json())
      .then(data => {
        const features = new GeoJSON().readFeatures(data, { featureProjection: 'EPSG:3857' });
        monsoonSource.addFeatures(features);
      })
      .catch(err => console.error('Failed to fetch live IMD weather:', err));

    const monsoonLayer = new VectorLayer({
      source: monsoonSource,
      style: new Style({
        fill:   new Fill({ color: 'rgba(139, 92, 246, 0.15)' }),
        stroke: new Stroke({ color: 'rgba(139, 92, 246, 0.6)', width: 2, lineDash: [8, 5] })
      }),
      visible: false,  // off by default
      zIndex: 3,
    });
    layersRef.current.monsoon = monsoonLayer;

    // ── NDMA CAP Alerts Layer ──────────────────────────────────────────────
    const alertsSource = new VectorSource();
    fetch('http://localhost:8000/api/geojson/alerts')
      .then(res => res.json())
      .then(data => {
        const features = new GeoJSON().readFeatures(data, { featureProjection: 'EPSG:3857' });
        // Map geojson properties to match the incident format for the popup
        features.forEach(f => {
            f.set('incident', {
                type: 'blocked',
                title: f.get('headline'),
                severity: f.get('severity') === 'Extreme' ? 'CRITICAL' : 'HIGH',
                detail: 'Source: ' + f.get('source')
            });
        });
        alertsSource.addFeatures(features);
      })
      .catch(err => console.error('Failed to fetch live NDMA alerts:', err));

    const alertsLayer = new VectorLayer({
      source: alertsSource,
      style: new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: '#ef4444' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        }),
        text: new TextStyle({
          text: '🚨',
          offsetY: -20,
          font: '14px sans-serif'
        })
      }),
      zIndex: 11,
    });

    // ── NER State Borders ───────────────────────────────────────────────────
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
      .catch(err => console.error('GeoJSON error:', err));

    const borderLayer = new VectorLayer({
      source: borderSource,
      style: new Style({
        stroke: new Stroke({ color: '#1e293b', width: 2.5 }),
        fill:   new Fill({ color: 'rgba(15,23,42,0.05)' })
      }),
      zIndex: 1,
    });

    // ── Popup Overlay ───────────────────────────────────────────────────────
    const overlay = new Overlay({
      element:    popupRef.current,
      positioning: 'bottom-center',
      stopEvent:  true,
      offset:     [0, -14],
    });

    // ── Initialize Map ──────────────────────────────────────────────────────
    const initialMap = new Map({
      target: mapElement.current,
      layers: [baseLayer, landslideLayer, floodLayer, monsoonLayer, borderLayer, landslideMarkers, floodMarkers, blockedMarkers, alertsLayer],
      overlays: [overlay],
      view: new View({
        center:   fromLonLat([93.0, 26.0]),
        zoom:     6.5,
        minZoom:  6,
        extent:   nerExtent,
        showFullExtent: true,
      }),
      interactions: defaultInteractions({
        dragPan: true,
        pinchZoom: true,
        mouseWheelZoom: true,
      }),
    });

    // ── Click → Popup ───────────────────────────────────────────────────────
    initialMap.on('click', (evt) => {
      const feature = initialMap.forEachFeatureAtPixel(evt.pixel, f => f, { hitTolerance: 8 });
      if (feature && feature.get('incident')) {
        const inc = feature.get('incident');
        overlay.setPosition(evt.coordinate);
        setPopupContent(inc);
      } else {
        overlay.setPosition(undefined);
        setPopupContent(null);
      }
    });

    // Pointer cursor on hover
    initialMap.on('pointermove', (evt) => {
      const hit = initialMap.hasFeatureAtPixel(evt.pixel, { hitTolerance: 8 });
      initialMap.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    setMap(initialMap);
    setPopup(overlay);

    return () => initialMap.setTarget(null);
  }, []);

  // Sync layer visibility
  useEffect(() => {
    if (!map) return;
    if (layersRef.current.landslide) layersRef.current.landslide.setVisible(activeLayers.landslide);
    if (layersRef.current.flood)     layersRef.current.flood.setVisible(activeLayers.flood);
    if (layersRef.current.blocked)   layersRef.current.blocked.setVisible(activeLayers.blocked ?? true);
    if (layersRef.current.monsoon)   layersRef.current.monsoon.setVisible(activeLayers.monsoon ?? false);
  }, [activeLayers, map]);

  // Sync All Routes
  useEffect(() => {
    if (!map) return;
    
    // Remove existing route layer if any
    if (layersRef.current.route) {
      map.removeLayer(layersRef.current.route);
      layersRef.current.route = null;
    }
    // Remove existing waypoints layer if any
    if (layersRef.current.waypoints) {
      map.removeLayer(layersRef.current.waypoints);
      layersRef.current.waypoints = null;
    }

    const { routes, selectedRouteIndex, routeWaypoints } = useStore.getState();

    if (routes && routes.length > 0) {
      const routeFeatures = routes.map((route, idx) => {
        const isSelected = idx === selectedRouteIndex;
        const feature = new Feature({ geometry: new GeoJSON().readGeometry(route.geojson, { featureProjection: 'EPSG:3857' }) });
        
        let color = '#94a3b8'; // Default slate
        if (route.risk === 'Low') color = '#10b981'; // Emerald
        if (route.risk === 'Medium') color = '#f59e0b'; // Amber
        if (route.risk === 'High') color = '#ef4444'; // Red

        feature.setStyle(new Style({
          stroke: new Stroke({
            color: isSelected ? color : color + '80', // Add transparency if not selected
            width: isSelected ? 6 : 4,
            lineDash: isSelected ? undefined : [10, 10]
          })
        }));
        
        // Ensure selected route renders on top
        if (isSelected) {
          feature.set('zIndex', 10);
        } else {
          feature.set('zIndex', 1);
        }
        
        return feature;
      });
      
      // Sort features so zIndex works properly within the source
      routeFeatures.sort((a, b) => (a.get('zIndex') || 0) - (b.get('zIndex') || 0));

      const routeSource = new VectorSource({ features: routeFeatures });

      const routeLayer = new VectorLayer({
        source: routeSource,
        zIndex: 20, // Render on top of map
      });

      map.addLayer(routeLayer);
      layersRef.current.route = routeLayer;

      // Add waypoints
      if (routeWaypoints && routeWaypoints.length > 0) {
        const wpFeatures = routeWaypoints.map((wp, i) => {
          const isOrigin = i === 0;
          const isDest = i === routeWaypoints.length - 1;
          const label = isOrigin ? 'A' : isDest ? 'B' : `${i}`;
          
          const feature = new Feature({ geometry: new Point(fromLonLat([wp.lon, wp.lat])) });
          feature.setStyle(
            new Style({
              image: new CircleStyle({
                radius: 12,
                fill: new Fill({ color: isOrigin ? '#10b981' : isDest ? '#ef4444' : '#f59e0b' }),
                stroke: new Stroke({ color: '#fff', width: 2 }),
              }),
              text: new TextStyle({
                text: label,
                fill: new Fill({ color: '#fff' }),
                font: 'bold 12px sans-serif'
              })
            })
          );
          return feature;
        });

        const wpLayer = new VectorLayer({
          source: new VectorSource({ features: wpFeatures }),
          zIndex: 21
        });
        map.addLayer(wpLayer);
        layersRef.current.waypoints = wpLayer;
      }

      // Fit map to route extent
      map.getView().fit(routeSource.getExtent(), {
        padding: [50, 50, 50, 50],
        duration: 1000
      });
    }
  }, [map, useStore(state => state.routes), useStore(state => state.selectedRouteIndex)]); // Subscribe to route changes

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {/* Map canvas */}
      <div ref={mapElement} style={{ width: '100%', height: '100%' }} />

      {/* Map Legend */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '16px',
        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
        border: '1px solid #334155', borderRadius: '10px', padding: '12px 16px',
        color: '#e2e8f0', fontSize: '0.75rem', zIndex: 100,
      }}>
        <div style={{ fontWeight: '700', marginBottom: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend</div>
        {[
          { color: '#ef4444', label: 'NDMA Alert (Critical)' },
          { color: '#f59e0b', label: 'NDMA Alert (High)', dashed: true },
          { color: '#3b82f6', label: 'Flood Risk Path' },
          { color: '#ef4444', label: 'Blocked Road / Landslide', icon: '🚧' },
          { color: 'rgba(139,92,246,0.5)', label: 'Heavy Rain Warning (Live)', dashed: true },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: l.dashed ? '2px' : '50%',
              background: l.color, border: l.dashed ? `2px dashed ${l.color}` : 'none', flexShrink: 0,
            }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Popup */}
      <div ref={popupRef}>
        {popupContent && (
          <div style={{
            background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
            border: `1px solid ${SEVERITY_COLOR[popupContent.severity]}55`,
            borderRadius: '10px', padding: '12px 16px', minWidth: '220px', maxWidth: '320px',
            boxShadow: `0 0 20px ${SEVERITY_COLOR[popupContent.severity]}33`,
            color: '#e2e8f0', fontSize: '0.8rem', position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <strong style={{ color: '#f1f5f9', fontSize: '0.85rem', wordBreak: 'break-word', paddingRight: '12px' }}>
                {TYPE_EMOJI[popupContent.type]} {popupContent.title}
              </strong>
              <span style={{
                background: SEVERITY_COLOR[popupContent.severity] + '22',
                color:  SEVERITY_COLOR[popupContent.severity],
                border: `1px solid ${SEVERITY_COLOR[popupContent.severity]}44`,
                padding: '1px 8px', borderRadius: '99px', fontSize: '0.7rem',
                fontWeight: '700', marginLeft: '8px', whiteSpace: 'nowrap',
              }}>
                {popupContent.severity}
              </span>
            </div>
            <p style={{ color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>{popupContent.detail}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
