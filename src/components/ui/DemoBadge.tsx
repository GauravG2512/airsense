import React from 'react';

interface DemoBadgeProps {
  label?: string;
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = 'SIMULATION // DEMO DATA',
  className = '',
}) => {
  return (
    <span
      className={`editorial-tag bg-[#efefef] text-[#202020] border border-[#e8e8e8] font-mono text-[11px] ${className}`}
      title="Visualization rendered with verified simulation data pending live API connection"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
      {label}
    </span>
  );
};
