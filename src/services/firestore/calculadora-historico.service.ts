import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirestore } from "@/lib/firebase";
import { COLLECTIONS } from "@/types/firebase";
import {
  FirestoreService,
  getEmpresaId,
  getCurrentUserId,
  writeAuditLog,
  type ServiceResult,
} from "./base";

export interface CalculadoraHistoricoItem {
  id: string;
  assinatura: string;
  modeloLabel: string;
  tipo: "unitario" | "lote";
  totalMesas: number;
  dimensoes: string;
  material: string;
  espessura: number;
  batchId?: string;
  totalChapas?: number;
  eficiencia?: number;
  usageCount?: number;
  bomResumo?: {
    componentes: number;
    areaChapas: number;
    custoTotal: number;
  };
  userId: string;
  empresaId: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

export type HistoricoPayload = Omit<
  CalculadoraHistoricoItem,
  "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "empresaId" | "userId" | "usageCount" | "isDeleted"
> & {
  userId: string;
};

class CalculadoraHistoricoService extends FirestoreService<CalculadoraHistoricoItem> {
  constructor() {
    super(COLLECTIONS.calculadora_historico, { softDelete: false });
  }

  subscribeByUser(userId: string, onChange: (items: CalculadoraHistoricoItem[]) => void) {
    const db = getFirestore();
    let unsubscribe = () => {};

    getEmpresaId()
      .then((empresaId) => {
        const ref = query(
          collection(db, this.collectionName),
          where("empresaId", "==", empresaId),
          where("userId", "==", userId),
          orderBy("updatedAt", "desc"),
          limit(25)
        );

        unsubscribe = onSnapshot(ref, (snap) => {
          const list = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as any),
          })) as CalculadoraHistoricoItem[];
          onChange(list);
        });
      })
      .catch(() => {
        onChange([]);
      });

    return () => unsubscribe();
  }

  async upsertBySignature(payloads: HistoricoPayload[]): Promise<ServiceResult<{ created: string[]; updated: string[] }>> {
    if (payloads.length === 0) {
      return { success: true, data: { created: [], updated: [] } };
    }

    try {
      const db = getFirestore();
      const empresaId = await getEmpresaId();
      const userId = await getCurrentUserId();
      const createdIds: string[] = [];
      const updatedIds: string[] = [];

      const batch = writeBatch(db);
      const updatesForAudit: Array<{
        id: string;
        before: Record<string, any> | null;
        after: Record<string, any> | null;
        action: "create" | "update";
      }> = [];

      for (const payload of payloads) {
        const sigQuery = query(
          collection(db, this.collectionName),
          where("userId", "==", payload.userId),
          where("assinatura", "==", payload.assinatura),
          limit(1)
        );
        const sigSnap = await getDocs(sigQuery);

        if (!sigSnap.empty) {
          const docSnap = sigSnap.docs[0];
          const ref = docSnap.ref;
          const before = { id: docSnap.id, ...(docSnap.data() as any) };
          const updatePayload = await this.withMetadata(
            {
              totalMesas: payload.totalMesas,
              totalChapas: payload.totalChapas ?? 0,
              eficiencia: payload.eficiencia ?? 0,
              usageCount: increment(1),
            } as unknown as Partial<CalculadoraHistoricoItem>,
            true
          );
          batch.update(ref, updatePayload as any);
          updatedIds.push(docSnap.id);
          updatesForAudit.push({
            id: docSnap.id,
            before,
            after: {
              ...before,
              totalMesas: payload.totalMesas,
              totalChapas: payload.totalChapas ?? 0,
              eficiencia: payload.eficiencia ?? 0,
              updatedAt: serverTimestamp(),
              updatedBy: userId,
            },
            action: "update",
          });
          continue;
        }

        const ref = doc(collection(db, this.collectionName));
        const createPayload = await this.withMetadata(
          {
            ...payload,
            empresaId,
            userId,
            usageCount: 1,
            isDeleted: false,
          } as Partial<CalculadoraHistoricoItem>,
          false
        );
        batch.set(ref, createPayload as any);
        createdIds.push(ref.id);
        updatesForAudit.push({
          id: ref.id,
          before: null,
          after: { id: ref.id, ...createPayload },
          action: "create",
        });
      }

      await batch.commit();

      await Promise.all(
        updatesForAudit.map((entry) =>
          writeAuditLog({
            action: entry.action,
            collection: this.collectionName,
            documentId: entry.id,
            before: entry.before,
            after: entry.after,
            empresaId,
            userId,
          })
        )
      );

      await writeAuditLog({
        action: "create",
        collection: this.collectionName,
        documentId: `batch-${Date.now()}`,
        before: null,
        after: {
          count: payloads.length,
          created: createdIds.length,
          updated: updatedIds.length,
        },
        empresaId,
        userId,
      });

      return { success: true, data: { created: createdIds, updated: updatedIds } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao salvar lote" };
    }
  }
}

export const calculadoraHistoricoService = new CalculadoraHistoricoService();
