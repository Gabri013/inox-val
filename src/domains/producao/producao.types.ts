/**
 * Tipos do domínio de Produção
 */

import type { ID } from '@/shared/types/ids';

export type SetorProducao = 
  | 'Corte'
  | 'Dobra'
  | 'Solda'
  | 'Acabamento'
  | 'Montagem'
  | 'Qualidade'
  | 'Expedicao';

export type StatusProducaoItem = 
  | 'Aguardando'
  | 'Em Producao'
  | 'Pausado'
  | 'Concluido'
  | 'Rejeitado';

export interface SetorInfo {
  id: SetorProducao;
  nome: string;
  cor: string;
  icone: string;
  ordem: number;
}

export interface OrdemProducaoItem {
  id: ID;
  ordemId: ID;
  produtoId: ID;
  produtoCodigo: string;
  produtoNome: string;
  quantidade: number;
  unidade: string;
  
  // Status por setor
  setorAtual: SetorProducao | null;
  status: StatusProducaoItem;
  progresso: number; // 0-100
  
  // Rastreamento
  iniciadoEm?: string;
  concluidoEm?: string;
  tempoProducao?: number; // em minutos
  
  // Materiais necessários (calculados automaticamente)
  materiaisNecessarios: MaterialNecessario[];
  materiaisDisponiveis: boolean;
  
  // Nesting (se aplicável)
  nestingId?: ID;
  consumoChapa?: ConsumoChapa;
}

export interface MaterialNecessario {
  produtoId: ID;
  produtoCodigo: string;
  produtoNome: string;
  quantidadeNecessaria: number;
  quantidadeDisponivel: number;
  unidade: string;
  faltante: number;
}

export interface ConsumoChapa {
  tipo: 'Chapa';
  material: string; // '304', '316', '201', '430'
  espessura: number;
  largura: number;
  comprimento: number;
  peso: number;
  area: number;
  aproveitamento: number; // percentual 0-100
  perdas: number; // percentual 0-100
}

export interface MovimentacaoSetor {
  id: ID;
  ordemItemId: ID;
  setorOrigem: SetorProducao | null;
  setorDestino: SetorProducao;
  operadorId: ID;
  operadorNome: string;
  dataHora: string;
  observacoes?: string;
  fotos?: string[]; // URLs das fotos
}

// ============================================================================
// Tipos fortes (subcoleções)
// ============================================================================

export type FirestoreTimestampLike =
  | string
  | Date
  | import('firebase/firestore').Timestamp
  | import('firebase/firestore').FieldValue
  | null
  | undefined;

export type ProducaoItemId = ID;
export type ProducaoOrderId = ID;

export interface ProducaoItem extends OrdemProducaoItem {
  id: ProducaoItemId;

  // Multi-tenant e referência da ordem
  empresaId: ID;
  orderId: ProducaoOrderId;

  // Campos obrigatórios para fila via collectionGroup('itens')
  setorAtual: SetorProducao | null;
  status: StatusProducaoItem;
  updatedAt: FirestoreTimestampLike;

  // Soft delete (padrão novo)
  isDeleted?: boolean;

  // Denormalização opcional para evitar N+1 reads
  numeroOrdem?: string;
  clienteNome?: string;
}

export interface MovimentacaoItem extends MovimentacaoSetor {
  id: ID;
  empresaId: ID;
  orderId: ProducaoOrderId;
  ordemItemId: ProducaoItemId;

  createdAt?: FirestoreTimestampLike;
  createdBy?: ID;
  updatedAt?: FirestoreTimestampLike;
  updatedBy?: ID;
  isDeleted?: boolean;
}

export interface OrdemProducaoCompleta {
  id: ID;
  numero: string;
  clienteId: ID;
  clienteNome: string;
  dataAbertura: string;
  dataPrevista: string;
  dataConclusao?: string;
  prioridade: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
  status: 'Planejamento' | 'Liberada' | 'Em Producao' | 'Pausada' | 'Concluida' | 'Cancelada';
  
  itens: OrdemProducaoItem[];
  observacoes?: string;
  
  // Resumo
  totalItens: number;
  itensConcluidos: number;
  progressoGeral: number;
}

export interface DashboardSetorData {
  setor: SetorProducao;
  itensAguardando: number;
  itensEmProducao: number;
  itensConcluidos: number;
  itensRejeitados: number;
  tempoMedioProducao: number; // em minutos
  eficiencia: number; // percentual 0-100
  ultimaAtualizacao: string;
}

export interface ConsultaMaterial {
  produtoId: ID;
  produtoCodigo: string;
  produtoNome: string;
  estoque: number;
  reservado: number;
  disponivel: number;
  unidade: string;
  localizacao?: string;
  estoqueMinimo: number;
  baixoEstoque: boolean;
}
