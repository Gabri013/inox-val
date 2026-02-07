/**
 * Página de Saldos de Estoque
 * Usa ListPage para consistência visual com outras páginas
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, PackageX, AlertTriangle, TrendingUp, Eye } from 'lucide-react';
import { ListPage } from '@/app/components/layout/ListPage';
import { Badge } from '@/app/components/ui/badge';
import { useSaldosEstoque, useEstoqueStats } from '../estoque.hooks';
import { SaldoEstoque } from '../estoque.types';
import { formatNumber, formatCurrency, formatDateTime } from '@/shared/lib/format';

export default function EstoqueSaldos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: saldos = [], isLoading } = useSaldosEstoque();
  const { data: stats } = useEstoqueStats();
  
  // Filtrar saldos
  const filteredSaldos = saldos.filter(saldo => {
    const searchLower = search.toLowerCase();
    return (
      saldo.produtoNome.toLowerCase().includes(searchLower) ||
      saldo.produtoCodigo.toLowerCase().includes(searchLower)
    );
  });
  
  // Estatísticas
  const statsData = [
    {
      title: "Total de Produtos",
      value: stats?.totalProdutos || 0,
      description: "No estoque",
      className: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Baixo Estoque",
      value: stats?.baixoEstoque || 0,
      description: "Produtos críticos",
      className: "border-orange-200 dark:border-orange-800"
    },
    {
      title: "Sem Estoque",
      value: stats?.semEstoque || 0,
      description: "Produtos zerados",
      className: "border-red-200 dark:border-red-800"
    },
    {
      title: "Valor em Estoque",
      value: formatCurrency(stats?.valorTotal || 0),
      description: `${stats?.totalMovimentos || 0} movimentos`
    }
  ];
  
  // Colunas da tabela
  const columns = [
    {
      key: 'produtoCodigo',
      label: 'Código',
      sortable: true,
    },
    {
      key: 'produtoNome',
      label: 'Produto',
      sortable: true,
    },
    {
      key: 'saldo',
      label: 'Saldo Total',
      sortable: true,
      align: 'right' as const,
    },
    {
      key: 'saldoReservado',
      label: 'Reservado',
      sortable: true,
      align: 'right' as const,
    },
    {
      key: 'saldoDisponivel',
      label: 'Disponível',
      sortable: true,
      align: 'right' as const,
    },
    {
      key: 'estoqueMinimo',
      label: 'Mínimo',
      sortable: true,
      align: 'right' as const,
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center' as const,
    },
    {
      key: 'ultimaMovimentacao',
      label: 'Última Mov.',
      align: 'right' as const,
    },
  ];
  
  // Ações por linha
  const actions = [
    {
      icon: Eye,
      label: "Ver Detalhes",
      onClick: (saldo: SaldoEstoque) => {
        navigate(`/estoque/produto/${saldo.produtoId}`);
      }
    }
  ];
  
  // Renderizar célula customizada
  const renderCell = (saldo: SaldoEstoque, columnKey: string) => {
    switch (columnKey) {
      case 'produtoCodigo':
        return <span className="font-mono font-medium">{saldo.produtoCodigo}</span>;
      
      case 'saldo':
        const baixoEstoque = saldo.saldo <= saldo.estoqueMinimo && saldo.saldo > 0;
        const semEstoque = saldo.saldo === 0;
        
        return (
          <div className="text-right">
            <p className={
              semEstoque ? 'text-red-600 font-semibold' :
              baixoEstoque ? 'text-orange-600 font-semibold' :
              'font-medium'
            }>
              {formatNumber(saldo.saldo, 2)} {saldo.unidade}
            </p>
          </div>
        );
      
      case 'saldoReservado':
        return (
          <span className="text-muted-foreground">
            {formatNumber(saldo.saldoReservado, 2)} {saldo.unidade}
          </span>
        );
      
      case 'saldoDisponivel':
        const baixo = saldo.saldoDisponivel <= saldo.estoqueMinimo && saldo.saldoDisponivel > 0;
        const zero = saldo.saldoDisponivel === 0;
        
        return (
          <div className="text-right">
            <p className={
              zero ? 'text-red-600 font-semibold' :
              baixo ? 'text-orange-600 font-semibold' :
              'text-green-600 font-semibold'
            }>
              {formatNumber(saldo.saldoDisponivel, 2)} {saldo.unidade}
            </p>
          </div>
        );
      
      case 'estoqueMinimo':
        return (
          <span className="text-sm text-muted-foreground">
            {formatNumber(saldo.estoqueMinimo, 2)} {saldo.unidade}
          </span>
        );
      
      case 'status':
        if (saldo.saldo === 0) {
          return (
            <Badge variant="destructive" className="gap-1">
              <PackageX className="h-3 w-3" />
              Sem Estoque
            </Badge>
          );
        }
        
        if (saldo.saldo <= saldo.estoqueMinimo) {
          return (
            <Badge variant="outline" className="gap-1 border-orange-500 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              Baixo
            </Badge>
          );
        }
        
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
            <Package className="h-3 w-3" />
            OK
          </Badge>
        );
      
      case 'ultimaMovimentacao':
        return (
          <span className="text-xs text-muted-foreground">
            {saldo.ultimaMovimentacao ? formatDateTime(saldo.ultimaMovimentacao) : 'Nunca'}
          </span>
        );
      
      default:
        return saldo[columnKey as keyof SaldoEstoque];
    }
  };

  return (
    <ListPage
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Estoque" }
      ]}
      title="Estoque"
      subtitle="Visualize e gerencie os saldos de estoque"
      icon={Package}
      stats={statsData}
      searchPlaceholder="Buscar por código ou nome do produto..."
      searchValue={search}
      onSearchChange={setSearch}
      onNew={() => navigate('/estoque/movimento/novo')}
      newButtonLabel="Novo Movimento"
      secondaryActions={[
        {
          label: "Ver Movimentos",
          onClick: () => navigate('/estoque/movimentos'),
          variant: "outline"
        }
      ]}
      data={filteredSaldos}
      columns={columns}
      renderCell={renderCell}
      actions={actions}
      isLoading={isLoading}
      emptyMessage="Nenhum produto no estoque"
      showPagination={false}
    />
  );
}
