import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Map, Navigation, Truck, AlertOctagon, BarChart2, Layers, Eye, EyeOff, Building2, Package, Shield, Radio, Cpu, Smartphone } from 'lucide-react';
import useStore from '../../store/useStore';

const navLinks = [
  { path: '/', label: 'Command Dashboard', icon: Map },
  { path: '/districts', label: 'District Intelligence', icon: Building2 },
  { path: '/route-planner', label: 'AI Route Planner', icon: Navigation },
  { path: '/vehicles', label: 'Fleet Operations', icon: Truck },
  { path: '/deliveries', label: 'Essential Logistics', icon: Package },
  { path: '/warehouses', label: 'Supply Hubs', icon: Shield },
  { path: '/facilities', label: 'Critical Infrastructure', icon: Radio },
  { path: '/incidents', label: 'Incident Feed', icon: AlertOctagon },
  { path: '/field-report', label: 'Field Officer App', icon: Smartphone },
  { path: '/simulator', label: 'What-If Simulator', icon: Cpu },
  { path: '/analytics', label: 'Risk Analytics', icon: BarChart2 },
];

const layerControls = [
  { key: 'landslide', label: 'Landslide Hazards', emoji: '⛰️', on: 'border-amber-400 bg-amber-400/10 text-amber-400', off: 'border-slate-700 bg-white/5 text-slate-500' },
  { key: 'flood',     label: 'Flood Inundation',  emoji: '🌊', on: 'border-blue-400 bg-blue-400/10 text-blue-400',    off: 'border-slate-700 bg-white/5 text-slate-500' },
  { key: 'blocked',   label: 'Blocked Roads',     emoji: '🚧', on: 'border-red-400 bg-red-400/10 text-red-400',       off: 'border-slate-700 bg-white/5 text-slate-500' },
  { key: 'monsoon',   label: 'Monsoon Activity',  emoji: '🌧️', on: 'border-violet-400 bg-violet-400/10 text-violet-400', off: 'border-slate-700 bg-white/5 text-slate-500' },
];

export default function Sidebar() {
  const { activeLayers, toggleLayer, emergencyMode } = useStore();
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <aside className={`w-72 min-w-72 flex flex-col gap-4 border-r p-4 overflow-y-auto transition-colors ${
      emergencyMode ? 'bg-slate-950 border-red-900/60' : 'bg-slate-800 border-slate-700'
    }`}>
      {/* Brand */}
      <div>
        <h1 className="text-xl font-black text-blue-400 tracking-tight flex items-center gap-2">
          NEXUS-NER AI
        </h1>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          <span className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${emergencyMode ? 'bg-red-500 shadow-red-500 animate-ping' : 'bg-emerald-500 shadow-emerald-500 animate-pulse'}`} />
          {emergencyMode ? 'EMERGENCY DISASTER MODE' : 'LIVE COMMAND NETWORK'}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-col gap-1 mt-1">
        {navLinks.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-md'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Map Layer Toggles - Dashboard only */}
      {isDashboard && (
        <div className="mt-2 pt-3 border-t border-slate-700">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Layers size={12} /> GIS Layers
          </p>
          <div className="flex flex-col gap-1.5">
            {layerControls.map(({ key, label, emoji, on, off }) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border-l-[3px] text-xs font-semibold transition-all duration-200 cursor-pointer ${activeLayers[key] ? on : off}`}
              >
                <span>{emoji} {label}</span>
                {activeLayers[key] ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* System Data Source Tags */}
      <div className="mt-auto pt-3 border-t border-slate-700/80 flex flex-col gap-1.5 text-[9px] font-mono text-slate-400">
        <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded">
          <span>IMD WEATHER:</span>
          <span className="text-emerald-400 font-bold">LIVE FEED</span>
        </div>
        <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded">
          <span>NDMA CAP:</span>
          <span className="text-emerald-400 font-bold">LIVE FEED</span>
        </div>
        <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded">
          <span>VEHICLE GPS:</span>
          <span className="text-amber-400 font-bold">SIMULATED</span>
        </div>
      </div>
    </aside>
  );
}
