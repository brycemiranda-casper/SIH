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
  { key: 'landslide', label: 'Landslide Hazards', emoji: '⛰️', on: 'border-amber-500 bg-amber-50 text-amber-700 font-bold', off: 'border-stone-200 bg-stone-50 text-stone-500' },
  { key: 'flood', label: 'Flood Inundation', emoji: '🌊', on: 'border-red-500 bg-red-50 text-red-700 font-bold', off: 'border-stone-200 bg-stone-50 text-stone-500' },
  { key: 'blocked', label: 'Blocked Roads', emoji: '🚧', on: 'border-red-600 bg-red-100 text-red-800 font-bold', off: 'border-stone-200 bg-stone-50 text-stone-500' },
  { key: 'monsoon', label: 'Monsoon Activity', emoji: '🌧️', on: 'border-purple-500 bg-purple-50 text-purple-700 font-bold', off: 'border-stone-200 bg-stone-50 text-stone-500' },
];

export default function Sidebar() {
  const { activeLayers, toggleLayer, emergencyMode } = useStore();
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <aside className={`w-72 min-w-72 flex flex-col gap-4 border-r p-4 overflow-y-auto transition-colors ${emergencyMode ? 'bg-red-100/90 border-red-300' : 'bg-white border-stone-200 shadow-sm'
      }`}>
      {/* Brand */}
      <div>
        <h1 className="text-xl font-black text-red-600 tracking-tight flex items-center gap-2">
          RightRoute
        </h1>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500 uppercase tracking-widest font-bold">
          <span className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${emergencyMode ? 'bg-red-600 shadow-red-500 animate-ping' : 'bg-emerald-500 shadow-emerald-500 animate-pulse'}`} />
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
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${isActive
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-stone-600 hover:bg-red-50 hover:text-red-700'
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
        <div className="mt-2 pt-3 border-t border-stone-200">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
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
      <div className="mt-auto pt-3 border-t border-stone-200 flex flex-col gap-1.5 text-[9px] font-mono text-stone-500">
        <div className="flex justify-between items-center bg-stone-50 border border-stone-200 px-2 py-1 rounded">
          <span>IMD WEATHER:</span>
          <span className="text-emerald-600 font-bold">LIVE FEED</span>
        </div>
        <div className="flex justify-between items-center bg-stone-50 border border-stone-200 px-2 py-1 rounded">
          <span>NDMA CAP:</span>
          <span className="text-emerald-600 font-bold">LIVE FEED</span>
        </div>
        <div className="flex justify-between items-center bg-stone-50 border border-stone-200 px-2 py-1 rounded">
          <span>VEHICLE GPS:</span>
          <span className="text-amber-600 font-bold">SIMULATED</span>
        </div>
      </div>
    </aside>
  );
}
