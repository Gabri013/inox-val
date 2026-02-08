/**
 * Camada de persistência local com IndexedDB
 * Abstração que permite trocar para backend futuramente
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { ID } from '@/shared/types/ids';

// Versão atual do banco de dados
const DB_VERSION = 4; // Incrementado para incluir calculadora
void DB_VERSION;
const DB_NAME = 'erp_database';

/**
 * Schema do banco de dados
 */
interface ERPDatabase extends DBSchema {
  usuarios: {
    key: ID;
    value: any;
    indexes: { 'by-email': string; 'by-role': string; 'by-status': string };
  };
  clientes: {
    key: ID;
    value: any;
    indexes: { 'by-nome': string };
  };
  produtos: {
    key: ID;
    value: any;
    indexes: { 'by-codigo': string };
  };
  estoque: {
    key: ID;
    value: any;
    indexes: { 'by-produto': ID };
  };
  movimentos_estoque: {
    key: ID;
    value: any;
    indexes: { 'by-produto': ID; 'by-data': string };
  };
  orcamentos: {
    key: ID;
    value: any;
    indexes: { 'by-cliente': ID; 'by-status': string };
  };
  ordens_producao: {
    key: ID;
    value: any;
    indexes: { 'by-orcamento': ID; 'by-status': string };
  };
  boms: {
    key: ID;
    value: any;
    indexes: { 'by-orcamento': ID };
  };
  pedidos_compra: {
    key: ID;
    value: any;
    indexes: { 'by-status': string };
  };
  nesting: {
    key: ID;
    value: any;
    indexes: { 'by-cliente': ID; 'by-status': string };
  };
  auditoria: {
    key: ID;
    value: any;
    indexes: { 'by-usuario': string; 'by-data': string };
  };
  chatUsers: {
    key: ID;
    value: any;
    indexes: { 'by-nome': string; 'by-status': string };
  };
  conversas: {
    key: ID;
    value: any;
    indexes: { 'by-participantes': string };
  };
  mensagens: {
    key: ID;
    value: any;
    indexes: { 'by-conversa': ID; 'by-remetente': ID; 'by-data': string };
  };
  anuncios: {
    key: ID;
    value: any;
    indexes: { 'by-tipo': string; 'by-ativo': string };
  };
  anunciosLeituras: {
    key: ID;
    value: any;
    indexes: { 'by-anuncio': ID; 'by-usuario': ID };
  };
  calculadora: {
    key: ID;
    value: any;
    indexes: { 'by-usuario': ID };
  };
}

let dbInstance: IDBPDatabase<ERPDatabase> | null = null;

/**
 * Inicializa o banco de dados
 */
export async function initDB(): Promise<IDBPDatabase<ERPDatabase>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<ERPDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      void newVersion;
      void transaction;
      // Migração versão 0 → 1: criar todas as stores
      if (oldVersion < 1) {
        // Clientes
        if (!db.objectStoreNames.contains('clientes')) {
          const clientesStore = db.createObjectStore('clientes', { keyPath: 'id' });
          clientesStore.createIndex('by-nome', 'nome');
        }

        // Produtos
        if (!db.objectStoreNames.contains('produtos')) {
          const produtosStore = db.createObjectStore('produtos', { keyPath: 'id' });
          produtosStore.createIndex('by-codigo', 'codigo');
        }

        // Estoque
        if (!db.objectStoreNames.contains('estoque')) {
          const estoqueStore = db.createObjectStore('estoque', { keyPath: 'id' });
          estoqueStore.createIndex('by-produto', 'produtoId');
        }

        // Movimentos de Estoque
        if (!db.objectStoreNames.contains('movimentos_estoque')) {
          const movimentosStore = db.createObjectStore('movimentos_estoque', { keyPath: 'id' });
          movimentosStore.createIndex('by-produto', 'produtoId');
          movimentosStore.createIndex('by-data', 'data');
        }

        // Orçamentos
        if (!db.objectStoreNames.contains('orcamentos')) {
          const orcamentosStore = db.createObjectStore('orcamentos', { keyPath: 'id' });
          orcamentosStore.createIndex('by-cliente', 'clienteId');
          orcamentosStore.createIndex('by-status', 'status');
        }

        // Ordens de Produção
        if (!db.objectStoreNames.contains('ordens_producao')) {
          const ordensStore = db.createObjectStore('ordens_producao', { keyPath: 'id' });
          ordensStore.createIndex('by-orcamento', 'orcamentoId');
          ordensStore.createIndex('by-status', 'status');
        }

        // BOMs
        if (!db.objectStoreNames.contains('boms')) {
          const bomsStore = db.createObjectStore('boms', { keyPath: 'id' });
          bomsStore.createIndex('by-orcamento', 'orcamentoId');
        }

        // Pedidos de Compra
        if (!db.objectStoreNames.contains('pedidos_compra')) {
          const pedidosStore = db.createObjectStore('pedidos_compra', { keyPath: 'id' });
          pedidosStore.createIndex('by-status', 'status');
        }

        // Nesting
        if (!db.objectStoreNames.contains('nesting')) {
          const nestingStore = db.createObjectStore('nesting', { keyPath: 'id' });
          nestingStore.createIndex('by-cliente', 'clienteId');
          nestingStore.createIndex('by-status', 'status');
        }

        // Auditoria
        if (!db.objectStoreNames.contains('auditoria')) {
          const auditoriaStore = db.createObjectStore('auditoria', { keyPath: 'id' });
          auditoriaStore.createIndex('by-usuario', 'usuario');
          auditoriaStore.createIndex('by-data', 'data');
        }
      }

      // Migração versão 1 → 2: adicionar store de usuários
      if (oldVersion < 2) {
        // Usuários
        if (!db.objectStoreNames.contains('usuarios')) {
          const usuariosStore = db.createObjectStore('usuarios', { keyPath: 'id' });
          usuariosStore.createIndex('by-email', 'email');
          usuariosStore.createIndex('by-role', 'role');
          usuariosStore.createIndex('by-status', 'status');
        }
      }

      // Migração versão 2 → 3: adicionar stores de chat e anúncios
      if (oldVersion < 3) {
        // Chat Users
        if (!db.objectStoreNames.contains('chatUsers')) {
          const chatUsersStore = db.createObjectStore('chatUsers', { keyPath: 'id' });
          chatUsersStore.createIndex('by-nome', 'nome');
          chatUsersStore.createIndex('by-status', 'status');
        }

        // Conversas
        if (!db.objectStoreNames.contains('conversas')) {
          const conversasStore = db.createObjectStore('conversas', { keyPath: 'id' });
          conversasStore.createIndex('by-participantes', 'participantes');
        }

        // Mensagens
        if (!db.objectStoreNames.contains('mensagens')) {
          const mensagensStore = db.createObjectStore('mensagens', { keyPath: 'id' });
          mensagensStore.createIndex('by-conversa', 'conversaId');
          mensagensStore.createIndex('by-remetente', 'remetenteId');
          mensagensStore.createIndex('by-data', 'data');
        }

        // Anúncios
        if (!db.objectStoreNames.contains('anuncios')) {
          const anunciosStore = db.createObjectStore('anuncios', { keyPath: 'id' });
          anunciosStore.createIndex('by-tipo', 'tipo');
          anunciosStore.createIndex('by-ativo', 'ativo');
        }

        // Leituras de Anúncios
        if (!db.objectStoreNames.contains('anunciosLeituras')) {
          const anunciosLeiturasStore = db.createObjectStore('anunciosLeituras', { keyPath: 'id' });
          anunciosLeiturasStore.createIndex('by-anuncio', 'anuncioId');
          anunciosLeiturasStore.createIndex('by-usuario', 'usuarioId');
        }
      }

      // Migração versão 3 → 4: adicionar store de calculadora
      if (oldVersion < 4) {
        // Calculadora
        if (!db.objectStoreNames.contains('calculadora')) {
          const calculadoraStore = db.createObjectStore('calculadora', { keyPath: 'id' });
          calculadoraStore.createIndex('by-usuario', 'usuarioId');
        }
      }
    },
  });

  return dbInstance;
}

/**
 * Obtém instância do DB (lazy initialization)
 */
export async function getDB(): Promise<IDBPDatabase<ERPDatabase>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

/**
 * Tipos de store válidos
 */
export type StoreName = keyof ERPDatabase;

/**
 * Interface genérica de CRUD
 */
export interface CRUDOperations<T> {
  getAll(): Promise<T[]>;
  getById(id: ID): Promise<T | undefined>;
  create(data: T): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}

/**
 * Classe base para operações de storage
 */
export class Storage<T extends { id: ID }> implements CRUDOperations<T> {
  constructor(private storeName: StoreName) {}

  async getAll(): Promise<T[]> {
    const db = await getDB();
    const store = this.storeName as any;
    return db.getAll(store);
  }

  async getById(id: ID): Promise<T | undefined> {
    const db = await getDB();
    const store = this.storeName as any;
    return db.get(store, id);
  }

  async create(data: T): Promise<T> {
    const db = await getDB();
    const store = this.storeName as any;
    await db.add(store, data);
    return data;
  }

  async update(id: ID, data: Partial<T>): Promise<T> {
    const db = await getDB();
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Registro com ID ${id} não encontrado`);
    }
    const updated = { ...existing, ...data, id };
    const store = this.storeName as any;
    await db.put(store, updated);
    return updated;
  }

  async delete(id: ID): Promise<void> {
    const db = await getDB();
    const store = this.storeName as any;
    await db.delete(store, id);
  }

  /**
   * Busca por índice
   */
  async getByIndex(indexName: string, value: any): Promise<T[]> {
    const db = await getDB();
    const store = this.storeName as any;
    return (db as any).getAllFromIndex(store, indexName, value as any);
  }

  /**
   * Limpa toda a store (útil para testes/reset)
   */
  async clear(): Promise<void> {
    const db = await getDB();
    const store = this.storeName as any;
    await db.clear(store);
  }

  /**
   * Define múltiplos registros de uma vez (substitui todos)
   */
  async setAll(items: T[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(this.storeName as any, 'readwrite');
    await tx.store.clear(); // Limpa tudo primeiro
    
    // Adiciona todos os novos items
    for (const item of items) {
      await tx.store.add(item);
    }
    
    await tx.done;
  }
}
