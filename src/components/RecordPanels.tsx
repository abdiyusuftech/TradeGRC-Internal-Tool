import React from 'react';
import { Check, AlertCircle, HelpCircle, Copy, CheckCheck } from 'lucide-react';
import { ComplianceRecordView } from '../types';
import { splitCodeGloss } from '../utils/compliance';
import { WsibLogo, OntarioTrilliumLogo } from './Logos';

interface RecordPanelsProps {
  record: ComplianceRecordView;
  onCopyText?: (text: string, label: string) => void;
  copiedLabel?: string | null;
}

function StatusRow({ label, rawValue, category }: { label: string; rawValue: string | null; category: string }) {
  const color = category === 'clear' ? '#2F6B4F' : category === 'flagged' ? '#9C3E14' : '#4C5A67';
  const Icon = category === 'clear' ? Check : category === 'flagged' ? AlertCircle : HelpCircle;
  return (
    <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
      <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">{label}</span>
      <div className="font-semibold leading-[1.45] flex items-start gap-1.5" style={{ color }}>
        <Icon className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
        <span>{rawValue ?? 'Not on file'}</span>
      </div>
    </div>
  );
}

export const RecordPanels: React.FC<RecordPanelsProps> = ({ record, onCopyText, copiedLabel }) => {
  const naics = record.naicsCode ? splitCodeGloss(record.naicsCode) : null;

  const handleCopy = (text: string, label: string) => {
    if (onCopyText) {
      onCopyText(text, label);
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div id="public-records-grid" className="mt-8 sm:mt-9 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
      {/* ================= PANEL 1: WSIB CLEARANCES ================= */}
      <div
        id="panel-wsib-clearances"
        className="relative bg-white border border-[#14212E]/12 rounded-[3px] p-[20px_14px_14px] sm:p-[22px_18px_14px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] page-break"
      >
        <span className="absolute -top-[13px] left-4 bg-[#1B2126] text-[#EAEEEE] font-mono text-[11px] tracking-[.07em] uppercase px-2.5 py-1 rounded-t-[5px]">
          Record as filed
        </span>

        <div className="flex items-center gap-2 pb-2.5 border-b border-[#14212E]/20">
          <WsibLogo className="w-5 h-5 shrink-0" />
          <span className="font-['Archivo'] font-bold text-[14px] sm:text-[14.5px] tracking-[.01em] uppercase text-[#1B2126]">
            WSIB Clearances
          </span>
        </div>

        <div className="divide-y divide-dashed divide-[#14212E]/14 text-[13.5px] sm:text-[14px]">
          {record.legalName && (
            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
              <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">Legal name</span>
              <span className="font-semibold text-[#16222C] leading-[1.45] break-words">{record.legalName}</span>
            </div>
          )}

          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">Trade name</span>
            <span className="font-semibold text-[#16222C] leading-[1.45] break-words">{record.tradeName}</span>
          </div>

          {record.address && (
            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
              <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">Address</span>
              <span className="text-[#16222C] leading-[1.45] break-words">{record.address}</span>
            </div>
          )}

          {naics && (
            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
              <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">Industry</span>
              <div className="leading-[1.45]">
                <div className="break-words">
                  {naics.code && <span className="font-mono font-semibold">{naics.code}</span>}
                  {naics.code && ' — '}
                  <span className="text-[#16222C]">{naics.gloss}</span>
                </div>
                <span className="block text-[12px] sm:text-[12.5px] text-[#7C8D99] mt-0.5">
                  NAICS code the registry files you under
                </span>
              </div>
            </div>
          )}

          {record.wsib.field.category !== 'blocked' && (
            <StatusRow label="Status" rawValue={record.wsib.field.rawValue} category={record.wsib.field.category} />
          )}

          {record.wsib.field.category === 'blocked' && (
            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
              <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">Status</span>
              <span className="text-[#7C8D99] italic leading-[1.45]">
                No match under this name — see &quot;what happens next&quot; below.
              </span>
            </div>
          )}

          {record.wsib.certificateNumber && (
            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
              <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">Certificate</span>
              <div className="leading-[1.45] flex items-center justify-between gap-2">
                <div>
                  <div className="font-mono font-semibold text-[#16222C] inline-flex items-center gap-1.5 break-all">
                    <span>{record.wsib.certificateNumber}</span>
                  </div>
                  {record.wsib.expiryDate && (
                    <div className="text-[12.5px] sm:text-[13.5px] text-[#4C5A67]">Valid until {record.wsib.expiryDate}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(record.wsib.certificateNumber!, 'WSIB Certificate')}
                  className="no-print p-2 sm:p-1.5 hover:bg-[#EAEEEE] active:bg-[#DCE3E3] rounded text-[#7C8D99] hover:text-[#16222C] transition-colors touch-manipulation"
                  title="Copy Certificate Number"
                  aria-label="Copy Certificate Number"
                >
                  {copiedLabel === 'WSIB Certificate' ? (
                    <CheckCheck className="w-4 h-4 text-[#2F6B4F]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= PANEL 2: ONTARIO BUSINESS REGISTRY ================= */}
      <div
        id="panel-ontario-registry"
        className="relative bg-white border border-[#14212E]/12 rounded-[3px] p-[20px_14px_14px] sm:p-[22px_18px_14px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] page-break"
      >
        <span className="absolute -top-[13px] left-4 bg-[#1B2126] text-[#EAEEEE] font-mono text-[11px] tracking-[.07em] uppercase px-2.5 py-1 rounded-t-[5px]">
          Record as filed
        </span>

        <div className="flex items-center gap-2 pb-2.5 border-b border-[#14212E]/20">
          <OntarioTrilliumLogo className="w-5 h-5 shrink-0" />
          <span className="font-['Archivo'] font-bold text-[14px] sm:text-[14.5px] tracking-[.01em] uppercase text-[#1B2126]">
            Ontario Business Registry
          </span>
        </div>

        <div className="divide-y divide-dashed divide-[#14212E]/14 text-[13.5px] sm:text-[14px]">
          {record.corporate.field.category === 'blocked' ? (
            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
              <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">Status</span>
              <span className="text-[#7C8D99] italic leading-[1.45]">
                Search could not run — WSIB had no match, so no legal name was available. See &quot;what happens next&quot; below.
              </span>
            </div>
          ) : (
            <>
              {record.corporate.businessNameBin && (
                <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
                  <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">BIN</span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="leading-[1.45]">
                      <div className="font-mono font-semibold text-[#16222C] break-all">{record.corporate.businessNameBin}</div>
                      <span className="block text-[12px] sm:text-[12.5px] text-[#7C8D99]">Business identification number</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(record.corporate.businessNameBin!, 'BIN')}
                      className="no-print p-2 sm:p-1.5 hover:bg-[#EAEEEE] active:bg-[#DCE3E3] rounded text-[#7C8D99] hover:text-[#16222C] transition-colors touch-manipulation"
                      title="Copy BIN"
                      aria-label="Copy BIN"
                    >
                      {copiedLabel === 'BIN' ? <CheckCheck className="w-4 h-4 text-[#2F6B4F]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {record.corporate.registryReference && (
                <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
                  <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">Reference</span>
                  <span className="font-mono text-[#16222C] leading-[1.45] break-all">{record.corporate.registryReference}</span>
                </div>
              )}

              {record.corporate.businessNameRegistrationStatus && (
                <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
                  <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
                    Trade name reg.
                  </span>
                  <div className="leading-[1.45]">
                    <span className="text-[#16222C]">{record.corporate.businessNameRegistrationStatus}</span>
                    <span className="block text-[12px] sm:text-[12.5px] text-[#7C8D99] mt-0.5">
                      The trade name's own registration cycle — separate from the corporation's standing below.
                    </span>
                  </div>
                </div>
              )}

              <StatusRow
                label="Corporate status"
                rawValue={record.corporate.field.rawValue}
                category={record.corporate.field.category}
              />

              {record.corporate.expiryDate && (
                <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
                  <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">Renewal</span>
                  <span className="text-[#16222C] leading-[1.45]">{record.corporate.expiryDate}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
