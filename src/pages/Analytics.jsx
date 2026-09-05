import React from 'react';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

// ── Mock Data ───────────────────────────────────────────────────────────────

const trendData = [
  { month: 'Jan', landslides: 12, floods: 2 },
  { month: 'Feb', landslides: 15, floods: 5 },
  { month: 'Mar', landslides: 18, floods: 8 },
  { month: 'Apr', landslides: 24, floods: 14 },
  { month: 'May', landslides: 30, floods: 28 },
  { month: 'Jun', landslides: 45, floods: 55 }, // Monsoon spike
];

const stateRiskData = [
  { state: 'Assam', critical: 12, high: 24, medium: 45 },
  { state: 'Arunachal', critical: 18, high: 30, medium: 22 },
  { state: 'Meghalaya', critical: 8, high: 15, medium: 34 },
  { state: 'Nagaland', critical: 5, high: 12, medium: 28 },
  { state: 'Manipur', critical: 6, high: 14, medium: 20 },
];

const fleetData = [
  { name: 'In Transit', value: 45 },
  { name: 'Delivering', value: 15 },
  { name: 'Idle', value: 25 },
  { name: 'Maintenance', value: 10 },
];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// ── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/90 border border-slate-700/50 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-slate-300 font-bold mb-2 border-b border-slate-700/50 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm my-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Analytics() {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-900 text-slate-200">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold uppercase tracking-wide text-white flex items-center gap-3">
          <BarChart3 className="text-blue-500" size={32} />
          Intelligence Analytics
        </h2>
        <p className="text-slate-400 mt-2">Historical trends, risk distribution, and fleet efficiency across the NER.</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* 1. Historical Trends */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col h-[400px]">
          <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-emerald-400" />
            6-Month Incident Trends
          </h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="landslides" name="Landslides" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="floods" name="Floods" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. State Risk Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col h-[400px]">
          <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-purple-400" />
            Risk Distribution by State
          </h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateRiskData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="state" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Bar dataKey="critical" name="Critical Risk" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="high" name="High Risk" stackId="a" fill="#f59e0b" />
                <Bar dataKey="medium" name="Medium Risk" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Fleet Status Donut */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col h-[400px] xl:col-span-2">
          <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-2">
            <PieChartIcon size={16} className="text-emerald-400" />
            Fleet Operations Status
          </h3>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {fleetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-white">95</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Vehicles</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
