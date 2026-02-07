import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdensRef } from "@/services/firebase/ordens.service";
import { getEstoqueService } from "@/services/firebase/estoque.service";
import { getOrcamentosService } from "@/services/firebase/orcamentos.service";
// import { getComprasService } from "@/services/firebase/compras.service"; // Não existe

export interface DashboardMetrics {
  receitaTotal: number;
  receitaVaria: number | null;
  ordensEmAberto: number;
  ordensEmProducao: number;
  ordensProducaoList: any[];
  materiaisCriticos: any[];
  comprasPendentes: number;
  comprasPendentesList: any[];
  loading: boolean;
  error: string | null;
  // TODO: Adicionar mais métricas conforme necessário
}

export function useDashboardMetrics() {
  const { user, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    receitaTotal: 0,
    receitaVaria: null,
    ordensEmAberto: 0,
    ordensEmProducao: 0,
    ordensProducaoList: [],
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
    let unsubOrcamentos: (() => void) | null = null;
    let unsubCompras: (() => void) | null = null;
    setMetrics((m) => ({ ...m, loading: true }));

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
        setMetrics((m) => ({ ...m, error: error.message || "Erro ao carregar métricas" }));
      }
    }

    try {
      // Ordens
      unsubOrdens = getOrdensRef((ordens) => {
        try {
          const emAberto = ordens.filter((o: any) =>
            ["Pendente", "Em Produção", "Pausada"].includes(o.status)
          );
          const emProducao = ordens.filter((o: any) => o.status === "Em Produção");
          setMetrics((m) => ({
            ...m,
            ordensEmAberto: emAberto.length,
            ordensEmProducao: emProducao.length,
            ordensProducaoList: emProducao,
          }));
        } catch (error) {
          handleFirestoreError(error);
        }
      });

      // Estoque
      unsubEstoque = getEstoqueService((materiais: any[]) => {
        try {
          const criticos = materiais.filter((mat) => mat.saldoDisponivel <= (mat.minimo ?? 0));
          setMetrics((m) => ({ ...m, materiaisCriticos: criticos }));
        } catch (error) {
          handleFirestoreError(error);
        }
      });

      // Orcamentos (para receita)
      unsubOrcamentos = getOrcamentosService((orcamentos: any[]) => {
        try {
          // Receita do mês atual
          const now = new Date();
          const mesAtual = now.getMonth() + 1;
          const anoAtual = now.getFullYear();
          const orcamentosMes = orcamentos.filter((o) => {
            const d = o.dataFaturamento ? new Date(o.dataFaturamento) : null;
            return d && d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual && o.status === "FATURADO";
          });
          const receitaTotal = orcamentosMes.reduce((acc, o) => acc + (o.valorTotal ?? 0), 0);
          // Receita mês anterior
          const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
          const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;
          const orcamentosAnt = orcamentos.filter((o) => {
            const d = o.dataFaturamento ? new Date(o.dataFaturamento) : null;
            return d && d.getMonth() + 1 === mesAnterior && d.getFullYear() === anoAnterior && o.status === "FATURADO";
          });
          const receitaAnterior = orcamentosAnt.reduce((acc, o) => acc + (o.valorTotal ?? 0), 0);
          const receitaVaria = receitaAnterior > 0 ? ((receitaTotal - receitaAnterior) / receitaAnterior) * 100 : null;
          setMetrics((m) => ({ ...m, receitaTotal, receitaVaria }));
        } catch (error) {
          handleFirestoreError(error);
        }
      });

      // Compras (pendentes)
      try {
        const { getComprasService } = require("@/services/firebase/compras.service");
        unsubCompras = getComprasService((compras: any[]) => {
          try {
            const pendentes = compras.filter((c) => c.status === "PENDENTE" || c.status === "AGUARDANDO_APROVACAO");
            setMetrics((m) => ({ ...m, comprasPendentes: pendentes.length, comprasPendentesList: pendentes }));
          } catch (error) {
            handleFirestoreError(error);
          }
        });
      } catch {
        setMetrics((m) => ({ ...m, comprasPendentes: 0, comprasPendentesList: [] }));
      }
    } catch (error: any) {
      handleFirestoreError(error);
    }

    setMetrics((m) => ({ ...m, loading: false }));
    return () => {
      unsubOrdens && unsubOrdens();
      unsubEstoque && unsubEstoque();
      unsubOrcamentos && unsubOrcamentos();
      unsubCompras && unsubCompras();
    };
  }, [authLoading, user?.uid]);

  return metrics;
}
