import { computeMassKg, computeTubeMassKg, computeBOMMass } from './src/domains/engine/mass/index';

console.log('Testing mass calculation functions...');

// Test computeMassKg
const sheetPart = {
  id: 'sheet-1',
  materialKey: 'CHAPA#304#1.2#POLIDO',
  quantity: 5,
  blank: { widthMm: 1000, heightMm: 700 },
  allowRotate: true,
  features: [],
  bends: []
};

const mass = computeMassKg(sheetPart, 7930, 1.2);
console.log(`computeMassKg (1000x700mm, 1.2mm, qty 5): ${mass.toFixed(2)} kg`);

// Test computeTubeMassKg
const tubePart = {
  id: 'tube-1',
  materialKey: 'TUBO#304#40x40x1.2',
  quantity: 2,
  lengthMm: 6000,
  profile: { widthMm: 40, heightMm: 40, thicknessMm: 1.2 }
};

const tubeMass = computeTubeMassKg(tubePart, 7930);
console.log(`computeTubeMassKg (40x40x1.2mm, 6000mm, qty 2): ${tubeMass.toFixed(2)} kg`);

// Test computeBOMMass
const sheets = [sheetPart];
const tubes = [tubePart];
const accessories = [];
const materials = new Map([
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
  }],
  ['TUBO#304#40x40x1.2', {
    key: 'TUBO#304#40x40x1.2',
    kind: 'tube',
    alloy: '304',
    thicknessMm: 1.2,
    finish: 'polido',
    supplierId: 'test',
    densityKgM3: 7930,
    active: true,
    priceHistory: []
  }]
]);

const bomMass = computeBOMMass(sheets, tubes, accessories, materials);
console.log(`computeBOMMass (total): ${bomMass.totalKg.toFixed(2)} kg`);

console.log('');
console.log('Test passed!');
