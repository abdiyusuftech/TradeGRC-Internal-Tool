import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { SAMPLE_CONTRACTORS } from './data/contractors';
import { ContractorRecord, ComplianceTier } from './types';
import { calculateRecordVerdict } from './utils/compliance';
import { Header } from './components/Header';
import { RecordHeader } from './components/RecordHeader';
import { VerdictBanner } from './components/VerdictBanner';
import { StatusBadges } from './components/StatusBadges';
import { RecordPanels } from './components/RecordPanels';
import { WhatHappensNext } from './components/WhatHappensNext';
import { SearchModal } from './components/SearchModal';
import { DateScrubberModal } from './components/DateScrubberModal';

// TODO: `token` currently matches ContractorRecord.id (the mock data's key). Once real data is
// wired in (CLAUDE.md Section 3.2), this route resolves against the live `Results Page Token` field instead.
export default function App() {
  return (
    <Routes>
      <Route path="/r/:token" element={<RecordPage />} />
      <Route path="*" element={<Navigate to={`/r/${SAMPLE_CONTRACTORS[0].id}`} replace />} />
    </Routes>
  );
}

function RecordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [contractors, setContractors] = useState<ContractorRecord[]>(SAMPLE_CONTRACTORS);
  const selectedRecordId = token ?? SAMPLE_CONTRACTORS[0].id;

  // Simulation and preview states
  const [currentAsOfDate, setCurrentAsOfDate] = useState<string>('2026-08-29');
  const [forcedVerdict, setForcedVerdict] = useState<string | null>(null);
  
  // Display settings
  const [showThreshold, setShowThreshold] = useState<boolean>(true);
  const [showScope, setShowScope] = useState<boolean>(true);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Copy feedback
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // Current active contractor
  const currentRecord = useMemo(() => {
    return contractors.find((c) => c.id === selectedRecordId) || contractors[0];
  }, [contractors, selectedRecordId]);

  // Dynamic calculated verdict
  const calculated = useMemo(() => {
    const res = calculateRecordVerdict(currentRecord, currentAsOfDate);

    if (forcedVerdict) {
      const forceMap: Record<string, { word: string; bg: string; spine: string; fg: string; line: string }> = {
        'Clear': {
          word: 'Clear',
          bg: '#E1EEE6',
          spine: '#E1EEE6',
          fg: '#2F6B4F',
          line: `Nothing needs action today. Next date on either record is ${currentRecord.certValidTo || '19-Nov-2026'}.`
        },
        'Caution': {
          word: 'Caution',
          bg: '#DCE3E3',
          spine: 'repeating-linear-gradient(180deg, #C1501C 0 7px, #DCE3E3 7px 12px)',
          fg: '#9C3E14',
          line: 'Both records stand, but a date is close enough to watch. See below.'
        },
        'Action needed': {
          word: 'Action needed',
          bg: '#F3DCCB',
          spine: '#C1501C',
          fg: '#9C3E14',
          line: 'One item needs attention before it lapses. See below.'
        },
        'Lapsed': {
          word: 'Lapsed',
          bg: '#F3DCCB',
          spine: '#C1501C',
          fg: '#9C3E14',
          line: 'A record has already expired and reads that way to anyone checking.'
        },
        'Incomplete': {
          word: 'Incomplete',
          bg: '#EAEEEE',
          spine: '#4C5A67',
          fg: '#4C5A67',
          line: 'A record could not be read at the time of this check.'
        }
      };

      if (forceMap[forcedVerdict]) {
        return {
          ...res,
          verdict: {
            ...res.verdict,
            ...forceMap[forcedVerdict]
          }
        };
      }
    }

    return res;
  }, [currentRecord, currentAsOfDate, forcedVerdict]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => {
      setCopiedLabel(null);
    }, 2000);
  };

  const handleSaveRecord = (updated: ContractorRecord) => {
    setContractors((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleResetToDefault = () => {
    const original = SAMPLE_CONTRACTORS.find((c) => c.id === currentRecord.id);
    if (original) {
      setContractors((prev) =>
        prev.map((c) => (c.id === original.id ? original : c))
      );
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#EAEEEE] text-[#16222C] flex flex-col font-sans">
      
      {/* Top Application Bar */}
      <Header
        currentRecord={currentRecord}
        contractors={contractors}
        onSelectContractor={(c) => {
          navigate(`/r/${c.id}`);
          setForcedVerdict(null);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onPrint={() => window.print()}
      />

      {/* Main Single Document Canvas */}
      <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 pb-20">
        
        {/* Document Header with Public Provenance */}
        <RecordHeader
          record={currentRecord}
          currentAsOfDate={currentAsOfDate}
        />

        {/* Overall Status Banner */}
        <VerdictBanner verdict={calculated.verdict} />

        {/* 2-Column Status Indicators */}
        <StatusBadges
          certPill={calculated.certPill}
          regPill={calculated.regPill}
          certDaysCopy={calculated.certDaysCopy}
          regDaysCopy={calculated.regDaysCopy}
          showThreshold={showThreshold}
        />

        {/* Dual Primary Public Record Panels */}
        <RecordPanels
          record={currentRecord}
          onCopyText={handleCopyText}
          copiedLabel={copiedLabel}
        />

        {/* What Happens Next & Legal Disclaimers */}
        <WhatHappensNext
          record={currentRecord}
          verdict={calculated.verdict}
          isUrgent={calculated.isUrgent}
          showScope={showScope}
        />

      </main>

      {/* Official Ledger Footer */}
      <footer className="bg-[#1B2126] text-[#A3AFB8] border-t border-[#2C343B] mt-auto">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap font-mono text-[11px] tracking-[.07em] uppercase">
          <span>&copy; {currentYear} TradeGRC</span>
          <div className="flex items-center gap-3">
            <span>Ref {currentRecord.reference} &nbsp;/&nbsp; TradeGRC-ON</span>
            <span className="hidden sm:inline text-[#7C8D99]">&bull;</span>
            <span className="hidden sm:inline text-[#7C8D99]">Public Record Engine</span>
          </div>
        </div>
      </footer>

      {/* Copy Notification Toast */}
      {copiedLabel && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B2126] text-white font-mono text-[12px] px-3.5 py-2 rounded shadow-lg border border-[#3A454E] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-[#2F6B4F]" />
          <span>Copied {copiedLabel} to clipboard</span>
        </div>
      )}

      {/* Interactive Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        contractors={contractors}
        onSelectContractor={(c) => {
          navigate(`/r/${c.id}`);
          setForcedVerdict(null);
        }}
      />

      <DateScrubberModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        currentAsOfDate={currentAsOfDate}
        onChangeAsOfDate={(d) => {
          setCurrentAsOfDate(d);
          setForcedVerdict(null);
        }}
        forcedVerdict={forcedVerdict}
        onSetForcedVerdict={setForcedVerdict}
        certValidToISO={currentRecord.certValidToISO}
        registrationExpiryISO={currentRecord.registrationExpiryISO}
        onReset={() => {
          setCurrentAsOfDate(currentRecord.checkedISO);
          setForcedVerdict(null);
        }}
      />

    </div>
  );
}
