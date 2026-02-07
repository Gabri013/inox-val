/**
 * ============================================================================
 * ORÇAMENTOS SERVICE
 * ============================================================================
 * 
 * Service para gerenciar orçamentos no Firestore com validações específicas:
 * - Limite de 200 itens por orçamento
 * - Validação de modeloId (deve existir no MODELOS_REGISTRY)
 * - Validação de status (fluxo correto)
 * - Conversão para Ordem de Produção (apenas se APROVADO)
 * 
 * ============================================================================
 */

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getEmpresaContext, getFirestore } from "@/lib/firebase";
import { BaseFirestoreService, type ServiceResult } from './base.service';
import { COLLECTIONS } from '@/types/firebase';
import type { Orcamento, ItemOrcamento, StatusOrcamento } from '@/app/types/workflow';
import { isModeloValido } from '@/bom/models';

const MAX_ITENS_ORCAMENTO = 200;

const STATUS_TRANSITIONS: Record<StatusOrcamento, StatusOrcamento[]> = {
  'Rascunho': ['Enviado', 'Rejeitado'],
  'Enviado': ['Aprovado', 'Rejeitado'],
  'Aprovado': ['Convertido'],
  'Rejeitado': [], // Estado final
  'Convertido': [], // Estado final
};

export function getOrcamentosService(callback: (orcamentos: any[]) => void): () => void {
  const empresaInfo = getEmpresaContext();
  if (!empresaInfo.empresaId) {
    return () => {};
  }

  const db = getFirestore();
  const ref = query(
    collection(db, COLLECTIONS.orcamentos),
    where("empresaId", "==", empresaInfo.empresaId)
  );
  const unsub = onSnapshot(ref, (snap) => {
    const orcamentos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(orcamentos);
  });
  return unsub;
}

export class OrcamentosService extends BaseFirestoreService<Orcamento> {
  constructor() {
    super(COLLECTIONS.orcamentos);
  }

  /**
   * Validações específicas de orçamento
   */
  protected async validate(data: Partial<Orcamento>, id?: string): Promise<ServiceResult<void>> {
    const errors: string[] = [];

    // 1. Validar limite de itens
    if (data.itens && data.itens.length > MAX_ITENS_ORCAMENTO) {
      errors.push(`Orçamento não pode ter mais de ${MAX_ITENS_ORCAMENTO} itens`);
    }

    // 2. Validar itens (modeloId deve ser válido)
    if (data.itens) {
      for (let i = 0; i < data.itens.length; i++) {
        const item = data.itens[i];
        
        if (!item.modeloId) {
          errors.push(`Item ${i + 1}: modeloId é obrigatório`);
          continue;
        }

        if (!isModeloValido(item.modeloId)) {
          errors.push(`Item ${i + 1}: modelo "${item.modeloId}" não existe no MODELOS_REGISTRY`);
        }

        if (!item.calculoSnapshot) {
          errors.push(`Item ${i + 1}: calculoSnapshot é obrigatório`);
        }

        if (item.quantidade <= 0) {
          errors.push(`Item ${i + 1}: quantidade deve ser maior que zero`);
        }
      }
    }

    // 3. Validar transição de status (se for update)
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

    // 4. Validar campos obrigatórios
    if (!data.clienteId && !id) {
      errors.push('clienteId é obrigatório');
    }

    if (!data.clienteNome && !id) {
      errors.push('clienteNome é obrigatório');
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
   * Lista orçamentos por cliente
   */
  async listByCliente(clienteId: string): Promise<ServiceResult<Orcamento[]>> {
    const result = await this.list({
      where: [{ field: 'clienteId', operator: '==', value: clienteId }],
      orderBy: [{ field: 'data', direction: 'desc' }],
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
   * Lista orçamentos por status
   */
  async listByStatus(status: StatusOrcamento): Promise<ServiceResult<Orcamento[]>> {
    const result = await this.list({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'data', direction: 'desc' }],
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
   * Aprova orçamento (com validação)
   */
  async aprovar(id: string): Promise<ServiceResult<Orcamento>> {
    const existing = await this.getById(id);
    if (!existing.success || !existing.data) {
      return existing;
    }

    if (existing.data.status !== 'Enviado') {
      return {
        success: false,
        error: 'Apenas orçamentos com status "Enviado" podem ser aprovados',
      };
    }

    return this.update(id, { status: 'Aprovado' });
  }

  /**
   * Rejeita orçamento
   */
  async rejeitar(id: string, motivo?: string): Promise<ServiceResult<Orcamento>> {
    const existing = await this.getById(id);
    if (!existing.success || !existing.data) {
      return existing;
    }

    if (!['Rascunho', 'Enviado'].includes(existing.data.status)) {
      return {
        success: false,
        error: 'Apenas orçamentos com status "Rascunho" ou "Enviado" podem ser rejeitados',
      };
    }

    const updates: Partial<Orcamento> = { status: 'Rejeitado' };
    if (motivo) {
      updates.observacoes = (existing.data.observacoes || '') + `\nMotivo da rejeição: ${motivo}`;
    }

    return this.update(id, updates);
  }

  /**
   * Marca orçamento como convertido (chamado após criar OP)
   */
  async marcarComoConvertido(id: string, ordemId: string): Promise<ServiceResult<Orcamento>> {
    const existing = await this.getById(id);
    if (!existing.success || !existing.data) {
      return existing;
    }

    if (existing.data.status !== 'Aprovado') {
      return {
        success: false,
        error: 'Apenas orçamentos aprovados podem ser convertidos em ordem de produção',
      };
    }

    return this.update(id, {
      status: 'Convertido',
      ordemId,
    });
  }

  /**
   * Calcula estatísticas de orçamentos
   */
  async getEstatisticas(): Promise<ServiceResult<{
    total: number;
    rascunhos: number;
    enviados: number;
    aprovados: number;
    rejeitados: number;
    convertidos: number;
    valorTotal: number;
  }>> {
    try {
      const result = await this.list();
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error,
        };
      }

      const orcamentos = result.data.items;
      const stats = {
        total: orcamentos.length,
        rascunhos: orcamentos.filter((o) => o.status === 'Rascunho').length,
        enviados: orcamentos.filter((o) => o.status === 'Enviado').length,
        aprovados: orcamentos.filter((o) => o.status === 'Aprovado').length,
        rejeitados: orcamentos.filter((o) => o.status === 'Rejeitado').length,
        convertidos: orcamentos.filter((o) => o.status === 'Convertido').length,
        valorTotal: orcamentos.reduce((acc, o) => acc + o.total, 0),
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao calcular estatísticas',
      };
    }
  }
}

// Singleton instance
export const orcamentosService = new OrcamentosService();
