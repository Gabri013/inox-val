/**
 * Tipos e configurações para Firebase
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Interface base para documentos Firebase (multi-tenant)
 */
export interface FirebaseDocument {
  id: string;
  empresaId?: string; // ID da empresa (isolamento de dados)
  createdAt?: Date | string; // Timestamp de criação
  updatedAt?: Date | string; // Timestamp de atualização
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

/**
 * Metadados de auditoria para operações
 */
export interface AuditMetadata {
  userId: string;
  userName: string;
  timestamp: Date;
  operation: 'create' | 'update' | 'delete';
  changes?: Record<string, { old: any; new: any }>;
}

/**
 * Estrutura de coleções do Firestore
 */
export interface FirestoreCollections {
  // Empresas (tenants)
  empresas: 'empresas';

  // Usuários
  users: 'users';
  usuarios: 'usuarios'; // legado

  // Domínios principais
  clientes: 'clientes';
  produtos: 'produtos';
  estoque_itens: 'estoque_itens';
  estoque_movimentos: 'estoque_movimentos';
  orcamentos: 'orcamentos';
  ordens_producao: 'ordens_producao';
  apontamentos: 'apontamentos';
  compras: 'compras';
  configuracoes: 'configuracoes';
  calculos: 'calculos';
  calculadora_historico: 'calculadora_historico';
  audit_logs: 'audit_logs';

  // Chat & Anúncios
  conversas: 'conversas';
  mensagens: 'mensagens';
  chat_usuarios: 'chat_usuarios';
  anuncios: 'anuncios';

  // Legado
  solicitacoes_compra: 'solicitacoes_compra';
  materiais: 'materiais';
  estoque_materiais: 'estoque_materiais';
  movimentacoes_estoque: 'movimentacoes_estoque';
  auditoria: 'auditoria';
  logs: 'logs';
}

export const COLLECTIONS: FirestoreCollections = {
  empresas: 'empresas',
  users: 'users',
  usuarios: 'usuarios',
  clientes: 'clientes',
  produtos: 'produtos',
  estoque_itens: 'estoque_itens',
  estoque_movimentos: 'estoque_movimentos',
  orcamentos: 'orcamentos',
  ordens_producao: 'ordens_producao',
  apontamentos: 'apontamentos',
  compras: 'compras',
  configuracoes: 'configuracoes',
  calculos: 'calculos',
  calculadora_historico: 'calculadora_historico',
  audit_logs: 'audit_logs',
  conversas: 'conversas',
  mensagens: 'mensagens',
  chat_usuarios: 'chat_usuarios',
  anuncios: 'anuncios',
  solicitacoes_compra: 'solicitacoes_compra',
  materiais: 'materiais',
  estoque_materiais: 'estoque_materiais',
  movimentacoes_estoque: 'movimentacoes_estoque',
  auditoria: 'auditoria',
  logs: 'logs',
};

/**
 * Interface para empresa (tenant)
 */
export interface Empresa extends FirebaseDocument {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  estado: string;
  cep?: string;
  plano: 'basico' | 'profissional' | 'empresarial';
  ativo: boolean;
  dataExpiracao?: Date;
}

/**
 * Interface para usuário
 */
export interface Usuario extends FirebaseDocument {
  email: string;
  nome: string;
  role: 'ADMIN' | 'VENDEDOR' | 'ENGENHEIRO' | 'OPERADOR' | 'COMPRADOR' | 'ESTOQUISTA';
  ativo: boolean;
  ultimoAcesso?: Date;
}

/**
 * Query helper types
 */
export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in';

export interface QueryConstraint {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface OrderByConstraint {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  limit?: number;
  startAfter?: any;
  endBefore?: any;
}
