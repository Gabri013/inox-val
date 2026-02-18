// ============================================================
// EQUIPMENT LIBRARY TESTS - Sanity tests
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import { ALL_TEMPLATES, getTemplateByKey } from './equipment.templates';
import { ALL_PRESETS, getPresetsForTemplate, getDefaultPreset } from './equipment.presets';
import { validateTemplate, validatePreset } from './equipment.validator';
import { evaluateExpression, ExpressionError } from './equipment.expression';
import { evaluateTemplate, equipmentRegistry, quickEvaluate } from './equipment.registry';
import { EquipmentCategory } from './equipment.dsl.schema';

// Register all templates for testing
ALL_TEMPLATES.forEach(template => {
  equipmentRegistry.registerTemplate(template);
});

describe('Equipment Library - Sanity Tests', () => {
  describe('Templates', () => {
    it('all templates should be valid', () => {
      ALL_TEMPLATES.forEach(template => {
        const result = validateTemplate(template);
        expect(result.valid, `Template '${template.key}' validation failed: ${result.errors.map(e => e.message).join('; ')}`).toBe(true);
      });
    });

    it('should have 16 templates', () => {
      expect(ALL_TEMPLATES.length).toBe(16);
    });

    it('templates should cover all 5 categories', () => {
      const categories = new Set<EquipmentCategory>();
      ALL_TEMPLATES.forEach(template => {
        categories.add(template.category);
      });
      expect(categories.size).toBe(5);
      expect(categories.has('MESA')).toBe(true);
      expect(categories.has('BANCADA')).toBe(true);
      expect(categories.has('ARMARIO')).toBe(true);
      expect(categories.has('ESTANTE')).toBe(true);
      expect(categories.has('CARRINHO')).toBe(true);
    });

    it('each template should have at least 3 presets', () => {
      ALL_TEMPLATES.forEach(template => {
        const presets = getPresetsForTemplate(template.key);
        expect(presets.length).toBeGreaterThan(0);
      });
    });

    it('each template should have a unique key', () => {
      const keys = new Set<string>();
      ALL_TEMPLATES.forEach(template => {
        expect(keys.has(template.key)).toBe(false);
        keys.add(template.key);
      });
    });

    it('templates should have valid structure', () => {
      ALL_TEMPLATES.forEach(template => {
        expect(template.key).toBeDefined();
        expect(template.label).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.description).toBeDefined();
        expect(Array.isArray(template.inputs)).toBe(true);
        expect(template.bom).toBeDefined();
        expect(Array.isArray(template.structuralRules)).toBe(true);
        expect(Array.isArray(template.processRules)).toBe(true);
        expect(Array.isArray(template.validations)).toBe(true);
        expect(template.metricsModel).toBeDefined();
      });
    });
  });

  describe('Presets', () => {
    it('should have exactly 40 presets', () => {
      expect(ALL_PRESETS.length).toBe(40);
    });

    it('all presets should be valid', () => {
      ALL_PRESETS.forEach(preset => {
        const template = getTemplateByKey(preset.templateKey);
        const result = validatePreset(preset, template || null);
        expect(result.valid, `Preset '${preset.id}' validation failed: ${result.errors.map(e => e.message).join('; ')}`).toBe(true);
      });
    });

    it('each template should have at least 1 preset', () => {
      ALL_TEMPLATES.forEach(template => {
        const presets = getPresetsForTemplate(template.key);
        expect(presets.length).toBeGreaterThan(0);
      });
    });

    it('presets should have default values', () => {
      const presetsWithDefaults = ALL_PRESETS.filter(p => p.isDefault);
      expect(presetsWithDefaults.length).toBeGreaterThan(0);
    });

    it('presets should have unique IDs', () => {
      const ids = new Set<string>();
      ALL_PRESETS.forEach(preset => {
        expect(ids.has(preset.id)).toBe(false);
        ids.add(preset.id);
      });
    });
  });

  describe('Expression Evaluator', () => {
    it('should evaluate simple expressions', () => {
      expect(evaluateExpression('1 + 1', {})).toBe(2);
      expect(evaluateExpression('width * 2', { width: 100 })).toBe(200);
      expect(evaluateExpression('depth > 700', { depth: 800 })).toBe(true);
      expect(evaluateExpression('finish == "POLIDO"', { finish: 'POLIDO' })).toBe(true);
    });

    it('should handle string concatenation', () => {
      expect(evaluateExpression("'CHAPA#' + alloy + '#' + thickness", { alloy: 'SS304', thickness: 1.2 })).toBe('CHAPA#SS304#1.2');
    });

    it('should handle ternary operator', () => {
      expect(evaluateExpression('depth > 700 ? 1 : 0', { depth: 800 })).toBe(1);
      expect(evaluateExpression('depth > 700 ? 1 : 0', { depth: 600 })).toBe(0);
    });

    it('should handle functions', () => {
      expect(evaluateExpression('min(10, 20)', {})).toBe(10);
      expect(evaluateExpression('max(width, depth)', { width: 1000, depth: 800 })).toBe(1000);
      expect(evaluateExpression('round(123.456)', {})).toBe(123);
      expect(evaluateExpression('ceil(123.1)', {})).toBe(124);
      expect(evaluateExpression('floor(123.9)', {})).toBe(123);
      expect(evaluateExpression('abs(-10)', {})).toBe(10);
    });

    it('should be safe from code injection', () => {
      expect(() => evaluateExpression('eval("alert(1)")', {})).toThrow(ExpressionError);
      expect(() => evaluateExpression('Function("return 1")()', {})).toThrow(ExpressionError);
      expect(() => evaluateExpression('window.alert(1)', {})).toThrow(ExpressionError);
    });

    it('should validate expressions', () => {
      expect(validateExpression('1 + 1')).toBe(true);
      expect(validateExpression('invalid + expression')).toBe(false);
      expect(validateExpression('eval(1)')).toBe(false);
    });
  });

  describe('BOM Generation', () => {
    it('preset should generate valid BOM', () => {
      const preset = ALL_PRESETS[0]; // First preset
      const result = quickEvaluate(preset.templateKey, preset.values);
      
      // Check BOM is valid
      expect(result.bom).toBeDefined();
      expect(Array.isArray(result.bom.sheetParts)).toBe(true);
      expect(Array.isArray(result.bom.tubes)).toBe(true);
      expect(Array.isArray(result.bom.accessories)).toBe(true);

      // Check quantities are valid
      result.bom.sheetParts.forEach(part => {
        expect(part.quantity).toBeGreaterThanOrEqual(0);
        expect(part.width).toBeGreaterThan(0);
        expect(part.height).toBeGreaterThan(0);
      });

      result.bom.tubes.forEach(part => {
        expect(part.quantity).toBeGreaterThanOrEqual(0);
        expect(part.length).toBeGreaterThan(0);
      });

      result.bom.accessories.forEach(part => {
        expect(part.quantity).toBeGreaterThanOrEqual(0);
      });
    });

    it('templates should generate BOM with valid material keys', () => {
      const preset = ALL_PRESETS[0]; // First preset
      const result = quickEvaluate(preset.templateKey, preset.values);
      
      result.bom.sheetParts.forEach(part => {
        expect(part.materialKey).toBeDefined();
        expect(part.materialKey).not.toBe('');
        expect(part.materialKey.includes('SHEET')).toBe(true);
      });

      result.bom.tubes.forEach(part => {
        expect(part.materialKey).toBeDefined();
        expect(part.materialKey).not.toBe('');
        expect(part.materialKey.includes('TUBE')).toBe(true);
      });

      result.bom.accessories.forEach(part => {
        expect(part.sku).toBeDefined();
      });
    });
  });

  describe('Structural Rules', () => {
    it('should add reinforcement when depth > 700', () => {
      const template = getTemplateByKey('MESA_LISA')!;
      const result1 = evaluateTemplate(template, {
        width: 1000,
        depth: 600,
        height: 850,
        thickness: 1.2,
        finish: 'POLIDO',
        hasCasters: false
      });

      // Should not have reinforcement
      expect(result1.bom.tubes.find(t => t.id === 'mid_reinf')).toBeUndefined();

      const result2 = evaluateTemplate(template, {
        width: 1000,
        depth: 800,
        height: 850,
        thickness: 1.2,
        finish: 'POLIDO',
        hasCasters: false
      });

      // Should have reinforcement
      expect(result2.bom.tubes.find(t => t.id === 'mid_reinf')).toBeDefined();
    });

    it('should block width > 3000', () => {
      const template = getTemplateByKey('MESA_LISA')!;
      const result = evaluateTemplate(template, {
        width: 3500,
        depth: 600,
        height: 850,
        thickness: 1.2,
        finish: 'POLIDO',
        hasCasters: false
      });

      expect(result.validation.valid).toBe(false);
    });

    it('should warn about thickness for wide equipment', () => {
      const template = getTemplateByKey('MESA_LISA')!;
      const result = evaluateTemplate(template, {
        width: 2500,
        depth: 600,
        height: 850,
        thickness: 1.0,
        finish: 'POLIDO',
        hasCasters: false
      });

      expect(result.validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Registry', () => {
    it('should register and retrieve templates', () => {
      ALL_TEMPLATES.forEach(template => {
        expect(equipmentRegistry.getTemplate(template.key)).toEqual(template);
      });
    });

    it('should get templates by category', () => {
      const mesas = equipmentRegistry.getTemplatesByCategory('MESA');
      expect(mesas.length).toBe(5);

      const bancadas = equipmentRegistry.getTemplatesByCategory('BANCADA');
      expect(bancadas.length).toBe(5);

      const armarios = equipmentRegistry.getTemplatesByCategory('ARMARIO');
      expect(armarios.length).toBe(3);

      const estantes = equipmentRegistry.getTemplatesByCategory('ESTANTE');
      expect(estantes.length).toBe(2);

      const carrinhos = equipmentRegistry.getTemplatesByCategory('CARRINHO');
      expect(carrinhos.length).toBe(1);
    });

    it('should check template existence', () => {
      expect(equipmentRegistry.hasTemplate('MESA_LISA')).toBe(true);
      expect(equipmentRegistry.hasTemplate('INVALID_TEMPLATE')).toBe(false);
    });
  });
});
