import { useState } from "react";
import { ListPage, EyeIcon } from "../components/layout/ListPage";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useCompras } from "@/hooks/useCompras";
import { 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  Truck,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { toast } from "sonner";
import { SolicitacaoCompra, StatusCompra } from "../types/workflow";

export default function Compras() {
  const { compras, updateCompra } = useCompras({ autoLoad: true });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusCompra | "all">("all");

  // ❌ REMOVIDO: Mock de compras (apenas solicitações reais criadas pelo sistema)
  const todasSolicitacoes = compras; // Apenas solicitações reais

  // Filtros
  const filteredSolicitacoes = todasSolicitacoes.filter((sol) => {
    const matchesSearch = 
      sol.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.fornecedorNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.justificativa.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sol.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = [
    {
      title: "Total de Solicitações",
      value: todasSolicitacoes.length,
      description: "Cadastradas no sistema"
    },
    {
      title: "Valor Total",
      value: `R$ ${(todasSolicitacoes.reduce((acc, s) => acc + s.total, 0) / 1000).toFixed(0)}k`,
      description: "Valor de todas solicitações"
    },
    {
      title: "Pendentes",
      value: todasSolicitacoes.filter(s => s.status === "Solicitada" || s.status === "Cotação").length,
      description: "Aguardando aprovação",
      className: "border-yellow-200 dark:border-yellow-800"
    },
    {
      title: "Aprovadas",
      value: todasSolicitacoes.filter(s => s.status === "Aprovada").length,
      description: "Prontas para pedido",
      className: "border-green-200 dark:border-green-800"
    }
  ];

  const statusIcon = (status: StatusCompra) => {
    switch (status) {
      case "Recebida":
        return <CheckCircle className="size-3" />;
      case "Pedido Enviado":
        return <Truck className="size-3" />;
      case "Aprovada":
        return <CheckCircle className="size-3" />;
      case "Cancelada":
        return <AlertCircle className="size-3" />;
      default:
        return <Clock className="size-3" />;
    }
  };

  const statusVariant = (status: StatusCompra) => {
    switch (status) {
      case "Recebida":
        return "default";
      case "Pedido Enviado":
        return "secondary";
      case "Cancelada":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Colunas
  const columns = [
    {
      key: "numero",
      label: "Número",
      sortable: true,
      render: (sol: SolicitacaoCompra) => (
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-4 text-muted-foreground" />
          <span className="font-mono font-medium">{sol.numero}</span>
        </div>
      )
    },
    {
      key: "data",
      label: "Data",
      sortable: true,
      render: (sol: SolicitacaoCompra) => format(sol.data, "dd/MM/yyyy", { locale: ptBR })
    },
    {
      key: "fornecedorNome",
      label: "Fornecedor",
      sortable: true,
      render: (sol: SolicitacaoCompra) => (
        <span className="font-medium">{sol.fornecedorNome || "A definir"}</span>
      )
    },
    {
      key: "itens",
      label: "Itens",
      render: (sol: SolicitacaoCompra) => (
        <Badge variant="outline">{sol.itens.length} itens</Badge>
      )
    },
    {
      key: "total",
      label: "Valor",
      sortable: true,
      className: "text-right",
      render: (sol: SolicitacaoCompra) => (
        <span className="font-medium">R$ {sol.total.toLocaleString('pt-BR')}</span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (sol: SolicitacaoCompra) => (
        <Badge variant={statusVariant(sol.status)} className="gap-1">
          {statusIcon(sol.status)}
          {sol.status}
        </Badge>
      )
    }
  ];

  // Ações
  const actions = [
    {
      icon: EyeIcon,
      label: "Visualizar",
      onClick: (sol: SolicitacaoCompra) => {
        toast.info(`Visualizando solicitação ${sol.numero}`);
      }
    },
    {
      icon: CheckCircle,
      label: "Aprovar",
      onClick: (sol: SolicitacaoCompra) => {
        updateCompra(sol.id, { status: "Aprovada" });
        toast.success(`Solicitação ${sol.numero} aprovada`);
      },
      show: (sol: SolicitacaoCompra) => sol.status === "Solicitada" || sol.status === "Cotação"
    }
  ];

  // Handlers
  // ❌ REMOVIDO: handleNew - Solicitações são criadas automaticamente pelo sistema ao verificar falta de materiais

  const handleExport = () => {
    toast.success(`${filteredSolicitacoes.length} solicitações exportadas`);
  };

  // Filtros
  const filterContent = (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Status</label>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Solicitada">Solicitada</SelectItem>
            <SelectItem value="Cotação">Cotação</SelectItem>
            <SelectItem value="Aprovada">Aprovada</SelectItem>
            <SelectItem value="Pedido Enviado">Pedido Enviado</SelectItem>
            <SelectItem value="Recebida">Recebida</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <ListPage
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Compras" }
      ]}
      title="Compras"
      description="Solicitações geradas automaticamente pelo sistema ao detectar falta de materiais"
      icon={<ShoppingCart className="size-8 text-primary" />}
      // ❌ REMOVIDO: onNew e newButtonLabel (solicitações criadas automaticamente)
      onExport={handleExport}
      stats={stats}
      searchPlaceholder="Buscar por número, fornecedor ou justificativa..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filterContent={filterContent}
      columns={columns}
      data={filteredSolicitacoes}
      keyExtractor={(sol) => sol.id}
      actions={actions}
      emptyMessage="Nenhuma solicitação encontrada"
    />
  );
}