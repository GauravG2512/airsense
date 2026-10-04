import React from 'react';
import { AqiCategory, CPCB_AQI_CATEGORIES } from '@/lib/api';

interface AqiBadgeProps {
  category: AqiCategory;
  aqi?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const AqiBadge: React.FC<AqiBadgeProps> = ({
  category,
  aqi,
  size = 'md',
  showNumber = true,
}) => {
  const config = CPCB_AQI_CATEGORIES[category] || CPCB_AQI_CATEGORIES.Moderate;

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
    lg: 'text-sm px-4 py-1.5 gap-2.5 font-normal',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border border-[#e8e8e8] bg-[#ffffff] text-[#202020] transition-colors ${sizeStyles[size]}`}
      style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      <span className="uppercase tracking-tight text-[11px] text-[#202020]">
        {category}
      </span>
      {showNumber && aqi !== undefined && (
        <span className="font-mono text-[#4d4d4d] pl-1.5 border-l border-[#e8e8e8]">
          AQI {aqi}
        </span>
      )}
    </div>
  );
};
