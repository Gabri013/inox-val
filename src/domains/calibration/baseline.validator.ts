import { Baseline, ValidationResult } from './types';

export function validateBaseline(baseline: Baseline): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate templateKey
  if (!baseline.templateKey || baseline.templateKey.trim() === '') {
    errors.push('Template key is required');
  }

  // Validate inputs
  if (!baseline.inputs || Object.keys(baseline.inputs).length === 0) {
    errors.push('Baseline inputs are required');
  }

  // Validate cost structure
  const costKeys = ['material', 'process', 'overhead', 'margin', 'total'];
  for (const key of costKeys) {
    const value = baseline.expectedCost[key as keyof typeof baseline.expectedCost];
    if (typeof value !== 'number' || value < 0) {
      errors.push(`Invalid ${key} cost: must be a non-negative number`);
    }
  }

  // Validate total cost calculation
  const calculatedTotal = 
    baseline.expectedCost.material + 
    baseline.expectedCost.process + 
    baseline.expectedCost.overhead + 
    baseline.expectedCost.margin;

  if (Math.abs(calculatedTotal - baseline.expectedCost.total) > 0.01) {
    errors.push(`Total cost mismatch: calculated ${calculatedTotal.toFixed(2)}, expected ${baseline.expectedCost.total.toFixed(2)}`);
  }

  // Validate metrics
  if (baseline.expectedMetrics) {
    const metricKeys = ['weldMeters', 'cutMeters', 'finishM2', 'bendCount'];
    for (const key of metricKeys) {
      const value = baseline.expectedMetrics[key as keyof typeof baseline.expectedMetrics];
      if (value !== undefined && (typeof value !== 'number' || value < 0)) {
        errors.push(`Invalid ${key}: must be a non-negative number`);
      }
    }
  }

  // Validate required fields
  if (!baseline.createdAt) {
    errors.push('Creation date is required');
  }

  if (!baseline.createdBy) {
    errors.push('Creator is required');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateBaselineInputs(
  templateKey: string,
  inputs: Record<string, any>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // This would typically validate against template schema
  if (!templateKey || templateKey.trim() === '') {
    errors.push('Template key is required');
  }

  if (!inputs || Object.keys(inputs).length === 0) {
    errors.push('Inputs cannot be empty');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateCostBreakdown(
  baseline: Baseline
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const costKeys = ['material', 'process', 'overhead', 'margin'] as const;

  for (const key of costKeys) {
    const cost = baseline.expectedCost[key];
    const percentage = cost / baseline.expectedCost.total;

    if (percentage < 0 || percentage > 1) {
      errors.push(`${key} cost percentage must be between 0 and 100%`);
    }

    // Check if cost percentage is within reasonable range
    const minPercentage = 0.01; // Minimum 1%
    const maxPercentage = 0.90; // Maximum 90%

    if (percentage < minPercentage) {
      warnings.push(`${key} cost is very low (${(percentage * 100).toFixed(1)}%)`);
    }

    if (percentage > maxPercentage) {
      warnings.push(`${key} cost is very high (${(percentage * 100).toFixed(1)}%)`);
    }
  }

  // Validate that total cost is reasonable
  if (baseline.expectedCost.total <= 0) {
    errors.push('Total cost must be greater than zero');
  }

  if (baseline.expectedCost.total > 1000000) {
    warnings.push('Total cost seems very high');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateMetricsConsistency(baseline: Baseline): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (baseline.expectedMetrics) {
    // Check if metrics make sense relative to cost
    const costPerWeldMeter = baseline.expectedMetrics.weldMeters && baseline.expectedMetrics.weldMeters > 0 
      ? baseline.expectedCost.total / baseline.expectedMetrics.weldMeters 
      : 0;

    if (costPerWeldMeter > 1000) {
      warnings.push('Cost per weld meter seems very high');
    }

    const costPerCutMeter = baseline.expectedMetrics.cutMeters && baseline.expectedMetrics.cutMeters > 0
      ? baseline.expectedCost.total / baseline.expectedMetrics.cutMeters
      : 0;

    if (costPerCutMeter > 500) {
      warnings.push('Cost per cut meter seems very high');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateBaselineComplete(baseline: Baseline): ValidationResult {
  const validationResults = [
    validateBaseline(baseline),
    validateCostBreakdown(baseline),
    validateMetricsConsistency(baseline),
  ];

  const allErrors = validationResults.flatMap(result => result.errors);
  const allWarnings = validationResults.flatMap(result => result.warnings);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
