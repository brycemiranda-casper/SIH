import React from 'react';
import MapComponent from '../components/map/MapComponent';
import { Truck, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import useStore from '../store/useStore';

// ── Static Data ───────────────────────────────────────────────────────────────
const stats = [
  { label: 'Accessible Roads', value: '78%', icon: ShieldCheck, cls: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  { label: 'High Risk Roads',  value: '12%', icon: AlertTriangle, cls: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20' },
  { label: 'Blocked Routes',   value: '5%',  icon: Activity,     cls: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' },
  { label: 'Active Vehicles',  value: '23',  icon: Truck,        cls: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
];

const vehicles = [
  { id: 'MED-101',  cargo: 'Medicine', location: 'Bomdila', status: 'Moving',  risk: 'High',     riskCls: 'bg-amber-400/20 text-amber-400 border-amber-400/30' },
  { id: 'FOOD-202', cargo: 'Food',     location: 'Tezpur',  status: 'Moving',  risk: 'Medium',   riskCls: 'bg-slate-600/40 text-slate-300 border-slate-500/30' },
  { id: 'REL-301',  cargo: 'Relief',   location: 'Tawang',  status: 'Delayed', risk: 'Critical', riskCls: 'bg-red-400/20 text-red-400 border-red-400/30' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { activeLayers } = useStore();

  return (
    <div className="flex flex-col h-full w-full">
      
      {/* Stats Grid - Moved to top for Dashboard */}
      <div className="flex items-center gap-4 px-5 py-4 bg-slate-800 border-b border-slate-700 shrink-0">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mr-4">
          System Status
        </p>
        {stats.map(({ label, value, icon: Icon, cls, bg }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-2 border ${bg} min-w-48`}>
            <Icon size={20} className={cls} />
            <div>
              <p className={`text-xl font-bold ${cls}`}>{value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
        <span className="text-sm font-semibold text-slate-400">
          🗺️ NER GIS Intelligence Map — <span className="text-slate-300">Click markers for incident details</span>
        </span>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-red-400">🔴 3 Critical</span>
          <span className="text-amber-400">🟡 3 High</span>
          <span className="text-blue-400">🔵 2 Medium</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Satellite Active
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <MapComponent activeLayers={activeLayers} />
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="h-56 shrink-0 bg-slate-800 border-t border-slate-700 px-5 py-4 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Live Vehicle Tracking
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['Vehicle ID', 'Cargo', 'Location', 'Status', 'Risk Level'].map(h => (
                <th key={h} className="text-left pb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map(({ id, cargo, location, status, risk, riskCls }) => (
              <tr key={id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer">
                <td className="py-3 font-semibold text-blue-400">{id}</td>
                <td className="py-3 text-slate-300">{cargo}</td>
                <td className="py-3 text-slate-300">{location}</td>
                <td className="py-3 text-slate-300">{status}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${riskCls}`}>
                    {risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
