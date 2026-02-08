import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { getFirestore } from '@/lib/firebase';
import { getCurrentUserId, writeAuditLog } from '@/services/firestore/base';
import type {
  MovimentacaoItem,
  ProducaoItem,
  SetorProducao,
  StatusProducaoItem,
} from '../producao.types';

/**
 * Service do domínio de Produção.
 *
 * Restrições (ver `CONTEXT.md`):
 * - Produção é operacional e estável: não alterar fluxo de negócio.
 * - Multi-tenant é obrigatório: toda query/read/write deve ser escopada por `empresaId`.
 * - Não modificar `firestore.rules`.
 */

export type MovimentacaoInput = {
  setorOrigem: SetorProducao | null;
  setorDestino: SetorProducao;
  operadorId: string;
  operadorNome: string;
  dataHora?: string;
  observacoes?: string;
  fotos?: string[];
};

const db = getFirestore();

type FirestoreValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: FirestoreValue }
  | FirestoreValue[];

type FirestoreData = Record<string, FirestoreValue>;

function toStringField(value: FirestoreValue): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
}

async function auditUpdate(params: {
  empresaId: string;
  collectionPath: string;
  documentId: string;
  before: FirestoreData | null;
  after: FirestoreData | null;
}) {
  await writeAuditLog({
    action: 'update',
    collection: params.collectionPath,
    documentId: params.documentId,
    before: params.before,
    after: params.after,
    empresaId: params.empresaId,
    userId: await getCurrentUserId(),
  });
}

async function auditCreate(params: {
  empresaId: string;
  collectionPath: string;
  documentId: string;
  after: FirestoreData | null;
}) {
  await writeAuditLog({
    action: 'create',
    collection: params.collectionPath,
    documentId: params.documentId,
    before: null,
    after: params.after,
    empresaId: params.empresaId,
    userId: await getCurrentUserId(),
  });
}

class ProducaoItensService {
  async getItensPorSetor(empresaId: string, setor: SetorProducao): Promise<ProducaoItem[]> {
    const q = query(
      collectionGroup(db, 'itens'),
      where('empresaId', '==', empresaId),
      where('setorAtual', '==', setor),
      orderBy('updatedAt', 'desc')
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreData) } as ProducaoItem));
  }

  async moverItemDeSetor(
    orderId: string,
    itemId: string,
    novoSetor: SetorProducao,
    mov?: Partial<MovimentacaoInput>
  ): Promise<void> {
    const itemRef = doc(db, 'ordens_producao', orderId, 'itens', itemId);
    const beforeSnap = await getDoc(itemRef);
    if (!beforeSnap.exists()) throw new Error('Item não encontrado');

    const before = beforeSnap.data() as FirestoreData;
    const empresaId = toStringField(before.empresaId);
    if (!empresaId) throw new Error('empresaId ausente no item');

    const userId = await getCurrentUserId();

    await updateDoc(itemRef, {
      setorAtual: novoSetor,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const afterSnap = await getDoc(itemRef);
    const after = afterSnap.exists() ? (afterSnap.data() as FirestoreData) : null;

    await auditUpdate({
      empresaId,
      collectionPath: `ordens_producao/${orderId}/itens`,
      documentId: itemId,
      before,
      after,
    });

    await this.registrarMovimentacao(orderId, itemId, {
      setorOrigem: (before.setorAtual as SetorProducao | null) ?? null,
      setorDestino: novoSetor,
      operadorId: mov?.operadorId || toStringField(before.updatedBy) || userId,
      operadorNome: mov?.operadorNome || toStringField(before.operadorNome) || 'Operador',
      dataHora: mov?.dataHora,
      fotos: mov?.fotos,
      observacoes: mov?.observacoes || 'Movido de setor',
    });
  }

  async atualizarStatusItem(
    orderId: string,
    itemId: string,
    status: StatusProducaoItem,
    mov?: Partial<MovimentacaoInput>
  ): Promise<void> {
    const itemRef = doc(db, 'ordens_producao', orderId, 'itens', itemId);
    const beforeSnap = await getDoc(itemRef);
    if (!beforeSnap.exists()) throw new Error('Item não encontrado');

    const before = beforeSnap.data() as FirestoreData;
    const empresaId = toStringField(before.empresaId);
    if (!empresaId) throw new Error('empresaId ausente no item');

    const userId = await getCurrentUserId();

    await updateDoc(itemRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const afterSnap = await getDoc(itemRef);
    const after = afterSnap.exists() ? (afterSnap.data() as FirestoreData) : null;

    await auditUpdate({
      empresaId,
      collectionPath: `ordens_producao/${orderId}/itens`,
      documentId: itemId,
      before,
      after,
    });

    await this.registrarMovimentacao(orderId, itemId, {
      setorOrigem: (before.setorAtual as SetorProducao | null) ?? null,
      setorDestino: (before.setorAtual as SetorProducao) ?? ('Corte' as SetorProducao),
      operadorId: mov?.operadorId || toStringField(before.updatedBy) || userId,
      operadorNome: mov?.operadorNome || toStringField(before.operadorNome) || 'Operador',
      dataHora: mov?.dataHora,
      fotos: mov?.fotos,
      observacoes: mov?.observacoes || `Status alterado para: ${status}`,
    });
  }

  async registrarMovimentacao(orderId: string, itemId: string, movimento: Partial<MovimentacaoInput>): Promise<void> {
    const itemRef = doc(db, 'ordens_producao', orderId, 'itens', itemId);
    const itemSnap = await getDoc(itemRef);
    if (!itemSnap.exists()) throw new Error('Item não encontrado');

    const item = itemSnap.data() as FirestoreData;
    const empresaId = toStringField(item.empresaId);
    if (!empresaId) throw new Error('empresaId ausente no item');

    const userId = await getCurrentUserId();

    const payload = {
      empresaId,
      orderId,
      ordemItemId: itemId,
      setorOrigem: movimento.setorOrigem ?? ((item.setorAtual as SetorProducao | null) ?? null),
      setorDestino:
        movimento.setorDestino ?? ((item.setorAtual as SetorProducao | null) ?? ('Corte' as SetorProducao)),
      operadorId: movimento.operadorId ?? userId,
      operadorNome: movimento.operadorNome ?? 'Operador',
      dataHora: movimento.dataHora ?? new Date().toISOString(),
      observacoes: movimento.observacoes,
      fotos: movimento.fotos,
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      isDeleted: false,
    } as Omit<MovimentacaoItem, 'id'>;

    const movRef = await addDoc(collection(db, 'ordens_producao', orderId, 'movimentacoes'), payload);

    await auditCreate({
      empresaId,
      collectionPath: `ordens_producao/${orderId}/movimentacoes`,
      documentId: movRef.id,
      after: payload as FirestoreData,
    });
  }
}

export const producaoItensService = new ProducaoItensService();
