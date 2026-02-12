/**
 * Tipos do módulo de Orçamentos (Workflow)
 */

import type { ResultadoCalculadora } from '@/domains/calculadora/types';

// ========================================
// TIPOS BASE
// ========================================

export type PrioridadeOrdem = 'Normal' | 'Alta' | 'Urgente';

export type StatusOrdem =
  | 'Pendente'
  | 'Em Produ\u00e7\u00e3o'
  | 'Pausada'
  | 'Conclu\u00edda'
  | 'Cancelada';

export type StatusCompra =
  | 'Solicitada'
  | 'Cotação'
  | 'Aprovada'
  | 'Pedido Enviado'
  | 'Recebida'
  | 'Cancelada';

export interface ItemMaterial {
  id: string;
  produtoId: string;
  produtoCodigo?: string;
  produtoNome: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  subtotal: number;
}

// ========================================
// STATUS
// ========================================

export type StatusOrcamento =
  | 'Aprovado'
  | 'Rejeitado'
  | 'Aguardando Aprovacao';

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
  ordemId?: string;
  aprovadoEm?: Date | string;
  empresaId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ========================================
// ORDENS DE PRODUÇÃO
// ========================================

export interface ApontamentoProducao {
  operadorId?: string;
  operadorNome?: string;
  dataInicio?: Date | string;
  pausas?: Array<{ inicio: Date | string; fim?: Date | string; motivo?: string }>;
  tempoDecorridoMs?: number;
}

export interface OrdemProducao {
  id: string;
  numero: string;
  orcamentoId: string;
  clienteId: string;
  clienteNome: string;
  dataAbertura: Date | string;
  dataPrevisao: Date | string;
  dataConclusao?: Date | string;
  status: StatusOrdem;
  itens: ItemMaterial[];
  total: number;
  prioridade: PrioridadeOrdem;
  observacoes?: string;
  materiaisReservados: boolean;
  materiaisConsumidos: boolean;
  apontamento?: ApontamentoProducao;
  empresaId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ========================================
// COMPRAS
// ========================================

export interface SolicitacaoCompra {
  id: string;
  numero: string;
  ordemId?: string;
  data: Date | string;
  status: StatusCompra;
  itens: ItemMaterial[];
  total: number;
  justificativa: string;
  fornecedorNome?: string;
  empresaId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ========================================
// CONTEXT
// ========================================

export interface WorkflowContextType {
  orcamentos: Orcamento[];
  addOrcamento: (data: Omit<Orcamento, 'id' | 'numero'>) => Orcamento | Promise<Orcamento>;
  updateOrcamento: (id: string, data: Partial<Omit<Orcamento, 'id' | 'numero'>>) => void | Promise<void>;
  converterOrcamentoEmOrdem: (orcamentoId: string) => OrdemProducao | Promise<OrdemProducao>;

  ordens: OrdemProducao[];
  addOrdem: (data: Omit<OrdemProducao, 'id' | 'numero'>) => OrdemProducao | Promise<OrdemProducao>;
  updateOrdem: (id: string, data: Partial<Omit<OrdemProducao, 'id' | 'numero'>>) => void | Promise<void>;
  iniciarProducao: (ordemId: string, operadorNome?: string) => boolean | Promise<{ success: boolean; error?: string }>;
  concluirProducao: (ordemId: string) => void | Promise<void>;

  solicitacoes: SolicitacaoCompra[];
  addSolicitacao: (data: Omit<SolicitacaoCompra, 'id' | 'numero'>) => SolicitacaoCompra | Promise<SolicitacaoCompra>;
  updateSolicitacao: (id: string, data: Partial<Omit<SolicitacaoCompra, 'id' | 'numero'>>) => void | Promise<void>;
  verificarNecessidadeCompra: (ordemId: string) => ItemMaterial[] | Promise<ItemMaterial[]>;
  addSolicitacaoCompra?: (data: Omit<SolicitacaoCompra, 'id' | 'numero'>) => SolicitacaoCompra | Promise<SolicitacaoCompra>;
  updateSolicitacaoCompra?: (id: string, data: Partial<Omit<SolicitacaoCompra, 'id' | 'numero'>>) => void | Promise<void>;

  movimentacoes: MovimentacaoEstoque[];
  addMovimentacao?: (data: Omit<MovimentacaoEstoque, 'id'>) => MovimentacaoEstoque;
  verificarDisponibilidade: (produtoId: string, quantidade: number) => boolean;
  reservarMateriais: (ordemId: string) => boolean;
  consumirMateriais: (ordemId: string) => boolean;
  verificarMateriaisParaOrdem?: (ordemId: string) => Promise<unknown>;
}

// ========================================
// MOVIMENTAÇÕES DE ESTOQUE
// ========================================

export interface MovimentacaoEstoque {
  id: string;
  data: Date | string;
  tipo: 'Entrada' | 'Saída';
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  origem: string;
  referencia?: string;
  usuarioId: string;
  usuarioNome: string;
}
