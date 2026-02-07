/**
 * Servi??o de usu??rios (Firestore)
 */

import type { ID } from '@/shared/types/ids';
import { FirestoreService } from '@/services/firestore/base';
import { COLLECTIONS } from '@/types/firebase';
import type { Usuario, CreateUsuarioInput, UpdateUsuarioInput, UsuariosFilters } from './usuarios.types';

interface UsuarioDoc {
  nome: string;
  email: string;
  role: Usuario['role'];
  ativo: boolean;
  status?: Usuario['status'];
  telefone?: string;
  cargo?: string;
  departamento?: string;
  dataAdmissao?: string;
  permissoesCustomizadas?: Usuario['permissoesCustomizadas'];
  empresaId?: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

class UsuariosFirestoreService extends FirestoreService<UsuarioDoc> {
  constructor() {
    super(COLLECTIONS.users, { softDelete: true });
  }
}

const usuariosFirestore = new UsuariosFirestoreService();

const timestampToISO = (value?: any) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  return new Date(value).toISOString();
};

const mapDocToUsuario = (doc: { id: string } & UsuarioDoc): Usuario => {
  const status = doc.status || (doc.ativo ? 'ativo' : 'inativo');
  return {
    id: doc.id,
    nome: doc.nome || 'Usu??rio',
    email: doc.email || '',
    role: doc.role,
    status,
    avatar: undefined,
    telefone: doc.telefone,
    cargo: doc.cargo,
    departamento: doc.departamento || '',
    dataAdmissao: doc.dataAdmissao || '',
    dataCriacao: timestampToISO(doc.createdAt),
    dataAtualizacao: timestampToISO(doc.updatedAt),
    permissoesCustomizadas: doc.permissoesCustomizadas,
  } as Usuario;
};

class UsuariosService {
  /**
   * Lista todos os usu??rios (com filtros)
   */
  async getAll(filters?: UsuariosFilters): Promise<Usuario[]> {
    const where = [] as { field: string; operator: any; value: any }[];

    if (filters?.role) {
      where.push({ field: 'role', operator: '==', value: filters.role });
    }

    if (filters?.status === 'ativo') {
      where.push({ field: 'ativo', operator: '==', value: true });
    }

    if (filters?.status === 'inativo') {
      where.push({ field: 'ativo', operator: '==', value: false });
    }

    if (filters?.status === 'ferias') {
      where.push({ field: 'status', operator: '==', value: 'ferias' });
    }

    if (filters?.departamento) {
      where.push({ field: 'departamento', operator: '==', value: filters.departamento });
    }

    const result = await usuariosFirestore.list({ where, orderBy: [{ field: 'nome', direction: 'asc' }] });
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao listar usu??rios');
    }

    let usuarios = result.data.items.map((item) => mapDocToUsuario(item as any));

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      usuarios = usuarios.filter(
        (u) =>
          u.nome.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          (u.departamento || '').toLowerCase().includes(search)
      );
    }

    return usuarios;
  }

  /**
   * Busca usu??rio por ID
   */
  async getById(id: ID): Promise<Usuario> {
    const result = await usuariosFirestore.getById(String(id));
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Usu??rio n??o encontrado');
    }
    return mapDocToUsuario({ id: String(id), ...(result.data as UsuarioDoc) });
  }

  /**
   * Cria novo usu??rio (somente Firestore; Auth deve ser criado via signup)
   */
  async create(data: CreateUsuarioInput): Promise<Usuario> {
    const payload: UsuarioDoc = {
      nome: data.nome,
      email: data.email.toLowerCase(),
      role: data.role,
      ativo: data.status ? data.status === 'ativo' : true,
      status: data.status || 'ativo',
      telefone: data.telefone,
      cargo: data.cargo,
      departamento: data.departamento,
      dataAdmissao: data.dataAdmissao,
      permissoesCustomizadas: data.permissoesCustomizadas,
    };

    const result = await usuariosFirestore.create(payload);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao criar usu??rio');
    }

    return mapDocToUsuario({ id: (result.data as any).id, ...(result.data as UsuarioDoc) });
  }

  /**
   * Atualiza usu??rio
   */
  async update(id: ID, data: UpdateUsuarioInput): Promise<Usuario> {
    const payload: Partial<UsuarioDoc> = {
      nome: data.nome,
      email: data.email?.toLowerCase(),
      role: data.role,
      telefone: data.telefone,
      cargo: data.cargo,
      departamento: data.departamento,
      dataAdmissao: data.dataAdmissao,
      permissoesCustomizadas: data.permissoesCustomizadas,
    };

    if (data.status) {
      payload.status = data.status;
      payload.ativo = data.status === 'ativo';
    }

    const result = await usuariosFirestore.update(String(id), payload);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao atualizar usu??rio');
    }

    return mapDocToUsuario({ id: String(id), ...(result.data as UsuarioDoc) });
  }

  /**
   * Deleta usu??rio
   */
  async delete(id: ID): Promise<void> {
    const result = await usuariosFirestore.remove(String(id));
    if (!result.success) {
      throw new Error(result.error || 'Erro ao remover usu??rio');
    }
  }

  /**
   * Atualiza permiss??es customizadas do usu??rio
   */
  async updatePermissoes(id: ID, permissoes: Usuario['permissoesCustomizadas']): Promise<Usuario> {
    return this.update(id, { permissoesCustomizadas: permissoes });
  }

  /**
   * Reset permiss??es para padr??o do role
   */
  async resetPermissoes(id: ID): Promise<Usuario> {
    return this.update(id, { permissoesCustomizadas: undefined });
  }

  /**
   * Altera senha do usu??rio (n??o suportado no client)
   */
  async changePassword(id: ID, senhaAtual: string, novaSenha: string): Promise<void> {
    void id;
    void senhaAtual;
    void novaSenha;
    throw new Error('Altera????o de senha deve ser feita pelo pr??prio usu??rio via Firebase Auth.');
  }

  /**
   * Obt??m estat??sticas de usu??rios
   */
  async getStats(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    ferias: number;
    porRole: Record<string, number>;
  }> {
    const usuarios = await this.getAll();
    const stats = {
      total: usuarios.length,
      ativos: usuarios.filter((u) => u.status === 'ativo').length,
      inativos: usuarios.filter((u) => u.status === 'inativo').length,
      ferias: usuarios.filter((u) => u.status === 'ferias').length,
      porRole: usuarios.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  }
}

export const usuariosService = new UsuariosService();
