// ============================================================
// PRICING SYSTEM TYPES - Core type definitions for equipment pricing
// ============================================================

import { ProcessKey } from '../engine/types';
import type { Material, Process } from '../engine/types';

export type { Material, Process };
import { Ruleset } from '../engine/ruleset';

// ============================================================
// Equipment Template Types
// ============================================================

export type EquipmentCategory = 'MESA' | 'BANCADA' | 'ARMARIO' | 'ESTANTE' | 'CARRINHO';

export interface InputField {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'select';
  unit?: string;
  default?: unknown;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
}

export interface EquipmentInputs {
  width: number;      // mm
  depth: number;      // mm
  height: number;     // mm
  thickness: number;  // mm
  finish: 'POLIDO' | 'ESCOVADO' | '2B';
  hasShelf?: boolean;
  hasBacksplash?: boolean;
  backsplashHeight?: number;
  hasCasters?: boolean;
  shelfCount?: number;
  doorCount?: number;
  trayCount?: number;
}

export interface StructuralRule {
  id: string;
  condition: string;  // e.g., "depth > 700"
  action: 'ADD_TUBE' | 'ADD_SHEET' | 'REQUIRE_MIN_THICKNESS' | 'BLOCK';
  params: Record<string, unknown>;
  message: string;
}

export interface ProcessRule {
  processKey: ProcessKey;
  condition?: string;
  params: Record<string, unknown>;
}

export interface EquipmentTemplate {
  key: string;
  label: string;
  category: EquipmentCategory;
  description: string;
  requiredInputs: InputField[];
  generateBOM: (inputs: EquipmentInputs) => BOM;
  structuralRules: StructuralRule[];
  processRules: ProcessRule[];
}

// ============================================================
// BOM Types (Bill of Materials)
// ============================================================

export interface PartFeature {
  type: 'hole' | 'cut' | 'notch';
  position: { x: number; y: number };
  dimensions: { 
    widthMm: number; 
    heightMm: number; 
    diameterMm?: number 
  };
}

export interface Bend {
  angle: number;           // degrees (90, 45, etc)
  position: number;        // mm from edge
  direction: 'up' | 'down';
  kFactor?: number;        // default 0.33
}

export interface SheetPart {
  id: string;
  label: string;
  materialKey: string;
  quantity: number;
  blank: { width: number; height: number };
  thickness: number;
  allowRotate: boolean;
  grainDirection: 'x' | 'y' | null;
  features: PartFeature[];
  bends: Bend[];
}

export interface TubePart {
  id: string;
  label: string;
  materialKey: string;
  quantity: number;
  length: number;  // mm
  profile: string; // e.g., "40x40x1.2"
}

export interface AccessoryPart {
  id: string;
  label: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export interface ProcessRequirement {
  processKey: ProcessKey;
  partId: string;
  metrics: {
    cutLength?: number;
    weldLength?: number;
    bendCount?: number;
    finishArea?: number;
  };
}

export interface BOM {
  sheetParts: SheetPart[];
  tubes: TubePart[];
  accessories: AccessoryPart[];
  processes: ProcessRequirement[];
}

// ============================================================
// Nesting Types
// ============================================================

export interface PlacedPart {
  partId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

export interface SheetLayout {
  materialKey: string;
  sheetIndex: number;
  sheetWidth: number;
  sheetHeight: number;
  parts: PlacedPart[];
  usedArea: number;
  wasteArea: number;
}

export interface NestingResult {
  layouts: SheetLayout[];
  totalSheets: number;
  utilization: number;
  wasteArea: number;
  wasteCost: number;
}

// ============================================================
// Cost Breakdown Types
// ============================================================

export interface MaterialCostBreakdown {
  materialKey: string;
  sheetsUsed: number;
  totalKg: number;
  usedKg: number;
  wasteKg: number;
  pricePerKg: number;
  pricePerSheet?: number;
  materialCost: number;
  wasteCost: number;
  totalCost: number;
}

export interface ProcessCostBreakdown {
  processKey: ProcessKey;
  processLabel: string;
  setupCost: number;
  unitCost: number;
  totalCost: number;
  estimatedMinutes: number;
  details: string;
}

export interface OverheadBreakdown {
  overheadPercent: number;
  materialOverhead: number;
  processOverhead: number;
  totalOverhead: number;
}

export interface MarginBreakdown {
  method: 'markup' | 'target-margin' | 'minimum-profit' | 'max-discount';
  marginPercent: number;
  markupPercent: number;
  marginValue: number;
  discountApplied: number;
}

// ============================================================
// Pricing Result Types
// ============================================================

export interface PricingResult {
  equipmentType: string;
  inputs: EquipmentInputs;
  bom: BOM;
  nestingResult: NestingResult;
  materialCost: MaterialCostBreakdown[];
  processCost: ProcessCostBreakdown[];
  overhead: OverheadBreakdown;
  margin: MarginBreakdown;
  totalMaterialCost: number;
  totalProcessCost: number;
  totalCost: number;
  finalPrice: number;
  minPrice: number;
  rulesetVersion: string;
  timestamp: string;
  hash: string;
  warnings: string[];
  errors: string[];
}

// ============================================================
// Snapshot Types
// ============================================================

export interface QuoteSnapshot {
  id: string;
  version: string;
  createdAt: string;
  createdBy?: string;
  companyId?: string;
  
  // Equipment info
  equipmentType: string;
  equipmentLabel: string;
  
  // Inputs used
  inputs: EquipmentInputs;
  
  // BOM used
  bom: BOM;
  
  // Material prices at time of quote
  materialPrices: {
    key: string;
    price: number;
    pricePerKg?: number;
    pricePerSheet?: number;
    currency: string;
    supplierId: string;
    validFrom: string;
    validTo?: string;
  }[];
  
  // Process costs at time of quote
  processCosts: {
    key: ProcessKey;
    costPerHour: number;
    costPerUnit?: number;
    costPerMeter?: number;
    costPerBend?: number;
    costPerM2?: number;
  }[];
  
  // Ruleset version
  rulesetVersion: string;
  
  // Nesting result
  nestingResult: NestingResult;
  
  // Cost breakdown
  costs: {
    materialUsed: number;
    materialWaste: number;
    materialTotal: number;
    processTotal: number;
    overhead: number;
    totalCost: number;
  };
  
  // Pricing
  pricing: {
    method: string;
    marginPercent: number;
    discount: number;
    finalPrice: number;
    minPrice: number;
  };
  
  // Hash for verification
  hash: string;
}

// ============================================================
// Validation Types
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
}

// ============================================================
// Pipeline Context Types
// ============================================================

export interface PricingContext {
  materials: Material[];
  processes: Process[];
  ruleset: Ruleset;
  quoteDate: string;
  userId?: string;
  companyId?: string;
}

export interface BOMWithGeometry extends BOM {
  geometryData: Map<string, {
    partId: string;
    areaMm2: number;
    cutLengthMm: number;
    massKg: number;
    blank: { width: number; height: number };
    bendCount: number;
    finishAreaMm2: number;
  }>;
}
