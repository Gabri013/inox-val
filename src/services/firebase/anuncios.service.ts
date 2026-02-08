import { db } from '@/shared/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { CreateAnuncioDTO, UpdateAnuncioDTO } from '@/domains/anuncios';

const COLLECTION = 'anuncios';

type AnunciosFilters = { status?: string };

export const anunciosService = {
  async list(filters: AnunciosFilters = {}) {
    let q: any = collection(db, COLLECTION);
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
  },
  async get(id: string) {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id, ...(docSnap.data() as any) } : null;
  },
  async create(data: CreateAnuncioDTO) {
    const docRef = await addDoc(collection(db, COLLECTION), data);
    const docSnap = await getDoc(docRef);
    return { id: docRef.id, ...(docSnap.data() as any) };
  },
  async update(id: string, data: UpdateAnuncioDTO) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, data as any);
    const docSnap = await getDoc(docRef);
    return { id, ...docSnap.data() };
  },
  async delete(id: string) {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  }
};
