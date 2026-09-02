import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { ComplianceRecordView } from './types';
import { fetchComplianceRecord } from './lib/api';
import { buildComplianceRecordView, buildOverallVerdict } from './utils/compliance';
import { Header } from './components/Header';
import { RecordHeader } from './components/RecordHeader';
import { VerdictBanner } from './components/VerdictBanner';
import { StatusBadges } from './components/StatusBadges';
import { RecordPanels } from './components/RecordPanels';
import { WhatHappensNext } from './components/WhatHappensNext';

export default function App() {
  return (
    <Routes>
      <Route path="/r/:token" element={<RecordPage />} />
      <Route path="*" element={<NoTokenPage />} />
    </Routes>
  );
}

function PageShell({ tradeName, children }: { tradeName: string; children: React.ReactNode }) {
  const currentYear = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-[#EAEEEE] text-[#16222C] flex flex-col font-sans">
      <Header tradeName={tradeName} onPrint={() => window.print()} />
      <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 pb-20">{children}</main>
      <footer className="bg-[#1B2126] text-[#A3AFB8] border-t border-[#2C343B] mt-auto">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap font-mono text-[11px] tracking-[.07em] uppercase">
          <span>&copy; {currentYear} TradeGRC</span>
          <span>Public Record Engine</span>
        </div>
      </footer>
    </div>
  );
}

function NoTokenPage() {
  return (
    <PageShell tradeName="TradeGRC">
      <div className="pt-16 sm:pt-24 max-w-[520px] mx-auto text-center">
        <h1 className="font-['Archivo'] font-extrabold text-[22px] sm:text-[26px] text-[#1B2126]">
          This link needs a record
        </h1>
        <p className="text-[14px] text-[#4C5A67] leading-[1.6] mt-3">
          Compliance records are reached through the individual link sent for that business. If you
          followed a link here and landed on this page instead, the link may be incomplete or out of
          date.
        </p>
      </div>
    </PageShell>
  );
}

function NotFoundPage() {
  return (
    <PageShell tradeName="TradeGRC">
      <div className="pt-16 sm:pt-24 max-w-[520px] mx-auto text-center">
        <h1 className="font-['Archivo'] font-extrabold text-[22px] sm:text-[26px] text-[#1B2126]">
          Record not found
        </h1>
        <p className="text-[14px] text-[#4C5A67] leading-[1.6] mt-3">
          This link doesn&apos;t match a record on file. Double-check the link, or reach out to
          whoever sent it to you.
        </p>
      </div>
    </PageShell>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <PageShell tradeName="TradeGRC">
      <div className="pt-16 sm:pt-24 max-w-[520px] mx-auto text-center">
        <h1 className="font-['Archivo'] font-extrabold text-[22px] sm:text-[26px] text-[#1B2126]">
          Lookup failed
        </h1>
        <p className="text-[14px] text-[#4C5A67] leading-[1.6] mt-3">
          Something went wrong reading this record. Try again in a moment.
        </p>
        <p className="text-[12px] text-[#7C8D99] mt-4 font-mono">{message}</p>
      </div>
    </PageShell>
  );
}

function LoadingPage() {
  return (
    <PageShell tradeName="TradeGRC">
      <div className="pt-16 sm:pt-24 max-w-[520px] mx-auto text-center">
        <p className="text-[14px] text-[#4C5A67]">Reading the public record…</p>
      </div>
    </PageShell>
  );
}

// CLAUDE.md Section 8.3: without consent, this page must never render a real WSIB or Corporate
// finding — only this warm, non-committal state. Never a dead page, never the actual status.
function GatedRecordPage({ tradeName }: { tradeName: string }) {
  return (
    <PageShell tradeName={tradeName}>
      <div className="pt-16 sm:pt-24 max-w-[560px] mx-auto text-center">
        <h1 className="font-['Archivo'] font-extrabold text-[22px] sm:text-[26px] text-[#1B2126]">
          {tradeName}
        </h1>
        <p className="text-[14px] text-[#4C5A67] leading-[1.6] mt-3">
          A compliance review is underway for this business. We&apos;ll be in touch once it&apos;s
          ready to share.
        </p>
      </div>
    </PageShell>
  );
}

type RecordPageState =
  | { kind: 'loading' }
  | { kind: 'not_found' }
  | { kind: 'gated'; tradeName: string }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; view: ComplianceRecordView };

function RecordPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<RecordPageState>({ kind: 'loading' });
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setState({ kind: 'loading' });

    fetchComplianceRecord(token).then((result) => {
      if (cancelled) return;
      if (result.kind === 'ok') {
        const todayISO = new Date().toISOString().slice(0, 10);
        setState({ kind: 'ok', view: buildComplianceRecordView(result.data, todayISO) });
      } else if (result.kind === 'gated') {
        setState({ kind: 'gated', tradeName: result.tradeName });
      } else if (result.kind === 'not_found') {
        setState({ kind: 'not_found' });
      } else {
        setState({ kind: 'error', message: result.message });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  if (state.kind === 'loading') return <LoadingPage />;
  if (state.kind === 'not_found') return <NotFoundPage />;
  if (state.kind === 'error') return <ErrorPage message={state.message} />;
  if (state.kind === 'gated') return <GatedRecordPage tradeName={state.tradeName} />;

  const { view } = state;
  const verdict = buildOverallVerdict(view);

  return (
    <PageShell tradeName={view.tradeName}>
      <RecordHeader record={view} />
      <VerdictBanner verdict={verdict} />
      <StatusBadges wsibField={view.wsib.field} corporateField={view.corporate.field} />
      <RecordPanels record={view} onCopyText={handleCopyText} copiedLabel={copiedLabel} />
      <WhatHappensNext verdict={verdict} />

      {copiedLabel && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B2126] text-white font-mono text-[12px] px-3.5 py-2 rounded shadow-lg border border-[#3A454E] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-[#2F6B4F]" />
          <span>Copied {copiedLabel} to clipboard</span>
        </div>
      )}
    </PageShell>
  );
}
