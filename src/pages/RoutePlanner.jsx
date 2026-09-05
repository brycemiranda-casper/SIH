import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ArrowRight, ShieldCheck, AlertTriangle, Truck, Car, Bike, Package, Plus, Trash2 } from 'lucide-react';
import MapComponent from '../components/map/MapComponent';
import useStore from '../store/useStore';

export default function RoutePlanner() {
  const { activeLayers, fetchRoute, routes, selectedRouteIndex, setSelectedRouteIndex, routeLoading, clearRoute } = useStore();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [stops, setStops] = useState([]);

  // Clear route when component unmounts
  useEffect(() => {
    return () => clearRoute();
  }, [clearRoute]);

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    if (!origin || !destination) return;
    await fetchRoute(origin, destination, vehicleType, stops);
  };

  const addStop = () => {
    setStops([...stops, { location: '', duration: 15 }]); // default 15 mins
  };

  const removeStop = (index) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const updateStop = (index, field, value) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    setStops(newStops);
  };

  const VehicleBtn = ({ type, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => setVehicleType(type)}
      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
        vehicleType === type 
          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
      }`}
    >
      <Icon size={20} className="mb-1" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="flex h-full w-full">
      {/* Sidebar Form */}
      <div className="w-[400px] bg-slate-800 border-r border-slate-700 flex flex-col shrink-0 z-10 shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Navigation size={28} className="text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-wide text-slate-200">Route Planner</h2>
          </div>
          
          <form onSubmit={handlePlanRoute} className="flex flex-col gap-4">
            {/* Vehicle Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Select Vehicle</label>
              <div className="grid grid-cols-4 gap-2">
                <VehicleBtn type="car" icon={Car} label="Car" />
                <VehicleBtn type="bike" icon={Bike} label="Bike" />
                <VehicleBtn type="small_goods" icon={Package} label="Mini" />
                <VehicleBtn type="truck" icon={Truck} label="Truck" />
              </div>
            </div>

            <div className="h-px w-full bg-slate-700 my-2"></div>

            {/* Locations */}
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Origin (e.g. Guwahati)" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Intermediate Stops */}
            {stops.map((stop, index) => (
              <div key={index} className="flex gap-2 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-2.5 text-amber-400" />
                    <input 
                      type="text" 
                      placeholder="Stop (e.g. Apollo Hospital)" 
                      value={stop.location}
                      onChange={(e) => updateStop(index, 'location', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded pl-9 pr-2 py-2 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Duration (mins):</span>
                    <input 
                      type="number" 
                      min="0"
                      value={stop.duration}
                      onChange={(e) => updateStop(index, 'duration', parseInt(e.target.value) || 0)}
                      className="w-16 bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <button type="button" onClick={() => removeStop(index)} className="p-2 text-slate-500 hover:text-red-400 transition-colors mt-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button type="button" onClick={addStop} className="flex items-center justify-center gap-2 py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 text-xs font-semibold hover:border-slate-400 hover:text-slate-300 transition-all">
              <Plus size={14} /> Add Stop (Hospital, Petrol Pump, etc.)
            </button>

            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-emerald-400" />
              <input 
                type="text" 
                placeholder="Destination (e.g. Tezpur)" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={routeLoading || !origin || !destination}
              className={`mt-4 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all shadow-lg flex items-center justify-center gap-2
                ${routeLoading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'}`}
            >
              {routeLoading ? 'Analyzing Routes...' : 'Find Safe Routes'}
              {!routeLoading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="flex-1 p-4 bg-slate-800/50 flex flex-col gap-4">
          {routeLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-4">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold animate-pulse">Running Geocoding & Routing...</p>
            </div>
          )}
          
          {routes.length > 0 && !routeLoading && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Generated Routes</p>
              
              {routes.map((route, idx) => {
                const isSelected = selectedRouteIndex === idx;
                return (
                  <div 
                    key={route.id}
                    onClick={() => setSelectedRouteIndex(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold text-sm ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {route.name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                        route.risk === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {route.risk} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-300 mb-3 font-semibold">
                      <span>⏱️ {route.eta}</span>
                      <span>📏 {route.distance}</span>
                    </div>
                    <p className="text-xs text-slate-400 flex gap-2">
                      {route.risk === 'Low' ? <ShieldCheck size={14} className="text-emerald-400 shrink-0"/> : <AlertTriangle size={14} className="text-amber-400 shrink-0"/>}
                      {route.issues}
                    </p>
                  </div>
                );
              })}
              
              <button className="mt-2 w-full py-3 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors">
                Dispatch Vehicle
              </button>
            </>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-slate-900">
         <div className="absolute inset-0">
          <MapComponent activeLayers={activeLayers} />
        </div>
        {routes.length === 0 && !routeLoading && (
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-2xl">
                <Navigation size={48} className="text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">Awaiting Instructions</h3>
                <p className="text-slate-400 text-sm max-w-sm">Enter an origin, destination, and any required stops to generate AI-optimized safe routes.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
