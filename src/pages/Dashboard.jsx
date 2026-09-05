import React, { useEffect } from 'react';
import MapComponent from '../components/map/MapComponent';
import { Truck, AlertTriangle, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import useStore from '../store/useStore';

// ── Static Data ───────────────────────────────────────────────────────────────
const stats = [
  { label: 'Accessible Roads', value: '78%', icon: ShieldCheck, cls: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  { label: 'High Risk Roads',  value: '12%', icon: AlertTriangle, cls: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20' },
  { label: 'Blocked Routes',   value: '5%',  icon: Activity,     cls: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' },
  { label: 'Active Vehicles',  value: '23',  icon: Truck,        cls: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
];

const RiskGauge = ({ prediction }) => {
  const { risk_score: score, status, breakdown } = prediction;
  
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = "text-emerald-400";
  let strokeColor = "stroke-emerald-400";
  let bgGradient = "from-emerald-500/20";
  
  if (score > 80) {
    color = "text-red-500";
    strokeColor = "stroke-red-500";
    bgGradient = "from-red-500/20";
  } else if (score > 60) {
    color = "text-amber-400";
    strokeColor = "stroke-amber-400";
    bgGradient = "from-amber-500/20";
  }

  return (
    <div className={`flex flex-col gap-4 px-6 py-4 bg-slate-900/90 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl bg-gradient-to-br ${bgGradient} to-transparent w-72`}>
      
      {/* Header & Main Gauge */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-1">
            <BrainCircuit size={16} className="text-purple-400 animate-pulse" />
            AI Risk Engine
          </h3>
          <p className={`text-sm font-black ${color} uppercase tracking-widest mt-1`}>{status}</p>
        </div>
        
        <div className="relative flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="6" fill="none" />
            <circle 
              cx="32" cy="32" r="28" 
              className={`${strokeColor} transition-all duration-[1500ms] ease-out`} 
              strokeWidth="6" fill="none" 
              strokeDasharray={2 * Math.PI * 28} 
              strokeDashoffset={(2 * Math.PI * 28) - (score / 100) * (2 * Math.PI * 28)} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-black ${color}`}>{score}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Bars */}
      {breakdown && (
        <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-slate-700/50">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Factors</p>
          {Object.entries(breakdown).map(([factor, value]) => {
            let barColor = "bg-emerald-500";
            if (value > 80) barColor = "bg-red-500";
            else if (value > 60) barColor = "bg-amber-400";
            
            return (
              <div key={factor} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">{factor}</span>
                  <span className="text-slate-300 font-bold">{value}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${barColor} rounded-full transition-all duration-[1500ms] ease-out`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { activeLayers, vehicles, riskPrediction, fetchVehicles, fetchRiskPrediction } = useStore();

  useEffect(() => {
    fetchVehicles();
    fetchRiskPrediction();
  }, [fetchVehicles, fetchRiskPrediction]);

  // Fallback for rendering if data is not loaded yet
  const displayVehicles = vehicles && vehicles.length > 0 ? vehicles : [];
  
  const getRiskClass = (risk) => {
    if (risk === 'Critical') return 'bg-red-400/20 text-red-400 border-red-400/30';
    if (risk === 'High') return 'bg-amber-400/20 text-amber-400 border-amber-400/30';
    if (risk === 'Medium') return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
    return 'bg-slate-600/40 text-slate-300 border-slate-500/30';
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* Stats Grid */}
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

      {/* Map & Overlays */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <MapComponent activeLayers={activeLayers} />
        </div>
        
        {/* Floating AI Risk Score */}
        {riskPrediction && (
          <div className="absolute top-4 right-4 z-10">
            <RiskGauge prediction={riskPrediction} />
          </div>
        )}
      </div>

      {/* Vehicle Table */}
      <div className="h-56 shrink-0 bg-slate-800 border-t border-slate-700 px-5 py-4 overflow-y-auto z-10">
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
            {displayVehicles.length > 0 ? (
              displayVehicles.map((v, i) => (
                <tr key={v.id || i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer">
                  <td className="py-3 font-semibold text-blue-400">{v.id}</td>
                  <td className="py-3 text-slate-300">{v.cargo}</td>
                  <td className="py-3 text-slate-300">{v.location}</td>
                  <td className="py-3 text-slate-300">{v.status}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskClass(v.risk)}`}>
                      {v.risk || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-slate-500">No vehicles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
