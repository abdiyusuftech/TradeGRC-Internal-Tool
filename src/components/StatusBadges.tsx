import React from 'react';
import { FieldDisplay } from '../types';

interface StatusBadgesProps {
  wsibField: FieldDisplay;
  corporateField: FieldDisplay;
}

function FieldRow({ label, field }: { label: string; field: FieldDisplay }) {
  // "blocked" renders no badge at all (CLAUDE.md 8.1/8.2) — showing any color here would overstate
  // a search that never actually ran.
  if (field.category === 'blocked') {
    return (
      <div className="flex items-baseline gap-2 sm:gap-2.5 flex-wrap">
        <span className="text-[13.5px] sm:text-[14px] text-[#7C8D99] leading-[1.45] italic">
          <strong className="font-bold not-italic text-[#16222C]">{label}</strong> &mdash; could not be checked (see below)
        </span>
      </div>
    );
  }

  if (!field.pill) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2 sm:gap-2.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[11.5px] sm:text-[12px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors"
          style={{ backgroundColor: field.pill.bg, color: field.pill.fg }}
        >
          <span className="w-1.5 h-1.5 rounded-full block shrink-0" style={{ backgroundColor: field.pill.pip }} aria-hidden="true" />
          {field.pill.label}
        </span>
        <span className="text-[13.5px] sm:text-[14px] text-[#16222C] leading-[1.45]">
          <strong className="font-bold">{label}</strong> &mdash; {field.copy}
        </span>
      </div>
      {/* CLAUDE.md 8.1's fixed explanatory sentence, read straight from Airtable's footnote
          formula fields — not reimplemented locally. */}
      {field.footnote && (
        <p className="text-[12px] sm:text-[12.5px] text-[#4C5A67] leading-[1.5]">{field.footnote}</p>
      )}
    </div>
  );
}

export const StatusBadges: React.FC<StatusBadgesProps> = ({ wsibField, corporateField }) => {
  return (
    <div id="status-badges-section" className="mt-4 sm:mt-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <FieldRow label="WSIB clearance" field={wsibField} />
        <FieldRow label="Corporate standing" field={corporateField} />
      </div>

      {/* Threshold explanation, only when a field's CLEAR badge is actually tracking a real expiry
          date — a field can read category "clear" with no date on file at all (buildField's null-date
          fallback), and showing a day-count threshold for a date that doesn't exist would misrepresent
          it as being tracked. WSIB's ~42-day cycle and Corporate's ~5-year cycle use different bands
          (CLAUDE.md 9.4), so they're explained separately rather than under one shared line. */}
      {(wsibField.hasExpiryDate || corporateField.hasExpiryDate) && (
        <div className="font-mono text-[10.5px] sm:text-[11.5px] tracking-[.06em] uppercase text-[#4C5A67] mt-3 sm:mt-3.5 leading-[1.7] border-b border-dashed border-[#14212E]/10 pb-1 space-y-0.5">
          {wsibField.hasExpiryDate && (
            <div className="flex flex-wrap gap-x-1.5">
              <span>WSIB threshold &mdash; </span>
              <span className="text-[#9C3E14] font-medium">under 10 days: address now</span>
              <span>&nbsp;/&nbsp;</span>
              <span className="text-[#4C5A67] font-medium">10&ndash;21 days: watch</span>
              <span>&nbsp;/&nbsp;</span>
              <span className="text-[#2F6B4F] font-medium">over 21 days: clear</span>
            </div>
          )}
          {corporateField.hasExpiryDate && (
            <div className="flex flex-wrap gap-x-1.5">
              <span>Corporate threshold &mdash; </span>
              <span className="text-[#9C3E14] font-medium">under 30 days: address now</span>
              <span>&nbsp;/&nbsp;</span>
              <span className="text-[#4C5A67] font-medium">30&ndash;90 days: watch</span>
              <span>&nbsp;/&nbsp;</span>
              <span className="text-[#2F6B4F] font-medium">over 90 days: clear</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
