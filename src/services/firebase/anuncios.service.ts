import { db } from '@/shared/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Anuncio, CreateAnuncioDTO, UpdateAnuncioDTO } from '@/domains/anuncios';

const COLLECTION = 'anuncios';

export const anunciosService = {
  async list(filters = {}) {
    let q = collection(db, COLLECTION);
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async get(id) {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id, ...docSnap.data() } : null;
  },
  async create(data: CreateAnuncioDTO) {
    const docRef = await addDoc(collection(db, COLLECTION), data);
    const docSnap = await getDoc(docRef);
    return { id: docRef.id, ...docSnap.data() };
  },
  async update(id: string, data: UpdateAnuncioDTO) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, data);
    const docSnap = await getDoc(docRef);
    return { id, ...docSnap.data() };
  },
  async delete(id: string) {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  }
};
