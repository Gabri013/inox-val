// ============================================================
// VALIDATION ENGINE - Validate inputs, materials, and results
// ============================================================

import {
  EquipmentInputs,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  PricingResult,
  BOM,
} from './pricing.types';
import { Material, Process } from '../engine/types';
import { Ruleset } from '../engine/ruleset';
import { DEFAULT_RULESET } from '../engine/ruleset';
import { validateStructuralRules, STRUCTURAL_RULES } from './structural.rules';

// ============================================================
// Input Validation
// ============================================================

/**
 * Validate equipment inputs
 */
export function validatePricingInputs(
  inputs: EquipmentInputs,
  _ruleset: Ruleset = DEFAULT_RULESET
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Width validation
  if (inputs.width === undefined || inputs.width === null) {
    errors.push({
      code: 'WIDTH_REQUIRED',
      message: 'Largura é obrigatória',
      field: 'width'
    });
  } else {
    if (inputs.width < 300) {
      errors.push({
        code: 'WIDTH_TOO_SMALL',
        message: 'Largura mínima: 300mm',
        field: 'width'
      });
    }
    if (inputs.width > 3000) {
      errors.push({
        code: 'WIDTH_TOO_LARGE',
        message: 'Largura máxima: 3000mm',
        field: 'width'
      });
    }
  }
  
  // Depth validation
  if (inputs.depth === undefined || inputs.depth === null) {
    errors.push({
      code: 'DEPTH_REQUIRED',
      message: 'Profundidade é obrigatória',
      field: 'depth'
    });
  } else {
    if (inputs.depth < 300) {
      errors.push({
        code: 'DEPTH_TOO_SMALL',
        message: 'Profundidade mínima: 300mm',
        field: 'depth'
      });
    }
    if (inputs.depth > 1500) {
      errors.push({
        code: 'DEPTH_TOO_LARGE',
        message: 'Profundidade máxima: 1500mm',
        field: 'depth'
      });
    }
  }
  
  // Height validation
  if (inputs.height === undefined || inputs.height === null) {
    errors.push({
      code: 'HEIGHT_REQUIRED',
      message: 'Altura é obrigatória',
      field: 'height'
    });
  } else {
    if (inputs.height < 500) {
      errors.push({
        code: 'HEIGHT_TOO_SMALL',
        message: 'Altura mínima: 500mm',
        field: 'height'
      });
    }
    if (inputs.height > 1200) {
      errors.push({
        code: 'HEIGHT_TOO_LARGE',
        message: 'Altura máxima: 1200mm',
        field: 'height'
      });
    }
  }
  
  // Thickness validation
  if (inputs.thickness === undefined || inputs.thickness === null) {
    errors.push({
      code: 'THICKNESS_REQUIRED',
      message: 'Espessura é obrigatória',
      field: 'thickness'
    });
  } else {
    if (inputs.thickness < 0.8) {
      errors.push({
        code: 'THICKNESS_TOO_SMALL',
        message: 'Espessura mínima: 0.8mm',
        field: 'thickness'
      });
    }
    if (inputs.thickness > 3.0) {
      errors.push({
        code: 'THICKNESS_TOO_LARGE',
        message: 'Espessura máxima: 3.0mm',
        field: 'thickness'
      });
    }
    
    // Warning for thin material on large tables
    if (inputs.thickness < 1.2 && inputs.width > 1500) {
      warnings.push({
        code: 'THIN_MATERIAL_WARNING',
        message: 'Material fino para mesa larga pode comprometer rigidez',
        field: 'thickness',
        suggestion: 'Considere espessura >= 1.2mm para mesas > 1500mm'
      });
    }
  }
  
  // Finish validation
  const validFinishes = ['POLIDO', 'ESCOVADO', '2B'];
  if (!inputs.finish) {
    errors.push({
      code: 'FINISH_REQUIRED',
      message: 'Acabamento é obrigatório',
      field: 'finish'
    });
  } else if (!validFinishes.includes(inputs.finish)) {
    errors.push({
      code: 'INVALID_FINISH',
      message: `Acabamento inválido. Opções: ${validFinishes.join(', ')}`,
      field: 'finish'
    });
  }
  
  // Backsplash validation (if applicable)
  if (inputs.hasBacksplash && inputs.backsplashHeight !== undefined) {
    if (inputs.backsplashHeight < 100) {
      errors.push({
        code: 'BACKSPLASH_TOO_SMALL',
        message: 'Altura do espelho mínima: 100mm',
        field: 'backsplashHeight'
      });
    }
    if (inputs.backsplashHeight > 600) {
      warnings.push({
        code: 'BACKSPLASH_HIGH',
        message: 'Espelho alto pode requerer reforço adicional',
        field: 'backsplashHeight',
        suggestion: 'Considere adicionar suportes estruturais'
      });
    }
  }
  
  // Structural rules validation
  const structuralResult = validateStructuralRules(STRUCTURAL_RULES, inputs);
  errors.push(...structuralResult.errors);
  warnings.push(...structuralResult.warnings);
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================
// Material Validation
// ============================================================

/**
 * Validate materials for pricing
 */
export function validateMaterials(
  materials: Material[],
  date: Date = new Date()
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (materials.length === 0) {
    errors.push({
      code: 'NO_MATERIALS',
      message: 'Nenhum material disponível'
    });
    return { valid: false, errors, warnings };
  }
  

  
  for (const material of materials) {
    // Check if material is active
    if (!material.active) {
      warnings.push({
        code: 'INACTIVE_MATERIAL',
        message: `Material inativo: ${material.key}`,
        suggestion: 'Ative o material ou remova da lista'
      });
      continue;
    }
    
    // Check for active price
    const hasActivePrice = material.priceHistory.some(p => {
      const from = new Date(p.validFrom);
      const to = p.validTo ? new Date(p.validTo) : new Date('2099-12-31');
      return date >= from && date <= to;
    });
    
    if (!hasActivePrice) {
      warnings.push({
        code: 'NO_ACTIVE_PRICE',
        message: `Sem preço ativo para: ${material.key}`,
        suggestion: 'Cadastre preço válido para o material'
      });
    }
    
    // Check for required fields
    if (material.kind === 'sheet') {
      if (!material.format) {
        errors.push({
          code: 'MISSING_FORMAT',
          message: `Chapa sem formato definido: ${material.key}`
        });
      } else {
        if (!material.format.widthMm || !material.format.heightMm) {
          errors.push({
            code: 'INVALID_FORMAT',
            message: `Formato inválido para: ${material.key}`
          });
        }
      }
      
      if (!material.thicknessMm) {
        warnings.push({
          code: 'MISSING_THICKNESS',
          message: `Chapa sem espessura definida: ${material.key}`
        });
      }
    }
    
    if (material.kind === 'tube') {
      if (!material.tubeProfile) {
        errors.push({
          code: 'MISSING_PROFILE',
          message: `Tubo sem perfil definido: ${material.key}`
        });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================
// Process Validation
// ============================================================

/**
 * Validate processes for pricing
 */
export function validateProcesses(
  processes: Process[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (processes.length === 0) {
    errors.push({
      code: 'NO_PROCESSES',
      message: 'Nenhum processo disponível'
    });
    return { valid: false, errors, warnings };
  }
  
  for (const process of processes) {
    // Check if process is active
    if (!process.active) {
      warnings.push({
        code: 'INACTIVE_PROCESS',
        message: `Processo inativo: ${process.key}`,
        suggestion: 'Ative o processo ou remova da lista'
      });
    }
    
    // Check for cost model
    if (!process.costModel) {
      errors.push({
        code: 'MISSING_COST_MODEL',
        message: `Processo sem modelo de custo: ${process.key}`
      });
    } else {
      if (!process.costModel.costPerHour || process.costModel.costPerHour <= 0) {
        warnings.push({
          code: 'INVALID_COST_PER_HOUR',
          message: `Custo por hora inválido para: ${process.key}`,
          suggestion: 'Defina um custo por hora válido'
        });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================
// Result Validation
// ============================================================

/**
 * Validate pricing result
 */
export function validatePricingResult(
  result: PricingResult,
  ruleset: Ruleset = DEFAULT_RULESET
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check BOM
  if (!result.bom) {
    errors.push({
      code: 'MISSING_BOM',
      message: 'BOM não gerada'
    });
  } else {
    if (result.bom.sheetParts.length === 0 && result.bom.tubes.length === 0) {
      errors.push({
        code: 'EMPTY_BOM',
        message: 'BOM está vazia'
      });
    }
  }
  
  // Check nesting
  if (!result.nestingResult) {
    errors.push({
      code: 'MISSING_NESTING',
      message: 'Nesting não executado'
    });
  } else {
    if (result.nestingResult.layouts.length === 0 && result.bom.sheetParts.length > 0) {
      errors.push({
        code: 'NESTING_FAILED',
        message: 'Nesting falhou - nenhuma peça alocada'
      });
    }
    
    if (result.nestingResult.utilization < ruleset.nesting.minUtilizationPercent) {
      warnings.push({
        code: 'LOW_UTILIZATION',
        message: `Aproveitamento ${result.nestingResult.utilization.toFixed(1)}% abaixo do mínimo`,
        suggestion: 'Considere ajustar dimensões ou usar chapas diferentes'
      });
    }
  }
  
  // Check costs
  if (result.totalMaterialCost <= 0 && result.totalProcessCost <= 0) {
    errors.push({
      code: 'ZERO_COSTS',
      message: 'Custos não calculados'
    });
  }
  
  // Check margin
  if (result.margin.marginPercent < ruleset.pricing.minMarginPercent) {
    errors.push({
      code: 'MARGIN_BELOW_MINIMUM',
      message: `Margem ${result.margin.marginPercent.toFixed(1)}% abaixo do mínimo ${ruleset.pricing.minMarginPercent}%`
    });
  }
  
  // Check price
  if (result.finalPrice <= 0) {
    errors.push({
      code: 'INVALID_PRICE',
      message: 'Preço final inválido'
    });
  }
  
  if (result.finalPrice < result.minPrice) {
    warnings.push({
      code: 'PRICE_BELOW_MINIMUM',
      message: `Preço R$ ${result.finalPrice.toFixed(2)} abaixo do mínimo R$ ${result.minPrice.toFixed(2)}`,
      suggestion: 'Aumente o preço ou revise os custos'
    });
  }
  
  // Check hash
  if (!result.hash) {
    warnings.push({
      code: 'MISSING_HASH',
      message: 'Hash de auditoria não gerado'
    });
  }
  
  // Add warnings from result
  for (const warning of result.warnings) {
    warnings.push({
      code: 'PIPELINE_WARNING',
      message: warning
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================
// Finalization Check
// ============================================================

/**
 * Check if pricing can be finalized
 */
export function canFinalize(
  result: PricingResult,
  ruleset: Ruleset = DEFAULT_RULESET
): { canFinalize: boolean; blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];
  
  // Validate result
  const validation = validatePricingResult(result, ruleset);
  
  // Convert errors to blockers
  for (const error of validation.errors) {
    blockers.push(error.message);
  }
  
  // Convert warnings
  for (const warning of validation.warnings) {
    warnings.push(warning.message);
  }
  
  // Additional finalization checks
  
  // Check for material without price
  for (const mc of result.materialCost) {
    if (mc.pricePerKg <= 0 && (!mc.pricePerSheet || mc.pricePerSheet <= 0)) {
      blockers.push(`Material sem preço: ${mc.materialKey}`);
    }
  }
  
  // Check for structural rule violations
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      if (error.includes('BLOCK') || error.includes('máximo') || error.includes('mínimo')) {
        blockers.push(error);
      }
    }
  }
  
  // Check margin
  if (result.margin.marginPercent < ruleset.pricing.minMarginPercent) {
    blockers.push(`Margem abaixo do mínimo permitido (${ruleset.pricing.minMarginPercent}%)`);
  }
  
  // Check if nesting was executed
  if (!result.nestingResult || result.nestingResult.totalSheets === 0) {
    if (result.bom.sheetParts.length > 0) {
      blockers.push('Nesting não foi executado corretamente');
    }
  }
  
  return {
    canFinalize: blockers.length === 0,
    blockers,
    warnings
  };
}

// ============================================================
// BOM Validation
// ============================================================

/**
 * Validate a BOM
 */
export function validateBOM(bom: BOM): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check for empty BOM
  if (bom.sheetParts.length === 0 && bom.tubes.length === 0 && bom.accessories.length === 0) {
    errors.push({
      code: 'EMPTY_BOM',
      message: 'BOM está vazia - nenhum componente definido'
    });
  }
  
  // Validate sheet parts
  for (const sheet of bom.sheetParts) {
    if (sheet.blank.width <= 0 || sheet.blank.height <= 0) {
      errors.push({
        code: 'INVALID_SHEET_DIMENSIONS',
        message: `Chapa ${sheet.id} tem dimensões inválidas`,
        field: `sheetParts.${sheet.id}`
      });
    }
    if (sheet.quantity <= 0) {
      errors.push({
        code: 'INVALID_QUANTITY',
        message: `Chapa ${sheet.id} tem quantidade inválida: ${sheet.quantity}`,
        field: `sheetParts.${sheet.id}`
      });
    }
    if (sheet.thickness <= 0) {
      errors.push({
        code: 'INVALID_THICKNESS',
        message: `Chapa ${sheet.id} tem espessura inválida: ${sheet.thickness}`,
        field: `sheetParts.${sheet.id}`
      });
    }
    if (!sheet.materialKey) {
      errors.push({
        code: 'MISSING_MATERIAL_KEY',
        message: `Chapa ${sheet.id} sem material definido`,
        field: `sheetParts.${sheet.id}`
      });
    }
  }
  
  // Validate tube parts
  for (const tube of bom.tubes) {
    if (tube.length <= 0) {
      errors.push({
        code: 'INVALID_TUBE_LENGTH',
        message: `Tubo ${tube.id} tem comprimento inválido: ${tube.length}`,
        field: `tubes.${tube.id}`
      });
    }
    if (tube.quantity <= 0) {
      errors.push({
        code: 'INVALID_QUANTITY',
        message: `Tubo ${tube.id} tem quantidade inválida: ${tube.quantity}`,
        field: `tubes.${tube.id}`
      });
    }
    if (!tube.profile) {
      errors.push({
        code: 'MISSING_PROFILE',
        message: `Tubo ${tube.id} sem perfil definido`,
        field: `tubes.${tube.id}`
      });
    }
  }
  
  // Validate accessories
  for (const acc of bom.accessories) {
    if (acc.quantity <= 0) {
      warnings.push({
        code: 'ZERO_ACCESSORY_QUANTITY',
        message: `Acessório ${acc.id} tem quantidade zero`,
        field: `accessories.${acc.id}`
      });
    }
    if (acc.unitCost < 0) {
      errors.push({
        code: 'NEGATIVE_COST',
        message: `Acessório ${acc.id} tem custo negativo: ${acc.unitCost}`,
        field: `accessories.${acc.id}`
      });
    }
  }
  
  // Check for duplicate IDs
  const allIds = [
    ...bom.sheetParts.map(s => s.id),
    ...bom.tubes.map(t => t.id),
    ...bom.accessories.map(a => a.id)
  ];
  const uniqueIds = new Set(allIds);
  if (uniqueIds.size !== allIds.length) {
    const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    errors.push({
      code: 'DUPLICATE_IDS',
      message: `IDs duplicados encontrados: ${[...new Set(duplicates)].join(', ')}`
    });
  }
  
  // Check for processes
  if (bom.processes.length === 0) {
    warnings.push({
      code: 'NO_PROCESSES',
      message: 'Nenhum processo definido no BOM',
      suggestion: 'Adicione processos de fabricação'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get validation summary
 */
export function getValidationSummary(validation: ValidationResult): string {
  const lines: string[] = [];
  
  if (validation.valid) {
    lines.push('Validação: OK');
  } else {
    lines.push('Validação: FALHOU');
  }
  
  if (validation.errors.length > 0) {
    lines.push(`Erros (${validation.errors.length}):`);
    validation.errors.forEach(e => lines.push(`  - ${e.message}`));
  }
  
  if (validation.warnings.length > 0) {
    lines.push(`Avisos (${validation.warnings.length}):`);
    validation.warnings.forEach(w => lines.push(`  - ${w.message}`));
  }
  
  return lines.join('\n');
}

/**
 * Check if validation has errors
 */
export function hasErrors(validation: ValidationResult): boolean {
  return !validation.valid;
}

/**
 * Check if validation has warnings
 */
export function hasWarnings(validation: ValidationResult): boolean {
  return validation.warnings.length > 0;
}

/**
 * Get all error messages
 */
export function getErrorMessages(validation: ValidationResult): string[] {
  return validation.errors.map(e => e.message);
}

/**
 * Get all warning messages
 */
export function getWarningMessages(validation: ValidationResult): string[] {
  return validation.warnings.map(w => w.message);
}