/**
 * Página: Lista de Anúncios
 * Gerenciamento de comunicados administrativos
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Megaphone, Filter } from 'lucide-react';
import { PageHeader, DataTable, FiltersPanel } from '@/shared/components';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useAnuncios, useDeleteAnuncio } from '../anuncios.hooks';
import { usePermissions } from '@/app/hooks/usePermissions';
import type { Anuncio, AnunciosFilters } from '../anuncios.types';
import type { DataTableColumn } from '@/shared/components/DataTable';
import { tipoLabels, tipoColors, statusLabels, statusColors } from '../anuncios.types';
import { formatDate } from '@/shared/lib/format';

export default function AnunciosList() {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const [filters, setFilters] = useState<AnunciosFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: anuncios = [], isLoading } = useAnuncios(filters);
  const deleteMutation = useDeleteAnuncio();

  // Apenas admin pode gerenciar anúncios
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este anúncio?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: DataTableColumn<Anuncio>[] = [
    {
      key: 'titulo',
      label: 'Título',
      render: (_, anuncio) => (
        <div>
          <div className="font-medium">{anuncio.titulo}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">
            {anuncio.mensagem}
          </div>
        </div>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (_, anuncio) => (
        <Badge className={tipoColors[anuncio.tipo]}>
          {tipoLabels[anuncio.tipo]}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, anuncio) => (
        <Badge className={statusColors[anuncio.status]}>
          {statusLabels[anuncio.status]}
        </Badge>
      ),
    },
    {
      key: 'destinatarios',
      label: 'Destinatários',
      render: (_, anuncio) => {
        if (anuncio.destinatarios === 'todos') return 'Todos';
        if (anuncio.destinatarios === 'role') return `Função: ${anuncio.roleAlvo}`;
        if (anuncio.destinatarios === 'departamento')
          return `Depto: ${anuncio.departamentoAlvo}`;
        return '-';
      },
    },
    {
      key: 'autorNome',
      label: 'Autor',
    },
    {
      key: 'criadoEm',
      label: 'Criado em',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Ações',
      align: 'right',
      render: (_, anuncio) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/anuncios/${anuncio.id}/editar`);
            }}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(anuncio.id);
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
        title="Anúncios"
        subtitle="Gerencie comunicados para toda a equipe"
        icon={Megaphone}
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
            <Button size="sm" onClick={() => navigate('/anuncios/novo')}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Anúncio
            </Button>
          </div>
        }
      />

      {showFilters && (
        <FiltersPanel onClear={() => setFilters({})}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={filters.tipo || ''}
                onValueChange={(value) =>
                  setFilters({ ...filters, tipo: (value as any) || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="alerta">Alerta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: (value as any) || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FiltersPanel>
      )}

      <DataTable
        data={anuncios}
        columns={columns}
        getRowId={(anuncio) => anuncio.id}
        isLoading={isLoading}
        total={anuncios.length}
        emptyMessage="Nenhum anúncio cadastrado"
      />
    </div>
  );
}
