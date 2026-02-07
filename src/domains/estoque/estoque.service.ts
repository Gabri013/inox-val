/**
 * Serviço de Estoque (Firestore)
 */

import { estoqueItensService, estoqueMovimentosService, registrarMovimentoEstoque, type EstoqueItem } from '@/services/firestore/estoque.service';
import type { MovimentoEstoque, SaldoEstoque, EstoqueFilters } from './estoque.types';
import type { ID } from '@/shared/types/ids';
import { PaginationParams } from '@/services/http/client';
import { produtosService } from '../produtos/produtos.service';

class EstoqueService {
  private async getItemByProdutoId(produtoId: ID): Promise<EstoqueItem | null> {
    const result = await estoqueItensService.list({
      where: [{ field: 'produtoId', operator: '==', value: String(produtoId) }],
      limit: 1,
    });
    return result.success && result.data?.items[0] ? (result.data.items[0] as EstoqueItem) : null;
  }

  private async ensureItem(produtoId: ID): Promise<EstoqueItem> {
    const existing = await this.getItemByProdutoId(produtoId);
    if (existing) return existing;

    const produto = await produtosService.getById(produtoId);
    const created = await estoqueItensService.create({
      produtoId: produto.id,
      produtoNome: produto.nome,
      produtoCodigo: produto.codigo,
      saldo: produto.estoque || 0,
      saldoDisponivel: produto.estoque || 0,
      saldoReservado: 0,
      estoqueMinimo: produto.estoqueMinimo || 0,
      unidade: produto.unidade,
      ultimaMovimentacao: undefined,
    } as EstoqueItem);

    if (!created.success || !created.data) {
      throw new Error(created.error || 'Erro ao criar item de estoque');
    }
    return created.data as EstoqueItem;
  }

  async listMovimentos(params: PaginationParams & EstoqueFilters = {}): Promise<MovimentoEstoque[]> {
    const where = [] as { field: string; operator: any; value: any }[];

    if (params.tipo && params.tipo !== 'all') {
      where.push({ field: 'tipo', operator: '==', value: params.tipo });
    }

    if (params.produtoId) {
      where.push({ field: 'produtoId', operator: '==', value: String(params.produtoId) });
    }

    const result = await estoqueMovimentosService.list({
      where,
      orderBy: [{ field: 'data', direction: 'desc' }],
    });

    let items = result.success && result.data ? result.data.items : [];
    if (params.dataInicio) {
      items = items.filter((m) => new Date(m.data).getTime() >= new Date(params.dataInicio!).getTime());
    }
    if (params.dataFim) {
      items = items.filter((m) => new Date(m.data).getTime() <= new Date(params.dataFim!).getTime());
    }

    return items;
  }

  async listSaldos(): Promise<SaldoEstoque[]> {
    const result = await estoqueItensService.list({
      orderBy: [{ field: 'produtoNome', direction: 'asc' }],
    });
    return result.success && result.data ? result.data.items : [];
  }

  async getSaldo(produtoId: ID): Promise<SaldoEstoque> {
    const item = await this.ensureItem(produtoId);
    return item;
  }

  async entrada(produtoId: ID, quantidade: number, origem: string, usuario: string, observacoes?: string) {
    if (quantidade <= 0) throw new Error('Quantidade deve ser positiva');
    const item = await this.ensureItem(produtoId);
    await registrarMovimentoEstoque({
      itemId: item.id,
      tipo: 'ENTRADA',
      quantidade,
      origem,
      observacoes,
      usuario,
    });
  }

  async saida(produtoId: ID, quantidade: number, origem: string, usuario: string, observacoes?: string) {
    if (quantidade <= 0) throw new Error('Quantidade deve ser positiva');
    const item = await this.ensureItem(produtoId);
    if (quantidade > (item.saldoDisponivel || 0)) {
      throw new Error(`Saldo disponível insuficiente. Disponível: ${item.saldoDisponivel}`);
    }
    await registrarMovimentoEstoque({
      itemId: item.id,
      tipo: 'SAIDA',
      quantidade,
      origem,
      observacoes,
      usuario,
    });
  }

  async reserva(produtoId: ID, quantidade: number, origem: string, usuario: string, observacoes?: string) {
    if (quantidade <= 0) throw new Error('Quantidade deve ser positiva');
    const item = await this.ensureItem(produtoId);
    if (quantidade > (item.saldoDisponivel || 0)) {
      throw new Error(`Saldo disponível insuficiente. Disponível: ${item.saldoDisponivel}`);
    }
    await registrarMovimentoEstoque({
      itemId: item.id,
      tipo: 'RESERVA',
      quantidade,
      origem,
      observacoes: observacoes || 'Reserva automática',
      usuario,
    });
  }

  async estorno(movimentoId: ID, usuario: string, observacoes?: string) {
    const movimentoResult = await estoqueMovimentosService.getById(String(movimentoId));
    if (!movimentoResult.success || !movimentoResult.data) {
      throw new Error(movimentoResult.error || 'Movimento não encontrado');
    }
    const movimento = movimentoResult.data;
    if (movimento.tipo === 'ESTORNO') {
      throw new Error('Não é possível estornar um estorno');
    }

    const item = await this.ensureItem(movimento.produtoId);

    let saldoDelta = 0;
    let reservadoDelta = 0;

    switch (movimento.tipo) {
      case 'ENTRADA':
        saldoDelta = -movimento.quantidade;
        break;
      case 'SAIDA':
        saldoDelta = movimento.quantidade;
        break;
      case 'AJUSTE':
        saldoDelta = -movimento.quantidade;
        break;
      case 'RESERVA':
        reservadoDelta = -movimento.quantidade;
        break;
      default:
        break;
    }

    await registrarMovimentoEstoque({
      itemId: item.id,
      tipo: 'ESTORNO',
      quantidade: movimento.quantidade,
      origem: `Estorno de ${movimento.tipo} - ${movimento.origem}`,
      observacoes: observacoes || `Estorno do movimento ${movimentoId}`,
      usuario,
      saldoDelta,
      reservadoDelta,
    });
  }

  async ajuste(produtoId: ID, quantidade: number, origem: string, usuario: string, observacoes?: string) {
    if (quantidade === 0) throw new Error('Quantidade deve ser diferente de zero');
    const item = await this.ensureItem(produtoId);
    await registrarMovimentoEstoque({
      itemId: item.id,
      tipo: 'AJUSTE',
      quantidade,
      origem,
      observacoes,
      usuario,
      saldoDelta: quantidade,
    });
  }

  async getStats(): Promise<{
    totalProdutos: number;
    totalMovimentos: number;
    baixoEstoque: number;
    semEstoque: number;
    valorTotal: number;
  }> {
    const saldos = await this.listSaldos();
    const movimentos = await estoqueMovimentosService.list({ orderBy: [{ field: 'data', direction: 'desc' }] });
    const totalMovimentos = movimentos.success && movimentos.data ? movimentos.data.items.length : 0;
    const produtos = await produtosService.list({ pageSize: 1000 });
    const valorTotal = saldos.reduce((acc, item) => {
      const produto = produtos.items.find((p) => p.id === item.produtoId);
      if (!produto) return acc;
      return acc + (item.saldo || 0) * produto.custo;
    }, 0);
    return {
      totalProdutos: saldos.length,
      totalMovimentos,
      baixoEstoque: saldos.filter((s) => s.saldo > 0 && s.saldo <= s.estoqueMinimo).length,
      semEstoque: saldos.filter((s) => s.saldo === 0).length,
      valorTotal,
    };
  }
}

export const estoqueService = new EstoqueService();
