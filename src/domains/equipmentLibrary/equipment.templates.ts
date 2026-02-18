// ============================================================
// EQUIPMENT TEMPLATES - 16 template definitions
// ============================================================

import { EquipmentTemplateDSL, StructuralRuleDSL } from './equipment.dsl.schema';

// ============================================================
// COMMON STRUCTURAL RULES
// ============================================================

/**
 * Standard structural rules shared across templates
 */
const COMMON_STRUCTURAL_RULES: StructuralRuleDSL[] = [
  // A) Profundidade > 700mm adiciona reforço central
  {
    id: 'DEPTH_REINFORCEMENT',
    condition: 'depth > 700',
    action: 'ADD_TUBE',
    params: {
      id: 'mid_reinf',
      label: 'Reforço Central',
      materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
      lengthExpr: 'width - 80',
      profile: '40x40x1.2',
    },
    message: 'Profundidade > 700mm requer reforço central',
    severity: 'info',
  },

  // B) Largura > 2000mm requer espessura mínima 1.5mm
  {
    id: 'WIDTH_THICKNESS',
    condition: 'width > 2000',
    action: 'REQUIRE_MIN_THICKNESS',
    params: { minThickness: 1.5 },
    message: 'Largura > 2000mm requer espessura mínima 1.5mm',
    severity: 'warning',
  },

  // C) Largura > 3000mm bloqueia
  {
    id: 'MAX_WIDTH',
    condition: 'width > 3000',
    action: 'BLOCK',
    params: { reason: 'TOO_WIDE' },
    message: 'Largura máxima permitida: 3000mm',
    severity: 'error',
  },
];

// ============================================================
// MESAS (5 templates)
// ============================================================

/**
 * MESA_LISA - Mesa simples com 4 pés
 */
export const MESA_LISA: EquipmentTemplateDSL = {
  key: 'MESA_LISA',
  label: 'Mesa Lisa',
  category: 'MESA',
  description: 'Mesa simples em aço inox com tampo e saia, 4 pés tubulares',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 300, max: 3000, default: 1000, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 1500, default: 600, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 500, max: 1200, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 3.0, default: 1.2, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'hasCasters', label: 'Com rodízios', type: 'boolean', default: false },
  ],

  derived: [
    { key: 'skirtHeight', expression: '50', description: 'Altura da saia' },
    { key: 'legLength', expression: 'height - thickness - 50', description: 'Comprimento das pernas' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SAIA_FRONT',
        label: 'Saia Frontal',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'SAIA_BACK',
        label: 'Saia Traseira',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'LATERAL_LEFT',
        label: 'Lateral Esquerda',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height - thickness',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'LATERAL_RIGHT',
        label: 'Lateral Direita',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height - thickness',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [
      {
        id: 'LEG_FL',
        label: 'Pé Diagonal Frontal Esq',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_FR',
        label: 'Pé Diagonal Frontal Dir',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_BL',
        label: 'Pé Diagonal Traseiro Esq',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_BR',
        label: 'Pé Diagonal Traseiro Dir',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
    ],
    accessories: [],
  },

  structuralRules: [
    ...COMMON_STRUCTURAL_RULES,
    {
      id: 'CASTER_SUPPORT',
      condition: 'hasCasters == true',
      action: 'ADD_ACCESSORY',
      params: { sku: 'ROD-50-POLI', label: 'Rodízio', quantityExpr: '4' },
      message: 'Rodízios adicionados',
      severity: 'info',
    },
  ],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'DOBRA', partId: 'SAIA_FRONT', metricsExpr: { bendCount: '1' } },
    { processKey: 'DOBRA', partId: 'SAIA_BACK', metricsExpr: { bendCount: '1' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'ESCOVADO', partId: 'TAMPO', condition: 'finish == "ESCOVADO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(2 * width + 4 * depth) / 1000',
    finishM2Expr: 'width * depth / 1000000',
    cutMetersExpr: '2 * (width + depth) + 4 * (depth + height) / 1000',
    bendCountExpr: '2',
  },
};

/**
 * MESA_COM_PRATELEIRA - Mesa com prateleira inferior
 */
export const MESA_COM_PRATELEIRA: EquipmentTemplateDSL = {
  key: 'MESA_COM_PRATELEIRA',
  label: 'Mesa com Prateleira',
  category: 'MESA',
  description: 'Mesa em aço inox com tampo, saia e prateleira inferior',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 300, max: 3000, default: 1000, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 1500, default: 600, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 700, max: 1200, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 3.0, default: 1.2, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'hasShelf', label: 'Com prateleira', type: 'boolean', default: true },
    { key: 'hasCasters', label: 'Com rodízios', type: 'boolean', default: false },
  ],

  derived: [
    { key: 'skirtHeight', expression: '50', description: 'Altura da saia' },
    { key: 'legLength', expression: 'height - thickness - 50', description: 'Comprimento das pernas' },
    { key: 'shelfPosition', expression: 'floor(height * 0.4)', description: 'Posição da prateleira' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SAIA_FRONT',
        label: 'Saia Frontal',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'SAIA_BACK',
        label: 'Saia Traseira',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'PRATELEIRA',
        label: 'Prateleira',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'hasShelf ? 1 : 0',
        widthExpr: 'width - 40',
        heightExpr: 'depth - 20',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [
      {
        id: 'LEG_FL',
        label: 'Pé Frontal Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_FR',
        label: 'Pé Frontal Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_BL',
        label: 'Pé Traseiro Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_BR',
        label: 'Pé Traseiro Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'SHELF_SUPPORT_L',
        label: 'Suporte Prateleira Esq',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        quantityExpr: 'hasShelf ? 1 : 0',
        lengthExpr: 'shelfPosition - 20',
        profileExpr: "'30x30x1.0'",
      },
      {
        id: 'SHELF_SUPPORT_R',
        label: 'Suporte Prateleira Dir',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        quantityExpr: 'hasShelf ? 1 : 0',
        lengthExpr: 'shelfPosition - 20',
        profileExpr: "'30x30x1.0'",
      },
    ],
    accessories: [],
  },

  structuralRules: [
    ...COMMON_STRUCTURAL_RULES,
    {
      id: 'SHELF_SUPPORTS',
      condition: 'hasShelf == true',
      action: 'ADD_ACCESSORY',
      params: { sku: 'SHELF_SUPPORT', label: 'Suporte de Prateleira', quantityExpr: '4' },
      message: 'Prateleira requer suportes',
      severity: 'info',
    },
    {
      id: 'CASTER_SUPPORT',
      condition: 'hasCasters == true',
      action: 'ADD_ACCESSORY',
      params: { sku: 'ROD-50-POLI', label: 'Rodízio', quantityExpr: '4' },
      message: 'Rodízios adicionados',
      severity: 'info',
    },
  ],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'DOBRA', partId: 'SAIA_FRONT', metricsExpr: { bendCount: '1' } },
    { processKey: 'DOBRA', partId: 'SAIA_BACK', metricsExpr: { bendCount: '1' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [
    {
      id: 'SHELF_HEIGHT',
      condition: 'hasShelf == true && height < 700',
      message: 'Altura mínima para prateleira: 700mm',
      severity: 'error',
    },
  ],

  metricsModel: {
    weldMetersExpr: '(2 * width + 4 * depth) / 1000',
    finishM2Expr: 'width * depth / 1000000',
    cutMetersExpr: '2 * (width + depth) + 4 * (depth + height) / 1000',
    bendCountExpr: '2',
  },
};

/**
 * MESA_CONTRAVENTADA_U - Mesa com contraventamento em U
 */
export const MESA_CONTRAVENTADA_U: EquipmentTemplateDSL = {
  key: 'MESA_CONTRAVENTADA_U',
  label: 'Mesa Contraventada U',
  category: 'MESA',
  description: 'Mesa reforçada com estrutura em U para cargas pesadas',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 500, max: 3000, default: 1500, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 500, max: 1500, default: 800, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 500, max: 1200, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 1.0, max: 3.0, default: 1.5, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
  ],

  derived: [
    { key: 'skirtHeight', expression: '60', description: 'Altura da saia reforçada' },
    { key: 'legLength', expression: 'height - thickness - 60', description: 'Comprimento das pernas' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SAIA_U',
        label: 'Saia em U',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width + 2 * depth - 60',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [
          { angleExpr: '90', positionExpr: 'depth - 30', direction: 'up', kFactor: 0.33 },
          { angleExpr: '90', positionExpr: 'width + depth - 30', direction: 'down', kFactor: 0.33 },
        ],
      },
    ],
    tubes: [
      {
        id: 'LEG_FL',
        label: 'Pé Frontal Esquerdo',
        materialKeyExpr: "'TUBE#SS304#50x50x1.5#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'50x50x1.5'",
      },
      {
        id: 'LEG_FR',
        label: 'Pé Frontal Direito',
        materialKeyExpr: "'TUBE#SS304#50x50x1.5#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'50x50x1.5'",
      },
      {
        id: 'LEG_BL',
        label: 'Pé Traseiro Esquerdo',
        materialKeyExpr: "'TUBE#SS304#50x50x1.5#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'50x50x1.5'",
      },
      {
        id: 'LEG_BR',
        label: 'Pé Traseiro Direito',
        materialKeyExpr: "'TUBE#SS304#50x50x1.5#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'50x50x1.5'",
      },
      {
        id: 'CROSS_BRACE_F',
        label: 'Travessa Frontal',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'width - 100',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'CROSS_BRACE_B',
        label: 'Travessa Traseira',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'width - 100',
        profileExpr: "'40x40x1.2'",
      },
    ],
    accessories: [],
  },

  structuralRules: COMMON_STRUCTURAL_RULES,

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'DOBRA', partId: 'SAIA_U', metricsExpr: { bendCount: '2' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(2 * width + 4 * depth) / 1000',
    finishM2Expr: 'width * depth / 1000000',
    cutMetersExpr: '2 * (width + depth) / 1000',
    bendCountExpr: '2',
  },
};

/**
 * MESA_PAREDE_COM_ESPELHO - Mesa de parede com espelho
 */
export const MESA_PAREDE_COM_ESPELHO: EquipmentTemplateDSL = {
  key: 'MESA_PAREDE_COM_ESPELHO',
  label: 'Mesa de Parede com Espelho',
  category: 'MESA',
  description: 'Mesa fixada na parede com espelho (backsplash)',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 500, max: 3000, default: 1200, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 800, default: 500, required: true },
    { key: 'height', label: 'Altura de trabalho', type: 'number', unit: 'mm', min: 700, max: 950, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 3.0, default: 1.2, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'hasBacksplash', label: 'Com espelho', type: 'boolean', default: true },
    { key: 'backsplashHeight', label: 'Altura do espelho', type: 'number', unit: 'mm', min: 100, max: 600, default: 300 },
  ],

  derived: [
    { key: 'skirtHeight', expression: '50', description: 'Altura da saia' },
    { key: 'actualBacksplashHeight', expression: 'hasBacksplash ? backsplashHeight : 0', description: 'Altura real do espelho' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SAIA_FRONT',
        label: 'Saia Frontal',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'BACKSPLASH',
        label: 'Espelho',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'hasBacksplash ? 1 : 0',
        widthExpr: 'width',
        heightExpr: 'actualBacksplashHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'actualBacksplashHeight', direction: 'down', kFactor: 0.33 }],
      },
      {
        id: 'LATERAL_LEFT',
        label: 'Lateral Esquerda',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height - thickness',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'LATERAL_RIGHT',
        label: 'Lateral Direita',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height - thickness',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [],
    accessories: [],
  },

  structuralRules: [
    ...COMMON_STRUCTURAL_RULES,
    {
      id: 'BACKSPLASH_HEIGHT',
      condition: 'backsplashHeight > 500',
      action: 'ADD_TUBE',
      params: {
        id: 'backsplash_support',
        label: 'Suporte Espelho',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        lengthExpr: 'backsplashHeight - 50',
        profile: '30x30x1.0',
      },
      message: 'Espelho > 500mm requer reforço estrutural',
      severity: 'warning',
    },
  ],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'DOBRA', partId: 'SAIA_FRONT', metricsExpr: { bendCount: '1' } },
    { processKey: 'DOBRA', partId: 'BACKSPLASH', condition: 'hasBacksplash', metricsExpr: { bendCount: '1' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(width + 2 * depth) / 1000',
    finishM2Expr: '(width * depth + width * actualBacksplashHeight) / 1000000',
    cutMetersExpr: '2 * (width + depth) / 1000',
    bendCountExpr: 'hasBacksplash ? 2 : 1',
  },
};

/**
 * MESA_COM_RODIZIOS - Mesa com rodízios
 */
export const MESA_COM_RODIZIOS: EquipmentTemplateDSL = {
  key: 'MESA_COM_RODIZIOS',
  label: 'Mesa com Rodízios',
  category: 'MESA',
  description: 'Mesa móvel com 4 rodízios',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 400, max: 2000, default: 800, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 1000, default: 600, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 700, max: 1000, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 2.0, default: 1.2, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'hasCasters', label: 'Com rodízios', type: 'boolean', default: true },
  ],

  derived: [
    { key: 'skirtHeight', expression: '50', description: 'Altura da saia' },
    { key: 'legLength', expression: 'height - thickness - 50 - 100', description: 'Comprimento das pernas (desconta rodízio)' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SAIA_FRONT',
        label: 'Saia Frontal',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'SAIA_BACK',
        label: 'Saia Traseira',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
    ],
    tubes: [
      {
        id: 'LEG_FL',
        label: 'Pé Frontal Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_FR',
        label: 'Pé Frontal Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_BL',
        label: 'Pé Traseiro Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_BR',
        label: 'Pé Traseiro Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
    ],
    accessories: [
      {
        id: 'CASTER',
        label: 'Rodízio',
        sku: 'ROD-50-POLI',
        quantityExpr: 'hasCasters ? 4 : 0',
      },
    ],
  },

  structuralRules: COMMON_STRUCTURAL_RULES,

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'DOBRA', partId: 'SAIA_FRONT', metricsExpr: { bendCount: '1' } },
    { processKey: 'DOBRA', partId: 'SAIA_BACK', metricsExpr: { bendCount: '1' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(2 * width + 2 * depth) / 1000',
    finishM2Expr: 'width * depth / 1000000',
    cutMetersExpr: '2 * (width + depth) / 1000',
    bendCountExpr: '2',
  },
};

// ============================================================
// BANCADAS (5 templates)
// ============================================================

/**
 * BANCADA_CENTRAL - Bancada central ilha
 */
export const BANCADA_CENTRAL: EquipmentTemplateDSL = {
  key: 'BANCADA_CENTRAL',
  label: 'Bancada Central',
  category: 'BANCADA',
  description: 'Bancada central tipo ilha para cozinhas profissionais',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 800, max: 3000, default: 1500, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 500, max: 1000, default: 700, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 800, max: 950, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 1.0, max: 3.0, default: 1.5, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
  ],

  derived: [
    { key: 'skirtHeight', expression: '50', description: 'Altura da saia' },
    { key: 'legLength', expression: 'height - thickness - 50', description: 'Comprimento das pernas' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SAIA_FRONT',
        label: 'Saia Frontal',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'SAIA_BACK',
        label: 'Saia Traseira',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'LATERAL_LEFT',
        label: 'Lateral Esquerda',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height - thickness',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'LATERAL_RIGHT',
        label: 'Lateral Direita',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height - thickness',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [
      {
        id: 'LEG_FL',
        label: 'Pé Frontal Esquerdo',
        materialKeyExpr: "'TUBE#SS304#50x50x1.5#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'50x50x1.5'",
      },
      {
        id: 'LEG_FR',
        label: 'Pé Frontal Direito',
        materialKeyExpr: "'TUBE#SS304#50x50x1.5#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'50x50x1.5'",
      },
      {
        id: 'LEG_BL',
        label: 'Pé Traseiro Esquerdo',
        materialKeyExpr: "'TUBE#SS304#50x50x1.5#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'50x50x1.5'",
      },
      {
        id: 'LEG_BR',
        label: 'Pé Traseiro Direito',
        materialKeyExpr: "'TUBE#SS304#50x50x1.5#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'50x50x1.5'",
      },
    ],
    accessories: [],
  },

  structuralRules: [
    ...COMMON_STRUCTURAL_RULES,
    {
      id: 'WIDTH_THICKNESS_2500',
      condition: 'width > 2500',
      action: 'REQUIRE_MIN_THICKNESS',
      params: { minThickness: 2.0 },
      message: 'Largura > 2500mm requer espessura mínima 2.0mm',
      severity: 'warning',
    },
  ],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'DOBRA', partId: 'SAIA_FRONT', metricsExpr: { bendCount: '1' } },
    { processKey: 'DOBRA', partId: 'SAIA_BACK', metricsExpr: { bendCount: '1' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'PASSIVACAO', partId: 'ALL', metricsExpr: {} },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(2 * width + 4 * depth) / 1000',
    finishM2Expr: 'width * depth / 1000000',
    cutMetersExpr: '2 * (width + depth) + 4 * depth / 1000',
    bendCountExpr: '2',
  },
};

/**
 * BANCADA_PAREDE_COM_ESPELHO - Bancada de parede com espelho
 */
export const BANCADA_PAREDE_COM_ESPELHO: EquipmentTemplateDSL = {
  key: 'BANCADA_PAREDE_COM_ESPELHO',
  label: 'Bancada de Parede com Espelho',
  category: 'BANCADA',
  description: 'Bancada fixada na parede com espelho (backsplash)',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 800, max: 3000, default: 1800, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 400, max: 900, default: 600, required: true },
    { key: 'height', label: 'Altura de trabalho', type: 'number', unit: 'mm', min: 800, max: 950, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 1.0, max: 3.0, default: 1.5, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'hasBacksplash', label: 'Com espelho', type: 'boolean', default: true },
    { key: 'backsplashHeight', label: 'Altura do espelho', type: 'number', unit: 'mm', min: 100, max: 600, default: 400 },
  ],

  derived: [
    { key: 'skirtHeight', expression: '50', description: 'Altura da saia' },
    { key: 'actualBacksplashHeight', expression: 'hasBacksplash ? backsplashHeight : 0', description: 'Altura real do espelho' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SAIA_FRONT',
        label: 'Saia Frontal',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'BACKSPLASH',
        label: 'Espelho',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'hasBacksplash ? 1 : 0',
        widthExpr: 'width',
        heightExpr: 'actualBacksplashHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'actualBacksplashHeight', direction: 'down', kFactor: 0.33 }],
      },
      {
        id: 'LATERAL_LEFT',
        label: 'Lateral Esquerda',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height - thickness',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'LATERAL_RIGHT',
        label: 'Lateral Direita',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height - thickness',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [],
    accessories: [],
  },

  structuralRules: [
    ...COMMON_STRUCTURAL_RULES,
    {
      id: 'BACKSPLASH_SUPPORT',
      condition: 'backsplashHeight > 500',
      action: 'ADD_TUBE',
      params: {
        id: 'backsplash_brace',
        label: 'Suporte Espelho',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        lengthExpr: 'backsplashHeight - 50',
        profile: '30x30x1.0',
      },
      message: 'Espelho > 500mm requer reforço estrutural',
      severity: 'warning',
    },
  ],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'DOBRA', partId: 'SAIA_FRONT', metricsExpr: { bendCount: '1' } },
    { processKey: 'DOBRA', partId: 'BACKSPLASH', condition: 'hasBacksplash', metricsExpr: { bendCount: '1' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'PASSIVACAO', partId: 'ALL', metricsExpr: {} },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(width + 2 * depth) / 1000',
    finishM2Expr: '(width * depth + width * actualBacksplashHeight) / 1000000',
    cutMetersExpr: '2 * (width + depth) / 1000',
    bendCountExpr: 'hasBacksplash ? 2 : 1',
  },
};

/**
 * BANCADA_ESTREITA - Bancada estreita (500mm)
 */
export const BANCADA_ESTREITA: EquipmentTemplateDSL = {
  key: 'BANCADA_ESTREITA',
  label: 'Bancada Estreita',
  category: 'BANCADA',
  description: 'Bancada estreita para corredores (profundidade fixa 500mm)',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 600, max: 3000, default: 1200, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 400, max: 600, default: 500, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 800, max: 950, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 2.0, default: 1.2, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
  ],

  derived: [
    { key: 'skirtHeight', expression: '40', description: 'Altura da saia' },
    { key: 'legLength', expression: 'height - thickness - 40', description: 'Comprimento das pernas' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SAIA_FRONT',
        label: 'Saia Frontal',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
    ],
    tubes: [
      {
        id: 'LEG_FL',
        label: 'Pé Frontal Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_FR',
        label: 'Pé Frontal Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_BL',
        label: 'Pé Traseiro Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'LEG_BR',
        label: 'Pé Traseiro Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'legLength',
        profileExpr: "'40x40x1.2'",
      },
    ],
    accessories: [],
  },

  structuralRules: COMMON_STRUCTURAL_RULES,

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'DOBRA', partId: 'SAIA_FRONT', metricsExpr: { bendCount: '1' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(width + 2 * depth) / 1000',
    finishM2Expr: 'width * depth / 1000000',
    cutMetersExpr: '2 * (width + depth) / 1000',
    bendCountExpr: '1',
  },
};

/**
 * BANCADA_COM_CUBA_1 - Bancada com 1 cuba
 */
export const BANCADA_COM_CUBA_1: EquipmentTemplateDSL = {
  key: 'BANCADA_COM_CUBA_1',
  label: 'Bancada com 1 Cuba',
  category: 'BANCADA',
  description: 'Bancada com uma cuba embutida',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 800, max: 2000, default: 1200, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 500, max: 800, default: 600, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 800, max: 950, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 1.0, max: 2.0, default: 1.5, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'hasBacksplash', label: 'Com espelho', type: 'boolean', default: true },
    { key: 'backsplashHeight', label: 'Altura do espelho', type: 'number', unit: 'mm', min: 100, max: 600, default: 400 },
    { key: 'cubaWidth', label: 'Largura da cuba', type: 'number', unit: 'mm', min: 300, max: 800, default: 500 },
    { key: 'cubaDepth', label: 'Profundidade da cuba', type: 'number', unit: 'mm', min: 300, max: 500, default: 400 },
  ],

  derived: [
    { key: 'skirtHeight', expression: '50', description: 'Altura da saia' },
    { key: 'actualBacksplashHeight', expression: 'hasBacksplash ? backsplashHeight : 0', description: 'Altura real do espelho' },
    { key: 'cubaX', expression: '(width - cubaWidth) / 2', description: 'Posição X da cuba' },
    { key: 'cubaY', expression: 'depth - cubaDepth - 50', description: 'Posição Y da cuba' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo com recorte',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [
          {
            type: 'cut',
            positionXExpr: 'cubaX',
            positionYExpr: 'cubaY',
            widthExpr: 'cubaWidth',
            heightExpr: 'cubaDepth',
          },
        ],
        bends: [],
      },
      {
        id: 'SAIA_FRONT',
        label: 'Saia Frontal',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'BACKSPLASH',
        label: 'Espelho',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'hasBacksplash ? 1 : 0',
        widthExpr: 'width',
        heightExpr: 'actualBacksplashHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'actualBacksplashHeight', direction: 'down', kFactor: 0.33 }],
      },
    ],
    tubes: [],
    accessories: [
      {
        id: 'CUBA',
        label: 'Cuba Inox',
        sku: 'CUBA-INOX-500x400',
        quantityExpr: '1',
      },
    ],
  },

  structuralRules: COMMON_STRUCTURAL_RULES,

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'TAMPO', metricsExpr: { cutLength: '2 * (cubaWidth + cubaDepth)' } },
    { processKey: 'DOBRA', partId: 'SAIA_FRONT', metricsExpr: { bendCount: '1' } },
    { processKey: 'DOBRA', partId: 'BACKSPLASH', condition: 'hasBacksplash', metricsExpr: { bendCount: '1' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [
    {
      id: 'CUBA_FIT',
      condition: 'cubaWidth > width - 100 || cubaDepth > depth - 100',
      message: 'Cuba muito grande para a bancada',
      severity: 'error',
    },
  ],

  metricsModel: {
    weldMetersExpr: '(width + 2 * depth) / 1000',
    finishM2Expr: '(width * depth - cubaWidth * cubaDepth) / 1000000',
    cutMetersExpr: '2 * (width + depth + cubaWidth + cubaDepth) / 1000',
    bendCountExpr: 'hasBacksplash ? 2 : 1',
  },
};

/**
 * BANCADA_COM_CUBAS_2 - Bancada com 2 cubas
 */
export const BANCADA_COM_CUBAS_2: EquipmentTemplateDSL = {
  key: 'BANCADA_COM_CUBAS_2',
  label: 'Bancada com 2 Cubas',
  category: 'BANCADA',
  description: 'Bancada com duas cubas embutidas',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 1200, max: 3000, default: 1800, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 500, max: 800, default: 600, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 800, max: 950, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 1.0, max: 2.0, default: 1.5, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'hasBacksplash', label: 'Com espelho', type: 'boolean', default: true },
    { key: 'backsplashHeight', label: 'Altura do espelho', type: 'number', unit: 'mm', min: 100, max: 600, default: 400 },
    { key: 'cubaWidth', label: 'Largura da cuba', type: 'number', unit: 'mm', min: 300, max: 800, default: 500 },
    { key: 'cubaDepth', label: 'Profundidade da cuba', type: 'number', unit: 'mm', min: 300, max: 500, default: 400 },
  ],

  derived: [
    { key: 'skirtHeight', expression: '50', description: 'Altura da saia' },
    { key: 'actualBacksplashHeight', expression: 'hasBacksplash ? backsplashHeight : 0', description: 'Altura real do espelho' },
    { key: 'cuba1X', expression: 'width / 3 - cubaWidth / 2', description: 'Posição X da cuba 1' },
    { key: 'cuba2X', expression: '2 * width / 3 - cubaWidth / 2', description: 'Posição X da cuba 2' },
    { key: 'cubaY', expression: 'depth - cubaDepth - 50', description: 'Posição Y das cubas' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TAMPO',
        label: 'Tampo com recortes',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [
          {
            type: 'cut',
            positionXExpr: 'cuba1X',
            positionYExpr: 'cubaY',
            widthExpr: 'cubaWidth',
            heightExpr: 'cubaDepth',
          },
          {
            type: 'cut',
            positionXExpr: 'cuba2X',
            positionYExpr: 'cubaY',
            widthExpr: 'cubaWidth',
            heightExpr: 'cubaDepth',
          },
        ],
        bends: [],
      },
      {
        id: 'SAIA_FRONT',
        label: 'Saia Frontal',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'skirtHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'skirtHeight', direction: 'up', kFactor: 0.33 }],
      },
      {
        id: 'BACKSPLASH',
        label: 'Espelho',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'hasBacksplash ? 1 : 0',
        widthExpr: 'width',
        heightExpr: 'actualBacksplashHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [{ angleExpr: '90', positionExpr: 'actualBacksplashHeight', direction: 'down', kFactor: 0.33 }],
      },
    ],
    tubes: [],
    accessories: [
      {
        id: 'CUBA_1',
        label: 'Cuba Inox 1',
        sku: 'CUBA-INOX-500x400',
        quantityExpr: '1',
      },
      {
        id: 'CUBA_2',
        label: 'Cuba Inox 2',
        sku: 'CUBA-INOX-500x400',
        quantityExpr: '1',
      },
    ],
  },

  structuralRules: COMMON_STRUCTURAL_RULES,

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'TAMPO', metricsExpr: { cutLength: '4 * (cubaWidth + cubaDepth)' } },
    { processKey: 'DOBRA', partId: 'SAIA_FRONT', metricsExpr: { bendCount: '1' } },
    { processKey: 'DOBRA', partId: 'BACKSPLASH', condition: 'hasBacksplash', metricsExpr: { bendCount: '1' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TAMPO', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [
    {
      id: 'CUBA_FIT',
      condition: '2 * cubaWidth > width - 200',
      message: 'Cubas muito grandes para a bancada',
      severity: 'error',
    },
  ],

  metricsModel: {
    weldMetersExpr: '(width + 2 * depth) / 1000',
    finishM2Expr: '(width * depth - 2 * cubaWidth * cubaDepth) / 1000000',
    cutMetersExpr: '2 * (width + depth + 2 * cubaWidth + 2 * cubaDepth) / 1000',
    bendCountExpr: 'hasBacksplash ? 2 : 1',
  },
};

// ============================================================
// ARMÁRIOS (3 templates)
// ============================================================

/**
 * ARMARIO_ABERTO - Armário sem portas
 */
export const ARMARIO_ABERTO: EquipmentTemplateDSL = {
  key: 'ARMARIO_ABERTO',
  label: 'Armário Aberto',
  category: 'ARMARIO',
  description: 'Armário sem portas com prateleiras',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 400, max: 1500, default: 800, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 600, default: 400, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 600, max: 2200, default: 1200, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 2.0, default: 1.0, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'shelfCount', label: 'Número de prateleiras', type: 'number', unit: '', min: 1, max: 6, default: 3 },
  ],

  derived: [
    { key: 'shelfSpacing', expression: 'height / (shelfCount + 1)', description: 'Espaçamento entre prateleiras' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TOP',
        label: 'Tampo Superior',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'BOTTOM',
        label: 'Base',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SIDE_LEFT',
        label: 'Lateral Esquerda',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SIDE_RIGHT',
        label: 'Lateral Direita',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'BACK',
        label: 'Fundo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'height',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SHELVES',
        label: 'Prateleiras',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'shelfCount',
        widthExpr: 'width - 20',
        heightExpr: 'depth - 10',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [],
    accessories: [],
  },

  structuralRules: [
    ...COMMON_STRUCTURAL_RULES,
    {
      id: 'TALL_CABINET_BRACE',
      condition: 'height > 1600',
      action: 'ADD_TUBE',
      params: {
        id: 'extra_brace',
        label: 'Travessa Extra',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        lengthExpr: 'width - 40',
        profile: '30x30x1.0',
      },
      message: 'Armários altos requerem travessa extra',
      severity: 'info',
    },
  ],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'ALL', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: '0' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(4 * height + 2 * width + 4 * depth) / 1000',
    finishM2Expr: '(2 * width * depth + 2 * height * depth + width * height + shelfCount * width * depth) / 1000000',
    cutMetersExpr: '0',
    bendCountExpr: '0',
  },
};

/**
 * ARMARIO_2_PORTAS - Armário com 2 portas
 */
export const ARMARIO_2_PORTAS: EquipmentTemplateDSL = {
  key: 'ARMARIO_2_PORTAS',
  label: 'Armário com 2 Portas',
  category: 'ARMARIO',
  description: 'Armário com 2 portas e prateleiras internas',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 500, max: 1500, default: 800, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 600, default: 400, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 600, max: 2200, default: 1200, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 2.0, default: 1.0, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'shelfCount', label: 'Número de prateleiras', type: 'number', unit: '', min: 1, max: 6, default: 2 },
    { key: 'hasHanging', label: 'Com cabideiro', type: 'boolean', default: false },
  ],

  derived: [
    { key: 'doorWidth', expression: 'width / 2 - 10', description: 'Largura de cada porta' },
    { key: 'doorHeight', expression: 'height - 20', description: 'Altura das portas' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TOP',
        label: 'Tampo Superior',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'BOTTOM',
        label: 'Base',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SIDE_LEFT',
        label: 'Lateral Esquerda',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SIDE_RIGHT',
        label: 'Lateral Direita',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'BACK',
        label: 'Fundo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'height',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'DOOR_LEFT',
        label: 'Porta Esquerda',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'doorWidth',
        heightExpr: 'doorHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'DOOR_RIGHT',
        label: 'Porta Direita',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'doorWidth',
        heightExpr: 'doorHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SHELVES',
        label: 'Prateleiras',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'shelfCount',
        widthExpr: 'width - 30',
        heightExpr: 'depth - 20',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [],
    accessories: [
      {
        id: 'HINGE_L',
        label: 'Dobradiça Esquerda',
        sku: 'DOBRADICA-INOX',
        quantityExpr: '2',
      },
      {
        id: 'HINGE_R',
        label: 'Dobradiça Direita',
        sku: 'DOBRADICA-INOX',
        quantityExpr: '2',
      },
      {
        id: 'HANDLE',
        label: 'Puxador',
        sku: 'PUXADOR-INOX-150',
        quantityExpr: '2',
      },
    ],
  },

  structuralRules: [
    ...COMMON_STRUCTURAL_RULES,
    {
      id: 'TALL_CABINET_BRACE',
      condition: 'height > 1600',
      action: 'ADD_TUBE',
      params: {
        id: 'extra_brace',
        label: 'Travessa Extra',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        lengthExpr: 'width - 40',
        profile: '30x30x1.0',
      },
      message: 'Armários altos requerem travessa extra',
      severity: 'info',
    },
  ],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'ALL', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: '0' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(4 * height + 2 * width + 4 * depth) / 1000',
    finishM2Expr: '(2 * width * depth + 2 * height * depth + width * height + 2 * doorWidth * doorHeight + shelfCount * width * depth) / 1000000',
    cutMetersExpr: '0',
    bendCountExpr: '0',
  },
};

/**
 * GABINETE_PIA_2_PORTAS - Gabinete para pia com 2 portas
 */
export const GABINETE_PIA_2_PORTAS: EquipmentTemplateDSL = {
  key: 'GABINETE_PIA_2_PORTAS',
  label: 'Gabinete Pia 2 Portas',
  category: 'ARMARIO',
  description: 'Gabinete para pia com 2 portas e espaço interno',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 500, max: 1200, default: 800, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 400, max: 600, default: 500, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 700, max: 950, default: 850, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 2.0, default: 1.2, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'hasShelf', label: 'Com prateleira interna', type: 'boolean', default: true },
  ],

  derived: [
    { key: 'doorWidth', expression: 'width / 2 - 10', description: 'Largura de cada porta' },
    { key: 'doorHeight', expression: 'height - 20', description: 'Altura das portas' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TOP',
        label: 'Tampo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SIDE_LEFT',
        label: 'Lateral Esquerda',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SIDE_RIGHT',
        label: 'Lateral Direita',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'depth',
        heightExpr: 'height',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'BACK',
        label: 'Fundo',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'width',
        heightExpr: 'height',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'DOOR_LEFT',
        label: 'Porta Esquerda',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'doorWidth',
        heightExpr: 'doorHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'DOOR_RIGHT',
        label: 'Porta Direita',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '1',
        widthExpr: 'doorWidth',
        heightExpr: 'doorHeight',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
      {
        id: 'SHELF',
        label: 'Prateleira',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'hasShelf ? 1 : 0',
        widthExpr: 'width - 30',
        heightExpr: 'depth - 20',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [],
    accessories: [
      {
        id: 'HINGE_L',
        label: 'Dobradiça Esquerda',
        sku: 'DOBRADICA-INOX',
        quantityExpr: '2',
      },
      {
        id: 'HINGE_R',
        label: 'Dobradiça Direita',
        sku: 'DOBRADICA-INOX',
        quantityExpr: '2',
      },
      {
        id: 'HANDLE',
        label: 'Puxador',
        sku: 'PUXADOR-INOX-150',
        quantityExpr: '2',
      },
    ],
  },

  structuralRules: COMMON_STRUCTURAL_RULES,

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'ALL', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: '0' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(2 * height + 2 * width + 4 * depth) / 1000',
    finishM2Expr: '(width * depth + 2 * height * depth + width * height + 2 * doorWidth * doorHeight) / 1000000',
    cutMetersExpr: '0',
    bendCountExpr: '0',
  },
};

// ============================================================
// ESTANTES (2 templates)
// ============================================================

/**
 * ESTANTE_4_NIVEIS - Estante fixa com 4 níveis
 */
export const ESTANTE_4_NIVEIS: EquipmentTemplateDSL = {
  key: 'ESTANTE_4_NIVEIS',
  label: 'Estante 4 Níveis',
  category: 'ESTANTE',
  description: 'Estante fixa com 4 níveis de prateleiras',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 600, max: 2000, default: 1000, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 600, default: 400, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 1200, max: 2200, default: 1800, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 2.0, default: 1.0, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
  ],

  derived: [
    { key: 'shelfCount', expression: '4', description: 'Número fixo de prateleiras' },
    { key: 'shelfSpacing', expression: 'height / 5', description: 'Espaçamento entre prateleiras' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'SHELVES',
        label: 'Prateleiras',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: '4',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [
      {
        id: 'POST_FL',
        label: 'Montante Frontal Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'POST_FR',
        label: 'Montante Frontal Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'POST_BL',
        label: 'Montante Traseiro Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'POST_BR',
        label: 'Montante Traseiro Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'40x40x1.2'",
      },
    ],
    accessories: [],
  },

  structuralRules: [
    ...COMMON_STRUCTURAL_RULES,
    {
      id: 'ESTANTE_BRACE',
      condition: 'width > 1500',
      action: 'ADD_TUBE',
      params: {
        id: 'center_post',
        label: 'Montante Central',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        lengthExpr: 'height',
        profile: '40x40x1.2',
      },
      message: 'Estantes largas requerem montante central',
      severity: 'info',
    },
  ],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'SHELVES', metricsExpr: { cutLength: '0' } },
    { processKey: 'CORTE_TUBO', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'SHELVES', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: '4 * width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(4 * height + 8 * width) / 1000',
    finishM2Expr: '4 * width * depth / 1000000',
    cutMetersExpr: '0',
    bendCountExpr: '0',
  },
};

/**
 * ESTANTE_N_NIVEIS - Estante com n níveis configurável
 */
export const ESTANTE_N_NIVEIS: EquipmentTemplateDSL = {
  key: 'ESTANTE_N_NIVEIS',
  label: 'Estante N Níveis',
  category: 'ESTANTE',
  description: 'Estante configurável com número variável de níveis',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 600, max: 2000, default: 1200, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 600, default: 400, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 1200, max: 2800, default: 2000, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 2.0, default: 1.0, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'shelfCount', label: 'Número de prateleiras', type: 'number', unit: '', min: 3, max: 8, default: 5 },
  ],

  derived: [
    { key: 'shelfSpacing', expression: 'height / (shelfCount + 1)', description: 'Espaçamento entre prateleiras' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'SHELVES',
        label: 'Prateleiras',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'shelfCount',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [],
      },
    ],
    tubes: [
      {
        id: 'POST_FL',
        label: 'Montante Frontal Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'POST_FR',
        label: 'Montante Frontal Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'POST_BL',
        label: 'Montante Traseiro Esquerdo',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'40x40x1.2'",
      },
      {
        id: 'POST_BR',
        label: 'Montante Traseiro Direito',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'40x40x1.2'",
      },
    ],
    accessories: [],
  },

  structuralRules: [
    ...COMMON_STRUCTURAL_RULES,
    {
      id: 'ESTANTE_BRACE',
      condition: 'width > 1500',
      action: 'ADD_TUBE',
      params: {
        id: 'center_post',
        label: 'Montante Central',
        materialKeyExpr: "'TUBE#SS304#40x40x1.2#6000#DEFAULT'",
        lengthExpr: 'height',
        profile: '40x40x1.2',
      },
      message: 'Estantes largas requerem montante central',
      severity: 'info',
    },
  ],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'SHELVES', metricsExpr: { cutLength: '0' } },
    { processKey: 'CORTE_TUBO', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'SHELVES', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'shelfCount * width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(4 * height + 2 * shelfCount * width) / 1000',
    finishM2Expr: 'shelfCount * width * depth / 1000000',
    cutMetersExpr: '0',
    bendCountExpr: '0',
  },
};

// ============================================================
// CARRINHOS (1 template)
// ============================================================

/**
 * CARRINHO_N_BANDEJAS - Carrinho com n bandejas
 */
export const CARRINHO_N_BANDEJAS: EquipmentTemplateDSL = {
  key: 'CARRINHO_N_BANDEJAS',
  label: 'Carrinho N Bandejas',
  category: 'CARRINHO',
  description: 'Carrinho móvel com número configurável de bandejas',

  inputs: [
    { key: 'width', label: 'Largura', type: 'number', unit: 'mm', min: 400, max: 1000, default: 600, required: true },
    { key: 'depth', label: 'Profundidade', type: 'number', unit: 'mm', min: 300, max: 600, default: 400, required: true },
    { key: 'height', label: 'Altura', type: 'number', unit: 'mm', min: 700, max: 1800, default: 1100, required: true },
    { key: 'thickness', label: 'Espessura', type: 'number', unit: 'mm', min: 0.8, max: 1.5, default: 1.0, required: true },
    {
      key: 'finish',
      label: 'Acabamento',
      type: 'select',
      default: 'POLIDO',
      options: [
        { value: 'POLIDO', label: 'Polido' },
        { value: 'ESCOVADO', label: 'Escovado' },
        { value: '2B', label: '2B (Natural)' },
      ],
      required: true,
    },
    { key: 'trayCount', label: 'Número de bandejas', type: 'number', unit: '', min: 2, max: 8, default: 3 },
    { key: 'hasCasters', label: 'Com rodízios', type: 'boolean', default: true },
  ],

  derived: [
    { key: 'traySpacing', expression: 'height / (trayCount + 1)', description: 'Espaçamento entre bandejas' },
    { key: 'handleHeight', expression: 'height - 50', description: 'Altura do punho' },
  ],

  bom: {
    sheetParts: [
      {
        id: 'TRAYS',
        label: 'Bandejas',
        materialKeyExpr: "'SHEET#SS304#' + thickness + '#' + finish + '#3000x1250#DEFAULT'",
        quantityExpr: 'trayCount',
        widthExpr: 'width',
        heightExpr: 'depth',
        thicknessExpr: 'thickness',
        allowRotate: true,
        grainDirection: 'none',
        features: [],
        bends: [
          { angleExpr: '90', positionExpr: '20', direction: 'up', kFactor: 0.33 },
          { angleExpr: '90', positionExpr: 'depth - 20', direction: 'down', kFactor: 0.33 },
        ],
      },
    ],
    tubes: [
      {
        id: 'POST_FL',
        label: 'Montante Frontal Esquerdo',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'30x30x1.0'",
      },
      {
        id: 'POST_FR',
        label: 'Montante Frontal Direito',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'30x30x1.0'",
      },
      {
        id: 'POST_BL',
        label: 'Montante Traseiro Esquerdo',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'30x30x1.0'",
      },
      {
        id: 'POST_BR',
        label: 'Montante Traseiro Direito',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'height',
        profileExpr: "'30x30x1.0'",
      },
      {
        id: 'HANDLE',
        label: 'Punho',
        materialKeyExpr: "'TUBE#SS304#30x30x1.0#6000#DEFAULT'",
        quantityExpr: '1',
        lengthExpr: 'width',
        profileExpr: "'30x30x1.0'",
      },
    ],
    accessories: [
      {
        id: 'CASTERS',
        label: 'Rodízios',
        sku: 'ROD-50-POLI',
        quantityExpr: 'hasCasters ? 4 : 0',
      },
    ],
  },

  structuralRules: [],

  processRules: [
    { processKey: 'CORTE_LASER', partId: 'TRAYS', metricsExpr: { cutLength: '0' } },
    { processKey: 'CORTE_TUBO', partId: 'ALL', metricsExpr: { cutLength: '0' } },
    { processKey: 'DOBRA', partId: 'TRAYS', metricsExpr: { bendCount: '2 * trayCount' } },
    { processKey: 'SOLDA_TIG', partId: 'ALL', metricsExpr: { weldLength: '0' } },
    { processKey: 'POLIMENTO', partId: 'TRAYS', condition: 'finish == "POLIDO"', metricsExpr: { finishArea: 'trayCount * width * depth / 1000000' } },
    { processKey: 'MONTAGEM', partId: 'ALL', metricsExpr: {} },
    { processKey: 'EMBALAGEM', partId: 'ALL', metricsExpr: {} },
  ],

  validations: [],

  metricsModel: {
    weldMetersExpr: '(4 * height + width) / 1000',
    finishM2Expr: 'trayCount * width * depth / 1000000',
    cutMetersExpr: '0',
    bendCountExpr: '2 * trayCount',
  },
};

// ============================================================
// ALL TEMPLATES EXPORT
// ============================================================

/**
 * All equipment templates
 */
export const ALL_TEMPLATES: EquipmentTemplateDSL[] = [
  // MESAS
  MESA_LISA,
  MESA_COM_PRATELEIRA,
  MESA_CONTRAVENTADA_U,
  MESA_PAREDE_COM_ESPELHO,
  MESA_COM_RODIZIOS,

  // BANCADAS
  BANCADA_CENTRAL,
  BANCADA_PAREDE_COM_ESPELHO,
  BANCADA_ESTREITA,
  BANCADA_COM_CUBA_1,
  BANCADA_COM_CUBAS_2,

  // ARMÁRIOS
  ARMARIO_ABERTO,
  ARMARIO_2_PORTAS,
  GABINETE_PIA_2_PORTAS,

  // ESTANTES
  ESTANTE_4_NIVEIS,
  ESTANTE_N_NIVEIS,

  // CARRINHOS
  CARRINHO_N_BANDEJAS,
];

/**
 * Get template by key
 */
export function getTemplateByKey(key: string): EquipmentTemplateDSL | undefined {
  return ALL_TEMPLATES.find(t => t.key === key);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): EquipmentTemplateDSL[] {
  return ALL_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get total template count
 */
export function getTemplateCount(): number {
  return ALL_TEMPLATES.length;
}