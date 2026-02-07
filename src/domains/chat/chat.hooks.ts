/**
 * Domínio: Chat
 * Hooks React Query para gerenciamento de estado
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatService } from '@/services/firestore/chat.service';
import type {
  ChatFilters,
  MensagensFilters,
  CreateConversaDTO,
  SendMessageDTO,
  UpdateStatusDTO,
} from './chat.types';

// Query keys
export const chatKeys = {
  all: ['chat'] as const,
  usuarios: (filters?: ChatFilters) => [...chatKeys.all, 'usuarios', filters] as const,
  usuario: (id: string) => [...chatKeys.all, 'usuario', id] as const,
  conversas: () => [...chatKeys.all, 'conversas'] as const,
  conversa: (id: string) => [...chatKeys.all, 'conversa', id] as const,
  mensagens: (filters: MensagensFilters) =>
    [...chatKeys.all, 'mensagens', filters] as const,
};

// Hooks de Query

/**
 * Obter lista de usuários do chat
 */
export function useChatUsuarios(filters?: ChatFilters) {
  return useQuery({
    queryKey: chatKeys.usuarios(filters),
    queryFn: () => chatService.getUsuarios(filters),
  });
}

/**
 * Obter usuário específico
 */
export function useChatUsuario(id: string) {
  return useQuery({
    queryKey: chatKeys.usuario(id),
    queryFn: () => chatService.getUsuario(id),
    enabled: !!id,
  });
}

/**
 * Obter conversas do usuário
 */
export function useConversas() {
  return useQuery({
    queryKey: chatKeys.conversas(),
    queryFn: () => chatService.getConversas(),
    // Refetch a cada 10 segundos para simular tempo real
    refetchInterval: 10000,
  });
}

/**
 * Obter conversa específica
 */
export function useConversa(id: string) {
  return useQuery({
    queryKey: chatKeys.conversa(id),
    queryFn: () => chatService.getConversa(id),
    enabled: !!id,
  });
}

/**
 * Obter mensagens de uma conversa
 */
export function useMensagens(filters: MensagensFilters) {
  return useQuery({
    queryKey: chatKeys.mensagens(filters),
    queryFn: () => chatService.getMensagens(filters),
    enabled: !!filters.conversaId,
    // Refetch a cada 5 segundos para simular tempo real
    refetchInterval: 5000,
  });
}

// Hooks de Mutation

/**
 * Atualizar status do usuário
 */
export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStatusDTO) => chatService.updateStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });
}

/**
 * Criar nova conversa
 */
export function useCreateConversa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversaDTO) => chatService.createConversa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversas() });
      toast.success('Conversa iniciada');
    },
    onError: () => {
      toast.error('Erro ao criar conversa');
    },
  });
}

/**
 * Deletar conversa
 */
export function useDeleteConversa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chatService.deleteConversa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversas() });
      toast.success('Conversa excluída');
    },
    onError: () => {
      toast.error('Erro ao excluir conversa');
    },
  });
}

/**
 * Enviar mensagem
 */
export function useSendMensagem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageDTO) => chatService.sendMensagem(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.mensagens({ conversaId: variables.conversaId }),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversas() });
    },
    onError: () => {
      toast.error('Erro ao enviar mensagem');
    },
  });
}

/**
 * Marcar mensagem como lida
 */
export function useMarcarMensagemLida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mensagemId: string) => chatService.marcarComoLida(mensagemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

/**
 * Marcar todas as mensagens de uma conversa como lidas
 */
export function useMarcarTodasLidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversaId: string) => chatService.marcarTodasComoLidas(conversaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}
