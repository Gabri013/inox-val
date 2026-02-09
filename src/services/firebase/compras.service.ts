import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getEmpresaContext, getFirestore } from "@/lib/firebase";

// Servico para buscar compras para o dashboard
export function getComprasService(callback: (compras: any[]) => void): () => void {
  const empresaInfo = getEmpresaContext();
  if (!empresaInfo.empresaId) {
    return () => {};
  }

  const db = getFirestore();
  const ref = query(
    collection(db, "compras"),
    where("empresaId", "==", empresaInfo.empresaId)
  );

  const unsub = onSnapshot(ref, (snap) => {
    const compras = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(compras);
  });

  return unsub;
}
