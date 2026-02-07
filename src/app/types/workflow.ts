/**
 * Tipos do módulo de Orçamentos (Workflow)
 */

import type { ResultadoCalculadora } from '@/domains/calculadora/types';

// ========================================
// STATUS
// ========================================

export type StatusOrcamento =
  | 'Rascunho'
  | 'Enviado'
  | 'Aprovado'
  | 'Rejeitado'
  | 'Convertido';

// ========================================
// ITEM DO ORÇAMENTO
// ========================================

export interface ItemOrcamento {
  id: string;
  modeloId: string;
  modeloNome: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  /** Snapshot do cálculo completo (BOM + Nesting + Precificação) */
  calculoSnapshot?: ResultadoCalculadora;
}

// ========================================
// ORÇAMENTO
// ========================================

export interface Orcamento {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  data: Date;
  validade: Date;
  status: StatusOrcamento;
  itens: ItemOrcamento[];
  subtotal: number;
  desconto: number;
  total: number;
  observacoes?: string;
}
