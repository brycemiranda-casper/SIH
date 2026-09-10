import React, { useEffect } from 'react';
import { Shield, AlertTriangle, BatteryCharging, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

export default function Warehouses() {
  const { warehouses, fetchWarehouses } = useStore();

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-[#faf9f6] text-stone-900 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-wide text-stone-900 flex items-center gap-3">
          <Shield className="text-red-600" size={32} />
          Regional Supply Hubs & Warehouse Inventory
        </h2>
        <p className="text-stone-500 mt-1 font-medium">Real-time stock capacity monitoring and AI shortage forecasting for regional emergency stockpiles.</p>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {warehouses.map(wh => (
          <div key={wh.id} className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-4 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-stone-900">{wh.name}</h3>
                <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">{wh.location} • {wh.district}</p>
              </div>
              {(wh.medicine_stock < 25 || wh.food_stock < 25 || wh.fuel_stock < 25) && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <AlertTriangle size={12} /> LOW STOCK ALERT
                </span>
              )}
            </div>

            {/* Inventory Stock Gauges */}
            <div className="space-y-4 my-4 flex-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-stone-700">💊 Medical Supplies & Vaccines Stock</span>
                  <span className={wh.medicine_stock < 25 ? 'text-red-600 font-black' : 'text-stone-900 font-extrabold'}>{wh.medicine_stock}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div className={`h-full ${wh.medicine_stock < 25 ? 'bg-red-600' : wh.medicine_stock < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${wh.medicine_stock}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-stone-700">🥫 Food & Water Rations Stock</span>
                  <span className={wh.food_stock < 25 ? 'text-red-600 font-black' : 'text-stone-900 font-extrabold'}>{wh.food_stock}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div className={`h-full ${wh.food_stock < 25 ? 'bg-red-600' : wh.food_stock < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${wh.food_stock}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-stone-700">⛽ Fuel & Generator Reserve</span>
                  <span className={wh.fuel_stock < 25 ? 'text-red-600 font-black' : 'text-stone-900 font-extrabold'}>{wh.fuel_stock}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div className={`h-full ${wh.fuel_stock < 25 ? 'bg-red-600' : wh.fuel_stock < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${wh.fuel_stock}%` }} />
                </div>
              </div>
            </div>

            {/* AI Forecasting Widget */}
            <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <BatteryCharging size={14} /> AI Shortage Forecasting Engine
              </p>
              <p className="text-xs text-stone-700 font-medium">
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
