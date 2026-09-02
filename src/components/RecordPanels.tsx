import React from 'react';
import { Check, AlertCircle, Info, Copy, CheckCheck } from 'lucide-react';
import { ContractorRecord } from '../types';
import { splitCodeGloss } from '../utils/compliance';
import { WsibLogo, OntarioTrilliumLogo } from './Logos';

interface RecordPanelsProps {
  record: ContractorRecord;
  onCopyText?: (text: string, label: string) => void;
  copiedLabel?: string | null;
}

export const RecordPanels: React.FC<RecordPanelsProps> = ({
  record,
  onCopyText,
  copiedLabel
}) => {
  const cls = splitCodeGloss(record.classSubclass, 'G5: Specialty trades construction');
  const naics = splitCodeGloss(record.naicsWsib, '238330: Flooring contractors');
  const act = splitCodeGloss(record.primaryActivity, '23839: Other building finishing contractors');

  const isAcctEligible = /eligible|active|good/i.test(record.accountStatus);
  const isRegActive = /active|registered|good/i.test(record.registryStatus);

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
        {/* Top Tab Pin */}
        <span className="absolute -top-[13px] left-4 bg-[#1B2126] text-[#EAEEEE] font-mono text-[11px] tracking-[.07em] uppercase px-2.5 py-1 rounded-t-[5px]">
          Record as filed
        </span>

        {/* Panel Header */}
        <div className="flex items-baseline justify-between gap-3 flex-wrap pb-2.5 border-b border-[#14212E]/20">
          <div className="flex items-center gap-2">
            <WsibLogo className="w-5 h-5 shrink-0" />
            <span className="font-['Archivo'] font-bold text-[14px] sm:text-[14.5px] tracking-[.01em] uppercase text-[#1B2126]">
              WSIB Clearances
            </span>
          </div>
          <span className="font-mono text-[10.5px] sm:text-[11px] tracking-[.05em] uppercase text-[#7C8D99]">
            Looked up {record.wsibStamp}
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-dashed divide-[#14212E]/14 text-[13.5px] sm:text-[14px]">
          
          {/* Legal Name */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Legal name
            </span>
            <span className="font-semibold text-[#16222C] leading-[1.45] break-words">
              {record.legalName}
            </span>
          </div>

          {/* Trade Name */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Trade name
            </span>
            <span className="font-semibold text-[#16222C] leading-[1.45] break-words">
              {record.tradeName}
            </span>
          </div>

          {/* Address */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Address
            </span>
            <span className="text-[#16222C] leading-[1.45] break-words">
              {record.address}
            </span>
          </div>

          {/* Class */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Class
            </span>
            <span className="text-[#16222C] leading-[1.45] break-words">
              {cls.code && <span className="font-mono font-semibold">{cls.code}</span>}
              {cls.code && ' — '}
              <span>{cls.gloss}</span>
            </span>
          </div>

          {/* Industry */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Industry
            </span>
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

          {/* Account Status */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Account
            </span>
            <div
              className="font-semibold leading-[1.45] flex items-start gap-1.5"
              style={{ color: isAcctEligible ? '#2F6B4F' : '#9C3E14' }}
            >
              {isAcctEligible ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
              )}
              <span>{record.accountStatus}</span>
            </div>
          </div>

          {/* Certificate */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Certificate
            </span>
            <div className="leading-[1.45] flex items-center justify-between gap-2">
              <div>
                <div className="font-mono font-semibold text-[#16222C] inline-flex items-center gap-1.5 break-all">
                  <span>{record.certNumber}</span>
                </div>
                <div className="text-[12.5px] sm:text-[13.5px] text-[#4C5A67]">
                  Valid {record.certValidFrom} &ndash; {record.certValidTo}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(record.certNumber, 'WSIB Certificate')}
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

        </div>
      </div>

      {/* ================= PANEL 2: ONTARIO BUSINESS REGISTRY ================= */}
      <div 
        id="panel-ontario-registry" 
        className="relative bg-white border border-[#14212E]/12 rounded-[3px] p-[20px_14px_14px] sm:p-[22px_18px_14px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] page-break"
      >
        {/* Top Tab Pin */}
        <span className="absolute -top-[13px] left-4 bg-[#1B2126] text-[#EAEEEE] font-mono text-[11px] tracking-[.07em] uppercase px-2.5 py-1 rounded-t-[5px]">
          Record as filed
        </span>

        {/* Panel Header */}
        <div className="flex items-baseline justify-between gap-3 flex-wrap pb-2.5 border-b border-[#14212E]/20">
          <div className="flex items-center gap-2">
            <OntarioTrilliumLogo className="w-5 h-5 shrink-0" />
            <span className="font-['Archivo'] font-bold text-[14px] sm:text-[14.5px] tracking-[.01em] uppercase text-[#1B2126]">
              Ontario Business Registry
            </span>
          </div>
          <span className="font-mono text-[10.5px] sm:text-[11px] tracking-[.05em] uppercase text-[#7C8D99]">
            Looked up {record.onbisStamp}
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-dashed divide-[#14212E]/14 text-[13.5px] sm:text-[14px]">
          
          {/* Business Name */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Business name
            </span>
            <span className="font-semibold text-[#16222C] leading-[1.45] break-words">
              {record.businessName}
            </span>
          </div>

          {/* BIN */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              BIN
            </span>
            <div className="flex items-center justify-between gap-2">
              <div className="leading-[1.45]">
                <div className="font-mono font-semibold text-[#16222C] break-all">
                  {record.bin}
                </div>
                <span className="block text-[12px] sm:text-[12.5px] text-[#7C8D99]">
                  Business identification number
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(record.bin, 'BIN')}
                className="no-print p-2 sm:p-1.5 hover:bg-[#EAEEEE] active:bg-[#DCE3E3] rounded text-[#7C8D99] hover:text-[#16222C] transition-colors touch-manipulation"
                title="Copy BIN"
                aria-label="Copy BIN"
              >
                {copiedLabel === 'BIN' ? (
                  <CheckCheck className="w-4 h-4 text-[#2F6B4F]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Type */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Type
            </span>
            <span className="text-[#16222C] leading-[1.45] break-words">
              {record.businessType}
            </span>
          </div>

          {/* Registered */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Registered
            </span>
            <span className="text-[#16222C] leading-[1.45] break-words">
              {record.registrationDate} &ndash; {record.registrationExpiry}
            </span>
          </div>

          {/* Activity */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Activity
            </span>
            <span className="text-[#16222C] leading-[1.45] break-words">
              {act.code && <span className="font-mono font-semibold">{act.code}</span>}
              {act.code && ' — '}
              <span>{act.gloss}</span>
            </span>
          </div>

          {/* Registry Status */}
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-x-3.5 py-2">
            <span className="font-mono text-[11px] tracking-[.05em] uppercase text-[#4C5A67] pt-0.5">
              Status
            </span>
            <div
              className="font-semibold leading-[1.45] flex items-start gap-1.5"
              style={{ color: isRegActive ? '#2F6B4F' : '#9C3E14' }}
            >
              {isRegActive ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
              )}
              <span>{record.registryStatus}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
