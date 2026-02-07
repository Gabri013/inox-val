import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '@/types/firebase';
import type { Produto } from '@/domains/produtos';


export class ProdutosService extends BaseFirestoreService<Produto> {
  constructor() {
    super(COLLECTIONS.produtos);
  }
}

export const produtosService = new ProdutosService();

// Adiciona função getProdutosService para uso em hooks
import { onSnapshot, collection } from "firebase/firestore";
import { getFirestore } from "@/lib/firebase";

export function getProdutosService(callback: (produtos: any[]) => void): () => void {
  const db = getFirestore();
  const ref = collection(db, COLLECTIONS.produtos);
  const unsub = onSnapshot(ref, (snap) => {
    const produtos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(produtos);
  });
  return unsub;
}
