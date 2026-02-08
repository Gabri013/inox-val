import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryConstraint,
  type WhereFilterOp,
  type OrderByDirection,
} from "firebase/firestore";
import { getFirestore, getEmpresaContext, getFirebaseAuth } from "@/lib/firebase";
import { COLLECTIONS } from "@/types/firebase";

export type AuditAction = "create" | "update" | "delete";

export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface QueryOrder {
  field: string;
  direction: OrderByDirection;
}

export interface ListParams {
  where?: QueryFilter[];
  orderBy?: QueryOrder[];
  limit?: number;
  startAfter?: any;
  includeDeleted?: boolean;
}

export interface ListResult<T> {
  items: T[];
  lastDoc?: any;
  hasMore: boolean;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuditLogInput {
  action: AuditAction;
  collection: string;
  documentId: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  empresaId: string;
  userId: string;
}

const db = getFirestore();

function diffObjects(before: Record<string, any> | null, after: Record<string, any> | null) {
  if (!before || !after) return { before, after };
  const diff: Record<string, { before: any; after: any }> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  keys.forEach((key) => {
    if (before[key] !== after[key]) {
      diff[key] = { before: before[key], after: after[key] };
    }
  });
  return diff;
}

export async function getCurrentUserProfile() {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) return null;
  const primaryRef = doc(db, COLLECTIONS.users, user.uid);
  const primarySnap = await getDoc(primaryRef);
  if (primarySnap.exists()) {
    return { id: primarySnap.id, ...primarySnap.data() } as Record<string, any>;
  }
  const legacyRef = doc(db, COLLECTIONS.usuarios, user.uid);
  const legacySnap = await getDoc(legacyRef);
  if (!legacySnap.exists()) return null;
  return { id: legacySnap.id, ...legacySnap.data() } as Record<string, any>;
}

export async function getEmpresaId(): Promise<string> {
  const profile = await getCurrentUserProfile();
  const cached = getEmpresaContext();
  const empresaId = profile?.empresaId || cached.empresaId;

  if (!empresaId) {
    throw new Error("Empresa nao definida no perfil do usuario.");
  }

  return empresaId;
}

export async function getCurrentUserId(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usurio no autenticado.");
  return user.uid;
}

export async function writeAuditLog(input: AuditLogInput) {
  await addDoc(collection(db, COLLECTIONS.audit_logs), {
    ...input,
    timestamp: serverTimestamp(),
    changes: diffObjects(input.before || null, input.after || null),
  });
}

export abstract class FirestoreService<T extends Record<string, any>> {
  protected collectionName: string;
  protected softDelete: boolean;

  constructor(collectionName: string, options?: { softDelete?: boolean }) {
    this.collectionName = collectionName;
    this.softDelete = options?.softDelete ?? true;
  }

  protected async withMetadata(data: Partial<T>, isUpdate = false) {
    const empresaId = await getEmpresaId();
    const userId = await getCurrentUserId();
    return {
      ...data,
      empresaId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      ...(isUpdate ? {} : { createdAt: serverTimestamp(), createdBy: userId, isDeleted: false }),
    };
  }

  async list(params: ListParams = {}): Promise<ServiceResult<ListResult<T>>> {
    try {
      const empresaId = await getEmpresaId();
      const constraints: QueryConstraint[] = [where("empresaId", "==", empresaId)];
      if (!params.includeDeleted) {
        constraints.push(where("isDeleted", "==", false));
      }
      params.where?.forEach((filter) => constraints.push(where(filter.field, filter.operator, filter.value)));
      params.orderBy?.forEach((order) => constraints.push(orderBy(order.field, order.direction)));
      if (params.limit) constraints.push(limit(params.limit));
      if (params.startAfter) constraints.push(startAfter(params.startAfter));
      const q = query(collection(db, this.collectionName), ...constraints);
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
      const lastDoc = snap.docs[snap.docs.length - 1];
      return {
        success: true,
        data: {
          items,
          lastDoc,
          hasMore: params.limit ? snap.size === params.limit : false,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao listar" };
    }
  }

  async getById(id: string): Promise<ServiceResult<T>> {
    try {
      const empresaId = await getEmpresaId();
      const ref = doc(db, this.collectionName, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return { success: false, error: "Documento nao encontrado" };
      const data = { id: snap.id, ...snap.data() } as unknown as T;
      const docEmpresaId = (data as any).empresaId;
      if (docEmpresaId !== empresaId) {
        return { success: false, error: "Acesso negado" };
      }
      if ((data as any).isDeleted) {
        return { success: false, error: "Documento removido" };
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao buscar" };
    }
  }

  async create(data: Omit<T, "id">): Promise<ServiceResult<T>> {
    try {
      const payload = await this.withMetadata(data as Partial<T>, false);
      const ref = await addDoc(collection(db, this.collectionName), payload);
      const created = await this.getById(ref.id);
      if (created.success && created.data) {
        await writeAuditLog({
          action: "create",
          collection: this.collectionName,
          documentId: ref.id,
          before: null,
          after: created.data as Record<string, any>,
          empresaId: (created.data as any).empresaId,
          userId: await getCurrentUserId(),
        });
      }
      return created;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao criar" };
    }
  }

  async update(id: string, data: Partial<T>): Promise<ServiceResult<T>> {
    try {
      const existing = await this.getById(id);
      if (!existing.success || !existing.data) return { success: false, error: existing.error };
      const payload = await this.withMetadata(data as Partial<T>, true);
      const ref = doc(db, this.collectionName, id);
      await updateDoc(ref, payload as DocumentData);
      const updated = await this.getById(id);
      if (updated.success && updated.data) {
        await writeAuditLog({
          action: "update",
          collection: this.collectionName,
          documentId: id,
          before: existing.data as Record<string, any>,
          after: updated.data as Record<string, any>,
          empresaId: (updated.data as any).empresaId,
          userId: await getCurrentUserId(),
        });
      }
      return updated;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar" };
    }
  }

  async remove(id: string): Promise<ServiceResult<void>> {
    try {
      const existing = await this.getById(id);
      if (!existing.success || !existing.data) return { success: false, error: existing.error };

      if (this.softDelete) {
        const ref = doc(db, this.collectionName, id);
        await updateDoc(ref, await this.withMetadata({ isDeleted: true } as unknown as Partial<T>, true));
        await writeAuditLog({
          action: "delete",
          collection: this.collectionName,
          documentId: id,
          before: existing.data as Record<string, any>,
          after: { ...(existing.data as Record<string, any>), isDeleted: true },
          empresaId: (existing.data as any).empresaId,
          userId: await getCurrentUserId(),
        });
        return { success: true };
      }

      await deleteDoc(doc(db, this.collectionName, id));
      await writeAuditLog({
        action: "delete",
        collection: this.collectionName,
        documentId: id,
        before: existing.data as Record<string, any>,
        after: null,
        empresaId: (existing.data as any).empresaId,
        userId: await getCurrentUserId(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao remover" };
    }
  }
}
