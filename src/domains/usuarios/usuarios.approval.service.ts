/**
 * ServiÃ§o de aprovaÃ§Ã£o de usuÃ¡rios (Firestore)
 */

import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirestore } from '@/lib/firebase';

export type ApprovalStatus = 'pendente' | 'aprovado' | 'todos';

export interface PendingUser {
  id: string;
  nome?: string;
  email?: string;
  role?: string;
  ativo?: boolean;
  createdAt?: any;
  updatedAt?: any;
  approvedAt?: any;
}

export interface ApprovalHistory {
  id: string;
  userId: string;
  nome?: string;
  email?: string;
  role?: string;
  approvedBy?: string;
  approvedByEmail?: string;
  createdAt?: any;
}

type ApprovalActor = {
  uid?: string | null;
  email?: string | null;
};

class UsuariosApprovalService {
  subscribeUsuarios(
    empresaId: string | null,
    status: ApprovalStatus,
    onData: (users: PendingUser[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!empresaId) {
      onData([]);
      return () => {};
    }

    const db = getFirestore();
    const baseRef = collection(db, 'usuarios');
    const ref =
      status === 'pendente'
        ? query(baseRef, where('empresaId', '==', empresaId), where('ativo', '==', false), orderBy('createdAt', 'desc'))
        : status === 'aprovado'
          ? query(baseRef, where('empresaId', '==', empresaId), where('ativo', '==', true), orderBy('approvedAt', 'desc'))
          : query(baseRef, where('empresaId', '==', empresaId), orderBy('createdAt', 'desc'));

    return onSnapshot(
      ref,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        onData(list);
      },
      (error) => {
        if (onError) onError(error as Error);
      }
    );
  }

  subscribeHistorico(
    empresaId: string | null,
    onData: (items: ApprovalHistory[]) => void
  ): Unsubscribe {
    if (!empresaId) {
      onData([]);
      return () => {};
    }

    const db = getFirestore();
    const ref = query(
      collection(db, 'usuarios_aprovacoes'),
      where('empresaId', '==', empresaId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(ref, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      onData(list);
    });
  }

  async approveUser(
    empresaId: string | null,
    usuarioId: string,
    role: string,
    actor: ApprovalActor,
    usuario?: { nome?: string; email?: string }
  ): Promise<void> {
    const db = getFirestore();

    await updateDoc(doc(db, 'usuarios', usuarioId), {
      ativo: true,
      role,
      updatedAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
      approvedBy: actor.uid || null,
      approvedByEmail: actor.email || null,
    });

    await addDoc(collection(db, 'usuarios_aprovacoes'), {
      userId: usuarioId,
      nome: usuario?.nome || 'UsuÃ¡rio',
      email: usuario?.email || null,
      role,
      approvedBy: actor.uid || null,
      approvedByEmail: actor.email || null,
      empresaId: empresaId || null,
      createdAt: serverTimestamp(),
    });
  }

  async setActive(
    usuarioId: string,
    ativo: boolean,
    actor: ApprovalActor
  ): Promise<void> {
    const db = getFirestore();
    await updateDoc(doc(db, 'usuarios', usuarioId), {
      ativo,
      updatedAt: serverTimestamp(),
      updatedBy: actor.uid || null,
      updatedByEmail: actor.email || null,
      ...(ativo
        ? {
            approvedAt: serverTimestamp(),
            approvedBy: actor.uid || null,
            approvedByEmail: actor.email || null,
          }
        : {}),
    });
  }
}

export const usuariosApprovalService = new UsuariosApprovalService();
