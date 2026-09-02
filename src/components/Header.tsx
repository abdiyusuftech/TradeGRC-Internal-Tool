import React from 'react';
import { Search, Printer, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { ContractorRecord } from '../types';

interface HeaderProps {
  currentRecord: ContractorRecord;
  contractors: ContractorRecord[];
  onSelectContractor: (contractor: ContractorRecord) => void;
  onOpenSearch: () => void;
  onOpenSimulator: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRecord,
  contractors,
  onSelectContractor,
  onOpenSearch,
  onOpenSimulator,
  onPrint
}) => {
  return (
    <header id="main-header" className="bg-[#1B2126] text-[#EAEEEE] border-b border-[#2C343B] sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 flex-wrap">
        
        {/* Left: Brand Identity & Active Ref */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#C1501C] rounded-[2px]" aria-hidden="true" />
            <span className="font-['Archivo'] font-extrabold text-[17px] tracking-[-0.01em] text-white">
              TradeGRC
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 font-mono text-[11.5px] tracking-[.09em] uppercase text-[#A3AFB8]">
            <span className="px-2 py-0.5 rounded bg-[#273037] text-[#DCE3E3]">Compliance Record</span>
            <span className="text-[#7C8D99]">Ref <strong className="text-white font-medium">{currentRecord.reference}</strong></span>
          </div>
        </div>

        {/* Right: Controls & Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap no-print">
          
          {/* Quick Trade Profile Switcher */}
          <div className="relative inline-block">
            <select
              id="contractor-select"
              aria-label="Select Contractor Record"
              value={currentRecord.id}
              onChange={(e) => {
                const found = contractors.find((c) => c.id === e.target.value);
                if (found) onSelectContractor(found);
              }}
              className="max-w-[130px] sm:max-w-[200px] md:max-w-[260px] truncate bg-[#273037] hover:bg-[#313C44] text-[#EAEEEE] font-mono text-[11.5px] tracking-[.04em] py-2 pl-2.5 pr-7 rounded border border-[#3A454E] focus:outline-none focus:ring-1 focus:ring-[#C1501C] appearance-none cursor-pointer transition-colors"
            >
              {contractors.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1B2126] text-white">
                  {c.tradeName} ({c.reference})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-[#A3AFB8] pointer-events-none" />
          </div>

          {/* Search / Lookup Button */}
          <button
            id="btn-search-records"
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-1.5 bg-[#273037] hover:bg-[#313C44] active:bg-[#1B2126] text-[#DCE3E3] font-mono text-[11.5px] tracking-[.05em] px-2.5 py-2 rounded border border-[#3A454E] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C1501C] touch-manipulation"
            title="Search Public Records"
            aria-label="Lookup Record"
          >
            <Search className="w-3.5 h-3.5 text-[#A3AFB8]" />
            <span className="hidden sm:inline">Lookup</span>
          </button>

          {/* Time Scrubber */}
          <button
            id="btn-time-simulator"
            type="button"
            onClick={onOpenSimulator}
            className="inline-flex items-center gap-1.5 bg-[#273037] hover:bg-[#313C44] active:bg-[#1B2126] text-[#DCE3E3] font-mono text-[11.5px] tracking-[.05em] px-2.5 py-2 rounded border border-[#3A454E] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C1501C] touch-manipulation"
            title="Simulate As-Of Date"
            aria-label="Date Check Simulator"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#A3AFB8]" />
            <span className="hidden md:inline">Date Check</span>
          </button>

          {/* Print / Save PDF */}
          <button
            id="btn-print-record"
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 bg-[#273037] hover:bg-[#313C44] active:bg-[#1B2126] text-[#DCE3E3] font-mono text-[11.5px] tracking-[.05em] px-2.5 py-2 rounded border border-[#3A454E] transition-colors focus:outline-none touch-manipulation"
            title="Print Official Slip"
            aria-label="Print Record Slip"
          >
            <Printer className="w-3.5 h-3.5 text-[#A3AFB8]" />
            <span className="hidden sm:inline">Print Slip</span>
          </button>

        </div>
      </div>
    </header>
  );
};
