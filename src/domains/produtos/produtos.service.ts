/**
 * Serviço de Produtos (Firestore)
 */

import { produtosService as firestoreProdutosService } from '@/services/firestore/produtos.service';
import type { Produto, CreateProdutoInput, UpdateProdutoInput, ProdutoFilters } from './produtos.types';
import type { ID } from '@/shared/types/ids';
import { PaginationParams, PaginatedResponse } from '@/services/http/client';

class ProdutosService {
  async list(params: PaginationParams & ProdutoFilters = {}): Promise<PaginatedResponse<Produto>> {
    const where = [] as { field: string; operator: any; value: any }[];

    if (params.tipo && params.tipo !== 'all') {
      where.push({ field: 'tipo', operator: '==', value: params.tipo });
    }

    if (params.ativo !== undefined) {
      where.push({ field: 'ativo', operator: '==', value: params.ativo });
    }

    const result = await firestoreProdutosService.list({
      where,
      orderBy: [{ field: 'nome', direction: 'asc' }],
    });

    const items = result.success && result.data ? result.data.items : [];
    const search = params.search?.toLowerCase() || '';

    const filtered = search
      ? items.filter((produto) =>
          produto.nome.toLowerCase().includes(search) ||
          produto.codigo.toLowerCase().includes(search) ||
          (produto.descricao || '').toLowerCase().includes(search)
        )
      : items;

    const page = params.page || 1;
    const pageSize = params.pageSize || filtered.length || 1;
    const start = (page - 1) * pageSize;
    const pagedItems = filtered.slice(start, start + pageSize);

    return {
      items: pagedItems,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize) || 1,
    };
  }

  async getById(id: ID): Promise<Produto> {
    const result = await firestoreProdutosService.getById(String(id));
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Produto não encontrado');
    }
    return result.data;
  }

  async create(data: CreateProdutoInput): Promise<Produto> {
    const payload: Produto = {
      id: '',
      codigo: data.codigo,
      nome: data.nome,
      descricao: data.descricao,
      tipo: data.tipo,
      unidade: data.unidade,
      preco: data.preco,
      custo: data.custo,
      estoque: 0,
      estoqueMinimo: data.estoqueMinimo,
      ativo: data.ativo,
      observacoes: data.observacoes,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    } as Produto;

    const result = await firestoreProdutosService.create(payload as Produto);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao criar produto');
    }
    return result.data;
  }

  async update(id: ID, data: UpdateProdutoInput): Promise<Produto> {
    const result = await firestoreProdutosService.update(String(id), {
      ...data,
      atualizadoEm: new Date().toISOString(),
    } as Partial<Produto>);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao atualizar produto');
    }
    return result.data;
  }

  async delete(id: ID): Promise<void> {
    const result = await firestoreProdutosService.remove(String(id));
    if (!result.success) {
      throw new Error(result.error || 'Erro ao remover produto');
    }
  }

  async getStats(): Promise<{
    total: number;
    ativos: number;
    baixoEstoque: number;
    valorEstoque: number;
  }> {
    const list = await firestoreProdutosService.list({
      orderBy: [{ field: 'nome', direction: 'asc' }],
    });
    const items = list.success && list.data ? list.data.items : [];
    const total = items.length;
    const ativos = items.filter((p) => p.ativo).length;
    const baixoEstoque = items.filter((p) => p.estoque <= p.estoqueMinimo).length;
    const valorEstoque = items.reduce((acc, p) => acc + p.estoque * p.custo, 0);
    return { total, ativos, baixoEstoque, valorEstoque };
  }
}

export const produtosService = new ProdutosService();
