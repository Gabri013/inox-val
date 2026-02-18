// ============================================================
// EQUIPMENT REGISTRY - Template registry and BOM evaluator
// ============================================================

import {
  EquipmentTemplateDSL,
  EquipmentCategory,
  EquipmentPreset,
  EvaluatedSheetPart,
  EvaluatedTubePart,
  EvaluatedAccessoryPart,
  EvaluatedBOM,
  EvaluationResult,
  StructuralRuleResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  SheetPartDSL,
  TubePartDSL,
  AccessoryPartDSL,
  BendDSL,
  PartFeatureDSL,
  StructuralRuleDSL,
} from './equipment.dsl.schema';
import { evaluateExpression, ExpressionError } from './equipment.expression';
import { validateTemplate } from './equipment.validator';

// ============================================================
// TEMPLATE REGISTRY
// ============================================================

/**
 * Registry for equipment templates
 * Manages template storage and retrieval
 */
class EquipmentRegistry {
  private templates: Map<string, EquipmentTemplateDSL> = new Map();
  private presets: Map<string, EquipmentPreset> = new Map();
  private presetsByTemplate: Map<string, EquipmentPreset[]> = new Map();

  /**
   * Register a template
   */
  registerTemplate(template: EquipmentTemplateDSL): void {
    // Validate before registering
    const validation = validateTemplate(template);
    if (!validation.valid) {
      const errors = validation.errors.map(e => e.message).join('; ');
      throw new Error(`Invalid template '${template.key}': ${errors}`);
    }

    this.templates.set(template.key, template);
  }

  /**
   * Register multiple templates
   */
  registerTemplates(templates: EquipmentTemplateDSL[]): void {
    for (const template of templates) {
      this.registerTemplate(template);
    }
  }

  /**
   * Get a template by key
   */
  getTemplate(key: string): EquipmentTemplateDSL | undefined {
    return this.templates.get(key);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): EquipmentTemplateDSL[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: EquipmentCategory): EquipmentTemplateDSL[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): EquipmentCategory[] {
    const categories = new Set<EquipmentCategory>();
    this.templates.forEach(t => categories.add(t.category));
    return Array.from(categories);
  }

  /**
   * Check if template exists
   */
  hasTemplate(key: string): boolean {
    return this.templates.has(key);
  }

  /**
   * Register a preset
   */
  registerPreset(preset: EquipmentPreset): void {
    if (!this.templates.has(preset.templateKey)) {
      throw new Error(`Unknown template key: ${preset.templateKey}`);
    }

    this.presets.set(preset.id, preset);

    // Index by template
    const existing = this.presetsByTemplate.get(preset.templateKey) || [];
    existing.push(preset);
    this.presetsByTemplate.set(preset.templateKey, existing);
  }

  /**
   * Register multiple presets
   */
  registerPresets(presets: EquipmentPreset[]): void {
    for (const preset of presets) {
      this.registerPreset(preset);
    }
  }

  /**
   * Get preset by ID
   */
  getPreset(id: string): EquipmentPreset | undefined {
    return this.presets.get(id);
  }

  /**
   * Get presets for a template
   */
  getPresetsForTemplate(templateKey: string): EquipmentPreset[] {
    return this.presetsByTemplate.get(templateKey) || [];
  }

  /**
   * Get all presets
   */
  getAllPresets(): EquipmentPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Clear all templates and presets
   */
  clear(): void {
    this.templates.clear();
    this.presets.clear();
    this.presetsByTemplate.clear();
  }
}

// Singleton instance
export const equipmentRegistry = new EquipmentRegistry();

// ============================================================
// BOM EVALUATOR
// ============================================================

/**
 * Evaluate a template with given input values
 */
export function evaluateTemplate(
  template: EquipmentTemplateDSL,
  inputs: Record<string, unknown>
): EvaluationResult {
  // Build context with inputs and defaults
  const context = buildContext(template, inputs);

  // Evaluate derived fields
  const derived = evaluateDerivedFields(template, context);

  // Merge derived into context
  const fullContext = { ...context, ...derived };

  // Evaluate BOM
  const bom = evaluateBOM(template.bom, fullContext);

  // Evaluate structural rules
  const structuralResults = evaluateStructuralRules(template.structuralRules, fullContext);

  // Apply structural rule actions to BOM
  const modifiedBOM = applyStructuralActions(bom, structuralResults, fullContext);

  // Evaluate validations
  const validation = evaluateValidations(template.validations, fullContext);

  // Evaluate metrics
  const metrics = evaluateMetrics(template.metricsModel, fullContext);

  return {
    templateKey: template.key,
    inputs: context,
    derived,
    bom: modifiedBOM,
    structuralResults,
    validation,
    metrics,
  };
}

/**
 * Build evaluation context from inputs and defaults
 */
function buildContext(
  template: EquipmentTemplateDSL,
  inputs: Record<string, unknown>
): Record<string, unknown> {
  const context: Record<string, unknown> = {};

  for (const input of template.inputs) {
    if (input.key in inputs) {
      context[input.key] = inputs[input.key];
    } else if (input.default !== undefined) {
      context[input.key] = input.default;
    } else if (input.required) {
      throw new Error(`Missing required input: ${input.key}`);
    }
  }

  // Add category to context for rules
  context.category = template.category;

  return context;
}

/**
 * Evaluate derived fields
 */
function evaluateDerivedFields(
  template: EquipmentTemplateDSL,
  context: Record<string, unknown>
): Record<string, unknown> {
  const derived: Record<string, unknown> = {};

  if (!template.derived) return derived;

  for (const field of template.derived) {
    try {
      derived[field.key] = evaluateExpression(field.expression, context);
    } catch (e) {
      if (e instanceof ExpressionError) {
        throw new Error(`Error evaluating derived field '${field.key}': ${e.message}`);
      }
      throw e;
    }
  }

  return derived;
}

/**
 * Evaluate BOM parts
 */
function evaluateBOM(
  bom: EquipmentTemplateDSL['bom'],
  context: Record<string, unknown>
): EvaluatedBOM {
  return {
    sheetParts: (bom.sheetParts || []).map(part => evaluateSheetPart(part, context)),
    tubes: (bom.tubes || []).map(part => evaluateTubePart(part, context)),
    accessories: (bom.accessories || []).map(part => evaluateAccessoryPart(part, context)),
  };
}

/**
 * Evaluate a sheet part
 */
function evaluateSheetPart(
  part: SheetPartDSL,
  context: Record<string, unknown>
): EvaluatedSheetPart {
  try {
    const quantity = toNumber(evaluateExpression(part.quantityExpr, context));
    const width = toNumber(evaluateExpression(part.widthExpr, context));
    const height = toNumber(evaluateExpression(part.heightExpr, context));
    const thickness = toNumber(evaluateExpression(part.thicknessExpr, context));
    const materialKey = toString(evaluateExpression(part.materialKeyExpr, context));

    // Evaluate allowRotate (can be boolean or expression)
    let allowRotate: boolean;
    if (typeof part.allowRotate === 'boolean') {
      allowRotate = part.allowRotate;
    } else {
      allowRotate = toBoolean(evaluateExpression(part.allowRotate, context));
    }

    // Evaluate grainDirection
    let grainDirection: 'x' | 'y' | null;
    if (part.grainDirection === 'none' || !part.grainDirection) {
      grainDirection = null;
    } else if (part.grainDirection === 'x' || part.grainDirection === 'y') {
      grainDirection = part.grainDirection;
    } else {
      const result = evaluateExpression(part.grainDirection, context);
      grainDirection = result === 'x' ? 'x' : result === 'y' ? 'y' : null;
    }

    // Evaluate features
    const features = (part.features || []).map(f => evaluateFeature(f, context));

    // Evaluate bends
    const bends = (part.bends || []).map(b => evaluateBend(b, context));

    return {
      id: part.id,
      label: part.label,
      materialKey,
      quantity,
      width,
      height,
      thickness,
      allowRotate,
      grainDirection,
      features,
      bends,
    };
  } catch (e) {
    if (e instanceof ExpressionError) {
      throw new Error(`Error evaluating sheet part '${part.id}': ${e.message}`);
    }
    throw e;
  }
}

/**
 * Evaluate a part feature
 */
function evaluateFeature(
  feature: PartFeatureDSL,
  context: Record<string, unknown>
): EvaluatedSheetPart['features'][0] {
  const x = toNumber(evaluateExpression(feature.positionXExpr, context));
  const y = toNumber(evaluateExpression(feature.positionYExpr, context));

  const dimensions: { width: number; height: number; diameter?: number } = {
    width: 0,
    height: 0,
  };

  if (feature.widthExpr) {
    dimensions.width = toNumber(evaluateExpression(feature.widthExpr, context));
  }
  if (feature.heightExpr) {
    dimensions.height = toNumber(evaluateExpression(feature.heightExpr, context));
  }
  if (feature.diameterExpr) {
    dimensions.diameter = toNumber(evaluateExpression(feature.diameterExpr, context));
  }

  return {
    type: feature.type,
    position: { x, y },
    dimensions,
  };
}

/**
 * Evaluate a bend
 */
function evaluateBend(
  bend: BendDSL,
  context: Record<string, unknown>
): EvaluatedSheetPart['bends'][0] {
  const angle = toNumber(evaluateExpression(bend.angleExpr, context));
  const position = toNumber(evaluateExpression(bend.positionExpr, context));

  return {
    angle,
    position,
    direction: bend.direction,
    kFactor: bend.kFactor ?? 0.33,
  };
}

/**
 * Evaluate a tube part
 */
function evaluateTubePart(
  part: TubePartDSL,
  context: Record<string, unknown>
): EvaluatedTubePart {
  try {
    const quantity = toNumber(evaluateExpression(part.quantityExpr, context));
    const length = toNumber(evaluateExpression(part.lengthExpr, context));
    const materialKey = toString(evaluateExpression(part.materialKeyExpr, context));
    const profile = toString(evaluateExpression(part.profileExpr, context));

    return {
      id: part.id,
      label: part.label,
      materialKey,
      quantity,
      length,
      profile,
    };
  } catch (e) {
    if (e instanceof ExpressionError) {
      throw new Error(`Error evaluating tube part '${part.id}': ${e.message}`);
    }
    throw e;
  }
}

/**
 * Evaluate an accessory part
 */
function evaluateAccessoryPart(
  part: AccessoryPartDSL,
  context: Record<string, unknown>
): EvaluatedAccessoryPart {
  try {
    const quantity = toNumber(evaluateExpression(part.quantityExpr, context));

    return {
      id: part.id,
      label: part.label,
      sku: part.sku,
      quantity,
    };
  } catch (e) {
    if (e instanceof ExpressionError) {
      throw new Error(`Error evaluating accessory part '${part.id}': ${e.message}`);
    }
    throw e;
  }
}

/**
 * Evaluate structural rules
 */
function evaluateStructuralRules(
  rules: StructuralRuleDSL[] | undefined,
  context: Record<string, unknown>
): StructuralRuleResult[] {
  if (!rules) return [];

  return rules.map(rule => {
    let triggered = false;
    try {
      triggered = toBoolean(evaluateExpression(rule.condition, context));
    } catch (e) {
      // If condition can't be evaluated, don't trigger
      triggered = false;
    }

    return {
      ruleId: rule.id,
      triggered,
      action: rule.action,
      params: rule.params,
      message: rule.message,
      severity: rule.severity,
    };
  });
}

/**
 * Apply structural rule actions to BOM
 */
function applyStructuralActions(
  bom: EvaluatedBOM,
  results: StructuralRuleResult[],
  context: Record<string, unknown>
): EvaluatedBOM {
  const modifiedBOM = {
    sheetParts: [...bom.sheetParts],
    tubes: [...bom.tubes],
    accessories: [...bom.accessories],
  };

  for (const result of results) {
    if (!result.triggered) continue;

    switch (result.action) {
      case 'ADD_TUBE':
        modifiedBOM.tubes.push(createTubeFromAction(result.params, context));
        break;

      case 'ADD_SHEET':
        modifiedBOM.sheetParts.push(createSheetFromAction(result.params, context));
        break;

      case 'ADD_ACCESSORY':
        modifiedBOM.accessories.push(createAccessoryFromAction(result.params, context));
        break;

      // REQUIRE_MIN_THICKNESS and BLOCK are handled in validation
    }
  }

  return modifiedBOM;
}

/**
 * Create a tube part from action params
 */
function createTubeFromAction(
  params: Record<string, unknown>,
  context: Record<string, unknown>
): EvaluatedTubePart {
  return {
    id: toString(params.id),
    label: toString(params.label) || 'Added Part',
    materialKey: toString(params.materialKeyExpr) || 'TUBE#SS304#40x40x1.2#6000#DEFAULT',
    quantity: 1,
    length: toNumber(evaluateExpression(toString(params.lengthExpr) || '0', context)),
    profile: toString(params.profile) || '40x40x1.2',
  };
}

/**
 * Create a sheet part from action params
 */
function createSheetFromAction(
  params: Record<string, unknown>,
  context: Record<string, unknown>
): EvaluatedSheetPart {
  return {
    id: toString(params.id),
    label: toString(params.label) || 'Added Part',
    materialKey: toString(params.materialKeyExpr) || 'SHEET#SS304#1.2#2B#3000x1250#DEFAULT',
    quantity: 1,
    width: toNumber(evaluateExpression(toString(params.widthExpr) || '0', context)),
    height: toNumber(evaluateExpression(toString(params.heightExpr) || '0', context)),
    thickness: toNumber(evaluateExpression(toString(params.thicknessExpr) || '1.2', context)),
    allowRotate: true,
    grainDirection: null,
    features: [],
    bends: [],
  };
}

/**
 * Create an accessory from action params
 */
function createAccessoryFromAction(
  params: Record<string, unknown>,
  context: Record<string, unknown>
): EvaluatedAccessoryPart {
  return {
    id: `acc_${params.sku}`,
    label: toString(params.label) || 'Accessory',
    sku: toString(params.sku) || '',
    quantity: toNumber(evaluateExpression(toString(params.quantityExpr) || '1', context)),
  };
}

/**
 * Evaluate validations
 */
function evaluateValidations(
  validations: ValidationDSL[] | undefined,
  context: Record<string, unknown>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!validations) return { valid: true, errors, warnings };

  for (const validation of validations) {
    let triggered = false;
    try {
      triggered = toBoolean(evaluateExpression(validation.condition, context));
    } catch {
      // Skip if can't evaluate
      continue;
    }

    if (triggered) {
      if (validation.severity === 'error') {
        errors.push({
          code: validation.id,
          message: validation.message,
          field: validation.id,
        });
      } else {
        warnings.push({
          code: validation.id,
          message: validation.message,
          field: validation.id,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Evaluate metrics model
 */
function evaluateMetrics(
  metrics: MetricsModelDSL | undefined,
  context: Record<string, unknown>
): EvaluationResult['metrics'] {
  const result: EvaluationResult['metrics'] = {};

  if (!metrics) return result;

  if (metrics.weldMetersExpr) {
    try {
      result.weldMeters = toNumber(evaluateExpression(metrics.weldMetersExpr, context));
    } catch {
      // Skip
    }
  }

  if (metrics.finishM2Expr) {
    try {
      result.finishM2 = toNumber(evaluateExpression(metrics.finishM2Expr, context));
    } catch {
      // Skip
    }
  }

  if (metrics.cutMetersExpr) {
    try {
      result.cutMeters = toNumber(evaluateExpression(metrics.cutMetersExpr, context));
    } catch {
      // Skip
    }
  }

  if (metrics.bendCountExpr) {
    try {
      result.bendCount = toNumber(evaluateExpression(metrics.bendCountExpr, context));
    } catch {
      // Skip
    }
  }

  return result;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

import { ValidationDSL, MetricsModelDSL } from './equipment.dsl.schema';

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return 0;
}

function toString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value === null || value === undefined) return '';
  return String(value);
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
  return Boolean(value);
}

// ============================================================
// CONVENIENCE EXPORTS
// ============================================================

/**
 * Get all templates grouped by category
 */
export function getTemplatesByCategory(): Record<EquipmentCategory, EquipmentTemplateDSL[]> {
  const result: Record<EquipmentCategory, EquipmentTemplateDSL[]> = {
    MESA: [],
    BANCADA: [],
    ARMARIO: [],
    ESTANTE: [],
    CARRINHO: [],
  };

  for (const template of equipmentRegistry.getAllTemplates()) {
    result[template.category].push(template);
  }

  return result;
}

/**
 * Quick evaluate a template by key
 */
export function quickEvaluate(
  templateKey: string,
  inputs: Record<string, unknown>
): EvaluationResult {
  const template = equipmentRegistry.getTemplate(templateKey);
  if (!template) {
    throw new Error(`Template not found: ${templateKey}`);
  }
  return evaluateTemplate(template, inputs);
}