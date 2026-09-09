import React, { useEffect } from 'react';
import { Radio, MapPin, Activity, ShieldCheck, AlertOctagon } from 'lucide-react';
import useStore from '../store/useStore';

export default function Facilities() {
  const { facilities, fetchFacilities } = useStore();

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const getAccessibilityStyle = (acc) => {
    if (acc === 'Critical' || acc === 'Isolated') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (acc === 'Impaired') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-slate-900 text-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-wide text-white flex items-center gap-3">
          <Radio className="text-blue-500" size={32} />
          Critical Infrastructure & Facility Accessibility
        </h2>
        <p className="text-slate-400 mt-1">Live transport accessibility status for regional hospitals, relief camps, PHCs, and emergency command centers.</p>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map(fac => (
          <div key={fac.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-start mb-3 border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-lg font-black text-white">{fac.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{fac.type} • {fac.district}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getAccessibilityStyle(fac.accessibility)}`}>
                  {fac.accessibility}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 my-4">
                <p className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-500" /> Lat: {fac.lat}, Lon: {fac.lon}</p>
                <p><span className="text-slate-500 font-bold uppercase">State:</span> {fac.state}</p>
                <p><span className="text-slate-500 font-bold uppercase">Nearest Corridor:</span> <span className="text-white font-semibold">National Highway Access</span></p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/50 text-[10px] text-slate-500 font-mono flex justify-between">
              <span>STATUS:</span>
              <span className={fac.accessibility === 'Open' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {fac.accessibility === 'Open' ? 'ACCESSIBLE VIA MAIN ROUTE' : 'REQUIRES EMERGENCY REROUTE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
