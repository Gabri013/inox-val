import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import type { SolicitacaoCompra } from "@/app/types/workflow";

class ComprasService extends FirestoreService<SolicitacaoCompra> {
  constructor() {
    super(COLLECTIONS.compras, { softDelete: true });
  }
}

export const comprasService = new ComprasService();
