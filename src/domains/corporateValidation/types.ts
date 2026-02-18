import { CommercialComplianceResult } from '../commercialCompliance/types';
import { AccountingValidationResult } from '../accountingValidation/types';
import { SecurityAuditResult } from '../securityAudit/types';
import { TraceabilityResult } from '../traceability/types';

export interface CorporateValidationInput {
  // Commercial Compliance
  quoteId: string;
  quoteContent: string;
  priceValidityDate: string;
  discountPercentage: number;
  discountApproved: boolean;
  clientAcceptanceTimestamp: string | null;

  // Accounting Validation
  costData: {
    materials: number;
    labor: number;
    overhead: number;
    otherExpenses: number;
    totalRevenue: number;
  };

  // Security Audit
  securityData: {
    finalPrice: number;
    calculatedPrice: number;
    marginPercentage: number;
    discountPercentage: number;
    totalCost: number;
    originalMaterials: string[];
    actualMaterials: string[];
    manualChanges: number;
  };
  userId: string;
  ipAddress: string;
  userAgent: string;

  // Traceability
  versionedItems: Array<{
    id: string;
    type: 'TEMPLATE' | 'PROCESS' | 'MATERIAL' | 'SETTING' | 'CALIBRATION_FACTOR';
    version: string;
    name: string;
  }>;
  changelog: Array<{
    id: string;
    itemId: string;
    itemType: string;
    versionBefore: string;
    versionAfter: string;
    changeReason: string;
    userId: string;
    timestamp: string;
    details: string;
  }>;
}

export interface CorporateValidationResult {
  overallResult: 'PASS' | 'FAIL';
  isValid: boolean;
  modules: {
    commercial: CommercialComplianceResult;
    accounting: AccountingValidationResult;
    security: SecurityAuditResult;
    traceability: TraceabilityResult;
  };
  summary: {
    totalErrors: number;
    totalWarnings: number;
    failingModules: string[];
    passingModules: string[];
  };
  generatedAt: string;
}
