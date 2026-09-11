import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  RotateCw, 
  CheckCircle2, 
  Ruler, 
  Search,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ReviewQueueItem } from '../api/types';

interface ReviewQueueViewProps {
  queue: ReviewQueueItem[];
  loading: boolean;
  onRefresh: () => void;
  onInspectItem: (item: ReviewQueueItem) => void;
  onAdjudicate: (scanUuid: string, action: 'mark_compliant' | 'approve_violation') => Promise<void>;
  adjudicatingUuid: string | null;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  queue,
  loading,
  onRefresh,
  onInspectItem,
  onAdjudicate,
  adjudicatingUuid,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQueue = queue.filter(
    (item) =>
      item.scan_uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.barcode && item.barcode.includes(searchTerm))
  );

  return (
    <div className="bg-white rounded-3xl border border-black/10 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
              <Clock className="w-5 h-5" />
            </span>
            <h2
              className="text-2xl md:text-3xl font-medium tracking-tight text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              Officer Review Queue
            </h2>
            <span className="bg-black text-white text-xs px-3 py-0.5 rounded-full font-bold font-mono">
              {queue.length} Pending
            </span>
          </div>
          <p className="text-xs text-black/60">
            Borderline confidence inspections (&lt;85%) intercepted before automated statutory penalty issuance
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-black transition disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Scan UUID or Barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>
      </div>

      {/* Queue Items Grid */}
      {queue.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-gray-50 rounded-3xl border border-gray-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-medium text-black">All Triage Items Cleared</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Zero pending reviews. All inspected commodities conform to high-confidence automated determination standards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQueue.map((item) => {
            const isAdjudicating = adjudicatingUuid === item.scan_uuid;
            const percent = Math.round(item.confidence * 100);

            return (
              <motion.div
                key={item.scan_uuid}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-200 rounded-3xl p-5 hover:border-black/30 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Top Status Banner */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Review Required</span>
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Identifier & Product Details */}
                  <div className="space-y-1">
                    <span className="font-mono text-sm font-bold text-black block">
                      Inspection #{item.scan_uuid}
                    </span>
                    <div className="text-xs text-gray-700 font-medium">
                      Barcode: <span className="font-mono text-gray-500">{item.barcode || '8901030048123'}</span>
                    </div>
                  </div>

                  {/* Visual Confidence Meter */}
                  <div className="space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-600">AI Confidence</span>
                      <span className="font-mono text-amber-700 font-bold">{percent}%</span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>0%</span>
                      <span className="text-gray-600 font-semibold">85% Gate</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => onInspectItem(item)}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition flex items-center gap-1.5 group"
                  >
                    <Ruler className="w-3.5 h-3.5 text-white" />
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3 text-white transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onAdjudicate(item.scan_uuid, 'mark_compliant')}
                      disabled={isAdjudicating}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-full transition disabled:opacity-50"
                    >
                      Mark Compliant
                    </button>

                    <button
                      onClick={() => onAdjudicate(item.scan_uuid, 'approve_violation')}
                      disabled={isAdjudicating}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold rounded-full transition disabled:opacity-50"
                    >
                      Approve Violation
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
