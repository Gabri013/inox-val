/**
 * Domain: Usuários e Permissões (RBAC)
 * Tipos e interfaces para controle de acesso granular
 */

import type { ID } from '@/shared/types/ids';

// ========== ROLES E PERMISSÕES ==========

export type UserRole =
  | 'Administrador'
  | 'Dono'
  | 'Compras'
  | 'Gerencia'
  | 'Financeiro'
  | 'Producao'
  | 'Engenharia'
  | 'Orcamentista'
  | 'Vendedor';

export type UserStatus = 'ativo' | 'inativo' | 'ferias';

/**
 * Ações possíveis em cada módulo
 */
export type Permission = 'view' | 'create' | 'edit' | 'delete';

/**
 * Módulos do sistema
 */
export type Module = 
  | 'dashboard'
  | 'clientes'
  | 'produtos'
  | 'catalogo'
  | 'estoque'
  | 'orcamentos'
  | 'ordens'
  | 'compras'
  | 'producao'
  | 'calculadora'
  | 'precificacao'
  | 'auditoria'
  | 'usuarios'
  | 'configuracoes'
  | 'chat'
  | 'anuncios';

/**
 * Conjunto de permissões para um módulo
 */
export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

/**
 * Mapa de permissões por módulo
 */
export type PermissionsMap = Partial<Record<Module, ModulePermissions>>;

// ========== MATRIZ DE PERMISSÕES PADRÃO ==========

/**
 * Define permissões padrão por role
 * Admin tem acesso total
 */
export const defaultPermissionsByRole: Record<UserRole, PermissionsMap> = {
  Administrador: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: true, edit: true, delete: true },
    produtos: { view: true, create: true, edit: true, delete: true },
    catalogo: { view: true, create: true, edit: true, delete: true },
    estoque: { view: true, create: true, edit: true, delete: true },
    orcamentos: { view: true, create: true, edit: true, delete: true },
    ordens: { view: true, create: true, edit: true, delete: true },
    compras: { view: true, create: true, edit: true, delete: true },
    producao: { view: true, create: true, edit: true, delete: true },
    calculadora: { view: true, create: true, edit: true, delete: true },
    precificacao: { view: true, create: true, edit: true, delete: true },
    auditoria: { view: true, create: false, edit: false, delete: true },
    usuarios: { view: true, create: true, edit: true, delete: true },
    configuracoes: { view: true, create: false, edit: true, delete: false },
    chat: { view: true, create: true, edit: true, delete: true },
    anuncios: { view: true, create: true, edit: true, delete: true },
  },

  Dono: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: true, edit: true, delete: true },
    produtos: { view: true, create: true, edit: true, delete: true },
    catalogo: { view: true, create: true, edit: true, delete: true },
    estoque: { view: true, create: true, edit: true, delete: true },
    orcamentos: { view: true, create: true, edit: true, delete: true },
    ordens: { view: true, create: true, edit: true, delete: true },
    compras: { view: true, create: true, edit: true, delete: true },
    producao: { view: true, create: true, edit: true, delete: true },
    calculadora: { view: true, create: true, edit: true, delete: true },
    precificacao: { view: true, create: true, edit: true, delete: true },
    auditoria: { view: true, create: false, edit: false, delete: true },
    usuarios: { view: true, create: true, edit: true, delete: true },
    configuracoes: { view: true, create: true, edit: true, delete: true },
    chat: { view: true, create: true, edit: true, delete: true },
    anuncios: { view: true, create: true, edit: true, delete: true },
  },

  Compras: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: false, edit: false, delete: false },
    produtos: { view: true, create: false, edit: false, delete: false },
    catalogo: { view: true, create: false, edit: false, delete: false },
    estoque: { view: true, create: true, edit: true, delete: false },
    orcamentos: { view: false, create: false, edit: false, delete: false },
    ordens: { view: true, create: false, edit: false, delete: false },
    compras: { view: true, create: true, edit: true, delete: false },
    producao: { view: true, create: false, edit: false, delete: false },
    calculadora: { view: false, create: false, edit: false, delete: false },
    precificacao: { view: false, create: false, edit: false, delete: false },
    auditoria: { view: true, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    configuracoes: { view: false, create: false, edit: false, delete: false },
    chat: { view: false, create: false, edit: false, delete: false },
    anuncios: { view: false, create: false, edit: false, delete: false },
  },

  Gerencia: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: false, edit: false, delete: false },
    produtos: { view: true, create: false, edit: false, delete: false },
    catalogo: { view: true, create: false, edit: false, delete: false },
    estoque: { view: true, create: false, edit: false, delete: false },
    orcamentos: { view: true, create: false, edit: true, delete: false },
    ordens: { view: true, create: false, edit: true, delete: false },
    compras: { view: true, create: false, edit: true, delete: false },
    producao: { view: true, create: false, edit: true, delete: false },
    calculadora: { view: true, create: false, edit: false, delete: false },
    precificacao: { view: true, create: false, edit: false, delete: false },
    auditoria: { view: true, create: false, edit: false, delete: false },
    usuarios: { view: true, create: false, edit: false, delete: false },
    configuracoes: { view: true, create: false, edit: false, delete: false },
    chat: { view: false, create: false, edit: false, delete: false },
    anuncios: { view: false, create: false, edit: false, delete: false },
  },
  
  Engenharia: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: false, edit: false, delete: false },
    produtos: { view: true, create: true, edit: true, delete: false },
    catalogo: { view: true, create: true, edit: true, delete: false },
    estoque: { view: true, create: true, edit: true, delete: false },
    orcamentos: { view: true, create: true, edit: true, delete: false },
    ordens: { view: true, create: true, edit: true, delete: false },
    compras: { view: true, create: true, edit: false, delete: false },
    producao: { view: true, create: false, edit: true, delete: false },
    calculadora: { view: true, create: true, edit: true, delete: true },
    precificacao: { view: true, create: true, edit: true, delete: true },
    auditoria: { view: false, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    configuracoes: { view: true, create: false, edit: true, delete: false },
    chat: { view: true, create: true, edit: true, delete: false },
    anuncios: { view: true, create: false, edit: false, delete: false },
  },
  
  Producao: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: false, edit: false, delete: false },
    produtos: { view: true, create: false, edit: false, delete: false },
    catalogo: { view: true, create: false, edit: false, delete: false },
    estoque: { view: true, create: true, edit: true, delete: false },
    orcamentos: { view: false, create: false, edit: false, delete: false },
    ordens: { view: true, create: false, edit: true, delete: false },
    compras: { view: true, create: true, edit: false, delete: false },
    producao: { view: true, create: true, edit: true, delete: false },
    calculadora: { view: false, create: false, edit: false, delete: false },
    precificacao: { view: false, create: false, edit: false, delete: false },
    auditoria: { view: false, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    configuracoes: { view: true, create: false, edit: false, delete: false },
    chat: { view: true, create: true, edit: true, delete: false },
    anuncios: { view: true, create: false, edit: false, delete: false },
  },

  Financeiro: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: false, edit: false, delete: false },
    produtos: { view: false, create: false, edit: false, delete: false },
    catalogo: { view: false, create: false, edit: false, delete: false },
    estoque: { view: false, create: false, edit: false, delete: false },
    orcamentos: { view: true, create: false, edit: false, delete: false },
    ordens: { view: true, create: false, edit: false, delete: false },
    compras: { view: true, create: true, edit: true, delete: false },
    producao: { view: false, create: false, edit: false, delete: false },
    calculadora: { view: false, create: false, edit: false, delete: false },
    precificacao: { view: false, create: false, edit: false, delete: false },
    auditoria: { view: true, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    configuracoes: { view: false, create: false, edit: false, delete: false },
    chat: { view: true, create: true, edit: true, delete: false },
    anuncios: { view: false, create: false, edit: false, delete: false },
  },

  Orcamentista: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: true, edit: true, delete: false },
    produtos: { view: true, create: false, edit: false, delete: false },
    catalogo: { view: true, create: false, edit: false, delete: false },
    estoque: { view: true, create: false, edit: false, delete: false },
    orcamentos: { view: true, create: true, edit: true, delete: false },
    ordens: { view: true, create: false, edit: false, delete: false },
    compras: { view: false, create: false, edit: false, delete: false },
    producao: { view: true, create: false, edit: false, delete: false },
    calculadora: { view: true, create: true, edit: true, delete: false },
    precificacao: { view: true, create: true, edit: true, delete: false },
    auditoria: { view: false, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    configuracoes: { view: false, create: false, edit: false, delete: false },
    chat: { view: true, create: true, edit: true, delete: false },
    anuncios: { view: false, create: false, edit: false, delete: false },
  },
  Vendedor: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: true, edit: true, delete: false },
    produtos: { view: true, create: false, edit: false, delete: false },
    catalogo: { view: true, create: false, edit: false, delete: false },
    estoque: { view: true, create: false, edit: false, delete: false },
    orcamentos: { view: true, create: true, edit: true, delete: false },
    ordens: { view: true, create: false, edit: false, delete: false },
    compras: { view: false, create: false, edit: false, delete: false },
    producao: { view: true, create: false, edit: false, delete: false },
    calculadora: { view: true, create: true, edit: true, delete: false },
    precificacao: { view: true, create: true, edit: true, delete: false },
    auditoria: { view: false, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    configuracoes: { view: false, create: false, edit: false, delete: false },
    chat: { view: true, create: true, edit: true, delete: false },
    anuncios: { view: false, create: false, edit: false, delete: false },
  },
};

// ========== USUÁRIO ==========

/**
 * Interface completa do usuário
 */
export interface Usuario {
  id: ID;
  nome: string;
  email: string;
  senha?: string; // Opcional (não retorna do backend)
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  telefone?: string;
  cargo?: string;
  departamento: string;
  dataAdmissao: string;
  dataCriacao: string;
  dataAtualizacao: string;
  
  // Permissões customizadas (sobrescrevem as padrão)
  permissoesCustomizadas?: PermissionsMap;
}

/**
 * Dados para criar usuário
 */
export interface CreateUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  status?: UserStatus;
  telefone?: string;
  cargo?: string;
  departamento: string;
  dataAdmissao?: string;
  permissoesCustomizadas?: PermissionsMap;
}

/**
 * Dados para atualizar usuário
 */
export interface UpdateUsuarioInput {
  nome?: string;
  email?: string;
  senha?: string; // Apenas se estiver alterando
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  dataAdmissao?: string;
  permissoesCustomizadas?: PermissionsMap;
}

/**
 * Filtros para lista de usuários
 */
export interface UsuariosFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  departamento?: string;
}

// ========== HELPER FUNCTIONS ==========

/**
 * Obtém permissões efetivas do usuário (customizadas ou padrão)
 */
export function getEffectivePermissions(usuario: Usuario): PermissionsMap {
  return usuario.permissoesCustomizadas || defaultPermissionsByRole[usuario.role];
}

/**
 * Verifica se usuário tem permissão específica
 */
export function hasPermission(
  usuario: Usuario,
  module: Module,
  permission: Permission
): boolean {
  const permissions = getEffectivePermissions(usuario);
  const modulePerms = permissions[module];
  
  if (!modulePerms) return false;
  
  return modulePerms[permission] === true;
}

/**
 * Verifica se usuário tem acesso ao módulo (pelo menos view)
 */
export function hasModuleAccess(usuario: Usuario, module: Module): boolean {
  return hasPermission(usuario, module, 'view');
}

/**
 * Labels para roles
 */
export const roleLabels: Record<UserRole, string> = {
  Administrador: 'Administrador',
  Dono: 'Dono',
  Compras: 'Compras',
  Gerencia: 'GerÃªncia',
  Financeiro: 'Financeiro',
  Producao: 'Produção',
  Engenharia: 'Engenharia',
  Orcamentista: 'Orçamentista',
  Vendedor: 'Vendedor',
};

/**
 * Labels para status
 */
export const statusLabels: Record<UserStatus, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  ferias: 'Férias',
};

/**
 * Cores para status (badge)
 */
export const statusColors: Record<UserStatus, string> = {
  ativo: 'bg-green-100 text-green-800',
  inativo: 'bg-gray-100 text-gray-800',
  ferias: 'bg-blue-100 text-blue-800',
};

/**
 * Labels para módulos
 */
export const moduleLabels: Record<Module, string> = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  produtos: 'Produtos',
  catalogo: 'Catálogo de Insumos',
  estoque: 'Estoque',
  orcamentos: 'Orçamentos',
  ordens: 'Ordens de Produção',
  compras: 'Compras',
  producao: 'Produção',
  calculadora: 'Calculadora',
  precificacao: 'Precificacao',
  auditoria: 'Auditoria',
  usuarios: 'Usuários',
  configuracoes: 'Configurações',
  chat: 'Chat',
  anuncios: 'Anúncios',
};

/**
 * Labels para permissões
 */
export const permissionLabels: Record<Permission, string> = {
  view: 'Visualizar',
  create: 'Criar',
  edit: 'Editar',
  delete: 'Excluir',
};
