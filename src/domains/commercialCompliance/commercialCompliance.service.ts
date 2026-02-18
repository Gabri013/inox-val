// Removido import Node.js: crypto
import { CommercialComplianceConfig, CommercialComplianceResult, QuoteSnapshot } from './types';

export class CommercialComplianceService {
  private config: CommercialComplianceConfig;

  constructor(config: CommercialComplianceConfig) {
    this.config = config;
  }

  validateQuote(
    _quoteId: string,
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
    // Fallback hashCode (não seguro, apenas para browser)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      hash = ((hash << 5) - hash) + content.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(16);
  }

  private generateHMAC(content: string): string {
    // Fallback HMAC: NÃO seguro, apenas para browser
    const key = this.config.hmacSecret;
    let hmac = 0;
    for (let i = 0; i < content.length; i++) {
      hmac = ((hmac << 5) - hmac) + content.charCodeAt(i) + key.charCodeAt(i % key.length);
      hmac |= 0;
    }
    return hmac.toString(16);
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
