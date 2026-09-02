import { ComplianceTier, PillStyle, VerdictStyle, ContractorRecord } from '../types';

export function calculateDaysBetween(fromISO: string, toISO: string): number | null {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function getTierFromDays(days: number | null): ComplianceTier {
  if (days === null) return 'unknown';
  if (days < 0) return 'lapsed';
  if (days < 30) return 'flag';
  if (days <= 60) return 'watch';
  return 'clear';
}

export function getPillStyle(tier: ComplianceTier): PillStyle {
  switch (tier) {
    case 'lapsed':
      return { bg: '#F3DCCB', fg: '#9C3E14', pip: '#C1501C', label: 'LAPSED' };
    case 'flag':
      return { bg: '#F3DCCB', fg: '#9C3E14', pip: '#C1501C', label: 'ADDRESS NOW' };
    case 'watch':
      return { bg: '#DCE3E3', fg: '#4C5A67', pip: '#4C5A67', label: 'WATCH' };
    case 'clear':
      return { bg: '#E1EEE6', fg: '#2F6B4F', pip: '#2F6B4F', label: 'CLEAR' };
    case 'unknown':
    default:
      return { bg: '#DCE3E3', fg: '#4C5A67', pip: '#7C8D99', label: 'NOT ON FILE' };
  }
}

export function formatDayCopy(days: number | null, tier: ComplianceTier): string {
  if (days === null) return 'not on file.';
  if (days < 0) return 'that date has passed.';
  if (tier === 'flag') return `${days} days left; renewal is not automatic.`;
  if (tier === 'watch') return `${days} days left, close enough to watch.`;
  const yrs = days / 365;
  return yrs >= 1.5 ? `${yrs.toFixed(1)} years out.` : `${days} days left.`;
}

export function splitCodeGloss(raw: string, fallback: string = ''): { code: string; gloss: string } {
  const str = raw || fallback;
  const idx = str.indexOf(':');
  if (idx === -1) return { code: '', gloss: str };
  return {
    code: str.slice(0, idx).trim(),
    gloss: str.slice(idx + 1).trim()
  };
}

export function calculateRecordVerdict(
  record: ContractorRecord,
  currentAsOfDate: string
): {
  certDays: number | null;
  regDays: number | null;
  certTier: ComplianceTier;
  regTier: ComplianceTier;
  certPill: PillStyle;
  regPill: PillStyle;
  certDaysCopy: string;
  regDaysCopy: string;
  verdict: VerdictStyle;
  isUrgent: boolean;
} {
  const certDays = calculateDaysBetween(currentAsOfDate, record.certValidToISO);
  const regDays = calculateDaysBetween(currentAsOfDate, record.registrationExpiryISO);

  const certTier = getTierFromDays(certDays);
  const regTier = getTierFromDays(regDays);

  const certPill = getPillStyle(certTier);
  const regPill = getPillStyle(regTier);

  const certDaysCopy = formatDayCopy(certDays, certTier);
  const regDaysCopy = formatDayCopy(regDays, regTier);

  // Overall verdict = worst rank of either record
  const rank: Record<ComplianceTier, number> = {
    clear: 0,
    watch: 1,
    flag: 2,
    lapsed: 3,
    unknown: 1
  };

  let overallTier: ComplianceTier = rank[certTier] >= rank[regTier] ? certTier : regTier;

  // Account status override (if account status indicates review or restriction)
  if (record.accountStatus && !/eligible|active|good/i.test(record.accountStatus)) {
    if (rank[overallTier] < rank['flag']) {
      overallTier = 'flag';
    }
  }

  // Registry status override
  if (record.registryStatus && /pending|suspended|inactive/i.test(record.registryStatus)) {
    if (rank[overallTier] < rank['watch']) {
      overallTier = 'watch';
    }
  }

  const isUrgent = overallTier === 'flag' || overallTier === 'lapsed';

  const verdictMap: Record<ComplianceTier, VerdictStyle> = {
    clear: {
      word: 'Clear',
      bg: '#E1EEE6',
      spine: '#E1EEE6',
      fg: '#2F6B4F',
      line: `Nothing needs action today. Next date on either record is ${record.certValidTo || 'upcoming'}.`,
      nextStep: `Nothing needs doing today, and we would rather say that plainly than invent a problem. The clearance date comes around roughly every 90 days, so the only question is who is watching for it. That is the part we track.`
    },
    watch: {
      word: 'Caution',
      bg: '#DCE3E3',
      spine: 'repeating-linear-gradient(180deg, #C1501C 0 7px, #DCE3E3 7px 12px)',
      fg: '#9C3E14',
      line: 'Both records stand, but a date is close enough to watch. See below.',
      nextStep: 'Both records are in standing, but one item is approaching its renewal window. Track the cutoff date to prevent lapse.'
    },
    flag: {
      word: 'Action needed',
      bg: '#F3DCCB',
      spine: '#C1501C',
      fg: '#9C3E14',
      line: 'One item needs attention before it lapses. See below.',
      nextStep: "Renew before the date above and the record stays clean. If you'd rather not be the one watching it, that is what we would take over: we track the date and flag the next one while there is still time to act."
    },
    lapsed: {
      word: 'Lapsed',
      bg: '#F3DCCB',
      spine: '#C1501C',
      fg: '#9C3E14',
      line: 'A record has already expired and reads that way to anyone checking.',
      nextStep: 'This certificate or registration has passed its expiration cutoff. Work sites and general contractors pulling this record will see a non-compliant status.'
    },
    unknown: {
      word: 'Incomplete',
      bg: '#EAEEEE',
      spine: '#4C5A67',
      fg: '#4C5A67',
      line: 'A record could not be read at the time of this check.',
      nextStep: 'Verify the business identification number (BIN) or WSIB account number with the registry administrator.'
    }
  };

  const verdict = verdictMap[overallTier] || verdictMap.unknown;

  return {
    certDays,
    regDays,
    certTier,
    regTier,
    certPill,
    regPill,
    certDaysCopy,
    regDaysCopy,
    verdict,
    isUrgent
  };
}
