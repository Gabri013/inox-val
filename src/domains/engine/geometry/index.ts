// ============================================================
// GEOMETRY ENGINE - Calculate area, cut length, blank development
// ============================================================

import { SheetPart, Bend, ValidationWarning } from '../types';
import { DEFAULT_RULESET, Ruleset } from '../ruleset';

/**
 * Calcula área 2D real de uma peça em mm²
 * Considera: blank dimensions - furos - recortes
 */
export function computeAreaMm2(part: SheetPart): number {
  const blankArea = part.blank.widthMm * part.blank.heightMm;
  
  // Subtrair área de furos e recortes
  let cutArea = 0;
  for (const feature of part.features) {
    if (feature.type === 'hole' && feature.dimensions.diameterMm) {
      cutArea += Math.PI * Math.pow(feature.dimensions.diameterMm / 2, 2);
    } else if (feature.type === 'cut' || feature.type === 'notch') {
      cutArea += feature.dimensions.widthMm * feature.dimensions.heightMm;
    }
  }
  
  return Math.max(0, blankArea - cutArea);
}

/**
 * Calcula perímetro de corte em mm
 * Para peças sem dobras = perímetro do blank
 * Para peças com dobras = soma das arestas de corte
 */
export function computeCutLengthMm(part: SheetPart): number {
  const blankPerimeter = 2 * (part.blank.widthMm + part.blank.heightMm);
  
  // Se não tem dobras, todo o perímetro é corte
  if (part.bends.length === 0) {
    return blankPerimeter;
  }
  
  // Com dobras, subtrair arestas que viram dobras
  let bendLength = 0;
  for (const _bend of part.bends) {
    // Assumindo dobras ao longo da dimensão menor
    bendLength += part.blank.heightMm;
  }
  
  return Math.max(0, blankPerimeter - bendLength);
}

/**
 * Calcula desenvolvimento (blank) para peça dobrada
 * Usando K-factor simplificado
 * 
 * @param partWidthMm - largura final da peça (sem dobragem)
 * @param partHeightMm - altura final  
 * @param bends - lista de dobras com ângulo
 * @param thicknessMm - espessura do material
 * @param kFactor - fator K (default 0.33)
 */
export function computeBlank(
  partWidthMm: number,
  partHeightMm: number,
  bends: Bend[],
  thicknessMm: number,
  kFactor: number = DEFAULT_RULESET.tolerances.bendKFactor
): { widthMm: number; heightMm: number } {
  if (bends.length === 0) {
    return { widthMm: partWidthMm, heightMm: partHeightMm };
  }
  
  let totalDevelopment = 0;
  
  for (const bend of bends) {
    // Cálculo simplificado de desenvolvimento de dobra
    // BA = A * (R + K*T), onde A = ângulo em radianos
    const angleRad = (bend.angle * Math.PI) / 180;
    const bendAllowance = angleRad * (kFactor * thicknessMm);
    totalDevelopment += bendAllowance;
  }
  
  // Dimensão com dobras = dimensão final + desenvolvimento
  const widthWithBends = partWidthMm + totalDevelopment;
  
  return {
    widthMm: Math.ceil(widthWithBends),
    heightMm: partHeightMm
  };
}

/**
 * Valida restrições de geometria
 */
export function validateGeometry(
  part: SheetPart,
  _ruleset: Ruleset = DEFAULT_RULESET
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  
  // Verificar dimensão mínima
  if (part.blank.widthMm < 10 || part.blank.heightMm < 10) {
    warnings.push({
      code: 'DIMENSION_TOO_SMALL',
      message: 'Dimensão muito pequena para fabricação',
      field: 'blank',
      severity: 'warning',
      suggestion: 'Mínimo recomendado: 10mm'
    });
  }
  
  // Verificar espessura vs dobras
  if (part.bends.length > 0) {
    for (const bend of part.bends) {
      if (bend.angle > 90 && part.blank.heightMm < 3 * (part.blank.heightMm || 1)) {
        warnings.push({
          code: 'BEND_TOO_SHARP',
          message: `Dobra ${bend.angle}° pode causar trinca`,
          severity: 'warning'
        });
      }
    }
  }
  
  return warnings;
}

/**
 * Calcula todas as métricas de geometria de uma peça
 */
export function computeGeometryMetrics(
  part: SheetPart,
  thicknessMm: number,
  ruleset?: Ruleset
): {
  areaMm2: number;
  cutLengthMm: number;
  blank: { widthMm: number; heightMm: number };
  isEstimated: boolean;
  warnings: ValidationWarning[];
} {
  const hasBends = part.bends.length > 0;
  
  let blank: { widthMm: number; heightMm: number };
  let isEstimated = false;
  
  if (hasBends) {
    // Peça dobrada precisa de desenvolvimento
    blank = computeBlank(
      part.blank.widthMm,
      part.blank.heightMm,
      part.bends,
      thicknessMm
    );
    // Blank calculado é estimado
    isEstimated = true;
  } else {
    blank = part.blank;
  }
  
  // Criar part temporária com blank correto para calcular área
  const tempPart = { ...part, blank };
  const areaMm2 = computeAreaMm2(tempPart);
  const cutLengthMm = computeCutLengthMm(tempPart);
  
  const warnings = ruleset ? validateGeometry(tempPart, ruleset) : [];
  
  return {
    areaMm2,
    cutLengthMm,
    blank,
    isEstimated,
    warnings
  };
}
