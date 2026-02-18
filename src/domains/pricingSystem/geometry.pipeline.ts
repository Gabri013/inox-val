// ============================================================
// GEOMETRY PIPELINE - Calculate geometric properties for BOM parts
// ============================================================

import {
  BOM,
  BOMWithGeometry,
  SheetPart,
  TubePart,
  Bend,

} from './pricing.types';
import { DEFAULT_DENSITIES } from '../engine/mass';

// ============================================================
// Geometry Types
// ============================================================

export interface GeometryData {
  partId: string;
  areaMm2: number;
  cutLengthMm: number;
  massKg: number;
  blank: { width: number; height: number };
  bendCount: number;
  finishAreaMm2: number;
}

export interface GeometryResult {
  success: boolean;
  bomWithGeometry: BOMWithGeometry;
  geometryData: GeometryData[];
  totalAreaMm2: number;
  totalCutLengthMm: number;
  totalMassKg: number;
  totalBendCount: number;
  totalFinishAreaMm2: number;
}

// ============================================================
// Area Calculations
// ============================================================

/**
 * Calculate the 2D area of a sheet part in mm²
 * Accounts for holes and cutouts
 */
export function computeAreaMm2(part: SheetPart): number {
  const blankArea = part.blank.width * part.blank.height;
  
  // Subtract area of holes and cutouts
  let cutArea = 0;
  for (const feature of part.features) {
    if (feature.type === 'hole' && feature.dimensions.diameterMm) {
      // Circular hole
      cutArea += Math.PI * Math.pow(feature.dimensions.diameterMm / 2, 2);
    } else if (feature.type === 'cut' || feature.type === 'notch') {
      // Rectangular cutout
      cutArea += feature.dimensions.widthMm * feature.dimensions.heightMm;
    }
  }
  
  return Math.max(0, blankArea - cutArea);
}

/**
 * Calculate the total surface area for finishing (both sides)
 */
export function computeFinishAreaMm2(part: SheetPart): number {
  const area = computeAreaMm2(part);
  // Both sides of the sheet
  return area * 2;
}

// ============================================================
// Cut Length Calculations
// ============================================================

/**
 * Calculate the total cut length in mm
 * For parts without bends = perimeter of blank
 * For parts with bends = sum of cut edges only
 */
export function computeCutLengthMm(part: SheetPart): number {
  const blankPerimeter = 2 * (part.blank.width + part.blank.height);
  
  // If no bends, entire perimeter is cut
  if (part.bends.length === 0) {
    return blankPerimeter;
  }
  
  // With bends, subtract edges that become bends
  // Assume bends are along the width dimension
  let bendEdgeLength = 0;
  for (const _bend of part.bends) {
    // Each bend replaces a cut edge
    bendEdgeLength += part.blank.height;
  }
  
  return Math.max(0, blankPerimeter - bendEdgeLength);
}

// ============================================================
// Blank Development (for bent parts)
// ============================================================

/**
 * Calculate the developed blank size for a bent part
 * Uses K-factor method for bend allowance
 */
export function computeBlank(
  partWidth: number,
  partHeight: number,
  bends: Bend[],
  thickness: number,
  kFactor: number = 0.33
): { width: number; height: number } {
  if (bends.length === 0) {
    return { width: partWidth, height: partHeight };
  }
  
  let totalDevelopment = 0;
  
  for (const bend of bends) {
    // Bend allowance calculation
    // BA = angle * (insideRadius + kFactor * thickness)
    // Simplified: assume inside radius = thickness
    const angleRad = (bend.angle * Math.PI) / 180;
    const insideRadius = thickness;
    const bendAllowance = angleRad * (insideRadius + kFactor * thickness);
    totalDevelopment += bendAllowance;
  }
  
  // Developed width = sum of flat segments + bend allowances
  const developedWidth = partWidth + totalDevelopment;
  
  return {
    width: Math.ceil(developedWidth),
    height: partHeight
  };
}

// ============================================================
// Mass Calculations
// ============================================================

/**
 * Calculate mass of a sheet part in kg
 */
export function computeSheetMassKg(
  part: SheetPart,
  densityKgM3: number,
  thickness: number
): number {
  // Area in mm² -> m²
  const areaM2 = (part.blank.width * part.blank.height) / 1_000_000;
  
  // Thickness in mm -> m
  const thicknessM = thickness / 1000;
  
  // Mass = area * thickness * density
  return areaM2 * thicknessM * densityKgM3 * part.quantity;
}

/**
 * Calculate mass of a tube part in kg
 */
export function computeTubeMassKg(
  part: TubePart,
  densityKgM3: number
): number {
  // Parse profile dimensions
  const profileDims = parseTubeProfile(part.profile);
  
  // Cross-sectional area in mm²
  // Approximation: perimeter * wall thickness
  const perimeterMm = 2 * (profileDims.width + profileDims.height);
  const sectionAreaMm2 = perimeterMm * profileDims.thickness;
  
  // Convert to m²
  const sectionAreaM2 = sectionAreaMm2 / 1_000_000;
  
  // Length in m
  const lengthM = part.length / 1000;
  
  // Mass = section area * length * density
  return sectionAreaM2 * lengthM * densityKgM3 * part.quantity;
}

/**
 * Parse tube profile string like "40x40x1.2"
 */
function parseTubeProfile(profile: string): { width: number; height: number; thickness: number } {
  const parts = profile.split('x').map(Number);
  return {
    width: parts[0] || 40,
    height: parts[1] || 40,
    thickness: parts[2] || 1.2
  };
}

// ============================================================
// Main Geometry Pipeline
// ============================================================

/**
 * Run geometry calculations on a BOM
 */
export function runGeometryCalculations(
  bom: BOM,
  alloy: string = '304'
): GeometryResult {
  const geometryData: GeometryData[] = [];
  const geometryMap = new Map<string, GeometryData>();
  
  let totalAreaMm2 = 0;
  let totalCutLengthMm = 0;
  let totalMassKg = 0;
  let totalBendCount = 0;
  let totalFinishAreaMm2 = 0;
  
  const density = DEFAULT_DENSITIES[alloy.replace('SS', '').replace('AISI', '')] || 8000;
  
  // Process sheet parts
  for (const sheet of bom.sheetParts) {
    const areaMm2 = computeAreaMm2(sheet);
    const cutLengthMm = computeCutLengthMm(sheet);
    const finishAreaMm2 = computeFinishAreaMm2(sheet);
    const bendCount = sheet.bends.length;
    
    // Calculate developed blank if there are bends
    const blank = sheet.bends.length > 0
      ? computeBlank(sheet.blank.width, sheet.blank.height, sheet.bends, sheet.thickness)
      : sheet.blank;
    
    // Calculate mass using developed blank
    const massKg = computeSheetMassKg(
      { ...sheet, blank },
      density,
      sheet.thickness
    );
    
    const data: GeometryData = {
      partId: sheet.id,
      areaMm2,
      cutLengthMm,
      massKg,
      blank,
      bendCount,
      finishAreaMm2
    };
    
    geometryData.push(data);
    geometryMap.set(sheet.id, data);
    
    totalAreaMm2 += areaMm2 * sheet.quantity;
    totalCutLengthMm += cutLengthMm * sheet.quantity;
    totalMassKg += massKg;
    totalBendCount += bendCount * sheet.quantity;
    totalFinishAreaMm2 += finishAreaMm2 * sheet.quantity;
  }
  
  // Process tube parts
  for (const tube of bom.tubes) {
    const massKg = computeTubeMassKg(tube, density);
    
    const data: GeometryData = {
      partId: tube.id,
      areaMm2: 0, // Tubes don't have sheet area
      cutLengthMm: 0, // Tube cutting is separate process
      massKg,
      blank: { width: 0, height: 0 },
      bendCount: 0,
      finishAreaMm2: 0
    };
    
    geometryData.push(data);
    geometryMap.set(tube.id, data);
    
    totalMassKg += massKg;
  }
  
  // Create BOM with geometry
  const bomWithGeometry: BOMWithGeometry = {
    ...bom,
    geometryData: geometryMap
  };
  
  return {
    success: true,
    bomWithGeometry,
    geometryData,
    totalAreaMm2,
    totalCutLengthMm,
    totalMassKg,
    totalBendCount,
    totalFinishAreaMm2
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get geometry data for a specific part
 */
export function getPartGeometry(
  bomWithGeometry: BOMWithGeometry,
  partId: string
): GeometryData | undefined {
  return bomWithGeometry.geometryData.get(partId);
}

/**
 * Calculate total perimeter for welding estimation
 */
export function calculateWeldPerimeter(bom: BOM): number {
  let totalPerimeter = 0;
  
  // Sheet parts - perimeter for corner welds
  for (const sheet of bom.sheetParts) {
    totalPerimeter += 2 * (sheet.blank.width + sheet.blank.height) * sheet.quantity;
  }
  
  // Tube parts - circumference for tube-to-sheet welds
  for (const tube of bom.tubes) {
    const profile = parseTubeProfile(tube.profile);
    const circumference = 2 * (profile.width + profile.height);
    totalPerimeter += circumference * tube.quantity;
  }
  
  return totalPerimeter;
}

/**
 * Calculate total bend count for pricing
 */
export function calculateTotalBends(bom: BOM): number {
  return bom.sheetParts.reduce((total, sheet) => {
    return total + (sheet.bends.length * sheet.quantity);
  }, 0);
}

/**
 * Calculate total finish area in m²
 */
export function calculateTotalFinishAreaM2(bom: BOM): number {
  let totalMm2 = 0;
  
  for (const sheet of bom.sheetParts) {
    totalMm2 += computeFinishAreaMm2(sheet) * sheet.quantity;
  }
  
  return totalMm2 / 1_000_000; // Convert to m²
}

/**
 * Calculate total cut length in meters
 */
export function calculateTotalCutLengthM(bom: BOM): number {
  let totalMm = 0;
  
  for (const sheet of bom.sheetParts) {
    totalMm += computeCutLengthMm(sheet) * sheet.quantity;
  }
  
  return totalMm / 1000; // Convert to m
}

/**
 * Estimate total mass for shipping
 */
export function estimateTotalMassKg(
  bom: BOM,
  alloy: string = '304'
): number {
  const result = runGeometryCalculations(bom, alloy);
  return result.totalMassKg;
}