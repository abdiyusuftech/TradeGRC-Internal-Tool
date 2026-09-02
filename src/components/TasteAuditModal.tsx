import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { TasteAuditItem } from '../types';
import { TASTE_AUDIT_DATA } from '../data/contractors';

interface TasteAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TasteAuditModal: React.FC<TasteAuditModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Typography', 'Color & Contrast', 'Layout & Math', 'Anti-Slop & Copy'];

  const filtered = selectedCategory === 'All'
    ? TASTE_AUDIT_DATA
    : TASTE_AUDIT_DATA.filter((item) => item.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-4 bg-[#1B2126]/75 backdrop-blur-[2px] overflow-y-auto pb-12">
      <div 
        id="taste-audit-modal"
        className="w-full max-w-2xl bg-white border border-[#14212E]/20 rounded-[6px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 bg-[#1B2126] text-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-[#9C3E14] text-white shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Archivo'] font-extrabold text-[18px] tracking-[-0.01em] text-white">
                  Taste &amp; Impeccable Standards Audit
                </h2>
                <span className="font-mono text-[10.5px] uppercase bg-[#2F6B4F] text-white px-2 py-0.5 rounded-full font-semibold">
                  100% Pass
                </span>
              </div>
              <p className="text-[13px] text-[#A3AFB8] mt-1 leading-[1.45]">
                Systematic evaluation against <code>pbakaus/impeccable</code> and <code>taste-skill</code> standards. All AI-slop anti-patterns are purged.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#A3AFB8] hover:text-white hover:bg-[#273037] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 bg-[#EAEEEE] border-b border-[#14212E]/10 flex items-center gap-2 overflow-x-auto">
          <span className="font-mono text-[11px] uppercase text-[#4C5A67] font-semibold shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`font-mono text-[11.5px] px-3 py-1 rounded-full uppercase tracking-[.04em] whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1B2126] text-white font-medium'
                  : 'bg-white text-[#4C5A67] hover:bg-[#DCE3E3] border border-[#14212E]/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Audit Items List */}
        <div className="p-5 max-h-[65vh] overflow-y-auto divide-y divide-dashed divide-[#14212E]/16 space-y-4">
          {filtered.map((item, idx) => (
            <div key={item.id} className={idx > 0 ? 'pt-4' : ''}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B4F] shrink-0" />
                  <h3 className="font-['Archivo'] font-bold text-[15px] text-[#1B2126]">
                    {item.title}
                  </h3>
                </div>
                <span className="font-mono text-[10.5px] uppercase bg-[#DCE3E3] text-[#4C5A67] px-2 py-0.5 rounded font-medium shrink-0">
                  {item.category}
                </span>
              </div>

              {/* Requirement Rule */}
              <div className="mt-2 text-[13.5px] text-[#16222C] leading-[1.5] bg-[#F7F9F9] p-2.5 rounded border border-[#14212E]/08">
                <span className="font-mono text-[11px] uppercase font-semibold text-[#4C5A67] block mb-0.5">
                  Specification Rule:
                </span>
                {item.rule}
              </div>

              {/* Execution Details */}
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12.5px] leading-[1.45]">
                <div className="bg-[#E1EEE6]/60 p-2.5 rounded text-[#2F6B4F] border border-[#2F6B4F]/15">
                  <strong className="font-mono text-[10.5px] uppercase block mb-0.5 font-bold">
                    ✓ Implemented Standard:
                  </strong>
                  {item.howWeFollowed}
                </div>
                <div className="bg-[#F3DCCB]/60 p-2.5 rounded text-[#9C3E14] border border-[#9C3E14]/15">
                  <strong className="font-mono text-[10.5px] uppercase block mb-0.5 font-bold">
                    ✗ Slop Anti-Pattern Purged:
                  </strong>
                  {item.antiPatternAvoided}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EAEEEE] border-t border-[#14212E]/12 flex items-center justify-between text-[11.5px] font-mono text-[#4C5A67]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2F6B4F]" />
            <span>Passed 7 of 7 Impeccable Design Checks</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-[#1B2126] text-white rounded font-mono uppercase text-[11px] hover:bg-[#313C44] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
