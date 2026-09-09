import React from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle, Navigation, Clock, Activity } from 'lucide-react';
import useStore from '../../store/useStore';

export default function AlertCenterDrawer() {
  const { alertCenterOpen, setAlertCenterOpen, alerts, activeRerouteAlert, setActiveRerouteAlert, updateVehicleStatus } = useStore();

  if (!alertCenterOpen) return null;

  const handleApproveReroute = () => {
    if (activeRerouteAlert) {
      updateVehicleStatus(activeRerouteAlert.vehicle.id, 'In Transit', {
        location: activeRerouteAlert.recommendedDetour,
        risk: 'Low',
        eta: '+35m adjusted'
      });
      setActiveRerouteAlert(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-400" />
            <h2 className="text-base font-bold text-slate-100">Central Alert Command Center</h2>
          </div>
          <button
            onClick={() => setAlertCenterOpen(false)}
            className="p-1 rounded bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Reroute Action Card if present */}
        {activeRerouteAlert && (
          <div className="m-4 p-4 bg-red-950/80 border border-red-500/60 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-2">
              <AlertTriangle size={16} /> ROUTE DISRUPTION ALERT
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
              Vehicle <span className="text-amber-300">{activeRerouteAlert.vehicle.id}</span> ({activeRerouteAlert.vehicle.cargo}) is affected by incident:
            </p>
            <p className="text-xs text-red-300 font-bold mt-1">
              {activeRerouteAlert.incident.type} @ {activeRerouteAlert.incident.location}
            </p>
            <div className="mt-3 p-2 bg-slate-900/80 rounded border border-slate-700 text-xs">
              <p className="text-slate-400">AI Recommended Bypass:</p>
              <p className="text-emerald-400 font-bold">{activeRerouteAlert.recommendedDetour}</p>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Est. Added Time: {activeRerouteAlert.estimatedAddedTime}</span>
                <span>Risk reduction: {activeRerouteAlert.riskDiff}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleApproveReroute}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={14} /> Approve AI Reroute
              </button>
              <button
                onClick={() => setActiveRerouteAlert(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Activity size={13} strokeWidth={3} /> Active Hazard Alerts ({alerts.length})
          </p>

          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-xl border transition-all ${
                alt.severity === 'CRITICAL'
                  ? 'bg-red-500/10 border-red-500/30'
                  : alt.severity === 'HIGH'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  alt.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950'
                }`}>
                  {alt.severity}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> {alt.timestamp}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-100 mb-1">{alt.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{alt.location}</p>

              <div className="p-2 bg-slate-950/60 rounded border border-slate-800 text-[11px] text-slate-300">
                <span className="text-slate-400 font-semibold">Action: </span>
                {alt.recommendedAction || alt.recommended_action}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                <span>Source: <strong className="text-blue-400">{alt.source || 'AI Engine'}</strong></span>
                <span>Confidence: <strong className="text-emerald-400">{alt.confidence}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
