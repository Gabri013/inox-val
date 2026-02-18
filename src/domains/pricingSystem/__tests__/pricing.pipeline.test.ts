// ============================================================
// PRICING PIPELINE TESTS
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  EquipmentInputs,
  Material,
  Process,
} from '../pricing.types';
import {
  MESA_LISA,
  MESA_COM_PRATELEIRA,
  BANCADA_COM_ESPELHO,
  getTemplate,
} from '../equipment.templates';
import {
  STRUCTURAL_RULES,
  evaluateRule,
  evaluateCondition,

} from '../structural.rules';
import {
  generateEquipmentBOM,

} from '../equipment.generator';
import {

  computeAreaMm2,
  computeCutLengthMm,
} from '../geometry.pipeline';




import {
  runPricingPipeline,

} from '../pricing.pipeline';
import {
  createSnapshot,
  verifySnapshot,
  rebuildFromSnapshot,
} from '../snapshot.engine';
import {
  validatePricingInputs,

  canFinalize,
} from '../validation.engine';
import { DEFAULT_RULESET } from '../../engine/ruleset';

// ============================================================
// Mock Data
// ============================================================

const mockMaterials: Material[] = [
  {
    key: 'SHEET#SS304#1.2#POLIDO#3000x1250#DEFAULT',
    kind: 'sheet',
    alloy: '304',
    thicknessMm: 1.2,
    finish: 'POLIDO',
    format: { widthMm: 3000, heightMm: 1250, supplierFormatName: '3000x1250' },
    supplierId: 'DEFAULT',
    densityKgM3: 7930,
    active: true,
    priceHistory: [{
      currency: 'BRL',
      pricePerKg: 45,
      supplierId: 'DEFAULT',
      validFrom: '2024-01-01',
      updatedAt: '2024-01-01'
    }]
  },
  {
    key: 'SHEET#SS304#1.5#POLIDO#3000x1250#DEFAULT',
    kind: 'sheet',
    alloy: '304',
    thicknessMm: 1.5,
    finish: 'POLIDO',
    format: { widthMm: 3000, heightMm: 1250, supplierFormatName: '3000x1250' },
    supplierId: 'DEFAULT',
    densityKgM3: 7930,
    active: true,
    priceHistory: [{
      currency: 'BRL',
      pricePerKg: 45,
      supplierId: 'DEFAULT',
      validFrom: '2024-01-01',
      updatedAt: '2024-01-01'
    }]
  },
  {
    key: 'TUBE#SS304#40x40x1.2#6000#DEFAULT',
    kind: 'tube',
    alloy: '304',
    finish: 'POLIDO',
    tubeProfile: { widthMm: 40, heightMm: 40, thicknessMm: 1.2, lengthMm: 6000 },
    supplierId: 'DEFAULT',
    densityKgM3: 7930,
    active: true,
    priceHistory: [{
      currency: 'BRL',
      pricePerMeter: 25,
      supplierId: 'DEFAULT',
      validFrom: '2024-01-01',
      updatedAt: '2024-01-01'
    }]
  }
];

const mockProcesses: Process[] = [
  { key: 'CORTE_LASER', label: 'Corte a Laser', active: true, costModel: { setupMinutes: 15, costPerHour: 180, costPerMeter: 8 } },
  { key: 'DOBRA', label: 'Dobra', active: true, costModel: { setupMinutes: 20, costPerHour: 150, costPerBend: 3 } },
  { key: 'SOLDA_TIG', label: 'Solda TIG', active: true, costModel: { setupMinutes: 30, costPerHour: 200, costPerMeter: 25 } },
  { key: 'POLIMENTO', label: 'Polimento', active: true, costModel: { setupMinutes: 30, costPerHour: 120, costPerM2: 45 } },
  { key: 'MONTAGEM', label: 'Montagem', active: true, costModel: { setupMinutes: 30, costPerHour: 100, costPerUnit: 10 } },
  { key: 'EMBALAGEM', label: 'Embalagem', active: true, costModel: { setupMinutes: 10, costPerHour: 60, costPerUnit: 5 } },
];

// ============================================================
// Tests
// ============================================================

describe('Pricing Pipeline', () => {
  describe('Template Selection', () => {
    it('should get template by key', () => {
      const template = getTemplate('MESA_LISA');
      expect(template).toBeDefined();
      expect(template?.key).toBe('MESA_LISA');
      expect(template?.label).toBe('Mesa Lisa');
    });

    it('should return undefined for invalid template key', () => {
      const template = getTemplate('INVALID');
      expect(template).toBeUndefined();
    });
  });

  describe('Input Validation', () => {
    it('should validate correct inputs', () => {
      const inputs: EquipmentInputs = {
        width: 1000,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = validatePricingInputs(inputs);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail for width too small', () => {
      const inputs: EquipmentInputs = {
        width: 200,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = validatePricingInputs(inputs);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'WIDTH_TOO_SMALL')).toBe(true);
    });

    it('should fail for width too large', () => {
      const inputs: EquipmentInputs = {
        width: 3500,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = validatePricingInputs(inputs);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MAX_WIDTH')).toBe(true);
    });
  });

  describe('Structural Rules', () => {
    it('should evaluate depth > 700 condition correctly', () => {
      const rule = STRUCTURAL_RULES.find(r => r.id === 'DEPTH_REINFORCEMENT');
      expect(rule).toBeDefined();
      
      const inputsBelow: EquipmentInputs = {
        width: 1000, depth: 600, height: 900, thickness: 1.2, finish: 'POLIDO'
      };
      expect(evaluateRule(rule!, inputsBelow)).toBe(false);
      
      const inputsAbove: EquipmentInputs = {
        width: 1000, depth: 800, height: 900, thickness: 1.2, finish: 'POLIDO'
      };
      expect(evaluateRule(rule!, inputsAbove)).toBe(true);
    });

    it('should evaluate width > 3000 condition (BLOCK)', () => {
      const rule = STRUCTURAL_RULES.find(r => r.id === 'MAX_WIDTH');
      expect(rule).toBeDefined();
      expect(rule?.action).toBe('BLOCK');
      
      const inputs: EquipmentInputs = {
        width: 3500, depth: 600, height: 900, thickness: 1.2, finish: 'POLIDO'
      };
      expect(evaluateRule(rule!, inputs)).toBe(true);
    });

    it('should evaluate condition with boolean fields', () => {
      const result = evaluateCondition('hasShelf === true', {
        width: 1000, depth: 600, height: 900, thickness: 1.2, finish: 'POLIDO', hasShelf: true
      });
      expect(result).toBe(true);
    });
  });

  describe('BOM Generation', () => {
    it('should generate BOM for Mesa Lisa', () => {
      const inputs: EquipmentInputs = {
        width: 1000,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = generateEquipmentBOM(MESA_LISA, inputs);
      expect(result.success).toBe(true);
      expect(result.bom).toBeDefined();
      expect(result.bom?.sheetParts.length).toBeGreaterThan(0);
    });

    it('should generate BOM with reinforcement when depth > 700', () => {
      const inputs: EquipmentInputs = {
        width: 1000,
        depth: 800,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = generateEquipmentBOM(MESA_LISA, inputs);
      expect(result.success).toBe(true);
      expect(result.bom?.tubes.length).toBeGreaterThan(0);
    });

    it('should block when width > 3000', () => {
      const inputs: EquipmentInputs = {
        width: 3500,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = generateEquipmentBOM(MESA_LISA, inputs);
      expect(result.success).toBe(false);
      expect(result.blocked).toBe(true);
    });
  });

  describe('Geometry Calculations', () => {
    it('should calculate area correctly', () => {
      const part = {
        id: 'TEST',
        label: 'Test',
        materialKey: 'SHEET#SS304#1.2#POLIDO#3000x1250#DEFAULT',
        quantity: 1,
        blank: { width: 1000, height: 600 },
        thickness: 1.2,
        allowRotate: true,
        grainDirection: null,
        features: [],
        bends: [],
      };
      
      const area = computeAreaMm2(part);
      expect(area).toBe(600000); // 1000 * 600
    });

    it('should calculate cut length correctly', () => {
      const part = {
        id: 'TEST',
        label: 'Test',
        materialKey: 'SHEET#SS304#1.2#POLIDO#3000x1250#DEFAULT',
        quantity: 1,
        blank: { width: 1000, height: 600 },
        thickness: 1.2,
        allowRotate: true,
        grainDirection: null,
        features: [],
        bends: [],
      };
      
      const cutLength = computeCutLengthMm(part);
      expect(cutLength).toBe(3200); // 2 * (1000 + 600)
    });
  });

  describe('Full Pipeline', () => {
    it('should generate complete pricing for Mesa Lisa 1000x600x900', () => {
      const inputs: EquipmentInputs = {
        width: 1000,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = runPricingPipeline(
        MESA_LISA,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.bom.sheetParts.length).toBeGreaterThan(0);
      expect(result.result?.finalPrice).toBeGreaterThan(0);
      expect(result.result?.hash).toBeDefined();
    });

    it('should generate complete pricing for Mesa Lisa 2000x700x900', () => {
      const inputs: EquipmentInputs = {
        width: 2000,
        depth: 700,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
        hasShelf: true,
      };
      
      const result = runPricingPipeline(
        MESA_LISA,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.bom.sheetParts.length).toBeGreaterThan(0);
      expect(result.result?.nestingResult.utilization).toBeGreaterThan(0);
      expect(result.result?.finalPrice).toBeGreaterThan(0);
      expect(result.result?.hash).toBeDefined();
    });

    it('should add reinforcement when depth > 700', () => {
      const inputs: EquipmentInputs = {
        width: 1000,
        depth: 800,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = runPricingPipeline(
        MESA_LISA,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(true);
      expect(result.result?.bom.tubes.length).toBeGreaterThan(0);
    });

    it('should block when width > 3000', () => {
      const inputs: EquipmentInputs = {
        width: 3500,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = runPricingPipeline(
        MESA_LISA,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.code === 'MAX_WIDTH')).toBe(true);
    });
  });

  describe('Snapshot', () => {
    it('should create and verify snapshot', () => {
      const inputs: EquipmentInputs = {
        width: 1000,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = runPricingPipeline(
        MESA_LISA,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      
      const snapshot = createSnapshot(result.result!);
      expect(snapshot.id).toBeDefined();
      expect(snapshot.hash).toBe(result.result?.hash);
      
      const verification = verifySnapshot(snapshot);
      expect(verification.valid).toBe(true);
    });

    it('should rebuild from snapshot', () => {
      const inputs: EquipmentInputs = {
        width: 1000,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = runPricingPipeline(
        MESA_LISA,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(true);
      
      const snapshot = createSnapshot(result.result!);
      const rebuilt = rebuildFromSnapshot(snapshot);
      
      expect(rebuilt.equipmentType).toBe(result.result?.equipmentType);
      expect(rebuilt.finalPrice).toBe(result.result?.finalPrice);
      expect(rebuilt.hash).toBe(result.result?.hash);
    });
  });

  describe('Finalization', () => {
    it('should allow finalization for valid result', () => {
      const inputs: EquipmentInputs = {
        width: 1000,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
      };
      
      const result = runPricingPipeline(
        MESA_LISA,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(true);
      
      const finalization = canFinalize(result.result!);
      expect(finalization.canFinalize).toBe(true);
      expect(finalization.blockers.length).toBe(0);
    });
  });

  describe('Bancada com Espelho', () => {
    it('should generate BOM with backsplash', () => {
      const inputs: EquipmentInputs = {
        width: 1500,
        depth: 600,
        height: 850,
        thickness: 1.5,
        finish: 'POLIDO',
        hasBacksplash: true,
        backsplashHeight: 300,
      };
      
      const result = runPricingPipeline(
        BANCADA_COM_ESPELHO,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(true);
      expect(result.result?.bom.sheetParts.length).toBeGreaterThan(0);
      
      // Check for backsplash part
      const backsplash = result.result?.bom.sheetParts.find(p => p.id === 'BACKSPLASH');
      expect(backsplash).toBeDefined();
    });
  });

  describe('Mesa com Prateleira', () => {
    it('should generate BOM with shelf', () => {
      const inputs: EquipmentInputs = {
        width: 1200,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish: 'POLIDO',
        hasShelf: true,
      };
      
      const result = runPricingPipeline(
        MESA_COM_PRATELEIRA,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(true);
      
      // Check for shelf part
      const shelf = result.result?.bom.sheetParts.find(p => p.id === 'PRATELEIRA');
      expect(shelf).toBeDefined();
    });
  });
});

// ============================================================
// Run Tests
// ============================================================

describe('Pricing Pipeline - Edge Cases', () => {
  it('should handle minimum dimensions', () => {
    const inputs: EquipmentInputs = {
      width: 300,
      depth: 300,
      height: 500,
      thickness: 0.8,
      finish: '2B',
    };
    
    const result = runPricingPipeline(
      MESA_LISA,
      inputs,
      mockMaterials,
      mockProcesses,
      DEFAULT_RULESET
    );
    
    expect(result.success).toBe(true);
    expect(result.result?.finalPrice).toBeGreaterThan(0);
  });

  it('should handle maximum dimensions', () => {
    const inputs: EquipmentInputs = {
      width: 3000,
      depth: 1500,
      height: 1200,
      thickness: 3.0,
      finish: 'POLIDO',
    };
    
    const result = runPricingPipeline(
      MESA_LISA,
      inputs,
      mockMaterials,
      mockProcesses,
      DEFAULT_RULESET
    );
    
    expect(result.success).toBe(true);
    expect(result.result?.finalPrice).toBeGreaterThan(0);
  });

  it('should handle different finishes', () => {
    const finishes: Array<'POLIDO' | 'ESCOVADO' | '2B'> = ['POLIDO', 'ESCOVADO', '2B'];
    
    for (const finish of finishes) {
      const inputs: EquipmentInputs = {
        width: 1000,
        depth: 600,
        height: 900,
        thickness: 1.2,
        finish,
      };
      
      const result = runPricingPipeline(
        MESA_LISA,
        inputs,
        mockMaterials,
        mockProcesses,
        DEFAULT_RULESET
      );
      
      expect(result.success).toBe(true);
    }
  });
});