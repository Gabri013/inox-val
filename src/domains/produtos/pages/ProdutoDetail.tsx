/**
 * Página de detalhes do Produto
 */

import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Pencil, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useProduto, useDeleteProduto } from '../produtos.hooks';
import { formatCurrency, formatNumber } from '@/shared/lib/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

export default function ProdutoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: produto, isLoading } = useProduto(id || null);
  const deleteMutation = useDeleteProduto();

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Produto não encontrado</p>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/produtos/${id}/editar`);
  };

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(id);
      navigate('/produtos');
    }
  };

  const tipoColors = {
    'Acabado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'Semiacabado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'Matéria-Prima': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    'Componente': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  };

  const margemLucro = produto.custo > 0 
    ? (((produto.preco - produto.custo) / produto.custo) * 100).toFixed(2)
    : '0.00';

  const baixoEstoque = produto.estoque <= produto.estoqueMinimo;
  const valorEstoque = produto.estoque * produto.custo;

  return (
    <div className="space-y-6">
      <PageHeader
        title={produto.nome}
        description={`Código: ${produto.codigo}`}
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Produtos', href: '/produtos' },
          { label: produto.nome },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/produtos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-mono font-semibold">{produto.codigo}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <Badge className={tipoColors[produto.tipo]}>
                  {produto.tipo}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Unidade</p>
                <p className="font-medium">{produto.unidade}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                  {produto.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {produto.descricao && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="font-medium">{produto.descricao}</p>
                </div>
              )}

              {produto.observacoes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-medium">{produto.observacoes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Precificação */}
        <Card>
          <CardHeader>
            <CardTitle>Precificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Custo</p>
              <p className="text-lg font-semibold">{formatCurrency(produto.custo)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Preço de Venda</p>
              <p className="text-lg font-semibold text-primary">{formatCurrency(produto.preco)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Margem de Lucro</p>
              <p className="text-lg font-bold text-green-600">{margemLucro}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Estoque */}
        <Card className={baixoEstoque ? 'border-red-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Estoque
              {baixoEstoque && <AlertTriangle className="h-5 w-5 text-red-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Quantidade Atual</p>
              <p className={`text-2xl font-bold ${baixoEstoque ? 'text-red-600' : ''}`}>
                {formatNumber(produto.estoque, 2)} {produto.unidade}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
              <p className="text-lg font-medium">
                {formatNumber(produto.estoqueMinimo, 2)} {produto.unidade}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Valor em Estoque</p>
              <p className="text-lg font-semibold">{formatCurrency(valorEstoque)}</p>
            </div>

            {baixoEstoque && (
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  ⚠️ Estoque abaixo do mínimo!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">
                  {format(new Date(produto.criadoEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Última atualização</p>
                <p className="font-medium">
                  {format(new Date(produto.atualizadoEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">ID no Sistema</p>
                <p className="font-mono text-xs">{produto.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="Excluir Produto"
        description={`Tem certeza que deseja excluir o produto "${produto.nome}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  );
}