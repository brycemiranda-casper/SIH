import React, { useState } from 'react';
import { Activity, CloudRain, Mountain, Navigation, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeLayers, toggleLayer }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const layers = [
    { id: 'terrain', label: '3D Terrain Model', icon: Mountain, color: 'text-gray-300' },
    { id: 'monsoon', label: 'Monsoon Activity (Real-time)', icon: CloudRain, color: 'text-blue-400' },
    { id: 'landslide', label: 'Landslide Risk Zones', icon: AlertTriangle, color: 'text-amber-500' },
    { id: 'flood', label: 'Brahmaputra Flood Path', icon: Activity, color: 'text-red-400' },
  ];

  return (
    <div className={`sidebar glass-panel ${isMinimized ? 'minimized' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        {!isMinimized && (
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={24} color="#3b82f6" /> NER GIS Command
          </h1>
        )}
        {isMinimized && (
          <Navigation size={24} color="#3b82f6" style={{ margin: '0 auto' }} />
        )}
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px', display: 'flex' }}
          title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
        >
          {isMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!isMinimized && (
        <>
          <div className="status-indicator" style={{ marginBottom: '20px' }}>
            <span className="status-dot active"></span>
            System Online • Syncing sat data
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Active Overlays
            </h3>
            
            {layers.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayers[layer.id];
              
              return (
                <button
                  key={layer.id}
                  className={`layer-toggle ${isActive ? 'active' : ''}`}
                  onClick={() => toggleLayer(layer.id)}
                >
                  <div className="icon">
                    <Icon size={18} style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)' }} />
                    <span>{layer.label}</span>
                  </div>
                  <div style={{ 
                    width: '12px', height: '12px', borderRadius: '50%', 
                    border: '1px solid var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }} />
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--accent-red)' }}>Alerts</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              High precipitation detected in Meghalaya region. Landslide risk elevated to <strong style={{color: 'var(--accent-amber)'}}>WARNING</strong>.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
