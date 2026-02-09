/**
 * Página: Lista de Usuários
 * Acesso: Apenas Admin
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search, Filter } from 'lucide-react';
import { PageHeader, DataTable, FiltersPanel } from '@/shared/components';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useUsuarios, useDeleteUsuario } from '../usuarios.hooks';
import { usePermissions } from '@/app/hooks/usePermissions';
import type { Usuario, UsuariosFilters } from '../usuarios.types';
import { roleLabels, statusLabels, statusColors } from '../usuarios.types';
import { formatDate } from '@/shared/lib/format';
import type { DataTableColumn } from '@/shared/components/DataTable';

export default function UsuariosList() {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const [filters, setFilters] = useState<UsuariosFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: usuarios = [], isLoading } = useUsuarios(filters);
  const deleteMutation = useDeleteUsuario();

  // Redirecionar se não for admin
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: DataTableColumn<Usuario>[] = [
    {
      key: 'nome',
      label: 'Nome',
      render: (_, usuario) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-semibold text-primary">
              {usuario.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium">{usuario.nome}</div>
            <div className="text-sm text-muted-foreground">{usuario.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'departamento',
      label: 'Departamento',
    },
    {
      key: 'role',
      label: 'Função',
      render: (_, usuario) => (
        <Badge variant="outline">{roleLabels[usuario.role]}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, usuario) => (
        <Badge className={statusColors[usuario.status]}>
          {statusLabels[usuario.status]}
        </Badge>
      ),
    },
    {
      key: 'telefone',
      label: 'Telefone',
      render: (value) => value || '-',
    },
    {
      key: 'dataAdmissao',
      label: 'Data Admissão',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Ações',
      align: 'right',
      render: (_, usuario) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/usuarios/${usuario.id}/editar`);
            }}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(usuario.id);
            }}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        subtitle="Gerencie usuários e permissões do sistema"
        icon={Users}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/usuarios/aprovacoes')}
            >
              <Users className="w-4 h-4 mr-2" />
              Aprovações
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/usuarios/permissoes')}
            >
              <Filter className="w-4 h-4 mr-2" />
              Permissões por função
            </Button>
            <Button size="sm" onClick={() => navigate('/usuarios/novo')}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        }
      />

      {showFilters && (
        <FiltersPanel onClear={() => setFilters({})}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, email ou departamento..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Função</label>
              <Select
                value={filters.role || ''}
                onValueChange={(value) =>
                  setFilters({ ...filters, role: value as any || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as funções" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as fun??es</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Dono">Dono</SelectItem>
                  <SelectItem value="Gerencia">Ger?ncia</SelectItem>
                  <SelectItem value="Compras">Compras</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Engenharia">Engenharia</SelectItem>
                  <SelectItem value="Producao">Produ??o</SelectItem>
                  <SelectItem value="Orcamentista">Or?amentista</SelectItem>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value as any || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="ferias">Férias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FiltersPanel>
      )}

      <DataTable
        data={usuarios}
        columns={columns}
        getRowId={(usuario) => usuario.id}
        isLoading={isLoading}
        total={usuarios.length}
        emptyMessage="Nenhum usuário encontrado"
        onRowClick={(usuario) => navigate(`/usuarios/${usuario.id}/editar`)}
      />
    </div>
  );
}
