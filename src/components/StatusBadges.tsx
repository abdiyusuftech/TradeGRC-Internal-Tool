import React from 'react';
import { PillStyle } from '../types';

interface StatusBadgesProps {
  certPill: PillStyle;
  regPill: PillStyle;
  certDaysCopy: string;
  regDaysCopy: string;
  showThreshold?: boolean;
}

export const StatusBadges: React.FC<StatusBadgesProps> = ({
  certPill,
  regPill,
  certDaysCopy,
  regDaysCopy,
  showThreshold = true
}) => {
  return (
    <div id="status-badges-section" className="mt-4 sm:mt-5">
      {/* 2-Column Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        
        {/* Safety clearance status */}
        <div className="flex items-baseline gap-2 sm:gap-2.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11.5px] sm:text-[12px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors"
            style={{
              backgroundColor: certPill.bg,
              color: certPill.fg
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full block shrink-0"
              style={{ backgroundColor: certPill.pip }}
              aria-hidden="true"
            />
            {certPill.label}
          </span>
          <span className="text-[13.5px] sm:text-[14px] text-[#16222C] leading-[1.45]">
            <strong className="font-bold">Safety clearance</strong> &mdash; {certDaysCopy}
          </span>
        </div>

        {/* Good standing status */}
        <div className="flex items-baseline gap-2 sm:gap-2.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11.5px] sm:text-[12px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors"
            style={{
              backgroundColor: regPill.bg,
              color: regPill.fg
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full block shrink-0"
              style={{ backgroundColor: regPill.pip }}
              aria-hidden="true"
            />
            {regPill.label}
          </span>
          <span className="text-[13.5px] sm:text-[14px] text-[#16222C] leading-[1.45]">
            <strong className="font-bold">Good standing</strong> &mdash; {regDaysCopy}
          </span>
        </div>
      </div>

      {/* Threshold Explanation */}
      {showThreshold && (
        <div className="font-mono text-[10.5px] sm:text-[11.5px] tracking-[.06em] uppercase text-[#4C5A67] mt-3 sm:mt-3.5 leading-[1.7] border-b border-dashed border-[#14212E]/10 pb-1 flex flex-wrap gap-x-1.5">
          <span>Threshold &mdash; </span>
          <span className="text-[#9C3E14] font-medium">under 30 days: address now</span>
          <span>&nbsp;/&nbsp;</span>
          <span className="text-[#4C5A67] font-medium">30&ndash;60 days: watch</span>
          <span>&nbsp;/&nbsp;</span>
          <span className="text-[#2F6B4F] font-medium">over 60 days: clear</span>
        </div>
      )}
    </div>
  );
};
