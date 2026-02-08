/**
 * Anuncios Mock
 * Implementação mock do serviço de anúncios usando IndexedDB
 */

import { mockClient } from '@/services/http/mockClient';
import { anunciosSeed, anunciosLeiturasSeed } from './anuncios.seed';
import type {
  Anuncio,
  AnuncioLeitura,
  CreateAnuncioDTO,
  UpdateAnuncioDTO,
} from './anuncios.types';

const DB_STORES = {
  ANUNCIOS: 'anuncios',
  LEITURAS: 'anunciosLeituras',
};

export async function initAnunciosMock() {
  // Inicializar dados seed
  await mockClient.setAll(DB_STORES.ANUNCIOS, anunciosSeed);
  await mockClient.setAll(DB_STORES.LEITURAS, anunciosLeiturasSeed);

  // GET /anuncios - Listar anúncios com filtros
  mockClient.onGet('/anuncios', async (url: any) => {
    const anuncios = await mockClient.getAll<Anuncio>(DB_STORES.ANUNCIOS);
    const params = new URL(url, 'http://localhost').searchParams;
    
    let filtered = anuncios;
    
    // Filtro de tipo
    const tipo = params.get('tipo');
    if (tipo) {
      filtered = filtered.filter((a) => a.tipo === tipo);
    }
    
    // Filtro de status
    const status = params.get('status');
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }
    
    // Filtro de data
    const dataInicio = params.get('dataInicio');
    const dataFim = params.get('dataFim');
    if (dataInicio) {
      filtered = filtered.filter(
        (a) => new Date(a.criadoEm) >= new Date(dataInicio)
      );
    }
    if (dataFim) {
      filtered = filtered.filter(
        (a) => new Date(a.criadoEm) <= new Date(dataFim)
      );
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    filtered.sort(
      (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    );
    
    return filtered;
  });

  // GET /anuncios/ativos - Anúncios ativos para o usuário
  mockClient.onGet('/anuncios/ativos', async () => {
    const anuncios = await mockClient.getAll<Anuncio>(DB_STORES.ANUNCIOS);
    const leituras = await mockClient.getAll<AnuncioLeitura>(DB_STORES.LEITURAS);
    
    // Assumir usuário logado (usr_001 - Admin)
    const currentUserId = 'usr_001';
    const currentUser = {
      id: currentUserId,
      role: 'Admin',
      departamento: 'TI',
    };
    
    const now = new Date();
    
    // Filtrar anúncios ativos
    let filtered = anuncios.filter((anuncio) => {
      // Status deve ser ativo
      if (anuncio.status !== 'ativo') return false;
      
      // Verificar datas de início e fim
      if (anuncio.dataInicio && new Date(anuncio.dataInicio) > now) return false;
      if (anuncio.dataFim && new Date(anuncio.dataFim) < now) return false;
      
      // Verificar destinatários
      if (anuncio.destinatarios === 'todos') return true;
      if (anuncio.destinatarios === 'role' && anuncio.roleAlvo === currentUser.role) {
        return true;
      }
      if (
        anuncio.destinatarios === 'departamento' &&
        anuncio.departamentoAlvo === currentUser.departamento
      ) {
        return true;
      }
      
      return false;
    });
    
    // Filtrar apenas não lidos
    const leitosIds = leituras
      .filter((l) => l.usuarioId === currentUserId)
      .map((l) => l.anuncioId);
    
    filtered = filtered.filter((a) => !leitosIds.includes(a.id));
    
    // Ordenar por prioridade e data
    const prioridades = { urgente: 0, alerta: 1, manutencao: 2, info: 3 };
    filtered.sort((a, b) => {
      if (prioridades[a.tipo] !== prioridades[b.tipo]) {
        return prioridades[a.tipo] - prioridades[b.tipo];
      }
      return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
    });
    
    return filtered;
  });

  // GET /anuncios/:id - Obter anúncio específico
  mockClient.onGet('/anuncios/*', async (url) => {
    const id = url.split('/').pop();
    if (!id || id === 'ativos') return;
    
    const anuncio = await mockClient.getById<Anuncio>(DB_STORES.ANUNCIOS, id);
    if (!anuncio) throw new Error('Anúncio não encontrado');
    
    return anuncio;
  });

  // POST /anuncios - Criar novo anúncio
  mockClient.onPost('/anuncios', async (_url: any, body) => {
    const data = body as CreateAnuncioDTO;
    
    // Assumir usuário logado
    const currentUser = {
      id: 'usr_001',
      nome: 'Admin Sistema',
    };
    
    const novoAnuncio: Anuncio = {
      id: `anc_${Date.now()}`,
      ...data,
      status: 'ativo',
      autorId: currentUser.id,
      autorNome: currentUser.nome,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    
    await mockClient.create(DB_STORES.ANUNCIOS, novoAnuncio);
    return novoAnuncio;
  });

  // PUT /anuncios/:id - Atualizar anúncio
  mockClient.onPut('/anuncios/*', async (url: any, body) => {
    const id = url.split('/').pop();
    if (!id) throw new Error('ID não fornecido');
    
    const data = body as UpdateAnuncioDTO;
    const anuncio = await mockClient.getById<Anuncio>(DB_STORES.ANUNCIOS, id);
    
    if (!anuncio) throw new Error('Anúncio não encontrado');
    
    const updated: Anuncio = {
      ...anuncio,
      ...data,
      atualizadoEm: new Date().toISOString(),
    };
    
    await mockClient.update(DB_STORES.ANUNCIOS, id, updated);
    return updated;
  });

  // DELETE /anuncios/:id - Deletar anúncio
  mockClient.onDelete('/anuncios/*', async (url: any) => {
    const id = url.split('/').pop();
    if (!id) throw new Error('ID não fornecido');
    
    await mockClient.deleteById(DB_STORES.ANUNCIOS, id);
    
    // Deletar também as leituras
    const leituras = await mockClient.getAll<AnuncioLeitura>(DB_STORES.LEITURAS);
    const leiturasAnuncio = leituras.filter((l) => l.anuncioId === id);
    
    for (const leitura of leiturasAnuncio) {
      await mockClient.deleteById(DB_STORES.LEITURAS, leitura.id);
    }
  });

  // POST /anuncios/:id/marcar-lido - Marcar como lido
  mockClient.onPost(
    '/anuncios/*/marcar-lido',
    async (url: any) => {
      const anuncioId = url.split('/').slice(-2)[0];
      if (!anuncioId) throw new Error('ID não fornecido');
      
      const currentUserId = 'usr_001';
      
      // Verificar se já foi lido
      const leituras = await mockClient.getAll<AnuncioLeitura>(DB_STORES.LEITURAS);
      const jaLido = leituras.find(
        (l) => l.anuncioId === anuncioId && l.usuarioId === currentUserId
      );
      
      if (jaLido) return;
      
      const novaLeitura: AnuncioLeitura = {
        id: `leit_${Date.now()}`,
        anuncioId,
        usuarioId: currentUserId,
        lidoEm: new Date().toISOString(),
      };
      
      await mockClient.create(DB_STORES.LEITURAS, novaLeitura);
    }
  );

  // GET /anuncios/:id/leituras - Obter leituras (admin)
  mockClient.onGet(
    '/anuncios/*/leituras',
    async (url: any) => {
      const anuncioId = url.split('/').slice(-2)[0];
      if (!anuncioId) throw new Error('ID não fornecido');
      
      const leituras = await mockClient.getAll<AnuncioLeitura>(DB_STORES.LEITURAS);
      return leituras.filter((l) => l.anuncioId === anuncioId);
    }
  );
}
