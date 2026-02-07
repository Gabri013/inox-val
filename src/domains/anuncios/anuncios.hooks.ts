/**
 * Domínio: Anúncios
 * Hooks React Query para gerenciamento de estado
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { anunciosService } from '@/services/firestore/anuncios.service';
import type {
  AnunciosFilters,
  CreateAnuncioDTO,
  UpdateAnuncioDTO,
} from './anuncios.types';

// Query keys
export const anunciosKeys = {
  all: ['anuncios'] as const,
  list: (filters?: AnunciosFilters) => [...anunciosKeys.all, 'list', filters] as const,
  detail: (id: string) => [...anunciosKeys.all, 'detail', id] as const,
  ativos: () => [...anunciosKeys.all, 'ativos'] as const,
  leituras: (id: string) => [...anunciosKeys.all, 'leituras', id] as const,
};

// Hooks de Query

/**
 * Obter lista de anúncios com filtros
 */
export function useAnuncios(filters?: AnunciosFilters) {
  return useQuery({
    queryKey: anunciosKeys.list(filters),
    queryFn: () => anunciosService.getAnuncios(filters),
  });
}

/**
 * Obter anúncio específico
 */
export function useAnuncio(id: string) {
  return useQuery({
    queryKey: anunciosKeys.detail(id),
    queryFn: () => anunciosService.getAnuncio(id),
    enabled: !!id,
  });
}

/**
 * Obter anúncios ativos para o usuário atual
 */
export function useAnunciosAtivos() {
  return useQuery({
    queryKey: anunciosKeys.ativos(),
    queryFn: () => anunciosService.getAnunciosAtivos(),
    // Refetch a cada 30 segundos para verificar novos anúncios
    refetchInterval: 30000,
  });
}

/**
 * Obter leituras de um anúncio (admin)
 */
export function useAnuncioLeituras(id: string) {
  return useQuery({
    queryKey: anunciosKeys.leituras(id),
    queryFn: () => anunciosService.getLeituras(id),
    enabled: !!id,
  });
}

// Hooks de Mutation

/**
 * Criar novo anúncio
 */
export function useCreateAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnuncioDTO) => anunciosService.createAnuncio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anunciosKeys.all });
      toast.success('Anúncio criado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao criar anúncio');
    },
  });
}

/**
 * Atualizar anúncio
 */
export function useUpdateAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnuncioDTO }) =>
      anunciosService.updateAnuncio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anunciosKeys.all });
      toast.success('Anúncio atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar anúncio');
    },
  });
}

/**
 * Deletar anúncio
 */
export function useDeleteAnuncio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => anunciosService.deleteAnuncio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anunciosKeys.all });
      toast.success('Anúncio excluído com sucesso');
    },
    onError: () => {
      toast.error('Erro ao excluir anúncio');
    },
  });
}

/**
 * Marcar anúncio como lido
 */
export function useMarcarAnuncioLido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (anuncioId: string) => anunciosService.marcarComoLido(anuncioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anunciosKeys.ativos() });
    },
  });
}
