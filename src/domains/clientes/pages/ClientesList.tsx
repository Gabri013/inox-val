/**
 * Página de listagem de Clientes
 * Usa ListPage para consistência visual com outras páginas
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Pencil, Trash2, Eye } from 'lucide-react';
import { ListPage } from '@/app/components/layout/ListPage';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useClientes, useDeleteCliente, useClientesStats } from '../clientes.hooks';
import { Cliente, ClienteStatus } from '../clientes.types';
import { formatCurrency } from '@/shared/lib/format';
import { useModuleAudit } from '@/app/contexts/AuditContext';

export default function ClientesList() {
  const navigate = useNavigate();
  const { logCreate, logDelete, logView } = useModuleAudit('clientes');
  
  // Estado de filtros e paginação
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClienteStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Estado do dialog de confirmação
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    clienteId: string | null;
    clienteNome: string;
  }>({ open: false, clienteId: null, clienteNome: '' });
  
  // Queries
  const { data, isLoading } = useClientes({
    page: currentPage,
    pageSize,
    search,
    status: statusFilter,
  });
  
  const { data: stats } = useClientesStats();
  const deleteMutation = useDeleteCliente();
  
  // Dados filtrados
  const clientes = data?.items || [];
  const clientesFiltrados = clientes.filter(cliente => {
    const matchSearch = search === '' || 
      cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
      cliente.cnpj.toLowerCase().includes(search.toLowerCase()) ||
      cliente.email.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter === 'all' || cliente.status === statusFilter;
    
    return matchSearch && matchStatus;
  });
  
  // Handlers
  const handleCreate = () => {
    logCreate({ nome: 'Novo cliente' });
    navigate('/clientes/novo');
  };
  
  const handleEdit = (cliente: Cliente) => {
    navigate(`/clientes/${cliente.id}/editar`);
  };
  
  const handleView = (cliente: Cliente) => {
    logView({ id: cliente.id, nome: cliente.nome });
    navigate(`/clientes/${cliente.id}`);
  };
  
  const handleDeleteClick = (cliente: Cliente) => {
    setDeleteConfirm({
      open: true,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
    });
  };
  
  const handleDeleteConfirm = async () => {
    if (deleteConfirm.clienteId) {
      logDelete({ id: deleteConfirm.clienteId, nome: deleteConfirm.clienteNome });
      await deleteMutation.mutateAsync(deleteConfirm.clienteId);
      setDeleteConfirm({ open: false, clienteId: null, clienteNome: '' });
    }
  };
  
  // Estatísticas
  const statsData = [
    {
      title: "Total de Clientes",
      value: stats?.total || 0,
      description: "Cadastrados no sistema"
    },
    {
      title: "Ativos",
      value: stats?.ativos || 0,
      description: "Clientes ativos",
      className: "border-green-200 dark:border-green-800"
    },
    {
      title: "Inativos",
      value: stats?.inativos || 0,
      description: "Clientes inativos",
      className: "border-orange-200 dark:border-orange-800"
    },
    {
      title: "Volume Total",
      value: formatCurrency(stats?.volumeTotal || 0),
      description: "Em compras"
    }
  ];
  
  // Colunas da tabela
  const columns = [
    {
      key: 'nome',
      label: 'Cliente',
      sortable: true,
    },
    {
      key: 'cnpj',
      label: 'CNPJ',
      sortable: false,
    },
    {
      key: 'email',
      label: 'E-mail',
      sortable: false,
    },
    {
      key: 'telefone',
      label: 'Telefone',
      sortable: false,
    },
    {
      key: 'cidade',
      label: 'Cidade',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center' as const,
    },
    {
      key: 'totalCompras',
      label: 'Volume Total',
      sortable: true,
      align: 'right' as const,
    },
  ];
  
  // Ações por linha
  const actions = [
    {
      icon: Eye,
      label: "Visualizar",
      onClick: (cliente: Cliente) => handleView(cliente)
    },
    {
      icon: Pencil,
      label: "Editar",
      onClick: (cliente: Cliente) => handleEdit(cliente)
    },
    {
      icon: Trash2,
      label: "Excluir",
      onClick: (cliente: Cliente) => handleDeleteClick(cliente)
    }
  ];
  
  // Renderizar célula customizada
  const renderCell = (cliente: Cliente, columnKey: string) => {
    switch (columnKey) {
      case 'nome':
        return (
          <div>
            <p className="font-medium">{cliente.nome}</p>
            <p className="text-sm text-muted-foreground">{cliente.cnpj}</p>
          </div>
        );
      
      case 'email':
        return (
          <div className="text-sm">
            <p>{cliente.email}</p>
            {cliente.telefone && (
              <p className="text-muted-foreground">{cliente.telefone}</p>
            )}
          </div>
        );
      
      case 'cidade':
        return `${cliente.cidade} - ${cliente.estado}`;
      
      case 'status':
        const variant =
          cliente.status === 'Ativo'
            ? 'default'
            : cliente.status === 'Inativo'
            ? 'secondary'
            : 'destructive';
        return <Badge variant={variant}>{cliente.status}</Badge>;
      
      case 'totalCompras':
        return formatCurrency(cliente.totalCompras);
      
      default:
        return cliente[columnKey as keyof Cliente];
    }
  };

  return (
    <>
      <ListPage
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Clientes" }
        ]}
        title="Clientes"
        subtitle="Gerencie seus clientes e acompanhe o relacionamento comercial"
        icon={Users}
        stats={statsData}
        searchPlaceholder="Buscar por nome, CNPJ ou e-mail..."
        searchValue={search}
        onSearchChange={setSearch}
        onNew={handleCreate}
        newButtonLabel="Novo Cliente"
        filters={
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        }
        data={clientesFiltrados}
        columns={columns}
        renderCell={renderCell}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="Nenhum cliente encontrado"
        currentPage={currentPage}
        totalPages={Math.ceil((data?.total || 0) / pageSize)}
        onPageChange={setCurrentPage}
        showPagination={true}
      />

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm({ ...deleteConfirm, open })
        }
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${deleteConfirm.clienteNome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </>
  );
}
