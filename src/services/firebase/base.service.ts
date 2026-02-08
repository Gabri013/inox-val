/**
 * ============================================================================
 * BASE FIRESTORE SERVICE
 * ============================================================================
 * 
 * Service genérico para operações CRUD no Firestore com suporte a:
 * - Multi-tenant (isolamento por empresaId)
 * - Timestamps automáticos (createdAt, updatedAt)
 * - Paginação
 * - Filtros complexos
 * - Validações
 * 
 * Todos os services específicos devem estender esta classe.
 * ============================================================================
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryConstraint,
  type WhereFilterOp,
  type OrderByDirection,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { getFirestore, getEmpresaContext } from '@/lib/firebase';
import type { FirebaseDocument } from '@/types/firebase';

export interface PaginationOptions {
  limit?: number;
  startAfter?: any;
}

export interface QueryOptions {
  where?: Array<{
    field: string;
    operator: WhereFilterOp;
    value: any;
  }>;
  orderBy?: Array<{
    field: string;
    direction: OrderByDirection;
  }>;
  limit?: number;
  startAfter?: any;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ListResult<T> {
  items: T[];
  lastDoc?: any;
  hasMore: boolean;
}

/**
 * Classe base para todos os services do Firestore
 */
export abstract class BaseFirestoreService<T extends FirebaseDocument> {
  protected collectionName: string;
  protected db = getFirestore();

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
  * Obtém o empresaId atual (multi-tenant)
   */
  protected getEmpresaId(): string {
    const { empresaId } = getEmpresaContext();
    if (!empresaId) {
      throw new Error('EmpresaId não configurado. Usuário não autenticado?');
    }
    return empresaId;
  }

  /**
  * Adiciona metadados ao documento (empresaId, timestamps)
   */
  protected addMetadata(data: Partial<T>, isUpdate = false): any {
    const metadata: any = {
      empresaId: this.getEmpresaId(),
    };

    if (!isUpdate) {
      metadata.createdAt = serverTimestamp();
    }
    
    metadata.updatedAt = serverTimestamp();

    return { ...data, ...metadata };
  }

  /**
   * Converte Timestamp do Firestore para Date
   */
  protected convertTimestamps(data: DocumentData): T {
    const converted: any = { ...data };

    for (const key in converted) {
      if (converted[key] && typeof converted[key] === 'object' && 'toDate' in converted[key]) {
        converted[key] = (converted[key] as Timestamp).toDate();
      }
    }

    return converted as T;
  }

  /**
   * Busca documento por ID
   */
  async getById(id: string): Promise<ServiceResult<T>> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: `Documento não encontrado: ${id}`,
        };
      }

      const data = this.convertTimestamps({
        id: docSnap.id,
        ...docSnap.data(),
      });

      // Validar empresaId (segurança)
      const empresaId = this.getEmpresaId();
      const docEmpresaId = (data as any).empresaId;
      if (docEmpresaId !== empresaId) {
        return {
          success: false,
          error: 'Acesso negado: documento de outra empresa',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Lista documentos com filtros opcionais
   */
  async list(options?: QueryOptions): Promise<ServiceResult<ListResult<T>>> {
    try {
      const empresaId = this.getEmpresaId();
      const constraints: QueryConstraint[] = [
        where('empresaId', '==', empresaId),
      ];

      // Adicionar filtros
      if (options?.where) {
        options.where.forEach((filter) => {
          constraints.push(where(filter.field, filter.operator, filter.value));
        });
      }

      // Adicionar ordenação
      if (options?.orderBy) {
        options.orderBy.forEach((order) => {
          constraints.push(orderBy(order.field, order.direction));
        });
      }

      // Adicionar paginação
      if (options?.limit) {
        constraints.push(limit(options.limit));
      }

      if (options?.startAfter) {
        constraints.push(startAfter(options.startAfter));
      }

      const q = query(collection(this.db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      const items: T[] = [];
      querySnapshot.forEach((doc) => {
        items.push(
          this.convertTimestamps({
            id: doc.id,
            ...doc.data(),
          })
        );
      });

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      const hasMore = querySnapshot.size === (options?.limit || 0);

      return {
        success: true,
        data: {
          items,
          lastDoc,
          hasMore,
        },
      };
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Cria novo documento
   */
  async create(data: Omit<T, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>): Promise<ServiceResult<T>> {
    try {
      // Validar antes de criar (implementado nas subclasses)
      const validation = await this.validate(data as Partial<T>);
      if (!validation.success) {
        return validation as ServiceResult<T>;
      }

      const docData = this.addMetadata(data as Partial<T>, false);
      const docRef = await addDoc(collection(this.db, this.collectionName), docData);

      // Buscar documento criado para retornar com timestamps convertidos
      const created = await this.getById(docRef.id);
      return created;
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Atualiza documento existente
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'empresaId' | 'createdAt'>>): Promise<ServiceResult<T>> {
    try {
      // Verificar se documento existe e pertence ao tenant
      const existing = await this.getById(id);
      if (!existing.success) {
        return existing;
      }

      // Validar antes de atualizar
      const validation = await this.validate(data as Partial<T>, id);
      if (!validation.success) {
        return validation as ServiceResult<T>;
      }

      const docRef = doc(this.db, this.collectionName, id);
      const docData = this.addMetadata(data as Partial<T>, true);

      // Remover campos que não devem ser atualizados
      delete (docData as any).id;
      delete (docData as any).empresaId;
      delete (docData as any).createdAt;

      await updateDoc(docRef, docData);

      // Buscar documento atualizado
      const updated = await this.getById(id);
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Remove documento
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      // Verificar se documento existe e pertence ao tenant
      const existing = await this.getById(id);
      if (!existing.success) {
        return { success: false, error: existing.error };
      }

      const docRef = doc(this.db, this.collectionName, id);
      await deleteDoc(docRef);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Validação customizada (implementar nas subclasses)
   */
  protected async validate(_data: Partial<T>, _id?: string): Promise<ServiceResult<void>> {
    // Implementação padrão - sem validação
    // Subclasses devem sobrescrever este método
    return { success: true };
  }
}
