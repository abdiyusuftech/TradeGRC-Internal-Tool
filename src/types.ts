export type ComplianceTier = 'clear' | 'watch' | 'flag' | 'lapsed' | 'unknown';

export interface PillStyle {
  bg: string;
  fg: string;
  pip: string;
  label: string;
}

export interface VerdictStyle {
  word: string;
  bg: string;
  spine: string;
  fg: string;
  line: string;
  nextStep: string;
}

export interface ContractorRecord {
  id: string;
  reference: string;
  checkedISO: string;
  wsibStamp: string;
  onbisStamp: string;
  
  // WSIB Record
  legalName: string;
  tradeName: string;
  address: string;
  classSubclass: string;
  naicsWsib: string;
  accountStatus: string;
  certNumber: string;
  certValidFrom: string;
  certValidTo: string;
  certValidToISO: string;
  
  // Ontario Registry Record
  businessName: string;
  bin: string;
  businessType: string;
  registrationDate: string;
  registrationExpiry: string;
  registrationExpiryISO: string;
  principalPlace: string;
  primaryActivity: string;
  registryStatus: string;
  
  // Custom or verified metadata
  provenanceHash?: string;
  contactEmail?: string;
  notes?: string;
}

// --- Real-data types (CLAUDE.md Section 3.2). ContractorRecord above stays only for the
// disconnected EditRecordModal/TasteAuditModal — the live record page uses these instead. ---

export type StatusCategory = 'clear' | 'flagged' | 'inconclusive' | 'pending' | 'blocked';

export interface FieldDisplay {
  category: StatusCategory;
  rawValue: string | null;
  pill: PillStyle | null;
  copy: string;
  footnote: string | null;
}

export interface ComplianceRecordView {
  tradeName: string;
  legalName: string | null;
  address: string | null;
  naicsCode: string | null;
  jurisdiction: string | null;
  dateChecked: string | null;
  wsib: {
    certificateNumber: string | null;
    expiryDate: string | null;
    field: FieldDisplay;
  };
  corporate: {
    registryReference: string | null;
    businessNameBin: string | null;
    businessNameRegistrationStatus: string | null;
    expiryDate: string | null;
    field: FieldDisplay;
  };
}

export interface TasteAuditItem {
  id: string;
  category: 'Typography' | 'Color & Contrast' | 'Layout & Math' | 'Anti-Slop & Copy';
  title: string;
  rule: string;
  howWeFollowed: string;
  antiPatternAvoided: string;
  isCompliant: boolean;
}
