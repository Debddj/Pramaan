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
  // Normalize to 0-100
  const percent = confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100);
  const isAutoPassed = percent >= 85;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isAutoPassed
          ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/30'
          : 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500/30'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAutoPassed ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Extraction Confidence Gate
          </span>
        </div>
        <span
          className={`font-mono text-sm font-black px-2 py-0.5 rounded border ${
            isAutoPassed
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {percent}%
        </span>
      </div>

      {/* Visual threshold progress bar */}
      <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden my-3">
        {/* 85% threshold mark indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
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

      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
        <span>Sub-threshold (&lt;85%)</span>
        <span className="font-mono text-amber-300">85% Safety Line</span>
        <span>High-confidence (≥85%)</span>
      </div>

      {isAutoPassed ? (
        <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-2.5 text-xs text-emerald-300">
          <div className="font-bold flex items-center gap-1.5 text-emerald-200">
            <span>✓ AUTO-DETERMINATION APPROVED</span>
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-0.5">
            Extraction confidence exceeds 85% safety threshold. Automated statutory penalty notice authorized without human officer intervention.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-amber-950/30 border border-amber-500/30 p-2.5 text-xs text-amber-300 space-y-2">
          <div>
            <div className="font-bold flex items-center gap-1.5 text-amber-200">
              <span>⚠ OFFICER REVIEW MANDATORY</span>
            </div>
            <p className="text-[11px] text-amber-300/90 mt-0.5">
              Confidence is below 85% threshold. Automated penalty is blocked to guarantee legal defensibility in consumer court.
            </p>
          </div>
          {onNavigateToReview && (
            <button
              onClick={onNavigateToReview}
              className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-semibold text-xs flex items-center justify-center gap-1.5 transition"
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
