import type { ProdutoTipo } from './types';

export type FieldType = 'number' | 'select' | 'boolean';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

export interface FieldCondition {
  field: string;
  value: string | number | boolean;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  unit?: string;
  options?: FieldOption[];
  placeholder?: string;
  dependsOn?: FieldCondition;
}

export interface ProductConfig {
  type: ProdutoTipo;
  label: string;
  description: string;
  fields: FieldConfig[];
}

export const GLOBAL_FIELDS: FieldConfig[] = [
  { name: 'precoKgInox', label: 'Preço do Kg Inox', type: 'number', unit: 'R$' },
  { name: 'fatorTampo', label: 'Fator Tampo', type: 'number' },
  { name: 'fatorCuba', label: 'Fator Cuba', type: 'number' },
  { name: 'fatorVenda', label: 'Fator de Venda (geral)', type: 'number' },
  { name: 'percentualDesperdicio', label: 'Desperdício (%)', type: 'number', unit: '%' },
  { name: 'percentualMaoDeObra', label: 'Mão de Obra (%)', type: 'number', unit: '%' },
];

export const PRODUCT_CONFIGS: ProductConfig[] = [
  {
    type: 'bancadas',
    label: 'Bancadas / Cubas',
    description: 'Tampo, cubas, pés e acessórios.',
    fields: [
      { name: 'comprimento', label: 'Comprimento', type: 'number', unit: 'mm' },
      { name: 'largura', label: 'Largura', type: 'number', unit: 'mm' },
      { name: 'alturaFrontal', label: 'Altura frontal', type: 'number', unit: 'mm' },
      { name: 'espessuraChapa', label: 'Espessura da chapa', type: 'number', unit: 'mm' },
      { name: 'quantidadeCubas', label: 'Quantidade de cubas', type: 'number' },
      {
        name: 'tipoCuba',
        label: 'Tipo de cuba',
        type: 'select',
        options: [
          { label: 'Sem', value: 'sem' },
          { label: 'Com', value: 'com' },
          { label: 'Com espelho', value: 'comEspelho' },
        ],
      },
      {
        name: 'quantidadePes',
        label: 'Quantidade de pés',
        type: 'select',
        options: [
          { label: '4', value: 4 },
          { label: '5', value: 5 },
          { label: '6', value: 6 },
          { label: '7', value: 7 },
        ],
      },
      {
        name: 'tipoTuboPes',
        label: 'Tipo de tubo dos pés',
        type: 'select',
        options: [
          { label: 'Redondo', value: 'tuboRedondo' },
          { label: 'Quadrado', value: 'tuboQuadrado' },
          { label: 'Retangular', value: 'tuboRetangular' },
        ],
      },
      { name: 'alturaPes', label: 'Altura dos pés', type: 'number', unit: 'mm' },
      { name: 'temContraventamento', label: 'Tem contraventamento', type: 'boolean' },
      {
        name: 'tipoPrateleiraInferior',
        label: 'Prateleira inferior',
        type: 'select',
        options: [
          { label: 'Lisa', value: 'lisa' },
          { label: 'Gradeada', value: 'gradeada' },
          { label: 'Perfurada', value: 'perfurada' },
          { label: 'Nenhuma', value: 'nenhuma' },
        ],
      },
      { name: 'usarMaoFrancesa', label: 'Usar mão francesa', type: 'boolean' },
    ],
  },
  {
    type: 'lavatorios',
    label: 'Lavatórios',
    description: 'Padrão ou cirúrgico com opcionais.',
    fields: [
      {
        name: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: [
          { label: 'Padrão', value: 'lavatorioPadrao' },
          { label: 'Cirúrgico', value: 'lavatorioCirurgico' },
        ],
      },
      {
        name: 'modeloPadrao',
        label: 'Modelo',
        type: 'select',
        dependsOn: { field: 'tipo', value: 'lavatorioPadrao' },
        options: [
          { label: '750', value: '750' },
          { label: '850', value: '850' },
          { label: 'FDE', value: 'FDE' },
        ],
      },
      { name: 'comprimento', label: 'Comprimento', type: 'number', unit: 'mm', dependsOn: { field: 'tipo', value: 'lavatorioCirurgico' } },
      { name: 'largura', label: 'Largura', type: 'number', unit: 'mm', dependsOn: { field: 'tipo', value: 'lavatorioCirurgico' } },
      { name: 'profundidade', label: 'Profundidade', type: 'number', unit: 'mm', dependsOn: { field: 'tipo', value: 'lavatorioCirurgico' } },
      { name: 'alturaFrontal', label: 'Altura frontal', type: 'number', unit: 'mm', dependsOn: { field: 'tipo', value: 'lavatorioCirurgico' } },
      { name: 'bicaAlta', label: 'Bica alta', type: 'boolean' },
      { name: 'bicaBaixa', label: 'Bica baixa', type: 'boolean' },
      { name: 'pedal', label: 'Pedal', type: 'boolean' },
      { name: 'mangueiras', label: 'Mangueiras', type: 'boolean' },
      { name: 'joelho', label: 'Joelho', type: 'boolean' },
      { name: 'valvula', label: 'Válvula', type: 'boolean' },
    ],
  },
  {
    type: 'prateleiras',
    label: 'Prateleiras',
    description: 'Lisa ou gradeada, com mão francesa.',
    fields: [
      {
        name: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: [
          { label: 'Lisa', value: 'lisa' },
          { label: 'Gradeada', value: 'gradeada' },
        ],
      },
      { name: 'comprimento', label: 'Comprimento', type: 'number', unit: 'mm' },
      { name: 'profundidade', label: 'Profundidade', type: 'number', unit: 'mm' },
      { name: 'bordaDobrada', label: 'Borda dobrada', type: 'boolean' },
      { name: 'espessuraChapa', label: 'Espessura da chapa', type: 'number', unit: 'mm' },
      { name: 'usarMaoFrancesa', label: 'Usar mão francesa', type: 'boolean' },
    ],
  },
  {
    type: 'mesas',
    label: 'Mesas inox',
    description: 'Tampo, pés e prateleira inferior.',
    fields: [
      { name: 'comprimento', label: 'Comprimento', type: 'number', unit: 'mm' },
      { name: 'largura', label: 'Largura', type: 'number', unit: 'mm' },
      { name: 'espessuraTampo', label: 'Espessura do tampo', type: 'number', unit: 'mm' },
      { name: 'bordaTampo', label: 'Borda do tampo', type: 'number', unit: 'mm' },
      {
        name: 'quantidadePes',
        label: 'Quantidade de pés',
        type: 'select',
        options: [
          { label: '4', value: 4 },
          { label: '5', value: 5 },
          { label: '6', value: 6 },
          { label: '7', value: 7 },
        ],
      },
      {
        name: 'tipoTuboPes',
        label: 'Tipo de tubo dos pés',
        type: 'select',
        options: [
          { label: 'Redondo', value: 'tuboRedondo' },
          { label: 'Quadrado', value: 'tuboQuadrado' },
          { label: 'Retangular', value: 'tuboRetangular' },
        ],
      },
      { name: 'alturaPes', label: 'Altura dos pés', type: 'number', unit: 'mm' },
      {
        name: 'tipoPrateleiraInferior',
        label: 'Prateleira inferior',
        type: 'select',
        options: [
          { label: 'Lisa', value: 'lisa' },
          { label: 'Gradeada', value: 'gradeada' },
          { label: 'Perfurada', value: 'perfurada' },
          { label: 'Nenhuma', value: 'nenhuma' },
        ],
      },
      { name: 'temContraventamento', label: 'Tem contraventamento', type: 'boolean' },
    ],
  },
  {
    type: 'estanteCantoneira',
    label: 'Estante/Carro em Cantoneira',
    description: 'Planos, pés e opcionais.',
    fields: [
      { name: 'comprimento', label: 'Comprimento', type: 'number', unit: 'mm' },
      { name: 'largura', label: 'Largura', type: 'number', unit: 'mm' },
      { name: 'altura', label: 'Altura', type: 'number', unit: 'mm' },
      { name: 'quantidadePlanos', label: 'Quantidade de planos', type: 'number' },
      {
        name: 'tipoPrateleira',
        label: 'Tipo de prateleira',
        type: 'select',
        options: [
          { label: 'Lisa', value: 'lisa' },
          { label: 'Gradeada', value: 'gradeada' },
          { label: 'Perfurada', value: 'perfurada' },
        ],
      },
      { name: 'quantidadePes', label: 'Quantidade de pés', type: 'number' },
      { name: 'espessuraChapa', label: 'Espessura da chapa', type: 'number', unit: 'mm' },
      { name: 'incluirRodizios', label: 'Incluir rodízios', type: 'boolean' },
    ],
  },
  {
    type: 'estanteTubo',
    label: 'Estante/Carro em Tubo',
    description: 'Planos, pés e valor do tubo.',
    fields: [
      { name: 'comprimento', label: 'Comprimento', type: 'number', unit: 'mm' },
      { name: 'largura', label: 'Largura', type: 'number', unit: 'mm' },
      { name: 'altura', label: 'Altura', type: 'number', unit: 'mm' },
      { name: 'quantidadePlanos', label: 'Quantidade de planos', type: 'number' },
      { name: 'quantidadePes', label: 'Quantidade de pés', type: 'number' },
      {
        name: 'tipoPrateleira',
        label: 'Tipo de prateleira',
        type: 'select',
        options: [
          { label: 'Lisa', value: 'lisa' },
          { label: 'Gradeada', value: 'gradeada' },
          { label: 'Perfurada', value: 'perfurada' },
        ],
      },
      { name: 'valorMetroTubo', label: 'Valor do metro do tubo', type: 'number', unit: 'R$' },
    ],
  },
  {
    type: 'coifas',
    label: 'Coifas',
    description: 'Tipo, duto, curva e instalação.',
    fields: [
      { name: 'comprimento', label: 'Comprimento', type: 'number', unit: 'mm' },
      { name: 'largura', label: 'Largura', type: 'number', unit: 'mm' },
      { name: 'altura', label: 'Altura', type: 'number', unit: 'mm' },
      {
        name: 'tipoCoifa',
        label: 'Tipo de coifa',
        type: 'select',
        options: [
          { label: '3 águas', value: '3-aguas' },
          { label: '4 águas', value: '4-aguas' },
        ],
      },
      { name: 'incluirDuto', label: 'Incluir duto', type: 'boolean' },
      { name: 'incluirCurva', label: 'Incluir curva', type: 'boolean' },
      { name: 'incluirChapeu', label: 'Incluir chapéu', type: 'boolean' },
      { name: 'incluirInstalacao', label: 'Incluir instalação', type: 'boolean' },
    ],
  },
  {
    type: 'chapaPlana',
    label: 'Chapa plana',
    description: 'Cálculo direto por área.',
    fields: [
      { name: 'comprimento', label: 'Comprimento', type: 'number', unit: 'mm' },
      { name: 'largura', label: 'Largura', type: 'number', unit: 'mm' },
      { name: 'espessura', label: 'Espessura', type: 'number', unit: 'mm' },
      { name: 'precoKg', label: 'Preço do Kg', type: 'number', unit: 'R$' },
    ],
  },
  {
    type: 'materialRedondo',
    label: 'Material redondo (repuxo)',
    description: 'Cálculo com repuxo.',
    fields: [
      { name: 'diametro', label: 'Diâmetro', type: 'number', unit: 'mm' },
      { name: 'altura', label: 'Altura', type: 'number', unit: 'mm' },
      { name: 'espessura', label: 'Espessura', type: 'number', unit: 'mm' },
      { name: 'percentualRepuxo', label: 'Repuxo (%)', type: 'number', unit: '%' },
    ],
  },
  {
    type: 'cantoneira',
    label: 'Cantoneira',
    description: 'Perfil em L com espessura.',
    fields: [
      { name: 'comprimento', label: 'Comprimento', type: 'number', unit: 'mm' },
      { name: 'ladoA', label: 'Lado A', type: 'number', unit: 'mm' },
      { name: 'ladoB', label: 'Lado B', type: 'number', unit: 'mm' },
      { name: 'espessura', label: 'Espessura', type: 'number', unit: 'mm' },
    ],
  },
  {
    type: 'portasBatentes',
    label: 'Portas e Batentes',
    description: 'Porta dupla face e batente.',
    fields: [
      { name: 'porta.altura', label: 'Altura da porta', type: 'number', unit: 'mm' },
      { name: 'porta.largura', label: 'Largura da porta', type: 'number', unit: 'mm' },
      { name: 'porta.espessuraFrente', label: 'Espessura frente', type: 'number', unit: 'mm' },
      { name: 'porta.espessuraVerso', label: 'Espessura verso', type: 'number', unit: 'mm' },
      { name: 'porta.preenchimentoMDF', label: 'Preenchimento MDF', type: 'boolean' },
      { name: 'batente.altura', label: 'Altura do batente', type: 'number', unit: 'mm' },
      { name: 'batente.largura', label: 'Largura do batente', type: 'number', unit: 'mm' },
      { name: 'batente.perfil', label: 'Perfil', type: 'number', unit: 'mm' },
      { name: 'batente.espessura', label: 'Espessura', type: 'number', unit: 'mm' },
    ],
  },
];

export const getProductConfig = (type: ProdutoTipo) =>
  PRODUCT_CONFIGS.find((config) => config.type === type);
