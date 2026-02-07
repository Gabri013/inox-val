import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getEmpresaContext, getFirestore } from "@/lib/firebase";
import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '@/types/firebase';
import type { MovimentoEstoque } from '@/domains/estoque';

export class EstoqueService extends BaseFirestoreService<MovimentoEstoque> {
  constructor() {
    super(COLLECTIONS.movimentacoes_estoque);
  }
}

export const estoqueService = new EstoqueService();

export function getEstoqueService(callback: (materiais: any[]) => void): () => void {
  const empresaInfo = getEmpresaContext();
  if (!empresaInfo.empresaId) {
    return () => {};
  }

  const db = getFirestore();
  const ref = query(
    collection(db, COLLECTIONS.movimentacoes_estoque),
    where("empresaId", "==", empresaInfo.empresaId)
  );
  const unsub = onSnapshot(ref, (snap) => {
    const materiais = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(materiais);
  });
  return unsub;
}
