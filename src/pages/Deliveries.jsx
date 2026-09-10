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
    if (prio === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-300 font-black';
    if (prio === 'HIGH') return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    return 'bg-red-50 text-red-700 border-red-200 font-bold';
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-[#faf9f6] text-stone-900 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wide text-stone-900 flex items-center gap-3">
            <Package className="text-red-600" size={32} />
            Essential Logistics & Commodity Orders
          </h2>
          <p className="text-stone-500 mt-1 font-medium">Priority dispatch tracking for Medical Supplies, Food Rations, Drinking Water, and Rescue Equipment.</p>
        </div>

        <div className="flex gap-3">
          <div className="flex gap-2">
            {['All', 'CRITICAL', 'HIGH', 'NORMAL'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                  filterPriority === p ? 'bg-red-600 text-white' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={16} /> New Emergency Order
          </button>
        </div>
      </div>

      {/* Delivery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeliveries.map(del => (
          <div key={del.id} className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:border-red-400 transition-all">
            <div>
              <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-stone-900">{del.commodity}</h3>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">{del.id} • {del.quantity}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest border ${getPriorityStyle(del.priority)}`}>
                  {del.priority}
                </span>
              </div>

              <div className="space-y-2 text-xs text-stone-700 my-4 font-medium">
                <p><span className="text-stone-500 font-bold uppercase">Origin:</span> {del.origin}</p>
                <p><span className="text-stone-500 font-bold uppercase">Destination:</span> {del.destination}</p>
                <p><span className="text-stone-500 font-bold uppercase">Assigned Vehicle:</span> <span className="font-extrabold text-red-600">{del.vehicle_id || 'Unassigned'}</span></p>
                <p><span className="text-stone-500 font-bold uppercase">ETA:</span> {del.eta}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
              <span className="text-stone-500 font-semibold">Status: <span className="text-emerald-700 font-bold">{del.status}</span></span>
              <span className="text-[10px] text-stone-400 uppercase font-medium">{del.created_time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white border border-stone-200 w-[480px] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-stone-900">
            <h3 className="text-lg font-black text-stone-900 uppercase tracking-wider">Create Emergency Supply Order</h3>
            
            <div>
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1 block">Commodity Type</label>
              <select value={commodity} onChange={e => setCommodity(e.target.value)} className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-800 rounded-lg p-2.5 font-medium">
                <option value="Medical Supplies">Medical Supplies & Vaccines</option>
                <option value="Food & Water Rations">Food & Water Rations</option>
                <option value="Rescue Equipment">Rescue & Heavy Equipment</option>
                <option value="Fuel & Generators">Fuel & Generators</option>
                <option value="Blankets & Tents">Blankets & Shelter Tents</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1 block">Quantity</label>
                <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-800 rounded-lg p-2.5 font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1 block">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-800 rounded-lg p-2.5 font-medium">
                  <option value="CRITICAL">CRITICAL (Emergency Priority)</option>
                  <option value="HIGH">HIGH Priority</option>
                  <option value="NORMAL">NORMAL Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1 block">Origin Hub</label>
                <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-800 rounded-lg p-2.5 font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1 block">Destination</label>
                <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-800 rounded-lg p-2.5 font-medium" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1 block">Assign Fleet Vehicle</label>
              <select value={assignedVehicle} onChange={e => setAssignedVehicle(e.target.value)} className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-800 rounded-lg p-2.5 font-medium">
                <option value="">-- Unassigned --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} - {v.driver} ({v.type}) [{v.status}]</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold uppercase cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black uppercase cursor-pointer shadow-sm">Create Order</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
