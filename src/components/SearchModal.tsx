import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { ContractorRecord } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractors: ContractorRecord[];
  onSelectContractor: (contractor: ContractorRecord) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  contractors,
  onSelectContractor
}) => {
  const [query, setQuery] = useState('');

  // Lock scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return contractors;
    const q = query.toLowerCase();
    return contractors.filter(
      (c) =>
        c.tradeName.toLowerCase().includes(q) ||
        c.legalName.toLowerCase().includes(q) ||
        c.bin.includes(q) ||
        c.reference.toLowerCase().includes(q) ||
        c.certNumber.toLowerCase().includes(q) ||
        c.naicsWsib.toLowerCase().includes(q)
    );
  }, [contractors, query]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4 bg-[#1B2126]/75 backdrop-blur-[2px] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="search-modal-container"
        className="w-full max-w-xl bg-white border border-[#14212E]/20 rounded-[6px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto sm:my-0 max-h-[85vh] flex flex-col"
      >
        {/* Header with Search Input */}
        <div className="p-3.5 sm:p-4 bg-[#1B2126] text-white flex items-center gap-3 shrink-0">
          <Search className="w-5 h-5 text-[#A3AFB8] shrink-0" />
          <input
            id="search-input-field"
            type="text"
            placeholder="Search trade name, legal name, BIN (e.g. 1001321614), or Ref..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-[#7C8D99] font-mono text-[13px] sm:text-[13.5px] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search modal"
            className="p-1.5 rounded text-[#A3AFB8] hover:text-white hover:bg-[#273037] transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-[#14212E]/10 p-2 flex-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-[#7C8D99] font-mono text-[13px]">
              No public records matched &quot;{query}&quot;. Try searching by BIN, trade name, or trade category.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectContractor(item);
                  onClose();
                }}
                className="w-full text-left p-3 sm:p-3.5 hover:bg-[#EAEEEE]/60 active:bg-[#EAEEEE] rounded transition-colors flex items-center justify-between gap-3 group touch-manipulation"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-['Archivo'] font-bold text-[14.5px] sm:text-[15px] text-[#1B2126] group-hover:text-[#9C3E14] truncate">
                      {item.tradeName}
                    </span>
                    <span className="font-mono text-[10.5px] sm:text-[11px] uppercase bg-[#DCE3E3] text-[#4C5A67] px-1.5 py-0.5 rounded">
                      Ref {item.reference}
                    </span>
                  </div>
                  <div className="text-[12.5px] sm:text-[13px] text-[#4C5A67] mt-0.5 truncate">
                    {item.legalName} &middot; <span className="font-mono">{item.bin}</span>
                  </div>
                  <div className="text-[11.5px] sm:text-[12px] text-[#7C8D99] mt-0.5 font-mono truncate">
                    {item.naicsWsib}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[#7C8D99] group-hover:text-[#9C3E14] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#EAEEEE] border-t border-[#14212E]/10 flex items-center justify-between text-[10.5px] sm:text-[11px] font-mono uppercase text-[#4C5A67] shrink-0">
          <span className="truncate">ONBIS &amp; WSIB database</span>
          <span className="shrink-0">{filtered.length} records available</span>
        </div>
      </div>
    </div>
  );
};
