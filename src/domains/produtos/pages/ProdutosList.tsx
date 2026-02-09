/**
 * Página de listagem de Produtos
 * Usa ListPage para consistência visual com outras páginas
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Pencil, Trash2, Eye } from 'lucide-react';
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
import { useProdutos, useDeleteProduto } from '../produtos.hooks';
import { Produto, ProdutoTipo } from '../produtos.types';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { useModuleAudit } from '@/app/contexts/AuditContext';

export default function ProdutosList() {
  const navigate = useNavigate();
  const { logCreate, logDelete, logView } = useModuleAudit('produtos');
  
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<ProdutoTipo | 'all'>('all');
  const [ativoFilter, setAtivoFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const hasFilters = search.trim() !== '' || tipoFilter !== 'all' || ativoFilter !== undefined;
  const emptyMessage = hasFilters
    ? 'Nenhum produto encontrado para os filtros. Limpe filtros.'
    : 'Nenhum produto acabado cadastrado';
  
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    produtoId: string | null;
    produtoNome: string;
  }>({ open: false, produtoId: null, produtoNome: '' });
  
  const { data } = useProdutos({
    page: currentPage,
    pageSize,
    search,
    tipo: tipoFilter,
    ativo: ativoFilter,
  });
  
  const deleteMutation = useDeleteProduto();
  
  // Dados filtrados
  const produtos = data?.items || [];
  const produtosBase = produtos.filter(
    (produto) => produto.tipo === 'Acabado' || produto.tipo === 'Semiacabado'
  );
  const produtosFiltrados = produtosBase.filter(produto => {
    const matchSearch = search === '' || 
      produto.nome.toLowerCase().includes(search.toLowerCase()) ||
      produto.codigo.toLowerCase().includes(search.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(search.toLowerCase());
    
    const matchTipo = tipoFilter === 'all' || produto.tipo === tipoFilter;
    const matchAtivo = ativoFilter === undefined || produto.ativo === ativoFilter;
    
    return matchSearch && matchTipo && matchAtivo;
  });
  
  const handleCreate = () => {
    logCreate('novo', 'Novo produto', { nome: 'Novo produto' });
    navigate('/produtos/novo');
  };
  
  const handleEdit = (produto: Produto) => {
    navigate(`/produtos/${produto.id}/editar`);
  };
  
  const handleView = (produto: Produto) => {
    logView(produto.id, produto.nome);
    navigate(`/produtos/${produto.id}`);
  };
  
  const handleDeleteClick = (produto: Produto) => {
    setDeleteConfirm({
      open: true,
      produtoId: produto.id,
      produtoNome: produto.nome,
    });
  };
  
  const handleDeleteConfirm = async () => {
    if (deleteConfirm.produtoId) {
      logDelete(deleteConfirm.produtoId, deleteConfirm.produtoNome, {
        id: deleteConfirm.produtoId,
        nome: deleteConfirm.produtoNome,
      });
      await deleteMutation.mutateAsync(deleteConfirm.produtoId);
      setDeleteConfirm({ open: false, produtoId: null, produtoNome: '' });
    }
  };
  
  // Estatísticas
  const statsData = [
    {
      title: "Total de Produtos",
      value: produtosBase.length,
      description: "Cadastrados no sistema"
    },
    {
      title: "Ativos",
      value: produtosBase.filter((p) => p.ativo).length,
      description: "Produtos ativos",
      className: "border-green-200 dark:border-green-800"
    },
    {
      title: "Baixo Estoque",
      value: produtosBase.filter((p) => p.estoque <= p.estoqueMinimo).length,
      description: "Produtos críticos",
      className: "border-red-200 dark:border-red-800"
    },
    {
      title: "Valor em Estoque",
      value: formatCurrency(produtosBase.reduce((acc, p) => acc + p.estoque * p.custo, 0)),
      description: "Total em produtos"
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
      label: 'Produto',
      sortable: true,
    },
    {
      key: 'tipo',
      label: 'Tipo',
      sortable: true,
      align: 'center' as const,
    },
    {
      key: 'estoque',
      label: 'Estoque',
      sortable: true,
      align: 'right' as const,
    },
    {
      key: 'preco',
      label: 'Preço',
      sortable: true,
      align: 'right' as const,
    },
    {
      key: 'ativo',
      label: 'Status',
      align: 'center' as const,
    },
  ];
  
  // Ações por linha
  const actions = [
    {
      icon: Eye,
      label: "Visualizar",
      onClick: (produto: Produto) => handleView(produto)
    },
    {
      icon: Pencil,
      label: "Editar",
      onClick: (produto: Produto) => handleEdit(produto)
    },
    {
      icon: Trash2,
      label: "Excluir",
      onClick: (produto: Produto) => handleDeleteClick(produto)
    }
  ];
  
  // Renderizar célula customizada
  const renderCell = (produto: Produto, columnKey: string) => {
    switch (columnKey) {
      case 'codigo':
        return <span className="font-mono font-medium">{produto.codigo}</span>;
      
      case 'nome':
        return (
          <div>
            <p className="font-medium">{produto.nome}</p>
            {produto.descricao && (
              <p className="text-sm text-muted-foreground truncate max-w-md">
                {produto.descricao}
              </p>
            )}
          </div>
        );
      
      case 'tipo':
        const colors = {
          'Acabado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
          'Semiacabado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
          'Matéria-Prima': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
          'Componente': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
        };
        return (
          <Badge className={colors[produto.tipo]} variant="outline">
            {produto.tipo}
          </Badge>
        );
      
      case 'estoque':
        const baixoEstoque = produto.estoque <= produto.estoqueMinimo;
        return (
          <div className="text-right">
            <p className={baixoEstoque ? 'text-red-600 font-semibold' : ''}>
              {formatNumber(produto.estoque, 2)} {produto.unidade}
            </p>
            <p className="text-xs text-muted-foreground">
              Mín: {formatNumber(produto.estoqueMinimo, 2)}
            </p>
          </div>
        );
      
      case 'preco':
        return formatCurrency(produto.preco);
      
      case 'ativo':
        return (
          <Badge variant={produto.ativo ? 'default' : 'secondary'}>
            {produto.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      
      default:
        return produto[columnKey as keyof Produto];
    }
  };

  return (
    <>
      <ListPage
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Produtos" }
        ]}
        title="Produtos"
        description="Gerencie produtos acabados e semiacabados"
        icon={Package}
        stats={statsData}
        searchPlaceholder="Buscar por código, nome ou descrição..."
        searchValue={search}
        onSearchChange={setSearch}
        onNew={handleCreate}
        newButtonLabel="Novo Produto"
        filterContent={
          <div className="flex gap-2">
            <Select value={tipoFilter} onValueChange={(v) => setTipoFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Acabado">Acabado</SelectItem>
                <SelectItem value="Semiacabado">Semiacabado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={ativoFilter === undefined ? 'all' : ativoFilter.toString()} 
              onValueChange={(v) => setAtivoFilter(v === 'all' ? undefined : v === 'true')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        data={produtosFiltrados}
        keyExtractor={(produto) => produto.id}
        columns={columns as any}
        renderCell={renderCell as any}
        actions={actions as any}
        emptyMessage={emptyMessage}
        currentPage={currentPage}
        totalPages={Math.ceil((data?.total || 0) / pageSize)}
        onPageChange={setCurrentPage}
        showPagination={true}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm({ ...deleteConfirm, open })
        }
        title="Excluir Produto"
        description={`Tem certeza que deseja excluir o produto "${deleteConfirm.produtoNome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </>
  );
}
