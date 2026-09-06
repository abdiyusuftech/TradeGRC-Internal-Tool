import type { VercelRequest, VercelResponse } from '@vercel/node';

// POST /api/search — self-search entry point (CLAUDE.md Section 6.3). Same server-side-only-PAT
// pattern as api/records/[token].ts: the Airtable credential never reaches the client. Unlike that
// endpoint, this one writes — it can create a new Compliance Records entry on a zero-match search,
// and always logs the attempt to Compliance Lookup Events.
//
// Field IDs and select-option values below were pulled directly from the live base
// (appQsa08HTuHcviRm) via the Airtable API, same as the read proxy. See CLAUDE.md Section 3.2/6.3.

const BASE_ID = 'appQsa08HTuHcviRm';
const RECORDS_TABLE_ID = 'tblmhPHCx6bR8rxgJ';
const EVENTS_TABLE_ID = 'tblkHlmx3wLsiHjTP';

const RECORD_FIELD = {
  tradeName: 'fldZRgy67LgPvDb3Z',
  address: 'fldrmHCm7dAqitMb9',
  jurisdiction: 'fldv5Rh1GakCUOYzX',
  lookupStatus: 'fldzfg62obfeWK3Qj',
  entryChannel: 'fldHyu4DoQwsSSSuS',
} as const;

const EVENT_FIELD = {
  description: 'fld1AJ4ALuniR3rxT',
  complianceRecord: 'fldB8EeDBu0WGKox6',
  eventType: 'fldDmq8iGFXLU2jr2',
  outcomeNotes: 'fld5KcgINugge7g8G',
  statusAfterEvent: 'fldY1PcJ4HdqL2QhF',
} as const;

// Matches the live Jurisdiction field's five options exactly (CLAUDE.md Section 3.2/10).
const JURISDICTIONS = new Set(['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'US']);

function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ');
}

// CLAUDE.md Section 6.3: exact or bidirectional prefix, never fuzzy — deliberately biased toward
// misses over a wrong-business match.
function isNameMatch(inputNorm: string, storedNorm: string): boolean {
  if (!inputNorm || !storedNorm) return false;
  return inputNorm === storedNorm || inputNorm.startsWith(storedNorm) || storedNorm.startsWith(inputNorm);
}

type AirtableFieldsById = Record<string, unknown>;

interface AirtableRecord {
  id: string;
  fields: AirtableFieldsById;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

function field(fields: AirtableFieldsById, id: string): string | null {
  const value = fields[id];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

async function airtableFetch(path: string, pat: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`https://api.airtable.com/v0/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Airtable request failed: ${res.status} ${await res.text()}`);
  }
  return res;
}

// Fetches every Compliance Records row (name/address/jurisdiction only) and filters client-side —
// the live base is a handful of sparse test records today (CLAUDE.md Section 9.7), so a full scan
// is cheap; paginated in case that changes.
async function listCandidateRecords(pat: string, jurisdiction: string): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = [];
  let offset: string | undefined;
  const fieldsQuery = [RECORD_FIELD.tradeName, RECORD_FIELD.address, RECORD_FIELD.jurisdiction]
    .map((id) => `fields[]=${id}`)
    .join('&');

  do {
    const offsetParam = offset ? `&offset=${offset}` : '';
    const res = await airtableFetch(
      `${BASE_ID}/${RECORDS_TABLE_ID}?returnFieldsByFieldId=true&${fieldsQuery}${offsetParam}`,
      pat
    );
    const body = (await res.json()) as AirtableListResponse;
    records.push(...body.records);
    offset = body.offset;
  } while (offset);

  return records.filter((r) => field(r.fields, RECORD_FIELD.jurisdiction) === jurisdiction);
}

async function createSelfSearchRecord(pat: string, tradeName: string, jurisdiction: string): Promise<AirtableRecord> {
  const res = await airtableFetch(`${BASE_ID}/${RECORDS_TABLE_ID}?returnFieldsByFieldId=true`, pat, {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        [RECORD_FIELD.tradeName]: tradeName,
        [RECORD_FIELD.jurisdiction]: jurisdiction,
        [RECORD_FIELD.lookupStatus]: 'Not Started',
        [RECORD_FIELD.entryChannel]: 'Self-Search',
      },
    }),
  });
  return (await res.json()) as AirtableRecord;
}

// User (fldZy8pydfuNMYRPq) deliberately left unset — no real Airtable user is behind an anonymous
// public search (CLAUDE.md Section 6.3).
async function logSearchEvent(
  pat: string,
  recordIds: string[],
  description: string,
  outcomeNotes: string,
  statusAfterEvent: string | null
): Promise<void> {
  const fields: AirtableFieldsById = {
    [EVENT_FIELD.description]: description,
    [EVENT_FIELD.complianceRecord]: recordIds,
    [EVENT_FIELD.eventType]: 'Search',
    [EVENT_FIELD.outcomeNotes]: outcomeNotes,
  };
  if (statusAfterEvent) {
    fields[EVENT_FIELD.statusAfterEvent] = statusAfterEvent;
  }
  await airtableFetch(`${BASE_ID}/${EVENTS_TABLE_ID}?returnFieldsByFieldId=true`, pat, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
}

interface SearchMatch {
  token: string;
  tradeName: string;
  address: string | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pat = process.env.AIRTABLE_PAT;
  if (!pat) {
    res.status(500).json({ error: 'AIRTABLE_PAT is not configured' });
    return;
  }

  const body = (req.body ?? {}) as { tradeName?: unknown; jurisdiction?: unknown };
  const { tradeName, jurisdiction } = body;

  if (typeof tradeName !== 'string' || tradeName.trim().length === 0) {
    res.status(400).json({ error: 'tradeName is required' });
    return;
  }
  if (typeof jurisdiction !== 'string' || !JURISDICTIONS.has(jurisdiction)) {
    res.status(400).json({ error: 'jurisdiction is invalid' });
    return;
  }

  const trimmedTradeName = tradeName.trim();
  const inputNorm = normalizeName(trimmedTradeName);

  try {
    const candidates = await listCandidateRecords(pat, jurisdiction);
    const matches: SearchMatch[] = candidates
      .filter((r) => isNameMatch(inputNorm, normalizeName(field(r.fields, RECORD_FIELD.tradeName) ?? '')))
      .map((r) => ({
        token: r.id,
        tradeName: field(r.fields, RECORD_FIELD.tradeName) ?? trimmedTradeName,
        address: field(r.fields, RECORD_FIELD.address),
      }));

    if (matches.length === 0) {
      // Zero matches: create the record and hand back its token like any other single match — the
      // frontend redirects straight to /r/:token, which renders through the existing gated page
      // unchanged (no unconsented record has real findings to show anyway). No separate "no match"
      // copy or state (CLAUDE.md Section 6.3, as corrected before this build).
      const created = await createSelfSearchRecord(pat, trimmedTradeName, jurisdiction);
      await logSearchEvent(
        pat,
        [created.id],
        `Self-search: "${trimmedTradeName}" in ${jurisdiction}`,
        '0 matches — new record created',
        'Not Yet Checked'
      );
      res.status(200).json({ matches: [{ token: created.id, tradeName: trimmedTradeName, address: null }] });
      return;
    }

    await logSearchEvent(
      pat,
      matches.map((m) => m.token),
      `Self-search: "${trimmedTradeName}" in ${jurisdiction}`,
      `${matches.length} match${matches.length === 1 ? '' : 'es'}`,
      null
    );
    res.status(200).json({ matches });
  } catch (err) {
    console.error('Self-search failed', err);
    res.status(502).json({ error: 'Search failed' });
  }
}
