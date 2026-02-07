/**
 * ============================================================================
 * CHAT FIRESTORE SERVICE (novo padrão com auditoria + multi-tenant)
 * ============================================================================
 *
 * Substitui services/firebase/chat.service.ts.
 * Agrupa operações de conversas, mensagens e status do chat
 * usando FirestoreService<T> para conversas e helpers manuais
 * para mensagens (sub-coleção sem soft delete).
 * ============================================================================
 */

import { FirestoreService, getEmpresaId, getCurrentUserId, writeAuditLog } from "./base";
import { COLLECTIONS } from "@/types/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestore } from "@/lib/firebase";
import type {
  ChatUser,
  ChatMessage,
  Conversa,
  CreateConversaDTO,
  SendMessageDTO,
  UpdateStatusDTO,
  ChatFilters,
  MensagensFilters,
} from "@/domains/chat";

const db = getFirestore();

// ---------------------------------------------------------------------------
// Conversas service (usa base com auditoria)
// ---------------------------------------------------------------------------
class ConversaService extends FirestoreService<Conversa> {
  constructor() {
    super(COLLECTIONS.conversas, { softDelete: false });
  }
}

const conversaService = new ConversaService();

// ---------------------------------------------------------------------------
// Chat service (API pública – substitui services/firebase/chat.service.ts)
// ---------------------------------------------------------------------------
export const chatService = {
  // -- Usuários do chat --
  async getUsuarios(filters?: ChatFilters) {
    const empresaId = await getEmpresaId();
    const constraints = [where("empresaId", "==", empresaId)];
    if (filters?.status) {
      constraints.push(where("status", "==", filters.status));
    }
    const q = query(collection(db, COLLECTIONS.chat_usuarios), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as ChatUser));
  },

  async getUsuario(id: string) {
    const ref = doc(db, COLLECTIONS.chat_usuarios, id);
    const snap = await getDoc(ref);
    return snap.exists() ? ({ id, ...snap.data() } as unknown as ChatUser) : null;
  },

  async updateStatus(data: UpdateStatusDTO) {
    const userId = await getCurrentUserId();
    const ref = doc(db, COLLECTIONS.chat_usuarios, userId);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  },

  // -- Conversas --
  async getConversas() {
    const res = await conversaService.list();
    return res.data?.items ?? [];
  },

  async getConversa(id: string) {
    const res = await conversaService.getById(id);
    return res.data ?? null;
  },

  async createConversa(data: CreateConversaDTO) {
    const userId = await getCurrentUserId();
    const res = await conversaService.create({
      participantes: [userId, data.participanteId],
      mensagensNaoLidas: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    } as any);
    return res.data ?? null;
  },

  async deleteConversa(id: string) {
    await conversaService.remove(id);
  },

  // -- Mensagens --
  async getMensagens(filters: MensagensFilters) {
    const empresaId = await getEmpresaId();
    const constraints = [
      where("empresaId", "==", empresaId),
      where("conversaId", "==", filters.conversaId),
      orderBy("criadoEm", "asc"),
    ];
    const q = query(collection(db, COLLECTIONS.mensagens), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as ChatMessage));
  },

  async sendMensagem(data: SendMessageDTO) {
    const empresaId = await getEmpresaId();
    const userId = await getCurrentUserId();
    const payload = {
      ...data,
      remetenteId: userId,
      lida: false,
      tipo: data.tipo ?? "text",
      empresaId,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      createdAt: serverTimestamp(),
      createdBy: userId,
    };
    const ref = await addDoc(collection(db, COLLECTIONS.mensagens), payload);
    const snap = await getDoc(ref);

    await writeAuditLog({
      action: "create",
      collection: COLLECTIONS.mensagens,
      documentId: ref.id,
      before: null,
      after: snap.data() as Record<string, any>,
      empresaId,
      userId,
    });

    return { id: ref.id, ...snap.data() } as unknown as ChatMessage;
  },

  // -- Leitura de mensagens --
  async marcarComoLida(mensagemId: string) {
    const ref = doc(db, COLLECTIONS.mensagens, mensagemId);
    await updateDoc(ref, { lida: true, updatedAt: serverTimestamp() });
  },

  async marcarTodasComoLidas(conversaId: string) {
    const empresaId = await getEmpresaId();
    const q = query(
      collection(db, COLLECTIONS.mensagens),
      where("empresaId", "==", empresaId),
      where("conversaId", "==", conversaId),
      where("lida", "==", false)
    );
    const snap = await getDocs(q);
    const updates = snap.docs.map((d) =>
      updateDoc(doc(db, COLLECTIONS.mensagens, d.id), { lida: true, updatedAt: serverTimestamp() })
    );
    await Promise.all(updates);
  },
};
