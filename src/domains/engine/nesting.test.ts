import { describe, it, expect } from 'vitest';
import { nestGuillotine, preparePartsForNesting, NestablePart, Sheet } from './nesting/index';
import { SheetPart } from './types';


describe('Nesting Engine', () => {
  describe('nestGuillotine', () => {
    const defaultSheet: Sheet = {
      id: 'sheet-1',
      materialKey: 'CHAPA#304#1.2#POLIDO#3000x1250',
      widthMm: 3000,
      heightMm: 1250,
      available: true
    };
    
    it('retorna sucesso para lista vazia de peças', () => {
      const result = nestGuillotine([], [defaultSheet]);
      
      expect(result.success).toBe(true);
      expect(result.data?.sheets).toEqual([]);
    });
    
    it('retorna erro para lista vazia de chapas', () => {
      const parts: NestablePart[] = [{
        id: 'part-1',
        widthMm: 1000,
        heightMm: 700,
        allowRotate: true,
        originalPart: {} as SheetPart
      }];
      
      const result = nestGuillotine(parts, []);
      
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('NO_SHEETS');
    });
    
    it('coloca uma peça corretamente', () => {
      const parts: NestablePart[] = [{
        id: 'part-1',
        widthMm: 1000,
        heightMm: 700,
        allowRotate: true,
        originalPart: {} as SheetPart
      }];
      
      const result = nestGuillotine(parts, [defaultSheet]);
      
      expect(result.success).toBe(true);
      expect(result.data?.sheets.length).toBe(1);
      expect(result.data?.sheets[0].layout.length).toBe(1);
    });
    
    it('coloca múltiplas peças em uma chapa', () => {
      const parts: NestablePart[] = [
        { id: 'p1', widthMm: 1000, heightMm: 600, allowRotate: true, originalPart: {} as SheetPart },
        { id: 'p2', widthMm: 1000, heightMm: 600, allowRotate: true, originalPart: {} as SheetPart }
      ];
      
      const result = nestGuillotine(parts, [defaultSheet]);
      
      expect(result.success).toBe(true);
      expect(result.data?.sheets[0].layout.length).toBe(2);
    });
    
    it('usa múltiplas chapas quando necessário', () => {
      const parts: NestablePart[] = [
        { id: 'p1', widthMm: 2000, heightMm: 1000, allowRotate: false, originalPart: {} as SheetPart },
        { id: 'p2', widthMm: 2000, heightMm: 1000, allowRotate: false, originalPart: {} as SheetPart }
      ];
      
      const sheets = [defaultSheet, { ...defaultSheet, id: 'sheet-2' }];
      const result = nestGuillotine(parts, sheets);
      
      expect(result.success).toBe(true);
      expect(result.data?.sheets.length).toBe(2);
    });
    
    it('retorna erro quando peças não cabem', () => {
      const parts: NestablePart[] = [{
        id: 'huge-part',
        widthMm: 4000, // Maior que a chapa
        heightMm: 2000,
        allowRotate: false,
        originalPart: {} as SheetPart
      }];
      
      const result = nestGuillotine(parts, [defaultSheet]);
      
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('UNPLACED_PARTS');
    });
    
    it('respeita restrição de rotação', () => {
      const parts: NestablePart[] = [{
        id: 'part-no-rotate',
        widthMm: 1500,
        heightMm: 1000,
        allowRotate: false,
        grainDirection: 'x',
        originalPart: {} as SheetPart
      }];
      
      const result = nestGuillotine(parts, [defaultSheet]);
      
      expect(result.success).toBe(true);
      // Verificar que não foi rotacionada
      expect(result.data?.sheets[0].layout[0].rotation).toBe(0);
    });
    
    it('calcula aproveitamento', () => {
      const parts: NestablePart[] = [{
        id: 'part-1',
        widthMm: 1000,
        heightMm: 700,
        allowRotate: true,
        originalPart: {} as SheetPart
      }];
      
      const result = nestGuillotine(parts, [defaultSheet]);
      
      expect(result.data?.totalUtilization).toBeGreaterThan(0);
      expect(result.data?.totalUtilization).toBeLessThan(100);
    });
  });
  
  describe('preparePartsForNesting', () => {
    it('expande quantidade em peças individuais', () => {
      const bomParts: SheetPart[] = [{
        id: 'part-1',
        materialKey: 'CHAPA#304#1.2#POLIDO',
        quantity: 3,
        blank: { widthMm: 1000, heightMm: 700 },
        allowRotate: true,
        features: [],
        bends: []
      }];
      
      const result = preparePartsForNesting(bomParts, new Map());
      
      expect(result.length).toBe(3);
      expect(result[0].id).toBe('part-1_0');
      expect(result[1].id).toBe('part-1_1');
      expect(result[2].id).toBe('part-1_2');
    });
    
    it('usa blank calculado quando fornecido', () => {
      const bomParts: SheetPart[] = [{
        id: 'part-1',
        materialKey: 'CHAPA#304#1.2#POLIDO',
        quantity: 1,
        blank: { widthMm: 1000, heightMm: 700 },
        allowRotate: true,
        features: [],
        bends: []
      }];
      
      const calculatedBlanks = new Map([
        ['part-1', { widthMm: 1100, heightMm: 750 }] // Blank com desenvolvimento
      ]);
      
      const result = preparePartsForNesting(bomParts, calculatedBlanks);
      
      expect(result[0].widthMm).toBe(1100);
      expect(result[0].heightMm).toBe(750);
    });
  });
});