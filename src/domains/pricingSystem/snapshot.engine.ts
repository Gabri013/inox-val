// ============================================================
// SNAPSHOT ENGINE - Create auditable, reproducible pricing snapshots
// ============================================================

import {
  PricingResult,
  QuoteSnapshot,
  EquipmentInputs,


} from './pricing.types';
import { getTemplate } from './equipment.templates';

// ============================================================
// Hash Generation
// ============================================================

/**
 * Create a simple hash from a string (djb2 algorithm)
 * Used for generating deterministic hashes without external dependencies
 */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex and pad
  const hex = Math.abs(hash).toString(16);
  return hex.padStart(8, '0').substring(0, 8);
}

/**
 * Create a SHA256-like hash using Web Crypto API (if available)
 * Falls back to simple hash if not available
 */
export async function createSHA256Hash(data: string): Promise<string> {
  // Check if we're in a browser environment with crypto.subtle
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fall back to simple hash
    }
  }
  
  // Node.js environment or fallback
  return createSimpleHash(data);
}

/**
 * Create a simple deterministic hash (synchronous)
 */
export function createSimpleHash(data: string): string {
  // Use multiple passes for better distribution
  let hash = simpleHash(data);
  hash = simpleHash(hash + data);
  hash = simpleHash(hash + data);
  
  // Create a longer hash by combining multiple rounds
  const parts: string[] = [];
  for (let i = 0; i < 8; i++) {
    parts.push(simpleHash(hash + i.toString() + data));
  }
  
  return parts.join('');
}

/**
 * Create hash from pricing result (synchronous version for pipeline)
 */
export function createHashFromResult(result: PricingResult): string {
  const data = JSON.stringify({
    equipmentType: result.equipmentType,
    inputs: result.inputs,
    bom: result.bom,
    nestingResult: result.nestingResult,
    totalMaterialCost: result.totalMaterialCost,
    totalProcessCost: result.totalProcessCost,
    totalCost: result.totalCost,
    finalPrice: result.finalPrice,
    rulesetVersion: result.rulesetVersion,
    timestamp: result.timestamp
  }, Object.keys(result).sort());
  
  return createSimpleHash(data);
}

// ============================================================
// Snapshot Creation
// ============================================================

/**
 * Create a snapshot from a pricing result
 */
export function createSnapshot(
  result: PricingResult,
  options?: {
    createdBy?: string;
    companyId?: string;
    customerId?: string;
    customerName?: string;
  }
): QuoteSnapshot {
  const template = getTemplate(result.equipmentType);
  
  // Extract material prices from result
  const materialPrices = result.materialCost.map(mc => ({
    key: mc.materialKey,
    price: mc.totalCost,
    pricePerKg: mc.pricePerKg,
    pricePerSheet: mc.pricePerSheet,
    currency: 'BRL',
    supplierId: 'DEFAULT',
    validFrom: result.timestamp,
    validTo: undefined
  }));
  
  // Extract process costs from result
  const processCosts = result.processCost.map(pc => ({
    key: pc.processKey,
    costPerHour: 100, // Default, would come from process data
    costPerUnit: pc.unitCost > 0 ? pc.unitCost : undefined,
    costPerMeter: undefined,
    costPerBend: undefined,
    costPerM2: undefined
  }));
  
  const snapshot: QuoteSnapshot = {
    id: generateSnapshotId(),
    version: '1.0.0',
    createdAt: result.timestamp,
    createdBy: options?.createdBy,
    companyId: options?.companyId,
    
    equipmentType: result.equipmentType,
    equipmentLabel: template?.label || result.equipmentType,
    
    inputs: result.inputs,
    bom: result.bom,
    
    materialPrices,
    processCosts,
    
    rulesetVersion: result.rulesetVersion,
    
    nestingResult: result.nestingResult,
    
    costs: {
      materialUsed: result.totalMaterialCost - result.overhead.totalOverhead,
      materialWaste: result.nestingResult.wasteCost,
      materialTotal: result.totalMaterialCost,
      processTotal: result.totalProcessCost,
      overhead: result.overhead.totalOverhead,
      totalCost: result.totalCost
    },
    
    pricing: {
      method: result.margin.method,
      marginPercent: result.margin.marginPercent,
      discount: result.margin.discountApplied,
      finalPrice: result.finalPrice,
      minPrice: result.minPrice
    },
    
    hash: result.hash
  };
  
  return snapshot;
}

/**
 * Generate a unique snapshot ID
 */
function generateSnapshotId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `Q-${timestamp}-${random}`.toUpperCase();
}

// ============================================================
// Snapshot Verification
// ============================================================

/**
 * Verify snapshot integrity
 */
export function verifySnapshot(snapshot: QuoteSnapshot): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!snapshot.id) {
    errors.push('Snapshot ID is missing');
  }
  
  if (!snapshot.createdAt) {
    errors.push('Creation timestamp is missing');
  }
  
  if (!snapshot.equipmentType) {
    errors.push('Equipment type is missing');
  }
  
  if (!snapshot.bom) {
    errors.push('BOM is missing');
  }
  
  if (!snapshot.hash) {
    errors.push('Hash is missing');
  }
  
  // Verify hash
  if (snapshot.hash) {
    const recalculatedHash = createHashFromSnapshotData(snapshot);
    if (recalculatedHash !== snapshot.hash) {
      errors.push('Hash verification failed - snapshot may have been modified');
    }
  }
  
  // Check BOM integrity
  if (snapshot.bom) {
    if (snapshot.bom.sheetParts.length === 0 && 
        snapshot.bom.tubes.length === 0 && 
        snapshot.bom.accessories.length === 0) {
      warnings.push('BOM is empty');
    }
  }
  
  // Check pricing integrity
  if (snapshot.pricing) {
    if (snapshot.pricing.finalPrice <= 0) {
      errors.push('Final price must be positive');
    }
    
    if (snapshot.pricing.finalPrice < snapshot.pricing.minPrice) {
      warnings.push('Final price is below minimum price');
    }
  }
  
  // Check costs integrity
  if (snapshot.costs) {
    const calculatedTotal = snapshot.costs.materialTotal + 
                            snapshot.costs.processTotal + 
                            snapshot.costs.overhead;
    
    if (Math.abs(calculatedTotal - snapshot.costs.totalCost) > 0.01) {
      warnings.push('Cost totals do not match');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Create hash from snapshot data for verification
 */
function createHashFromSnapshotData(snapshot: QuoteSnapshot): string {
  const data = JSON.stringify({
    equipmentType: snapshot.equipmentType,
    inputs: snapshot.inputs,
    bom: snapshot.bom,
    nestingResult: snapshot.nestingResult,
    costs: snapshot.costs,
    pricing: snapshot.pricing,
    rulesetVersion: snapshot.rulesetVersion,
    createdAt: snapshot.createdAt
  });
  
  return createSimpleHash(data);
}

// ============================================================
// Snapshot Rebuild
// ============================================================

/**
 * Rebuild pricing result from snapshot
 */
export function rebuildFromSnapshot(snapshot: QuoteSnapshot): PricingResult {

  
  return {
    equipmentType: snapshot.equipmentType,
    inputs: snapshot.inputs,
    bom: snapshot.bom,
    nestingResult: snapshot.nestingResult,
    materialCost: snapshot.materialPrices.map(mp => ({
      materialKey: mp.key,
      sheetsUsed: 0, // Not stored in snapshot
      totalKg: 0,
      usedKg: 0,
      wasteKg: 0,
      pricePerKg: mp.pricePerKg || 0,
      pricePerSheet: mp.pricePerSheet,
      materialCost: mp.price,
      wasteCost: 0,
      totalCost: mp.price
    })),
    processCost: snapshot.processCosts.map(pc => ({
      processKey: pc.key,
      processLabel: pc.key,
      setupCost: 0,
      unitCost: pc.costPerUnit || 0,
      totalCost: 0,
      estimatedMinutes: 0,
      details: ''
    })),
    overhead: {
      overheadPercent: 10, // Default
      materialOverhead: snapshot.costs.overhead * 0.5,
      processOverhead: snapshot.costs.overhead * 0.5,
      totalOverhead: snapshot.costs.overhead
    },
    margin: {
      method: snapshot.pricing.method as 'markup' | 'target-margin' | 'minimum-profit',
      marginPercent: snapshot.pricing.marginPercent,
      markupPercent: 0,
      marginValue: snapshot.pricing.finalPrice - snapshot.costs.totalCost,
      discountApplied: snapshot.pricing.discount
    },
    totalMaterialCost: snapshot.costs.materialTotal,
    totalProcessCost: snapshot.costs.processTotal,
    totalCost: snapshot.costs.totalCost,
    finalPrice: snapshot.pricing.finalPrice,
    minPrice: snapshot.pricing.minPrice,
    rulesetVersion: snapshot.rulesetVersion,
    timestamp: snapshot.createdAt,
    hash: snapshot.hash,
    warnings: [],
    errors: []
  };
}

// ============================================================
// Snapshot Serialization
// ============================================================

/**
 * Serialize snapshot to JSON
 */
export function serializeSnapshot(snapshot: QuoteSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Deserialize snapshot from JSON
 */
export function deserializeSnapshot(json: string): QuoteSnapshot | null {
  try {
    const snapshot = JSON.parse(json) as QuoteSnapshot;
    
    // Validate structure
    const verification = verifySnapshot(snapshot);
    if (!verification.valid) {
      console.error('Snapshot verification failed:', verification.errors);
      return null;
    }
    
    return snapshot;
  } catch (error) {
    console.error('Failed to deserialize snapshot:', error);
    return null;
  }
}

/**
 * Export snapshot for download
 */
export function exportSnapshot(snapshot: QuoteSnapshot): Blob {
  const json = serializeSnapshot(snapshot);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Download snapshot as file
 */
export function downloadSnapshot(snapshot: QuoteSnapshot, filename?: string): void {
  const blob = exportSnapshot(snapshot);
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `orcamento-${snapshot.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// Snapshot Comparison
// ============================================================

export interface SnapshotDiff {
  identical: boolean;
  changes: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
}

/**
 * Compare two snapshots
 */
export function compareSnapshots(
  snapshot1: QuoteSnapshot,
  snapshot2: QuoteSnapshot
): SnapshotDiff {
  const changes: { field: string; oldValue: unknown; newValue: unknown }[] = [];
  
  // Compare basic fields
  const fieldsToCompare = [
    'equipmentType',
    'rulesetVersion',
    'createdAt'
  ];
  
  for (const field of fieldsToCompare) {
    if (snapshot1[field as keyof QuoteSnapshot] !== snapshot2[field as keyof QuoteSnapshot]) {
      changes.push({
        field,
        oldValue: snapshot1[field as keyof QuoteSnapshot],
        newValue: snapshot2[field as keyof QuoteSnapshot]
      });
    }
  }
  
  // Compare inputs
  const inputs1 = snapshot1.inputs;
  const inputs2 = snapshot2.inputs;
  
  const inputFields: (keyof EquipmentInputs)[] = [
    'width', 'depth', 'height', 'thickness', 'finish',
    'hasShelf', 'hasBacksplash', 'backsplashHeight', 'hasCasters'
  ];
  
  for (const field of inputFields) {
    if (inputs1[field] !== inputs2[field]) {
      changes.push({
        field: `inputs.${field}`,
        oldValue: inputs1[field],
        newValue: inputs2[field]
      });
    }
  }
  
  // Compare costs
  if (snapshot1.costs.totalCost !== snapshot2.costs.totalCost) {
    changes.push({
      field: 'costs.totalCost',
      oldValue: snapshot1.costs.totalCost,
      newValue: snapshot2.costs.totalCost
    });
  }
  
  // Compare pricing
  if (snapshot1.pricing.finalPrice !== snapshot2.pricing.finalPrice) {
    changes.push({
      field: 'pricing.finalPrice',
      oldValue: snapshot1.pricing.finalPrice,
      newValue: snapshot2.pricing.finalPrice
    });
  }
  
  return {
    identical: changes.length === 0,
    changes
  };
}