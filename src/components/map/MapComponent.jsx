import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
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

// ── Risk Incident Data ────────────────────────────────────────────────────────
const INCIDENTS = [
  { id: 1, type: 'landslide', lon: 92.45, lat: 27.10, severity: 'CRITICAL', title: 'Landslide — West Kameng', detail: 'NH-13 blocked. Risk score 91%. Reroute via Tezpur.' },
  { id: 2, type: 'landslide', lon: 91.90, lat: 25.55, severity: 'HIGH',     title: 'Landslide — East Khasi Hills', detail: 'Road damage near Shillong. Proceed with caution.' },
  { id: 3, type: 'landslide', lon: 93.70, lat: 26.10, severity: 'HIGH',     title: 'Landslide — Nagaon', detail: 'Slope failure detected. Clearance in progress.' },
  { id: 4, type: 'flood',     lon: 94.60, lat: 27.50, severity: 'CRITICAL', title: 'Flood — Dhemaji', detail: 'Brahmaputra overflow. NH-15 submerged. Avoid area.' },
  { id: 5, type: 'flood',     lon: 94.20, lat: 27.20, severity: 'HIGH',     title: 'Flood — Dibrugarh', detail: 'Rising water levels. Evacuation underway.' },
  { id: 6, type: 'flood',     lon: 90.60, lat: 26.10, severity: 'MEDIUM',   title: 'Flood — Bongaigaon', detail: 'Minor flooding reported. Monitor conditions.' },
  { id: 7, type: 'blocked',   lon: 92.78, lat: 27.48, severity: 'CRITICAL', title: 'Road Blocked — Tawang', detail: 'Sela Pass closed. Debris clearance: 48h estimate.' },
  { id: 8, type: 'blocked',   lon: 93.50, lat: 24.80, severity: 'HIGH',     title: 'Road Blocked — Manipur', detail: 'NH-37 partially blocked due to rockfall.' },
];

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
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[92.0, 26.8], [93.2, 26.8], [93.2, 27.6], [92.0, 27.6], [92.0, 26.8]]]
          },
          properties: { label: 'High Landslide Zone' }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[91.4, 25.1], [92.4, 25.1], [92.4, 25.9], [91.4, 25.9], [91.4, 25.1]]]
          },
          properties: { label: 'Meghalaya Risk Zone' }
        }
      ]
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
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[96.0, 28.0], [95.5, 27.8], [94.5, 27.2], [93.5, 26.8], [92.5, 26.5], [91.0, 26.1], [89.9, 25.9]]
          }
        }
      ]
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
    const monsoonData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[90.5, 25.0], [93.5, 25.0], [93.5, 27.0], [90.5, 27.0], [90.5, 25.0]]]
          },
          properties: { label: 'Heavy Rainfall — Assam & Meghalaya' }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[93.0, 27.0], [96.5, 27.0], [96.5, 29.0], [93.0, 29.0], [93.0, 27.0]]]
          },
          properties: { label: 'Active Monsoon — Arunachal Pradesh' }
        }
      ]
    };

    const monsoonLayer = new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON().readFeatures(monsoonData, { featureProjection: 'EPSG:3857' })
      }),
      style: new Style({
        fill:   new Fill({ color: 'rgba(139, 92, 246, 0.15)' }),
        stroke: new Stroke({ color: 'rgba(139, 92, 246, 0.6)', width: 2, lineDash: [8, 5] })
      }),
      visible: false,  // off by default
      zIndex: 3,
    });
    layersRef.current.monsoon = monsoonLayer;

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
      layers: [baseLayer, landslideLayer, floodLayer, monsoonLayer, borderLayer, landslideMarkers, floodMarkers, blockedMarkers],
      overlays: [overlay],
      view: new View({
        center:   fromLonLat([93.0, 26.0]),
        zoom:     6.5,
        minZoom:  6,
        extent:   nerExtent,
        showFullExtent: true,
      }),
      controls: [],
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
          { color: '#ef4444', label: 'Critical Risk' },
          { color: '#f59e0b', label: 'High Risk / Landslide', dashed: true },
          { color: '#3b82f6', label: 'Flood Path' },
          { color: '#ef4444', label: 'Blocked Road', icon: '🚧' },
          { color: 'rgba(139,92,246,0.5)', label: 'Monsoon Zone', dashed: true },
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
            borderRadius: '10px', padding: '12px 16px', minWidth: '220px',
            boxShadow: `0 0 20px ${SEVERITY_COLOR[popupContent.severity]}33`,
            color: '#e2e8f0', fontSize: '0.8rem', position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <strong style={{ color: '#f1f5f9', fontSize: '0.85rem' }}>
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
