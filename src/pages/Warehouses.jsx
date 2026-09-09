import React, { useEffect } from 'react';
import { Shield, AlertTriangle, BatteryCharging, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

export default function Warehouses() {
  const { warehouses, fetchWarehouses } = useStore();

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const getStockColor = (val) => {
    if (val < 25) return 'text-red-400 bg-red-500';
    if (val < 60) return 'text-amber-400 bg-amber-500';
    return 'text-emerald-400 bg-emerald-500';
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-slate-900 text-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-wide text-white flex items-center gap-3">
          <Shield className="text-blue-500" size={32} />
          Regional Supply Hubs & Warehouse Inventory
        </h2>
        <p className="text-slate-400 mt-1">Real-time stock capacity monitoring and AI shortage forecasting for regional emergency stockpiles.</p>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {warehouses.map(wh => (
          <div key={wh.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col shadow-xl">
            <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-3">
              <div>
                <h3 className="text-xl font-black text-white">{wh.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{wh.location} • {wh.district}</p>
              </div>
              {(wh.medicine_stock < 25 || wh.food_stock < 25 || wh.fuel_stock < 25) && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <AlertTriangle size={12} /> LOW STOCK ALERT
                </span>
              )}
            </div>

            {/* Inventory Stock Gauges */}
            <div className="space-y-4 my-4 flex-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">💊 Medical Supplies & Vaccines Stock</span>
                  <span className={wh.medicine_stock < 25 ? 'text-red-400' : 'text-slate-200'}>{wh.medicine_stock}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${wh.medicine_stock < 25 ? 'bg-red-500' : wh.medicine_stock < 60 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${wh.medicine_stock}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">🥫 Food & Water Rations Stock</span>
                  <span className={wh.food_stock < 25 ? 'text-red-400' : 'text-slate-200'}>{wh.food_stock}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${wh.food_stock < 25 ? 'bg-red-500' : wh.food_stock < 60 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${wh.food_stock}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">⛽ Fuel & Generator Reserve</span>
                  <span className={wh.fuel_stock < 25 ? 'text-red-400' : 'text-slate-200'}>{wh.fuel_stock}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${wh.fuel_stock < 25 ? 'bg-red-500' : wh.fuel_stock < 60 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${wh.fuel_stock}%` }} />
                </div>
              </div>
            </div>

            {/* AI Forecasting Widget */}
            <div className="mt-4 p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <BatteryCharging size={14} /> AI Shortage Forecasting Engine
              </p>
              <p className="text-xs text-slate-300">
                {wh.medicine_stock < 25 
                  ? 'CRITICAL WARNING: Medical stockpile estimated to run out in 18 hours due to road blockage delays. Immediate re-supply dispatch recommended from Guwahati Hub.' 
                  : 'Stock levels stable. Consumption rates within normal emergency operation parameters.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
