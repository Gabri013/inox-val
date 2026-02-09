/**
 * Hooks React Query para Estoque
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { estoqueService } from './estoque.service';
import type { ID } from '@/shared/types/ids';
import type { EstoqueFilters } from './estoque.types';
import { PaginationParams } from '@/services/http/client';

const QUERY_KEY = 'estoque';

/**
 * Hook para listar movimentos
 */
export function useMovimentos(params: PaginationParams & EstoqueFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'movimentos', params],
    queryFn: () => estoqueService.listMovimentos(params),
  });
}

/**
 * Hook para listar saldos de estoque
 */
export function useSaldosEstoque() {
  return useQuery({
    queryKey: [QUERY_KEY, 'saldos'],
    queryFn: () => estoqueService.listSaldos(),
  });
}

/**
 * Hook para buscar saldo de um produto
 */
export function useSaldoProduto(produtoId: ID | null) {
  return useQuery({
    queryKey: [QUERY_KEY, 'saldo', produtoId],
    queryFn: () => estoqueService.getSaldo(produtoId!),
    enabled: !!produtoId,
  });
}

/**
 * Hook para estatísticas de estoque
 */
export function useEstoqueStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => estoqueService.getStats(),
  });
}

/**
 * Hook para entrada de material
 */
export function useEntrada() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      produtoId: ID;
      quantidade: number;
      origem: string;
      usuario: string;
      observacoes?: string;
      meta?: {
        quantidadeLancada?: number;
        unidadeLancada?: string;
        fatorConversao?: number;
        unidadeBase?: string;
      };
    }) => estoqueService.entrada(
      params.produtoId,
      params.quantidade,
      params.origem,
      params.usuario,
      params.observacoes,
      params.meta
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Entrada registrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar entrada: ${error.message}`);
    },
  });
}

/**
 * Hook para saída de material
 */
export function useSaida() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      produtoId: ID;
      quantidade: number;
      origem: string;
      usuario: string;
      observacoes?: string;
      meta?: {
        quantidadeLancada?: number;
        unidadeLancada?: string;
        fatorConversao?: number;
        unidadeBase?: string;
      };
    }) => estoqueService.saida(
      params.produtoId,
      params.quantidade,
      params.origem,
      params.usuario,
      params.observacoes,
      params.meta
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Saída registrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar saída: ${error.message}`);
    },
  });
}

/**
 * Hook para reserva de material
 */
export function useReserva() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      produtoId: ID;
      quantidade: number;
      origem: string;
      usuario: string;
      observacoes?: string;
      meta?: {
        quantidadeLancada?: number;
        unidadeLancada?: string;
        fatorConversao?: number;
        unidadeBase?: string;
      };
    }) => estoqueService.reserva(
      params.produtoId,
      params.quantidade,
      params.origem,
      params.usuario,
      params.observacoes,
      params.meta
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Reserva realizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao realizar reserva: ${error.message}`);
    },
  });
}

/**
 * Hook para estorno de movimento
 */
export function useEstorno() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      movimentoId: ID;
      usuario: string;
      observacoes?: string;
    }) => estoqueService.estorno(
      params.movimentoId,
      params.usuario,
      params.observacoes
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Estorno realizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao realizar estorno: ${error.message}`);
    },
  });
}

/**
 * Hook para ajuste de estoque
 */
export function useAjuste() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      produtoId: ID;
      quantidade: number;
      origem: string;
      usuario: string;
      observacoes?: string;
      meta?: {
        quantidadeLancada?: number;
        unidadeLancada?: string;
        fatorConversao?: number;
        unidadeBase?: string;
      };
    }) => estoqueService.ajuste(
      params.produtoId,
      params.quantidade,
      params.origem,
      params.usuario,
      params.observacoes,
      params.meta
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Ajuste registrado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar ajuste: ${error.message}`);
    },
  });
}
