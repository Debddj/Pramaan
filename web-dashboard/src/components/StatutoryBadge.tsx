import React from 'react';

interface StatutoryBadgeProps {
  citation: string;
  severity: string;
}

export const StatutoryBadge: React.FC<StatutoryBadgeProps> = ({ citation, severity }) => {
  const isCritical = severity.toLowerCase() === 'critical';
  const isModerate = severity.toLowerCase() === 'moderate';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium border ${
        isCritical
          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          : isModerate
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      }`}
    >
      <span className="font-bold">{citation}</span>
    </span>
  );
};
