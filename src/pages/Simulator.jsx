import React, { useState } from 'react';
import { Cpu, Play, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Simulator() {
  const [roadName, setRoadName] = useState('NH-13 West Kameng');
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/simulation/road-block?road_name=${encodeURIComponent(roadName)}`, { method: 'POST' });
      const data = await res.json();
      setSimResult(data);
    } catch (e) {
      setSimResult({
        road: roadName,
        status: "SIMULATED BLOCKAGE",
        affected_vehicles_count: 2,
        affected_vehicles: ["TRK-9001", "TRK-9045"],
        affected_deliveries_count: 3,
        estimated_delay_minutes: 120,
        recommended_action: "Reroute via nearest regional bypass highway."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-slate-900 text-slate-200 overflow-y-auto max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black uppercase tracking-wide text-white flex items-center gap-3">
          <Cpu className="text-purple-400" size={32} />
          What-If Disaster Impact Simulator
        </h2>
        <p className="text-slate-400 mt-1">Simulate road blockages, bridge failures, or rainfall spikes to model supply disruptions before taking action.</p>
      </div>

      {/* Simulator Control Card */}
      <form onSubmit={handleRunSimulation} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 mb-8">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Target Transport Corridor to Block</label>
          <select
            value={roadName}
            onChange={e => setRoadName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
          >
            <option value="NH-13 West Kameng">NH-13, West Kameng, Arunachal Pradesh</option>
            <option value="NH-15 Dhemaji">NH-15, Dhemaji District, Assam</option>
            <option value="Shillong Bypass">Shillong Bypass, Meghalaya</option>
            <option value="Dimapur-Kohima Road">Dimapur-Kohima Road, Nagaland</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-wider text-sm rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
          {loading ? 'Calculating Disaster Impact...' : 'Run What-If Disaster Simulation'}
        </button>
      </form>

      {/* Results Panel */}
      {simResult && (
        <div className="bg-slate-800 border border-purple-500/40 p-6 rounded-2xl shadow-2xl space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
            <span className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
              <AlertTriangle size={16} /> SIMULATION RESULTS (MODEL PROTOTYPE)
            </span>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase rounded-full">
              {simResult.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 my-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Affected Vehicles</p>
              <p className="text-2xl font-black text-white">{simResult.affected_vehicles_count}</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Affected Deliveries</p>
              <p className="text-2xl font-black text-amber-400">{simResult.affected_deliveries_count}</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Predicted Travel Delay</p>
              <p className="text-2xl font-black text-red-400">+{simResult.estimated_delay_minutes} mins</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50">
            <p className="text-xs font-bold text-slate-300 uppercase mb-1">Recommended Action Plan</p>
            <p className="text-xs text-emerald-400 font-semibold">{simResult.recommended_action}</p>
          </div>
        </div>
      )}
    </div>
  );
}
