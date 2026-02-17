/**
 * ============================================================================
 * ENTIDADES FUNDAMENTAIS — CHAVES ÚNICAS — SEM GENÉRICOS
 * ============================================================================
 * Sistema baseado em chaves únicas e dados reais de mercado
 */

// ============================================================================
// MATERIAL_KEY — Chapas Específicas
// ============================================================================

export type TipoInox = '304' | '316' | '316L' | '430';
export type Acabamento = 'polido' | 'escovado' | 'brilhante' | 'fosco' | '2B' | 'BA';

export interface DimensaoChapa {
  largura: number;  // mm
  altura: number;   // mm
  label: string;
}

export interface MaterialKey {
  materialKey: string;  // Ex: "CHAPA_304_POLIDO_1.2"
  tipoInox: TipoInox;
  espessuraMm: number;
  acabamento: Acabamento;
  densidade: number;  // kg/m³ (7900 para inox)
  dimensoesChapaDisponiveis: DimensaoChapa[];
  precoPorKg: number;
  precoPorM2?: number;  // Opcional: preço direto por m²
  precoPorChapa?: Record<string, number>;  // Opcional: preço por dimensão
  fornecedor: string;
  dataAtualizacao: string;
  ativo: boolean;
}

// ============================================================================
// TUBE_KEY — Perfis Estruturais Específicos
// ============================================================================

export type FormatoTubo = 'REDONDO' | 'QUADRADO' | 'RETANGULAR';

export interface DimensoesTubo {
  diametro?: number;       // Para REDONDO (mm)
  largura?: number;        // Para QUADRADO/RETANGULAR (mm)
  altura?: number;         // Para RETANGULAR (mm)
  espessuraParede: number; // mm
}

export interface TubeKey {
  tubeKey: string;  // Ex: "TUBE_Q_40x40x1.2_304"
  formato: FormatoTubo;
  dimensoes: DimensoesTubo;
  tipoInox: TipoInox;
  kgPorMetro: number;
  precoPorKg: number;
  precoPorMetro: number;  // Calculado: kgPorMetro × precoPorKg
  fornecedor: string;
  dataAtualizacao: string;
  ativo: boolean;
}

// ============================================================================
// ANGLE_KEY — Cantoneiras Específicas
// ============================================================================

export interface AngleKey {
  angleKey: string;  // Ex: "ANGLE_30x30x3_304"
  ladoA: number;     // mm
  ladoB: number;     // mm
  espessura: number; // mm
  tipoInox: TipoInox;
  kgPorMetro: number;
  precoPorKg: number;
  precoPorMetro: number;  // Calculado: kgPorMetro × precoPorKg
  fornecedor: string;
  dataAtualizacao: string;
  ativo: boolean;
}

// ============================================================================
// ACCESSORY_SKU — Acessórios Específicos
// ============================================================================

export type CategoriaAcessorio = 
  | 'fixacao'
  | 'hidraulico'
  | 'estrutural'
  | 'acabamento'
  | 'eletrico'
  | 'outro';

export interface AccessorySKU {
  sku: string;
  descricao: string;
  precoUnitario: number;
  fornecedor: string;
  categoria: CategoriaAcessorio;
  unidade: string;
  peso?: number;
  dataAtualizacao: string;
  ativo: boolean;
  estoqueAtual?: number;
  estoqueMinimo?: number;
}

// ============================================================================
// PROCESS_KEY — Processos de Fabricação Específicos
// ============================================================================

export type TipoProcesso = 
  | 'CORTE'
  | 'DOBRA'
  | 'SOLDA'
  | 'ACABAMENTO'
  | 'MONTAGEM'
  | 'INSTALACAO';

export interface ProcessKey {
  processKey: string;
  tipo: TipoProcesso;
  descricao: string;
  custoPorHora?: number;
  custoSetup?: number;
  custoPorMetro?: number;
  custoPorDobra?: number;
  custoPorM2?: number;
  custoPorUnidade?: number;
  tempoMinimoMinutos?: number;
  espessuraMaxima?: number;
  espessuraMinima?: number;
  materialCompativel?: TipoInox[];
  ativo: boolean;
  dataAtualizacao: string;
}

// ============================================================================
// CONFIGURAÇÕES GLOBAIS DO SISTEMA
// ============================================================================

export interface ConfiguracoesSistema {
  kerfMm: number;
  margemMinimaEntrePecasMm: number;
  margemBordaMm: number;
  perdaMinimaOperacional: number;
  perdaSetup: number;
  freteCompraPorKg?: number;
  freteEntregaFixo?: number;
  embalagemPorProduto?: number;
  consumiveisPorHora?: number;
  retrabalhoEstimado: number;
  overheadPercent: number;
  overheadIncideEmAcessorios: boolean;
  margemMinima: number;
  margemAlvo: number;
  markup: number;
  lucroMinimoAbsoluto?: number;
  diasValidadePreco: number;
  aproveitamentoMinimoAceitavel: number;
  perdaMaximaAceitavel: number;
  dataAtualizacao: string;
}

// ============================================================================
// REGISTRY — Índice de Chaves Ativas
// ============================================================================

export interface MaterialRegistry {
  materials: Record<string, MaterialKey>;
  tubes: Record<string, TubeKey>;
  angles: Record<string, AngleKey>;
  accessories: Record<string, AccessorySKU>;
  processes: Record<string, ProcessKey>;
  materialsByTipo: Record<TipoInox, string[]>;
  tubesByFormato: Record<FormatoTubo, string[]>;
  accessoriesByCategoria: Record<CategoriaAcessorio, string[]>;
  processesByTipo: Record<TipoProcesso, string[]>;
  dataAtualizacao: string;
}

// ============================================================================
// VALIDAÇÃO DE CHAVES
// ============================================================================

export interface ErroChave {
  chave: string;
  tipo: 'inexistente' | 'inativo' | 'preco_desatualizado' | 'configuracao_incompleta';
  mensagem: string;
}

export function validarMaterialKey(key: string, registry: MaterialRegistry, diasValidade: number = 30): ErroChave | null {
  if (!registry.materials[key]) {
    return { chave: key, tipo: 'inexistente', mensagem: `Material inexistente: ${key}` };
  }
  
  const material = registry.materials[key];
  
  if (!material.ativo) {
    return { chave: key, tipo: 'inativo', mensagem: `Material inativo: ${key}` };
  }
  
  const diasDesdeAtualizacao = 
    (Date.now() - new Date(material.dataAtualizacao).getTime()) / (1000 * 60 * 60 * 24);
  
  if (diasDesdeAtualizacao > diasValidade) {
    return { 
      chave: key, 
      tipo: 'preco_desatualizado', 
      mensagem: `Preço desatualizado há ${Math.floor(diasDesdeAtualizacao)} dias: ${key}` 
    };
  }
  
  return null;
}

export function validarTubeKey(key: string, registry: MaterialRegistry): ErroChave | null {
  if (!registry.tubes[key]) {
    return { chave: key, tipo: 'inexistente', mensagem: `Tubo inexistente: ${key}` };
  }
  
  const tube = registry.tubes[key];
  
  if (!tube.ativo) {
    return { chave: key, tipo: 'inativo', mensagem: `Tubo inativo: ${key}` };
  }
  
  return null;
}

export function validarAngleKey(key: string, registry: MaterialRegistry): ErroChave | null {
  if (!registry.angles[key]) {
    return { chave: key, tipo: 'inexistente', mensagem: `Cantoneira inexistente: ${key}` };
  }
  
  const angle = registry.angles[key];
  
  if (!angle.ativo) {
    return { chave: key, tipo: 'inativo', mensagem: `Cantoneira inativa: ${key}` };
  }
  
  return null;
}

export function validarAccessorySKU(sku: string, registry: MaterialRegistry): ErroChave | null {
  if (!registry.accessories[sku]) {
    return { chave: sku, tipo: 'inexistente', mensagem: `Acessório inexistente: ${sku}` };
  }
  
  const accessory = registry.accessories[sku];
  
  if (!accessory.ativo) {
    return { chave: sku, tipo: 'inativo', mensagem: `Acessório inativo: ${sku}` };
  }
  
  return null;
}

export function validarProcessKey(key: string, registry: MaterialRegistry): ErroChave | null {
  if (!registry.processes[key]) {
    return { chave: key, tipo: 'inexistente', mensagem: `Processo inexistente: ${key}` };
  }
  
  const process = registry.processes[key];
  
  if (!process.ativo) {
    return { chave: key, tipo: 'inativo', mensagem: `Processo inativo: ${key}` };
  }
  
  return null;
}
