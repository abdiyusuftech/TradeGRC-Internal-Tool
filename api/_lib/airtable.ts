// Server-side only. Never imported by src/ — the Airtable PAT must never reach the client bundle.
// Field IDs and the consent-gate values below were confirmed directly against the live base
// (appQsa08HTuHcviRm, table tblmhPHCx6bR8rxgJ) via the Airtable API. See CLAUDE.md Section 3.2.

const BASE_ID = 'appQsa08HTuHcviRm';
const TABLE_ID = 'tblmhPHCx6bR8rxgJ';

const FIELD = {
  tradeName: 'fldZRgy67LgPvDb3Z',
  legalName: 'fldCimjSRh0sfJzsz',
  address: 'fldrmHCm7dAqitMb9',
  naicsCode: 'fld1LB81yR7iks9ax',
  wsibStatus: 'fldMlr2D1vxr5HuBK',
  wsibCertNumber: 'fldZlKTtEVt5epcfo',
  wsibExpiryDate: 'fldOP2iQoJBcAsJDw',
  wsibFootnote: 'fldmR2O52xbOsPTop',
  corporateStatus: 'fldXnM5ktcFIF3kpi',
  corporateRegistryReference: 'fld1j4HLdZTNynlVf',
  businessNameRegistrationStatus: 'fldx6TfVEEvOyl4VT',
  businessNameBin: 'fldlnb2YgWfxiZrLn',
  registryExpiryDate: 'fldyaZCtz57BhmFHT',
  corporateStatusFootnote: 'fld5momntyPvjYEcW',
  dateChecked: 'fldbIssuf16zJNfmB',
  jurisdiction: 'fldv5Rh1GakCUOYzX',
  consentStatus: 'fldGOimULCLXgbJkc',
} as const;

// CLAUDE.md Section 8.3: only these two consent values permit real findings to leave the server.
const CONSENTED_VALUES = new Set(['Consented — Inbound Reply', 'Consented — Monitoring Agreement']);

// Results Page Token is RECORD_ID() (CLAUDE.md Section 3.2/4), so the token *is* the Airtable record id.
const RECORD_ID_PATTERN = /^rec[A-Za-z0-9]{14}$/;

export function isValidToken(token: string): boolean {
  return RECORD_ID_PATTERN.test(token);
}

type AirtableFieldsById = Record<string, unknown>;

interface AirtableGetRecordResponse {
  id: string;
  fields: AirtableFieldsById;
}

function field(fields: AirtableFieldsById, id: string): string | null {
  const value = fields[id];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export type ComplianceRecordResult =
  | { status: 'not_found' }
  | { status: 'gated'; tradeName: string }
  | {
      status: 'ok';
      tradeName: string;
      legalName: string | null;
      address: string | null;
      naicsCode: string | null;
      jurisdiction: string | null;
      dateChecked: string | null;
      wsib: {
        status: string | null;
        certificateNumber: string | null;
        expiryDate: string | null;
        footnote: string | null;
      };
      corporate: {
        status: string | null;
        registryReference: string | null;
        businessNameBin: string | null;
        businessNameRegistrationStatus: string | null;
        expiryDate: string | null;
        footnote: string | null;
      };
    };

export async function fetchComplianceRecord(token: string): Promise<ComplianceRecordResult> {
  const pat = process.env.AIRTABLE_PAT;
  if (!pat) {
    throw new Error('AIRTABLE_PAT is not configured');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${token}?returnFieldsByFieldId=true`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${pat}` },
  });

  if (res.status === 404) {
    return { status: 'not_found' };
  }
  if (!res.ok) {
    throw new Error(`Airtable request failed: ${res.status} ${await res.text()}`);
  }

  const record = (await res.json()) as AirtableGetRecordResponse;
  const f = record.fields;
  const tradeName = field(f, FIELD.tradeName) ?? 'Unknown business';
  const consentStatus = field(f, FIELD.consentStatus);

  // Consent gate enforced here, server-side, before any WSIB/Corporate value is ever assembled —
  // per CLAUDE.md Section 8.3, "no tiers, no exceptions," applying uniformly to token links and self-search alike.
  if (!consentStatus || !CONSENTED_VALUES.has(consentStatus)) {
    return { status: 'gated', tradeName };
  }

  return {
    status: 'ok',
    tradeName,
    legalName: field(f, FIELD.legalName),
    address: field(f, FIELD.address),
    naicsCode: field(f, FIELD.naicsCode),
    jurisdiction: field(f, FIELD.jurisdiction),
    dateChecked: field(f, FIELD.dateChecked),
    wsib: {
      status: field(f, FIELD.wsibStatus),
      certificateNumber: field(f, FIELD.wsibCertNumber),
      expiryDate: field(f, FIELD.wsibExpiryDate),
      footnote: field(f, FIELD.wsibFootnote),
    },
    corporate: {
      status: field(f, FIELD.corporateStatus),
      registryReference: field(f, FIELD.corporateRegistryReference),
      businessNameBin: field(f, FIELD.businessNameBin),
      businessNameRegistrationStatus: field(f, FIELD.businessNameRegistrationStatus),
      expiryDate: field(f, FIELD.registryExpiryDate),
      footnote: field(f, FIELD.corporateStatusFootnote),
    },
  };
}
