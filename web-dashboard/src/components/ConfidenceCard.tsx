import React from 'react';
import { ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface ConfidenceCardProps {
  confidence: number; // 0.0 to 1.0 or 0 to 100
  onNavigateToReview?: () => void;
}

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  confidence,
  onNavigateToReview,
}) => {
  const percent = confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100);
  const isAutoPassed = percent >= 85;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all shadow-sm ${
        isAutoPassed
          ? 'bg-emerald-50/50 border-emerald-200/80'
          : 'bg-amber-50/50 border-amber-200/80'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isAutoPassed ? (
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Extraction Confidence Gate
          </span>
        </div>
        <span
          className={`font-mono text-sm font-bold px-2.5 py-0.5 rounded-full border ${
            isAutoPassed
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}
        >
          {percent}%
        </span>
      </div>

      {/* Visual threshold progress bar */}
      <div className="relative w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden my-3">
        {/* 85% threshold mark indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-900/60 z-10"
          style={{ left: '85%' }}
          title="85% Statutory Review Threshold"
        />
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isAutoPassed ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3 font-mono">
        <span>Sub-threshold (&lt;85%)</span>
        <span className="text-slate-800 font-semibold">85% Safety Gate</span>
        <span>High-confidence (≥85%)</span>
      </div>

      {isAutoPassed ? (
        <div className="rounded-xl bg-white border border-emerald-200 p-3 text-xs text-emerald-900 shadow-sm">
          <div className="font-bold flex items-center gap-1.5 text-emerald-800">
            <span>✓ AUTO-DETERMINATION APPROVED</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
            Extraction confidence exceeds 85% safety threshold. Automated statutory penalty notice authorized without human officer intervention.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-amber-200 p-3 text-xs text-amber-950 space-y-2 shadow-sm">
          <div>
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <span>⚠ OFFICER REVIEW MANDATORY</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
              Confidence is below 85% threshold. Automated penalty is blocked to guarantee legal defensibility in consumer court.
            </p>
          </div>
          {onNavigateToReview && (
            <button
              onClick={onNavigateToReview}
              className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <span>Triage in Officer Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
