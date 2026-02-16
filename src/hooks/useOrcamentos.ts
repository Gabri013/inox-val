/**
 * ============================================================================
 * HOOK: useOrcamentos
 * ============================================================================
 * 
 * Hook React para gerenciar orçamentos usando Firebase.
 * 
 * Funcionalidades:
 * - Carregar lista de orçamentos
 * - Criar novo orçamento
 * - Atualizar orçamento
 * - Deletar orçamento
 * - Aprovar/Rejeitar orçamento
 * - Filtrar por status e cliente
 * - Estatísticas
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import type { WhereFilterOp } from 'firebase/firestore';
import { orcamentosService } from '@/services/firestore/orcamentos.service';
import { httpClient, type PaginatedResponse } from '@/services/http/client';
import type { Orcamento, StatusOrcamento } from '@/app/types/workflow';
import { toast } from 'sonner';

type ServiceResult<T> = { success: boolean; data?: T; error?: string };

const LEGACY_STATUS_MAP: Record<string, StatusOrcamento> = {
  Rascunho: 'Aguardando Aprovacao',
  Enviado: 'Aguardando Aprovacao',
  Convertido: 'Aprovado',
};

const normalizeStatus = (status: unknown): StatusOrcamento => {
  if (typeof status === 'string' && status in LEGACY_STATUS_MAP) {
    return LEGACY_STATUS_MAP[status];
  }
  return status as StatusOrcamento;
};

const getLegacyStatusUpdate = (status: unknown): StatusOrcamento | null => {
  if (typeof status === 'string' && status in LEGACY_STATUS_MAP) {
    return LEGACY_STATUS_MAP[status];
  }
  return null;
};

interface UseOrcamentosOptions {
  autoLoad?: boolean;
  status?: StatusOrcamento;
  clienteId?: string;
}

const toSafeNumber = (value: unknown, fallback = 0) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const sanitizeItens = (itens: Orcamento['itens'] = []) =>
  itens.map((item) => {
    const quantidade = Math.max(0.01, toSafeNumber(item.quantidade, 1));
    const precoUnitario = Math.max(0, toSafeNumber(item.precoUnitario, 0));
    return {
      ...item,
      quantidade,
      precoUnitario,
      subtotal: quantidade * precoUnitario,
    };
  });

import type { CustosIndiretos, MargemLucroConfig } from '@/app/types/precificacao';
import { calcularPrecificacao } from '@/domains/precificacao/precificacao';

// Configuração padrão de custos indiretos e margem de lucro
const DEFAULT_CUSTOS_INDIRETOS: CustosIndiretos = { frete: 0, impostos: 0, outros: 0 };
const DEFAULT_MARGEM: MargemLucroConfig = { percentual: 0.15, minimoAbsoluto: 50 };

/**
 * Calcula o total do orçamento considerando custos indiretos e margem de lucro.
 * Permite sobrescrever custos e margem por orçamento.
 */

const sanitizeDraftPayload = <T extends {
  itens?: Orcamento['itens'];
  desconto?: number;
  subtotal?: number;
  total?: number;
  validade?: unknown;
  custosIndiretos?: CustosIndiretos;
  margemLucro?: MargemLucroConfig;
}>(payload: T): T => {
  const hasFinancialFields =
    Object.prototype.hasOwnProperty.call(payload, 'itens') ||
    Object.prototype.hasOwnProperty.call(payload, 'desconto') ||
    Object.prototype.hasOwnProperty.call(payload, 'subtotal') ||
    Object.prototype.hasOwnProperty.call(payload, 'total');

  const sanitized: Record<string, unknown> = { ...payload };

  if (hasFinancialFields) {
    const itens = sanitizeItens(payload.itens || []);
    const custosIndiretos = payload.custosIndiretos;
    const margemLucro = payload.margemLucro;
    const desconto = payload.desconto;
    const precificacao = calcularPrecificacao({
      itens,
      desconto,
      custosIndiretos,
      margemLucro,
    });
    sanitized.itens = itens;
    sanitized.subtotal = precificacao.subtotal;
    sanitized.desconto = precificacao.desconto;
    sanitized.custosIndiretos = precificacao.custosIndiretos;
    sanitized.margemLucro = precificacao.margemLucro;
    sanitized.lucro = precificacao.lucro;
    sanitized.total = precificacao.total;
    if (precificacao.alertaMargem) {
      sanitized.alertaMargem = precificacao.alertaMargem;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'validade')) {
    const validade = payload.validade;
    if (validade instanceof Date && Number.isFinite(validade.getTime())) {
      sanitized.validade = validade;
    } else if (typeof validade === 'string' || typeof validade === 'number') {
      const parsed = new Date(validade);
      if (Number.isFinite(parsed.getTime())) {
        sanitized.validade = parsed;
      }
    }
  }

  return sanitized as T;
};

export function useOrcamentos(options: UseOrcamentosOptions = {}) {
  const { autoLoad = true, status, clienteId } = options;
  const isMock = import.meta.env.VITE_USE_MOCK === 'true' && import.meta.env.DEV;
  
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar orçamentos
  const normalizeOrcamento = (orcamento: Orcamento): Orcamento => {
    const toDate = (value: unknown) => {
      if (!value) return value;
      if (value instanceof Date) return value;
      if (typeof value === 'string') return new Date(value);
      if (
        typeof value === 'object' &&
        value !== null &&
        'toDate' in value &&
        typeof (value as { toDate?: unknown }).toDate === 'function'
      ) {
        return (value as { toDate: () => unknown }).toDate();
      }
      return value;
    };

    return {
      ...orcamento,
      status: normalizeStatus(orcamento.status),
      aprovadoEm: toDate((orcamento as Orcamento).aprovadoEm),
      data: toDate(orcamento.data),
      validade: toDate(orcamento.validade),
      createdAt: toDate(orcamento.createdAt),
      updatedAt: toDate(orcamento.updatedAt),
    } as Orcamento;
  };

  const loadOrcamentos = async () => {
    try {
      setLoading(true);
      setError(null);

      const where = [] as { field: string; operator: WhereFilterOp; value: unknown }[];
      if (clienteId) where.push({ field: 'clienteId', operator: '==', value: clienteId });
      if (status) where.push({ field: 'status', operator: '==', value: status });

      if (isMock) {
        const response = await httpClient.get<PaginatedResponse<Orcamento>>('/api/orcamentos', {
          params: {
            page: 1,
            pageSize: 1000,
            ...(status ? { status } : {}),
            ...(clienteId ? { clienteId } : {}),
          },
        });
        setOrcamentos(response.items.map(normalizeOrcamento));
        return;
      }

      const listResult = await orcamentosService.list({
        where,
        orderBy: [{ field: 'data', direction: 'desc' }],
      });

      if (listResult.success && listResult.data) {
        const legacyUpdates: Array<{ id: string; status: StatusOrcamento }> = [];
        const normalizedItems = listResult.data.items.map((item) => {
          const legacyStatus = getLegacyStatusUpdate((item as { status?: unknown }).status);
          if (legacyStatus && item.status !== legacyStatus) {
            legacyUpdates.push({ id: item.id, status: legacyStatus });
          }
          return normalizeOrcamento({ ...item, status: legacyStatus ?? item.status } as Orcamento);
        });

        setOrcamentos(normalizedItems);

        if (!isMock && legacyUpdates.length > 0) {
          void Promise.allSettled(
            legacyUpdates.map((update) =>
              orcamentosService.update(update.id, { status: update.status } as Orcamento)
            )
          );
        }
      } else {
        setError(listResult.error || 'Erro ao carregar orçamentos');
        toast.error(listResult.error || 'Erro ao carregar orçamentos');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Criar orçamento
  const createOrcamento = async (
    data: Omit<Orcamento, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResult<Orcamento>> => {
    try {
      setLoading(true);

      const numero = `ORC-${Date.now()}`;

      if (isMock) {
        const payload = sanitizeDraftPayload({
          id: `orc_${Date.now()}`,
          ...data,
          numero,
        } as Orcamento);
        const created = await httpClient.post<Orcamento>('/api/orcamentos', payload);
        const result = { success: true, data: created } as ServiceResult<Orcamento>;
        setOrcamentos((prev) => [normalizeOrcamento(created), ...prev]);
        toast.success('OrВamento criado com sucesso!');
        return result;
      }

      const payload = sanitizeDraftPayload({
        ...data,
        numero,
      });

      const result = await orcamentosService.create(payload as Orcamento);

      if (result.success && result.data) {
        setOrcamentos((prev) => [normalizeOrcamento(result.data!), ...prev]);
        toast.success('Orçamento criado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao criar orçamento');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Atualizar orçamento
  const updateOrcamento = async (
    id: string,
    updates: Partial<Omit<Orcamento, 'id' | 'empresaId' | 'createdAt'>>
  ): Promise<ServiceResult<Orcamento>> => {
    try {
      setLoading(true);

      if (isMock) {
        const payload = sanitizeDraftPayload(updates as Partial<Orcamento>);
        const updated = await httpClient.put<Orcamento>(`/api/orcamentos/${id}`, payload as Orcamento);
        const result = { success: true, data: updated } as ServiceResult<Orcamento>;
        setOrcamentos((prev) =>
          prev.map((o) => (o.id === id ? normalizeOrcamento(updated) : o))
        );
        toast.success('OrВamento atualizado com sucesso!');
        return result;
      }

      const payload = sanitizeDraftPayload(updates as Partial<Orcamento>);
      const result = await orcamentosService.update(id, payload as Orcamento);

      if (result.success && result.data) {
        setOrcamentos((prev) =>
          prev.map((o) => (o.id === id ? normalizeOrcamento(result.data!) : o))
        );
        toast.success('Orçamento atualizado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao atualizar orçamento');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Deletar orçamento
  const deleteOrcamento = async (id: string): Promise<ServiceResult<void>> => {
    try {
      setLoading(true);

      if (isMock) {
        await httpClient.delete<void>(`/api/orcamentos/${id}`);
        setOrcamentos((prev) => prev.filter((o) => o.id !== id));
        toast.success('OrВamento removido com sucesso!');
        return { success: true } as ServiceResult<void>;
      }

      const result = await orcamentosService.remove(id);

      if (result.success) {
        setOrcamentos((prev) => prev.filter((o) => o.id !== id));
        toast.success('Orçamento removido com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao remover orçamento');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Aprovar orçamento
  const aprovarOrcamento = async (id: string): Promise<ServiceResult<Orcamento>> => {
    return updateOrcamento(id, { status: 'Aprovado', aprovadoEm: new Date() });
  };

  // Rejeitar orçamento
  const rejeitarOrcamento = async (id: string, motivo?: string): Promise<ServiceResult<Orcamento>> => {
    return updateOrcamento(id, {
      status: 'Rejeitado',
      observacoes: motivo,
    });
  };

  // Buscar por ID
  const getOrcamentoById = async (id: string): Promise<Orcamento | null> => {
    try {
      setLoading(true);
      if (isMock) {
        const data = await httpClient.get<Orcamento>(`/api/orcamentos/${id}`);
        return normalizeOrcamento(data);
      }

      const result = await orcamentosService.getById(id);

      if (result.success && result.data) {
        return normalizeOrcamento(result.data);
      }

      return null;
    } catch (err) {
      toast.error('Erro ao buscar orçamento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obter estatísticas
  const getEstatisticas = async () => {
    try {
      if (isMock) {
        const response = await httpClient.get<PaginatedResponse<Orcamento>>('/api/orcamentos', {
          params: { page: 1, pageSize: 1000 },
        });
        const items = response.items.map(normalizeOrcamento);
        return {
          total: items.length,
          rascunhos: items.filter((o) => o.status === 'Aguardando Aprovacao').length,
          enviados: 0,
          aprovados: items.filter((o) => o.status === 'Aprovado').length,
          rejeitados: items.filter((o) => o.status === 'Rejeitado').length,
          convertidos: items.filter((o) => !!o.ordemId).length,
          valorTotal: items.reduce((acc, o) => acc + o.total, 0),
        };
      }

      const list = await orcamentosService.list({ orderBy: [{ field: 'data', direction: 'desc' }] });
      const items = list.success && list.data ? list.data.items.map(normalizeOrcamento) : [];
      return {
        total: items.length,
        rascunhos: items.filter((o) => o.status === 'Aguardando Aprovacao').length,
        enviados: 0,
        aprovados: items.filter((o) => o.status === 'Aprovado').length,
        rejeitados: items.filter((o) => o.status === 'Rejeitado').length,
        convertidos: items.filter((o) => !!o.ordemId).length,
        valorTotal: items.reduce((acc, o) => acc + o.total, 0),
      };
    } catch (err) {
      toast.error('Erro ao carregar estatísticas');
      return null;
    }
  };

  // Auto-load ao montar
  useEffect(() => {
    if (autoLoad) {
      loadOrcamentos();
    }
  }, [autoLoad, status, clienteId]);

  return {
    orcamentos,
    loading,
    error,
    loadOrcamentos,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    aprovarOrcamento,
    rejeitarOrcamento,
    getOrcamentoById,
    getEstatisticas,
  };
}
