/**
 * ============================================================================
 * CLIENTES SERVICE
 * ============================================================================
 * 
 * Service para gerenciar clientes no Firestore com validações:
 * - CNPJ único por tenant
 * - Email único por tenant
 * - Status (Ativo, Inativo, Bloqueado)
 * 
 * ============================================================================
 */

import { BaseFirestoreService, type ServiceResult } from './base.service';
import { COLLECTIONS } from '@/types/firebase';
import type { Cliente, ClienteStatus } from '@/domains/clientes';

export class ClientesService extends BaseFirestoreService<Cliente> {
  constructor() {
    super(COLLECTIONS.clientes);
  }

  /**
   * Validações específicas de cliente
   */
  protected async validate(data: Partial<Cliente>, id?: string): Promise<ServiceResult<void>> {
    const errors: string[] = [];

    // 1. Validar campos obrigatórios
    if (!id) {
      if (!data.nome) errors.push('Nome é obrigatório');
      if (!data.cnpj) errors.push('CNPJ é obrigatório');
      if (!data.email) errors.push('Email é obrigatório');
      if (!data.telefone) errors.push('Telefone é obrigatório');
      if (!data.cidade) errors.push('Cidade é obrigatória');
      if (!data.estado) errors.push('Estado é obrigatório');
      if (!data.status) errors.push('Status é obrigatório');
    }

    // 2. Validar formato CNPJ (básico)
    if (data.cnpj) {
      const cnpjLimpo = data.cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        errors.push('CNPJ deve ter 14 dígitos');
      }
    }

    // 3. Validar formato email (básico)
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Email inválido');
      }
    }

    // 4. Validar CNPJ único (se for criação ou mudança de CNPJ)
    if (data.cnpj) {
      const cnpjExistente = await this.findByCNPJ(data.cnpj);
      if (cnpjExistente.success && cnpjExistente.data) {
        if (!id || cnpjExistente.data.id !== id) {
          errors.push('CNPJ já cadastrado');
        }
      }
    }

    // 5. Validar email único (se for criação ou mudança de email)
    if (data.email) {
      const emailExistente = await this.findByEmail(data.email);
      if (emailExistente.success && emailExistente.data) {
        if (!id || emailExistente.data.id !== id) {
          errors.push('Email já cadastrado');
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join('; '),
      };
    }

    return { success: true };
  }

  /**
   * Busca cliente por CNPJ
   */
  async findByCNPJ(cnpj: string): Promise<ServiceResult<Cliente | null>> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    const result = await this.list({
      where: [{ field: 'cnpj', operator: '==', value: cnpjLimpo }],
      limit: 1,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data.items[0] || null,
    };
  }

  /**
   * Busca cliente por email
   */
  async findByEmail(email: string): Promise<ServiceResult<Cliente | null>> {
    const result = await this.list({
      where: [{ field: 'email', operator: '==', value: email.toLowerCase() }],
      limit: 1,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data.items[0] || null,
    };
  }

  /**
   * Lista clientes por status
   */
  async listByStatus(status: ClienteStatus): Promise<ServiceResult<Cliente[]>> {
    const result = await this.list({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'nome', direction: 'asc' }],
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data.items,
    };
  }

  /**
   * Lista clientes ativos
   */
  async listAtivos(): Promise<ServiceResult<Cliente[]>> {
    return this.listByStatus('Ativo');
  }

  /**
   * Bloqueia cliente
   */
  async bloquear(id: string, motivo?: string): Promise<ServiceResult<Cliente>> {
    const updates: Partial<Cliente> = { status: 'Bloqueado' };
    
    if (motivo) {
      const existing = await this.getById(id);
      if (existing.success && existing.data) {
        updates.observacoes = (existing.data.observacoes || '') + `\nBloqueado: ${motivo}`;
      }
    }

    return this.update(id, updates);
  }

  /**
   * Desbloqueia cliente
   */
  async desbloquear(id: string): Promise<ServiceResult<Cliente>> {
    return this.update(id, { status: 'Ativo' });
  }

  /**
   * Busca clientes (pesquisa por nome ou CNPJ)
   */
  async search(termo: string): Promise<ServiceResult<Cliente[]>> {
    try {
      // Nota: Firestore não tem busca full-text nativa
      // Esta implementação busca todos os clientes e filtra no client-side
      // Para produção, considere usar Algolia ou Elasticsearch
      
      const result = await this.list({
        orderBy: [{ field: 'nome', direction: 'asc' }],
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error,
        };
      }

      const termoLower = termo.toLowerCase();
      const filtrados = result.data.items.filter((cliente) => {
        return (
          cliente.nome.toLowerCase().includes(termoLower) ||
          cliente.cnpj.includes(termo) ||
          cliente.email.toLowerCase().includes(termoLower)
        );
      });

      return {
        success: true,
        data: filtrados,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar clientes',
      };
    }
  }
}

// Singleton instance
export const clientesService = new ClientesService();
