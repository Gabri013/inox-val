// ============================================================
// QUOTE ENGINE TESTS
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createQuoteDraft, 
  finalizeQuote,
  QuoteDraftInput,

} from './index';
import { BOM, Material, Process } from '../types';
import { Sheet } from '../nesting';


describe('Quote Engine', () => {
  let materials: Map<string, Material>;
  let processes: Map<string, Process>;
  let availableSheets: Sheet[];
  let bom: BOM;

  beforeEach(() => {
    // Setup materials
    materials = new Map<string, Material>();
    materials.set('CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X', {
      key: 'CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X',
      kind: 'sheet',
      alloy: '304',
      thicknessMm: 1.2,
      finish: 'POLIDO',
      format: {
        widthMm: 3000,
        heightMm: 1250,
        supplierFormatName: '3000x1250'
      },
      supplierId: 'FORN_X',
      densityKgM3: 7930,
      active: true,
      priceHistory: [{
        currency: 'BRL',
        pricePerKg: 25,
        supplierId: 'FORN_X',
        validFrom: '2024-01-01',
        updatedAt: '2024-01-01'
      }]
    });

    // Setup processes
    processes = new Map<string, Process>();
    processes.set('CORTE_LASER', {
      key: 'CORTE_LASER',
      label: 'Corte a Laser',
      active: true,
      costModel: {
        setupMinutes: 15,
        costPerHour: 180,
        costPerMeter: 2.5
      }
    });
    processes.set('DOBRA', {
      key: 'DOBRA',
      label: 'Dobra',
      active: true,
      costModel: {
        setupMinutes: 10,
        costPerHour: 120,
        costPerBend: 5
      }
    });
    processes.set('MONTAGEM', {
      key: 'MONTAGEM',
      label: 'Montagem',
      active: true,
      costModel: {
        setupMinutes: 30,
        costPerHour: 80
      }
    });
    processes.set('EMBALAGEM', {
      key: 'EMBALAGEM',
      label: 'Embalagem',
      active: true,
      costModel: {
        setupMinutes: 10,
        costPerHour: 60
      }
    });

    // Setup available sheets
    availableSheets = [{
      id: 'sheet-1',
      materialKey: 'CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X',
      widthMm: 3000,
      heightMm: 1250,
      available: true
    }];

    // Setup BOM
    bom = {
      sheets: [{
        id: 'part-1',
        materialKey: 'CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X',
        quantity: 2,
        blank: { widthMm: 500, heightMm: 300 },
        allowRotate: true,
        grainDirection: null,
        features: [],
        bends: []
      }],
      tubes: [],
      accessories: [],
      processes: ['CORTE_LASER', 'MONTAGEM', 'EMBALAGEM']
    };
  });

  describe('createQuoteDraft', () => {
    it('should create a valid draft with correct calculations', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const result = createQuoteDraft(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.valid).toBe(true);
      expect(result.data!.bom).toEqual(bom);
    });

    it('should calculate geometry for sheet parts', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const result = createQuoteDraft(input);

      expect(result.success).toBe(true);
      expect(result.data!.geometry.sheets).toHaveLength(1);
      expect(result.data!.geometry.sheets[0].partId).toBe('part-1');
      expect(result.data!.geometry.sheets[0].areaMm2).toBe(500 * 300);
      expect(result.data!.geometry.sheets[0].blank).toEqual({ widthMm: 500, heightMm: 300 });
    });

    it('should calculate mass correctly', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const result = createQuoteDraft(input);

      expect(result.success).toBe(true);
      expect(result.data!.mass.totalKg).toBeGreaterThan(0);
      expect(result.data!.mass.byMaterial.size).toBe(1);
    });

    it('should perform nesting successfully', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const result = createQuoteDraft(input);

      expect(result.success).toBe(true);
      expect(result.data!.nesting.success).toBe(true);
      expect(result.data!.nesting.result).toBeDefined();
    });

    it('should calculate costs correctly', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const result = createQuoteDraft(input);

      expect(result.success).toBe(true);
      expect(result.data!.costs.material.total).toBeGreaterThan(0);
      expect(result.data!.costs.process.total).toBeGreaterThan(0);
      expect(result.data!.costs.overhead).toBeGreaterThan(0);
      expect(result.data!.costs.total).toBeGreaterThan(0);
    });

    it('should calculate pricing correctly', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const result = createQuoteDraft(input);

      expect(result.success).toBe(true);
      expect(result.data!.pricing.targetPrice).toBeGreaterThan(result.data!.costs.total);
      expect(result.data!.pricing.margin).toBeGreaterThan(0);
    });

    it('should fail when material not found', () => {
      const invalidBom: BOM = {
        ...bom,
        sheets: [{
          ...bom.sheets[0],
          materialKey: 'INVALID_KEY'
        }]
      };

      const input: QuoteDraftInput = {
        bom: invalidBom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const result = createQuoteDraft(input);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn when no active price available', () => {
      // Material without price history
      materials.set('CHAPA#SS304#1.5#2B#3000x1250#FORN_Y', {
        key: 'CHAPA#SS304#1.5#2B#3000x1250#FORN_Y',
        kind: 'sheet',
        alloy: '304',
        thicknessMm: 1.5,
        finish: '2B',
        format: {
          widthMm: 3000,
          heightMm: 1250,
          supplierFormatName: '3000x1250'
        },
        supplierId: 'FORN_Y',
        densityKgM3: 7930,
        active: true,
        priceHistory: []
      });

      const bomWithNoPrice: BOM = {
        ...bom,
        sheets: [{
          ...bom.sheets[0],
          materialKey: 'CHAPA#SS304#1.5#2B#3000x1250#FORN_Y'
        }]
      };

      const input: QuoteDraftInput = {
        bom: bomWithNoPrice,
        materials,
        processes,
        availableSheets: [{
          id: 'sheet-2',
          materialKey: 'CHAPA#SS304#1.5#2B#3000x1250#FORN_Y',
          widthMm: 3000,
          heightMm: 1250,
          available: true
        }],
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const result = createQuoteDraft(input);

      expect(result.warnings.some(w => w.code === 'NO_ACTIVE_PRICE')).toBe(true);
    });
  });

  describe('finalizeQuote', () => {
    it('should create a valid snapshot', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const draftResult = createQuoteDraft(input);
      const snapshot = finalizeQuote(
        draftResult.data!,
        input,
        'user-1',
        'company-1'
      );

      expect(snapshot.id).toBeDefined();
      expect(snapshot.version).toBe('1.0.0');
      expect(snapshot.createdAt).toBeDefined();
      expect(snapshot.createdBy).toBe('user-1');
      expect(snapshot.companyId).toBe('company-1');
      expect(snapshot.customerId).toBe('customer-1');
      expect(snapshot.customerName).toBe('Cliente Teste');
      expect(snapshot.quoteNumber).toMatch(/^ORC-\d{6}-\d{4}$/);
      expect(snapshot.hash).toBeDefined();
      expect(snapshot.auditEvents).toHaveLength(1);
      expect(snapshot.auditEvents[0].action).toBe('QUOTE_CREATED');
    });

    it('should include material prices in snapshot', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const draftResult = createQuoteDraft(input);
      const snapshot = finalizeQuote(
        draftResult.data!,
        input,
        'user-1',
        'company-1'
      );

      expect(snapshot.materialPrices.length).toBeGreaterThan(0);
      expect(snapshot.materialPrices[0].key).toBeDefined();
      expect(snapshot.materialPrices[0].price).toBeDefined();
    });

    it('should include costs in snapshot', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const draftResult = createQuoteDraft(input);
      const snapshot = finalizeQuote(
        draftResult.data!,
        input,
        'user-1',
        'company-1'
      );

      expect(snapshot.costs.materialTotal).toBeGreaterThan(0);
      expect(snapshot.costs.processTotal).toBeGreaterThan(0);
      expect(snapshot.costs.total).toBeGreaterThan(0);
    });

    it('should generate unique quote numbers', () => {
      const input: QuoteDraftInput = {
        bom,
        materials,
        processes,
        availableSheets,
        quoteDate: '2024-06-15',
        customerId: 'customer-1',
        customerName: 'Cliente Teste'
      };

      const draftResult = createQuoteDraft(input);
      const snapshot1 = finalizeQuote(draftResult.data!, input, 'user-1', 'company-1');
      const snapshot2 = finalizeQuote(draftResult.data!, input, 'user-1', 'company-1');

      expect(snapshot1.quoteNumber).not.toBe(snapshot2.quoteNumber);
    });
  });
});