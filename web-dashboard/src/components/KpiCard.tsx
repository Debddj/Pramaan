import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'indigo' | 'emerald' | 'rose' | 'amber';
  onClick?: () => void;
}

function AnimatedNumber({ value }: { value: number | string }) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const rawString = String(value);
  const numericValue = typeof value === 'number' ? value : parseFloat(rawString.replace(/[^0-9.]/g, ''));
  const isPercent = rawString.includes('%');

  useEffect(() => {
    if (isNaN(numericValue)) return;
    const start = 0;
    const end = numericValue;
    const duration = 900;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;

      setDisplayValue(Number.isInteger(end) ? Math.round(current) : parseFloat(current.toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    const animId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animId);
  }, [numericValue]);

  if (isNaN(numericValue)) {
    return <span>{value}</span>;
  }

  return (
    <span>
      {Number.isInteger(numericValue) ? displayValue.toLocaleString() : displayValue}
      {isPercent ? '%' : ''}
    </span>
  );
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-3xl border border-black/10 p-6 shadow-sm hover:border-black/30 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group"
    >
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-2xl bg-gray-100 text-black border border-gray-200 group-hover:scale-105 transition-transform duration-200">
          {icon}
        </div>
        {trend ? (
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {trend}
          </span>
        ) : (
          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
        )}
      </div>

      <div className="space-y-1">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">
          {title}
        </span>
        <div
          className="text-3xl sm:text-4xl font-medium tracking-tight text-black"
          style={{ letterSpacing: '-0.04em' }}
        >
          <AnimatedNumber value={value} />
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};
