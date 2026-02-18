import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  SecurityAuditConfig,
  SecurityAuditResult,
  SecurityEvent,
  FraudScore,
  QuoteSecurityData
} from './types';

export class SecurityAuditService {
  private config: SecurityAuditConfig;

  constructor(config: SecurityAuditConfig) {
    this.config = config;
  }

  validateQuote(
    quoteId: string,
    securityData: QuoteSecurityData,
    userId: string,
    ipAddress: string,
    userAgent: string
  ): SecurityAuditResult {
    const events: SecurityEvent[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Detect manual price changes
    if (securityData.finalPrice !== securityData.calculatedPrice) {
      events.push(this.createEvent(
        quoteId,
        'MANUAL_PRICE_CHANGE',
        `Final price manually changed from ${securityData.calculatedPrice.toFixed(2)} to ${securityData.finalPrice.toFixed(2)}`,
        userId,
        'HIGH',
        ipAddress,
        userAgent
      ));
      errors.push('Manual price change blocked - violates antifraud policy');
    }

    // Detect margin anomalies
    if (securityData.marginPercentage < this.config.marginThreshold) {
      events.push(this.createEvent(
        quoteId,
        'MARGIN_ANOMALY',
        `Margin percentage (${securityData.marginPercentage.toFixed(2)}%) below acceptable threshold (${this.config.marginThreshold}%)`,
        userId,
        'HIGH',
        ipAddress,
        userAgent
      ));
      errors.push('Margin anomaly detected');
    }

    // Detect discount anomalies
    if (securityData.discountPercentage > this.config.discountThreshold) {
      events.push(this.createEvent(
        quoteId,
        'DISCOUNT_ANOMALY',
        `Discount percentage (${securityData.discountPercentage.toFixed(2)}%) exceeds acceptable threshold (${this.config.discountThreshold}%)`,
        userId,
        'MEDIUM',
        ipAddress,
        userAgent
      ));
      errors.push('Discount anomaly detected');
    }

    // Detect loss anomalies
    const lossPercentage = ((securityData.totalCost - securityData.finalPrice) / securityData.totalCost) * 100;
    if (lossPercentage > this.config.maxLossPercentage) {
      events.push(this.createEvent(
        quoteId,
        'LOSS_ANOMALY',
        `Loss percentage (${lossPercentage.toFixed(2)}%) exceeds acceptable threshold (${this.config.maxLossPercentage}%)`,
        userId,
        'CRITICAL',
        ipAddress,
        userAgent
      ));
      errors.push('Loss anomaly detected');
    }

    // Detect material substitutions
    if (!this.arraysEqual(securityData.originalMaterials, securityData.actualMaterials)) {
      events.push(this.createEvent(
        quoteId,
        'MATERIAL_SUBSTITUTION',
        `Materials substituted: ${securityData.originalMaterials.join(', ')} -> ${securityData.actualMaterials.join(', ')}`,
        userId,
        'MEDIUM',
        ipAddress,
        userAgent
      ));
      warnings.push('Material substitution detected');
    }

    // Calculate fraud score
    const fraudScore = this.calculateFraudScore(securityData);

    // Log events
    this.logEvents(quoteId, events);

    const result: SecurityAuditResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      fraudScore,
      events,
      manualPriceChangesBlocked: events.filter(e => e.type === 'MANUAL_PRICE_CHANGE').length,
      anomaliesDetected: events.length
    };

    return result;
  }

  private calculateFraudScore(data: QuoteSecurityData): FraudScore {
    const factors = [
      {
        name: 'Manual Price Change',
        score: data.finalPrice !== data.calculatedPrice ? 100 : 0,
        weight: 0.4,
        details: data.finalPrice !== data.calculatedPrice ? `Price changed from ${data.calculatedPrice} to ${data.finalPrice}` : 'No manual price change'
      },
      {
        name: 'Margin Anomaly',
        score: data.marginPercentage < this.config.marginThreshold ? 90 : 0,
        weight: 0.3,
        details: data.marginPercentage < this.config.marginThreshold ? `Margin ${data.marginPercentage}% below threshold ${this.config.marginThreshold}%` : 'Margin within acceptable range'
      },
      {
        name: 'Discount Anomaly',
        score: data.discountPercentage > this.config.discountThreshold ? 80 : 0,
        weight: 0.2,
        details: data.discountPercentage > this.config.discountThreshold ? `Discount ${data.discountPercentage}% exceeds threshold ${this.config.discountThreshold}%` : 'Discount within acceptable range'
      },
      {
        name: 'Loss Anomaly',
        score: ((data.totalCost - data.finalPrice) / data.totalCost) * 100 > this.config.maxLossPercentage ? 95 : 0,
        weight: 0.3,
        details: ((data.totalCost - data.finalPrice) / data.totalCost) * 100 > this.config.maxLossPercentage ? `Loss ${((data.totalCost - data.finalPrice) / data.totalCost) * 100}% exceeds threshold ${this.config.maxLossPercentage}%` : 'No significant loss'
      },
      {
        name: 'Material Substitution',
        score: !this.arraysEqual(data.originalMaterials, data.actualMaterials) ? 70 : 0,
        weight: 0.1,
        details: !this.arraysEqual(data.originalMaterials, data.actualMaterials) ? 'Material substitution detected' : 'No material substitution'
      }
    ];

    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);
    const finalScore = Math.round(weightedScore / totalWeight);

    return {
      score: finalScore,
      threshold: this.config.fraudThreshold,
      isRisky: finalScore >= this.config.fraudThreshold,
      factors: factors.map(factor => ({
        ...factor,
        contribution: Math.round(factor.score * factor.weight)
      }))
    };
  }

  private createEvent(
    quoteId: string,
    type: SecurityEvent['type'],
    description: string,
    userId: string,
    severity: SecurityEvent['severity'],
    ipAddress: string,
    userAgent: string
  ): SecurityEvent {
    return {
      id: crypto.randomUUID(),
      quoteId,
      type,
      description,
      userId,
      timestamp: new Date().toISOString(),
      severity,
      ipAddress,
      userAgent
    };
  }

  private logEvents(quoteId: string, events: SecurityEvent[]): void {
    const auditDir = path.join(process.cwd(), 'audit');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    const eventsFile = path.join(auditDir, `${quoteId}_events.json`);
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((value, index) => value === sortedB[index]);
  }

  getEventsByQuoteId(quoteId: string): SecurityEvent[] {
    const eventsFile = path.join(process.cwd(), 'audit', `${quoteId}_events.json`);
    if (fs.existsSync(eventsFile)) {
      const content = fs.readFileSync(eventsFile, 'utf8');
      return JSON.parse(content);
    }
    return [];
  }
}

// Default configuration
export const defaultSecurityConfig: SecurityAuditConfig = {
  fraudThreshold: 70, // 70% risk threshold
  marginThreshold: 10, // Minimum 10% margin
  discountThreshold: 20, // Maximum 20% discount
  maxLossPercentage: 15 // Maximum 15% loss
};

// Singleton instance
let instance: SecurityAuditService | null = null;
export function getSecurityAuditService(): SecurityAuditService {
  if (!instance) {
    instance = new SecurityAuditService(defaultSecurityConfig);
  }
  return instance;
}
