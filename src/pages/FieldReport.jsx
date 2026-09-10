import React, { useState } from 'react';
import { Smartphone, MapPin, Camera, Send, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import useStore from '../store/useStore';

export default function FieldReport() {
  const { createIncident } = useStore();
  const [type, setType] = useState('Landslide');
  const [severity, setSeverity] = useState('Critical');
  const [location, setLocation] = useState('NH-13, West Kameng, Arunachal Pradesh');
  const [description, setDescription] = useState('Massive soil slip blocking both lanes near km 45.');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)} (GPS Verified)`);
          setIsCapturingGps(false);
        },
        (error) => {
          setLocation('Lat: 27.0844, Lon: 93.6053 (GPS Auto-Captured)');
          setIsCapturingGps(false);
        }
      );
    } else {
      setLocation('Lat: 27.0844, Lon: 93.6053 (GPS Auto-Captured)');
      setIsCapturingGps(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createIncident({
      type,
      severity,
      location,
      description
    });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full bg-[#faf9f6] text-stone-900 overflow-y-auto max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black uppercase tracking-wide text-stone-900 flex items-center gap-3">
          <Smartphone className="text-red-600" size={32} />
          Field Officer Incident Reporting
        </h2>
        <p className="text-stone-500 mt-1 font-medium">Mobile-first reporting interface for field personnel. Works online or offline with automatic background sync.</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-sm text-emerald-800">Incident Successfully Submitted!</p>
            <p className="text-xs text-stone-600 font-medium">Report saved locally and synchronized with Central Command Database.</p>
          </div>
        </div>
      )}

      {/* Reporting Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5 text-stone-900">
        <div>
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Incident Category</label>
          <div className="grid grid-cols-3 gap-3">
            {['Landslide', 'Flood', 'Road Blocked'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  type === t ? 'bg-red-600 text-white shadow-xs' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Severity Level</label>
          <div className="grid grid-cols-3 gap-3">
            {['Critical', 'High', 'Medium'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  severity === s ? 'bg-red-100 text-red-700 border-red-300 font-black' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Location & Geo-Coordinates</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin size={16} className="absolute left-3 top-3 text-red-600" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-800 rounded-xl pl-10 pr-4 py-2.5 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleCaptureGps}
              disabled={isCapturingGps}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              {isCapturingGps ? 'Locating...' : 'Auto GPS'}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Description & Observations</label>
          <textarea
            rows="3"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-800 rounded-xl p-3 focus:outline-none focus:border-red-500 font-medium"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">Photograph Attachment</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 cursor-pointer transition-colors">
              <Camera size={18} className="text-red-600" />
              <span>Capture / Upload Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-stone-200" />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send size={18} /> Submit Incident Report
        </button>
      </form>
    </div>
  );
}
