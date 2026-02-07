import { HttpClient, RequestConfig } from './client';
import { db } from '@/shared/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, limit, startAfter, orderBy } from 'firebase/firestore';

// Helper to parse params for Firestore queries
function buildFirestoreQuery(colRef, params) {
  let q = colRef;
  if (params.search) {
    // Example: search by 'nome' field
    q = query(q, where('nome', '>=', params.search), where('nome', '<=', params.search + '\uf8ff'));
  }
  if (params.status && params.status !== 'all') {
    q = query(q, where('status', '==', params.status));
  }
  if (params.sortBy) {
    q = query(q, orderBy(params.sortBy, params.sortOrder || 'asc'));
  }
  if (params.pageSize) {
    q = query(q, limit(params.pageSize));
  }
  // Pagination (startAfter) can be added if needed
  return q;
}

export const firebaseClient: HttpClient = {
  async get(url: string, config?: RequestConfig) {
    // Only supports /api/clientes for now
    if (url.startsWith('/api/clientes')) {
      const colRef = collection(db, 'clientes');
      const params = config?.params || {};
      const q = buildFirestoreQuery(colRef, params);
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return {
        items,
        total: items.length,
        page: params.page || 1,
        pageSize: params.pageSize || items.length,
        totalPages: 1,
      };
    }
    throw new Error('Not implemented');
  },
  async post(url: string, data?: any, config?: RequestConfig) {
    if (url.startsWith('/api/clientes')) {
      const colRef = collection(db, 'clientes');
      const docRef = await addDoc(colRef, data);
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    }
    throw new Error('Not implemented');
  },
  async put(url: string, data?: any, config?: RequestConfig) {
    if (url.startsWith('/api/clientes/')) {
      const id = url.split('/').pop();
      const docRef = doc(db, 'clientes', id!);
      await updateDoc(docRef, data);
      const docSnap = await getDoc(docRef);
      return { id, ...docSnap.data() };
    }
    throw new Error('Not implemented');
  },
  async patch(url: string, data?: any, config?: RequestConfig) {
    // For simplicity, treat as put
    return this.put(url, data, config);
  },
  async delete(url: string, config?: RequestConfig) {
    if (url.startsWith('/api/clientes/')) {
      const id = url.split('/').pop();
      const docRef = doc(db, 'clientes', id!);
      await deleteDoc(docRef);
      return {};
    }
    throw new Error('Not implemented');
  },
};
