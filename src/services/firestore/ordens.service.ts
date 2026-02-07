import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import type { OrdemProducao } from "@/app/types/workflow";

class OrdensService extends FirestoreService<OrdemProducao> {
  constructor() {
    super(COLLECTIONS.ordens_producao, { softDelete: true });
  }
}

export const ordensService = new OrdensService();
