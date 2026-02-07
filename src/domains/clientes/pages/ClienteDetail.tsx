/**
 * Página de detalhes do Cliente
 */

import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useCliente, useDeleteCliente } from '../clientes.hooks';
import { formatCurrency } from '@/shared/lib/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

export default function ClienteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: cliente, isLoading } = useCliente(id || null);
  const deleteMutation = useDeleteCliente();

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Cliente não encontrado</p>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/clientes/${id}/editar`);
  };

  const handleDelete = async () => {
    if (id) {
      await deleteMutation.mutateAsync(id);
      navigate('/clientes');
    }
  };

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'Inativo': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
    'Bloqueado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={cliente.nome}
        description={`CNPJ: ${cliente.cnpj}`}
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Clientes', href: '/clientes' },
          { label: cliente.nome },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/clientes')}>
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
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusColors[cliente.status]}>
                  {cliente.status}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Volume Total de Compras</p>
                <p className="text-lg font-semibold">{formatCurrency(cliente.totalCompras)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{cliente.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{cliente.telefone}</p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-medium">
                  {cliente.endereco || '-'}
                  {cliente.cep && ` - CEP: ${cliente.cep}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Cidade</p>
                <p className="font-medium">{cliente.cidade}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium">{cliente.estado}</p>
              </div>

              {cliente.observacoes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-medium">{cliente.observacoes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Cadastrado em</p>
              <p className="font-medium">
                {format(new Date(cliente.criadoEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Última atualização</p>
              <p className="font-medium">
                {format(new Date(cliente.atualizadoEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">ID no Sistema</p>
              <p className="font-mono text-xs">{cliente.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${cliente.nome}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  );
}