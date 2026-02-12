/**
 * Domínio: Chat
 * Tipos e interfaces para sistema de chat interno
 */

export type UserStatus = 'online' | 'ausente' | 'offline';

export type MessageType = 'text' | 'file' | 'image';

export interface ChatUser {
  id: string;
  nome: string;
  email: string;
  departamento: string;
  avatar?: string;
  status: UserStatus;
  ultimaAtividade: string;
}

export interface ChatMessage {
  id: string;
  conversaId: string;
  remetenteId: string;
  conteudo: string;
  tipo: MessageType;
  anexoUrl?: string;
  anexoNome?: string;
  lida: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Conversa {
  id: string;
  participantes: string[]; // IDs dos usuários
  ultimaMensagem?: ChatMessage;
  mensagensNaoLidas: number;
  empresaId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ConversaDetalhada extends Conversa {
  participantesDetalhes: ChatUser[];
}

// Filtros
export interface ChatFilters {
  search?: string;
  status?: UserStatus;
  departamento?: string;
}

export interface MensagensFilters {
  conversaId: string;
  limit?: number;
  offset?: number;
}

// DTOs
export interface CreateConversaDTO {
  participanteId: string; // ID do outro usuário
}

export interface SendMessageDTO {
  conversaId: string;
  conteudo: string;
  tipo?: MessageType;
  anexo?: File;
  anexoUrl?: string;
  anexoNome?: string;
}

export interface UpdateStatusDTO {
  status: UserStatus;
}

// Labels
export const statusLabels: Record<UserStatus, string> = {
  online: 'Online',
  ausente: 'Ausente',
  offline: 'Offline',
};

export const statusColors: Record<UserStatus, string> = {
  online: 'bg-green-500',
  ausente: 'bg-yellow-500',
  offline: 'bg-gray-400',
};
