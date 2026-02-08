import { db } from '@/shared/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { CreateConversaDTO, SendMessageDTO, UpdateStatusDTO } from '@/domains/chat';

const CONVERSAS = 'conversas';
const MENSAGENS = 'mensagens';
const USUARIOS = 'chat_usuarios';

type ChatFilters = { status?: string };

export const chatService = {
  async listUsuarios(filters: ChatFilters = {}) {
    let q: any = collection(db, USUARIOS);
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
  },
  async getUsuario(id: string) {
    const docRef = doc(db, USUARIOS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id, ...(docSnap.data() as any) } : null;
  },
  async updateStatus(id: string, data: UpdateStatusDTO) {
    const docRef = doc(db, USUARIOS, id);
    await updateDoc(docRef, data as any);
  },
  async listConversas() {
    const snapshot = await getDocs(collection(db, CONVERSAS));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
  },
  async getConversa(id: string) {
    const docRef = doc(db, CONVERSAS, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id, ...(docSnap.data() as any) } : null;
  },
  async createConversa(data: CreateConversaDTO) {
    const docRef = await addDoc(collection(db, CONVERSAS), data);
    const docSnap = await getDoc(docRef);
    return { id: docRef.id, ...(docSnap.data() as any) };
  },
  async deleteConversa(id: string) {
    const docRef = doc(db, CONVERSAS, id);
    await deleteDoc(docRef);
  },
  async listMensagens(conversaId: string) {
    const q = query(collection(db, MENSAGENS), where('conversaId', '==', conversaId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
  },
  async sendMessage(data: SendMessageDTO) {
    const docRef = await addDoc(collection(db, MENSAGENS), data);
    const docSnap = await getDoc(docRef);
    return { id: docRef.id, ...(docSnap.data() as any) };
  }
};
