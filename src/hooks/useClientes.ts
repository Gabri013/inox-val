/**
 * ============================================================================
 * HOOK: useClientes
 * ============================================================================
 * 
 * Hook React para gerenciar clientes usando Firebase.
 * 
 * Funcionalidades:
 * - Carregar lista de clientes
 * - Criar novo cliente
 * - Atualizar cliente
 * - Deletar cliente
 * - Buscar por CNPJ
 * - Pesquisar clientes
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { clientesService } from '@/services/firebase/clientes.service';
import type { Cliente } from '@/domains/clientes';
import type { ServiceResult } from '@/services/firebase/base.service';
import { httpClient, type PaginatedResponse } from '@/services/http/client';
import { toast } from 'sonner';

interface UseClientesOptions {
  autoLoad?: boolean;
  status?: 'Ativo' | 'Inativo' | 'Bloqueado';
}

export function useClientes(options: UseClientesOptions = {}) {
  const { autoLoad = true, status } = options;
  const isMock = import.meta.env.VITE_USE_MOCK === 'true' && import.meta.env.DEV;
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar clientes
  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);

      let result: ServiceResult<Cliente[]>;

      if (isMock) {
        const response = await httpClient.get<PaginatedResponse<Cliente>>('/api/clientes', {
          params: {
            page: 1,
            pageSize: 1000,
            ...(status ? { status } : {}),
          },
        });
        result = { success: true, data: response.items };
      } else if (status) {
        result = await clientesService.listByStatus(status);
      } else {
        const listResult = await clientesService.list({
          orderBy: [{ field: 'nome', direction: 'asc' }],
        });
        result = {
          success: listResult.success,
          data: listResult.data?.items,
          error: listResult.error,
        };
      }

      if (result.success && result.data) {
        setClientes(result.data);
      } else {
        setError(result.error || 'Erro ao carregar clientes');
        toast.error(result.error || 'Erro ao carregar clientes');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Criar cliente
  const createCliente = async (
    data: Omit<Cliente, 'id' | 'empresaId' | 'criadoEm' | 'atualizadoEm'>
  ): Promise<ServiceResult<Cliente>> => {
    try {
      setLoading(true);

      const payload = {
        id: `cli_${Date.now()}`,
        ...data,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      } as Cliente;

      const result = isMock
        ? ({ success: true, data: await httpClient.post<Cliente>('/api/clientes', payload) } as ServiceResult<Cliente>)
        : await clientesService.create(payload);

      if (result.success && result.data) {
        setClientes((prev) => [...prev, result.data!]);
        toast.success('Cliente criado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao criar cliente');
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

  // Atualizar cliente
  const updateCliente = async (
    id: string,
    updates: Partial<Omit<Cliente, 'id' | 'empresaId' | 'criadoEm'>>
  ): Promise<ServiceResult<Cliente>> => {
    try {
      setLoading(true);

      const updatePayload = {
        ...updates,
        atualizadoEm: new Date().toISOString(),
      } as Partial<Cliente>;

      const result = isMock
        ? ({
            success: true,
            data: await httpClient.put<Cliente>(`/api/clientes/${id}`, updatePayload),
          } as ServiceResult<Cliente>)
        : await clientesService.update(id, updatePayload);

      if (result.success && result.data) {
        setClientes((prev) =>
          prev.map((c) => (c.id === id ? result.data! : c))
        );
        toast.success('Cliente atualizado com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao atualizar cliente');
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

  // Deletar cliente
  const deleteCliente = async (id: string): Promise<ServiceResult<void>> => {
    try {
      setLoading(true);

      const result: ServiceResult<void> = isMock
        ? ({ success: true } as ServiceResult<void>)
        : await clientesService.delete(id);

      if (isMock) {
        await httpClient.delete<void>(`/api/clientes/${id}`);
      }

      if (result.success) {
        setClientes((prev) => prev.filter((c) => c.id !== id));
        toast.success('Cliente removido com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao remover cliente');
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

  // Buscar por CNPJ
  const findByCNPJ = async (cnpj: string): Promise<Cliente | null> => {
    try {
      setLoading(true);
      if (isMock) {
        const response = await httpClient.get<PaginatedResponse<Cliente>>('/api/clientes', {
          params: { page: 1, pageSize: 1000 },
        });
        return response.items.find((c) => c.cnpj === cnpj) || null;
      }

      const result = await clientesService.findByCNPJ(cnpj);

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (err) {
      toast.error('Erro ao buscar cliente por CNPJ');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Pesquisar clientes
  const searchClientes = async (termo: string) => {
    try {
      setLoading(true);
      if (isMock) {
        const response = await httpClient.get<PaginatedResponse<Cliente>>('/api/clientes', {
          params: { page: 1, pageSize: 1000, search: termo },
        });
        setClientes(response.items);
      } else {
        const result = await clientesService.search(termo);

        if (result.success && result.data) {
          setClientes(result.data);
        } else {
          toast.error(result.error || 'Erro ao pesquisar clientes');
        }
      }
    } catch (err) {
      toast.error('Erro ao pesquisar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Bloquear cliente
  const bloquearCliente = async (id: string, motivo?: string) => {
    return updateCliente(id, { status: 'Bloqueado', observacoes: motivo });
  };

  // Desbloquear cliente
  const desbloquearCliente = async (id: string) => {
    return updateCliente(id, { status: 'Ativo' });
  };

  // Auto-load ao montar
  useEffect(() => {
    if (autoLoad) {
      loadClientes();
    }
  }, [autoLoad, status]);

  return {
    clientes,
    loading,
    error,
    loadClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    findByCNPJ,
    searchClientes,
    bloquearCliente,
    desbloquearCliente,
  };
}
