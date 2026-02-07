/**
 * ============================================================================
 * ORDENS DE PRODUÇÃO SERVICE
 * ============================================================================
 * 
 * Service para gerenciar ordens de produção no Firestore com validações:
 * - OP só pode ser criada de orçamento APROVADO
 * - Verificação de materiais disponíveis
 * - Gestão de status de produção
 * - Apontamento de produção (chão de fábrica)
 * 
 * ============================================================================
 */


import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getEmpresaContext, getFirestore } from "@/lib/firebase";
import { BaseFirestoreService, type ServiceResult } from './base.service';
import { COLLECTIONS } from '@/types/firebase';
import type { OrdemProducao, StatusOrdem } from '@/app/types/workflow';
import { orcamentosService } from './orcamentos.service';

export function getOrdensRef(callback: (ordens: any[]) => void): () => void {
  const empresaInfo = getEmpresaContext();
  if (!empresaInfo.empresaId) {
    return () => {};
  }

  const db = getFirestore();
  const ref = query(
    collection(db, COLLECTIONS.ordens_producao),
    where("empresaId", "==", empresaInfo.empresaId)
  );

  const unsub = onSnapshot(ref, (snap) => {
    const ordens = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(ordens);
  });

  return unsub;
}

const STATUS_TRANSITIONS: Record<StatusOrdem, StatusOrdem[]> = {
  'Pendente': ['Em Produção', 'Cancelada'],
  'Em Produção': ['Pausada', 'Concluída', 'Cancelada'],
  'Pausada': ['Em Produção', 'Cancelada'],
  'Concluída': [], // Estado final
  'Cancelada': [], // Estado final
};

export class OrdensService extends BaseFirestoreService<OrdemProducao> {
  constructor() {
    super(COLLECTIONS.ordens_producao);
  }

  /**
   * Validações específicas de ordem de produção
   */
  protected async validate(data: Partial<OrdemProducao>, id?: string): Promise<ServiceResult<void>> {
    const errors: string[] = [];

    // 1. Validar campos obrigatórios (se for criação)
    if (!id) {
      if (!data.clienteId) errors.push('clienteId é obrigatório');
      if (!data.clienteNome) errors.push('clienteNome é obrigatório');
      if (!data.itens || data.itens.length === 0) {
        errors.push('Ordem deve ter pelo menos 1 item');
      }
    }

    // 2. Validar transição de status (se for update)
    if (id && data.status) {
      const existing = await this.getById(id);
      if (existing.success && existing.data) {
        const oldStatus = existing.data.status;
        const newStatus = data.status;

        if (oldStatus !== newStatus) {
          const allowedTransitions = STATUS_TRANSITIONS[oldStatus];
          if (!allowedTransitions.includes(newStatus)) {
            errors.push(
              `Transição de status inválida: "${oldStatus}" → "${newStatus}". ` +
              `Transições permitidas: ${allowedTransitions.join(', ')}`
            );
          }
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join('; '),
      };
    }

    return { success: true };
  }

  /**
   * Cria OP a partir de orçamento aprovado
   */
  async criarDeOrcamento(orcamentoId: string): Promise<ServiceResult<OrdemProducao>> {
    try {
      // 1. Buscar orçamento
      const orcamento = await orcamentosService.getById(orcamentoId);
      if (!orcamento.success || !orcamento.data) {
        return {
          success: false,
          error: 'Orçamento não encontrado',
        };
      }

      // 2. Validar status do orçamento
      if (orcamento.data.status !== 'Aprovado') {
        return {
          success: false,
          error: 'Apenas orçamentos aprovados podem ser convertidos em ordem de produção',
        };
      }

      // 3. Verificar se já foi convertido
      if (orcamento.data.ordemId) {
        return {
          success: false,
          error: 'Este orçamento já foi convertido em ordem de produção',
        };
      }

      // 4. Gerar número da OP
      const todasOrdens = await this.list();
      const numeroOrdem = `OP-${String(
        (todasOrdens.data?.items.length || 0) + 1
      ).padStart(6, '0')}`;

      // 5. Criar OP
      const novaOrdem: Omit<OrdemProducao, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'> = {
        numero: numeroOrdem,
        orcamentoId: orcamento.data.id,
        clienteId: orcamento.data.clienteId,
        clienteNome: orcamento.data.clienteNome,
        dataAbertura: new Date(),
        dataPrevisao: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
        status: 'Pendente',
        itens: orcamento.data.itens.map((item) => ({
          id: item.id,
          produtoId: item.modeloId,
          produtoNome: item.descricao,
          quantidade: item.quantidade,
          unidade: 'un',
          precoUnitario: item.precoUnitario,
          subtotal: item.subtotal,
        })),
        total: orcamento.data.total,
        prioridade: 'Normal',
        observacoes: `Convertido do orçamento ${orcamento.data.numero}`,
        materiaisReservados: false,
        materiaisConsumidos: false,
      };

      const result = await this.create(novaOrdem);

      // 6. Marcar orçamento como convertido
      if (result.success && result.data) {
        await orcamentosService.marcarComoConvertido(orcamentoId, result.data.id);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar ordem de produção',
      };
    }
  }

  /**
   * Lista OPs por status
   */
  async listByStatus(status: StatusOrdem): Promise<ServiceResult<OrdemProducao[]>> {
    const result = await this.list({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'dataAbertura', direction: 'desc' }],
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data.items,
    };
  }

  /**
   * Lista OPs por cliente
   */
  async listByCliente(clienteId: string): Promise<ServiceResult<OrdemProducao[]>> {
    const result = await this.list({
      where: [{ field: 'clienteId', operator: '==', value: clienteId }],
      orderBy: [{ field: 'dataAbertura', direction: 'desc' }],
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data.items,
    };
  }

  /**
   * Inicia produção
   */
  async iniciarProducao(id: string, operadorNome: string): Promise<ServiceResult<OrdemProducao>> {
    const existing = await this.getById(id);
    if (!existing.success || !existing.data) {
      return existing;
    }

    if (existing.data.status !== 'Pendente') {
      return {
        success: false,
        error: 'Apenas ordens pendentes podem ser iniciadas',
      };
    }

    return this.update(id, {
      status: 'Em Produção',
      apontamento: {
        operadorNome,
        dataInicio: new Date(),
        pausas: [],
        tempoDecorridoMs: 0,
      },
    });
  }

  /**
   * Pausa produção
   */
  async pausarProducao(id: string, motivo?: string): Promise<ServiceResult<OrdemProducao>> {
    const existing = await this.getById(id);
    if (!existing.success || !existing.data) {
      return existing;
    }

    if (existing.data.status !== 'Em Produção') {
      return {
        success: false,
        error: 'Apenas ordens em produção podem ser pausadas',
      };
    }

    const apontamento = existing.data.apontamento;
    if (!apontamento) {
      return {
        success: false,
        error: 'Ordem sem apontamento de produção',
      };
    }

    const pausas = [...apontamento.pausas, { inicio: new Date(), motivo }];

    return this.update(id, {
      status: 'Pausada',
      apontamento: {
        ...apontamento,
        pausas,
      },
    });
  }

  /**
   * Retoma produção
   */
  async retomarProducao(id: string): Promise<ServiceResult<OrdemProducao>> {
    const existing = await this.getById(id);
    if (!existing.success || !existing.data) {
      return existing;
    }

    if (existing.data.status !== 'Pausada') {
      return {
        success: false,
        error: 'Apenas ordens pausadas podem ser retomadas',
      };
    }

    const apontamento = existing.data.apontamento;
    if (!apontamento) {
      return {
        success: false,
        error: 'Ordem sem apontamento de produção',
      };
    }

    // Finalizar última pausa
    const pausas = [...apontamento.pausas];
    const ultimaPausa = pausas[pausas.length - 1];
    if (ultimaPausa && !ultimaPausa.fim) {
      ultimaPausa.fim = new Date();
    }

    return this.update(id, {
      status: 'Em Produção',
      apontamento: {
        ...apontamento,
        pausas,
      },
    });
  }

  /**
   * Conclui produção
   */
  async concluirProducao(id: string): Promise<ServiceResult<OrdemProducao>> {
    const existing = await this.getById(id);
    if (!existing.success || !existing.data) {
      return existing;
    }

    if (existing.data.status !== 'Em Produção') {
      return {
        success: false,
        error: 'Apenas ordens em produção podem ser concluídas',
      };
    }

    const apontamento = existing.data.apontamento;
    if (apontamento) {
      apontamento.dataFim = new Date();
    }

    return this.update(id, {
      status: 'Concluída',
      dataConclusao: new Date(),
      apontamento,
    });
  }

  /**
   * Cancela ordem
   */
  async cancelar(id: string, motivo?: string): Promise<ServiceResult<OrdemProducao>> {
    const existing = await this.getById(id);
    if (!existing.success || !existing.data) {
      return existing;
    }

    if (['Concluída', 'Cancelada'].includes(existing.data.status)) {
      return {
        success: false,
        error: 'Ordem já finalizada não pode ser cancelada',
      };
    }

    const updates: Partial<OrdemProducao> = { status: 'Cancelada' };
    if (motivo) {
      updates.observacoes = (existing.data.observacoes || '') + `\nCancelada: ${motivo}`;
    }

    return this.update(id, updates);
  }
}

// Singleton instance
export const ordensService = new OrdensService();
