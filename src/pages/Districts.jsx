import React, { useEffect, useState } from 'react';
import { Building2, ShieldAlert, AlertTriangle, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';
import useStore from '../store/useStore';

export default function Districts() {
  const { districts, fetchDistricts, globalSearch } = useStore();
  const [selectedState, setSelectedState] = useState('ALL');

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  const states = ['ALL', 'Arunachal Pradesh', 'Assam', 'Meghalaya', 'Nagaland', 'Mizoram', 'Manipur', 'Sikkim', 'Tripura'];

  const filteredDistricts = districts.filter(d => {
    const matchesState = selectedState === 'ALL' || d.state === selectedState;
    const matchesSearch = !globalSearch || d.name.toLowerCase().includes(globalSearch.toLowerCase()) || d.state.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesState && matchesSearch;
  });

  const getScoreBadge = (score) => {
    if (score >= 80) return { label: 'HEALTHY', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (score >= 60) return { label: 'MODERATE', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { label: 'CRITICAL HAZARD', bg: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Building2 className="text-blue-400" />
            District Accessibility Intelligence (NER 8-State)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time accessibility scoring (0-100), active corridor bottlenecks, and risk levels across all North Eastern districts.
          </p>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {states.map(state => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedState === state
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* District Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDistricts.map(dist => {
          const badge = getScoreBadge(dist.score);
          return (
            <div
              key={dist.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {dist.state}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  {dist.name}
                </h3>

                {/* Score Gauge */}
                <div className="mt-3 bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-semibold">Accessibility Index</span>
                    <span className="font-extrabold text-slate-100">{dist.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        dist.score >= 80 ? 'bg-emerald-400' : dist.score >= 60 ? 'bg-amber-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${dist.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-400" />
                  <strong>{dist.active_incidents}</strong> Active Incidents
                </span>
                <span>
                  <strong>{dist.affected_roads}</strong> Impaired Corridors
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
