import React from 'react';
import { ContractorRecord } from '../types';

interface RecordHeaderProps {
  record: ContractorRecord;
  currentAsOfDate: string;
}

export const RecordHeader: React.FC<RecordHeaderProps> = ({ record, currentAsOfDate }) => {
  return (
    <div id="record-header" className="pt-6 sm:pt-8">
      {/* Eyebrow / Record Label */}
      <div className="font-mono text-[11px] sm:text-[11.5px] tracking-[.1em] uppercase text-[#4C5A67]">
        Record for
      </div>

      {/* Primary Display Title */}
      <h1 
        id="trade-contractor-name"
        className="font-['Archivo'] font-extrabold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.015em] leading-[1.12] text-[#1B2126] mt-1.5 break-words"
      >
        {record.tradeName}
      </h1>

      {/* Legal Subhead & Principal Jurisdiction */}
      <div className="text-[13.5px] sm:text-[14.5px] text-[#4C5A67] mt-1.5 leading-[1.5] flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="font-medium text-[#16222C] break-words">{record.legalName}</span>
        <span className="text-[#7C8D99] hidden xs:inline">&middot;</span>
        <span className="break-words">{record.principalPlace}</span>
      </div>

      {/* Public Provenance Stamp with Dashed Border */}
      <div className="font-mono text-[11px] sm:text-[11.5px] tracking-[.06em] uppercase text-[#7C8D99] mt-3.5 pt-3 border-t border-dashed border-[#14212E]/20 leading-[1.7] flex flex-wrap gap-x-2.5 sm:gap-x-3 gap-y-1">
        <span>Read from public record &mdash;</span>
        <span>WSIB clearances: <strong className="text-[#4C5A67] font-medium">{record.wsibStamp}</strong></span>
        <span className="text-[#14212E]/30 hidden sm:inline">&nbsp;/&nbsp;</span>
        <span>Ontario Business Registry: <strong className="text-[#4C5A67] font-medium">{record.onbisStamp}</strong></span>
        {currentAsOfDate !== record.checkedISO && (
          <span className="text-[#C1501C] font-semibold bg-[#F3DCCB] px-1.5 py-0.5 rounded">
            (Simulated as of {currentAsOfDate})
          </span>
        )}
      </div>
    </div>
  );
};
