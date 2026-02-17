import type { CalculadoraSalva, ResultadoCalculadora } from './types';
import { FirestoreService, getCurrentUserProfile } from '@/services/firestore/base';
import { COLLECTIONS } from '@/types/firebase';

/**
 * Servi??o de Calculadora R??pida (Firestore)
 */

class CalculadoraFirestoreService extends FirestoreService<CalculadoraSalva> {
  constructor() {
    super(COLLECTIONS.calculos, { softDelete: false });
  }
}

const calculosService = new CalculadoraFirestoreService();

const timestampToISO = (value?: any) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  return new Date(value).toISOString();
};

const mapDocToCalculadora = (doc: { id: string } & Partial<CalculadoraSalva>): CalculadoraSalva => {
  return {
    id: doc.id,
    nome: doc.nome || 'C??lculo',
    cliente: doc.cliente,
    vendedor: doc.vendedor || 'Usu??rio',
    resultado: doc.resultado as ResultadoCalculadora,
    dataCriacao: doc.dataCriacao || timestampToISO((doc as any).createdAt),
    dataAtualizacao: doc.dataAtualizacao || timestampToISO((doc as any).updatedAt),
    status: doc.status || 'rascunho',
  } as CalculadoraSalva;
};

export const calculadoraService = {
  /**
   * Salvar um c??lculo no Firestore
   */
  async salvar(dados: {
    nome: string;
    cliente?: string;
    resultado: ResultadoCalculadora;
  }): Promise<CalculadoraSalva> {
    const profile = await getCurrentUserProfile();
    const vendedor = profile?.nome || profile?.email || 'Usu??rio';
    const payload: Omit<CalculadoraSalva, 'id'> = {
      nome: dados.nome,
      cliente: dados.cliente,
      vendedor,
      resultado: dados.resultado,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      status: 'rascunho',
    };

    const result = await calculosService.create(payload as CalculadoraSalva);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao salvar c??lculo');
    }

    return mapDocToCalculadora({ id: (result.data as any).id, ...(result.data as any) });
  },

  /**
   * Atualizar um c??lculo existente
   */
  async atualizar(id: string, dados: Partial<CalculadoraSalva>): Promise<CalculadoraSalva> {
    const result = await calculosService.update(id, {
      ...dados,
      dataAtualizacao: new Date().toISOString(),
    } as Partial<CalculadoraSalva>);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao atualizar c??lculo');
    }

    return mapDocToCalculadora({ id, ...(result.data as any) });
  },

  /**
   * Buscar todos os c??lculos salvos
   */
  async listar(filtros?: {
    vendedor?: string;
    cliente?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<CalculadoraSalva[]> {
    const where = [] as { field: string; operator: any; value: any }[];
    if (filtros?.status) {
      where.push({ field: 'status', operator: '==', value: filtros.status });
    }
    if (filtros?.vendedor) {
      where.push({ field: 'vendedor', operator: '==', value: filtros.vendedor });
    }
    if (filtros?.cliente) {
      where.push({ field: 'cliente', operator: '==', value: filtros.cliente });
    }

    const result = await calculosService.list({ where, orderBy: [{ field: 'dataAtualizacao', direction: 'desc' }] });
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao listar c??lculos');
    }

    let items = result.data.items.map((item) => mapDocToCalculadora(item as any));

    if (filtros?.dataInicio || filtros?.dataFim) {
      const start = filtros.dataInicio ? new Date(filtros.dataInicio).getTime() : 0;
      const end = filtros.dataFim ? new Date(filtros.dataFim).getTime() : Number.MAX_SAFE_INTEGER;
      items = items.filter((item) => {
        const time = new Date(item.dataCriacao).getTime();
        return time >= start && time <= end;
      });
    }

    return items;
  },

  /**
   * Buscar um c??lculo espec??fico por ID
   */
  async buscarPorId(id: string): Promise<CalculadoraSalva> {
    const result = await calculosService.getById(id);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'C??lculo n??o encontrado');
    }
    return mapDocToCalculadora({ id, ...(result.data as any) });
  },

  /**
   * Excluir um c??lculo
   */
  async excluir(id: string): Promise<void> {
    const result = await calculosService.remove(id);
    if (!result.success) {
      throw new Error(result.error || 'Erro ao excluir c??lculo');
    }
  },

  /**
   * Converter c??lculo em or??amento/pedido (marca como convertido)
   */
  async converter(id: string, tipo: 'orcamento' | 'pedido'): Promise<{ id: string }> {
    await calculosService.update(id, { status: 'convertido', dataAtualizacao: new Date().toISOString() } as Partial<CalculadoraSalva>);
    return { id: `${tipo}-${id}` };
  },

  /**
   * Duplicar um c??lculo existente
   */
  async duplicar(id: string): Promise<CalculadoraSalva> {
    const original = await calculosService.getById(id);
    if (!original.success || !original.data) {
      throw new Error(original.error || 'C??lculo n??o encontrado');
    }
    const originalData = mapDocToCalculadora({ id, ...(original.data as any) });
    return calculadoraService.salvar({
      nome: `${originalData.nome} (c??pia)`,
      cliente: originalData.cliente,
      resultado: originalData.resultado,
    });
  },

  /**
   * Exportar c??lculo em PDF (n??o implementado no client)
   */
  async exportarPDF(): Promise<Blob> {
    throw new Error('Exporta????o em PDF deve ser feita via backend dedicado.');
  },
};
