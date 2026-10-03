import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <aside
      aria-label="Environmental Information Disclaimer"
      className={`card-asymmetric p-5 text-xs text-[#4d4d4d] flex items-start gap-3 border border-[#e8e8e8] ${className}`}
    >
      <Info className="w-4 h-4 text-[#816729] mt-0.5 flex-shrink-0" />
      <div className="font-sans leading-relaxed">
        <span className="font-medium text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
          Regulatory Notice:
        </span>{' '}
        AirSense provides environmental data intelligence and predictive models for research and personal planning. Raw measurements are compiled as-is from CPCB monitoring stations and US Embassy sensors via the XKDR India Air Quality Database. This platform does not provide medical advice or individual health determinations.
      </div>
    </aside>
  );
};
