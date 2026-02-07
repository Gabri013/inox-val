/**
 * Handler específico para rotas de produção
 * Simula lógica de backend para controle de produção
 */

import { ordensMock, dashboardMock, materiaisMock } from '@/domains/producao';
import type { 
  OrdemProducaoCompleta, 
  OrdemProducaoItem,
  DashboardSetorData,
  ConsultaMaterial,
  SetorProducao,
  MovimentacaoSetor 
} from '@/domains/producao';
import { newId } from '@/shared/types/ids';

// Estado em memória (poderia usar IndexedDB também)
let ordens: OrdemProducaoCompleta[] = [...ordensMock];
let dashboard: DashboardSetorData[] = [...dashboardMock];

/**
 * Roteador de produção
 */
export async function handleProducaoRequest(
  method: string,
  url: string,
  data?: any
): Promise<any> {
  const urlObj = new URL(url, 'http://localhost');
  const pathname = urlObj.pathname;
  const params = Object.fromEntries(urlObj.searchParams);

  // GET /producao/ordens
  if (method === 'GET' && pathname === '/producao/ordens') {
    let filtered = [...ordens];

    if (params.status) {
      filtered = filtered.filter(o => o.status === params.status);
    }
    if (params.prioridade) {
      filtered = filtered.filter(o => o.prioridade === params.prioridade);
    }
    if (params.setor) {
      filtered = filtered.filter(o => 
        o.itens.some(item => item.setorAtual === params.setor)
      );
    }

    return filtered;
  }

  // GET /producao/ordens/:id
  if (method === 'GET' && pathname.startsWith('/producao/ordens/')) {
    const id = pathname.split('/').pop();
    const ordem = ordens.find(o => o.id === id);
    if (!ordem) {
      throw new Error('Ordem não encontrada');
    }
    return ordem;
  }

  // GET /producao/setores/:setor/itens
  if (method === 'GET' && pathname.match(/\/producao\/setores\/[^/]+\/itens/)) {
    const setor = pathname.split('/')[3] as SetorProducao;
    const itens: OrdemProducaoItem[] = [];

    ordens.forEach(ordem => {
      ordem.itens.forEach(item => {
        if (item.setorAtual === setor) {
          itens.push(item);
        }
      });
    });

    return itens;
  }

  // POST /producao/itens/:id/entrada
  if (method === 'POST' && pathname.match(/\/producao\/itens\/[^/]+\/entrada/)) {
    const itemId = pathname.split('/')[3];
    const { setor, observacoes } = data;

    // Encontrar item
    let foundItem: OrdemProducaoItem | null = null;
    let foundOrdem: OrdemProducaoCompleta | null = null;

    for (const ordem of ordens) {
      const item = ordem.itens.find(i => i.id === itemId);
      if (item) {
        foundItem = item;
        foundOrdem = ordem;
        break;
      }
    }

    if (!foundItem) {
      throw new Error('Item não encontrado');
    }

    // Atualizar status
    foundItem.setorAtual = setor;
    foundItem.status = 'Em Producao';
    if (!foundItem.iniciadoEm) {
      foundItem.iniciadoEm = new Date().toISOString();
    }

    // Criar movimentação
    const movimentacao: MovimentacaoSetor = {
      id: newId(),
      ordemItemId: itemId,
      setorOrigem: null,
      setorDestino: setor,
      operadorId: '1',
      operadorNome: 'Operador Mock',
      dataHora: new Date().toISOString(),
      observacoes,
    };

    return movimentacao;
  }

  // POST /producao/itens/:id/saida
  if (method === 'POST' && pathname.match(/\/producao\/itens\/[^/]+\/saida/)) {
    const itemId = pathname.split('/')[3];
    const { observacoes } = data;

    // Encontrar item
    let foundItem: OrdemProducaoItem | null = null;

    for (const ordem of ordens) {
      const item = ordem.itens.find(i => i.id === itemId);
      if (item) {
        foundItem = item;
        break;
      }
    }

    if (!foundItem) {
      throw new Error('Item não encontrado');
    }

    const setorAtual = foundItem.setorAtual;

    // Determinar próximo setor
    const sequenciaSetores: SetorProducao[] = [
      'Corte',
      'Dobra',
      'Solda',
      'Acabamento',
      'Montagem',
      'Qualidade',
      'Expedicao',
    ];

    const indexAtual = setorAtual ? sequenciaSetores.indexOf(setorAtual) : -1;
    const proximoSetor = indexAtual < sequenciaSetores.length - 1 
      ? sequenciaSetores[indexAtual + 1] 
      : null;

    // Atualizar item
    foundItem.progresso = 100;
    
    if (proximoSetor) {
      foundItem.setorAtual = proximoSetor;
      foundItem.status = 'Aguardando';
    } else {
      foundItem.setorAtual = null;
      foundItem.status = 'Concluido';
      foundItem.concluidoEm = new Date().toISOString();
    }

    const movimentacao: MovimentacaoSetor = {
      id: newId(),
      ordemItemId: itemId,
      setorOrigem: setorAtual,
      setorDestino: proximoSetor!,
      operadorId: '1',
      operadorNome: 'Operador Mock',
      dataHora: new Date().toISOString(),
      observacoes,
    };

    return movimentacao;
  }

  // PATCH /producao/itens/:id/progresso
  if (method === 'PATCH' && pathname.match(/\/producao\/itens\/[^/]+\/progresso/)) {
    const itemId = pathname.split('/')[3];
    const { progresso } = data;

    // Encontrar item
    for (const ordem of ordens) {
      const item = ordem.itens.find(i => i.id === itemId);
      if (item) {
        item.progresso = progresso;
        return { success: true };
      }
    }

    throw new Error('Item não encontrado');
  }

  // GET /producao/itens/:id/materiais
  if (method === 'GET' && pathname.match(/\/producao\/itens\/[^/]+\/materiais/)) {
    const itemId = pathname.split('/')[3];

    // Encontrar item
    for (const ordem of ordens) {
      const item = ordem.itens.find(i => i.id === itemId);
      if (item) {
        return item.materiaisNecessarios;
      }
    }

    throw new Error('Item não encontrado');
  }

  // GET /producao/dashboard ou /producao/dashboard/:setor
  if (method === 'GET' && pathname.startsWith('/producao/dashboard')) {
    const parts = pathname.split('/');
    const setor = parts[3] as SetorProducao | undefined;

    if (setor) {
      const data = dashboard.find(d => d.setor === setor);
      return data ? [data] : [];
    }

    return dashboard;
  }

  // GET /producao/itens/buscar?codigo=xxx
  if (method === 'GET' && pathname === '/producao/itens/buscar') {
    const codigo = params.codigo;
    
    for (const ordem of ordens) {
      const item = ordem.itens.find(i => 
        i.produtoCodigo === codigo || i.id === codigo
      );
      if (item) {
        return item;
      }
    }

    throw new Error('Item não encontrado');
  }

  // POST /producao/itens/:id/rejeitar
  if (method === 'POST' && pathname.match(/\/producao\/itens\/[^/]+\/rejeitar/)) {
    const itemId = pathname.split('/')[3];

    for (const ordem of ordens) {
      const item = ordem.itens.find(i => i.id === itemId);
      if (item) {
        item.status = 'Rejeitado';
        return { success: true };
      }
    }

    throw new Error('Item não encontrado');
  }

  // POST /producao/itens/:id/pausar
  if (method === 'POST' && pathname.match(/\/producao\/itens\/[^/]+\/pausar/)) {
    const itemId = pathname.split('/')[3];

    for (const ordem of ordens) {
      const item = ordem.itens.find(i => i.id === itemId);
      if (item) {
        item.status = 'Pausado';
        return { success: true };
      }
    }

    throw new Error('Item não encontrado');
  }

  // POST /producao/itens/:id/retomar
  if (method === 'POST' && pathname.match(/\/producao\/itens\/[^/]+\/retomar/)) {
    const itemId = pathname.split('/')[3];

    for (const ordem of ordens) {
      const item = ordem.itens.find(i => i.id === itemId);
      if (item) {
        item.status = 'Em Producao';
        return { success: true };
      }
    }

    throw new Error('Item não encontrado');
  }

  throw new Error(`Rota não implementada: ${method} ${pathname}`);
}
