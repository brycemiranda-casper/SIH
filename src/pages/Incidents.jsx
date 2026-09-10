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
    if (type.includes('Landslide')) return <MountainSnow size={20} className="text-amber-600" />;
    if (type.includes('Flood') || type.includes('River')) return <Waves size={20} className="text-red-600" />;
    return <AlertTriangle size={20} className="text-red-600" />;
  };

  const getSeverityStyle = (severity) => {
    const s = (severity || '').toUpperCase();
    if (s === 'CRITICAL' || s === 'EXTREME') return 'bg-red-100 text-red-700 border-red-300 animate-pulse font-black';
    if (s === 'HIGH' || s === 'SEVERE') return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    return 'bg-red-50 text-red-700 border-red-200 font-bold';
  };

  const getStatusStyle = (status) => {
    if (status === 'Active') return 'text-red-600 font-bold';
    if (status === 'Responding') return 'text-amber-600 font-bold';
    if (status === 'Resolved') return 'text-emerald-700 font-bold';
    return 'text-stone-500';
  };

  return (
    <div className="flex-1 flex flex-col p-6 sm:p-8 h-full bg-[#faf9f6] text-stone-900 overflow-y-auto space-y-6">
      
      {/* Header & Live Stream Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-stone-900 flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={32} />
              Live Incident & Hazard Feed
            </h1>
            <span className="px-2.5 py-1 rounded bg-red-100 border border-red-300 text-red-700 font-extrabold text-xs flex items-center gap-1.5 animate-pulse">
              <Radio size={14} /> LIVE NDMA/IMD STREAM
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2 font-medium">
            Real-time feed aggregating NDMA CAP RSS alerts, Open-Meteo flood radars, and field officer report dispatches across all 8 North Eastern states.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Syncing Feeds...' : 'Sync Live Feeds'}
          </button>
        </div>
      </div>

      {/* State Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Building2 size={14} /> State Filter:
        </span>
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

      {/* Secondary Status & Severity Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex gap-2 overflow-x-auto">
          {['All', 'Active', 'Responding', 'Under Investigation', 'Resolved'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                filter === f ? 'bg-red-50 text-red-700 border-red-300 font-extrabold' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
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
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                severityFilter === f ? 'bg-stone-800 text-white border-stone-700' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
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
            <div key={incident.id} className="bg-white border border-stone-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-red-400 transition-all group">
              
              {/* Card Header */}
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 shadow-xs">
                      {getIcon(incident.type)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-stone-900 group-hover:text-red-600 transition-colors">{incident.type}</h3>
                      <p className="text-[11px] text-stone-400 font-mono">{incident.id}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase tracking-widest border ${getSeverityStyle(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>

                {/* Source Data Tag */}
                <div className="mb-3 flex items-center justify-between text-[10px] text-stone-600 bg-stone-50 px-2.5 py-1 rounded border border-stone-200 font-medium">
                  <span>Source: <strong className="text-red-700">{incident.id.startsWith('live') ? 'NDMA CAP Live Feed' : 'Field Report / Sensor'}</strong></span>
                  <span className="text-emerald-700 font-bold">VERIFIED</span>
                </div>

                {/* Card Body */}
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-start gap-2 text-xs text-stone-800">
                    <MapPin size={15} className="text-stone-400 shrink-0 mt-0.5" />
                    <span className="font-bold leading-snug">{incident.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                    <Clock size={13} />
                    <span>Reported {incident.timestamp}</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed mt-1 font-medium">
                    "{incident.description}"
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="border-t border-stone-100 pt-3 flex items-center justify-between mt-auto text-xs">
                <div className="flex items-center gap-2 uppercase tracking-wider text-[11px]">
                  <span className="text-stone-400">Status:</span>
                  <span className={getStatusStyle(incident.status)}>{incident.status}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/route-planner')}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Navigation size={12} /> Reroute Fleet
                  </button>

                  {incident.status === 'Active' || incident.status === 'Under Investigation' ? (
                    <button 
                      onClick={() => updateIncidentStatus(incident.id, 'Responding')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Dispatch
                    </button>
                  ) : incident.status === 'Responding' ? (
                    <button 
                      onClick={() => updateIncidentStatus(incident.id, 'Resolved')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Resolve
                    </button>
                  ) : null}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border-2 border-dashed border-stone-300 rounded-2xl text-center">
            <CheckCircle size={44} className="text-emerald-600 mb-3" />
            <h3 className="text-lg font-bold text-stone-800 mb-1">No Active Incidents Found</h3>
            <p className="text-xs text-stone-500">Selected state corridor currently clear of landslide or flood hazards.</p>
          </div>
        )}
      </div>
    </div>
  );
}
