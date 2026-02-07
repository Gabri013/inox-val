/**
 * ============================================================================
 * ANÚNCIOS FIRESTORE SERVICE (novo padrão com auditoria + multi-tenant)
 * ============================================================================
 *
 * Substitui services/firebase/anuncios.service.ts.
 * Usa FirestoreService<T> de ./base.ts para CRUD com:
 *  - empresaId automático
 *  - createdBy / updatedBy
 *  - soft delete
 *  - audit_logs
 * ============================================================================
 */

import { FirestoreService, getEmpresaId, getCurrentUserId } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestore } from "@/lib/firebase";
import type {
  Anuncio,
  AnunciosFilters,
  CreateAnuncioDTO,
  UpdateAnuncioDTO,
  AnuncioLeitura,
} from "@/domains/anuncios";

const db = getFirestore();

// ---------------------------------------------------------------------------
// Anúncios CRUD (com auditoria + multi-tenant)
// ---------------------------------------------------------------------------
class AnuncioFirestoreService extends FirestoreService<Anuncio> {
  constructor() {
    super(COLLECTIONS.anuncios, { softDelete: true });
  }
}

const _anuncioService = new AnuncioFirestoreService();

// ---------------------------------------------------------------------------
// API pública — substitui services/firebase/anuncios.service.ts
// ---------------------------------------------------------------------------
export const anunciosService = {
  async getAnuncios(filters?: AnunciosFilters) {
    const whereFilters: Array<{ field: string; operator: any; value: any }> = [];
    if (filters?.status) {
      whereFilters.push({ field: "status", operator: "==", value: filters.status });
    }
    if (filters?.tipo) {
      whereFilters.push({ field: "tipo", operator: "==", value: filters.tipo });
    }
    const res = await _anuncioService.list({ where: whereFilters });
    return res.data?.items ?? [];
  },

  async getAnuncio(id: string) {
    const res = await _anuncioService.getById(id);
    return res.data ?? null;
  },

  async getAnunciosAtivos() {
    const res = await _anuncioService.list({
      where: [{ field: "status", operator: "==", value: "ativo" }],
    });
    return res.data?.items ?? [];
  },

  async createAnuncio(data: CreateAnuncioDTO) {
    const userId = await getCurrentUserId();
    const res = await _anuncioService.create({
      ...data,
      status: data.dataInicio ? "agendado" : "ativo",
      autorId: userId,
      autorNome: "", // preenchido no front se necessário
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    } as any);
    return res.data ?? null;
  },

  async updateAnuncio(id: string, data: UpdateAnuncioDTO) {
    const res = await _anuncioService.update(id, {
      ...data,
      atualizadoEm: new Date().toISOString(),
    } as any);
    return res.data ?? null;
  },

  async deleteAnuncio(id: string) {
    await _anuncioService.remove(id);
  },

  // -- Leituras --
  async marcarComoLido(anuncioId: string) {
    const empresaId = await getEmpresaId();
    const userId = await getCurrentUserId();
    const payload: Omit<AnuncioLeitura, "id"> & { empresaId: string } = {
      anuncioId,
      usuarioId: userId,
      lidoEm: new Date().toISOString(),
      empresaId,
    };
    await addDoc(collection(db, "anuncios_leituras"), {
      ...payload,
      createdAt: serverTimestamp(),
    });
  },

  async getLeituras(anuncioId: string) {
    const empresaId = await getEmpresaId();
    const q = query(
      collection(db, "anuncios_leituras"),
      where("empresaId", "==", empresaId),
      where("anuncioId", "==", anuncioId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as AnuncioLeitura));
  },
};
