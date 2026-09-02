import React, { useEffect } from 'react';
import { X, SlidersHorizontal, RefreshCw, Check } from 'lucide-react';

interface DateScrubberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAsOfDate: string;
  onChangeAsOfDate: (date: string) => void;
  forcedVerdict: string | null;
  onSetForcedVerdict: (v: string | null) => void;
  certValidToISO: string;
  registrationExpiryISO: string;
  onReset: () => void;
}

export const DateScrubberModal: React.FC<DateScrubberModalProps> = ({
  isOpen,
  onClose,
  currentAsOfDate,
  onChangeAsOfDate,
  forcedVerdict,
  onSetForcedVerdict,
  certValidToISO,
  registrationExpiryISO,
  onReset
}) => {
  // Lock body scroll and listen for Escape
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

  if (!isOpen) return null;

  const presets = [
    { label: 'Original Record Date (29 Aug 2026)', date: '2026-08-29' },
    { label: '30 Days Before WSIB Expiry (20 Oct 2026 - Watch)', date: '2026-10-20' },
    { label: '10 Days Before WSIB Expiry (09 Nov 2026 - Action Needed)', date: '2026-11-09' },
    { label: 'Post-Expiry (25 Nov 2026 - Lapsed)', date: '2026-11-25' },
    { label: 'Far Future (15 Jul 2030 - Reg Expiry Near)', date: '2030-07-15' }
  ];

  const verdicts = [
    { label: 'Computed from dates', value: null },
    { label: 'Clear', value: 'Clear' },
    { label: 'Caution', value: 'Caution' },
    { label: 'Action needed', value: 'Action needed' },
    { label: 'Lapsed', value: 'Lapsed' },
    { label: 'Incomplete', value: 'Incomplete' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4 bg-[#1B2126]/75 backdrop-blur-[2px] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="date-scrubber-modal"
        className="w-full max-w-lg bg-white border border-[#14212E]/20 rounded-[6px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto sm:my-0 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-[#1B2126] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-[#C1501C] shrink-0" />
            <h2 className="font-['Archivo'] font-extrabold text-[15.5px] sm:text-[17px] text-white truncate">
              Compliance Timeline &amp; Date Check
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Date Check Modal"
            className="p-1.5 rounded text-[#A3AFB8] hover:text-white hover:bg-[#273037] transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          
          {/* As-Of Date Input */}
          <div>
            <label htmlFor="as-of-date-input" className="block font-mono text-[11px] sm:text-[11.5px] uppercase font-semibold text-[#4C5A67] mb-1.5">
              Simulated Verification Date (As-Of Date)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="as-of-date-input"
                type="date"
                value={currentAsOfDate}
                onChange={(e) => onChangeAsOfDate(e.target.value)}
                className="w-full font-mono text-[13.5px] sm:text-[14px] bg-[#EAEEEE] border border-[#14212E]/20 rounded px-3 py-2 text-[#16222C] focus:outline-none focus:ring-1 focus:ring-[#C1501C]"
              />
              <button
                type="button"
                onClick={onReset}
                className="p-2.5 bg-[#EAEEEE] hover:bg-[#DCE3E3] active:bg-[#C9D6D6] border border-[#14212E]/20 rounded text-[#4C5A67] transition-colors shrink-0 touch-manipulation"
                title="Reset to original date"
                aria-label="Reset date"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11.5px] sm:text-[12px] text-[#7C8D99] mt-1.5 font-mono">
              Certificate Valid: <span className="font-semibold text-[#16222C]">{certValidToISO}</span> &middot; Registry Expiry: <span className="font-semibold text-[#16222C]">{registrationExpiryISO}</span>
            </p>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block font-mono text-[11px] sm:text-[11.5px] uppercase font-semibold text-[#4C5A67] mb-2">
              Quick Timeline Milestones
            </span>
            <div className="space-y-1.5">
              {presets.map((p) => (
                <button
                  key={p.date}
                  type="button"
                  onClick={() => onChangeAsOfDate(p.date)}
                  className={`w-full text-left font-mono text-[11.5px] sm:text-[12px] p-2.5 rounded transition-colors flex items-center justify-between gap-2 touch-manipulation ${
                    currentAsOfDate === p.date
                      ? 'bg-[#1B2126] text-white font-semibold'
                      : 'bg-[#EAEEEE]/70 hover:bg-[#EAEEEE] text-[#16222C] border border-[#14212E]/10'
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  <span className="text-[10.5px] opacity-75 shrink-0">{p.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Forced State Override */}
          <div>
            <span className="block font-mono text-[11px] sm:text-[11.5px] uppercase font-semibold text-[#4C5A67] mb-2">
              Override State Preview (Test UI Themes)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {verdicts.map((v) => {
                const isSelected = (v.value === null && !forcedVerdict) || (forcedVerdict === v.value);
                return (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => onSetForcedVerdict(v.value)}
                    className={`font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[.04em] px-2 py-2 rounded transition-all flex items-center justify-center gap-1.5 touch-manipulation ${
                      isSelected
                        ? 'bg-[#9C3E14] text-white font-bold ring-2 ring-[#C1501C]'
                        : 'bg-[#EAEEEE] hover:bg-[#DCE3E3] text-[#4C5A67] border border-[#14212E]/10'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#EAEEEE] border-t border-[#14212E]/12 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#1B2126] hover:bg-[#313C44] active:bg-[#0E1215] text-white rounded font-mono text-[12px] uppercase tracking-[.06em] transition-colors touch-manipulation"
          >
            Apply &amp; View Record
          </button>
        </div>
      </div>
    </div>
  );
};
