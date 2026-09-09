import React, { useEffect, useState } from 'react';
import MapComponent from '../components/map/MapComponent';
import { Truck, AlertTriangle, ShieldCheck, Activity, BrainCircuit, Building2, Download, Siren, AlertCircle } from 'lucide-react';
import useStore from '../store/useStore';

const RiskGauge = ({ prediction }) => {
  const { risk_score: score, status, breakdown, explanation } = prediction;
  
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  
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
    <div className={`flex flex-col gap-3 px-5 py-4 bg-slate-900/95 border border-slate-700/60 rounded-2xl backdrop-blur-xl shadow-2xl bg-gradient-to-br ${bgGradient} to-transparent w-80`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <BrainCircuit size={16} className="text-purple-400 animate-pulse" />
            AI Explainable Risk Engine
          </h3>
          <p className={`text-sm font-black ${color} uppercase tracking-widest`}>{status}</p>
        </div>
        
        <div className="relative flex items-center justify-center">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle cx="28" cy="28" r="24" className="stroke-slate-800" strokeWidth="5" fill="none" />
            <circle 
              cx="28" cy="28" r="24" 
              className={`${strokeColor} transition-all duration-[1500ms] ease-out`} 
              strokeWidth="5" fill="none" 
              strokeDasharray={2 * Math.PI * 24} 
              strokeDashoffset={(2 * Math.PI * 24) - (score / 100) * (2 * Math.PI * 24)} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-base font-black ${color}`}>{score}</span>
          </div>
        </div>
      </div>

      {/* AI Explanation Factors */}
      {explanation && explanation.length > 0 && (
        <div className="pt-2 border-t border-slate-700/50 space-y-1">
          <p className="text-[9px] font-black uppercase text-purple-400 tracking-wider">AI Rationale ("Why?"):</p>
          {explanation.map((item, idx) => (
            <p key={idx} className="text-[10px] text-slate-300 flex items-start gap-1">
              <span className="text-purple-400 font-bold">•</span> {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { 
    activeLayers, vehicles, riskPrediction, fetchVehicles, fetchRiskPrediction, 
    emergencyMode, districts, fetchDistricts, incidents, fetchIncidents 
  } = useStore();

  const [downloadNotice, setDownloadNotice] = useState(false);

  useEffect(() => {
    fetchVehicles();
    fetchRiskPrediction();
    fetchDistricts();
    fetchIncidents();
  }, [fetchVehicles, fetchRiskPrediction, fetchDistricts, fetchIncidents]);

  const exportSituationReport = () => {
    const reportText = `NEXUS-NER DAILY SITUATION REPORT\nGenerated: ${new Date().toLocaleString()}\nNER Accessibility Score: 78/100\nActive Vehicles: ${vehicles.length}\nActive Incidents: ${incidents.length}\nDisaster Mode: ${emergencyMode ? 'ACTIVE' : 'NORMAL'}\n`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEXUS_NER_Situation_Report_${Date.now()}.txt`;
    a.click();
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  const getRiskClass = (risk) => {
    if (risk === 'Critical') return 'bg-red-400/20 text-red-400 border-red-400/30';
    if (risk === 'High') return 'bg-amber-400/20 text-amber-400 border-amber-400/30';
    return 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30';
  };

  return (
    <div className={`flex flex-col h-full w-full relative ${emergencyMode ? 'ring-4 ring-red-600 ring-inset' : ''}`}>
      
      {/* Top Banner Stats Grid */}
      <div className={`flex items-center justify-between px-5 py-3 border-b shrink-0 transition-colors ${
        emergencyMode ? 'bg-red-950/80 border-red-800' : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
            <ShieldCheck size={24} className="text-emerald-400" />
            <div>
              <p className="text-xl font-black text-emerald-400">78 <span className="text-xs text-slate-400">/ 100</span></p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NER Accessibility Score</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
            <AlertTriangle size={24} className="text-red-400" />
            <div>
              <p className="text-xl font-black text-red-400">{incidents.length}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Disruption Incidents</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
            <Truck size={24} className="text-blue-400" />
            <div>
              <p className="text-xl font-black text-blue-400">{vehicles.filter(v => v.status === 'In Transit').length}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vehicles In Transit</p>
            </div>
          </div>
        </div>

        <button
          onClick={exportSituationReport}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider text-slate-200 transition-colors cursor-pointer"
        >
          <Download size={14} className="text-emerald-400" />
          <span>Export Situation Report</span>
        </button>
      </div>

      {downloadNotice && (
        <div className="absolute top-16 right-5 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl animate-fade-in">
          Situation Report Exported Successfully!
        </div>
      )}

      {/* Map & Overlays */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <MapComponent activeLayers={activeLayers} />
        </div>
        
        {/* Floating Explainable AI Risk Gauge */}
        {riskPrediction && (
          <div className="absolute top-4 right-4 z-10">
            <RiskGauge prediction={riskPrediction} />
          </div>
        )}
      </div>

      {/* Live Vehicle Telemetry Table */}
      <div className="h-48 shrink-0 bg-slate-800 border-t border-slate-700 px-5 py-3 overflow-y-auto z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
          <span>Live Fleet Telemetry & Order Status</span>
          <span className="text-amber-400 font-mono">GPS DATA: SIMULATED MODE</span>
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500 font-bold uppercase">
              <th className="text-left pb-1">Vehicle ID</th>
              <th className="text-left pb-1">Driver</th>
              <th className="text-left pb-1">Cargo</th>
              <th className="text-left pb-1">Location</th>
              <th className="text-left pb-1">Status</th>
              <th className="text-left pb-1">Risk</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-slate-700/40 hover:bg-slate-700/30 font-semibold">
                <td className="py-2 text-blue-400">{v.id}</td>
                <td className="py-2 text-slate-300">{v.driver}</td>
                <td className="py-2 text-white">{v.cargo}</td>
                <td className="py-2 text-slate-300">{v.location}</td>
                <td className="py-2 text-slate-300">{v.status}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${getRiskClass(v.risk)}`}>
                    {v.risk}
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
