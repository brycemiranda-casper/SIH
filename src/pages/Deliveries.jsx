import React, { useEffect, useState } from 'react';
import { Package, Truck, Clock, ShieldAlert, Plus, CheckCircle2 } from 'lucide-react';
import useStore from '../store/useStore';

export default function Deliveries() {
  const { deliveries, fetchDeliveries, createDelivery, vehicles, fetchVehicles } = useStore();
  const [filterPriority, setFilterPriority] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // New Delivery Form state
  const [commodity, setCommodity] = useState('Medical Supplies');
  const [quantity, setQuantity] = useState('500 kg');
  const [origin, setOrigin] = useState('Guwahati Regional Hub');
  const [destination, setDestination] = useState('Tawang Hospital');
  const [priority, setPriority] = useState('CRITICAL');
  const [assignedVehicle, setAssignedVehicle] = useState('');

  useEffect(() => {
    fetchDeliveries();
    fetchVehicles();
  }, [fetchDeliveries, fetchVehicles]);

  const filteredDeliveries = deliveries.filter(d => filterPriority === 'All' || d.priority === filterPriority);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createDelivery({
      commodity,
      quantity,
      origin,
      destination,
      priority,
      vehicle_id: assignedVehicle || null
    });
    setShowModal(false);
  };

  const getPriorityStyle = (prio) => {
    if (prio === 'CRITICAL') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (prio === 'HIGH') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-slate-900 text-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wide text-white flex items-center gap-3">
            <Package className="text-blue-500" size={32} />
            Essential Logistics & Commodity Orders
          </h2>
          <p className="text-slate-400 mt-1">Priority dispatch tracking for Medical Supplies, Food Rations, Drinking Water, and Rescue Equipment.</p>
        </div>

        <div className="flex gap-3">
          <div className="flex gap-2">
            {['All', 'CRITICAL', 'HIGH', 'NORMAL'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border cursor-pointer transition-all ${
                  filterPriority === p ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
          >
            <Plus size={16} /> New Emergency Order
          </button>
        </div>
      </div>

      {/* Delivery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeliveries.map(del => (
          <div key={del.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-start mb-3 border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-lg font-black text-white">{del.commodity}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{del.id} • {del.quantity}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityStyle(del.priority)}`}>
                  {del.priority}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 my-4">
                <p><span className="text-slate-500 font-bold uppercase">Origin:</span> {del.origin}</p>
                <p><span className="text-slate-500 font-bold uppercase">Destination:</span> {del.destination}</p>
                <p><span className="text-slate-500 font-bold uppercase">Assigned Vehicle:</span> <span className="font-bold text-blue-400">{del.vehicle_id || 'Unassigned'}</span></p>
                <p><span className="text-slate-500 font-bold uppercase">ETA:</span> {del.eta}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Status: <span className="text-emerald-400 font-bold">{del.status}</span></span>
              <span className="text-[10px] text-slate-500 uppercase">{del.created_time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 w-[480px] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Create Emergency Supply Order</h3>
            
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Commodity Type</label>
              <select value={commodity} onChange={e => setCommodity(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5">
                <option value="Medical Supplies">Medical Supplies & Vaccines</option>
                <option value="Food & Water Rations">Food & Water Rations</option>
                <option value="Rescue Equipment">Rescue & Heavy Equipment</option>
                <option value="Fuel & Generators">Fuel & Generators</option>
                <option value="Blankets & Tents">Blankets & Shelter Tents</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Quantity</label>
                <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5">
                  <option value="CRITICAL">CRITICAL (Emergency Priority)</option>
                  <option value="HIGH">HIGH Priority</option>
                  <option value="NORMAL">NORMAL Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Origin Hub</label>
                <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Destination</label>
                <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Assign Fleet Vehicle</label>
              <select value={assignedVehicle} onChange={e => setAssignedVehicle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5">
                <option value="">-- Unassigned --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} - {v.driver} ({v.type}) [{v.status}]</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-lg text-xs font-black uppercase">Create Order</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
