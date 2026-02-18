import { describe, it, expect } from 'vitest';
import { getDensity, computeMassKg, computeTubeMassKg, computeBOMMass } from './mass/index';
import { SheetPart, TubePart, Material } from './types';

describe('Mass Engine', () => {
  describe('getDensity', () => {
    it('retorna densidade padrão para aço inox 304', () => {
      expect(getDensity('304')).toBe(7930);
    });
    
    it('retorna densidade padrão para aço inox 316L', () => {
      expect(getDensity('316L')).toBe(8000);
    });
    
    it('usa densidade do material quando fornecida', () => {
      const material: Material = {
        key: 'test',
        kind: 'sheet',
        alloy: '304',
        finish: 'polido',
        supplierId: 'test',
        densityKgM3: 8000,
        active: true,
        priceHistory: []
      };
      
      expect(getDensity('304', material)).toBe(8000);
    });
  });
  
  describe('computeMassKg', () => {
    it('calcula massa de chapa corretamente', () => {
      const part: SheetPart = {
        id: 'sheet-1',
        materialKey: 'CHAPA#304#1.2#POLIDO',
        quantity: 1,
        blank: { widthMm: 1000, heightMm: 700 },
        allowRotate: true,
        features: [],
        bends: []
      };
      
      const mass = computeMassKg(part, 7930, 1.2);
      
      // Área = 0.7m², espessura = 0.0012m
      // Massa = 0.7 * 0.0012 * 7930 = 6.6612 kg
      expect(mass).toBeCloseTo(6.66, 1);
    });
    
    it('multiplica pela quantidade', () => {
      const part: SheetPart = {
        id: 'sheet-2',
        materialKey: 'CHAPA#304#1.2#POLIDO',
        quantity: 5,
        blank: { widthMm: 1000, heightMm: 700 },
        allowRotate: true,
        features: [],
        bends: []
      };
      
      const mass = computeMassKg(part, 7930, 1.2);
      expect(mass).toBeCloseTo(33.3, 1);
    });
  });
  
  describe('computeTubeMassKg', () => {
    it('calcula massa de tubo corretamente', () => {
      const tube: TubePart = {
        id: 'tube-1',
        materialKey: 'TUBO#304#40x40x1.2',
        quantity: 1,
        lengthMm: 6000,
        profile: { widthMm: 40, heightMm: 40, thicknessMm: 1.2 }
      };
      
      const mass = computeTubeMassKg(tube, 7930);
      
      // Perímetro = 160mm, área = 192mm² = 0.000192m²
      // Comprimento = 6m
      // Massa = 0.000192 * 6 * 7930 = 9.14 kg
      expect(mass).toBeCloseTo(9.14, 1);
    });
  });
  
  describe('computeBOMMass', () => {
    it('calcula massa total do BOM', () => {
      const sheets: SheetPart[] = [
        {
          id: 'sheet-1',
          materialKey: 'CHAPA#304#1.2#POLIDO',
          quantity: 2,
          blank: { widthMm: 1000, heightMm: 700 },
          allowRotate: true,
          features: [],
          bends: []
        }
      ];
      
      const materials = new Map<string, Material>([
        ['CHAPA#304#1.2#POLIDO', {
          key: 'CHAPA#304#1.2#POLIDO',
          kind: 'sheet',
          alloy: '304',
          thicknessMm: 1.2,
          finish: 'polido',
          supplierId: 'test',
          densityKgM3: 7930,
          active: true,
          priceHistory: []
        }]
      ]);
      
      const result = computeBOMMass(sheets, [], [], materials);
      
      expect(result.totalKg).toBeCloseTo(66.6, 1);
    });
  });
});
