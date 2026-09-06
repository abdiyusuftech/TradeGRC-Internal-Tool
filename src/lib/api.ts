// Client-side shape of GET /api/records/:token's response. Kept as a separate, hand-written
// mirror of api/records/[token].ts's ComplianceRecordResult rather than a cross-import, so the
// frontend bundle never pulls in anything from the server-only api/ directory. If the proxy's
// response shape changes, this must be updated to match.

export interface WsibFieldsResponse {
  status: string | null;
  certificateNumber: string | null;
  expiryDate: string | null;
  footnote: string | null;
}

export interface CorporateFieldsResponse {
  status: string | null;
  registryReference: string | null;
  businessNameBin: string | null;
  businessNameRegistrationStatus: string | null;
  expiryDate: string | null;
  footnote: string | null;
}

export interface ComplianceRecordApiOk {
  status: 'ok';
  tradeName: string;
  legalName: string | null;
  address: string | null;
  naicsCode: string | null;
  jurisdiction: string | null;
  dateChecked: string | null;
  wsib: WsibFieldsResponse;
  corporate: CorporateFieldsResponse;
}

type ComplianceRecordApiResponse = ComplianceRecordApiOk | { status: 'gated'; tradeName: string };

export type FetchComplianceRecordResult =
  | { kind: 'ok'; data: ComplianceRecordApiOk }
  | { kind: 'gated'; tradeName: string }
  | { kind: 'not_found' }
  | { kind: 'error'; message: string };

export async function fetchComplianceRecord(token: string): Promise<FetchComplianceRecordResult> {
  try {
    const res = await fetch(`/api/records/${encodeURIComponent(token)}`);
    if (res.status === 404) return { kind: 'not_found' };
    if (!res.ok) return { kind: 'error', message: `Lookup failed (${res.status})` };
    const body = (await res.json()) as ComplianceRecordApiResponse;
    if (body.status === 'gated') return { kind: 'gated', tradeName: body.tradeName };
    return { kind: 'ok', data: body };
  } catch (err) {
    return { kind: 'error', message: err instanceof Error ? err.message : 'Network error' };
  }
}

// Client-side mirror of POST /api/search's response shape (CLAUDE.md Section 6.3). Same
// hand-written-mirror rationale as above — never importing from api/.
export interface SelfSearchMatch {
  token: string;
  tradeName: string;
  address: string | null;
}

export type SelfSearchResult =
  | { kind: 'ok'; matches: SelfSearchMatch[] }
  | { kind: 'error'; message: string };

export async function searchCompliance(tradeName: string, jurisdiction: string): Promise<SelfSearchResult> {
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tradeName, jurisdiction }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const message = body && typeof body.error === 'string' ? body.error : `Search failed (${res.status})`;
      return { kind: 'error', message };
    }
    return { kind: 'ok', matches: (body as { matches: SelfSearchMatch[] }).matches };
  } catch (err) {
    return { kind: 'error', message: err instanceof Error ? err.message : 'Network error' };
  }
}
