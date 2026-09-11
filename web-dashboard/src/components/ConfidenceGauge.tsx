import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConfidenceGaugeProps {
  confidence: number;
  onNavigateToReview?: () => void;
  showDetails?: boolean;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  confidence,
  onNavigateToReview,
  showDetails = true,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(confidence * 100)));
  const isHighConfidence = percentage >= 85;
  const isModerate = percentage >= 70 && percentage < 85;

  const colorClass = isHighConfidence
    ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
    : isModerate
    ? 'text-amber-800 bg-amber-50 border-amber-200'
    : 'text-rose-800 bg-rose-50 border-rose-200';

  const barColor = isHighConfidence
    ? 'bg-emerald-500'
    : isModerate
    ? 'bg-amber-500'
    : 'bg-rose-500';

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isHighConfidence ? (
            <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <div>
            <span className="text-xs font-semibold text-black block">AI Confidence Score</span>
            <span className="text-[11px] text-gray-500">
              {isHighConfidence ? 'Automated Decision Standard' : 'Human Officer Verification Required'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold font-mono text-black">{percentage}%</span>
        </div>
      </div>

      {/* Animated Gauge Bar with 85% Safety Gate Threshold */}
      <div className="space-y-1.5">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {/* 85% Threshold Line Marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-black z-10"
            style={{ left: '85%' }}
            title="85% Statutory Triage Gate"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
          <span>0%</span>
          <span className="text-gray-700 font-semibold">85% Triage Gate</span>
          <span>100%</span>
        </div>
      </div>

      {showDetails && (
        <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${colorClass}`}>
          {isHighConfidence ? (
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>
                <strong>High Confidence ({percentage}%):</strong> Full computer vision calibration and declaration consistency verified. Legally defensible for automated statutory determination.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Safety Intercept ({percentage}%):</strong> Ambiguity or borderline optical calibration detected. Intercepted for human officer review before penalty notice dispatch.
                </span>
              </div>
              {onNavigateToReview && (
                <button
                  onClick={onNavigateToReview}
                  className="px-3.5 py-1.5 bg-black text-white hover:bg-gray-800 rounded-full text-xs font-semibold shadow-sm transition"
                >
                  Open in Officer Review Queue →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
