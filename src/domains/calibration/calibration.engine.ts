import { 
  CalibrationResult, 
  CalibrationFactor, 
  CostBreakdown, 
  CalibrationRun, 
  CalibrationRecommendation 
} from './types';

export function calculateMape(actual: number[], expected: number[]): number {
  if (actual.length !== expected.length || actual.length === 0) {
    return 0;
  }

  let totalError = 0;
  let validCount = 0;

  for (let i = 0; i < actual.length; i++) {
    const act = actual[i];
    const exp = expected[i];
    
    if (exp !== 0) {
      totalError += Math.abs((act - exp) / exp);
      validCount++;
    }
  }

  return validCount > 0 ? totalError / validCount : 0;
}

export function calculateCalibrationErrors(results: CalibrationResult[]) {
  const actual = results.map(r => r.actualCost);
  const expected = results.map(r => r.expectedCost);

  const errors = results.map(r => r.error);
  const errorPercents = results.map(r => r.errorPercent);

  return {
    mape: calculateMape(actual, expected),
    maxError: Math.max(...errors),
    minError: Math.min(...errors),
    errorDistribution: errorPercents,
  };
}

export function applyCalibrationFactors(
  costBreakdown: CostBreakdown,
  factors: CalibrationFactor[]
): CostBreakdown {
  let adjusted = { ...costBreakdown };

  factors.forEach(factor => {
    if (factor.active) {
      if (factor.factors.material) {
        adjusted.material *= factor.factors.material;
      }
      // Calculate total process factor from individual process factors (weld, cut, finish, assembly)
      const processFactors = [factor.factors.weld, factor.factors.cut, factor.factors.finish, factor.factors.assembly].filter(f => f !== undefined);
      if (processFactors.length > 0) {
        const averageProcessFactor = processFactors.reduce((sum, f) => sum * f, 1);
        adjusted.process *= averageProcessFactor;
      }
    }
  });

  // Recalculate total
  adjusted.total = adjusted.material + adjusted.process + adjusted.overhead + adjusted.margin;

  return adjusted;
}

export function suggestAdjustments(
  run: CalibrationRun
): CalibrationRecommendation[] {
  const recommendations: CalibrationRecommendation[] = [];
  
  // Simple recommendation logic based on MAPE
  if (run.metrics.mape > 0.05) { // MAPE > 5%
    recommendations.push({
      id: 'global-adjustment',
      type: 'factor',
      targetKey: 'global',
      currentValue: 1,
      recommendedValue: 1 - (run.metrics.mape - 0.05),
      reason: `MAPE atual ${(run.metrics.mape * 100).toFixed(1)}% excede o alvo de 5%`,
      impact: 'high',
      urgency: 'high',
    });
  }

  return recommendations;
}

export function validateCalibrationTarget(mape: number, targetMape = 0.05): boolean {
  return mape <= targetMape;
}

export function calculateCostError(actual: number, expected: number): { error: number; errorPercent: number } {
  const error = actual - expected;
  const errorPercent = expected !== 0 ? (error / expected) : 0;
  
  return { error, errorPercent };
}

export function generateRandomErrorDistribution(size: number, mean: number, stdDev: number): number[] {
  return Array.from({ length: size }, () => {
    const u = 0.5 - Math.random();
    const v = 0.5 - Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  });
}
