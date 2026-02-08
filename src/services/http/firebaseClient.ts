import { HttpClient, RequestConfig } from './client';
import { db } from '@/shared/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, limit, orderBy } from 'firebase/firestore';

// Helper to parse params for Firestore queries
type QueryParams = Record<string, unknown>;

function buildFirestoreQuery(colRef: ReturnType<typeof collection>, params: QueryParams) {
  let q: any = colRef;
  if (params.search) {
    // Example: search by 'nome' field
    q = query(q, where('nome', '>=', params.search as any), where('nome', '<=', `${params.search}\uf8ff`));
  }
  if (params.status && params.status !== 'all') {
    q = query(q, where('status', '==', params.status as any));
  }
  if (params.sortBy) {
    q = query(q, orderBy(params.sortBy as any, (params.sortOrder as any) || 'asc'));
  }
  if (params.pageSize) {
    q = query(q, limit(params.pageSize as any));
  }
  // Pagination (startAfter) can be added if needed
  return q;
}

export const firebaseClient: HttpClient = {
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    // Only supports /api/clientes for now
    if (url.startsWith('/api/clientes')) {
      const colRef = collection(db, 'clientes');
      const params = config?.params || {};
      const q = buildFirestoreQuery(colRef, params);
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) }));
      return {
        items,
        total: items.length,
        page: params.page || 1,
        pageSize: params.pageSize || items.length,
        totalPages: 1,
      } as T;
    }
    throw new Error('Not implemented');
  },
  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    void config;
    if (url.startsWith('/api/clientes')) {
      const colRef = collection(db, 'clientes');
      const docRef = await addDoc(colRef, data);
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() } as T;
    }
    throw new Error('Not implemented');
  },
  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    void config;
    if (url.startsWith('/api/clientes/')) {
      const id = url.split('/').pop();
      const docRef = doc(db, 'clientes', id!);
      await updateDoc(docRef, data);
      const docSnap = await getDoc(docRef);
      return { id, ...docSnap.data() } as T;
    }
    throw new Error('Not implemented');
  },
  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    // For simplicity, treat as put
    return this.put<T>(url, data, config);
  },
  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    void config;
    if (url.startsWith('/api/clientes/')) {
      const id = url.split('/').pop();
      const docRef = doc(db, 'clientes', id!);
      await deleteDoc(docRef);
      return {} as T;
    }
    throw new Error('Not implemented');
  },
};
