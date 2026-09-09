import React, { useState, useEffect } from 'react';
import { Siren, ShieldAlert, Globe, User, Search, AlertCircle, RefreshCw, Bell, Download } from 'lucide-react';
import useStore from '../../store/useStore';

export default function Header() {
  const { 
    emergencyMode, toggleEmergencyMode, 
    language, setLanguage, 
    currentUser, setUserRole,
    rerouteNotification, approveReroute, dismissRerouteNotification,
    vehicles, incidents, districts, deliveries
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const rolesList = ['Admin', 'District Officer', 'Fleet Manager', 'Field Officer', 'Driver'];

  // Global search filtering
  const searchResults = searchQuery.trim() ? [
    ...vehicles.filter(v => v.id.toLowerCase().includes(searchQuery.toLowerCase()) || v.driver.toLowerCase().includes(searchQuery.toLowerCase())).map(v => ({ type: 'Vehicle', label: `${v.id} - ${v.driver} (${v.status})`, link: '/vehicles' })),
    ...incidents.filter(i => i.id.toLowerCase().includes(searchQuery.toLowerCase()) || i.location.toLowerCase().includes(searchQuery.toLowerCase())).map(i => ({ type: 'Incident', label: `${i.id} - ${i.type} (${i.severity})`, link: '/incidents' })),
    ...districts.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.state.toLowerCase().includes(searchQuery.toLowerCase())).map(d => ({ type: 'District', label: `${d.name}, ${d.state} (${d.risk_level})`, link: '/districts' })),
    ...deliveries.filter(del => del.id.toLowerCase().includes(searchQuery.toLowerCase()) || del.commodity.toLowerCase().includes(searchQuery.toLowerCase())).map(del => ({ type: 'Delivery', label: `${del.id} - ${del.commodity} (${del.priority})`, link: '/deliveries' }))
  ] : [];

  return (
    <>
      <header className={`px-6 py-3 border-b flex items-center justify-between transition-colors z-20 ${
        emergencyMode ? 'bg-red-950 border-red-800 text-red-100' : 'bg-slate-800 border-slate-700 text-slate-200'
      }`}>
        
        {/* Left: System Status & Search */}
        <div className="flex items-center gap-4">
          {/* Emergency Mode Toggle */}
          <button
            onClick={toggleEmergencyMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg cursor-pointer ${
              emergencyMode 
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse border border-white/30' 
                : 'bg-slate-900/80 hover:bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            <Siren size={16} className={emergencyMode ? 'animate-bounce' : ''} />
            {emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'ACTIVATE EMERGENCY MODE'}
          </button>

          {/* Online/Offline PWA Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isOnline ? 'ONLINE (DATA LIVE)' : 'OFFLINE (2 REPORTS QUEUED)'}
          </div>
        </div>

        {/* Right: Controls & Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Search size={14} />
            <span>Search (Ctrl+K)</span>
          </button>

          {/* i18n Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors"
          >
            <Globe size={14} className="text-blue-400" />
            <span>{language === 'en' ? 'EN | English' : 'HI | हिन्दी'}</span>
          </button>

          {/* RBAC Fast Role Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg">
            <User size={14} className="text-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Role:</span>
            <select
              value={currentUser.role}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              {rolesList.map(role => (
                <option key={role} value={role} className="bg-slate-800 text-slate-200">{role}</option>
              ))}
            </select>
          </div>

        </div>
      </header>

      {/* Dynamic Reroute Alert Banner / Modal */}
      {rerouteNotification && (
        <div className="bg-amber-950/90 border-b border-amber-500/50 px-6 py-3 text-amber-100 flex items-center justify-between animate-fade-in z-30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 border border-amber-500/30">
              <ShieldAlert size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                🚨 Dynamic Reroute Recommended — Hazard Incident Detected
              </p>
              <p className="text-xs text-slate-200 mt-0.5">
                Vehicle <span className="font-bold text-white">{rerouteNotification.vehicleId}</span> ({rerouteNotification.cargo}) affected by road closure at <span className="font-bold text-amber-300">{rerouteNotification.incidentLocation}</span>. Recommended alternate: <span className="font-bold text-emerald-400">{rerouteNotification.alternateRoute}</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => approveReroute(rerouteNotification.vehicleId)}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              Approve Reroute
            </button>
            <button
              onClick={dismissRerouteNotification}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 z-50">
          <div className="bg-slate-800 border border-slate-700 w-[550px] rounded-2xl shadow-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-3 rounded-xl border border-slate-700">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search districts, vehicles, incidents, deliveries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent w-full text-sm text-slate-200 focus:outline-none"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-xs font-bold text-slate-400 hover:text-white">ESC</button>
            </div>

            <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
              {searchResults.length > 0 ? (
                searchResults.map((res, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setIsSearchOpen(false); }}
                    className="p-3 bg-slate-900/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/40 flex justify-between items-center cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-slate-200">{res.label}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">{res.type}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center text-slate-500 py-6">
                  {searchQuery ? 'No matching entities found.' : 'Type to search across the NER command database...'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
