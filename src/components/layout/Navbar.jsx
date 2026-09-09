import React from 'react';
import { 
  Siren, 
  Search, 
  Bell, 
  Globe, 
  ShieldAlert, 
  UserCheck, 
  Wifi, 
  FileText 
} from 'lucide-react';
import useStore from '../../store/useStore';

export default function Navbar() {
  const { 
    emergencyMode, 
    toggleEmergencyMode, 
    selectedLanguage, 
    setSelectedLanguage, 
    globalSearch, 
    setGlobalSearch,
    setAlertCenterOpen,
    alerts,
    user
  } = useStore();

  return (
    <header className={`px-6 py-3 border-b flex items-center justify-between transition-colors duration-300 z-20 ${
      emergencyMode 
        ? 'bg-red-950/80 border-red-700/60 text-red-100 shadow-[0_4px_20px_rgba(239,68,68,0.2)]' 
        : 'bg-slate-800/90 border-slate-700 text-slate-100 backdrop-blur-md'
    }`}>
      {/* Left: Emergency Status & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={toggleEmergencyMode}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm ${
            emergencyMode
              ? 'bg-red-600 text-white animate-pulse shadow-red-500/50'
              : 'bg-slate-700/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-600'
          }`}
        >
          <Siren size={16} className={emergencyMode ? 'animate-spin' : ''} />
          {emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'EMERGENCY TOGGLE'}
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1 hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search districts, vehicles, roads, deliveries (Ctrl+K)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Live Status, Language Switcher, Alerts & User Profile */}
      <div className="flex items-center gap-3">
        {/* Network & Live Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-[11px] font-semibold text-emerald-400">
          <Wifi size={12} className="animate-pulse" />
          <span>NER MDoNER LIVE</span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setSelectedLanguage('EN')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              selectedLanguage === 'EN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setSelectedLanguage('HI')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              selectedLanguage === 'HI' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Alert Center Trigger */}
        <button
          onClick={() => setAlertCenterOpen(true)}
          className="relative p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          title="Open Central Alert Center"
        >
          <Bell size={16} />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {alerts.length}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 font-bold text-xs">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">{user?.name || 'Commander Sharma'}</p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{user?.role || 'Fleet Manager'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
