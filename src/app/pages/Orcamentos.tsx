import { useState } from "react";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Eye as EyeIcon,
  FileDown,
  FileUp,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { toast } from "sonner";
import { Orcamento, StatusOrcamento } from "../types/workflow";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useOrdens } from "@/hooks/useOrdens";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ListPage } from "../components/layout/ListPage";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { OrcamentoForm } from "../components/workflow/OrcamentoForm";
import { pdfService } from "@/domains/custos";

export default function Orcamentos() {
  const {
    orcamentos,
    createOrcamento,
    updateOrcamento,
    aprovarOrcamento,
    rejeitarOrcamento,
    error,
    loadOrcamentos,
  } = useOrcamentos({ autoLoad: true });
  const { createOrdemDeOrcamento } = useOrdens({ autoLoad: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusOrcamento | "all">("all");
  const [showFormulario, setShowFormulario] = useState(false);
  const [formMode, setFormMode] = useState<"manual" | "omei">("manual");
  const [formKey, setFormKey] = useState(0);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [orcamentoToReject, setOrcamentoToReject] = useState<Orcamento | null>(null);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const statusLabels: Record<StatusOrcamento, string> = {
    Aprovado: "Aprovado",
    Rejeitado: "Rejeitado",
    "Aguardando Aprovacao": "Aguardando Aprovação",
  };
  const getStatusLabel = (status: StatusOrcamento) => statusLabels[status] ?? status;

  // ============= SEM MOCKS - DADOS REAIS APENAS =============
  const formatDateSafe = (value: unknown) => {
    if (!value) return "-";
    const date = value instanceof Date ? value : new Date(value as any);
    if (Number.isNaN(date.getTime())) return "-";
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  // Filtros
  const filteredOrcamentos = orcamentos.filter((orc) => {
    const search = searchTerm.toLowerCase();
    const numero = orc.numero ? orc.numero.toLowerCase() : "";
    const cliente = orc.clienteNome ? orc.clienteNome.toLowerCase() : "";

    const matchesSearch = numero.includes(search) || cliente.includes(search);
    const matchesStatus = statusFilter === "all" || orc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = [
    {
      title: "Total de Orçamentos",
      value: orcamentos.length,
      description: "Cadastrados no sistema",
    },
    {
      title: "Aguardando Aprovação",
      value: orcamentos.filter((o) => o.status === "Aguardando Aprovacao").length,
      description: "Aguardando aprovação",
      className: "border-yellow-200 dark:border-yellow-800",
    },
    {
      title: "Aprovados",
      value: orcamentos.filter((o) => o.status === "Aprovado").length,
      description: "Prontos para conversão",
      className: "border-green-200 dark:border-green-800",
    },
    {
      title: "Valor Total",
      value: `R$ ${(orcamentos.reduce((acc, o) => acc + o.total, 0) / 1000).toFixed(0)}k`,
      description: "Valor de todos orçamentos",
    },
  ];

  const statusIcon = (status: StatusOrcamento) => {
    switch (status) {
      case "Aprovado":
        return <CheckCircle className="size-3" />;
      case "Rejeitado":
        return <XCircle className="size-3" />;
      case "Aguardando Aprovacao":
        return <Clock className="size-3" />;
      default:
        return <Clock className="size-3" />;
    }
  };

  const statusVariant = (status: StatusOrcamento) => {
    switch (status) {
      case "Aprovado":
        return "default";
      case "Rejeitado":
        return "destructive";
      case "Aguardando Aprovacao":
        return "outline";
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
      render: (orc: Orcamento) => (
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <span className="font-mono font-medium">{orc.numero}</span>
        </div>
      ),
    },
    {
      key: "data",
      label: "Data",
      sortable: true,
      render: (orc: Orcamento) => formatDateSafe(orc.data),
    },
    {
      key: "clienteNome",
      label: "Cliente",
      sortable: true,
      render: (orc: Orcamento) => <span className="font-medium">{orc.clienteNome}</span>,
    },
    {
      key: "total",
      label: "Valor",
      sortable: true,
      className: "text-right",
      render: (orc: Orcamento) => (
        <span className="font-medium">R$ {orc.total.toLocaleString("pt-BR")}</span>
      ),
    },
    {
      key: "itens",
      label: "Itens",
      sortable: false,
      className: "text-center",
      render: (orc: Orcamento) => <Badge variant="outline">{orc.itens.length}</Badge>,
    },
    {
      key: "validade",
      label: "Validade",
      sortable: true,
      render: (orc: Orcamento) => {
        const validadeDate = orc.validade instanceof Date ? orc.validade : new Date(orc.validade as any);
        const validadeTime = Number.isNaN(validadeDate.getTime()) ? 0 : validadeDate.getTime();
        const diasRestantes = Math.ceil((validadeTime - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const vencido = diasRestantes < 0;

        return (
          <div className="text-sm">
            <div>{formatDateSafe(orc.validade)}</div>
            <div className={vencido ? "text-destructive" : "text-muted-foreground"}>
              {vencido ? "Vencido" : `${diasRestantes} dias`}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (orc: Orcamento) => (
        <Badge variant={statusVariant(orc.status)} className="gap-1">
          {statusIcon(orc.status)}
          {getStatusLabel(orc.status)}
        </Badge>
      ),
    },
  ];

  // Ações
  const actions = [
    {
      icon: EyeIcon,
      label: "Pré-visualizar PDF",
      onClick: (orc: Orcamento) => {
        try {
          pdfService.visualizarPDFProposta(orc, {
            mostrarCondicoesPagamento: true,
            mostrarObservacoes: true,
            vendedor: "Comercial", // TODO: pegar do usuário logado
          });
          toast.success(`Abrindo preview de ${orc.numero}`);
        } catch (error) {
          toast.error("Erro ao gerar preview do PDF");
        }
      },
    },
    {
      icon: FileDown,
      label: "Baixar PDF",
      onClick: (orc: Orcamento) => {
        try {
          pdfService.baixarPDFProposta(orc, {
            mostrarCondicoesPagamento: true,
            mostrarObservacoes: true,
            vendedor: "Comercial", // TODO: pegar do usuário logado
          });
          toast.success(`PDF ${orc.numero} baixado com sucesso`);
        } catch (error) {
          toast.error("Erro ao gerar PDF");
        }
      },
    },
    {
      icon: Pencil,
      label: "Editar",
      onClick: (orc: Orcamento) => {
        setEditingOrcamento(orc);
        setFormMode("manual");
        setFormKey((prev) => prev + 1);
        setShowFormulario(true);
      },
      show: (orc: Orcamento) => !orc.ordemId,
    },
    {
      icon: CheckCircle,
      label: "Aprovar",
      onClick: (orc: Orcamento) => {
        aprovarOrcamento(orc.id)
          .then((result) => {
            if (result.success) {
              toast.success(`Orçamento ${orc.numero} aprovado`);
            } else {
              toast.error(result.error || "Não foi possível aprovar o orçamento");
            }
          })
          .catch(() => toast.error("Não foi possível aprovar o orçamento"));
      },
      show: (orc: Orcamento) => orc.status === "Aguardando Aprovacao",
    },
    {
      icon: XCircle,
      label: "Rejeitar",
      onClick: (orc: Orcamento) => {
        setOrcamentoToReject(orc);
        setRejectReason("");
        setShowRejectDialog(true);
      },
      show: (orc: Orcamento) => orc.status === "Aguardando Aprovacao",
    },
    {
      icon: ArrowRight,
      label: "Criar OP",
      onClick: (orc: Orcamento) => {
        if (orc.ordemId) {
          toast.error("Este orçamento já foi convertido");
          return;
        }

        try {
          createOrdemDeOrcamento(orc.id).then((result) => {
            if (result.success && result.data) {
              toast.success(`Orçamento ${orc.numero} convertido em ${result.data.numero}`, {
                description: "A ordem de produção foi criada com sucesso",
              });
            } else {
              toast.error(result.error || "Não foi possível converter o orçamento. Tente novamente.");
            }
          });
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível converter o orçamento. Tente novamente."
          );
        }
      },
      // REGRA: Botão aparece APENAS se status === "Aprovado"
      show: (orc: Orcamento) => orc.status === "Aprovado" && !orc.ordemId,
    },
  ];

  // Handlers
  const handleNew = () => {
    setEditingOrcamento(null);
    setFormMode("manual");
    setFormKey((prev) => prev + 1);
    setShowFormulario(true);
  };

  const handleImportOmei = () => {
    setEditingOrcamento(null);
    setFormMode("omei");
    setFormKey((prev) => prev + 1);
    setShowFormulario(true);
  };

  const handleSubmitOrcamento = (data: Omit<Orcamento, "id" | "numero">) => {
    if (editingOrcamento) {
      updateOrcamento(editingOrcamento.id, {
        clienteId: data.clienteId,
        clienteNome: data.clienteNome,
        data: data.data,
        validade: data.validade,
        status: editingOrcamento.status,
        itens: data.itens,
        subtotal: data.subtotal,
        desconto: data.desconto,
        total: data.total,
        observacoes: data.observacoes,
        aprovadoEm: editingOrcamento.aprovadoEm,
      } as any)
        .then((result) => {
          if (result.success && result.data) {
            toast.success(`Orçamento ${result.data.numero} atualizado com sucesso!`);
            setShowFormulario(false);
            setEditingOrcamento(null);
          } else {
            toast.error(result.error || "Não foi possível atualizar o orçamento. Tente novamente.");
          }
        })
        .catch(() => toast.error("Não foi possível atualizar o orçamento. Tente novamente."));
      return;
    }

    createOrcamento(data as any)
      .then((result) => {
        if (result.success && result.data) {
          toast.success(`Orçamento ${result.data.numero} criado com sucesso!`, {
            description: `Cliente: ${result.data.clienteNome}`,
          });
          setShowFormulario(false);
        } else {
          toast.error(result.error || "Não foi possível criar o orçamento. Tente novamente.");
        }
      })
      .catch(() => toast.error("Não foi possível criar o orçamento. Tente novamente."));
  };

  const handleConfirmReject = () => {
    if (!orcamentoToReject) return;
    const motivo = rejectReason.trim() || undefined;
    rejeitarOrcamento(orcamentoToReject.id, motivo)
      .then((result) => {
        if (result.success) {
          toast.success(`Orçamento ${orcamentoToReject.numero} rejeitado`);
          setShowRejectDialog(false);
          setOrcamentoToReject(null);
          setRejectReason("");
        } else {
          toast.error(result.error || "Não foi possível rejeitar o orçamento");
        }
      })
      .catch(() => toast.error("Não foi possível rejeitar o orçamento"));
  };

  const handleExport = () => {
    if (filteredOrcamentos.length === 0) {
      toast.error("Nenhum orçamento para exportar");
      return;
    }
    toast.success(`${filteredOrcamentos.length} orçamentos exportados`);
  };

  const hasFilters = searchTerm.trim() !== "" || statusFilter !== "all";
  const emptyState = error
    ? {
        icon: <FileText className="size-16 text-destructive/60 opacity-40" />,
        title: "Falha ao carregar orçamentos",
        description: "Verifique sua conexão e tente novamente.",
        action: {
          label: "Tentar novamente",
          onClick: () => void loadOrcamentos(),
        },
      }
    : hasFilters
      ? {
          icon: <FileText className="size-16 text-muted-foreground opacity-20" />,
          title: "Nenhum resultado para os filtros",
          description: "Ajuste a busca ou limpe os filtros para ver todos.",
          action: {
            label: "Limpar filtros",
            onClick: () => {
              setSearchTerm("");
              setStatusFilter("all");
            },
          },
        }
      : {
          icon: <FileText className="size-16 text-muted-foreground opacity-20" />,
          title: "Nenhum orçamento cadastrado",
          description: "Crie seu primeiro orçamento baseado em modelos parametrizados",
          action: {
            label: "Novo orçamento",
            onClick: handleNew,
          },
        };

  return (
    <>
      <ListPage
        data={filteredOrcamentos}
        columns={columns as any}
        actions={actions as any}
        keyExtractor={(orc: Orcamento) => orc.id}
        filterContent={
          <Select key="status" value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusOrcamento | "all")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Aguardando Aprovacao">{getStatusLabel("Aguardando Aprovacao")}</SelectItem>
              <SelectItem value="Aprovado">Aprovado</SelectItem>
              <SelectItem value="Rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        }
        title="Orçamentos"
        description="Gerencie propostas comerciais e converta em ordens de produção"
        icon={<FileText className="size-8 text-primary" />}
        onNew={handleNew}
        newButtonLabel="Novo Orçamento"
        customActions={
          <Button variant="outline" onClick={handleImportOmei} className="gap-2">
            <FileUp className="size-4" />
            Importar OMEI
          </Button>
        }
        onExport={handleExport}
        stats={stats}
        searchPlaceholder="Buscar por número ou cliente..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        emptyMessage={emptyState.title}
      />

      {/* Modal de Formulário */}
      <Dialog open={showFormulario} onOpenChange={setShowFormulario}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrcamento ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
          </DialogHeader>
          <OrcamentoForm
            key={formKey}
            onSubmit={handleSubmitOrcamento}
            onCancel={() => {
              setShowFormulario(false);
              setEditingOrcamento(null);
            }}
            initialMode={formMode}
            initialData={editingOrcamento}
            submitLabel={editingOrcamento ? "Salvar alterações" : "Criar Orçamento"}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Rejeitar Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo (opcional)</label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Descreva o motivo da rejeição..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
