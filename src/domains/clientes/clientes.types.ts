/**
 * Tipos do domínio de Clientes
 */

import type { ID } from '@/shared/types/ids';

export type ClienteStatus = 'Ativo' | 'Inativo' | 'Bloqueado';

export interface Cliente {
  id: ID;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  estado: string;
  cep?: string;
  status: ClienteStatus;
  totalCompras: number;
  observacoes?: string;
  criadoEm: string; // ISO date string
  atualizadoEm: string; // ISO date string
  
  // Campos para Firebase (multi-tenant)
  empresaId?: string; // ID da empresa (multi-tenant)
}

export interface CreateClienteInput {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  estado: string;
  cep?: string;
  status: ClienteStatus;
  observacoes?: string;
}

export interface UpdateClienteInput extends Partial<CreateClienteInput> {}

export interface ClienteFilters {
  search?: string;
  status?: ClienteStatus | 'all';
  cidade?: string;
  estado?: string;
}