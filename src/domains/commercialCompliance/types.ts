export interface CommercialComplianceResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  termsAccepted: boolean;
  priceValidityConsistent: boolean;
  discountApprovalRequired: boolean;
  discountApproved: boolean;
  snapshotHash: string;
  hmacSignature: string;
  clientAcceptanceTimestamp: string | null;
}

export interface CommercialComplianceConfig {
  requiredTerms: string[];
  maxValidityDays: number;
  discountThreshold: number; // Percentage
  hmacSecret: string;
}

export interface QuoteSnapshot {
  id: string;
  content: string;
  timestamp: string;
}
