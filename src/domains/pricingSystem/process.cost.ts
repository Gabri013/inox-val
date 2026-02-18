// ============================================================
// PROCESS COST - Calculate process costs for manufacturing
// ============================================================

import {
  ProcessCostBreakdown,

  BOMWithGeometry,

} from './pricing.types';
import { Process, ProcessKey } from '../engine/types';


// ============================================================
// Types
// ============================================================

export interface ProcessCostResult {
  success: boolean;
  breakdown: ProcessCostBreakdown[];
  totalProcessCost: number;
  totalEstimatedMinutes: number;
  errors: ProcessCostError[];
}

export interface ProcessCostError {
  code: string;
  message: string;
  processKey?: ProcessKey;
}

export interface ProcessMetrics {
  cutLengthM: number;
  weldLengthM: number;
  bendCount: number;
  finishAreaM2: number;
  partCount: number;
  tubeCount: number;
}

// ============================================================
// Default Process Costs (fallback when not in database)
// ============================================================

export const DEFAULT_PROCESS_COSTS: Record<ProcessKey, {
  label: string;
  setupMinutes: number;
  costPerHour: number;
  costPerMeter?: number;
  costPerBend?: number;
  costPerM2?: number;
  costPerUnit?: number;
}> = {
  'CORTE_LASER': {
    label: 'Corte a Laser',
    setupMinutes: 15,
    costPerHour: 180,
    costPerMeter: 8
  },
  'CORTE_GUILHOTINA': {
    label: 'Corte Guilhotina',
    setupMinutes: 10,
    costPerHour: 100,
    costPerUnit: 5
  },
  'CORTE_PLASMA': {
    label: 'Corte Plasma',
    setupMinutes: 15,
    costPerHour: 120,
    costPerMeter: 5
  },
  'DOBRA': {
    label: 'Dobra',
    setupMinutes: 20,
    costPerHour: 150,
    costPerBend: 3
  },
  'SOLDA_TIG': {
    label: 'Solda TIG',
    setupMinutes: 30,
    costPerHour: 200,
    costPerMeter: 25
  },
  'SOLDA_MIG': {
    label: 'Solda MIG',
    setupMinutes: 20,
    costPerHour: 180,
    costPerMeter: 20
  },
  'SOLDA_LASER': {
    label: 'Solda a Laser',
    setupMinutes: 25,
    costPerHour: 300,
    costPerMeter: 35
  },
  'POLIMENTO': {
    label: 'Polimento',
    setupMinutes: 30,
    costPerHour: 120,
    costPerM2: 45
  },
  'ESCOVADO': {
    label: 'Escovado',
    setupMinutes: 20,
    costPerHour: 100,
    costPerM2: 30
  },
  'PASSIVACAO': {
    label: 'Passivação',
    setupMinutes: 15,
    costPerHour: 80,
    costPerM2: 15
  },
  'MONTAGEM': {
    label: 'Montagem',
    setupMinutes: 30,
    costPerHour: 100,
    costPerUnit: 10
  },
  'EMBALAGEM': {
    label: 'Embalagem',
    setupMinutes: 10,
    costPerHour: 60,
    costPerUnit: 5
  },
  'FRETE': {
    label: 'Frete',
    setupMinutes: 0,
    costPerHour: 0,
    costPerUnit: 50
  },
  'CORTE_TUBO': {
    label: 'Corte de Tubo',
    setupMinutes: 10,
    costPerHour: 100,
    costPerUnit: 3
  },
  'DOBRA_TUBO': {
    label: 'Dobra de Tubo',
    setupMinutes: 20,
    costPerHour: 150,
    costPerBend: 8
  }
};

// ============================================================
// Process Cost Calculation
// ============================================================

/**
 * Calculate process costs for a BOM
 */
export function calculateProcessCost(
  bom: BOMWithGeometry,
  processes: Map<string, Process> | Process[]
): ProcessCostResult {
  const breakdown: ProcessCostBreakdown[] = [];
  const errors: ProcessCostError[] = [];
  
  let totalProcessCost = 0;
  let totalEstimatedMinutes = 0;
  
  // Calculate metrics from BOM
  const metrics = calculateProcessMetrics(bom);
  
  // Get unique process keys
  const processKeys = new Set<ProcessKey>();
  for (const req of bom.processes) {
    processKeys.add(req.processKey);
  }
  
  // Calculate cost for each process
  for (const processKey of processKeys) {
    const process = Array.isArray(processes) 
      ? processes.find(p => p.key === processKey)
      : processes.get(processKey);
    
    const costResult = calculateSingleProcessCost(
      processKey,
      process,
      metrics,
      bom
    );
    
    if (costResult.error) {
      errors.push({
        code: 'PROCESS_COST_ERROR',
        message: costResult.error,
        processKey
      });
    }
    
    breakdown.push({
      processKey,
      processLabel: costResult.label,
      setupCost: costResult.setupCost,
      unitCost: costResult.unitCost,
      totalCost: costResult.totalCost,
      estimatedMinutes: costResult.estimatedMinutes,
      details: costResult.details
    });
    
    totalProcessCost += costResult.totalCost;
    totalEstimatedMinutes += costResult.estimatedMinutes;
  }
  
  return {
    success: errors.length === 0,
    breakdown,
    totalProcessCost,
    totalEstimatedMinutes,
    errors
  };
}

/**
 * Calculate cost for a single process
 */
function calculateSingleProcessCost(
  processKey: ProcessKey,
  process: Process | undefined,
  metrics: ProcessMetrics,
  _bom: BOMWithGeometry
): {
  label: string;
  setupCost: number;
  unitCost: number;
  totalCost: number;
  estimatedMinutes: number;
  details: string;
  error?: string;
} {
  // Get defaults or use process data
  const defaults = DEFAULT_PROCESS_COSTS[processKey];
  const label = process?.label || defaults?.label || processKey;
  
  const setupMinutes = process?.costModel?.setupMinutes ?? defaults?.setupMinutes ?? 15;
  const costPerHour = process?.costModel?.costPerHour ?? defaults?.costPerHour ?? 100;
  const costPerMeter = process?.costModel?.costPerMeter ?? defaults?.costPerMeter;
  const costPerBend = process?.costModel?.costPerBend ?? defaults?.costPerBend;
  const costPerM2 = process?.costModel?.costPerM2 ?? defaults?.costPerM2;
  const costPerUnit = process?.costModel?.costPerUnit ?? defaults?.costPerUnit;
  
  // Setup cost
  const setupCost = (setupMinutes / 60) * costPerHour;
  
  let unitCost = 0;
  let estimatedMinutes = setupMinutes;
  let details = '';
  
  // Calculate based on process type
  switch (processKey) {
    case 'CORTE_LASER':
    case 'CORTE_PLASMA': {
      // Cost per meter of cut
      if (costPerMeter) {
        unitCost = metrics.cutLengthM * costPerMeter;
        details = `${metrics.cutLengthM.toFixed(2)}m de corte`;
      }
      estimatedMinutes += metrics.cutLengthM * 0.5; // ~2m/min
      break;
    }
    
    case 'CORTE_GUILHOTINA': {
      // Cost per sheet
      if (costPerUnit) {
        unitCost = metrics.partCount * costPerUnit;
        details = `${metrics.partCount} chapas`;
      }
      estimatedMinutes += metrics.partCount * 2;
      break;
    }
    
    case 'DOBRA': {
      // Cost per bend
      if (costPerBend) {
        unitCost = metrics.bendCount * costPerBend;
        details = `${metrics.bendCount} dobras`;
      }
      estimatedMinutes += metrics.bendCount * 0.5;
      break;
    }
    
    case 'SOLDA_TIG':
    case 'SOLDA_MIG':
    case 'SOLDA_LASER': {
      // Cost per meter of weld
      if (costPerMeter) {
        unitCost = metrics.weldLengthM * costPerMeter;
        details = `${metrics.weldLengthM.toFixed(2)}m de solda`;
      }
      estimatedMinutes += metrics.weldLengthM * 5; // ~12cm/min
      break;
    }
    
    case 'POLIMENTO':
    case 'ESCOVADO':
    case 'PASSIVACAO': {
      // Cost per m²
      if (costPerM2) {
        unitCost = metrics.finishAreaM2 * costPerM2;
        details = `${metrics.finishAreaM2.toFixed(2)}m²`;
      }
      estimatedMinutes += metrics.finishAreaM2 * 10; // ~6m²/hora
      break;
    }
    
    case 'MONTAGEM': {
      // Cost per unit
      const totalUnits = metrics.partCount + metrics.tubeCount;
      if (costPerUnit) {
        unitCost = totalUnits * costPerUnit;
        details = `${totalUnits} componentes`;
      }
      estimatedMinutes += totalUnits * 5;
      break;
    }
    
    case 'EMBALAGEM': {
      // Cost per unit
      const totalUnits = metrics.partCount + metrics.tubeCount;
      if (costPerUnit) {
        unitCost = totalUnits * costPerUnit;
        details = `${totalUnits} itens`;
      }
      estimatedMinutes += totalUnits * 2;
      break;
    }
    
    case 'FRETE': {
      // Fixed or per km
      if (costPerUnit) {
        unitCost = costPerUnit;
        details = 'Frete estimado';
      }
      break;
    }
    
    case 'CORTE_TUBO': {
      // Cost per tube cut
      if (costPerUnit) {
        unitCost = metrics.tubeCount * costPerUnit;
        details = `${metrics.tubeCount} cortes de tubo`;
      }
      estimatedMinutes += metrics.tubeCount * 2;
      break;
    }
    
    case 'DOBRA_TUBO': {
      // Cost per tube bend (estimate 2 bends per tube)
      const tubeBends = metrics.tubeCount * 2;
      if (costPerBend) {
        unitCost = tubeBends * costPerBend;
        details = `${tubeBends} dobras de tubo`;
      }
      estimatedMinutes += tubeBends * 2;
      break;
    }
    
    default: {
      // Generic process - use hourly rate
      const estimatedHours = 1;
      unitCost = estimatedHours * costPerHour;
      estimatedMinutes += 60;
      details = 'Tempo estimado';
    }
  }
  
  const totalCost = setupCost + unitCost;
  
  return {
    label,
    setupCost,
    unitCost,
    totalCost,
    estimatedMinutes,
    details
  };
}

// ============================================================
// Metrics Calculation
// ============================================================

/**
 * Calculate process metrics from BOM
 */
export function calculateProcessMetrics(bom: BOMWithGeometry): ProcessMetrics {
  let cutLengthM = 0;
  let weldLengthM = 0;
  let bendCount = 0;
  let finishAreaM2 = 0;
  let partCount = 0;
  let tubeCount = 0;
  
  // Sheet parts
  for (const sheet of bom.sheetParts) {
    const geometry = bom.geometryData.get(sheet.id);
    
    // Cut length
    if (geometry) {
      cutLengthM += (geometry.cutLengthMm / 1000) * sheet.quantity;
      finishAreaM2 += (geometry.finishAreaMm2 / 1_000_000) * sheet.quantity;
      bendCount += geometry.bendCount * sheet.quantity;
    } else {
      // Fallback calculation
      const perimeter = 2 * (sheet.blank.width + sheet.blank.height);
      cutLengthM += (perimeter / 1000) * sheet.quantity;
      finishAreaM2 += (sheet.blank.width * sheet.blank.height * 2 / 1_000_000) * sheet.quantity;
      bendCount += sheet.bends.length * sheet.quantity;
    }
    
    partCount += sheet.quantity;
    
    // Weld length estimation (perimeter for corner welds)
    const weldPerimeter = 2 * (sheet.blank.width + sheet.blank.height);
    weldLengthM += (weldPerimeter / 1000) * sheet.quantity * 0.3; // 30% of perimeter
  }
  
  // Tube parts
  for (const tube of bom.tubes) {
    tubeCount += tube.quantity;
    
    // Weld length for tubes (circumference)
    const profile = parseTubeProfile(tube.profile);
    const circumference = 2 * (profile.width + profile.height);
    weldLengthM += (circumference / 1000) * tube.quantity;
  }
  
  return {
    cutLengthM,
    weldLengthM,
    bendCount,
    finishAreaM2,
    partCount,
    tubeCount
  };
}

/**
 * Parse tube profile string
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
// Utility Functions
// ============================================================

/**
 * Get process by key
 */
export function getProcessByKey(
  processes: Process[],
  key: ProcessKey
): Process | undefined {
  return processes.find(p => p.key === key);
}

/**
 * Calculate total estimated hours
 */
export function calculateTotalHours(minutes: number): number {
  return minutes / 60;
}

/**
 * Get process summary
 */
export function getProcessSummary(breakdown: ProcessCostBreakdown[]): {
  totalSetup: number;
  totalUnit: number;
  totalCost: number;
  processCount: number;
} {
  return {
    totalSetup: breakdown.reduce((sum, b) => sum + b.setupCost, 0),
    totalUnit: breakdown.reduce((sum, b) => sum + b.unitCost, 0),
    totalCost: breakdown.reduce((sum, b) => sum + b.totalCost, 0),
    processCount: breakdown.length
  };
}

/**
 * Check if a process is required for a finish type
 */
export function isProcessRequiredForFinish(
  processKey: ProcessKey,
  finish: 'POLIDO' | 'ESCOVADO' | '2B'
): boolean {
  switch (finish) {
    case 'POLIDO':
      return processKey === 'POLIMENTO';
    case 'ESCOVADO':
      return processKey === 'ESCOVADO';
    case '2B':
      return false; // No additional finish process
    default:
      return false;
  }
}

/**
 * Get required processes for equipment type
 */
export function getRequiredProcesses(
  hasSheets: boolean,
  hasTubes: boolean,
  finish: 'POLIDO' | 'ESCOVADO' | '2B'
): ProcessKey[] {
  const processes: ProcessKey[] = [];
  
  if (hasSheets) {
    processes.push('CORTE_LASER');
    processes.push('DOBRA');
  }
  
  if (hasTubes) {
    processes.push('CORTE_TUBO');
    processes.push('SOLDA_TIG');
  }
  
  if (hasSheets || hasTubes) {
    processes.push('SOLDA_TIG');
    processes.push('MONTAGEM');
    processes.push('EMBALAGEM');
  }
  
  // Add finish process
  if (finish === 'POLIDO') {
    processes.push('POLIMENTO');
  } else if (finish === 'ESCOVADO') {
    processes.push('ESCOVADO');
  }
  
  return processes;
}