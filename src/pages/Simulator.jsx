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
    <div className="flex-1 flex flex-col p-8 h-full bg-[#faf9f6] text-stone-900 overflow-y-auto max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black uppercase tracking-wide text-stone-900 flex items-center gap-3">
          <Cpu className="text-red-600" size={32} />
          What-If Disaster Impact Simulator
        </h2>
        <p className="text-stone-500 mt-1 font-medium">Simulate road blockages, bridge failures, or rainfall spikes to model supply disruptions before taking action.</p>
      </div>

      {/* Simulator Control Card */}
      <form onSubmit={handleRunSimulation} className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4 mb-8 text-stone-900">
        <div>
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Target Transport Corridor to Block</label>
          <select
            value={roadName}
            onChange={e => setRoadName(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-sm text-stone-800 rounded-xl p-3 focus:outline-none focus:border-red-500 font-medium"
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
          className="py-3.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
          {loading ? 'Calculating Disaster Impact...' : 'Run What-If Disaster Simulation'}
        </button>
      </form>

      {/* Results Panel */}
      {simResult && (
        <div className="bg-white border border-red-300 p-6 rounded-2xl shadow-md space-y-4 animate-fade-in text-stone-900">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <span className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
              <AlertTriangle size={16} /> SIMULATION RESULTS (MODEL PROTOTYPE)
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 text-[10px] font-black uppercase rounded-full">
              {simResult.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 my-4">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <p className="text-[10px] font-bold text-stone-500 uppercase">Affected Vehicles</p>
              <p className="text-2xl font-black text-stone-900">{simResult.affected_vehicles_count}</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <p className="text-[10px] font-bold text-stone-500 uppercase">Affected Deliveries</p>
              <p className="text-2xl font-black text-amber-600">{simResult.affected_deliveries_count}</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <p className="text-[10px] font-bold text-stone-500 uppercase">Predicted Travel Delay</p>
              <p className="text-2xl font-black text-red-600">+{simResult.estimated_delay_minutes} mins</p>
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <p className="text-xs font-bold text-stone-700 uppercase mb-1">Recommended Action Plan</p>
            <p className="text-xs text-emerald-700 font-bold">{simResult.recommended_action}</p>
          </div>
        </div>
      )}
    </div>
  );
}
