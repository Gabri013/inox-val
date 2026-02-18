// ============================================================
// NESTING PIPELINE - Guillotine Best-Fit nesting algorithm
// ============================================================

import {
  SheetPart,
  NestingResult,
  SheetLayout,
  PlacedPart,

} from './pricing.types';
import { Material } from '../engine/types';
import { Ruleset } from '../engine/ruleset';
import { DEFAULT_RULESET } from '../engine/ruleset';

// ============================================================
// Nesting Types
// ============================================================

export interface NestablePart {
  id: string;
  originalId: string;
  width: number;
  height: number;
  allowRotate: boolean;
  grainDirection: 'x' | 'y' | null;
  thickness: number;
  materialKey: string;
  instanceIndex: number;
}

export interface AvailableSheet {
  id: string;
  materialKey: string;
  width: number;
  height: number;
  thickness: number;
  pricePerSheet?: number;
  pricePerKg?: number;
}

export interface NestingOptions {
  kerf: number;        // Cutting width in mm
  margin: number;      // Edge margin in mm
  allowRotate: boolean;
  minUtilization: number; // Minimum utilization percentage
}

export interface NestingError {
  code: string;
  message: string;
  partId?: string;
}

export interface NestingResultInternal {
  success: boolean;
  layouts: SheetLayout[];
  unplacedParts: string[];
  utilization: number;
  totalSheets: number;
  errors: NestingError[];
}

// ============================================================
// Default Options
// ============================================================

export const DEFAULT_NESTING_OPTIONS: NestingOptions = {
  kerf: 0.5,
  margin: 5,
  allowRotate: true,
  minUtilization: 70
};

// ============================================================
// Part Preparation
// ============================================================

/**
 * Convert BOM sheet parts to nestable parts
 */
export function prepareNestableParts(
  sheetParts: SheetPart[],
  geometryData: Map<string, { blank: { width: number; height: number } }>
): NestablePart[] {
  const nestable: NestablePart[] = [];
  
  for (const part of sheetParts) {
    // Get developed blank from geometry calculations
    const geometry = geometryData.get(part.id);
    const blank = geometry?.blank || part.blank;
    
    // Expand quantity into individual instances
    for (let i = 0; i < part.quantity; i++) {
      nestable.push({
        id: `${part.id}_${i}`,
        originalId: part.id,
        width: blank.width,
        height: blank.height,
        allowRotate: part.allowRotate,
        grainDirection: part.grainDirection,
        thickness: part.thickness,
        materialKey: part.materialKey,
        instanceIndex: i
      });
    }
  }
  
  return nestable;
}

/**
 * Group parts by material key
 */
export function groupPartsByMaterial(parts: NestablePart[]): Map<string, NestablePart[]> {
  const groups = new Map<string, NestablePart[]>();
  
  for (const part of parts) {
    const existing = groups.get(part.materialKey) || [];
    existing.push(part);
    groups.set(part.materialKey, existing);
  }
  
  return groups;
}

// ============================================================
// Sheet Selection
// ============================================================

/**
 * Get available sheets for a material
 */
export function getAvailableSheetsForMaterial(
  materialKey: string,
  materials: Material[]
): AvailableSheet[] {
  const sheets: AvailableSheet[] = [];
  
  for (const material of materials) {
    if (material.key === materialKey || material.key.startsWith(materialKey.split('#').slice(0, 4).join('#'))) {
      if (material.kind === 'sheet' && material.format) {
        // Get active price
        const now = new Date().toISOString();
        const activePrice = material.priceHistory.find(p => {
          const from = new Date(p.validFrom);
          const to = p.validTo ? new Date(p.validTo) : new Date('2099-12-31');
          return now >= from.toISOString() && now <= to.toISOString();
        });
        
        sheets.push({
          id: material.key,
          materialKey: material.key,
          width: material.format.widthMm,
          height: material.format.heightMm,
          thickness: material.thicknessMm || 1.2,
          pricePerSheet: activePrice?.pricePerSheet,
          pricePerKg: activePrice?.pricePerKg
        });
      }
    }
  }
  
  // If no exact match, create a default sheet
  if (sheets.length === 0) {
    sheets.push({
      id: materialKey,
      materialKey,
      width: 3000,
      height: 1250,
      thickness: 1.2,
      pricePerKg: 50 // Default price
    });
  }
  
  return sheets;
}

// ============================================================
// Guillotine Nesting Algorithm
// ============================================================

/**
 * Main nesting function using Guillotine Best-Fit
 */
export function runNesting(
  sheetParts: SheetPart[],
  materials: Material[],
  geometryData: Map<string, { blank: { width: number; height: number } }>,
  options: NestingOptions = DEFAULT_NESTING_OPTIONS,
  _ruleset: Ruleset = DEFAULT_RULESET
): NestingResult {
  // Prepare parts
  const nestableParts = prepareNestableParts(sheetParts, geometryData);
  
  // Group by material
  const partsByMaterial = groupPartsByMaterial(nestableParts);
  
  const allLayouts: SheetLayout[] = [];
  let totalUsedArea = 0;
  let totalSheetArea = 0;
  let totalWasteArea = 0;
  
  // Process each material group
  for (const [materialKey, parts] of partsByMaterial) {
    // Get available sheets for this material
    const availableSheets = getAvailableSheetsForMaterial(materialKey, materials);
    
    if (availableSheets.length === 0) {
      console.warn(`No sheets available for material: ${materialKey}`);
      continue;
    }
    
    // Sort parts by area (largest first) for better packing
    const sortedParts = [...parts].sort((a, b) => {
      return (b.width * b.height) - (a.width * a.height);
    });
    
    // Nest parts on sheets
    const result = nestPartsOnSheets(sortedParts, availableSheets, options);
    
    allLayouts.push(...result.layouts);
    totalUsedArea += result.totalUsedArea;
    totalSheetArea += result.totalSheetArea;
    totalWasteArea += result.totalWasteArea;
  }
  
  // Calculate overall utilization
  const utilization = totalSheetArea > 0 ? (totalUsedArea / totalSheetArea) * 100 : 0;
  
  return {
    layouts: allLayouts,
    totalSheets: allLayouts.length,
    utilization,
    wasteArea: totalWasteArea,
    wasteCost: 0 // Calculated later with material costs
  };
}

/**
 * Nest parts on available sheets using Guillotine algorithm
 */
function nestPartsOnSheets(
  parts: NestablePart[],
  sheets: AvailableSheet[],
  options: NestingOptions
): {
  layouts: SheetLayout[];
  totalUsedArea: number;
  totalSheetArea: number;
  totalWasteArea: number;
} {
  const layouts: SheetLayout[] = [];
  let totalUsedArea = 0;
  let totalSheetArea = 0;
  let totalWasteArea = 0;
  
  const remainingParts = [...parts];
  let sheetIndex = 0;
  
  // Use the first available sheet type (could be improved to select best fit)
  const sheet = sheets[0];
  
  while (remainingParts.length > 0) {
    const layout = nestOnSingleSheet(remainingParts, sheet, sheetIndex, options);
    
    if (layout.parts.length > 0) {
      layouts.push(layout);
      totalUsedArea += layout.usedArea;
      totalSheetArea += sheet.width * sheet.height;
      totalWasteArea += layout.wasteArea;
      sheetIndex++;
    } else {
      // No parts could be placed - this indicates a problem
      console.warn('Could not place remaining parts:', remainingParts.map(p => p.id));
      break;
    }
  }
  
  return {
    layouts,
    totalUsedArea,
    totalSheetArea,
    totalWasteArea
  };
}

/**
 * Nest parts on a single sheet using Guillotine method
 */
function nestOnSingleSheet(
  parts: NestablePart[],
  sheet: AvailableSheet,
  sheetIndex: number,
  options: NestingOptions
): SheetLayout {
  const placedParts: PlacedPart[] = [];
  const { kerf, margin, allowRotate } = options;
  
  // Usable area
  const usableWidth = sheet.width - 2 * margin;
  const usableHeight = sheet.height - 2 * margin;
  
  // Current position tracking
  let currentX = margin;
  let currentY = margin;
  let currentRowHeight = 0;
  
  const placedIndices = new Set<number>();
  
  // Try to place each part
  for (let i = 0; i < parts.length; i++) {
    if (placedIndices.has(i)) continue;
    
    const part = parts[i];
    
    // Try to place without rotation first
    let placed = tryPlacePart(
      part,
      currentX,
      currentY,
      usableWidth,
      usableHeight,
      currentRowHeight,
      kerf,
      margin,
      sheet,
      false,
      allowRotate
    );
    
    // Try with rotation if allowed and grain direction permits
    if (!placed && part.allowRotate && allowRotate) {
      const canRotate = part.grainDirection === null || part.grainDirection === undefined;
      if (canRotate) {
        placed = tryPlacePart(
          part,
          currentX,
          currentY,
          usableWidth,
          usableHeight,
          currentRowHeight,
          kerf,
          margin,
          sheet,
          true,
          allowRotate
        );
      }
    }
    
    if (placed) {
      placedParts.push(placed);
      placedIndices.add(i);
      
      // Update position
      const partWidth = placed.rotated ? part.height : part.width;
      const partHeight = placed.rotated ? part.width : part.height;
      
      currentX = placed.x + partWidth + kerf;
      currentRowHeight = Math.max(currentRowHeight, partHeight);
      
      // Check if we need to move to next row
      if (currentX > sheet.width - margin - partWidth) {
        currentX = margin;
        currentY += currentRowHeight + kerf;
        currentRowHeight = 0;
      }
    }
  }
  
  // Remove placed parts from the list
  for (let i = parts.length - 1; i >= 0; i--) {
    if (placedIndices.has(i)) {
      parts.splice(i, 1);
    }
  }
  
  // Calculate areas
  const sheetArea = sheet.width * sheet.height;
  const usedArea = placedParts.reduce((sum, p) => {
    const part = parts.find(pt => pt.id === p.partId);
    if (!part) return sum;
    const w = p.rotated ? part.height : part.width;
    const h = p.rotated ? part.width : part.height;
    return sum + w * h;
  }, 0);
  const wasteArea = sheetArea - usedArea;
  
  return {
    materialKey: sheet.materialKey,
    sheetIndex,
    sheetWidth: sheet.width,
    sheetHeight: sheet.height,
    parts: placedParts,
    usedArea,
    wasteArea
  };
}

/**
 * Try to place a part at a specific position
 */
function tryPlacePart(
  part: NestablePart,
  x: number,
  y: number,
  _usableWidth: number,
  _usableHeight: number,
  _currentRowHeight: number,
  _kerf: number,
  margin: number,
  sheet: AvailableSheet,
  rotate: boolean,
  globalAllowRotate: boolean
): PlacedPart | null {
  const width = rotate ? part.height : part.width;
  const height = rotate ? part.width : part.height;
  
  // Check if it fits in the usable area
  if (x + width > sheet.width - margin) return null;
  if (y + height > sheet.height - margin) return null;
  
  // Check if rotation is allowed
  if (rotate && !globalAllowRotate) return null;
  if (rotate && !part.allowRotate) return null;
  
  return {
    partId: part.id,
    x,
    y,
    width,
    height,
    rotated: rotate
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Calculate waste percentage
 */
export function calculateWastePercent(layout: SheetLayout): number {
  const totalArea = layout.sheetWidth * layout.sheetHeight;
  if (totalArea === 0) return 0;
  return (layout.wasteArea / totalArea) * 100;
}

/**
 * Get parts from a layout
 */
export function getPartsFromLayout(layout: SheetLayout): PlacedPart[] {
  return layout.parts;
}

/**
 * Check if a part fits on a sheet
 */
export function canPartFitOnSheet(
  partWidth: number,
  partHeight: number,
  sheetWidth: number,
  sheetHeight: number,
  margin: number
): boolean {
  const usableWidth = sheetWidth - 2 * margin;
  const usableHeight = sheetHeight - 2 * margin;
  
  return (partWidth <= usableWidth && partHeight <= usableHeight) ||
         (partHeight <= usableWidth && partWidth <= usableHeight);
}

/**
 * Estimate number of sheets needed
 */
export function estimateSheetCount(
  parts: NestablePart[],
  sheetWidth: number,
  sheetHeight: number,
  margin: number
): number {

  const usableArea = (sheetWidth - 2 * margin) * (sheetHeight - 2 * margin);
  
  const totalPartsArea = parts.reduce((sum, p) => sum + p.width * p.height, 0);
  
  // Assume 80% utilization for estimation
  const effectiveArea = usableArea * 0.8;
  
  return Math.ceil(totalPartsArea / effectiveArea);
}

/**
 * Get nesting statistics
 */
export function getNestingStats(result: NestingResult): {
  totalParts: number;
  totalSheets: number;
  avgUtilization: number;
  avgWastePercent: number;
} {
  const totalParts = result.layouts.reduce((sum, l) => sum + l.parts.length, 0);
  const avgUtilization = result.utilization;
  const avgWastePercent = 100 - avgUtilization;
  
  return {
    totalParts,
    totalSheets: result.totalSheets,
    avgUtilization,
    avgWastePercent
  };
}