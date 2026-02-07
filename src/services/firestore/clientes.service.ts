import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import type { Cliente } from "@/domains/clientes";

class ClientesService extends FirestoreService<Cliente> {
  constructor() {
    super(COLLECTIONS.clientes, { softDelete: true });
  }
}

export const clientesService = new ClientesService();
