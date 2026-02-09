import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestore } from "@/lib/firebase";
import { COLLECTIONS } from "@/types/firebase";
import { FirestoreService, getEmpresaId, getCurrentUserId, writeAuditLog } from "./base";
import type { MovimentoEstoque, SaldoEstoque } from "@/domains/estoque";

export interface EstoqueItem extends SaldoEstoque {
  id: string;
  empresaId?: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

class EstoqueItensService extends FirestoreService<EstoqueItem> {
  constructor() {
    super(COLLECTIONS.estoque_itens, { softDelete: true });
  }
}

class EstoqueMovimentosService extends FirestoreService<MovimentoEstoque> {
  constructor() {
    super(COLLECTIONS.estoque_movimentos, { softDelete: false });
  }
}

export const estoqueItensService = new EstoqueItensService();
export const estoqueMovimentosService = new EstoqueMovimentosService();

export async function registrarMovimentoEstoque(params: {
  itemId: string;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE" | "RESERVA" | "ESTORNO";
  quantidade: number;
  origem: string;
  observacoes?: string;
  usuario: string;
  saldoDelta?: number;
  reservadoDelta?: number;
  quantidadeLancada?: number;
  unidadeLancada?: string;
  fatorConversao?: number;
  unidadeBase?: string;
}) {
  const db = getFirestore();
  const empresaId = await getEmpresaId();
  const userId = await getCurrentUserId();
  const itemRef = doc(db, COLLECTIONS.estoque_itens, params.itemId);

  await runTransaction(db, async (tx) => {
    const itemSnap = await tx.get(itemRef);
    if (!itemSnap.exists()) throw new Error("Item de estoque não encontrado");
    const item = itemSnap.data() as EstoqueItem;
    const saldoAnterior = item.saldo || 0;
    const reservadoAnterior = item.saldoReservado || 0;

    const defaultSaldoDelta =
      params.tipo === "ENTRADA"
        ? params.quantidade
        : params.tipo === "SAIDA"
        ? -params.quantidade
        : params.tipo === "AJUSTE"
        ? params.quantidade
        : params.tipo === "ESTORNO"
        ? params.quantidade
        : 0;

    const defaultReservadoDelta = params.tipo === "RESERVA" ? params.quantidade : 0;

    const saldoDelta = params.saldoDelta ?? defaultSaldoDelta;
    const reservadoDelta = params.reservadoDelta ?? defaultReservadoDelta;

    const saldoNovo = saldoAnterior + saldoDelta;
    const reservadoNovo = reservadoAnterior + reservadoDelta;
    const saldoDisponivelNovo = saldoNovo - reservadoNovo;

    tx.update(itemRef, {
      saldo: saldoNovo,
      saldoReservado: reservadoNovo,
      saldoDisponivel: saldoDisponivelNovo,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });

    const movRef = doc(collection(db, COLLECTIONS.estoque_movimentos));
    const unidadeBase = params.unidadeBase ?? item.unidade ?? "UN";
    const unidadeLancada = params.unidadeLancada ?? unidadeBase;
    const quantidadeLancada = params.quantidadeLancada ?? params.quantidade;
    const fatorConversao =
      params.fatorConversao ??
      (unidadeLancada === unidadeBase ? 1 : undefined);

    tx.set(movRef, {
      produtoId: item.produtoId,
      produtoNome: item.produtoNome,
      produtoCodigo: item.produtoCodigo,
      tipo: params.tipo,
      quantidade: params.quantidade,
      quantidadeLancada,
      unidadeBase,
      unidadeLancada,
      fatorConversao,
      saldoAnterior,
      saldoNovo,
      origem: params.origem,
      observacoes: params.observacoes,
      usuario: params.usuario,
      data: new Date().toISOString(),
      criadoEm: new Date().toISOString(),
      empresaId: empresaId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
      isDeleted: false,
    });
  });

  await writeAuditLog({
    action: "update",
    collection: COLLECTIONS.estoque_itens,
    documentId: params.itemId,
    before: null,
    after: { tipo: params.tipo, quantidade: params.quantidade, origem: params.origem },
    empresaId: empresaId,
    userId,
  });
}
