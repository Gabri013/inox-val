/**
 * Página de Catálogo de Insumos
 * Usa ListPage para consistência visual com outras páginas
 */

import { useState } from 'react';
import { Package } from 'lucide-react';
import { ListPage } from '../components/layout/ListPage';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useInsumos, type Insumo, type TipoInsumo } from '@/domains/catalogo';

const tipoInsumoLabels: Record<TipoInsumo, string> = {
  'materia-prima': 'Matéria Prima',
  'pes-niveladores': 'Pés Niveladores',
  'parafusos': 'Parafusos e Fixações',
  'acessorios': 'Acessórios',
  'componentes': 'Componentes',
};

export default function CatalogoInsumos() {
  const [filtroTipo, setFiltroTipo] = useState<TipoInsumo | 'todos'>('todos');
  const [busca, setBusca] = useState('');

  const { data: insumos, isLoading } = useInsumos();

  const insumosFiltrados = insumos?.filter(insumo => {
    const matchTipo = filtroTipo === 'todos' || insumo.tipo === filtroTipo;
    const matchBusca = !busca || 
      insumo.nome.toLowerCase().includes(busca.toLowerCase()) ||
      insumo.codigo.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Estatísticas
  const totalInsumos = insumos?.length || 0;
  const porTipo = insumos?.reduce((acc, insumo) => {
    acc[insumo.tipo] = (acc[insumo.tipo] || 0) + 1;
    return acc;
  }, {} as Record<TipoInsumo, number>);

  const statsData = [
    {
      title: "Total de Insumos",
      value: totalInsumos,
      description: "Cadastrados no catálogo"
    },
    {
      title: "Matéria Prima",
      value: porTipo?.['materia-prima'] || 0,
      description: "Chapas e tubos",
      className: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Componentes",
      value: (porTipo?.['componentes'] || 0) + (porTipo?.['acessorios'] || 0),
      description: "Pés, parafusos, etc",
      className: "border-purple-200 dark:border-purple-800"
    },
    {
      title: "Tipos Únicos",
      value: Object.keys(porTipo || {}).length,
      description: "Categorias diferentes"
    }
  ];

  // Colunas da tabela
  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      sortable: true,
    },
    {
      key: 'nome',
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'tipo',
      label: 'Tipo',
      sortable: true,
      align: 'center' as const,
    },
    {
      key: 'descricao',
      label: 'Descrição',
      sortable: false,
    },
    {
      key: 'custoUnitario',
      label: 'Custo Unit.',
      sortable: true,
      align: 'right' as const,
    },
    {
      key: 'estoque',
      label: 'Estoque',
      sortable: true,
      align: 'right' as const,
    },
    {
      key: 'unidade',
      label: 'Unidade',
      align: 'center' as const,
    },
  ];

  // Renderizar célula customizada
  const renderCell = (insumo: Insumo, columnKey: string) => {
    switch (columnKey) {
      case 'codigo':
        return <span className="font-mono text-sm font-semibold text-blue-600">{insumo.codigo}</span>;
      
      case 'tipo':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {tipoInsumoLabels[insumo.tipo]}
          </Badge>
        );
      
      case 'descricao':
        return <span className="text-sm text-muted-foreground">{insumo.descricao}</span>;
      
      case 'custoUnitario':
        return <span className="font-semibold">{formatCurrency(insumo.custoUnitario)}</span>;
      
      case 'estoque':
        if (insumo.estoque !== undefined) {
          return (
            <span className={insumo.estoque > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {insumo.estoque}
            </span>
          );
        }
        return <span className="text-muted-foreground">-</span>;
      
      case 'unidade':
        return <span className="font-mono text-sm">{insumo.unidade}</span>;
      
      default:
        return insumo[columnKey as keyof Insumo];
    }
  };

  return (
    <ListPage
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Catálogo de Insumos" }
      ]}
      title="Catálogo de Insumos"
      subtitle="Visualize todos os insumos com códigos e especificações"
      icon={Package}
      stats={statsData}
      searchPlaceholder="Buscar por nome ou código..."
      searchValue={busca}
      onSearchChange={setBusca}
      filters={
        <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            {Object.entries(tipoInsumoLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      data={insumosFiltrados || []}
      columns={columns}
      renderCell={renderCell}
      isLoading={isLoading}
      emptyMessage="Nenhum insumo encontrado com os filtros aplicados"
      showPagination={false}
    />
  );
}
