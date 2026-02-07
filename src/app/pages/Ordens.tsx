import { useState } from "react";
import { ListPage, EyeIcon } from "../components/layout/ListPage";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useOrdens } from "@/hooks/useOrdens";
import { useCompras } from "@/hooks/useCompras";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Factory, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle,
  ShoppingCart
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { toast } from "sonner";
import { OrdemProducao, StatusOrdem } from "../types/workflow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

export default function Ordens() {
  const { ordens, iniciarProducao, concluirProducao, verificarNecessidadeCompra } = useOrdens({ autoLoad: true });
  const { createCompra } = useCompras({ autoLoad: false });
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusOrdem | "all">("all");
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemProducao | null>(null);
  const [showCompraDialog, setShowCompraDialog] = useState(false);
  const [materiaisFaltantes, setMateriaisFaltantes] = useState<any[]>([]);

  // ❌ REMOVIDO: Mock de ordens (apenas ordens reais de orçamentos aprovados)
  const todasOrdens = ordens; // Apenas ordens convertidas de orçamentos aprovados

  // Filtros
  const filteredOrdens = todasOrdens.filter((ord) => {
    const matchesSearch = 
      ord.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ord.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = [
    {
      title: "Total de Ordens",
      value: todasOrdens.length,
      description: "Ordens cadastradas"
    },
    {
      title: "Em Produção",
      value: todasOrdens.filter(o => o.status === "Em Produção").length,
      description: "Atualmente produzindo",
      className: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Concluídas",
      value: todasOrdens.filter(o => o.status === "Concluída").length,
      description: "Finalizadas",
      className: "border-green-200 dark:border-green-800"
    },
    {
      title: "Pendentes",
      value: todasOrdens.filter(o => o.status === "Pendente").length,
      description: "Aguardando início",
      className: "border-yellow-200 dark:border-yellow-800"
    }
  ];

  const statusIcon = (status: StatusOrdem) => {
    switch (status) {
      case "Concluída":
        return <CheckCircle className="size-3" />;
      case "Em Produção":
        return <Play className="size-3" />;
      case "Pausada":
        return <Pause className="size-3" />;
      default:
        return <AlertTriangle className="size-3" />;
    }
  };

  const statusVariant = (status: StatusOrdem) => {
    switch (status) {
      case "Concluída":
        return "default";
      case "Em Produção":
        return "secondary";
      case "Cancelada":
        return "destructive";
      default:
        return "outline";
    }
  };

  const prioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "Urgente":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "Alta":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "Normal":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Colunas
  const columns = [
    {
      key: "numero",
      label: "Número",
      sortable: true,
      render: (ord: OrdemProducao) => (
        <div className="flex items-center gap-2">
          <Factory className="size-4 text-muted-foreground" />
          <span className="font-mono font-medium">{ord.numero}</span>
        </div>
      )
    },
    {
      key: "dataAbertura",
      label: "Data Abertura",
      sortable: true,
      render: (ord: OrdemProducao) => format(ord.dataAbertura, "dd/MM/yyyy", { locale: ptBR })
    },
    {
      key: "clienteNome",
      label: "Cliente",
      sortable: true,
      render: (ord: OrdemProducao) => <span className="font-medium">{ord.clienteNome}</span>
    },
    {
      key: "itens",
      label: "Itens",
      render: (ord: OrdemProducao) => (
        <Badge variant="outline">{ord.itens.length} itens</Badge>
      )
    },
    {
      key: "prioridade",
      label: "Prioridade",
      render: (ord: OrdemProducao) => (
        <Badge className={prioridadeColor(ord.prioridade)}>
          {ord.prioridade}
        </Badge>
      )
    },
    {
      key: "dataPrevisao",
      label: "Previsão",
      render: (ord: OrdemProducao) => (
        <span className="text-sm text-muted-foreground">
          {format(ord.dataPrevisao, "dd/MM/yyyy", { locale: ptBR })}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (ord: OrdemProducao) => (
        <Badge variant={statusVariant(ord.status)} className="gap-1">
          {statusIcon(ord.status)}
          {ord.status}
        </Badge>
      )
    }
  ];

  // Handler para iniciar produção
  const handleIniciarProducao = async (ordem: OrdemProducao) => {
    const faltantes = await verificarNecessidadeCompra(ordem.id);
    
    if (faltantes.length > 0) {
      setMateriaisFaltantes(faltantes);
      setSelectedOrdem(ordem);
      setShowCompraDialog(true);
      return;
    }

    // Iniciar produção
    const operador = user?.displayName || user?.email || "Sistema";
    const result = await iniciarProducao(ordem.id, operador);

    if (result.success) {
      toast.success(`Produção iniciada para ${ordem.numero}`, {
        description: "Materiais consumidos do estoque"
      });
    } else {
      toast.error("Não foi possível iniciar a produção", {
        description: result.error || "Verifique a disponibilidade de materiais"
      });
    }
  };

  // Handler para criar solicitação de compra
  const handleCriarSolicitacao = async () => {
    if (!selectedOrdem) return;

    const total = materiaisFaltantes.reduce((acc, item) => acc + item.subtotal, 0);
    const result = await createCompra({
      ordemId: selectedOrdem.id,
      data: new Date(),
      status: "Solicitada",
      itens: materiaisFaltantes,
      total,
      justificativa: `Materiais necessários para ordem ${selectedOrdem.numero}`
    });

    if (result.success && result.data) {
      toast.success(`Solicitação ${result.data.numero} criada com sucesso`, {
        description: "Encaminhada para o setor de compras"
      });
    } else {
      toast.error(result.error || "Erro ao criar solicitação");
    }

    setShowCompraDialog(false);
    setSelectedOrdem(null);
    setMateriaisFaltantes([]);
  };

  // Ações
  const actions = [
    {
      icon: EyeIcon,
      label: "Visualizar",
      onClick: (ord: OrdemProducao) => {
        toast.info(`Visualizando ordem ${ord.numero}`);
      }
    },
    {
      icon: Play,
      label: "Iniciar Produção",
      onClick: handleIniciarProducao,
      show: (ord: OrdemProducao) => ord.status === "Pendente"
    },
    {
      icon: CheckCircle,
      label: "Concluir",
      onClick: (ord: OrdemProducao) => {
        concluirProducao(ord.id);
        toast.success(`Ordem ${ord.numero} concluída com sucesso`);
      },
      show: (ord: OrdemProducao) => ord.status === "Em Produção"
    }
  ];

  // Handlers
  // ❌ REMOVIDO: handleNew - OPs só podem ser criadas via orçamento aprovado

  const handleExport = () => {
    toast.success(`${filteredOrdens.length} ordens exportadas`);
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
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Em Produção">Em Produção</SelectItem>
            <SelectItem value="Pausada">Pausada</SelectItem>
            <SelectItem value="Concluída">Concluída</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <>
      <ListPage
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Ordens de Produção" }
        ]}
        title="Ordens de Produção"
        description="Gerencie e acompanhe o processo produtivo - OPs criadas apenas de orçamentos aprovados"
        icon={<Factory className="size-8 text-primary" />}
        // ❌ REMOVIDO: onNew e newButtonLabel (não pode criar OP livre)
        onExport={handleExport}
        stats={stats}
        searchPlaceholder="Buscar por número ou cliente..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filterContent={filterContent}
        columns={columns}
        data={filteredOrdens}
        keyExtractor={(ord) => ord.id}
        actions={actions}
        emptyMessage="Nenhuma ordem encontrada"
      />

      {/* Dialog de Materiais Faltantes */}
      <Dialog open={showCompraDialog} onOpenChange={setShowCompraDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-yellow-600" />
              Materiais Insuficientes
            </DialogTitle>
            <DialogDescription>
              Os seguintes materiais não estão disponíveis em estoque para a ordem {selectedOrdem?.numero}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg divide-y">
              {materiaisFaltantes.map((item, index) => (
                <div key={index} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.produtoNome}</p>
                    <p className="text-sm text-muted-foreground">
                      Faltam: {item.quantidade} {item.unidade}
                    </p>
                  </div>
                  <span className="font-medium text-sm">
                    R$ {item.subtotal.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total estimado:</span>
                <span className="text-lg font-bold">
                  R$ {materiaisFaltantes.reduce((acc, item) => acc + item.subtotal, 0).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompraDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarSolicitacao} className="gap-2">
              <ShoppingCart className="size-4" />
              Criar Solicitação de Compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}