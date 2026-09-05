import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Truck, MapPin, Navigation, ShieldCheck, User, Clock, CheckCircle2, RotateCw } from 'lucide-react';

export default function Vehicles() {
  const { vehicles, fetchVehicles, updateVehicleStatus } = useStore();
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const displayVehicles = vehicles.filter(v => filter === 'All' || v.status === filter);

  const getRiskClass = (risk) => {
    if (risk === 'Critical') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (risk === 'High') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (risk === 'Medium') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  const getStatusColor = (status) => {
    if (status === 'In Transit') return 'text-blue-400';
    if (status === 'Delivering') return 'text-amber-400';
    if (status === 'Idle') return 'text-slate-400';
    if (status === 'Maintenance') return 'text-red-400';
    return 'text-slate-200';
  };

  const handleRouteClick = () => {
    navigate('/route-planner');
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-slate-900 text-slate-200 overflow-y-auto">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold uppercase tracking-wide text-white flex items-center gap-3">
            <Truck className="text-blue-500" size={32} />
            Fleet Operations
          </h2>
          <p className="text-slate-400 mt-2">Live tracking and dispatch control for the NER supply fleet.</p>
        </div>

        <div className="flex gap-2">
          {['All', 'In Transit', 'Delivering', 'Idle', 'Maintenance'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
                filter === f ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayVehicles.length > 0 ? (
          displayVehicles.map((v) => (
            <div key={v.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-4">
                <div>
                  <h3 className="font-black text-xl text-white">{v.id}</h3>
                  <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">{v.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${getRiskClass(v.risk)}`}>
                  {v.risk} Risk
                </span>
              </div>

              {/* Card Body */}
              <div className="flex flex-col gap-3 flex-1 mb-6">
                
                <div className="flex items-center gap-3 text-sm bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
                  <User size={16} className="text-slate-500 shrink-0" />
                  <span className="text-slate-300 font-semibold">{v.driver}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={12}/> Cargo
                    </span>
                    <span className="text-sm font-semibold text-white">{v.cargo}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12}/> ETA
                    </span>
                    <span className="text-sm font-semibold text-white">{v.eta}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm mt-2">
                  <MapPin size={16} className="text-slate-500 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-snug text-slate-300">{v.location}</span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="border-t border-slate-700 pt-4 flex flex-col gap-4 mt-auto">
                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Status:</span>
                  <span className={`${getStatusColor(v.status)} flex items-center gap-2`}>
                    {v.status === 'In Transit' && <RotateCw size={14} className="animate-spin" />}
                    {v.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleRouteClick}
                    className="flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-extrabold uppercase tracking-widest text-white transition-colors"
                  >
                    <Navigation size={14} /> Route
                  </button>
                  
                  {v.status === 'Idle' ? (
                    <button 
                      onClick={() => updateVehicleStatus(v.id, 'In Transit')}
                      className="flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-colors"
                    >
                      Dispatch
                    </button>
                  ) : v.status === 'In Transit' || v.status === 'Delivering' ? (
                    <button 
                      onClick={() => updateVehicleStatus(v.id, 'Idle')}
                      className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-colors"
                    >
                      <CheckCircle2 size={14} /> End Run
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-slate-600 rounded-lg text-xs font-extrabold uppercase tracking-widest cursor-not-allowed border border-slate-700/50"
                    >
                      In Shop
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-3xl">
            <Truck size={48} className="text-slate-600 mb-4" />
            <h3 className="text-2xl font-bold text-slate-400 mb-2">No Vehicles</h3>
            <p className="text-slate-500">No vehicles match the current filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
