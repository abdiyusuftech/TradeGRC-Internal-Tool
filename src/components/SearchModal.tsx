import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { searchCompliance, SelfSearchMatch } from '../lib/api';

// Repurposed from an early mock-data "browse all records" modal (CLAUDE.md Section 6.3) into the
// real self-search entry point: an inline form on the home page, not an overlay. It calls the live
// /api/search endpoint and either navigates straight to a single match (or the record created on a
// miss — see api/search.ts, no separate "no match" state) or shows a disambiguation list.

const JURISDICTIONS = ['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'US'] as const;

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'rate_limited'; message: string }
  | { kind: 'disambiguate'; matches: SelfSearchMatch[]; term: string; jurisdiction: string };

export const SearchModal: React.FC = () => {
  const navigate = useNavigate();
  const [tradeName, setTradeName] = useState('');
  const [jurisdiction, setJurisdiction] = useState<string>('Ontario');
  const [state, setState] = useState<SearchState>({ kind: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tradeName.trim();
    if (!trimmed) return;

    setState({ kind: 'loading' });
    const result = await searchCompliance(trimmed, jurisdiction);

    if (result.kind === 'error') {
      setState({ kind: 'error', message: result.message });
      return;
    }
    if (result.kind === 'rate_limited') {
      setState({ kind: 'rate_limited', message: result.message });
      return;
    }
    if (result.matches.length === 1) {
      navigate(`/r/${result.matches[0].token}`);
      return;
    }
    setState({ kind: 'disambiguate', matches: result.matches, term: trimmed, jurisdiction });
  };

  return (
    <div id="self-search" className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 flex items-center gap-2.5 bg-white border border-[#14212E]/20 rounded-[6px] px-3.5 py-2.5">
          <Search className="w-4 h-4 text-[#7C8D99] shrink-0" />
          <input
            id="self-search-input"
            type="text"
            placeholder="Search by trade or business name…"
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            className="w-full bg-transparent text-[#16222C] placeholder-[#7C8D99] text-[14px] focus:outline-none"
          />
        </div>

        <select
          id="self-search-jurisdiction"
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="bg-white border border-[#14212E]/20 rounded-[6px] px-3 py-2.5 text-[13.5px] text-[#16222C] focus:outline-none"
        >
          {JURISDICTIONS.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        <button
          id="self-search-submit"
          type="submit"
          disabled={state.kind === 'loading' || tradeName.trim().length === 0}
          className="inline-flex items-center justify-center gap-1.5 bg-[#1B2126] hover:bg-[#273037] disabled:opacity-50 text-white font-mono text-[12.5px] tracking-[.05em] px-4 py-2.5 rounded-[6px] transition-colors touch-manipulation"
        >
          {state.kind === 'loading' ? 'Searching…' : 'Search'}
        </button>
      </form>

      {state.kind === 'error' && (
        <p className="mt-3 text-[13px] text-[#9C3E14]">Something went wrong: {state.message}. Try again.</p>
      )}

      {state.kind === 'rate_limited' && (
        <p className="mt-3 text-[13px] text-[#4C5A67]">{state.message}</p>
      )}

      {state.kind === 'disambiguate' && (
        <div id="self-search-disambiguation" className="mt-4 bg-white border border-[#14212E]/15 rounded-[6px] overflow-hidden">
          <p className="px-3.5 py-2.5 text-[13px] text-[#4C5A67] border-b border-[#14212E]/10">
            We found more than one match for &quot;{state.term}&quot; in {state.jurisdiction}. Select your business:
          </p>
          <div className="divide-y divide-[#14212E]/10">
            {state.matches.map((m) => (
              <button
                key={m.token}
                type="button"
                onClick={() => navigate(`/r/${m.token}`)}
                className="w-full text-left px-3.5 py-3 hover:bg-[#EAEEEE]/60 active:bg-[#EAEEEE] transition-colors flex items-center justify-between gap-3 group touch-manipulation"
              >
                <div className="min-w-0">
                  <div className="font-['Archivo'] font-bold text-[14.5px] text-[#1B2126] group-hover:text-[#9C3E14] truncate">
                    {m.tradeName}
                  </div>
                  {m.address && <div className="text-[12.5px] text-[#4C5A67] mt-0.5 truncate">{m.address}</div>}
                </div>
                <ArrowRight className="w-4 h-4 text-[#7C8D99] group-hover:text-[#9C3E14] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
