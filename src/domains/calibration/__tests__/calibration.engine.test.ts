import { describe, it, expect } from 'vitest';
import { calculateMape, calculateCalibrationErrors, applyCalibrationFactors, validateCalibrationTarget } from '../calibration.engine';
import { CalibrationResult, CostBreakdown } from '../types';

describe('calibration.engine', () => {
  describe('calculateMape', () => {
    it('should calculate MAPE correctly', () => {
      const actual = [100, 200, 300];
      const expected = [105, 195, 295];
      
      const mape = calculateMape(actual, expected);
      
      expect(mape).toBeGreaterThan(0);
      expect(mape).toBeLessThan(0.1); // Should be around 4%
    });

    it('should return 0 for empty arrays', () => {
      const mape = calculateMape([], []);
      expect(mape).toBe(0);
    });

    it('should handle zero expected values', () => {
      const actual = [10, 20, 30];
      const expected = [0, 20, 30];
      
      const mape = calculateMape(actual, expected);
      
      expect(mape).toBeGreaterThan(0);
    });
  });

  describe('calculateCalibrationErrors', () => {
    it('should calculate errors correctly', () => {
      const results: CalibrationResult[] = [
        { partId: '1', actualCost: 100, expectedCost: 105, error: -5, errorPercent: -0.0476 },
        { partId: '2', actualCost: 200, expectedCost: 195, error: 5, errorPercent: 0.0256 },
        { partId: '3', actualCost: 300, expectedCost: 295, error: 5, errorPercent: 0.0169 },
      ];

      const errors = calculateCalibrationErrors(results);

      expect(errors.mape).toBeGreaterThan(0);
      expect(errors.maxError).toEqual(5);
      expect(errors.minError).toEqual(-5);
      expect(errors.errorDistribution).toEqual([-0.0476, 0.0256, 0.0169]);
    });
  });

  describe('applyCalibrationFactors', () => {
    it('should apply factors to cost breakdown', () => {
      const costBreakdown: CostBreakdown = {
        material: 100,
        process: 50,
        overhead: 20,
        margin: 30,
        total: 200,
      };

      const factors = [
        {
          id: '1',
          type: 'global' as const,
          factors: { material: 1.02, weld: 0.98, cut: 0.98, finish: 0.98, assembly: 0.98 },
          description: 'Global adjustment',
          effectiveFrom: '2024-01-01',
          active: true,
        },
      ];

      const adjusted = applyCalibrationFactors(costBreakdown, factors);

      expect(adjusted.material).toBeCloseTo(102);
      expect(adjusted.process).toBeCloseTo(49);
      expect(adjusted.total).toBeCloseTo(102 + 49 + 20 + 30);
    });

    it('should not apply inactive factors', () => {
      const costBreakdown: CostBreakdown = {
        material: 100,
        process: 50,
        overhead: 20,
        margin: 30,
        total: 200,
      };

      const factors = [
        {
          id: '1',
          type: 'global' as const,
          factors: { material: 1.02, weld: 0.98, cut: 0.98, finish: 0.98, assembly: 0.98 },
          description: 'Global adjustment',
          effectiveFrom: '2024-01-01',
          active: false,
        },
      ];

      const adjusted = applyCalibrationFactors(costBreakdown, factors);

      expect(adjusted).toEqual(costBreakdown);
    });

    it('should apply multiple factors', () => {
      const costBreakdown: CostBreakdown = {
        material: 100,
        process: 50,
        overhead: 20,
        margin: 30,
        total: 200,
      };

      const factors = [
        {
          id: '1',
          type: 'global' as const,
          factors: { material: 1.02, weld: 0.98, cut: 0.98, finish: 0.98, assembly: 0.98 },
          description: 'Global adjustment',
          effectiveFrom: '2024-01-01',
          active: true,
        },
        {
          id: '2',
          type: 'template' as const,
          targetKey: 'template-1',
          factors: { material: 1.05 },
          description: 'Template adjustment',
          effectiveFrom: '2024-01-15',
          active: true,
        },
      ];

      const adjusted = applyCalibrationFactors(costBreakdown, factors);

      expect(adjusted.material).toBeCloseTo(100 * 1.02 * 1.05);
    });
  });

  describe('validateCalibrationTarget', () => {
    it('should return true when MAPE is below target', () => {
      expect(validateCalibrationTarget(0.04)).toBe(true);
    });

    it('should return false when MAPE exceeds target', () => {
      expect(validateCalibrationTarget(0.06)).toBe(false);
    });

    it('should use custom target when provided', () => {
      expect(validateCalibrationTarget(0.08, 0.1)).toBe(true);
      expect(validateCalibrationTarget(0.12, 0.1)).toBe(false);
    });
  });
});
