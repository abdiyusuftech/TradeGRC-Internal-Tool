// Client-side shape of GET /api/records/:token's response. Kept as a separate, hand-written
// mirror of api/lib/airtable.ts's ComplianceRecordResult rather than a cross-import, so the
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
