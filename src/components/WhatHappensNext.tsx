import React from 'react';
import { ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { ContractorRecord, VerdictStyle } from '../types';

interface WhatHappensNextProps {
  record: ContractorRecord;
  verdict: VerdictStyle;
  isUrgent: boolean;
  showScope?: boolean;
}

export const WhatHappensNext: React.FC<WhatHappensNextProps> = ({
  record,
  verdict,
  isUrgent,
  showScope = true
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div id="what-happens-next-section" className="mt-10">
      
      {/* 2-Column Guidance: What happens next & Outside this check */}
      <div className="pt-5 border-t border-dashed border-[#14212E]/16 grid grid-cols-1 md:grid-cols-2 gap-7">
        
        {/* Next Action Item */}
        <div>
          <span className="font-mono text-[11.5px] font-semibold tracking-[.06em] uppercase text-[#1B2126] block">
            What happens next
            <span className="block w-[22px] h-[2px] bg-[#C1501C] mt-1.5" aria-hidden="true" />
          </span>
          <p className="text-[14px] text-[#16222C] leading-[1.6] mt-2.5">
            {verdict.nextStep}
          </p>
        </div>

        {/* Scope Boundaries */}
        {showScope && (
          <div>
            <span className="font-mono text-[11.5px] font-semibold tracking-[.06em] uppercase text-[#1B2126] block">
              Outside this check
              <span className="block w-[22px] h-[2px] bg-[#4C5A67] mt-1.5" aria-hidden="true" />
            </span>
            <p className="text-[14px] text-[#4C5A67] leading-[1.6] mt-2.5">
              Insurance certificates, trade licensing, closeout files, and anything held inside a buyer&apos;s own portal are not public records and were not reviewed here.
            </p>
          </div>
        )}

      </div>

      {/* Provenance and Integrity Verification Hash */}
      {record.provenanceHash && (
        <div className="mt-7 pt-4 border-t border-dashed border-[#14212E]/16 flex items-center justify-between gap-3 sm:gap-4 flex-wrap text-[#7C8D99]">
          <div className="flex items-start sm:items-center gap-2 font-mono text-[10.5px] sm:text-[11px] tracking-[.05em] uppercase">
            <ShieldCheck className="w-4 h-4 text-[#2F6B4F] shrink-0 mt-0.5 sm:mt-0" />
            <span className="break-all sm:break-normal">
              Digital Registry Provenance: <strong className="text-[#4C5A67] font-medium font-mono lowercase break-all">{record.provenanceHash}</strong>
            </span>
          </div>
          <div className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[.05em]">
            Verified ONBIS &amp; WSIB Data
          </div>
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="mt-5 pt-4 border-t border-dashed border-[#14212E]/16">
        <p className="text-[12px] sm:text-[12.5px] text-[#4C5A67] leading-[1.6] max-w-[840px]">
          Every field above was read from the public record named in its panel, at the time shown. TradeGRC tracks compliance dates and status: this is not legal advice, not an assessment of the quality or safety of your work, and not a guarantee of any payment or bid outcome. Registry status can change after these lookups. For anything beyond record-keeping, we&apos;ll point you to the right professional.
        </p>
      </div>

    </div>
  );
};
