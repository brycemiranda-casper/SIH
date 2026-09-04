import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Map, Navigation, Truck, AlertOctagon, BarChart2, Layers, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import useStore from '../../store/useStore';

const navLinks = [
  { path: '/', label: 'Dashboard', icon: Map },
  { path: '/route-planner', label: 'Route Planner', icon: Navigation },
  { path: '/vehicles', label: 'Vehicles', icon: Truck },
  { path: '/incidents', label: 'Incidents', icon: AlertOctagon },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
];

const layerControls = [
  { key: 'landslide', label: 'Landslide Zones',  emoji: '⛰️', on: 'border-amber-400 bg-amber-400/10 text-amber-400', off: 'border-slate-700 bg-white/5 text-slate-500' },
  { key: 'flood',     label: 'Flood Path',        emoji: '🌊', on: 'border-blue-400 bg-blue-400/10 text-blue-400',    off: 'border-slate-700 bg-white/5 text-slate-500' },
  { key: 'blocked',   label: 'Blocked Roads',     emoji: '🚧', on: 'border-red-400 bg-red-400/10 text-red-400',       off: 'border-slate-700 bg-white/5 text-slate-500' },
  { key: 'monsoon',   label: 'Monsoon Activity',  emoji: '🌧️', on: 'border-violet-400 bg-violet-400/10 text-violet-400', off: 'border-slate-700 bg-white/5 text-slate-500' },
];

export default function Sidebar() {
  const { activeLayers, toggleLayer } = useStore();
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <aside className="w-72 min-w-72 flex flex-col gap-5 bg-slate-800 border-r border-slate-700 p-5 overflow-y-auto">
      {/* Brand */}
      <div>
        <h1 className="text-xl font-extrabold text-blue-400 tracking-tight">NEXUS-NER AI</h1>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e] animate-pulse" />
          Live Network
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-col gap-1 mt-2">
        {navLinks.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Map Layer Toggles - Only show on Dashboard */}
      {isDashboard && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-700 pb-2 flex items-center gap-1.5 mt-2">
            <Layers size={11} /> Map Layers
          </p>
          <div className="flex flex-col gap-2">
            {layerControls.map(({ key, label, emoji, on, off }) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border-l-[3px] text-sm font-medium transition-all duration-200 cursor-pointer ${activeLayers[key] ? on : off}`}
              >
                <span>{emoji} {label}</span>
                {activeLayers[key] ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="flex flex-col gap-2 mt-auto pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 border-b border-slate-700 pb-2">
          Active Alerts
        </p>
        {/* Critical */}
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-red-400 font-semibold text-xs mb-1.5">
            <AlertTriangle size={12} /> CRITICAL
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Landslide risk <span className="text-amber-400 font-bold">91%</span> on NH-13, West Kameng. Reroute advised.
          </p>
        </div>
        {/* High */}
        <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs mb-1.5">
            🌊 HIGH
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Brahmaputra flooding in Dhemaji. NH-15 submerged. Evacuation underway.
          </p>
        </div>
      </div>
    </aside>
  );
}
