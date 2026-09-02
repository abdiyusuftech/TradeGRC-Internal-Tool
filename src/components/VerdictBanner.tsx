import React from 'react';
import { VerdictStyle } from '../types';

interface VerdictBannerProps {
  verdict: VerdictStyle;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({ verdict }) => {
  return (
    <div
      id="verdict-banner"
      className="mt-5 sm:mt-6.5 flex items-stretch rounded-[6px] overflow-hidden transition-all duration-200"
      style={{ backgroundColor: verdict.bg }}
    >
      {/* Left indicator spine */}
      <span
        className="w-[5px] shrink-0 self-stretch block"
        style={{
          background: verdict.spine,
          backgroundColor: verdict.spine.includes('gradient') ? '#DCE3E3' : undefined
        }}
        aria-hidden="true"
      />

      <div className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-baseline gap-x-6 gap-y-2 flex-1">
        <div className="shrink-0 min-w-[110px] sm:min-w-[130px]">
          <span className="font-mono text-[11px] sm:text-[11.5px] tracking-[.1em] uppercase text-[#4C5A67] block">
            Overall
          </span>
          <div
            id="verdict-headline"
            className="font-['Archivo'] font-black text-[22px] sm:text-[26px] tracking-[-0.015em] leading-[1.15] mt-0.5"
            style={{ color: verdict.fg }}
          >
            {verdict.word}
          </div>
        </div>

        <p className="text-[13.5px] sm:text-[14.5px] text-[#16222C] leading-[1.55] max-w-[65ch] flex-1">
          {verdict.line}
        </p>
      </div>
    </div>
  );
};
