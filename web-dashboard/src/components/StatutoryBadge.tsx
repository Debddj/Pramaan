import React from 'react';

interface StatutoryBadgeProps {
  citation: string;
  severity: string;
}

export const StatutoryBadge: React.FC<StatutoryBadgeProps> = ({ citation, severity }) => {
  const isCritical = severity.toLowerCase() === 'critical';
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold border ${
        isCritical
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} />
      <span>{citation}</span>
    </span>
  );
};
