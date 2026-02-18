// ============================================================
// PRICING PIPELINE - Main orchestration for equipment pricing
// ============================================================

import {
  EquipmentTemplate,
  EquipmentInputs,
  PricingResult,
  NestingResult,
} from './pricing.types';
import { Material, Process, PricingMethod } from '../engine/types';
import { Ruleset } from '../engine/ruleset';
import { DEFAULT_RULESET } from '../engine/ruleset';
import { getTemplate } from './equipment.templates';
import { generateEquipmentBOM } from './equipment.generator';
import { runGeometryCalculations, GeometryResult } from './geometry.pipeline';
import { runNesting } from './nesting.pipeline';
import { calculateFullMaterialCost, FullMaterialCostResult } from './material.cost';
import { calculateProcessCost, ProcessCostResult } from './process.cost';
import { applyOverhead, applyMargin, calculateMinPrice } from './pricing.engine';
import { createHashFromResult } from './snapshot.engine';

// ============================================================
// Types
// ============================================================

export interface PipelineResult {
  success: boolean;
  result?: PricingResult;
  errors: PipelineError[];
  warnings: string[];
}

export interface PipelineError {
  step: string;
  code: string;
  message: string;
}

export interface PipelineStep {
  name: string;
  execute: () => boolean | Promise<boolean>;
  required: boolean;
}

// ============================================================
// Main Pipeline
// ============================================================

/**
 * Run the complete pricing pipeline
 */
export function runPricingPipeline(
  template: EquipmentTemplate,
  inputs: EquipmentInputs,
  materials: Material[],
  processes: Process[],
  ruleset: Ruleset = DEFAULT_RULESET,
  options?: {
    method?: PricingMethod;
    targetMargin?: number;
    discount?: number;
  }
): PipelineResult {
  const errors: PipelineError[] = [];
  const warnings: string[] = [];
  
  // Step 1: Generate BOM
  const bomResult = generateEquipmentBOM(template, inputs);
  if (!bomResult.success || !bomResult.bom) {
    return {
      success: false,
      errors: bomResult.errors.map(e => ({
        step: 'BOM_GENERATION',
        code: e.code,
        message: e.message
      })),
      warnings: bomResult.warnings.map(w => w.message)
    };
  }
  warnings.push(...bomResult.warnings.map(w => w.message));
  
  // Step 2: Run Geometry Calculations
  let geometryResult: GeometryResult;
  try {
    geometryResult = runGeometryCalculations(bomResult.bom, '304');
  } catch (error) {
    return {
      success: false,
      errors: [{
        step: 'GEOMETRY_CALCULATION',
        code: 'GEOMETRY_ERROR',
        message: error instanceof Error ? error.message : 'Erro no cálculo de geometria'
      }],
      warnings
    };
  }
  
  // Step 3: Run Nesting
  let nestingResult: NestingResult;
  try {
    nestingResult = runNesting(
      bomResult.bom.sheetParts,
      materials,
      geometryResult.bomWithGeometry.geometryData,
      {
        kerf: ruleset.nesting.kerfMm,
        margin: ruleset.nesting.marginMm,
        allowRotate: ruleset.nesting.allowRotate,
        minUtilization: ruleset.nesting.minUtilizationPercent
      },
      ruleset
    );
  } catch (error) {
    return {
      success: false,
      errors: [{
        step: 'NESTING',
        code: 'NESTING_ERROR',
        message: error instanceof Error ? error.message : 'Erro no nesting'
      }],
      warnings
    };
  }
  
  // Check nesting utilization
  if (nestingResult.utilization < ruleset.nesting.minUtilizationPercent) {
    warnings.push(`Aproveitamento ${nestingResult.utilization.toFixed(1)}% abaixo do mínimo ${ruleset.nesting.minUtilizationPercent}%`);
  }
  
  // Step 4: Calculate Material Costs
  let materialCostResult: FullMaterialCostResult;
  try {
    materialCostResult = calculateFullMaterialCost(
      nestingResult,
      bomResult.bom,
      materials
    );
  } catch (error) {
    return {
      success: false,
      errors: [{
        step: 'MATERIAL_COST',
        code: 'MATERIAL_COST_ERROR',
        message: error instanceof Error ? error.message : 'Erro no cálculo de material'
      }],
      warnings
    };
  }
  
  if (!materialCostResult.success) {
    materialCostResult.errors.forEach(e => {
      warnings.push(`${e.code}: ${e.message}`);
    });
  }
  
  // Step 5: Calculate Process Costs
  let processCostResult: ProcessCostResult;
  try {
    processCostResult = calculateProcessCost(
      geometryResult.bomWithGeometry,
      processes
    );
  } catch (error) {
    return {
      success: false,
      errors: [{
        step: 'PROCESS_COST',
        code: 'PROCESS_COST_ERROR',
        message: error instanceof Error ? error.message : 'Erro no cálculo de processos'
      }],
      warnings
    };
  }
  
  // Step 6: Apply Overhead
  const overhead = applyOverhead({
    materialCost: materialCostResult.totalMaterialCost,
    processCost: processCostResult.totalProcessCost,
    wasteCost: materialCostResult.totalWasteCost
  }, ruleset);
  
  // Step 7: Apply Margin
  const totalCost = materialCostResult.totalMaterialCost + processCostResult.totalProcessCost + overhead.totalOverhead;
  const margin = applyMargin(
    totalCost,
    options?.method || 'target-margin',
    ruleset,
    {
      targetMargin: options?.targetMargin,
      discount: options?.discount
    }
  );
  
  // Step 8: Calculate Final Price
  const finalPrice = totalCost + margin.marginValue;
  const minPrice = calculateMinPrice(totalCost, ruleset);
  
  // Validate final price
  if (finalPrice < minPrice) {
    warnings.push(`Preço final R$ ${finalPrice.toFixed(2)} abaixo do mínimo R$ ${minPrice.toFixed(2)}`);
  }
  
  // Step 9: Create Result
  const result: PricingResult = {
    equipmentType: template.key,
    inputs,
    bom: bomResult.bom,
    nestingResult,
    materialCost: materialCostResult.sheets,
    processCost: processCostResult.breakdown,
    overhead,
    margin,
    totalMaterialCost: materialCostResult.totalMaterialCost,
    totalProcessCost: processCostResult.totalProcessCost,
    totalCost,
    finalPrice,
    minPrice,
    rulesetVersion: ruleset.version,
    timestamp: new Date().toISOString(),
    hash: '', // Will be set below
    warnings,
    errors: errors.map(e => e.message)
  };
  
  // Generate hash for auditability
  result.hash = createHashFromResult(result);
  
  return {
    success: true,
    result,
    errors,
    warnings
  };
}

/**
 * Run pricing pipeline by template key
 */
export function runPricingPipelineByKey(
  templateKey: string,
  inputs: EquipmentInputs,
  materials: Material[],
  processes: Process[],
  ruleset: Ruleset = DEFAULT_RULESET,
  options?: {
    method?: PricingMethod;
    targetMargin?: number;
    discount?: number;
  }
): PipelineResult {
  const template = getTemplate(templateKey);
  
  if (!template) {
    return {
      success: false,
      errors: [{
        step: 'TEMPLATE_LOOKUP',
        code: 'TEMPLATE_NOT_FOUND',
        message: `Template não encontrado: ${templateKey}`
      }],
      warnings: []
    };
  }
  
  return runPricingPipeline(template, inputs, materials, processes, ruleset, options);
}

// ============================================================
// Quick Pricing (Simplified)
// ============================================================

export interface QuickPricingResult {
  success: boolean;
  finalPrice?: number;
  minPrice?: number;
  totalCost?: number;
  margin?: number;
  errors: string[];
}

/**
 * Quick pricing calculation without full pipeline
 */
export function quickPricing(
  templateKey: string,
  inputs: EquipmentInputs,
  materials: Material[],
  processes: Process[],
  ruleset: Ruleset = DEFAULT_RULESET
): QuickPricingResult {
  const result = runPricingPipelineByKey(templateKey, inputs, materials, processes, ruleset);
  
  if (!result.success || !result.result) {
    return {
      success: false,
      errors: result.errors.map(e => e.message)
    };
  }
  
  return {
    success: true,
    finalPrice: result.result.finalPrice,
    minPrice: result.result.minPrice,
    totalCost: result.result.totalCost,
    margin: result.result.margin.marginPercent,
    errors: []
  };
}

// ============================================================
// Pipeline Validation
// ============================================================

/**
 * Validate pipeline inputs before running
 */
export function validatePipelineInputs(
  template: EquipmentTemplate,
  inputs: EquipmentInputs,
  materials: Material[],
  processes: Process[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check materials
  if (materials.length === 0) {
    errors.push('Nenhum material disponível');
  }
  
  // Check processes
  if (processes.length === 0) {
    errors.push('Nenhum processo disponível');
  }
  
  // Check template inputs
  for (const field of template.requiredInputs) {
    const value = inputs[field.key as keyof EquipmentInputs];
    
    if (value === undefined || value === null) {
      errors.push(`Campo obrigatório: ${field.label}`);
    }
    
    if (field.type === 'number' && typeof value === 'number') {
      if (field.min !== undefined && value < field.min) {
        errors.push(`${field.label} deve ser >= ${field.min}`);
      }
      if (field.max !== undefined && value > field.max) {
        errors.push(`${field.label} deve ser <= ${field.max}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================================
// Result Utilities
// ============================================================

/**
 * Get pricing summary
 */
export function getPricingSummary(result: PricingResult): string {
  const lines = [
    `Equipamento: ${result.equipmentType}`,
    `Dimensões: ${result.inputs.width}x${result.inputs.depth}x${result.inputs.height}mm`,
    `Espessura: ${result.inputs.thickness}mm`,
    `Acabamento: ${result.inputs.finish}`,
    '---',
    `Custo Material: R$ ${result.totalMaterialCost.toFixed(2)}`,
    `Custo Processos: R$ ${result.totalProcessCost.toFixed(2)}`,
    `Overhead: R$ ${result.overhead.totalOverhead.toFixed(2)}`,
    `Custo Total: R$ ${result.totalCost.toFixed(2)}`,
    '---',
    `Margem: ${result.margin.marginPercent.toFixed(1)}%`,
    `Preço Final: R$ ${result.finalPrice.toFixed(2)}`,
    `Preço Mínimo: R$ ${result.minPrice.toFixed(2)}`,
    '---',
    `Aproveitamento: ${result.nestingResult.utilization.toFixed(1)}%`,
    `Chapas: ${result.nestingResult.totalSheets}`,
    `Hash: ${result.hash.substring(0, 8)}...`
  ];
  
  return lines.join('\n');
}

/**
 * Export result as JSON
 */
export function exportResultAsJSON(result: PricingResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Get cost breakdown for display
 */
export function getCostBreakdown(result: PricingResult): {
  category: string;
  value: number;
  percentage: number;
}[] {
  const total = result.totalCost;
  
  return [
    {
      category: 'Material',
      value: result.totalMaterialCost,
      percentage: (result.totalMaterialCost / total) * 100
    },
    {
      category: 'Processos',
      value: result.totalProcessCost,
      percentage: (result.totalProcessCost / total) * 100
    },
    {
      category: 'Overhead',
      value: result.overhead.totalOverhead,
      percentage: (result.overhead.totalOverhead / total) * 100
    },
    {
      category: 'Margem',
      value: result.margin.marginValue,
      percentage: (result.margin.marginValue / result.finalPrice) * 100
    }
  ];
}