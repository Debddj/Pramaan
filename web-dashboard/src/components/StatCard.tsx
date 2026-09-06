import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'amber' | 'emerald' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: 'border-blue-500/20 bg-blue-950/10 text-blue-400',
    amber: 'border-amber-500/20 bg-amber-950/10 text-amber-400',
    emerald: 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400',
    rose: 'border-rose-500/20 bg-rose-950/10 text-rose-400',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 rounded-xl p-5 transition text-left select-none ${
        onClick
          ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-800/60 active:scale-[0.99]'
          : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-white">
        {value}
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
        <span>{subtitle}</span>
        {trend && <span className="font-semibold text-emerald-400">{trend}</span>}
      </div>
    </div>
  );
};
