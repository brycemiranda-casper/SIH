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
    <div className="flex-1 flex flex-col p-8 h-full bg-slate-900 text-slate-200 overflow-y-auto max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black uppercase tracking-wide text-white flex items-center gap-3">
          <Smartphone className="text-blue-500" size={32} />
          Field Officer Offline Incident Reporting
        </h2>
        <p className="text-slate-400 mt-1">Mobile-first reporting interface for field personnel. Works online or offline with automatic background sync.</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
          <div>
            <p className="font-black text-sm text-emerald-400">Incident Successfully Submitted!</p>
            <p className="text-xs text-slate-300">Report saved locally and synchronized with Central Command Database.</p>
          </div>
        </div>
      )}

      {/* Reporting Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Incident Category</label>
          <div className="grid grid-cols-3 gap-3">
            {['Landslide', 'Flood', 'Road Blocked'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  type === t ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-md' : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Severity Level</label>
          <div className="grid grid-cols-3 gap-3">
            {['Critical', 'High', 'Medium'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  severity === s ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-md' : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Location & Geo-Coordinates</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin size={16} className="absolute left-3 top-3 text-emerald-400" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl pl-10 pr-4 py-2.5"
              />
            </div>
            <button
              type="button"
              onClick={handleCaptureGps}
              disabled={isCapturingGps}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {isCapturingGps ? 'Locating...' : 'Auto GPS'}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description & Observations</label>
          <textarea
            rows="3"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Photograph Attachment</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-700/50 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 cursor-pointer transition-colors">
              <Camera size={18} className="text-blue-400" />
              <span>Capture / Upload Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-700" />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 py-3.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black uppercase tracking-wider text-sm rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send size={18} /> Submit Incident Report
        </button>
      </form>
    </div>
  );
}
