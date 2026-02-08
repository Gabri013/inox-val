/**
 * Chat Mock
 * Implementação mock do serviço de chat usando IndexedDB
 */

import { mockClient } from '@/services/http/mockClient';
import { chatUsersSeed, conversasSeed, mensagensSeed } from './chat.seed';
import type {
  ChatUser,
  ChatMessage,
  Conversa,
  ConversaDetalhada,
  CreateConversaDTO,
  SendMessageDTO,
  UpdateStatusDTO,
} from './chat.types';

const DB_STORES = {
  CHAT_USERS: 'chatUsers',
  CONVERSAS: 'conversas',
  MENSAGENS: 'mensagens',
};

export async function initChatMock() {
  // Inicializar dados seed
  await mockClient.setAll(DB_STORES.CHAT_USERS, chatUsersSeed);
  await mockClient.setAll(DB_STORES.CONVERSAS, conversasSeed);
  await mockClient.setAll(DB_STORES.MENSAGENS, mensagensSeed);

  // GET /chat/usuarios - Listar usuários do chat
  mockClient.onGet('/chat/usuarios', async (url: any) => {
    const users = await mockClient.getAll<ChatUser>(DB_STORES.CHAT_USERS);
    const params = new URL(url, 'http://localhost').searchParams;
    
    let filtered = users;
    
    // Filtro de busca
    const search = params.get('search');
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nome.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          u.departamento.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro de status
    const status = params.get('status');
    if (status) {
      filtered = filtered.filter((u) => u.status === status);
    }
    
    // Filtro de departamento
    const departamento = params.get('departamento');
    if (departamento) {
      filtered = filtered.filter((u) => u.departamento === departamento);
    }
    
    return filtered;
  });

  // GET /chat/usuarios/:id - Obter usuário específico
  mockClient.onGet(/\/chat\/usuarios\/([^/]+)$/, async (_url: any, matches) => {
    const id = matches?.[1];
    if (!id) throw new Error('ID não fornecido');
    
    const user = await mockClient.getById<ChatUser>(DB_STORES.CHAT_USERS, id);
    if (!user) throw new Error('Usuário não encontrado');
    
    return user;
  });

  // PUT /chat/status - Atualizar status do usuário atual
  mockClient.onPut('/chat/status', async (_url: any, body) => {
    const data = body as UpdateStatusDTO;
    
    // Assumir que é o usuário logado (usr_001 - Admin)
    const userId = 'usr_001';
    const user = await mockClient.getById<ChatUser>(DB_STORES.CHAT_USERS, userId);
    
    if (!user) throw new Error('Usuário não encontrado');
    
    const updated: ChatUser = {
      ...user,
      status: data.status,
      ultimaAtividade: new Date().toISOString(),
    };
    
    await mockClient.update(DB_STORES.CHAT_USERS, userId, updated);
    return updated;
  });

  // GET /chat/conversas - Listar conversas do usuário
  mockClient.onGet('/chat/conversas', async () => {
    const conversas = await mockClient.getAll<Conversa>(DB_STORES.CONVERSAS);
    const users = await mockClient.getAll<ChatUser>(DB_STORES.CHAT_USERS);
    const mensagens = await mockClient.getAll<ChatMessage>(DB_STORES.MENSAGENS);
    
    // Assumir usuário logado
    const currentUserId = 'usr_001';
    
    // Filtrar conversas do usuário atual
    const userConversas = conversas.filter((c) =>
      c.participantes.includes(currentUserId)
    );
    
    // Enriquecer com detalhes
    const detalhadas: ConversaDetalhada[] = userConversas.map((conversa) => {
      const participantesDetalhes = conversa.participantes
        .filter((id) => id !== currentUserId)
        .map((id) => users.find((u) => u.id === id))
        .filter(Boolean) as ChatUser[];
      
      const conversaMensagens = mensagens
        .filter((m) => m.conversaId === conversa.id)
        .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
      
      const ultimaMensagem = conversaMensagens[0];
      
      const naoLidas = conversaMensagens.filter(
        (m) => !m.lida && m.remetenteId !== currentUserId
      ).length;
      
      return {
        ...conversa,
        participantesDetalhes,
        ultimaMensagem,
        mensagensNaoLidas: naoLidas,
      };
    });
    
    // Ordenar por última mensagem
    detalhadas.sort(
      (a, b) =>
        new Date(b.ultimaMensagem?.criadoEm || b.criadoEm).getTime() -
        new Date(a.ultimaMensagem?.criadoEm || a.criadoEm).getTime()
    );
    
    return detalhadas;
  });

  // GET /chat/conversas/:id - Obter conversa específica
  mockClient.onGet(/\/chat\/conversas\/([^/]+)$/, async (_url: any, matches) => {
    const id = matches?.[1];
    if (!id) throw new Error('ID não fornecido');
    
    const conversa = await mockClient.getById<Conversa>(DB_STORES.CONVERSAS, id);
    if (!conversa) throw new Error('Conversa não encontrada');
    
    const users = await mockClient.getAll<ChatUser>(DB_STORES.CHAT_USERS);
    const currentUserId = 'usr_001';
    
    const participantesDetalhes = conversa.participantes
      .filter((userId) => userId !== currentUserId)
      .map((userId) => users.find((u) => u.id === userId))
      .filter(Boolean) as ChatUser[];
    
    return {
      ...conversa,
      participantesDetalhes,
    } as ConversaDetalhada;
  });

  // POST /chat/conversas - Criar nova conversa
  mockClient.onPost('/chat/conversas', async (_url: any, body) => {
    const data = body as CreateConversaDTO;
    const currentUserId = 'usr_001';
    
    // Verificar se já existe conversa entre os usuários
    const conversas = await mockClient.getAll<Conversa>(DB_STORES.CONVERSAS);
    const existente = conversas.find(
      (c) =>
        c.participantes.includes(currentUserId) &&
        c.participantes.includes(data.participanteId)
    );
    
    if (existente) {
      return existente;
    }
    
    // Criar nova conversa
    const novaConversa: Conversa = {
      id: `conv_${Date.now()}`,
      participantes: [currentUserId, data.participanteId],
      mensagensNaoLidas: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    
    await mockClient.create(DB_STORES.CONVERSAS, novaConversa);
    return novaConversa;
  });

  // DELETE /chat/conversas/:id - Deletar conversa
  mockClient.onDelete(/\/chat\/conversas\/([^/]+)$/, async (_url: any, matches) => {
    const id = matches?.[1];
    if (!id) throw new Error('ID não fornecido');
    
    await mockClient.deleteById(DB_STORES.CONVERSAS, id);
    
    // Deletar também as mensagens
    const mensagens = await mockClient.getAll<ChatMessage>(DB_STORES.MENSAGENS);
    const mensagensConversa = mensagens.filter((m) => m.conversaId === id);
    
    for (const msg of mensagensConversa) {
      await mockClient.deleteById(DB_STORES.MENSAGENS, msg.id);
    }
  });

  // GET /chat/mensagens - Listar mensagens de uma conversa
  mockClient.onGet('/chat/mensagens', async (url: any) => {
    const params = new URL(url, 'http://localhost').searchParams;
    const conversaId = params.get('conversaId');
    
    if (!conversaId) throw new Error('conversaId é obrigatório');
    
    const mensagens = await mockClient.getAll<ChatMessage>(DB_STORES.MENSAGENS);
    let filtered = mensagens.filter((m) => m.conversaId === conversaId);
    
    // Ordenar por data (mais antigas primeiro para exibição)
    filtered.sort(
      (a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
    );
    
    // Aplicar limit e offset
    const limit = params.get('limit');
    const offset = params.get('offset');
    
    if (offset) {
      filtered = filtered.slice(parseInt(offset));
    }
    
    if (limit) {
      filtered = filtered.slice(0, parseInt(limit));
    }
    
    return filtered;
  });

  // POST /chat/mensagens - Enviar mensagem
  mockClient.onPost('/chat/mensagens', async (_url: any, body) => {
    const data = body as SendMessageDTO;
    const currentUserId = 'usr_001';
    
    const novaMensagem: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversaId: data.conversaId,
      remetenteId: currentUserId,
      conteudo: data.conteudo,
      tipo: data.tipo || 'text',
      lida: false,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    
    await mockClient.create(DB_STORES.MENSAGENS, novaMensagem);
    
    // Atualizar conversa
    const conversa = await mockClient.getById<Conversa>(
      DB_STORES.CONVERSAS,
      data.conversaId
    );
    
    if (conversa) {
      await mockClient.update(DB_STORES.CONVERSAS, data.conversaId, {
        ...conversa,
        atualizadoEm: new Date().toISOString(),
      });
    }
    
    return novaMensagem;
  });

  // PUT /chat/mensagens/:id/lida - Marcar mensagem como lida
  mockClient.onPut(/\/chat\/mensagens\/([^/]+)\/lida$/, async (_url: any, matches) => {
    const id = matches?.[1];
    if (!id) throw new Error('ID não fornecido');
    
    const mensagem = await mockClient.getById<ChatMessage>(DB_STORES.MENSAGENS, id);
    if (!mensagem) throw new Error('Mensagem não encontrada');
    
    await mockClient.update(DB_STORES.MENSAGENS, id, {
      ...mensagem,
      lida: true,
    });
  });

  // PUT /chat/conversas/:id/marcar-lidas - Marcar todas como lidas
  mockClient.onPut(
    /\/chat\/conversas\/([^/]+)\/marcar-lidas$/,
    async (_url: any, matches) => {
      const conversaId = matches?.[1];
      if (!conversaId) throw new Error('ID não fornecido');
      
      const mensagens = await mockClient.getAll<ChatMessage>(DB_STORES.MENSAGENS);
      const mensagensConversa = mensagens.filter((m) => m.conversaId === conversaId);
      
      for (const msg of mensagensConversa) {
        if (!msg.lida) {
          await mockClient.update(DB_STORES.MENSAGENS, msg.id, {
            ...msg,
            lida: true,
          });
        }
      }
    }
  );
}
