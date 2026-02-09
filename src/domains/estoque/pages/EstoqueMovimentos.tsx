/**
 * Pagina de Movimentos de Estoque
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { ListPage } from "@/app/components/layout/ListPage";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useMovimentos } from "../estoque.hooks";
import type { MovimentoEstoque, TipoMovimento } from "../estoque.types";
import { formatDateTime, formatNumber } from "@/shared/lib/format";

const TIPO_LABEL: Record<TipoMovimento, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
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

export default function EstoqueMovimentos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<TipoMovimento | "all">("all");

  const { data = [] } = useMovimentos({ tipo: tipo === "all" ? undefined : tipo });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((mov) => {
      return (
        mov.produtoNome?.toLowerCase().includes(term) ||
        mov.produtoCodigo?.toLowerCase().includes(term) ||
        mov.origem?.toLowerCase().includes(term) ||
        mov.usuario?.toLowerCase().includes(term)
      );
    });
  }, [data, search]);

  const columns = [
    { key: "produtoCodigo", label: "Código", sortable: true },
    { key: "produtoNome", label: "Produto", sortable: true },
    { key: "tipo", label: "Tipo", sortable: true },
    { key: "quantidade", label: "Quantidade", sortable: true, className: "text-right" },
    { key: "origem", label: "Origem", sortable: false },
    { key: "usuario", label: "Usuário", sortable: false },
    { key: "data", label: "Data", sortable: true },
  ];

  const renderCell = (mov: MovimentoEstoque, columnKey: string) => {
    switch (columnKey) {
      case "tipo":
        return <Badge variant={TIPO_BADGE[mov.tipo]}>{TIPO_LABEL[mov.tipo]}</Badge>;
      case "quantidade": {
        const baseUnit = mov.unidadeBase || "";
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
        { label: "Movimentos" },
      ]}
      title="Movimentos de Estoque"
      description="Entradas, saídas, reservas e ajustes"
      icon={PackageSearch}
      showExport={false}
      onNew={() => navigate("/estoque/movimento/novo")}
      newButtonLabel="Novo Movimento"
      searchPlaceholder="Buscar por produto, origem ou usuário..."
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
            <SelectItem value="SAIDA">Saída</SelectItem>
            <SelectItem value="RESERVA">Reserva</SelectItem>
            <SelectItem value="AJUSTE">Ajuste</SelectItem>
            <SelectItem value="ESTORNO">Estorno</SelectItem>
          </SelectContent>
        </Select>
      }
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
