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
    <header className={`px-6 py-3 border-b flex items-center justify-between transition-colors duration-300 z-20 ${emergencyMode
      ? 'bg-red-100 border-red-300 text-red-950 shadow-md'
      : 'bg-white/95 border-stone-200 text-stone-900 backdrop-blur-md shadow-xs'
      }`}>
      {/* Left: Emergency Status & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={toggleEmergencyMode}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm ${emergencyMode
            ? 'bg-red-600 text-white animate-pulse shadow-red-500/50'
            : 'bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 font-extrabold'
            }`}
        >
          <Siren size={16} className={emergencyMode ? 'animate-spin' : ''} />
          {emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'EMERGENCY TOGGLE'}
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1 hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search districts, vehicles, roads, deliveries (Ctrl+K)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Live Status, Language Switcher, Alerts & User Profile */}
      <div className="flex items-center gap-3">
        {/* Network & Live Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] font-semibold text-emerald-700">
          <Wifi size={12} className="animate-pulse" />
          <span>RIGHTROUTE LIVE</span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-stone-100 border border-stone-200 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setSelectedLanguage('EN')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${selectedLanguage === 'EN' ? 'bg-red-600 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
          >
            EN
          </button>
          <button
            onClick={() => setSelectedLanguage('HI')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${selectedLanguage === 'HI' ? 'bg-red-600 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Alert Center Trigger */}
        <button
          onClick={() => setAlertCenterOpen(true)}
          className="relative p-2 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-600 transition-colors cursor-pointer border border-stone-200"
          title="Open Central Alert Center"
        >
          <Bell size={16} />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {alerts.length}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
          <div className="w-7 h-7 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-700 font-black text-xs">
            {user?.name ? user.name.charAt(0) : 'M'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-stone-800 leading-none">{user?.name || 'Manish Sharma'}</p>
            <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{user?.role || 'Fleet Manager'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
