// ============================================================
// EQUIPMENT TEMPLATE VALIDATOR - Validates DSL templates
// ============================================================

import {
  EquipmentTemplateDSL,
  InputFieldDSL,
  DerivedFieldDSL,
  SheetPartDSL,
  TubePartDSL,
  AccessoryPartDSL,
  StructuralRuleDSL,
  ProcessRuleDSL,
  ValidationDSL,
  MetricsModelDSL,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  EquipmentCategory,
} from './equipment.dsl.schema';
import { validateExpressionWithVariables } from './equipment.expression';

/**
 * Valid structural actions
 */
const VALID_ACTIONS = ['ADD_TUBE', 'ADD_SHEET', 'REQUIRE_MIN_THICKNESS', 'BLOCK', 'ADD_ACCESSORY'];

/**
 * Valid categories
 */
const VALID_CATEGORIES: EquipmentCategory[] = ['MESA', 'BANCADA', 'ARMARIO', 'ESTANTE', 'CARRINHO'];

/**
 * Valid process keys
 */
const VALID_PROCESS_KEYS = [
  'CORTE_LASER',
  'CORTE_GUILHOTINA',
  'CORTE_PLASMA',
  'DOBRA',
  'SOLDA_TIG',
  'SOLDA_MIG',
  'SOLDA_LASER',
  'POLIMENTO',
  'ESCOVADO',
  'PASSIVACAO',
  'MONTAGEM',
  'EMBALAGEM',
  'FRETE',
  'CORTE_TUBO',
  'DOBRA_TUBO',
];

/**
 * Validate a complete equipment template
 */
export function validateTemplate(template: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Type check the template object
  if (!template || typeof template !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'INVALID_TYPE', message: 'Template must be an object' }],
      warnings: [],
    };
  }

  const t = template as Partial<EquipmentTemplateDSL>;

  // Validate required fields
  validateRequiredFields(t, errors);

  // Validate key format
  if (t.key) {
    validateKey(t.key, errors);
  }

  // Validate category
  if (t.category) {
    validateCategory(t.category, errors);
  }

  // Collect all variable names from inputs
  const inputVariables = t.inputs?.map(i => i.key) || [];

  // Validate inputs
  if (t.inputs) {
    validateInputs(t.inputs, errors, warnings);
  }

  // Validate derived fields
  if (t.derived) {
    validateDerivedFields(t.derived, inputVariables, errors);
  }

  // All available variables for expression validation
  const allVariables = [
    ...inputVariables,
    ...(t.derived?.map(d => d.key) || []),
  ];

  // Validate BOM
  if (t.bom) {
    validateBOM(t.bom, allVariables, errors, warnings);
  }

  // Validate structural rules
  if (t.structuralRules) {
    validateStructuralRules(t.structuralRules, allVariables, errors);
  }

  // Validate process rules
  if (t.processRules) {
    validateProcessRules(t.processRules, allVariables, errors);
  }

  // Validate validations
  if (t.validations) {
    validateValidations(t.validations, allVariables, errors);
  }

  // Validate metrics model
  if (t.metricsModel) {
    validateMetricsModel(t.metricsModel, allVariables, errors);
  }

  // Check for duplicate IDs in BOM
  if (t.bom) {
    checkDuplicateIds(t.bom, errors);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate required fields
 */
function validateRequiredFields(template: Partial<EquipmentTemplateDSL>, errors: ValidationError[]): void {
  const required: (keyof EquipmentTemplateDSL)[] = [
    'key', 'label', 'category', 'description', 'inputs', 'bom'
  ];

  for (const field of required) {
    if (!template[field]) {
      errors.push({
        code: 'REQUIRED_FIELD',
        message: `Missing required field: ${field}`,
        field,
      });
    }
  }

  // Check for empty arrays
  if (template.inputs && template.inputs.length === 0) {
    errors.push({
      code: 'EMPTY_INPUTS',
      message: 'Template must have at least one input field',
      field: 'inputs',
    });
  }
}

/**
 * Validate template key format
 */
function validateKey(key: string, errors: ValidationError[]): void {
  // Key should be uppercase with underscores
  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
    errors.push({
      code: 'INVALID_KEY_FORMAT',
      message: 'Key must be uppercase with underscores (e.g., MESA_LISA)',
      field: 'key',
    });
  }

  // Key should not be too long
  if (key.length > 50) {
    errors.push({
      code: 'KEY_TOO_LONG',
      message: 'Key must be 50 characters or less',
      field: 'key',
    });
  }
}

/**
 * Validate category
 */
function validateCategory(category: string, errors: ValidationError[]): void {
  if (!VALID_CATEGORIES.includes(category as EquipmentCategory)) {
    errors.push({
      code: 'INVALID_CATEGORY',
      message: `Invalid category: ${category}. Valid categories: ${VALID_CATEGORIES.join(', ')}`,
      field: 'category',
    });
  }
}

/**
 * Validate input fields
 */
function validateInputs(
  inputs: InputFieldDSL[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const seenKeys = new Set<string>();

  for (const input of inputs) {
    // Check for duplicate keys
    if (seenKeys.has(input.key)) {
      errors.push({
        code: 'DUPLICATE_INPUT_KEY',
        message: `Duplicate input key: ${input.key}`,
        field: 'inputs',
      });
    }
    seenKeys.add(input.key);

    // Validate key format
    if (!/^[a-z][a-zA-Z0-9]*$/.test(input.key)) {
      errors.push({
        code: 'INVALID_INPUT_KEY',
        message: `Input key '${input.key}' must be camelCase starting with lowercase`,
        field: 'inputs',
      });
    }

    // Validate type
    if (!['number', 'boolean', 'select'].includes(input.type)) {
      errors.push({
        code: 'INVALID_INPUT_TYPE',
        message: `Invalid input type: ${input.type}. Must be number, boolean, or select`,
        field: 'inputs',
      });
    }

    // Validate select has options
    if (input.type === 'select' && (!input.options || input.options.length === 0)) {
      errors.push({
        code: 'SELECT_NO_OPTIONS',
        message: `Select input '${input.key}' must have options`,
        field: 'inputs',
      });
    }

    // Validate number constraints
    if (input.type === 'number') {
      if (input.min !== undefined && input.max !== undefined && input.min > input.max) {
        errors.push({
          code: 'INVALID_RANGE',
          message: `Input '${input.key}': min (${input.min}) cannot be greater than max (${input.max})`,
          field: 'inputs',
        });
      }

      // Warn if no default
      if (input.default === undefined) {
        warnings.push({
          code: 'NO_DEFAULT',
          message: `Input '${input.key}' has no default value`,
          field: 'inputs',
          suggestion: 'Consider adding a default value for better UX',
        });
      }
    }
  }

  // Check for required standard inputs
  const standardInputs = ['width', 'depth', 'height', 'thickness'];
  for (const std of standardInputs) {
    if (!seenKeys.has(std)) {
      warnings.push({
        code: 'MISSING_STANDARD_INPUT',
        message: `Missing standard input: ${std}`,
        field: 'inputs',
        suggestion: `Consider adding '${std}' input for consistency`,
      });
    }
  }
}

/**
 * Validate derived fields
 */
function validateDerivedFields(
  derived: DerivedFieldDSL[],
  inputVariables: string[],
  errors: ValidationError[]
): void {
  const seenKeys = new Set<string>(inputVariables);

  for (const field of derived) {
    // Check for duplicate keys (including inputs)
    if (seenKeys.has(field.key)) {
      errors.push({
        code: 'DUPLICATE_DERIVED_KEY',
        message: `Duplicate derived field key: ${field.key}`,
        field: 'derived',
      });
    }
    seenKeys.add(field.key);

    // Validate expression
    const result = validateExpressionWithVariables(field.expression, inputVariables);
    if (!result.valid) {
      errors.push({
        code: 'INVALID_DERIVED_EXPRESSION',
        message: `Invalid expression for '${field.key}': ${result.errors.join(', ')}`,
        field: 'derived',
      });
    }
  }
}

/**
 * Validate BOM definition
 */
function validateBOM(
  bom: EquipmentTemplateDSL['bom'],
  variables: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate sheet parts
  if (bom.sheetParts) {
    for (const part of bom.sheetParts) {
      validateSheetPart(part, variables, errors, warnings);
    }
  }

  // Validate tube parts
  if (bom.tubes) {
    for (const part of bom.tubes) {
      validateTubePart(part, variables, errors, warnings);
    }
  }

  // Validate accessories
  if (bom.accessories) {
    for (const part of bom.accessories) {
      validateAccessoryPart(part, variables, errors, warnings);
    }
  }

  // Warn if no parts
  const totalParts = (bom.sheetParts?.length || 0) + (bom.tubes?.length || 0) + (bom.accessories?.length || 0);
  if (totalParts === 0) {
    warnings.push({
      code: 'EMPTY_BOM',
      message: 'BOM has no parts defined',
      field: 'bom',
      suggestion: 'Add at least one sheet, tube, or accessory part',
    });
  }
}

/**
 * Validate sheet part
 */
function validateSheetPart(
  part: SheetPartDSL,
  variables: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required fields
  if (!part.id) {
    errors.push({
      code: 'MISSING_PART_ID',
      message: 'Sheet part missing id',
      field: 'bom.sheetParts',
    });
  }

  if (!part.label) {
    warnings.push({
      code: 'MISSING_PART_LABEL',
      message: `Sheet part '${part.id}' missing label`,
      field: 'bom.sheetParts',
    });
  }

  // Validate expressions
  const expressions = [
    { name: 'materialKeyExpr', expr: part.materialKeyExpr },
    { name: 'quantityExpr', expr: part.quantityExpr },
    { name: 'widthExpr', expr: part.widthExpr },
    { name: 'heightExpr', expr: part.heightExpr },
    { name: 'thicknessExpr', expr: part.thicknessExpr },
  ];

  for (const { name, expr } of expressions) {
    if (!expr) {
      errors.push({
        code: 'MISSING_EXPRESSION',
        message: `Sheet part '${part.id}' missing ${name}`,
        field: 'bom.sheetParts',
      });
    } else {
      const result = validateExpressionWithVariables(expr, variables);
      if (!result.valid) {
        errors.push({
          code: 'INVALID_EXPRESSION',
          message: `Sheet part '${part.id}' has invalid ${name}: ${result.errors.join(', ')}`,
          field: 'bom.sheetParts',
        });
      }
    }
  }

  // Validate bends
  if (part.bends) {
    for (const bend of part.bends) {
      if (!bend.angleExpr || !bend.positionExpr) {
        errors.push({
          code: 'INVALID_BEND',
          message: `Sheet part '${part.id}' has incomplete bend definition`,
          field: 'bom.sheetParts',
        });
      }
    }
  }
}

/**
 * Validate tube part
 */
function validateTubePart(
  part: TubePartDSL,
  variables: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required fields
  if (!part.id) {
    errors.push({
      code: 'MISSING_PART_ID',
      message: 'Tube part missing id',
      field: 'bom.tubes',
    });
  }

  if (!part.label) {
    warnings.push({
      code: 'MISSING_PART_LABEL',
      message: `Tube part '${part.id}' missing label`,
      field: 'bom.tubes',
    });
  }

  // Validate expressions
  const expressions = [
    { name: 'materialKeyExpr', expr: part.materialKeyExpr },
    { name: 'quantityExpr', expr: part.quantityExpr },
    { name: 'lengthExpr', expr: part.lengthExpr },
    { name: 'profileExpr', expr: part.profileExpr },
  ];

  for (const { name, expr } of expressions) {
    if (!expr) {
      errors.push({
        code: 'MISSING_EXPRESSION',
        message: `Tube part '${part.id}' missing ${name}`,
        field: 'bom.tubes',
      });
    } else {
      const result = validateExpressionWithVariables(expr, variables);
      if (!result.valid) {
        errors.push({
          code: 'INVALID_EXPRESSION',
          message: `Tube part '${part.id}' has invalid ${name}: ${result.errors.join(', ')}`,
          field: 'bom.tubes',
        });
      }
    }
  }
}

/**
 * Validate accessory part
 */
function validateAccessoryPart(
  part: AccessoryPartDSL,
  variables: string[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required fields
  if (!part.id) {
    errors.push({
      code: 'MISSING_PART_ID',
      message: 'Accessory part missing id',
      field: 'bom.accessories',
    });
  }

  if (!part.sku) {
    errors.push({
      code: 'MISSING_SKU',
      message: `Accessory part '${part.id}' missing SKU`,
      field: 'bom.accessories',
    });
  }

  if (!part.label) {
    warnings.push({
      code: 'MISSING_PART_LABEL',
      message: `Accessory part '${part.id}' missing label`,
      field: 'bom.accessories',
    });
  }

  // Validate quantity expression
  if (!part.quantityExpr) {
    errors.push({
      code: 'MISSING_EXPRESSION',
      message: `Accessory part '${part.id}' missing quantityExpr`,
      field: 'bom.accessories',
    });
  } else {
    const result = validateExpressionWithVariables(part.quantityExpr, variables);
    if (!result.valid) {
      errors.push({
        code: 'INVALID_EXPRESSION',
        message: `Accessory part '${part.id}' has invalid quantityExpr: ${result.errors.join(', ')}`,
        field: 'bom.accessories',
      });
    }
  }
}

/**
 * Validate structural rules
 */
function validateStructuralRules(
  rules: StructuralRuleDSL[],
  variables: string[],
  errors: ValidationError[]
): void {
  const seenIds = new Set<string>();

  for (const rule of rules) {
    // Check for duplicate IDs
    if (seenIds.has(rule.id)) {
      errors.push({
        code: 'DUPLICATE_RULE_ID',
        message: `Duplicate structural rule ID: ${rule.id}`,
        field: 'structuralRules',
      });
    }
    seenIds.add(rule.id);

    // Validate condition
    if (!rule.condition) {
      errors.push({
        code: 'MISSING_CONDITION',
        message: `Structural rule '${rule.id}' missing condition`,
        field: 'structuralRules',
      });
    } else {
      const result = validateExpressionWithVariables(rule.condition, variables);
      if (!result.valid) {
        errors.push({
          code: 'INVALID_CONDITION',
          message: `Structural rule '${rule.id}' has invalid condition: ${result.errors.join(', ')}`,
          field: 'structuralRules',
        });
      }
    }

    // Validate action
    if (!VALID_ACTIONS.includes(rule.action)) {
      errors.push({
        code: 'INVALID_ACTION',
        message: `Structural rule '${rule.id}' has invalid action: ${rule.action}`,
        field: 'structuralRules',
      });
    }

    // Validate message
    if (!rule.message) {
      errors.push({
        code: 'MISSING_MESSAGE',
        message: `Structural rule '${rule.id}' missing message`,
        field: 'structuralRules',
      });
    }

    // Validate severity
    if (!['warning', 'error', 'info'].includes(rule.severity)) {
      errors.push({
        code: 'INVALID_SEVERITY',
        message: `Structural rule '${rule.id}' has invalid severity: ${rule.severity}`,
        field: 'structuralRules',
      });
    }

    // Validate params based on action
    validateStructuralRuleParams(rule, variables, errors);
  }
}

/**
 * Validate structural rule parameters based on action type
 */
function validateStructuralRuleParams(
  rule: StructuralRuleDSL,
  _variables: string[],
  errors: ValidationError[]
): void {
  const { action, params } = rule;

  switch (action) {
    case 'ADD_TUBE':
      if (!params.id || !params.lengthExpr) {
        errors.push({
          code: 'INVALID_ACTION_PARAMS',
          message: `Structural rule '${rule.id}': ADD_TUBE requires id and lengthExpr in params`,
          field: 'structuralRules',
        });
      }
      break;

    case 'ADD_SHEET':
      if (!params.id || !params.widthExpr || !params.heightExpr) {
        errors.push({
          code: 'INVALID_ACTION_PARAMS',
          message: `Structural rule '${rule.id}': ADD_SHEET requires id, widthExpr, and heightExpr in params`,
          field: 'structuralRules',
        });
      }
      break;

    case 'REQUIRE_MIN_THICKNESS':
      if (params.minThickness === undefined) {
        errors.push({
          code: 'INVALID_ACTION_PARAMS',
          message: `Structural rule '${rule.id}': REQUIRE_MIN_THICKNESS requires minThickness in params`,
          field: 'structuralRules',
        });
      }
      break;

    case 'ADD_ACCESSORY':
      if (!params.sku || !params.quantityExpr) {
        errors.push({
          code: 'INVALID_ACTION_PARAMS',
          message: `Structural rule '${rule.id}': ADD_ACCESSORY requires sku and quantityExpr in params`,
          field: 'structuralRules',
        });
      }
      break;

    case 'BLOCK':
      // No specific params required, but reason is helpful
      if (!params.reason) {
        // This is just a warning, not an error
      }
      break;
  }
}

/**
 * Validate process rules
 */
function validateProcessRules(
  rules: ProcessRuleDSL[],
  variables: string[],
  errors: ValidationError[]
): void {
  for (const rule of rules) {
    // Validate process key
    if (!rule.processKey) {
      errors.push({
        code: 'MISSING_PROCESS_KEY',
        message: 'Process rule missing processKey',
        field: 'processRules',
      });
    } else if (!VALID_PROCESS_KEYS.includes(rule.processKey)) {
      errors.push({
        code: 'INVALID_PROCESS_KEY',
        message: `Invalid process key: ${rule.processKey}`,
        field: 'processRules',
      });
    }

    // Validate condition if present
    if (rule.condition) {
      const result = validateExpressionWithVariables(rule.condition, variables);
      if (!result.valid) {
        errors.push({
          code: 'INVALID_CONDITION',
          message: `Process rule for '${rule.processKey}' has invalid condition: ${result.errors.join(', ')}`,
          field: 'processRules',
        });
      }
    }

    // Validate metrics expressions
    if (rule.metricsExpr) {
      for (const [key, expr] of Object.entries(rule.metricsExpr)) {
        const result = validateExpressionWithVariables(expr, variables);
        if (!result.valid) {
          errors.push({
            code: 'INVALID_METRICS_EXPRESSION',
            message: `Process rule for '${rule.processKey}' has invalid metrics expression '${key}': ${result.errors.join(', ')}`,
            field: 'processRules',
          });
        }
      }
    }
  }
}

/**
 * Validate validations
 */
function validateValidations(
  validations: ValidationDSL[],
  variables: string[],
  errors: ValidationError[]
): void {
  const seenIds = new Set<string>();

  for (const validation of validations) {
    // Check for duplicate IDs
    if (seenIds.has(validation.id)) {
      errors.push({
        code: 'DUPLICATE_VALIDATION_ID',
        message: `Duplicate validation ID: ${validation.id}`,
        field: 'validations',
      });
    }
    seenIds.add(validation.id);

    // Validate condition
    if (!validation.condition) {
      errors.push({
        code: 'MISSING_CONDITION',
        message: `Validation '${validation.id}' missing condition`,
        field: 'validations',
      });
    } else {
      const result = validateExpressionWithVariables(validation.condition, variables);
      if (!result.valid) {
        errors.push({
          code: 'INVALID_CONDITION',
          message: `Validation '${validation.id}' has invalid condition: ${result.errors.join(', ')}`,
          field: 'validations',
        });
      }
    }

    // Validate message
    if (!validation.message) {
      errors.push({
        code: 'MISSING_MESSAGE',
        message: `Validation '${validation.id}' missing message`,
        field: 'validations',
      });
    }

    // Validate severity
    if (!['warning', 'error'].includes(validation.severity)) {
      errors.push({
        code: 'INVALID_SEVERITY',
        message: `Validation '${validation.id}' has invalid severity: ${validation.severity}`,
        field: 'validations',
      });
    }
  }
}

/**
 * Validate metrics model
 */
function validateMetricsModel(
  metrics: MetricsModelDSL,
  variables: string[],
  errors: ValidationError[]
): void {
  const expressions = [
    { name: 'weldMetersExpr', expr: metrics.weldMetersExpr },
    { name: 'finishM2Expr', expr: metrics.finishM2Expr },
    { name: 'cutMetersExpr', expr: metrics.cutMetersExpr },
    { name: 'bendCountExpr', expr: metrics.bendCountExpr },
  ];

  for (const { name, expr } of expressions) {
    if (expr) {
      const result = validateExpressionWithVariables(expr, variables);
      if (!result.valid) {
        errors.push({
          code: 'INVALID_METRICS_EXPRESSION',
          message: `Metrics model has invalid ${name}: ${result.errors.join(', ')}`,
          field: 'metricsModel',
        });
      }
    }
  }
}

/**
 * Check for duplicate part IDs in BOM
 */
function checkDuplicateIds(
  bom: EquipmentTemplateDSL['bom'],
  errors: ValidationError[]
): void {
  const ids = new Set<string>();
  const duplicates: string[] = [];

  const allParts = [
    ...(bom.sheetParts || []),
    ...(bom.tubes || []),
    ...(bom.accessories || []),
  ];

  for (const part of allParts) {
    if (part.id) {
      if (ids.has(part.id)) {
        duplicates.push(part.id);
      }
      ids.add(part.id);
    }
  }

  if (duplicates.length > 0) {
    errors.push({
      code: 'DUPLICATE_PART_IDS',
      message: `Duplicate part IDs found: ${[...new Set(duplicates)].join(', ')}`,
      field: 'bom',
    });
  }
}

/**
 * Validate a preset
 */
export function validatePreset(
  preset: unknown,
  template: EquipmentTemplateDSL | null
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!preset || typeof preset !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'INVALID_TYPE', message: 'Preset must be an object' }],
      warnings: [],
    };
  }

  const p = preset as Record<string, unknown>;

  // Required fields
  if (!p.templateKey) {
    errors.push({
      code: 'MISSING_TEMPLATE_KEY',
      message: 'Preset missing templateKey',
    });
  }

  if (!p.label) {
    errors.push({
      code: 'MISSING_LABEL',
      message: 'Preset missing label',
    });
  }

  if (!p.values || typeof p.values !== 'object') {
    errors.push({
      code: 'MISSING_VALUES',
      message: 'Preset missing values object',
    });
  }

  // If template is provided, validate values against inputs
  if (template && p.values) {
    const values = p.values as Record<string, unknown>;

    for (const input of template.inputs) {
      if (input.required && !(input.key in values)) {
        errors.push({
          code: 'MISSING_REQUIRED_VALUE',
          message: `Preset missing required value for '${input.key}'`,
          field: 'values',
        });
      }

      // Validate value type
      if (input.key in values) {
        const value = values[input.key];
        
        if (input.type === 'number' && typeof value !== 'number') {
          errors.push({
            code: 'INVALID_VALUE_TYPE',
            message: `Preset value for '${input.key}' should be a number`,
            field: 'values',
          });
        }

        if (input.type === 'boolean' && typeof value !== 'boolean') {
          errors.push({
            code: 'INVALID_VALUE_TYPE',
            message: `Preset value for '${input.key}' should be a boolean`,
            field: 'values',
          });
        }

        if (input.type === 'select' && input.options) {
          const validOptions = input.options.map(o => o.value);
          if (!validOptions.includes(value as string)) {
            errors.push({
              code: 'INVALID_SELECT_VALUE',
              message: `Preset value for '${input.key}' is not a valid option`,
              field: 'values',
            });
          }
        }

        // Validate number constraints
        if (input.type === 'number' && typeof value === 'number') {
          if (input.min !== undefined && value < input.min) {
            errors.push({
              code: 'VALUE_BELOW_MIN',
              message: `Preset value for '${input.key}' (${value}) is below minimum (${input.min})`,
              field: 'values',
            });
          }
          if (input.max !== undefined && value > input.max) {
            errors.push({
              code: 'VALUE_ABOVE_MAX',
              message: `Preset value for '${input.key}' (${value}) is above maximum (${input.max})`,
              field: 'values',
            });
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}