import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import type { Produto } from "@/domains/produtos";

class ProdutosService extends FirestoreService<Produto> {
  constructor() {
    super(COLLECTIONS.produtos, { softDelete: true });
  }
}

export const produtosService = new ProdutosService();
