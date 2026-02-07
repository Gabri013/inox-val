/**
 * Serviço de Clientes (Firestore)
 */

import { clientesService as firestoreClientesService } from '@/services/firestore/clientes.service';
import type { Cliente, CreateClienteInput, UpdateClienteInput, ClienteFilters } from './clientes.types';
import type { ID } from '@/shared/types/ids';
import { PaginationParams, PaginatedResponse } from '@/services/http/client';

class ClientesService {
	async list(params: PaginationParams & ClienteFilters = {}): Promise<PaginatedResponse<Cliente>> {
		const where = [] as { field: string; operator: any; value: any }[];

		if (params.status && params.status !== 'all') {
			where.push({ field: 'status', operator: '==', value: params.status });
		}

		const result = await firestoreClientesService.list({
			where,
			orderBy: [{ field: 'nome', direction: 'asc' }],
		});

		const items = result.success && result.data ? result.data.items : [];
		const search = params.search?.toLowerCase() || '';
		const filtered = search
			? items.filter((cliente) =>
					cliente.nome.toLowerCase().includes(search) ||
					cliente.cnpj.toLowerCase().includes(search) ||
					cliente.email.toLowerCase().includes(search) ||
					cliente.telefone.toLowerCase().includes(search)
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

	async getById(id: ID): Promise<Cliente> {
		const result = await firestoreClientesService.getById(String(id));
		if (!result.success || !result.data) {
			throw new Error(result.error || 'Cliente não encontrado');
		}
		return result.data;
	}

	async create(data: CreateClienteInput): Promise<Cliente> {
		const payload: Cliente = {
			id: '',
			nome: data.nome,
			cnpj: data.cnpj,
			email: data.email.toLowerCase(),
			telefone: data.telefone,
			endereco: data.endereco,
			cidade: data.cidade,
			estado: data.estado,
			cep: data.cep,
			status: data.status,
			totalCompras: 0,
			observacoes: data.observacoes,
			criadoEm: new Date().toISOString(),
			atualizadoEm: new Date().toISOString(),
		} as Cliente;

		const result = await firestoreClientesService.create(payload as Cliente);
		if (!result.success || !result.data) {
			throw new Error(result.error || 'Erro ao criar cliente');
		}
		return result.data;
	}

	async update(id: ID, data: UpdateClienteInput): Promise<Cliente> {
		const result = await firestoreClientesService.update(String(id), {
			...data,
			atualizadoEm: new Date().toISOString(),
		} as Partial<Cliente>);
		if (!result.success || !result.data) {
			throw new Error(result.error || 'Erro ao atualizar cliente');
		}
		return result.data;
	}

	async delete(id: ID): Promise<void> {
		const result = await firestoreClientesService.remove(String(id));
		if (!result.success) {
			throw new Error(result.error || 'Erro ao remover cliente');
		}
	}

	async getStats(): Promise<{
		total: number;
		ativos: number;
		inativos: number;
		volumeTotal: number;
	}> {
		const list = await firestoreClientesService.list({ orderBy: [{ field: 'nome', direction: 'asc' }] });
		const items = list.success && list.data ? list.data.items : [];
		const total = items.length;
		const ativos = items.filter((c) => c.status === 'Ativo').length;
		const inativos = items.filter((c) => c.status !== 'Ativo').length;
		const volumeTotal = items.reduce((acc, c) => acc + (c.totalCompras || 0), 0);
		return { total, ativos, inativos, volumeTotal };
	}
}

export const clientesService = new ClientesService();
