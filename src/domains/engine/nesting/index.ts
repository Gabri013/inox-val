import { SheetPart, NestingResult, PlacedPart, EngineResult, ValidationWarning } from '../types';
import { DEFAULT_RULESET, Ruleset } from '../ruleset';

/**
 * Representa uma chapa no nesting
 */
export interface Sheet {
  id: string;
  materialKey: string;
  widthMm: number;
  heightMm: number;
  available: boolean;
}

/**
 * Peça com blank calculado para nesting
 */
export interface NestablePart {
  id: string;
  widthMm: number;
  heightMm: number;
  allowRotate: boolean;
  grainDirection?: 'x' | 'y' | null;
  originalPart: SheetPart;
}

/**
 * Resultado de posicionamento em uma chapa
 */
export interface SheetLayout {
  sheetId: string;
  materialKey: string;
  sheetWidthMm: number;
  sheetHeightMm: number;
  placedParts: PlacedPart[];
  utilization: number; // percentual
  wasteAreaMm2: number;
  wasteKg: number;
  wasteValue: number;
}

/**
 * Algoritmo Guillotine Best-Fit
 * Organiza peças em linhas, da esquerda para direita, de cima para baixo
 */
export function nestGuillotine(
  parts: NestablePart[],
  sheets: Sheet[],
  ruleset: Ruleset = DEFAULT_RULESET
): EngineResult<NestingResult> {
  const errors: { code: string; message: string; severity: 'error'; field?: string }[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (parts.length === 0) {
    return {
      success: true,
      data: {
        sheets: [],
        totalUtilization: 0,
        totalWasteKg: 0,
        totalWasteValue: 0
      },
      errors: [],
      warnings: [{ code: 'NO_PARTS', message: 'Nenhuma peça para aninhar', severity: 'warning' }]
    };
  }
  
  if (sheets.length === 0) {
    return {
      success: false,
      errors: [{ code: 'NO_SHEETS', message: 'Nenhuma chapa disponível', severity: 'error' }],
      warnings: []
    };
  }
  
  const layouts: SheetLayout[] = [];
  const remainingParts = [...parts];
  
  // Ordenar peças por área (maior primeiro) - melhora aproveitamento
  remainingParts.sort((a, b) => (b.widthMm * b.heightMm) - (a.widthMm * a.heightMm));
  
  // Processar cada chapa
  for (const sheet of sheets) {
    if (remainingParts.length === 0) break;
    
    const layout = nestOnSheet(remainingParts, sheet, ruleset);
    if (layout.placedParts.length > 0) {
      layouts.push(layout);
    }
  }
  
  // Verificar se todas as peças foram alocadas
  if (remainingParts.length > 0) {
    const unplacedIds = remainingParts.map(p => p.id);
    errors.push({
      code: 'UNPLACED_PARTS',
      message: `${remainingParts.length} peças não couberam: ${unplacedIds.join(', ')}`,
      severity: 'error'
    });
  }
  
  // Calcular totais
  const totalUtilization = layouts.length > 0
    ? layouts.reduce((sum, l) => sum + l.utilization, 0) / layouts.length
    : 0;
  
  const totalWasteKg = layouts.reduce((sum, l) => sum + l.wasteKg, 0);
  const totalWasteValue = layouts.reduce((sum, l) => sum + l.wasteValue, 0);
  
  // Warning se aproveitamento baixo
  if (totalUtilization < ruleset.nesting.minUtilizationPercent) {
    warnings.push({
      code: 'LOW_UTILIZATION',
      message: `Aproveitamento ${totalUtilization.toFixed(1)}% abaixo do mínimo ${ruleset.nesting.minUtilizationPercent}%`,
      severity: 'warning',
      suggestion: 'Considere ajustar dimensões ou usar chapas diferentes'
    });
  }
  
  return {
    success: errors.length === 0,
    data: {
      sheets: layouts.map(l => ({
        materialKey: l.materialKey,
        quantity: 1,
        layout: l.placedParts,
        utilization: l.utilization,
        wasteKg: l.wasteKg,
        wasteValue: l.wasteValue
      })),
      totalUtilization,
      totalWasteKg,
      totalWasteValue
    },
    errors,
    warnings
  };
}

/**
 * Posiciona peças em uma única chapa usando Guillotine
 */
function nestOnSheet(
  parts: NestablePart[],
  sheet: Sheet,
  ruleset: Ruleset
): SheetLayout {
  const placedParts: PlacedPart[] = [];
  const kerf = ruleset.nesting.kerfMm;
  const margin = ruleset.nesting.marginMm;
  
  // Área útil da chapa (com margens)
  const usableWidth = sheet.widthMm - 2 * margin;
  const usableHeight = sheet.heightMm - 2 * margin;
  
  // Posição atual (x, y) e altura da linha atual
  let currentX = margin;
  let currentY = margin;
  let currentRowHeight = 0;
  
  const placedIndices = new Set<number>();
  const partsCopy = [...parts]; // Work with a copy for reference
  
  for (let i = 0; i < parts.length; i++) {
    if (placedIndices.has(i)) continue;
    
    const part = parts[i];
    
    // Tentar colocar sem rotação primeiro
    let placed = tryPlacePart(part, currentX, currentY, usableWidth, usableHeight, 
                               currentRowHeight, kerf, margin, sheet, false);
    
    // Se não couber e rotação permitida, tentar com rotação
    if (!placed && part.allowRotate && ruleset.nesting.allowRotate) {
      // Verificar restrição de grão
      const canRotate = part.grainDirection === null || part.grainDirection === undefined;
      if (canRotate) {
        placed = tryPlacePart(part, currentX, currentY, usableWidth, usableHeight,
                              currentRowHeight, kerf, margin, sheet, true);
      }
    }
    
    if (placed) {
      placedParts.push(placed);
      placedIndices.add(i);
      
      currentX = placed.x + (placed.rotation === 0 ? part.widthMm : part.heightMm) + kerf;
      currentRowHeight = Math.max(currentRowHeight, 
                                   placed.rotation === 0 ? part.heightMm : part.widthMm);
      
      // Se não cabe mais na linha, pular para próxima
      if (currentX > sheet.widthMm - margin) {
        currentX = margin;
        currentY += currentRowHeight + kerf;
        currentRowHeight = 0;
      }
    }
  }
  
  // Remover peças colocadas da lista
  for (let i = parts.length - 1; i >= 0; i--) {
    if (placedIndices.has(i)) {
      parts.splice(i, 1);
    }
  }
  
  // Calcular métricas
  const sheetArea = sheet.widthMm * sheet.heightMm;
  const usedArea = placedParts.reduce((sum, p) => {
    const part = partsCopy.find(pt => pt.id === p.partId);
    const w = p.rotation === 0 ? part?.widthMm || 0 : part?.heightMm || 0;
    const h = p.rotation === 0 ? part?.heightMm || 0 : part?.widthMm || 0;
    return sum + w * h;
  }, 0);
  
  const utilization = (usedArea / sheetArea) * 100;
  const wasteAreaMm2 = sheetArea - usedArea;
  
  return {
    sheetId: sheet.id,
    materialKey: sheet.materialKey,
    sheetWidthMm: sheet.widthMm,
    sheetHeightMm: sheet.heightMm,
    placedParts,
    utilization,
    wasteAreaMm2,
    wasteKg: 0, // Calculado depois com densidade
    wasteValue: 0 // Calculado depois com preço
  };
}

/**
 * Tenta colocar uma peça na posição especificada
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
  sheet: Sheet,
  rotate: boolean
): PlacedPart | null {
  const width = rotate ? part.heightMm : part.widthMm;
  const height = rotate ? part.widthMm : part.heightMm;
  
  // Verificar se cabe na área útil
  if (x + width > sheet.widthMm - margin) return null;
  if (y + height > sheet.heightMm - margin) return null;
  
  return {
    partId: part.id,
    x,
    y,
    rotation: rotate ? 90 : 0
  };
}

/**
 * Prepara peças para nesting a partir do BOM
 */
export function preparePartsForNesting(
  bomParts: SheetPart[],
  calculatedBlanks: Map<string, { widthMm: number; heightMm: number }>
): NestablePart[] {
  const nestable: NestablePart[] = [];
  
  for (const part of bomParts) {
    const blank = calculatedBlanks.get(part.id) || part.blank;
    
    // Expandir quantidade em peças individuais
    for (let i = 0; i < part.quantity; i++) {
      nestable.push({
        id: `${part.id}_${i}`,
        widthMm: blank.widthMm,
        heightMm: blank.heightMm,
        allowRotate: part.allowRotate,
        grainDirection: part.grainDirection,
        originalPart: part
      });
    }
  }
  
  return nestable;
}

/**
 * Calcula desperdício em kg e valor
 */
export function calculateWaste(
  layouts: SheetLayout[],
  densityKgM3: number,
  thicknessMm: number,
  pricePerKg: number
): void {
  for (const layout of layouts) {
    const wasteAreaM2 = layout.wasteAreaMm2 / 1_000_000;
    const thicknessM = thicknessMm / 1000;
    layout.wasteKg = wasteAreaM2 * thicknessM * densityKgM3;
    layout.wasteValue = layout.wasteKg * pricePerKg;
  }
}