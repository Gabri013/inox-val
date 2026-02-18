// ============================================================
// MASS ENGINE - Calculate mass for sheets, tubes, and accessories
// ============================================================

import { SheetPart, TubePart, AccessoryPart, Material, EngineResult } from '../types';

/**
 * Densidades padrão em kg/m³
 */
export const DEFAULT_DENSITIES: Record<string, number> = {
  '304': 7930,
  '316L': 8000,
  '430': 7750,
  '409': 7800,
  '441': 7800,
  '201': 7850,
};

/**
 * Obtém densidade do material em kg/m³
 */
export function getDensity(allow: string, material?: Material): number {
  if (material?.densityKgM3) {
    return material.densityKgM3;
  }
  // Normalizar liga
  const normalizedAlloy = allow.replace('SS', '').replace('AISI', '');
  return DEFAULT_DENSITIES[normalizedAlloy] || 8000; // default inox
}

/**
 * Calcula massa de uma peça de chapa em kg
 * Massa = área (m²) * espessura (m) * densidade (kg/m³)
 */
export function computeMassKg(
  part: SheetPart,
  densityKgM3: number,
  thicknessMm: number
): number {
  // Área em mm² -> m²
  const areaM2 = (part.blank.widthMm * part.blank.heightMm) / 1_000_000;
  
  // Espessura em mm -> m
  const thicknessM = thicknessMm / 1000;
  
  // Massa = área * espessura * densidade * quantidade
  return areaM2 * thicknessM * densityKgM3 * part.quantity;
}

/**
 * Calcula massa de tubo em kg
 * Massa = (perímetro * espessura) * comprimento * densidade
 * ou simplesmente: kg/m do perfil * comprimento
 */
export function computeTubeMassKg(
  part: TubePart,
  densityKgM3: number
): number {
  const { widthMm, heightMm, thicknessMm } = part.profile;
  
  // Perímetro em mm
  const perimeterMm = 2 * (widthMm + heightMm);
  
  // Área da seção transversal em mm²
  // Aproximação: perímetro * espessura
  const sectionAreaMm2 = perimeterMm * thicknessMm;
  
  // Converter para m²
  const sectionAreaM2 = sectionAreaMm2 / 1_000_000;
  
  // Comprimento em m
  const lengthM = part.lengthMm / 1000;
  
  // Massa = área * comprimento * densidade * quantidade
  return sectionAreaM2 * lengthM * densityKgM3 * part.quantity;
}

/**
 * Calcula massa de acessório em kg
 */
export function computeAccessoryMassKg(
  part: AccessoryPart,
  unitMassKg: number
): number {
  return unitMassKg * part.quantity;
}

/**
 * Calcula massa total do BOM
 */
export function computeBOMMass(
  sheets: SheetPart[],
  tubes: TubePart[],
  accessories: AccessoryPart[],
  materials: Map<string, Material>
): {
  totalKg: number;
  byMaterial: Map<string, number>;
  details: { partId: string; massKg: number }[];
} {
  let totalKg = 0;
  const byMaterial = new Map<string, number>();
  const details: { partId: string; massKg: number }[] = [];
  
  // Chapas
  for (const sheet of sheets) {
    const material = materials.get(sheet.materialKey);
    const alloy = material?.alloy || '304';
    const density = getDensity(alloy, material);
    const thickness = material?.thicknessMm || 1.2;
    
    const mass = computeMassKg(sheet, density, thickness);
    totalKg += mass;
    
    byMaterial.set(sheet.materialKey, (byMaterial.get(sheet.materialKey) || 0) + mass);
    details.push({ partId: sheet.id, massKg: mass });
  }
  
  // Tubos
  for (const tube of tubes) {
    const material = materials.get(tube.materialKey);
    const alloy = material?.alloy || '304';
    const density = getDensity(alloy, material);
    
    const mass = computeTubeMassKg(tube, density);
    totalKg += mass;
    
    byMaterial.set(tube.materialKey, (byMaterial.get(tube.materialKey) || 0) + mass);
    details.push({ partId: tube.id, massKg: mass });
  }
  
  // Acessórios (já devem ter massa unitária)
  for (const acc of accessories) {
    const mass = acc.unitCost ? acc.unitCost * acc.quantity : 0; // unitCost pode ser custo, não massa
    // Para acessórios sem massa definida, assume 0
    totalKg += mass;
    details.push({ partId: acc.id, massKg: mass });
  }
  
  return { totalKg, byMaterial, details };
}
