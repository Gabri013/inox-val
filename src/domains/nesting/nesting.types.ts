/**
 * Tipos do domínio Nesting - Cálculo de Bancada
 */

import type { ID } from '@/shared/types/ids';

/**
 * Tipos de material para nesting
 */
export type TipoMaterial = 'CHAPA' | 'TUBO' | 'PERFIL' | 'BARRA';

/**
 * Unidades de medida
 */
export type UnidadeMedida = 'mm' | 'cm' | 'm' | 'kg' | 'un';

// ============================================================================
// TIPOS PARA NESTING 2D REAL (Layout com posições x/y)
// ============================================================================

/**
 * Posição 2D de uma peça no layout da chapa
 */
export interface PosicaoPeca {
  x: number; // mm - posição X no canvas
  y: number; // mm - posição Y no canvas
  largura: number; // mm - largura da peça (após rotação se aplicável)
  altura: number; // mm - altura da peça (após rotação se aplicável)
  rotacionada: boolean; // true se a peça foi rotacionada 90°
}

/**
 * Item alocado no nesting com posição 2D
 */
export interface ItemAlocadoNesting {
  id: string;
  descricao: string;
  posicao: PosicaoPeca;
}

/**
 * Resultado do nesting de UMA chapa com layout 2D
 */
export interface ResultadoNestingChapa {
  chapa: { comprimento: number; largura: number; nome: string };
  quantidadeChapas: number;
  areaUtilizada: number; // m²
  areaTotal: number; // m²
  aproveitamento: number; // 0-100
  sobra: number; // 0-100
  itensAlocados: ItemAlocadoNesting[]; // Itens na primeira chapa (compatibilidade)
  chapasLayouts?: Array<{
    index: number; // 0, 1, 2... (Chapa 1, 2, 3...)
    itensAlocados: ItemAlocadoNesting[];
    aproveitamento: number;
  }>; // Layouts de múltiplas chapas quando necessário
}

/**
 * Resultado completo do nesting (múltiplas opções de chapa)
 */
export interface ResultadoNesting {
  opcoes: ResultadoNestingChapa[];
  melhorOpcao: ResultadoNestingChapa;
}

// ============================================================================
// TIPOS LEGADOS (mantidos para compatibilidade)
// ============================================================================

/**
 * Item de uma bancada de nesting
 */
export interface ItemNesting {
  id: ID;
  descricao: string;
  quantidade: number;
  largura?: number; // Para chapas
  comprimento?: number; // Para chapas, tubos, perfis
  diametro?: number; // Para tubos
  espessura?: number; // Para chapas
  peso?: number; // Peso unitário em kg
  area?: number; // Área em m²
  unidade: UnidadeMedida;
}

/**
 * Material base (chapa mãe, tubo padrão, etc)
 */
export interface MaterialBase {
  id: ID;
  tipo: TipoMaterial;
  descricao: string;
  largura?: number; // mm
  comprimento?: number; // mm
  espessura?: number; // mm
  diametro?: number; // mm
  peso: number; // kg
  custoKg: number; // R$/kg
  custoTotal: number; // R$
  fornecedor?: string;
}

/**
 * Resultado do cálculo de aproveitamento
 */
export interface ResultadoAproveitamento {
  quantidadeMateriais: number; // Quantos materiais base são necessários
  aproveitamento: number; // Percentual 0-100
  sobra: number; // Área ou peso de sobra
  custoMaterial: number; // Custo total dos materiais
  custoCorte: number; // Custo estimado de corte
  custoTotal: number; // Custo total
}

/**
 * Cálculo de nesting completo
 */
export interface CalculoNesting {
  id: ID;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  nome: string;
  descricao?: string;
  clienteId?: ID;
  clienteNome?: string;
  
  // Itens a serem produzidos
  itens: ItemNesting[];
  
  // Material base
  materialBase: MaterialBase;
  
  // Resultado do cálculo
  resultado: ResultadoAproveitamento;
  
  // Custos adicionais
  custoMaoObra: number;
  custoSetup: number;
  custoOutros: number;
  margemLucro: number; // Percentual 0-100
  
  // Totais
  custoTotal: number;
  precoVenda: number;
  
  // Status
  status: 'RASCUNHO' | 'CALCULADO' | 'APROVADO' | 'CONVERTIDO';
  
  // Metadados
  criadoPor: string;
  atualizadoPor?: string;
}

/**
 * Input para criar cálculo
 */
export interface CreateCalculoNestingInput {
  nome: string;
  descricao?: string;
  clienteId?: ID;
  itens: Omit<ItemNesting, 'id'>[];
  materialBase: Omit<MaterialBase, 'id' | 'custoTotal'>;
  custoMaoObra?: number;
  custoSetup?: number;
  custoOutros?: number;
  margemLucro?: number;
  criadoPor: string;
}

/**
 * Input para atualizar cálculo
 */
export interface UpdateCalculoNestingInput extends Partial<CreateCalculoNestingInput> {
  atualizadoPor: string;
}

/**
 * Filtros para listagem
 */
export interface NestingFilters {
  status?: CalculoNesting['status'] | 'all';
  clienteId?: ID;
  dataInicio?: string;
  dataFim?: string;
}

/**
 * Parâmetros para cálculo de aproveitamento
 */
export interface ParametrosCalculo {
  espacamentoCorte: number; // mm - espaço entre peças
  perdaBorda: number; // mm - perda nas bordas
  eficienciaCorte: number; // 0-100 - eficiência do operador/máquina
}

/**
 * Template de material base (catálogo)
 */
export interface TemplateMaterial {
  id: ID;
  tipo: TipoMaterial;
  nome: string;
  largura?: number;
  comprimento?: number;
  espessura?: number;
  diametro?: number;
  peso: number;
  custoKgMedio: number;
  fornecedorPadrao?: string;
  ativo: boolean;
}
