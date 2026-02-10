import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore } from "@/lib/firebase";
import { getEmpresaId } from "@/services/firestore/base";
import { COLLECTIONS } from "@/types/firebase";

export interface DashboardMetrics {
  receitaTotal: number;
  receitaVaria: number | null;
  ordensEmAberto: number;
  ordensEmProducao: number;
  ordensProducaoList: any[];
  ordensConcluidasList: any[];
  materiaisCriticos: any[];
  comprasPendentes: number;
  comprasPendentesList: any[];
  loading: boolean;
  error: string | null;
  // TODO: Adicionar mais métricas conforme necessário
}

const COMPRAS_PENDENTES = new Set([
  "solicitada",
  "cotacao",
  "aprovada",
  "pedido_enviado",
]);

const ORDENS_ABERTAS = new Set(["pendente", "em_producao", "pausada"]);

function normalizeStatus(value: unknown) {
  return value
    ? value
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, "_")
    : "";
}

function toTime(value: unknown) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    const dateValue = (value as { toDate: () => Date }).toDate();
    return dateValue instanceof Date ? dateValue.getTime() : 0;
  }
  return 0;
}

export function useDashboardMetrics() {
  const { user, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    receitaTotal: 0,
    receitaVaria: null,
    ordensEmAberto: 0,
    ordensEmProducao: 0,
    ordensProducaoList: [],
    ordensConcluidasList: [],
    materiaisCriticos: [],
    comprasPendentes: 0,
    comprasPendentesList: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
  if (authLoading || !user) {
    setMetrics((m) => ({ ...m, loading: authLoading }));
    return;
  }

  let unsubOrdens: (() => void) | null = null;
  let unsubEstoque: (() => void) | null = null;
  let unsubCompras: (() => void) | null = null;
  let canceled = false;
  setMetrics((m) => ({ ...m, loading: true, error: null }));

  function handleFirestoreError(error: any) {
    if (error && error.message && error.message.includes("INTERNAL ASSERTION FAILED")) {
      // Limpa IndexedDB e recarrega
      if (window.indexedDB) {
        const req = window.indexedDB.deleteDatabase("firebaseLocalStorageDb");
        req.onsuccess = () => window.location.reload();
        req.onerror = () => window.location.reload();
      } else {
        window.location.reload();
      }
    } else {
      setMetrics((m) => ({ ...m, error: error?.message || "Erro ao carregar metricas" }));
    }
  }

  const setup = async () => {
    try {
      const empresaId = await getEmpresaId();
      if (canceled) return;

      const db = getFirestore();

      // Ordens
      const ordensRef = query(
        collection(db, COLLECTIONS.ordens_producao),
        where("empresaId", "==", empresaId)
      );
      unsubOrdens = onSnapshot(
        ordensRef,
        (snap) => {
          try {
            const ordens = snap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((ordem: any) => ordem?.isDeleted !== true);
            const emAberto = ordens.filter((o: any) => ORDENS_ABERTAS.has(normalizeStatus(o.status)));
            const emProducao = ordens
              .filter((o: any) => normalizeStatus(o.status) === "em_producao")
              .sort((a: any, b: any) => toTime(b.dataAbertura) - toTime(a.dataAbertura));
            const concluidas = ordens
              .filter((o: any) => normalizeStatus(o.status) === "concluida")
              .sort((a: any, b: any) => toTime(b.dataConclusao ?? b.dataAbertura) - toTime(a.dataConclusao ?? a.dataAbertura));

            const now = new Date();
            const mesAtual = now.getMonth() + 1;
            const anoAtual = now.getFullYear();
            const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
            const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

            const concluidasMes = concluidas.filter((o: any) => {
              const d = o.dataConclusao ? new Date(o.dataConclusao) : o.dataAbertura ? new Date(o.dataAbertura) : null;
              return d && d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual;
            });
            const receitaTotal = concluidasMes.reduce((acc, o: any) => acc + (o.total ?? 0), 0);

            const concluidasAnt = concluidas.filter((o: any) => {
              const d = o.dataConclusao ? new Date(o.dataConclusao) : o.dataAbertura ? new Date(o.dataAbertura) : null;
              return d && d.getMonth() + 1 === mesAnterior && d.getFullYear() === anoAnterior;
            });
            const receitaAnterior = concluidasAnt.reduce((acc, o: any) => acc + (o.total ?? 0), 0);
            const receitaVaria =
              receitaAnterior > 0 ? ((receitaTotal - receitaAnterior) / receitaAnterior) * 100 : null;
            setMetrics((m) => ({
              ...m,
              ordensEmAberto: emAberto.length,
              ordensEmProducao: emProducao.length,
              ordensProducaoList: emProducao,
              ordensConcluidasList: concluidas,
              receitaTotal,
              receitaVaria,
            }));
          } catch (error) {
            handleFirestoreError(error);
          }
        },
        handleFirestoreError
      );

      // Estoque (saldos por produto)
      const estoqueRef = query(
        collection(db, COLLECTIONS.estoque_itens),
        where("empresaId", "==", empresaId)
      );
      unsubEstoque = onSnapshot(
        estoqueRef,
        (snap) => {
          try {
            const itens = snap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((item: any) => item?.isDeleted !== true)
              .filter(
                (item: any) =>
                  item.materialId || item.materialCodigo || item.materialNome
              );
            const criticos = itens
              .map((item: any) => {
                const saldoDisponivel = item.saldoDisponivel ?? item.saldo ?? 0;
                const minimo = item.estoqueMinimo ?? 0;
                const urgencia = saldoDisponivel <= 0 ? "critica" : "alta";
                return {
                  ...item,
                  nome: item.produtoNome || item.produtoCodigo || item.id,
                  minimo,
                  atual: saldoDisponivel,
                  saldoDisponivel,
                  urgencia,
                };
              })
              .filter((item: any) => item.saldoDisponivel <= (item.minimo ?? 0));

            setMetrics((m) => ({ ...m, materiaisCriticos: criticos }));
          } catch (error) {
            handleFirestoreError(error);
          }
        },
        handleFirestoreError
      );

      // Compras (pendentes)
      const comprasRef = query(
        collection(db, COLLECTIONS.compras),
        where("empresaId", "==", empresaId)
      );
      unsubCompras = onSnapshot(
        comprasRef,
        (snap) => {
          try {
            const compras = snap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((compra: any) => compra?.isDeleted !== true);
            const pendentes = compras.filter((c: any) => COMPRAS_PENDENTES.has(normalizeStatus(c.status)));
            setMetrics((m) => ({
              ...m,
              comprasPendentes: pendentes.length,
              comprasPendentesList: pendentes,
            }));
          } catch (error) {
            handleFirestoreError(error);
          }
        },
        handleFirestoreError
      );
    } catch (error: any) {
      handleFirestoreError(error);
    } finally {
      setMetrics((m) => ({ ...m, loading: false }));
    }
  };

  void setup();

  return () => {
    canceled = true;
    unsubOrdens && unsubOrdens();
    unsubEstoque && unsubEstoque();
    unsubCompras && unsubCompras();
  };
}, [authLoading, user?.uid]);

  return metrics;
}







