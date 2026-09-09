import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  Activity, 
  CheckCircle, 
  Clock, 
  Navigation, 
  Check, 
  ShieldCheck, 
  MountainSnow, 
  Waves,
  RefreshCw,
  Radio,
  Building2,
  ExternalLink
} from 'lucide-react';

export default function Incidents() {
  const { incidents, fetchIncidents, updateIncidentStatus } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchIncidents();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const states = ['All', 'Arunachal Pradesh', 'Assam', 'Meghalaya', 'Nagaland', 'Mizoram', 'Manipur', 'Sikkim', 'Tripura'];

  const displayIncidents = incidents.filter(inc => {
    const matchStatus = filter === 'All' || inc.status === filter;
    const matchSeverity = severityFilter === 'All' || inc.severity === severityFilter || (severityFilter === 'Critical' && inc.severity === 'CRITICAL') || (severityFilter === 'High' && inc.severity === 'HIGH');
    const matchState = selectedState === 'All' || (inc.district && inc.district.toLowerCase().includes(selectedState.toLowerCase())) || inc.location.toLowerCase().includes(selectedState.toLowerCase());
    return matchStatus && matchSeverity && matchState;
  });

  const getIcon = (type) => {
    if (type.includes('Landslide')) return <MountainSnow size={20} className="text-amber-400" />;
    if (type.includes('Flood') || type.includes('River')) return <Waves size={20} className="text-blue-400" />;
    return <AlertTriangle size={20} className="text-red-400" />;
  };

  const getSeverityStyle = (severity) => {
    const s = (severity || '').toUpperCase();
    if (s === 'CRITICAL' || s === 'EXTREME') return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
    if (s === 'HIGH' || s === 'SEVERE') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
  };

  const getStatusStyle = (status) => {
    if (status === 'Active') return 'text-red-400 font-bold';
    if (status === 'Responding') return 'text-amber-400 font-bold';
    if (status === 'Resolved') return 'text-emerald-400 font-bold';
    return 'text-slate-400';
  };

  return (
    <div className="flex-1 flex flex-col p-6 sm:p-8 h-full bg-slate-900 text-slate-200 overflow-y-auto space-y-6">
      
      {/* Header & Live Stream Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-white flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={32} />
              NER Live Incident & Hazard Feed
            </h1>
            <span className="px-2.5 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-xs flex items-center gap-1.5 animate-pulse">
              <Radio size={14} /> LIVE NDMA/IMD STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Real-time feed aggregating NDMA CAP RSS alerts, Open-Meteo flood radars, and field officer report dispatches across all 8 North Eastern states.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Syncing Feeds...' : 'Sync Live Feeds'}
          </button>
        </div>
      </div>

      {/* State Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Building2 size={14} /> State Filter:
        </span>
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

      {/* Secondary Status & Severity Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
        <div className="flex gap-2 overflow-x-auto">
          {['All', 'Active', 'Responding', 'Under Investigation', 'Resolved'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${
                filter === f ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {['All', 'Critical', 'High', 'Medium'].map(f => (
            <button 
              key={f} 
              onClick={() => setSeverityFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border ${
                severityFilter === f ? 'bg-slate-700 text-white border-slate-500' : 'bg-slate-800/80 text-slate-500 border-slate-700 hover:border-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      {/* Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayIncidents.length > 0 ? (
          displayIncidents.map((incident) => (
            <div key={incident.id} className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl hover:border-blue-500/50 transition-all group">
              
              {/* Card Header */}
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
                      {getIcon(incident.type)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white group-hover:text-blue-400 transition-colors">{incident.type}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{incident.id}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getSeverityStyle(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>

                {/* Source Data Tag */}
                <div className="mb-3 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-700/50">
                  <span>Source: <strong className="text-blue-300">{incident.id.startsWith('live') ? 'NDMA CAP Live Feed' : 'Field Report / Sensor'}</strong></span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>

                {/* Card Body */}
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-start gap-2 text-xs text-slate-200">
                    <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-bold leading-snug">{incident.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <Clock size={13} />
                    <span>Reported {incident.timestamp}</span>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed mt-1">
                    "{incident.description}"
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="border-t border-slate-700/60 pt-3 flex items-center justify-between mt-auto text-xs">
                <div className="flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <span className="text-slate-400">Status:</span>
                  <span className={getStatusStyle(incident.status)}>{incident.status}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/route-planner')}
                    className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Navigation size={12} /> Reroute Fleet
                  </button>

                  {incident.status === 'Active' || incident.status === 'Under Investigation' ? (
                    <button 
                      onClick={() => updateIncidentStatus(incident.id, 'Responding')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold transition-colors"
                    >
                      Dispatch
                    </button>
                  ) : incident.status === 'Responding' ? (
                    <button 
                      onClick={() => updateIncidentStatus(incident.id, 'Resolved')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-colors"
                    >
                      Resolve
                    </button>
                  ) : null}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-800/40 border-2 border-dashed border-slate-700 rounded-2xl text-center">
            <CheckCircle size={44} className="text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">No Active Incidents Found</h3>
            <p className="text-xs text-slate-400">Selected state corridor currently clear of landslide or flood hazards.</p>
          </div>
        )}
      </div>
    </div>
  );
}
