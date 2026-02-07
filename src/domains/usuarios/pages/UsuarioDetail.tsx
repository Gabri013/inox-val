/**
 * Página: Detalhes do Usuário
 * Acesso: Apenas Admin
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, Shield, User, Mail, Phone, Calendar, Briefcase } from 'lucide-react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useUsuario, useDeleteUsuario } from '../usuarios.hooks';
import { usePermissions } from '@/app/hooks/usePermissions';
import { roleLabels, statusLabels, statusColors, moduleLabels, permissionLabels } from '../usuarios.types';
import { getEffectivePermissions } from '../usuarios.types';
import { formatDate } from '@/shared/lib/format';

export default function UsuarioDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = usePermissions();
  
  const { data: usuario, isLoading } = useUsuario(id!);
  const deleteMutation = useDeleteUsuario();

  // Redirecionar se não for admin
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Usuário não encontrado</p>
        <Button onClick={() => navigate('/usuarios')} className="mt-4">
          Voltar para lista
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`)) {
      await deleteMutation.mutateAsync(id!);
      navigate('/usuarios');
    }
  };

  const permissoes = getEffectivePermissions(usuario);

  return (
    <div className="space-y-6">
      <PageHeader
        title={usuario.nome}
        subtitle={`${roleLabels[usuario.role]} • ${usuario.departamento}`}
        icon={User}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/usuarios/${id}/editar`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{usuario.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{usuario.telefone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Departamento</p>
                    <p className="font-medium">{usuario.departamento}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Admissão</p>
                    <p className="font-medium">{formatDate(usuario.dataAdmissao)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status e Função */}
          <Card>
            <CardHeader>
              <CardTitle>Status e Função</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Função</p>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {roleLabels[usuario.role]}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <Badge className={`${statusColors[usuario.status]} text-base px-3 py-1`}>
                    {statusLabels[usuario.status]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle>Registro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">{formatDate(usuario.dataCriacao)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Última atualização</p>
                  <p className="font-medium">{formatDate(usuario.dataAtualizacao)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Permissões do Sistema
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {usuario.permissoesCustomizadas
                      ? 'Permissões customizadas ativas'
                      : `Usando permissões padrão do perfil ${roleLabels[usuario.role]}`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(moduleLabels).map(([module, label]) => {
                  const perms = permissoes[module as keyof typeof permissoes];
                  
                  if (!perms) return null;

                  const hasAnyPermission = Object.values(perms).some(p => p);
                  
                  if (!hasAnyPermission) return null;

                  return (
                    <div
                      key={module}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <h4 className="font-medium">{label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(perms).map(([permission, hasPermission]) => {
                          if (!hasPermission) return null;
                          
                          return (
                            <Badge
                              key={permission}
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              ✓ {permissionLabels[permission as keyof typeof permissionLabels]}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
