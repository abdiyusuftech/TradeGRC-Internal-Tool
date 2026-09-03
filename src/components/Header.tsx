import React from 'react';
import { Printer } from 'lucide-react';

interface HeaderProps {
  tradeName: string;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({ tradeName, onPrint }) => {
  return (
    <header id="main-header" className="bg-[#1B2126] text-[#EAEEEE] border-b border-[#2C343B] sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Brand Identity & Active Record */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap min-w-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="w-2.5 h-2.5 bg-[#C1501C] rounded-[2px]" aria-hidden="true" />
            <span className="font-['Archivo'] font-extrabold text-[17px] tracking-[-0.01em] text-white">
              TradeGRC
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 font-mono text-[11.5px] tracking-[.09em] uppercase text-[#A3AFB8] min-w-0">
            <span className="px-2 py-0.5 rounded bg-[#273037] text-[#DCE3E3] shrink-0">Compliance Record</span>
            <span className="text-white font-medium truncate">{tradeName}</span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap no-print">
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
