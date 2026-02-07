/**
 * ============================================================================
 * PRODUÇÃO FIRESTORE SERVICE (novo padrão com auditoria + soft delete)
 * ============================================================================
 *
 * Substitui services/firebase/producao.service.ts.
 * Usa FirestoreService<T> de ./base.ts que garante:
 *  - empresaId automático
 *  - createdBy / updatedBy
 *  - soft delete (isDeleted)
 *  - audit_logs
 * ============================================================================
 */

import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import type { OrdemProducaoCompleta } from "@/domains/producao";

class ProducaoFirestoreService extends FirestoreService<OrdemProducaoCompleta> {
  constructor() {
    super(COLLECTIONS.ordens_producao, { softDelete: true });
  }
}

export const producaoService = new ProducaoFirestoreService();

// Re-exportar a classe para quem precisar estender
export { ProducaoFirestoreService };
