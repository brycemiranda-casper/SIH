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
    if (risk === 'Critical') return 'bg-red-100 text-red-700 border-red-300 font-black';
    if (risk === 'High') return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    if (risk === 'Medium') return 'bg-red-50 text-red-700 border-red-200 font-bold';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
  };

  const getStatusColor = (status) => {
    if (status === 'In Transit') return 'text-red-600 font-black';
    if (status === 'Delivering') return 'text-amber-600 font-bold';
    if (status === 'Idle') return 'text-stone-500 font-medium';
    if (status === 'Maintenance') return 'text-red-700 font-bold';
    return 'text-stone-800';
  };

  const handleRouteClick = () => {
    navigate('/route-planner');
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-[#faf9f6] text-stone-900 overflow-y-auto">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wide text-stone-900 flex items-center gap-3">
            <Truck className="text-red-600" size={32} />
            Fleet Operations
          </h2>
          <p className="text-stone-500 mt-2 font-medium">Live tracking and dispatch control for the regional supply fleet.</p>
        </div>

        <div className="flex gap-2">
          {['All', 'In Transit', 'Delivering', 'Idle', 'Maintenance'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                filter === f ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
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
            <div key={v.id} className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-black text-xl text-stone-900">{v.id}</h3>
                  <p className="text-xs text-stone-500 font-bold tracking-widest uppercase mt-1">{v.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border ${getRiskClass(v.risk)}`}>
                  {v.risk} Risk
                </span>
              </div>

              {/* Card Body */}
              <div className="flex flex-col gap-3 flex-1 mb-6">
                
                <div className="flex items-center gap-3 text-sm bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <User size={16} className="text-stone-500 shrink-0" />
                  <span className="text-stone-800 font-bold">{v.driver}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={12}/> Cargo
                    </span>
                    <span className="text-sm font-bold text-stone-900">{v.cargo}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12}/> ETA
                    </span>
                    <span className="text-sm font-bold text-stone-900">{v.eta}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm mt-2">
                  <MapPin size={16} className="text-stone-400 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-snug text-stone-700">{v.location}</span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="border-t border-stone-100 pt-4 flex flex-col gap-4 mt-auto">
                <div className="flex items-center justify-between text-sm font-bold uppercase tracking-wider">
                  <span className="text-stone-500">Status:</span>
                  <span className={`${getStatusColor(v.status)} flex items-center gap-2`}>
                    {v.status === 'In Transit' && <RotateCw size={14} className="animate-spin text-red-600" />}
                    {v.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleRouteClick}
                    className="flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-900 rounded-lg text-xs font-black uppercase tracking-widest text-white transition-colors cursor-pointer"
                  >
                    <Navigation size={14} /> Route
                  </button>
                  
                  {v.status === 'Idle' ? (
                    <button 
                      onClick={() => updateVehicleStatus(v.id, 'In Transit')}
                      className="flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Dispatch
                    </button>
                  ) : v.status === 'In Transit' || v.status === 'Delivering' ? (
                    <button 
                      onClick={() => updateVehicleStatus(v.id, 'Idle')}
                      className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={14} /> End Run
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="flex items-center justify-center gap-2 py-2.5 bg-stone-100 text-stone-400 rounded-lg text-xs font-bold uppercase tracking-widest cursor-not-allowed border border-stone-200"
                    >
                      In Shop
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border-2 border-dashed border-stone-300 rounded-3xl">
            <Truck size={48} className="text-stone-400 mb-4" />
            <h3 className="text-2xl font-bold text-stone-800 mb-2">No Vehicles</h3>
            <p className="text-stone-500">No vehicles match the current filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
