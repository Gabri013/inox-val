/**
 * Detalhes do estoque por produto (material)
 */

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { ListPage } from "@/app/components/layout/ListPage";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useMovimentos, useSaldoProduto } from "../estoque.hooks";
import type { MovimentoEstoque, TipoMovimento } from "../estoque.types";
import { formatDateTime, formatNumber } from "@/shared/lib/format";

const TIPO_LABEL: Record<TipoMovimento, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saida",
  RESERVA: "Reserva",
  ESTORNO: "Estorno",
  AJUSTE: "Ajuste",
};

const TIPO_BADGE: Record<TipoMovimento, "default" | "secondary" | "destructive" | "outline"> = {
  ENTRADA: "default",
  SAIDA: "destructive",
  RESERVA: "secondary",
  ESTORNO: "outline",
  AJUSTE: "outline",
};

export default function EstoqueProdutoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<TipoMovimento | "all">("all");

  const produtoId = id || null;
  const { data: saldo, isLoading } = useSaldoProduto(produtoId);
  const { data: movimentos = [] } = useMovimentos({
    ...(produtoId ? { produtoId } : {}),
    tipo: tipo === "all" ? undefined : tipo,
  });
  const getNome = () => saldo?.materialNome || saldo?.produtoNome || "Detalhes";
  const getCodigo = () => saldo?.materialCodigo || saldo?.produtoCodigo || "";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return movimentos;
    return movimentos.filter((mov) => {
      return (
        mov.origem?.toLowerCase().includes(term) ||
        mov.usuario?.toLowerCase().includes(term)
      );
    });
  }, [movimentos, search]);

  if (!produtoId) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Material nao informado</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!saldo) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Material nao encontrado no estoque</p>
      </div>
    );
  }

  const baixoEstoque = saldo.saldo <= saldo.estoqueMinimo && saldo.saldo > 0;
  const semEstoque = saldo.saldo === 0;
  const statusClass = semEstoque
    ? "border-red-200 dark:border-red-800"
    : baixoEstoque
    ? "border-orange-200 dark:border-orange-800"
    : "border-green-200 dark:border-green-800";

  const statsData = [
    {
      title: "Saldo total",
      value: `${formatNumber(saldo.saldo, 2)} ${saldo.unidade}`,
      description: "Total em estoque",
      className: statusClass,
    },
    {
      title: "Disponivel",
      value: `${formatNumber(saldo.saldoDisponivel, 2)} ${saldo.unidade}`,
      description: "Livre para uso",
      className: statusClass,
    },
    {
      title: "Reservado",
      value: `${formatNumber(saldo.saldoReservado, 2)} ${saldo.unidade}`,
      description: "OPs e demandas",
    },
    {
      title: "Estoque minimo",
      value: `${formatNumber(saldo.estoqueMinimo, 2)} ${saldo.unidade}`,
      description: "Ponto de reposicao",
    },
    {
      title: "Ultima mov.",
      value: saldo.ultimaMovimentacao ? formatDateTime(saldo.ultimaMovimentacao) : "Nunca",
      description: "Registro mais recente",
    },
  ];

  const columns = [
    { key: "tipo", label: "Tipo", sortable: true },
    { key: "quantidade", label: "Quantidade", sortable: true, className: "text-right" },
    { key: "origem", label: "Origem", sortable: false },
    { key: "usuario", label: "Usuario", sortable: false },
    { key: "data", label: "Data", sortable: true },
  ];

  const renderCell = (mov: MovimentoEstoque, columnKey: string) => {
    switch (columnKey) {
      case "tipo":
        return <Badge variant={TIPO_BADGE[mov.tipo]}>{TIPO_LABEL[mov.tipo]}</Badge>;
      case "quantidade": {
        const baseUnit = mov.unidadeBase || saldo.unidade || "";
        const lancada = mov.quantidadeLancada ?? mov.quantidade;
        const lancadaUnit = mov.unidadeLancada || baseUnit;
        const fator = mov.fatorConversao;
        const showConversao =
          baseUnit && lancadaUnit && baseUnit !== lancadaUnit && typeof fator === "number";

        return (
          <div className="text-right">
            <div className="font-medium">
              {formatNumber(mov.quantidade, 2)} {baseUnit}
            </div>
            {showConversao && (
              <div className="text-xs text-muted-foreground">
                {formatNumber(lancada, 2)} {lancadaUnit} (x {fator})
              </div>
            )}
          </div>
        );
      }
      case "data":
        return (
          <span className="text-xs text-muted-foreground">
            {mov.data ? formatDateTime(mov.data) : "-"}
          </span>
        );
      default:
        return (mov as any)[columnKey];
    }
  };

  return (
    <ListPage
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Estoque", href: "/estoque" },
        { label: getNome() },
      ]}
      title={getNome()}
      description={`Codigo: ${getCodigo()}`}
      icon={PackageSearch}
      stats={statsData}
      searchPlaceholder="Buscar por origem ou usuario..."
      searchValue={search}
      onSearchChange={setSearch}
      filterContent={
        <Select value={tipo} onValueChange={(value) => setTipo(value as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de movimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ENTRADA">Entrada</SelectItem>
            <SelectItem value="SAIDA">Saida</SelectItem>
            <SelectItem value="RESERVA">Reserva</SelectItem>
            <SelectItem value="AJUSTE">Ajuste</SelectItem>
            <SelectItem value="ESTORNO">Estorno</SelectItem>
          </SelectContent>
        </Select>
      }
      showFilters={true}
      showExport={false}
      onNew={() => navigate("/estoque/movimento/novo")}
      newButtonLabel="Novo Movimento"
      customActions={
        <Button variant="outline" onClick={() => navigate("/estoque")}>Ver Saldos</Button>
      }
      data={filtered}
      columns={columns as any}
      renderCell={renderCell as any}
      actions={[] as any}
      keyExtractor={(mov) => mov.id}
      emptyMessage="Nenhum movimento encontrado"
      showPagination={false}
    />
  );
}
