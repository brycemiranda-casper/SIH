import React from 'react';
import { X, ShieldAlert, Cpu, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import useStore from '../../store/useStore';

export default function ExplainableRiskModal() {
  const { explainableRiskOpen, setExplainableRiskOpen, riskPrediction } = useStore();

  if (!explainableRiskOpen || !riskPrediction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={20} className="text-red-600" />
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
              AI Risk Engine - Explainability Model
            </h3>
          </div>
          <button
            onClick={() => setExplainableRiskOpen(false)}
            className="p-1 rounded bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Main Score Display */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <p className="text-xs font-bold text-stone-500">Composite Risk Score</p>
              <h2 className="text-3xl font-black text-red-600 mt-1">
                {riskPrediction.risk_score} <span className="text-sm font-normal text-stone-500">/ 100</span>
              </h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-300">
                STATUS: {riskPrediction.status.toUpperCase()} HAZARD
              </span>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-50">
              <ShieldAlert size={36} className="text-red-600 animate-pulse" />
            </div>
          </div>

          {/* Factor Breakdown Bars */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Risk Weight Breakdown
            </p>
            <div className="flex flex-col gap-2">
              {Object.entries(riskPrediction.breakdown || {}).map(([key, val]) => (
                <div key={key} className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                    <span>{key} Factor</span>
                    <span className="text-red-600">{val}% Factor Impact</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        val > 70 ? 'bg-red-600' : val > 40 ? 'bg-amber-500' : 'bg-emerald-500'
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
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1">
              <Info size={13} className="text-red-600" /> Rationale Breakdown ("Why?")
            </p>
            <div className="flex flex-col gap-1.5">
              {(riskPrediction.explanation || []).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-stone-50 rounded border border-stone-200 text-xs text-stone-700 font-medium">
                  <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Honesty Tag */}
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-900 flex items-center justify-between">
            <span className="font-medium">Data Model: <strong>IMD + Open-Meteo + NDMA CAP Engine</strong></span>
            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] uppercase">PREDICTED AI MODEL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
