/**
 * Hooks: Configurações do Vendedor
 * React Query hooks para gerenciar configurações
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendedorService } from './vendedor.service';
import { useAuth } from '@/contexts/AuthContext';
import type { CreateConfiguracaoVendedorDTO, UpdateConfiguracaoVendedorDTO } from './vendedor.types';

const QUERY_KEY = 'configuracao-vendedor';

/**
 * Hook para buscar configuração do vendedor logado
 */
export function useMinhaConfiguracao() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, 'minha'],
    queryFn: () => vendedorService.getMinhaConfiguracao(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para criar configuração inicial
 */
export function useCreateConfiguracao() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (data?: Partial<CreateConfiguracaoVendedorDTO>) => {
      if (!user) throw new Error('Usuário não autenticado');
      if (!profile) throw new Error('Perfil do usuario nao carregado');
      
      // Se não passar dados, cria configuração padrão
      if (!data) {
        return vendedorService.criarConfiguracaoPadrao(profile.id, profile.nome || user.email || 'Vendedor');
      }
      
      return vendedorService.create({
        usuarioId: profile.id,
        nomeVendedor: profile.nome || user.email || 'Vendedor',
        ...data,
      } as CreateConfiguracaoVendedorDTO);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para atualizar configuração
 */
export function useUpdateConfiguracao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConfiguracaoVendedorDTO }) =>
      vendedorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para atualizar preços de materiais
 */
export function useUpdatePrecosMateriais() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      precos 
    }: { 
      id: string; 
      precos: Parameters<typeof vendedorService.updatePrecosMateriais>[1] 
    }) => vendedorService.updatePrecosMateriais(id, precos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para atualizar margem de lucro
 */
export function useUpdateMargemLucro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, margem }: { id: string; margem: number }) =>
      vendedorService.updateMargemLucro(id, margem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para garantir que o vendedor tenha configuração
 * Se não tiver, cria automaticamente
 */
export function useEnsureConfiguracao() {
  const { data: config, isLoading } = useMinhaConfiguracao();
  const { mutateAsync: createConfig } = useCreateConfiguracao();
  const { user } = useAuth();

  const ensureConfig = async () => {
    if (!config && user) {
      return await createConfig({});
    }
    return config;
  };

  return {
    config,
    isLoading,
    ensureConfig,
  };
}
