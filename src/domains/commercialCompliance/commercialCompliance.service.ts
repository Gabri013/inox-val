import * as crypto from 'crypto';
import { CommercialComplianceConfig, CommercialComplianceResult, QuoteSnapshot } from './types';

export class CommercialComplianceService {
  private config: CommercialComplianceConfig;

  constructor(config: CommercialComplianceConfig) {
    this.config = config;
  }

  validateQuote(
    quoteId: string,
    quoteContent: string,
    priceValidityDate: string,
    discountPercentage: number,
    discountApproved: boolean,
    clientAcceptanceTimestamp: string | null
  ): CommercialComplianceResult {
    const result: CommercialComplianceResult = {
      isValid: true,
      errors: [],
      warnings: [],
      termsAccepted: false,
      priceValidityConsistent: false,
      discountApprovalRequired: discountPercentage > this.config.discountThreshold,
      discountApproved: discountApproved,
      snapshotHash: this.generateSHA256(quoteContent),
      hmacSignature: this.generateHMAC(quoteContent),
      clientAcceptanceTimestamp: clientAcceptanceTimestamp
    };

    // Check if all required terms are present
    if (!this.hasAllRequiredTerms(quoteContent)) {
      result.isValid = false;
      result.errors.push('Quote missing required terms and conditions');
    } else {
      result.termsAccepted = true;
    }

    // Check price validity consistency
    if (!this.isPriceValidityConsistent(priceValidityDate)) {
      result.isValid = false;
      result.errors.push('Price validity date exceeds maximum allowed duration');
    } else {
      result.priceValidityConsistent = true;
    }

    // Check discount approval
    if (result.discountApprovalRequired && !discountApproved) {
      result.isValid = false;
      result.errors.push(`Discount of ${discountPercentage}% requires approval`);
    }

    // Check client acceptance
    if (!clientAcceptanceTimestamp) {
      result.isValid = false;
      result.errors.push('Quote not accepted by client');
    }

    return result;
  }

  generateSnapshot(quoteId: string, quoteContent: string): QuoteSnapshot {
    return {
      id: quoteId,
      content: quoteContent,
      timestamp: new Date().toISOString()
    };
  }

  private hasAllRequiredTerms(content: string): boolean {
    return this.config.requiredTerms.every(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
  }

  private isPriceValidityConsistent(validityDate: string): boolean {
    const validity = new Date(validityDate);
    const now = new Date();
    const maxValidity = new Date(now);
    maxValidity.setDate(now.getDate() + this.config.maxValidityDays);

    return validity <= maxValidity;
  }

  private generateSHA256(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private generateHMAC(content: string): string {
    return crypto.createHmac('sha256', this.config.hmacSecret)
      .update(content)
      .digest('hex');
  }
}

// Default configuration
export const defaultCommercialConfig: CommercialComplianceConfig = {
  requiredTerms: [
    'termos e condições',
    'validade do preço',
    'forma de pagamento',
    'prazo de entrega',
    'responsabilidade'
  ],
  maxValidityDays: 30,
  discountThreshold: 10, // 10%
  hmacSecret: process.env.COMMERCIAL_HMAC_SECRET || 'default-secret-key'
};

// Singleton instance
let instance: CommercialComplianceService | null = null;
export function getCommercialComplianceService(): CommercialComplianceService {
  if (!instance) {
    instance = new CommercialComplianceService(defaultCommercialConfig);
  }
  return instance;
}
