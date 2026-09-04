import { ComplianceRecordView, FieldDisplay, PillStyle, StatusCategory, VerdictStyle } from '../types';
import { ComplianceRecordApiOk } from '../lib/api';

export function calculateDaysBetween(fromISO: string, toISO: string): number | null {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function splitCodeGloss(raw: string, fallback: string = ''): { code: string; gloss: string } {
  const str = raw || fallback;
  const idx = str.indexOf(':');
  if (idx === -1) return { code: '', gloss: str };
  return {
    code: str.slice(0, idx).trim(),
    gloss: str.slice(idx + 1).trim(),
  };
}

// Exact enum values confirmed live against fldMlr2D1vxr5HuBK (WSIB Status) — the en dash in the
// blocked value is significant, it must match Airtable's option name exactly.
function classifyWsibStatus(status: string | null): StatusCategory {
  switch (status) {
    case 'Active/Good Standing':
      return 'clear';
    case 'Lapsed/Delinquent':
      return 'flagged';
    case 'No Account Found':
      return 'inconclusive';
    case 'WSIB No Match – Legal Name Unavailable':
      return 'blocked';
    case 'Not Yet Checked':
    default:
      return 'pending';
  }
}

// Exact enum values confirmed live against fldXnM5ktcFIF3kpi (Corporate Status).
function classifyCorporateStatus(status: string | null): StatusCategory {
  switch (status) {
    case 'Active':
      return 'clear';
    case 'Not in Good Standing':
      return 'flagged';
    case 'Not Found':
      return 'inconclusive';
    case 'Unreachable – No Legal Name':
      return 'blocked';
    case 'Not Yet Checked':
    default:
      return 'pending';
  }
}

type ExpiryTier = 'lapsed' | 'flag' | 'watch' | 'clear';

// CLAUDE.md 9.4: the repo's original bug was one shared threshold band for both WSIB's ~42-day
// cycle and Corporate's ~5-year cycle. These two functions are deliberately separate and scaled
// to each cycle so the same 38-days-remaining WSIB cert that used to wrongly read WATCH now reads CLEAR.
function getWsibExpiryTier(days: number | null): ExpiryTier | null {
  if (days === null) return null;
  if (days < 0) return 'lapsed';
  if (days < 10) return 'flag';
  if (days <= 21) return 'watch';
  return 'clear';
}

function getCorporateExpiryTier(days: number | null): ExpiryTier | null {
  if (days === null) return null;
  if (days < 0) return 'lapsed';
  if (days < 30) return 'flag';
  if (days <= 90) return 'watch';
  return 'clear';
}

function getExpiryTierPill(tier: ExpiryTier): PillStyle {
  switch (tier) {
    case 'lapsed':
      // Gray, not orange: a stale expiry date means "we don't currently know," not "we found
      // something bad" — reusing 'flag'/'flagged''s orange would render an unverified record
      // identically to a genuinely confirmed non-compliant one. Section 8.2's three-way scheme
      // treats this as inconclusive, same gray as 'watch'/pending states.
      return { bg: '#DCE3E3', fg: '#4C5A67', pip: '#4C5A67', label: 'RECHECK NEEDED' };
    case 'flag':
      return { bg: '#F3DCCB', fg: '#9C3E14', pip: '#C1501C', label: 'ADDRESS NOW' };
    case 'watch':
      return { bg: '#DCE3E3', fg: '#4C5A67', pip: '#4C5A67', label: 'WATCH' };
    case 'clear':
      return { bg: '#E1EEE6', fg: '#2F6B4F', pip: '#2F6B4F', label: 'CLEAR' };
  }
}

function formatExpiryCopy(days: number | null, tier: ExpiryTier, expiryISO: string | null): string {
  if (days === null) return 'no expiry date on file.';
  if (tier === 'lapsed') {
    return `Valid only through ${expiryISO ?? 'the stated date'}, which has since passed — current status needs rechecking.`;
  }
  if (tier === 'flag') return `${days} days left; renewal is not automatic.`;
  if (tier === 'watch') return `${days} days left, close enough to watch.`;
  const yrs = days / 365;
  return yrs >= 1.5 ? `${yrs.toFixed(1)} years out.` : `${days} days left.`;
}

// CLAUDE.md Section 8.2's three-way color scheme for the non-"clear" categories. "clear" gets its
// own richer, expiry-aware pill instead (see buildField below); "blocked" gets no badge at all —
// showing any color there would overstate a search that never actually ran (8.1/8.2).
function getCategoryPill(category: Exclude<StatusCategory, 'clear' | 'blocked'>): PillStyle {
  switch (category) {
    case 'flagged':
      return { bg: '#F3DCCB', fg: '#9C3E14', pip: '#C1501C', label: 'FLAGGED' };
    case 'inconclusive':
      return { bg: '#DCE3E3', fg: '#4C5A67', pip: '#7C8D99', label: 'NO MATCH' };
    case 'pending':
      return { bg: '#DCE3E3', fg: '#4C5A67', pip: '#7C8D99', label: 'PENDING' };
  }
}

function categoryCopy(category: Exclude<StatusCategory, 'clear' | 'blocked'>): string {
  switch (category) {
    case 'flagged':
      return "isn't currently in good standing.";
    case 'inconclusive':
      return 'no matching record found under this name.';
    case 'pending':
      return 'not yet checked.';
  }
}

function buildField(
  status: string | null,
  footnote: string | null,
  expiryISO: string | null,
  todayISO: string,
  classify: (s: string | null) => StatusCategory,
  getExpiryTier: (days: number | null) => ExpiryTier | null
): FieldDisplay {
  const category = classify(status);

  if (category === 'blocked') {
    // Renders blank, no badge — CLAUDE.md 8.1/8.2 treat this as a search that never ran, distinct
    // from a completed negative result.
    return { category, rawValue: status, pill: null, copy: '', footnote: null, hasExpiryDate: false };
  }

  if (category !== 'clear') {
    return {
      category,
      rawValue: status,
      pill: getCategoryPill(category),
      copy: categoryCopy(category),
      footnote,
      hasExpiryDate: false,
    };
  }

  const days = expiryISO ? calculateDaysBetween(todayISO, expiryISO) : null;
  const tier = getExpiryTier(days) ?? 'clear';
  return {
    category,
    rawValue: status,
    pill: getExpiryTierPill(tier),
    copy: formatExpiryCopy(days, tier, expiryISO),
    footnote,
    hasExpiryDate: days !== null,
  };
}

export function buildComplianceRecordView(record: ComplianceRecordApiOk, todayISO: string): ComplianceRecordView {
  return {
    tradeName: record.tradeName,
    legalName: record.legalName,
    address: record.address,
    naicsCode: record.naicsCode,
    jurisdiction: record.jurisdiction,
    dateChecked: record.dateChecked,
    wsib: {
      certificateNumber: record.wsib.certificateNumber,
      expiryDate: record.wsib.expiryDate,
      field: buildField(
        record.wsib.status,
        record.wsib.footnote,
        record.wsib.expiryDate,
        todayISO,
        classifyWsibStatus,
        getWsibExpiryTier
      ),
    },
    corporate: {
      registryReference: record.corporate.registryReference,
      businessNameBin: record.corporate.businessNameBin,
      businessNameRegistrationStatus: record.corporate.businessNameRegistrationStatus,
      expiryDate: record.corporate.expiryDate,
      field: buildField(
        record.corporate.status,
        record.corporate.footnote,
        record.corporate.expiryDate,
        todayISO,
        classifyCorporateStatus,
        getCorporateExpiryTier
      ),
    },
  };
}

type Severity = 'blocked' | 'lapsed' | 'flag' | 'watch' | 'pending' | 'inconclusive' | 'clear';

const SEVERITY_RANK: Record<Severity, number> = {
  blocked: 6,
  lapsed: 5,
  flag: 4,
  watch: 3,
  pending: 2,
  inconclusive: 1,
  clear: 0,
};

function fieldSeverity(field: FieldDisplay): Severity {
  if (field.category === 'blocked') return 'blocked';
  if (field.category === 'pending') return 'pending';
  if (field.category === 'inconclusive') return 'inconclusive';
  if (field.category === 'flagged') return 'flag';
  // category === 'clear': read the tier back off the pill label, since FieldDisplay doesn't carry it directly.
  switch (field.pill?.label) {
    case 'RECHECK NEEDED':
      return 'lapsed';
    case 'ADDRESS NOW':
      return 'flag';
    case 'WATCH':
      return 'watch';
    default:
      return 'clear';
  }
}

const VERDICT_COPY: Record<Severity, Omit<VerdictStyle, 'nextStep'> & { nextStep: string }> = {
  blocked: {
    word: 'Partial record',
    bg: '#EAEEEE',
    spine: '#4C5A67',
    fg: '#4C5A67',
    line: 'WSIB had no match under this name, so the corporate registry check could not run. This is a search that could not proceed, not a completed negative result.',
    nextStep: 'Confirm the correct legal or trade name directly with the business, then a new check can run against the corporate registry.',
  },
  lapsed: {
    word: 'Lapsed',
    bg: '#EAEEEE',
    spine: '#4C5A67',
    fg: '#4C5A67',
    line: "The last verification on file has expired, so current status can't be confirmed.",
    nextStep: "This business was checked previously, but the certificate or registration window has since closed. A fresh check is needed to confirm current status — that's what would happen next.",
  },
  flag: {
    word: 'Action needed',
    bg: '#F3DCCB',
    spine: '#C1501C',
    fg: '#9C3E14',
    line: 'One item needs attention before it lapses. See below.',
    nextStep: "Renew before the date above and the record stays clean. If you'd rather not be the one watching it, that is what we would take over: we track the date and flag the next one while there is still time to act.",
  },
  watch: {
    word: 'Caution',
    bg: '#DCE3E3',
    spine: 'repeating-linear-gradient(180deg, #C1501C 0 7px, #DCE3E3 7px 12px)',
    fg: '#9C3E14',
    line: 'Both records stand, but a date is close enough to watch. See below.',
    nextStep: 'Both records are in standing, but one item is approaching its renewal window. Track the cutoff date to prevent lapse.',
  },
  pending: {
    word: 'Pending',
    bg: '#EAEEEE',
    spine: '#4C5A67',
    fg: '#4C5A67',
    line: 'One or both checks have not been completed yet.',
    nextStep: 'This record is still being worked. Check back once both the WSIB and corporate registry checks are complete.',
  },
  inconclusive: {
    word: 'No match found',
    bg: '#EAEEEE',
    spine: '#4C5A67',
    fg: '#4C5A67',
    line: 'No matching record was found under this name in one or both registries. This can reflect a naming difference rather than a compliance issue.',
    nextStep: 'Confirm the exact legal or trade name on file. A naming mismatch is the most common reason a real registration does not turn up here.',
  },
  clear: {
    word: 'Clear',
    bg: '#E1EEE6',
    spine: '#E1EEE6',
    fg: '#2F6B4F',
    line: 'Nothing needs action today on either record.',
    nextStep: 'Nothing needs doing today, and we would rather say that plainly than invent a problem. Renewal dates come around on their own cycle, so the only question is who is watching for them. That is the part we track.',
  },
};

export function buildOverallVerdict(view: ComplianceRecordView): VerdictStyle {
  const wsibSeverity = fieldSeverity(view.wsib.field);
  const corpSeverity = fieldSeverity(view.corporate.field);
  const worst = SEVERITY_RANK[wsibSeverity] >= SEVERITY_RANK[corpSeverity] ? wsibSeverity : corpSeverity;
  return VERDICT_COPY[worst];
}

export function isUrgentVerdict(view: ComplianceRecordView): boolean {
  const wsibSeverity = fieldSeverity(view.wsib.field);
  const corpSeverity = fieldSeverity(view.corporate.field);
  return [wsibSeverity, corpSeverity].some((s) => s === 'flag' || s === 'lapsed');
}
