/**
 * Hooks React Query para Produção
 * Fonte oficial: itens em subcoleções via collectionGroup('itens')
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getEmpresaId } from '@/services/firestore/base';
import type { SetorProducao, StatusProducaoItem } from './producao.types';
import { producaoItensService } from './services/producao-itens.service';

const QUERY_KEY = 'producao';

export function useItensSetor(setor: SetorProducao | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'setor', setor],
    queryFn: async () => {
      const empresaId = await getEmpresaId();
      return producaoItensService.getItensPorSetor(empresaId, setor!);
    },
    enabled: !!setor,
    refetchInterval: 10000,
  });
}

export function useMoverItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      orderId: string;
      itemId: string;
      novoSetor: SetorProducao;
      setorAnterior?: SetorProducao | null;
      operadorId?: string;
      operadorNome?: string;
      observacoes?: string;
    }) => {
      await producaoItensService.moverItemDeSetor(input.orderId, input.itemId, input.novoSetor, {
        setorOrigem: input.setorAnterior ?? null,
        setorDestino: input.novoSetor,
        operadorId: input.operadorId,
        operadorNome: input.operadorNome,
        observacoes: input.observacoes,
      });
    },
    onSuccess: (_data, variables) => {
      if (variables.setorAnterior) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'setor', variables.setorAnterior] });
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'setor', variables.novoSetor] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'setor'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao mover item: ${error.message}`);
    },
  });
}

export function useAtualizarStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      orderId: string;
      itemId: string;
      status: StatusProducaoItem;
      operadorId?: string;
      operadorNome?: string;
      observacoes?: string;
    }) => {
      await producaoItensService.atualizarStatusItem(input.orderId, input.itemId, input.status, {
        operadorId: input.operadorId,
        operadorNome: input.operadorNome,
        observacoes: input.observacoes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'setor'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });
}

