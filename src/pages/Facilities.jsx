import React, { useEffect } from 'react';
import { Radio, MapPin, Activity, ShieldCheck, AlertOctagon } from 'lucide-react';
import useStore from '../store/useStore';

export default function Facilities() {
  const { facilities, fetchFacilities } = useStore();

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const getAccessibilityStyle = (acc) => {
    if (acc === 'Critical' || acc === 'Isolated') return 'bg-red-100 text-red-700 border-red-300 font-black';
    if (acc === 'Impaired') return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-[#faf9f6] text-stone-900 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-wide text-stone-900 flex items-center gap-3">
          <Radio className="text-red-600" size={32} />
          Critical Infrastructure & Facility Accessibility
        </h2>
        <p className="text-stone-500 mt-1 font-medium">Live transport accessibility status for regional hospitals, relief camps, PHCs, and emergency command centers.</p>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map(fac => (
          <div key={fac.id} className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-red-400 transition-all">
            <div>
              <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-stone-900">{fac.name}</h3>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">{fac.type} • {fac.district}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest border ${getAccessibilityStyle(fac.accessibility)}`}>
                  {fac.accessibility}
                </span>
              </div>

              <div className="space-y-2 text-xs text-stone-700 my-4 font-medium">
                <p className="flex items-center gap-1.5"><MapPin size={14} className="text-stone-400" /> Lat: {fac.lat}, Lon: {fac.lon}</p>
                <p><span className="text-stone-500 font-bold uppercase">State:</span> {fac.state}</p>
                <p><span className="text-stone-500 font-bold uppercase">Nearest Corridor:</span> <span className="text-stone-900 font-semibold">National Highway Access</span></p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 text-[10px] text-stone-500 font-mono flex justify-between">
              <span>STATUS:</span>
              <span className={fac.accessibility === 'Open' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {fac.accessibility === 'Open' ? 'ACCESSIBLE VIA MAIN ROUTE' : 'REQUIRES EMERGENCY REROUTE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
