import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = {
            success: {
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
              border: 'border-emerald-200',
              bg: 'bg-white',
              titleColor: 'text-emerald-950',
            },
            error: {
              icon: <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />,
              border: 'border-rose-200',
              bg: 'bg-white',
              titleColor: 'text-rose-950',
            },
            warning: {
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
              border: 'border-amber-200',
              bg: 'bg-white',
              titleColor: 'text-amber-950',
            },
            info: {
              icon: <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />,
              border: 'border-indigo-200',
              bg: 'bg-white',
              titleColor: 'text-indigo-950',
            },
          }[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto rounded-xl p-4 border ${config.border} ${config.bg} shadow-dropdown flex items-start gap-3 relative overflow-hidden`}
            >
              {config.icon}
              <div className="flex-1 min-w-0 pr-4">
                {toast.title && (
                  <h4 className={`text-xs font-bold ${config.titleColor} mb-0.5`}>
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-relaxed break-words">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
