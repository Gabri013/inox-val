/**
 * ============================================================================
 * HOOK: useOrdens
 * ============================================================================
 * 
 * Hook React para gerenciar ordens de produção usando Firebase.
 * 
 * Funcionalidades:
 * - Carregar lista de ordens
 * - Criar OP de orçamento
 * - Atualizar ordem
 * - Deletar ordem
 * - Iniciar/Pausar/Retomar/Concluir produção
 * - Cancelar ordem
 * - Filtrar por status e cliente
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { ordensService } from '@/services/firestore/ordens.service';
import { orcamentosService } from '@/services/firestore/orcamentos.service';
import { estoqueItensService } from '@/services/firestore/estoque.service';
import { httpClient, type PaginatedResponse } from '@/services/http/client';
import type { OrdemProducao, StatusOrdem, ItemMaterial } from '@/app/types/workflow';
import { toast } from 'sonner';

type ServiceResult<T> = { success: boolean; data?: T; error?: string };

interface UseOrdensOptions {
  autoLoad?: boolean;
  status?: StatusOrdem;
  clienteId?: string;
}

export function useOrdens(options: UseOrdensOptions = {}) {
  const { autoLoad = true, status, clienteId } = options;
  const isMock = import.meta.env.VITE_USE_MOCK === 'true';
  
  const [ordens, setOrdens] = useState<OrdemProducao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar ordens
  const normalizeOrdem = (ordem: OrdemProducao): OrdemProducao => {
    const toDate = (value: any) => {
      if (!value) return value;
      if (value instanceof Date) return value;
      if (typeof value === 'string') return new Date(value);
      if (value?.toDate) return value.toDate();
      return value;
    };

    return {
      ...ordem,
      dataAbertura: toDate(ordem.dataAbertura),
      dataPrevisao: toDate(ordem.dataPrevisao),
      dataConclusao: toDate(ordem.dataConclusao),
      createdAt: toDate(ordem.createdAt),
      updatedAt: toDate(ordem.updatedAt),
    } as OrdemProducao;
  };

  const loadOrdens = async () => {
    try {
      setLoading(true);
      setError(null);

      const where = [] as { field: string; operator: any; value: any }[];
      if (clienteId) where.push({ field: 'clienteId', operator: '==', value: clienteId });
      if (status) where.push({ field: 'status', operator: '==', value: status });

      if (isMock) {
        const response = await httpClient.get<PaginatedResponse<OrdemProducao>>('/api/ordens-producao', {
          params: {
            page: 1,
            pageSize: 1000,
            ...(status ? { status } : {}),
            ...(clienteId ? { clienteId } : {}),
          },
        });
        setOrdens(response.items.map(normalizeOrdem));
        return;
      }

      const listResult = await ordensService.list({
        where,
        orderBy: [{ field: 'dataAbertura', direction: 'desc' }],
      });

      if (listResult.success && listResult.data) {
        setOrdens(listResult.data.items.map(normalizeOrdem));
      } else {
        setError(listResult.error || 'Erro ao carregar ordens');
        toast.error(listResult.error || 'Erro ao carregar ordens');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Criar OP de orçamento
  const createOrdemDeOrcamento = async (
    orcamentoId: string
  ): Promise<ServiceResult<OrdemProducao>> => {
    try {
      setLoading(true);

      if (isMock) {
        const orcamento = await httpClient.get<any>(`/api/orcamentos/${orcamentoId}`);
        if (!orcamento) {
          return { success: false, error: 'OrÇõamento nÇœo encontrado' };
        }

        if (orcamento.status !== 'Aprovado') {
          return { success: false, error: 'Apenas orÇõamentos aprovados podem gerar OP' };
        }

        const numero = `OP-${Date.now()}`;
        const novaOrdem: OrdemProducao = {
          id: `op_${Date.now()}`,
          numero,
          orcamentoId: orcamento.id,
          clienteId: orcamento.clienteId,
          clienteNome: orcamento.clienteNome,
          dataAbertura: new Date(),
          dataPrevisao: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'Pendente',
          itens: orcamento.itens.map((item: any) => ({
            id: item.id,
            produtoId: item.modeloId,
            produtoNome: item.descricao,
            quantidade: item.quantidade,
            unidade: 'un',
            precoUnitario: item.precoUnitario,
            subtotal: item.subtotal,
          })),
          total: orcamento.total,
          prioridade: 'Normal',
          observacoes: `Convertido do orÇõamento ${orcamento.numero}`,
          materiaisReservados: false,
          materiaisConsumidos: false,
        };

        const created = await httpClient.post<OrdemProducao>('/api/ordens-producao', novaOrdem);
        setOrdens((prev) => [normalizeOrdem(created), ...prev]);
        await httpClient.put(`/api/orcamentos/${orcamentoId}`, {
          ...orcamento,
          status: 'Convertido',
          ordemId: created.id,
        });
        toast.success(`OP ${created.numero} criada com sucesso!`);
        return { success: true, data: created } as ServiceResult<OrdemProducao>;
      }

      const orcamentoResult = await orcamentosService.getById(orcamentoId);
      if (!orcamentoResult.success || !orcamentoResult.data) {
        return { success: false, error: orcamentoResult.error || 'Orçamento não encontrado' };
      }

      const orcamento = orcamentoResult.data;
      if (orcamento.status !== 'Aprovado') {
        return { success: false, error: 'Apenas orçamentos aprovados podem gerar OP' };
      }

      const numero = `OP-${Date.now()}`;
      const novaOrdem: OrdemProducao = {
        id: '',
        numero,
        orcamentoId: orcamento.id,
        clienteId: orcamento.clienteId,
        clienteNome: orcamento.clienteNome,
        dataAbertura: new Date(),
        dataPrevisao: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'Pendente',
        itens: orcamento.itens.map((item) => ({
          id: item.id,
          produtoId: item.modeloId,
          produtoNome: item.descricao,
          quantidade: item.quantidade,
          unidade: 'un',
          precoUnitario: item.precoUnitario,
          subtotal: item.subtotal,
        })),
        total: orcamento.total,
        prioridade: 'Normal',
        observacoes: `Convertido do orçamento ${orcamento.numero}`,
        materiaisReservados: false,
        materiaisConsumidos: false,
      };

      const result = await ordensService.create(novaOrdem as OrdemProducao);
      if (result.success && result.data) {
        setOrdens((prev) => [normalizeOrdem(result.data!), ...prev]);
        await orcamentosService.update(orcamentoId, {
          status: 'Convertido',
          ordemId: result.data.id,
        } as Partial<any>);
        toast.success(`OP ${result.data.numero} criada com sucesso!`);
      } else {
        toast.error(result.error || 'Erro ao criar ordem de produção');
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

  // Atualizar ordem
  const updateOrdem = async (
    id: string,
    updates: Partial<Omit<OrdemProducao, 'id' | 'empresaId' | 'createdAt'>>
  ): Promise<ServiceResult<OrdemProducao>> => {
    try {
      setLoading(true);

      if (isMock) {
        const updated = await httpClient.put<OrdemProducao>(`/api/ordens-producao/${id}`, updates as OrdemProducao);
        setOrdens((prev) =>
          prev.map((o) => (o.id === id ? normalizeOrdem(updated) : o))
        );
        toast.success('Ordem atualizada com sucesso!');
        return { success: true, data: updated } as ServiceResult<OrdemProducao>;
      }

      const result = await ordensService.update(id, updates as OrdemProducao);

      if (result.success && result.data) {
        setOrdens((prev) =>
          prev.map((o) => (o.id === id ? normalizeOrdem(result.data!) : o))
        );
        toast.success('Ordem atualizada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao atualizar ordem');
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

  // Deletar ordem
  const deleteOrdem = async (id: string): Promise<ServiceResult<void>> => {
    try {
      setLoading(true);

      if (isMock) {
        await httpClient.delete<void>(`/api/ordens-producao/${id}`);
        setOrdens((prev) => prev.filter((o) => o.id !== id));
        toast.success('Ordem removida com sucesso!');
        return { success: true } as ServiceResult<void>;
      }

      const result = await ordensService.remove(id);

      if (result.success) {
        setOrdens((prev) => prev.filter((o) => o.id !== id));
        toast.success('Ordem removida com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao remover ordem');
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

  // Iniciar produção
  const iniciarProducao = async (id: string, operadorNome: string): Promise<ServiceResult<OrdemProducao>> => {
    return updateOrdem(id, {
      status: 'Em Produção',
      apontamento: {
        operadorId: operadorNome,
        operadorNome,
        dataInicio: new Date(),
        pausas: [],
        tempoDecorridoMs: 0,
      },
      materiaisReservados: true,
      materiaisConsumidos: true,
    });
  };

  // Pausar produção
  const pausarProducao = async (id: string, motivo?: string): Promise<ServiceResult<OrdemProducao>> => {
    return updateOrdem(id, { status: 'Pausada', observacoes: motivo });
  };

  // Retomar produção
  const retomarProducao = async (id: string): Promise<ServiceResult<OrdemProducao>> => {
    return updateOrdem(id, { status: 'Em Produção' });
  };

  // Concluir produção
  const concluirProducao = async (id: string): Promise<ServiceResult<OrdemProducao>> => {
    return updateOrdem(id, { status: 'Concluída', dataConclusao: new Date() });
  };

  // Cancelar ordem
  const cancelarOrdem = async (id: string, motivo?: string): Promise<ServiceResult<OrdemProducao>> => {
    return updateOrdem(id, { status: 'Cancelada', observacoes: motivo });
  };

  // Buscar por ID
  const getOrdemById = async (id: string): Promise<OrdemProducao | null> => {
    try {
      setLoading(true);
      if (isMock) {
        const data = await httpClient.get<OrdemProducao>(`/api/ordens-producao/${id}`);
        return normalizeOrdem(data);
      }

      const result = await ordensService.getById(id);

      if (result.success && result.data) {
        return normalizeOrdem(result.data);
      }

      return null;
    } catch (err) {
      toast.error('Erro ao buscar ordem');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-load ao montar
  useEffect(() => {
    if (autoLoad) {
      loadOrdens();
    }
  }, [autoLoad, status, clienteId]);

  const verificarNecessidadeCompra = async (ordemId: string): Promise<ItemMaterial[]> => {
    const ordem = ordens.find((o) => o.id === ordemId);
    if (!ordem) return [];

    const faltantes: ItemMaterial[] = [];

    for (const item of ordem.itens) {
      let saldoDisponivel = 0;
      if (isMock) {
        const response = await httpClient.get<PaginatedResponse<any>>('/api/estoque', {
          params: { page: 1, pageSize: 1000, produtoId: item.produtoId },
        });
        const estoqueItem = response.items[0];
        saldoDisponivel = estoqueItem?.saldoDisponivel ?? 0;
      } else {
        const estoqueResult = await estoqueItensService.list({
          where: [{ field: 'produtoId', operator: '==', value: item.produtoId }],
          limit: 1,
        });

        const estoqueItem = estoqueResult.success && estoqueResult.data?.items[0] ? estoqueResult.data.items[0] : null;
        saldoDisponivel = estoqueItem?.saldoDisponivel ?? 0;
      }

      if (saldoDisponivel < item.quantidade) {
        faltantes.push({
          id: item.id,
          produtoId: item.produtoId,
          produtoNome: item.produtoNome,
          quantidade: item.quantidade - saldoDisponivel,
          unidade: item.unidade,
          precoUnitario: item.precoUnitario,
          subtotal: (item.quantidade - saldoDisponivel) * item.precoUnitario,
        });
      }
    }

    return faltantes;
  };

  return {
    ordens,
    loading,
    error,
    loadOrdens,
    createOrdemDeOrcamento,
    updateOrdem,
    deleteOrdem,
    iniciarProducao,
    pausarProducao,
    retomarProducao,
    concluirProducao,
    cancelarOrdem,
    getOrdemById,
    verificarNecessidadeCompra,
  };
}
