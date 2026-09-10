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
    if (score >= 80) return { label: 'HEALTHY', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 60) return { label: 'MODERATE', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'CRITICAL HAZARD', bg: 'bg-red-50 text-red-700 border-red-200 font-bold' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2.5">
            <Building2 className="text-red-600" />
            District Accessibility Intelligence
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Real-time accessibility scoring (0-100), active corridor bottlenecks, and risk levels across all North Eastern districts.
          </p>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {states.map(state => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedState === state
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
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
              className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col justify-between hover:border-red-400 transition-all shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">
                    {dist.state}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-stone-900 group-hover:text-red-600 transition-colors">
                  {dist.name}
                </h3>

                {/* Score Gauge */}
                <div className="mt-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-600 font-semibold">Accessibility Index</span>
                    <span className="font-extrabold text-stone-900">{dist.score}/100</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        dist.score >= 80 ? 'bg-emerald-500' : dist.score >= 60 ? 'bg-amber-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${dist.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-600" />
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
