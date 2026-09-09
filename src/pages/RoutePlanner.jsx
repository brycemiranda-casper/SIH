import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowRight, ShieldCheck, AlertTriangle, Truck, Car, Bike, Package, Plus, Trash2, CheckCircle2, BrainCircuit, Sparkles } from 'lucide-react';
import MapComponent from '../components/map/MapComponent';
import useStore from '../store/useStore';

const POPULAR_NER_LOCATIONS = [
  'Guwahati, Assam',
  'Tezpur, Assam',
  'Shillong, Meghalaya',
  'Itanagar, Arunachal Pradesh',
  'Tawang, Arunachal Pradesh',
  'Kohima, Nagaland',
  'Dimapur, Nagaland',
  'Silchar, Assam',
  'Imphal, Manipur',
  'Aizawl, Mizoram',
  'Agartala, Tripura',
  'Gangtok, Sikkim',
  'Dhemaji, Assam'
];

export default function RoutePlanner() {
  const navigate = useNavigate();
  const { activeLayers, fetchRoute, routes, selectedRouteIndex, setSelectedRouteIndex, routeLoading, clearRoute, vehicles, fetchVehicles, updateVehicleStatus } = useStore();
  const [origin, setOrigin] = useState('Guwahati');
  const [destination, setDestination] = useState('Tezpur');
  const [vehicleType, setVehicleType] = useState('car');
  const [stops, setStops] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    return () => clearRoute();
  }, [clearRoute]);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      const idleVehicle = vehicles.find(v => v.status === 'Idle');
      if (idleVehicle) {
        setSelectedVehicleId(idleVehicle.id);
      } else if (vehicles[0]) {
        setSelectedVehicleId(vehicles[0].id);
      }
    }
  }, [vehicles, selectedVehicleId]);

  const handlePlanRoute = async (e) => {
    if (e) e.preventDefault();
    if (!origin || !destination) return;
    setDispatchSuccess(null);
    await fetchRoute(origin, destination, vehicleType, stops);
  };

  const handleDispatch = async () => {
    if (!selectedVehicleId) {
      alert('Please select a fleet vehicle to dispatch.');
      return;
    }
    const selectedRoute = routes[selectedRouteIndex];
    if (!selectedRoute) return;

    const targetVehicle = vehicles.find(v => v.id === selectedVehicleId);
    const newLocation = `${origin} → ${destination}`;

    await updateVehicleStatus(selectedVehicleId, 'In Transit', {
      eta: selectedRoute.eta,
      location: newLocation
    });

    setDispatchSuccess({
      vehicleId: selectedVehicleId,
      driver: targetVehicle?.driver || 'Driver',
      location: newLocation,
      eta: selectedRoute.eta
    });
  };

  const addStop = () => {
    setStops([...stops, { location: '', duration: 15 }]);
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

  const handleQuickSelectPreset = (locName) => {
    if (!origin) {
      setOrigin(locName.split(',')[0]);
    } else if (!destination) {
      setDestination(locName.split(',')[0]);
    } else {
      setDestination(locName.split(',')[0]);
    }
  };

  const VehicleBtn = ({ type, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => setVehicleType(type)}
      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
        vehicleType === type 
          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' 
          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
      }`}
    >
      <Icon size={20} className="mb-1" />
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="flex h-full w-full">
      {/* HTML Datalist for Auto-complete Location Suggestions */}
      <datalist id="ner-locations">
        {POPULAR_NER_LOCATIONS.map((loc, i) => (
          <option key={i} value={loc.split(',')[0]}>{loc}</option>
        ))}
      </datalist>

      {/* Sidebar Form */}
      <div className="w-[420px] bg-slate-800 border-r border-slate-700 flex flex-col shrink-0 z-10 shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-5">
            <Navigation size={28} className="text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide text-slate-200">AI Route Planner</h2>
              <p className="text-[11px] text-slate-400">Multi-criteria detour & hazard avoidance engine</p>
            </div>
          </div>
          
          <form onSubmit={handlePlanRoute} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Transport Mode</label>
              <div className="grid grid-cols-4 gap-2">
                <VehicleBtn type="car" icon={Car} label="Car" />
                <VehicleBtn type="bike" icon={Bike} label="Bike" />
                <VehicleBtn type="small_goods" icon={Package} label="Mini" />
                <VehicleBtn type="truck" icon={Truck} label="Truck" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Assign Fleet Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="" disabled>-- Select Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id} - {v.driver} ({v.type}) [{v.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Location Select Pills */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                <span className="flex items-center gap-1"><Sparkles size={12} className="text-amber-400" /> Quick Select NER Cities</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-900/60 rounded-lg border border-slate-700/60">
                {POPULAR_NER_LOCATIONS.map((loc, i) => {
                  const cityName = loc.split(',')[0];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickSelectPreset(loc)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-600/30 hover:border-emerald-500 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      + {cityName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px w-full bg-slate-700 my-1"></div>

            {/* Origin Input */}
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-blue-400" />
              <input 
                type="text" 
                list="ner-locations"
                placeholder="Origin Place Name (e.g. Guwahati)" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>

            {/* Stops */}
            {stops.map((stop, index) => (
              <div key={index} className="flex gap-2 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-2.5 text-amber-400" />
                    <input 
                      type="text" 
                      list="ner-locations"
                      placeholder="Stop Location (e.g. Tezpur Hospital)" 
                      value={stop.location}
                      onChange={(e) => updateStop(index, 'location', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded pl-9 pr-2 py-2 focus:outline-none focus:border-emerald-500 font-medium"
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
                <button type="button" onClick={() => removeStop(index)} className="p-2 text-slate-500 hover:text-red-400 transition-colors mt-1 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button type="button" onClick={addStop} className="flex items-center justify-center gap-2 py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 text-xs font-semibold hover:border-slate-400 hover:text-slate-300 transition-all cursor-pointer">
              <Plus size={14} /> Add Intermediate Stop
            </button>

            {/* Destination Input */}
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-emerald-400" />
              <input 
                type="text" 
                list="ner-locations"
                placeholder="Destination Place Name (e.g. Tezpur)" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={routeLoading || !origin || !destination}
              className={`mt-2 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer
                ${routeLoading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'}`}
            >
              {routeLoading ? 'Calculating Safe Polyline Routes...' : 'CALCULATE AI SAFE ROUTES'}
              {!routeLoading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="flex-1 p-4 bg-slate-800/50 flex flex-col gap-4">
          {dispatchSuccess && (
            <div className="bg-emerald-950/70 border border-emerald-500/50 p-4 rounded-xl text-emerald-200 flex flex-col gap-2 shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 size={20} />
                <span>Vehicle Dispatched!</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1 mt-1">
                <p><span className="font-bold text-slate-400">Vehicle:</span> {dispatchSuccess.vehicleId} ({dispatchSuccess.driver})</p>
                <p><span className="font-bold text-slate-400">Route:</span> {dispatchSuccess.location}</p>
                <p><span className="font-bold text-slate-400">ETA:</span> {dispatchSuccess.eta}</p>
              </div>
              <button 
                onClick={() => navigate('/vehicles')}
                className="mt-2 text-xs font-bold bg-emerald-500 text-slate-950 py-1.5 px-3 rounded hover:bg-emerald-400 transition-colors self-start cursor-pointer"
              >
                View Fleet Operations →
              </button>
            </div>
          )}

          {routeLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-4">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold animate-pulse">Computing OSRM detours & hazard avoidance...</p>
            </div>
          )}
          
          {routes.length > 0 && !routeLoading && (
            <>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
                <BrainCircuit size={14} className="text-purple-400" /> AI Evaluated Alternate Routes
              </p>
              
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
                      <h4 className={`font-bold text-xs ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {route.name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                        route.risk === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {route.risk} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-300 mb-2 font-bold">
                      <span>⏱️ {route.eta}</span>
                      <span>📏 {route.distance}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      <p className="font-semibold text-emerald-300">✓ {route.issues}</p>
                    </div>
                  </div>
                );
              })}
              
              <button 
                onClick={handleDispatch}
                disabled={!selectedVehicleId}
                className={`mt-2 w-full py-3 border rounded-lg font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer ${
                  !selectedVehicleId 
                    ? 'border-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                Dispatch Selected Vehicle
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
      </div>
    </div>
  );
}
