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
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white border-l border-stone-200 h-full flex flex-col shadow-2xl overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-600" />
            <h2 className="text-base font-extrabold text-stone-900">Central Alert Command Center</h2>
          </div>
          <button
            onClick={() => setAlertCenterOpen(false)}
            className="p-1 rounded bg-stone-200/80 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Reroute Action Card if present */}
        {activeRerouteAlert && (
          <div className="m-4 p-4 bg-red-50 border border-red-300 rounded-xl shadow-md animate-pulse">
            <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-wider mb-2">
              <AlertTriangle size={16} /> ROUTE DISRUPTION ALERT
            </div>
            <p className="text-xs text-stone-800 leading-relaxed font-semibold">
              Vehicle <span className="text-amber-700">{activeRerouteAlert.vehicle.id}</span> ({activeRerouteAlert.vehicle.cargo}) is affected by incident:
            </p>
            <p className="text-xs text-red-700 font-bold mt-1">
              {activeRerouteAlert.incident.type} @ {activeRerouteAlert.incident.location}
            </p>
            <div className="mt-3 p-2 bg-white rounded border border-stone-200 text-xs">
              <p className="text-stone-500">AI Recommended Bypass:</p>
              <p className="text-emerald-700 font-bold">{activeRerouteAlert.recommendedDetour}</p>
              <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                <span>Est. Added Time: {activeRerouteAlert.estimatedAddedTime}</span>
                <span>Risk reduction: {activeRerouteAlert.riskDiff}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleApproveReroute}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle size={14} /> Approve AI Reroute
              </button>
              <button
                onClick={() => setActiveRerouteAlert(null)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
            <Activity size={13} strokeWidth={3} /> Active Hazard Alerts ({alerts.length})
          </p>

          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-xl border transition-all ${
                alt.severity === 'CRITICAL'
                  ? 'bg-red-50 border-red-200'
                  : alt.severity === 'HIGH'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  alt.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {alt.severity}
                </span>
                <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                  <Clock size={11} /> {alt.timestamp}
                </span>
              </div>

              <h4 className="text-xs font-extrabold text-stone-900 mb-1">{alt.title}</h4>
              <p className="text-xs text-stone-700 leading-relaxed mb-2 font-medium">{alt.location}</p>

              <div className="p-2 bg-white rounded border border-stone-200 text-[11px] text-stone-800">
                <span className="text-stone-500 font-bold">Action: </span>
                {alt.recommendedAction || alt.recommended_action}
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2 pt-2 border-t border-stone-200 font-medium">
                <span>Source: <strong className="text-red-700">{alt.source || 'AI Engine'}</strong></span>
                <span>Confidence: <strong className="text-emerald-700">{alt.confidence}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
