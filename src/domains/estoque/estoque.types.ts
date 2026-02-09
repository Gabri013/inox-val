/**
 * Tipos do domínio de Estoque
 * 
 * IMPORTANTE: Este estoque trabalha com MATERIAIS (chapas, tubos, componentes)
 * vindos da BOM, não com produtos genéricos.
 */

import type { ID } from '@/shared/types/ids';

export type TipoMovimento = 'ENTRADA' | 'SAIDA' | 'RESERVA' | 'ESTORNO' | 'AJUSTE';

/**
 * Movimento de estoque POR MATERIAL (nova estrutura)
 */
export interface MovimentoEstoqueMaterial {
  id: ID;
  materialId: string; // Código do material (ex: INOX_304_1.2mm, TUBO_38x1.2mm)
  materialNome?: string; // Denormalizado
  tipo: TipoMovimento;
  quantidade: number; // Em kg, m, m², un conforme unidade do material
  unidade: 'kg' | 'm' | 'm²' | 'un' | 'pç' | 'tubo';
  saldoAnterior: number;
  saldoNovo: number;
  origem: string; // Ex: "OP-0001", "Compra #456", "Ajuste manual"
  observacoes?: string;
  usuario: string;
  data: string; // ISO date string
  criadoEm: string;
}

/**
 * Saldo de estoque POR MATERIAL
 */
export interface SaldoEstoqueMaterial {
  materialId: string; // Código do material
  materialNome: string;
  materialCodigo: string;
  tipoMaterial: 'CHAPA' | 'TUBO' | 'COMPONENTE' | 'FIXACAO' | 'CONSUMIVEL';
  saldo: number; // Saldo total
  saldoDisponivel: number; // Saldo - Reservas
  saldoReservado: number; // Reservado para OPs
  estoqueMinimo: number;
  unidade: 'kg' | 'm' | 'm²' | 'un' | 'pç' | 'tubo';
  custoUnitario: number; // R$ por unidade
  valorEstoque: number; // Saldo × custoUnitario
  ultimaMovimentacao?: string;
}

/**
 * Input para criar movimento de material
 */
export interface CreateMovimentoMaterialInput {
  materialId: string;
  tipo: TipoMovimento;
  quantidade: number;
  unidade: 'kg' | 'm' | 'm²' | 'un' | 'pç' | 'tubo';
  origem: string;
  observacoes?: string;
  usuario: string;
}

// ============================================================================
// TIPOS LEGADOS (manter compatibilidade temporária)
// ============================================================================

export interface MovimentoEstoque {
  id: ID;
  produtoId: ID;
  produtoNome?: string; // Denormalizado para facilitar exibição
  produtoCodigo?: string;
  tipo: TipoMovimento;
  quantidade: number;
  quantidadeLancada?: number;
  unidadeBase?: string;
  unidadeLancada?: string;
  fatorConversao?: number;
  saldoAnterior: number;
  saldoNovo: number;
  origem: string; // Ex: "Ordem de Produção #123", "Compra #456", etc
  observacoes?: string;
  usuario: string;
  data: string; // ISO date string
  criadoEm: string;
}

export interface CreateMovimentoInput {
  produtoId: ID;
  tipo: TipoMovimento;
  quantidade: number;
  origem: string;
  observacoes?: string;
  usuario: string;
}

export interface SaldoEstoque {
  produtoId: ID;
  produtoNome: string;
  produtoCodigo: string;
  saldo: number;
  saldoDisponivel: number; // Saldo - Reservas
  saldoReservado: number;
  estoqueMinimo: number;
  unidade: string;
  ultimaMovimentacao?: string;
}

export interface EstoqueFilters {
  search?: string;
  tipo?: TipoMovimento | 'all';
  produtoId?: ID;
  materialId?: string; // ✅ Novo filtro por material
  dataInicio?: string;
  dataFim?: string;
}
