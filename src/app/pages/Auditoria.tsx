/**
 * Página de Auditoria
 * Usa ListPage para consistência visual com outras páginas
 */

import { useState } from "react";
import { Shield, Plus, Edit, Trash2, Eye, FileDown, FileUp } from "lucide-react";
import { ListPage } from "../components/layout/ListPage";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAudit } from "../contexts/AuditContext";
import { AuditActionType, AuditModule } from "../types/audit";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const actionIcons: Record<AuditActionType, any> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  export: FileDown,
  import: FileUp,
};

const actionColors: Record<AuditActionType, string> = {
  create: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  update: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  delete: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  view: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  export: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  import: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

const actionLabels: Record<AuditActionType, string> = {
  create: "Criação",
  update: "Edição",
  delete: "Exclusão",
  view: "Visualização",
  export: "Exportação",
  import: "Importação",
};

const moduleLabels: Record<AuditModule, string> = {
  clientes: "Clientes",
  produtos: "Produtos",
  estoque: "Estoque",
  orcamentos: "Orçamentos",
  ordens: "Ordens de Produção",
  compras: "Compras",
  calculadora: "Calculadora BOM",
  dashboard: "Dashboard",
  system: "Sistema",
};

export default function Auditoria() {
  const { logs, getLogs } = useAudit();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditActionType | "all">("all");
  const [moduleFilter, setModuleFilter] = useState<AuditModule | "all">("all");

  // Aplicar filtros
  const filteredLogs = getLogs({
    action: actionFilter !== "all" ? actionFilter : undefined,
    module: moduleFilter !== "all" ? moduleFilter : undefined,
    searchTerm: searchTerm || undefined,
  });

  // Estatísticas
  const stats = {
    total: logs.length,
    today: logs.filter((log) => {
      const today = new Date();
      return format(log.timestamp, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
    }).length,
    creates: logs.filter((log) => log.action === "create").length,
    updates: logs.filter((log) => log.action === "update").length,
    deletes: logs.filter((log) => log.action === "delete").length,
  };

  const statsData = [
    {
      title: "Total de Logs",
      value: stats.total,
      description: "Registros totais",
    },
    {
      title: "Hoje",
      value: stats.today,
      description: "Ações registradas",
      className: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Criações",
      value: stats.creates,
      description: "Novos registros",
      className: "border-green-200 dark:border-green-800",
    },
    {
      title: "Edições",
      value: stats.updates,
      description: "Atualizações",
      className: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Exclusões",
      value: stats.deletes,
      description: "Registros excluídos",
      className: "border-red-200 dark:border-red-800",
    },
  ];

  // Colunas da tabela
  const columns = [
    {
      key: "timestamp",
      label: "Data/Hora",
      sortable: true,
    },
    {
      key: "userName",
      label: "Usuário",
      sortable: true,
    },
    {
      key: "action",
      label: "Ação",
      sortable: true,
      align: "center" as const,
    },
    {
      key: "module",
      label: "Módulo",
      sortable: true,
      align: "center" as const,
    },
    {
      key: "description",
      label: "Descrição",
      sortable: false,
    },
    {
      key: "recordName",
      label: "Registro",
      sortable: false,
    },
  ];

  // Renderizar célula customizada
  const renderCell = (log: any, columnKey: string) => {
    switch (columnKey) {
      case "timestamp":
        return (
          <div>
            <div className="text-sm font-medium">
              {format(log.timestamp, "dd/MM/yyyy", { locale: ptBR })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(log.timestamp, "HH:mm:ss", { locale: ptBR })}
            </div>
          </div>
        );

      case "userName":
        return (
          <div>
            <p className="font-medium text-sm">{log.userName}</p>
            <p className="text-xs text-muted-foreground">{log.userRole}</p>
          </div>
        );

      case "action": {
        const Icon = actionIcons[log.action as AuditActionType];
        return (
          <Badge className={`gap-1 ${actionColors[log.action as AuditActionType]}`}>
            <Icon className="size-3" />
            {actionLabels[log.action as AuditActionType]}
          </Badge>
        );
      }

      case "module":
        return <Badge variant="outline">{moduleLabels[log.module as AuditModule]}</Badge>;

      case "description":
        return <p className="text-sm truncate max-w-xs">{log.description}</p>;

      case "recordName":
        if (!log.recordName) return null;
        return (
          <div className="text-sm">
            <p className="font-medium">{log.recordName}</p>
            {log.recordId && (
              <p className="text-xs text-muted-foreground font-mono">
                {log.recordId}
              </p>
            )}
          </div>
        );

      default:
        return log[columnKey];
    }
  };

  return (
    <ListPage
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Auditoria" },
      ]}
      title="Auditoria"
      description="Registro completo de ações do sistema"
      icon={Shield}
      stats={statsData}
      searchPlaceholder="Buscar por descrição, registro ou usuário..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filterContent={
        <div className="flex gap-2">
          <Select value={actionFilter} onValueChange={(value: AuditActionType | "all") => setActionFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="create">Criação</SelectItem>
              <SelectItem value="update">Edição</SelectItem>
              <SelectItem value="delete">Exclusão</SelectItem>
              <SelectItem value="view">Visualização</SelectItem>
              <SelectItem value="export">Exportação</SelectItem>
              <SelectItem value="import">Importação</SelectItem>
            </SelectContent>
          </Select>

          <Select value={moduleFilter} onValueChange={(value: AuditModule | "all") => setModuleFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os módulos</SelectItem>
              <SelectItem value="clientes">Clientes</SelectItem>
              <SelectItem value="produtos">Produtos</SelectItem>
              <SelectItem value="estoque">Estoque</SelectItem>
              <SelectItem value="orcamentos">Orçamentos</SelectItem>
              <SelectItem value="ordens">Ordens</SelectItem>
              <SelectItem value="compras">Compras</SelectItem>
              <SelectItem value="calculadora">Calculadora</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      data={filteredLogs.slice(0, 50) as any[]}
      columns={columns as any}
      renderCell={renderCell}
      emptyMessage="Nenhum log encontrado"
      showPagination={false}
      keyExtractor={(log: any) => `${log.id || log.timestamp}-${log.recordId || ""}`}
    />
  );
}
