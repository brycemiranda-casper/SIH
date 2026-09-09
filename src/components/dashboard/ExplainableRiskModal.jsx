import React from 'react';
import { X, ShieldAlert, Cpu, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import useStore from '../../store/useStore';

export default function ExplainableRiskModal() {
  const { explainableRiskOpen, setExplainableRiskOpen, riskPrediction } = useStore();

  if (!explainableRiskOpen || !riskPrediction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={20} className="text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              AI Risk Engine - Explainability Model
            </h3>
          </div>
          <button
            onClick={() => setExplainableRiskOpen(false)}
            className="p-1 rounded bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Main Score Display */}
          <div className="flex items-center justify-between p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-400">Composite Risk Score</p>
              <h2 className="text-3xl font-extrabold text-red-400 mt-1">
                {riskPrediction.risk_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                STATUS: {riskPrediction.status.toUpperCase()} HAZARD
              </span>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-red-500/40 flex items-center justify-center bg-red-500/10">
              <ShieldAlert size={36} className="text-red-400 animate-pulse" />
            </div>
          </div>

          {/* Factor Breakdown Bars */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Risk Weight Breakdown
            </p>
            <div className="flex flex-col gap-2">
              {Object.entries(riskPrediction.breakdown || {}).map(([key, val]) => (
                <div key={key} className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>{key} Factor</span>
                    <span className="text-blue-400">{val}% Factor Impact</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        val > 70 ? 'bg-red-500' : val > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Accordion / List */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Info size={13} className="text-blue-400" /> Rationale Breakdown ("Why?")
            </p>
            <div className="flex flex-col gap-1.5">
              {(riskPrediction.explanation || []).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-slate-950/60 rounded border border-slate-800 text-xs text-slate-300">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Honesty Tag */}
          <div className="p-2.5 bg-blue-950/30 border border-blue-800/50 rounded-lg text-[11px] text-blue-300 flex items-center justify-between">
            <span>Data Model: <strong>IMD + Open-Meteo + NDMA CAP Engine</strong></span>
            <span className="px-2 py-0.5 rounded bg-blue-600/30 font-bold text-[10px] uppercase">PREDICTED AI MODEL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
