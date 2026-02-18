export interface FraudScore {
  score: number; // 0-100, higher means higher fraud risk
  threshold: number;
  isRisky: boolean;
  factors: {
    name: string;
    score: number;
    weight: number;
    contribution: number;
    details: string;
  }[];
}

export interface SecurityEvent {
  id: string;
  quoteId: string;
  type: 'MANUAL_PRICE_CHANGE' | 'MARGIN_ANOMALY' | 'DISCOUNT_ANOMALY' | 'LOSS_ANOMALY' | 'MATERIAL_SUBSTITUTION' | 'OTHER';
  description: string;
  userId: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string;
  userAgent: string;
}

export interface SecurityAuditResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fraudScore: FraudScore;
  events: SecurityEvent[];
  manualPriceChangesBlocked: number;
  anomaliesDetected: number;
}

export interface SecurityAuditConfig {
  fraudThreshold: number; // 0-100
  marginThreshold: number; // Minimum acceptable margin percentage
  discountThreshold: number; // Maximum acceptable discount percentage
  maxLossPercentage: number; // Maximum acceptable loss percentage
}

export interface QuoteSecurityData {
  finalPrice: number;
  calculatedPrice: number;
  marginPercentage: number;
  discountPercentage: number;
  totalCost: number;
  originalMaterials: string[];
  actualMaterials: string[];
  manualChanges: number;
}
