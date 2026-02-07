import { useEffect, useState } from 'react';
import { comprasService } from '@/services/firestore/compras.service';
import { estoqueService } from '@/domains/estoque';
import type { SolicitacaoCompra, StatusCompra, ItemMaterial } from '@/app/types/workflow';
import { toast } from 'sonner';

type ServiceResult<T> = { success: boolean; data?: T; error?: string };

interface UseComprasOptions {
  autoLoad?: boolean;
  status?: StatusCompra;
}

export function useCompras(options: UseComprasOptions = {}) {
  const { autoLoad = true, status } = options;

  const [compras, setCompras] = useState<SolicitacaoCompra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeCompra = (compra: SolicitacaoCompra): SolicitacaoCompra => {
    const toDate = (value: any) => {
      if (!value) return value;
      if (value instanceof Date) return value;
      if (typeof value === 'string') return new Date(value);
      if (value?.toDate) return value.toDate();
      return value;
    };

    return {
      ...compra,
      data: toDate(compra.data),
    } as SolicitacaoCompra;
  };

  const loadCompras = async () => {
    try {
      setLoading(true);
      setError(null);

      const where = [] as { field: string; operator: any; value: any }[];
      if (status) where.push({ field: 'status', operator: '==', value: status });

      const listResult = await comprasService.list({
        where,
        orderBy: [{ field: 'data', direction: 'desc' }],
      });

      if (listResult.success && listResult.data) {
        setCompras(listResult.data.items.map(normalizeCompra));
      } else {
        setError(listResult.error || 'Erro ao carregar compras');
        toast.error(listResult.error || 'Erro ao carregar compras');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const createCompra = async (
    data: Omit<SolicitacaoCompra, 'id' | 'numero' | 'empresaId' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResult<SolicitacaoCompra>> => {
    try {
      setLoading(true);
      const numero = `SC-${Date.now()}`;
      const result = await comprasService.create({
        ...data,
        numero,
      } as SolicitacaoCompra);

      if (result.success && result.data) {
        setCompras((prev) => [normalizeCompra(result.data!), ...prev]);
        toast.success('Solicitação de compra criada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao criar solicitação');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateCompra = async (
    id: string,
    updates: Partial<Omit<SolicitacaoCompra, 'empresaId' | 'createdAt'>>
  ): Promise<ServiceResult<SolicitacaoCompra>> => {
    try {
      setLoading(true);
      const result = await comprasService.update(id, updates as SolicitacaoCompra);

      if (result.success && result.data) {
        setCompras((prev) => prev.map((c) => (c.id === id ? normalizeCompra(result.data!) : c)));
        toast.success('Solicitação atualizada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao atualizar solicitação');
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const receberCompra = async (compraId: string, itens: ItemMaterial[], usuario: string) => {
    try {
      setLoading(true);
      for (const item of itens) {
        await estoqueService.entrada(item.produtoId, item.quantidade, `Recebimento compra ${compraId}`, usuario);
      }
      await updateCompra(compraId, { status: 'Recebida' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao receber compra';
      toast.error(errorMsg);
      return { success: false, error: errorMsg } as ServiceResult<void>;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadCompras();
    }
  }, [autoLoad, status]);

  return {
    compras,
    loading,
    error,
    loadCompras,
    createCompra,
    updateCompra,
    receberCompra,
  };
}
