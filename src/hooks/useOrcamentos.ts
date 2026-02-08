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

interface UseOrcamentosOptions {
  autoLoad?: boolean;
  status?: StatusOrcamento;
  clienteId?: string;
}

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
        setOrcamentos(listResult.data.items.map(normalizeOrcamento));
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
        const payload = {
          id: `orc_${Date.now()}`,
          ...data,
          numero,
        } as Orcamento;
        const created = await httpClient.post<Orcamento>('/api/orcamentos', payload);
        const result = { success: true, data: created } as ServiceResult<Orcamento>;
        setOrcamentos((prev) => [normalizeOrcamento(created), ...prev]);
        toast.success('OrВamento criado com sucesso!');
        return result;
      }

      const result = await orcamentosService.create({
        ...data,
        numero,
      } as Orcamento);

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
        const updated = await httpClient.put<Orcamento>(`/api/orcamentos/${id}`, updates as Orcamento);
        const result = { success: true, data: updated } as ServiceResult<Orcamento>;
        setOrcamentos((prev) =>
          prev.map((o) => (o.id === id ? normalizeOrcamento(updated) : o))
        );
        toast.success('OrВamento atualizado com sucesso!');
        return result;
      }

      const result = await orcamentosService.update(id, updates as Orcamento);

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
    return updateOrcamento(id, { status: 'Aprovado' });
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
          rascunhos: items.filter((o) => o.status === 'Rascunho').length,
          enviados: items.filter((o) => o.status === 'Enviado').length,
          aprovados: items.filter((o) => o.status === 'Aprovado').length,
          rejeitados: items.filter((o) => o.status === 'Rejeitado').length,
          convertidos: items.filter((o) => o.status === 'Convertido').length,
          valorTotal: items.reduce((acc, o) => acc + o.total, 0),
        };
      }

      const list = await orcamentosService.list({ orderBy: [{ field: 'data', direction: 'desc' }] });
      const items = list.success && list.data ? list.data.items.map(normalizeOrcamento) : [];
      return {
        total: items.length,
        rascunhos: items.filter((o) => o.status === 'Rascunho').length,
        enviados: items.filter((o) => o.status === 'Enviado').length,
        aprovados: items.filter((o) => o.status === 'Aprovado').length,
        rejeitados: items.filter((o) => o.status === 'Rejeitado').length,
        convertidos: items.filter((o) => o.status === 'Convertido').length,
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
