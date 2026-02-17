/**
 * ============================================================================
 * SISTEMA DE MATERIAIS - TIPOS
 * ============================================================================
 * Definições para gestão de matéria-prima com preços reais
 */

export type TipoMaterial = 'chapa' | 'tubo' | 'cantoneira' | 'acessorio';
export type TipoInox = '304' | '316' | '430';
export type UnidadeMedida = 'kg' | 'm' | 'un' | 'm2';

// ============================================================================
// CHAPAS DE INOX
// ============================================================================

export interface ChapaPadrao {
  id: string;
  largura: number;  // mm
  altura: number;   // mm
  label: string;
  ativo: boolean;
}

export interface PrecoChapa {
  tipoInox: TipoInox;
  espessuraMm: number;
  precoKg: number;  // R$/kg
  dataAtualizacao: string;
  fornecedor?: string;
}

// ============================================================================
// TUBOS
// ============================================================================

export type TipoTubo = 'redondo' | 'quadrado' | 'retangular';

export interface TuboDefinicao {
  id: string;
  tipo: TipoTubo;
  descricao: string;
  // Dimensões em mm
  diametro?: number;        // Para redondo
  lado?: number;            // Para quadrado
  largura?: number;         // Para retangular
  altura?: number;          // Para retangular
  espessuraParede: number;
  kgPorMetro: number;
  ativo: boolean;
}

export interface PrecoTubo {
  tuboId: string;
  tipoInox: TipoInox;
  precoKg: number;
  dataAtualizacao: string;
  fornecedor?: string;
}

// ============================================================================
// CANTONEIRAS
// ============================================================================

export interface CantoneiraDefinicao {
  id: string;
  descricao: string;
  ladoA: number;       // mm
  ladoB: number;       // mm
  espessura: number;   // mm
  kgPorMetro: number;
  ativo: boolean;
}

export interface PrecoCantoneira {
  cantoneiraId: string;
  tipoInox: TipoInox;
  precoKg: number;
  dataAtualizacao: string;
  fornecedor?: string;
}

// ============================================================================
// ACESSÓRIOS
// ============================================================================

export type CategoriaAcessorio = 
  | 'fixacao'
  | 'hidraulico'
  | 'estrutural'
  | 'acabamento'
  | 'outro';

export interface AcessorioDefinicao {
  id: string;
  sku: string;
  nome: string;
  descricao: string;
  categoria: CategoriaAcessorio;
  unidade: UnidadeMedida;
  precoUnitario: number;  // R$/unidade
  estoque?: number;
  estoqueMinimo?: number;
  ativo: boolean;
  dataAtualizacao: string;
  fornecedor?: string;
}

// ============================================================================
// PROCESSOS DE FABRICAÇÃO
// ============================================================================

export type TipoProcesso = 
  | 'corte'
  | 'dobra'
  | 'solda'
  | 'acabamento'
  | 'montagem'
  | 'instalacao';

export interface ProcessoDefinicao {
  id: string;
  tipo: TipoProcesso;
  descricao: string;
  custoPorHora: number;  // R$/hora
  tempoMinimoPorPeca?: number;  // minutos
  ativo: boolean;
  dataAtualizacao: string;
}

// ============================================================================
// CONFIGURAÇÕES GERAIS
// ============================================================================

export interface ConfiguracoesMateriais {
  densidadeInoxKgM3: number;  // 7900 kg/m³
  margemPerdaMaterial: number;  // % (ex: 15)
  overheadPercent: number;  // % (ex: 20)
  margemLucroMinima: number;  // % (ex: 25)
  markupPadrao: number;  // multiplicador (ex: 2.5)
  dataAtualizacao: string;
}

// ============================================================================
// HISTÓRICO DE PREÇOS
// ============================================================================

export interface HistoricoPreco {
  id: string;
  tipoMaterial: TipoMaterial;
  materialId: string;
  tipoInox?: TipoInox;
  preco: number;
  data: string;
  usuario?: string;
  observacao?: string;
}
