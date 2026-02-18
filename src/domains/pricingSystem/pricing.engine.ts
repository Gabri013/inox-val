// ============================================================
// PRICING ENGINE - Calculate overhead, margin, and final price
// ============================================================

import {
  OverheadBreakdown,
  MarginBreakdown,
} from './pricing.types';
import { PricingMethod } from '../engine/types';
import { Ruleset } from '../engine/ruleset';
import { DEFAULT_RULESET } from '../engine/ruleset';

// ============================================================
// Types
// ============================================================

export interface CostInput {
  materialCost: number;
  processCost: number;
  wasteCost: number;
}

export interface PricingInput extends CostInput {
  method?: PricingMethod;
  targetMargin?: number;
  discount?: number;
  minProfit?: number;
}

export interface PricingResult {
  success: boolean;
  totalCost: number;
  overhead: OverheadBreakdown;
  margin: MarginBreakdown;
  finalPrice: number;
  minPrice: number;
  errors: PricingError[];
  warnings: PricingWarning[];
}

export interface PricingError {
  code: string;
  message: string;
}

export interface PricingWarning {
  code: string;
  message: string;
  suggestion?: string;
}

// ============================================================
// Overhead Calculation
// ============================================================

/**
 * Calculate overhead costs
 */
export function applyOverhead(
  costs: CostInput,
  ruleset: Ruleset = DEFAULT_RULESET
): OverheadBreakdown {
  const overheadPercent = ruleset.pricing.overheadPercent;
  
  const materialOverhead = costs.materialCost * (overheadPercent / 100);
  const processOverhead = costs.processCost * (overheadPercent / 100);
  const totalOverhead = materialOverhead + processOverhead;
  
  return {
    overheadPercent,
    materialOverhead,
    processOverhead,
    totalOverhead
  };
}

// ============================================================
// Margin Calculation
// ============================================================

/**
 * Apply margin to calculate final price
 */
export function applyMargin(
  totalCost: number,
  method: PricingMethod = 'target-margin',
  ruleset: Ruleset = DEFAULT_RULESET,
  options?: {
    targetMargin?: number;
    discount?: number;
    minProfit?: number;
  }
): MarginBreakdown {
  const targetMargin = options?.targetMargin ?? ruleset.pricing.defaultMarginPercent;
  const discount = options?.discount ?? 0;
  const minProfit = options?.minProfit ?? 0;
  
  let finalPrice: number;
  let marginPercent: number;
  let markupPercent: number;
  let marginValue: number;
  
  switch (method) {
    case 'markup': {
      // Price = Cost * (1 + markup%)
      const markup = targetMargin;
      finalPrice = totalCost * (1 + markup / 100);
      markupPercent = markup;
      marginValue = finalPrice - totalCost;
      marginPercent = (marginValue / finalPrice) * 100;
      break;
    }
    
    case 'target-margin': {
      // Price = Cost / (1 - margin%)
      finalPrice = totalCost / (1 - targetMargin / 100);
      marginPercent = targetMargin;
      marginValue = finalPrice - totalCost;
      markupPercent = (marginValue / totalCost) * 100;
      break;
    }
    
    case 'minimum-profit': {
      // Price = Cost + minProfit
      finalPrice = totalCost + minProfit;
      marginValue = minProfit;
      marginPercent = (marginValue / finalPrice) * 100;
      markupPercent = (marginValue / totalCost) * 100;
      break;
    }
    
    default: {
      // Default to target-margin
      finalPrice = totalCost / (1 - targetMargin / 100);
      marginPercent = targetMargin;
      marginValue = finalPrice - totalCost;
      markupPercent = (marginValue / totalCost) * 100;
    }
  }
  
  // Apply discount
  let discountApplied = 0;
  if (discount > 0) {
    const maxDiscount = ruleset.pricing.maxDiscountPercent;
    discountApplied = Math.min(discount, maxDiscount);
    finalPrice = finalPrice * (1 - discountApplied / 100);
    
    // Recalculate margin after discount
    marginValue = finalPrice - totalCost;
    marginPercent = (marginValue / finalPrice) * 100;
    markupPercent = totalCost > 0 ? (marginValue / totalCost) * 100 : 0;
  }
  
  return {
    method,
    marginPercent,
    markupPercent,
    marginValue,
    discountApplied
  };
}

// ============================================================
// Final Price Calculation
// ============================================================

/**
 * Calculate minimum acceptable price
 */
export function calculateMinPrice(
  totalCost: number,
  ruleset: Ruleset = DEFAULT_RULESET
): number {
  const minMargin = ruleset.pricing.minMarginPercent;
  return totalCost / (1 - minMargin / 100);
}

/**
 * Generate final price from pricing result
 */
export function generateFinalPrice(pricing: PricingResult): number {
  return pricing.finalPrice;
}

/**
 * Main pricing calculation
 */
export function calculatePricing(
  input: PricingInput,
  ruleset: Ruleset = DEFAULT_RULESET
): PricingResult {
  const errors: PricingError[] = [];
  const warnings: PricingWarning[] = [];
  
  // Calculate overhead
  const overhead = applyOverhead(input, ruleset);
  
  // Total cost before margin
  const baseCost = input.materialCost + input.processCost;
  const totalCost = baseCost + overhead.totalOverhead;
  
  // Apply margin
  const margin = applyMargin(
    totalCost,
    input.method,
    ruleset,
    {
      targetMargin: input.targetMargin,
      discount: input.discount,
      minProfit: input.minProfit
    }
  );
  
  // Calculate final price
  let finalPrice = totalCost + margin.marginValue;
  
  // Calculate minimum price
  const minPrice = calculateMinPrice(totalCost, ruleset);
  
  // Validate margin
  if (margin.marginPercent < ruleset.pricing.minMarginPercent) {
    errors.push({
      code: 'MARGIN_BELOW_MINIMUM',
      message: `Margem ${margin.marginPercent.toFixed(1)}% abaixo do mínimo ${ruleset.pricing.minMarginPercent}%`
    });
  }
  
  // Validate price vs minimum
  if (finalPrice < minPrice) {
    warnings.push({
      code: 'PRICE_BELOW_MINIMUM',
      message: `Preço R$ ${finalPrice.toFixed(2)} abaixo do mínimo R$ ${minPrice.toFixed(2)}`,
      suggestion: 'Considere aumentar o preço ou reduzir custos'
    });
  }
  
  // Check if discount exceeds maximum
  if (input.discount && input.discount > ruleset.pricing.maxDiscountPercent) {
    warnings.push({
      code: 'DISCOUNT_EXCEEDS_MAX',
      message: `Desconto solicitado ${input.discount}% excede máximo ${ruleset.pricing.maxDiscountPercent}%`,
      suggestion: 'Desconto limitado ao máximo permitido'
    });
  }
  
  return {
    success: errors.length === 0,
    totalCost,
    overhead,
    margin,
    finalPrice,
    minPrice,
    errors,
    warnings
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Calculate margin from price and cost
 */
export function calculateMarginPercent(price: number, cost: number): number {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
}

/**
 * Calculate markup from price and cost
 */
export function calculateMarkupPercent(price: number, cost: number): number {
  if (cost === 0) return 0;
  return ((price - cost) / cost) * 100;
}

/**
 * Convert margin to markup
 */
export function marginToMarkup(marginPercent: number): number {
  if (marginPercent >= 100) return 0;
  return (marginPercent / (100 - marginPercent)) * 100;
}

/**
 * Convert markup to margin
 */
export function markupToMargin(markupPercent: number): number {
  return (markupPercent / (100 + markupPercent)) * 100;
}

/**
 * Calculate price from cost and margin
 */
export function calculatePriceFromMargin(cost: number, marginPercent: number): number {
  if (marginPercent >= 100) return cost * 2; // Fallback
  return cost / (1 - marginPercent / 100);
}

/**
 * Calculate price from cost and markup
 */
export function calculatePriceFromMarkup(cost: number, markupPercent: number): number {
  return cost * (1 + markupPercent / 100);
}

/**
 * Validate price against rules
 */
export function validatePrice(
  price: number,
  cost: number,
  ruleset: Ruleset = DEFAULT_RULESET
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const margin = calculateMarginPercent(price, cost);
  const minPrice = calculateMinPrice(cost, ruleset);
  
  if (margin < ruleset.pricing.minMarginPercent) {
    errors.push(`Margem ${margin.toFixed(1)}% abaixo do mínimo ${ruleset.pricing.minMarginPercent}%`);
  }
  
  if (price < cost) {
    errors.push('Preço abaixo do custo');
  }
  
  if (price < minPrice) {
    warnings.push(`Preço abaixo do mínimo recomendado R$ ${minPrice.toFixed(2)}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get pricing summary
 */
export function getPricingSummary(result: PricingResult): string {
  const lines = [
    `Custo Total: R$ ${result.totalCost.toFixed(2)}`,
    `Overhead (${result.overhead.overheadPercent}%): R$ ${result.overhead.totalOverhead.toFixed(2)}`,
    `Margem: ${result.margin.marginPercent.toFixed(1)}%`,
    `Preço Final: R$ ${result.finalPrice.toFixed(2)}`,
    `Preço Mínimo: R$ ${result.minPrice.toFixed(2)}`
  ];
  
  if (result.margin.discountApplied > 0) {
    lines.push(`Desconto Aplicado: ${result.margin.discountApplied}%`);
  }
  
  return lines.join('\n');
}

/**
 * Calculate break-even price
 */
export function calculateBreakEvenPrice(cost: number): number {
  return cost; // No margin
}

/**
 * Calculate suggested price range
 */
export function calculatePriceRange(
  cost: number,
  ruleset: Ruleset = DEFAULT_RULESET
): { min: number; suggested: number; premium: number } {
  const minMargin = ruleset.pricing.minMarginPercent;
  const defaultMargin = ruleset.pricing.defaultMarginPercent;
  const premiumMargin = defaultMargin + 10; // 10% above default
  
  return {
    min: calculatePriceFromMargin(cost, minMargin),
    suggested: calculatePriceFromMargin(cost, defaultMargin),
    premium: calculatePriceFromMargin(cost, premiumMargin)
  };
}