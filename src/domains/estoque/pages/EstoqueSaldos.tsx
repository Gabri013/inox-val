/**
 * Página de Saldos de Estoque
 * Usa ListPage para consistência visual com outras páginas
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, PackageX, AlertTriangle, Eye } from 'lucide-react';
import { ListPage } from '@/app/components/layout/ListPage';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useSaldosEstoque, useEstoqueStats } from '../estoque.hooks';
import { SaldoEstoque } from '../estoque.types';
import { formatNumber, formatCurrency, formatDateTime } from '@/shared/lib/format';

export default function EstoqueSaldos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: saldos = [] } = useSaldosEstoque();
  const { data: stats } = useEstoqueStats();

  const getNome = (saldo: SaldoEstoque) => saldo.materialNome || saldo.produtoNome;
  const getCodigo = (saldo: SaldoEstoque) => saldo.materialCodigo || saldo.produtoCodigo;
  const getItemId = (saldo: SaldoEstoque) => saldo.materialId || saldo.produtoId;
  const materiais = saldos.filter(
    (saldo) => saldo.materialId || saldo.materialCodigo || saldo.materialNome
  );
  
  // Filtrar saldos
  const filteredSaldos = materiais.filter(saldo => {
    const searchLower = search.toLowerCase();
    return (
      getNome(saldo).toLowerCase().includes(searchLower) ||
      getCodigo(saldo).toLowerCase().includes(searchLower)
    );
  });
  
  // Estatísticas
  const valorTotal = materiais.reduce((acc, item) => {
    const custo = (item as any).custoUnitario ?? 0;
    return acc + (item.saldo || 0) * custo;
  }, 0);

  const statsData = [
    {
      title: "Total de Materiais",
      value: materiais.length,
      description: "No estoque",
      className: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Baixo Estoque",
      value: materiais.filter((s) => s.saldo > 0 && s.saldo <= s.estoqueMinimo).length,
      description: "Materiais críticos",
      className: "border-orange-200 dark:border-orange-800"
    },
    {
      title: "Sem Estoque",
      value: materiais.filter((s) => s.saldo === 0).length,
      description: "Materiais zerados",
      className: "border-red-200 dark:border-red-800"
    },
    {
      title: "Valor em Estoque",
      value: formatCurrency(valorTotal),
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
      label: 'Material',
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
        navigate(`/estoque/produto/${getItemId(saldo)}`);
      }
    }
  ];
  
  // Renderizar célula customizada
  const renderCell = (saldo: SaldoEstoque, columnKey: string) => {
    switch (columnKey) {
      case 'produtoCodigo':
        return <span className="font-mono font-medium">{getCodigo(saldo)}</span>;
      
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
        if (columnKey === 'produtoNome') {
          return getNome(saldo);
        }
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
      description="Visualize e gerencie os saldos de materiais"
      icon={Package}
      stats={statsData}
      searchPlaceholder="Buscar por código ou nome do material..."
      searchValue={search}
      onSearchChange={setSearch}
      onNew={() => navigate('/estoque/movimento/novo')}
      newButtonLabel="Novo Movimento"
      customActions={(
        <Button variant="outline" onClick={() => navigate('/estoque/movimentos')}>
          Ver Movimentos
        </Button>
      )}
      data={filteredSaldos}
      columns={columns as any}
      renderCell={renderCell as any}
      actions={actions as any}
      keyExtractor={(saldo) => saldo.produtoId}
      emptyMessage="Nenhum material no estoque"
      showPagination={false}
    />
  );
}

