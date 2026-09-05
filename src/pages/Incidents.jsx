import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { AlertTriangle, MapPin, Activity, CheckCircle, Clock, Navigation, Check, ShieldCheck, MountainSnow, Waves } from 'lucide-react';

export default function Incidents() {
  const { incidents, fetchIncidents, updateIncidentStatus } = useStore();
  const [filter, setFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const displayIncidents = incidents.filter(inc => {
    const matchStatus = filter === 'All' || inc.status === filter;
    const matchSeverity = severityFilter === 'All' || inc.severity === severityFilter;
    return matchStatus && matchSeverity;
  });

  const getIcon = (type) => {
    if (type === 'Landslide') return <MountainSnow size={20} className="text-amber-400" />;
    if (type === 'Flood') return <Waves size={20} className="text-blue-400" />;
    return <AlertTriangle size={20} className="text-slate-400" />;
  };

  const getSeverityStyle = (severity) => {
    if (severity === 'Critical') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (severity === 'High') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const getStatusStyle = (status) => {
    if (status === 'Active') return 'text-red-400';
    if (status === 'Responding') return 'text-amber-400';
    if (status === 'Resolved') return 'text-emerald-400';
    return 'text-slate-400';
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-slate-900 text-slate-200 overflow-y-auto">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold uppercase tracking-wide text-white flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={32} />
            Command Center: Incident Feed
          </h2>
          <p className="text-slate-400 mt-2">Real-time disaster reports and road blockages across the North Eastern Region.</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {['All', 'Active', 'Responding', 'Under Investigation', 'Resolved'].map(f => (
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
          <div className="flex gap-2 justify-end">
            {['All', 'Critical', 'High', 'Medium'].map(f => (
              <button 
                key={f} 
                onClick={() => setSeverityFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
                  severityFilter === f ? 'bg-slate-600 text-white border-slate-400' : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayIncidents.length > 0 ? (
          displayIncidents.map((incident) => (
            <div key={incident.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
                    {getIcon(incident.type)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">{incident.type}</h3>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">{incident.id}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${getSeverityStyle(incident.severity)}`}>
                  {incident.severity}
                </span>
              </div>

              {/* Card Body */}
              <div className="flex flex-col gap-3 flex-1 mb-6">
                <div className="flex items-start gap-2 text-sm text-slate-300">
                  <MapPin size={16} className="text-slate-500 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-snug">{incident.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Clock size={14} />
                  <span>Reported {incident.timestamp}</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-sm text-slate-400 italic mt-2">
                  "{incident.description}"
                </div>
              </div>

              {/* Status & Actions */}
              <div className="border-t border-slate-700 pt-4 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Status:</span>
                  <span className={getStatusStyle(incident.status)}>{incident.status}</span>
                </div>
                
                <div className="flex gap-2">
                  {incident.status === 'Active' || incident.status === 'Under Investigation' ? (
                    <button 
                      onClick={() => updateIncidentStatus(incident.id, 'Responding')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <Navigation size={14} /> Dispatch
                    </button>
                  ) : incident.status === 'Responding' ? (
                    <button 
                      onClick={() => updateIncidentStatus(incident.id, 'Resolved')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <Check size={14} /> Resolve
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-4 py-2 text-emerald-500/50 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck size={14} /> Area Cleared
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-3xl">
            <CheckCircle size={48} className="text-emerald-500/50 mb-4" />
            <h3 className="text-2xl font-bold text-slate-300 mb-2">All Clear</h3>
            <p className="text-slate-500">No incidents match your current filters. The region is safe.</p>
          </div>
        )}
      </div>
    </div>
  );
}
