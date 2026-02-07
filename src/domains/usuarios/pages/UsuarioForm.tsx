/**
 * Página: Formulário de Usuário (Criar/Editar)
 * Acesso: Apenas Admin
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Save, X } from 'lucide-react';
import { EntityFormShell } from '@/shared/components';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useUsuario, useCreateUsuario, useUpdateUsuario } from '../usuarios.hooks';
import { usePermissions } from '@/app/hooks/usePermissions';
import { createUsuarioSchema, updateUsuarioSchema } from '../usuarios.schema';
import type { CreateUsuarioFormData, UpdateUsuarioFormData } from '../usuarios.schema';

export default function UsuarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = usePermissions();
  const isEditMode = !!id;

  const { data: usuario, isLoading: isLoadingUsuario } = useUsuario(id!);
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();

  const schema = isEditMode ? updateUsuarioSchema : createUsuarioSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateUsuarioFormData | UpdateUsuarioFormData>({
    resolver: zodResolver(schema) as any,
  });

  const roleValue = watch('role');
  const statusValue = watch('status');

  // Redirecionar se não for admin
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  // Preencher formulário em modo de edição
  useEffect(() => {
    if (isEditMode && usuario) {
      reset({
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        status: usuario.status,
        telefone: usuario.telefone,
        departamento: usuario.departamento,
        dataAdmissao: usuario.dataAdmissao,
      });
    }
  }, [usuario, isEditMode, reset]);

  const onSubmit = async (data: CreateUsuarioFormData | UpdateUsuarioFormData) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: id!,
          data: data as UpdateUsuarioFormData,
        });
      } else {
        await createMutation.mutateAsync(data as CreateUsuarioFormData);
      }
      navigate('/usuarios');
    } catch (error) {
      // Erro já é tratado nos hooks
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <EntityFormShell
      title={isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
      subtitle={isEditMode ? 'Atualize as informações do usuário' : 'Preencha os dados do novo usuário'}
      icon={UserPlus}
      isLoading={isLoadingUsuario && isEditMode}
      actions={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/usuarios')}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            form="usuario-form"
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      }
    >
      <form id="usuario-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="font-semibold">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Ex: João da Silva"
                {...register('nome')}
                error={errors.nome?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@empresa.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>
          </div>

          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="senha">
                Senha <span className="text-destructive">*</span>
              </Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register('senha')}
                error={errors.senha?.message}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(11) 98765-4321"
                {...register('telefone')}
                error={errors.telefone?.message}
              />
              <p className="text-xs text-muted-foreground">
                Formato: (XX) XXXXX-XXXX
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataAdmissao">Data de Admissão</Label>
              <Input
                id="dataAdmissao"
                type="date"
                {...register('dataAdmissao')}
                error={errors.dataAdmissao?.message}
              />
            </div>
          </div>
        </div>

        {/* Configurações do Sistema */}
        <div className="space-y-4">
          <h3 className="font-semibold">Configurações do Sistema</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                Função <span className="text-destructive">*</span>
              </Label>
              <Select
                value={roleValue}
                onValueChange={(value) => setValue('role', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
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
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={statusValue}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="ferias">Férias</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departamento">
                Departamento <span className="text-destructive">*</span>
              </Label>
              <Input
                id="departamento"
                placeholder="Ex: Engenharia"
                {...register('departamento')}
                error={errors.departamento?.message}
              />
            </div>
          </div>
        </div>

        {/* Informações sobre Permissões */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-medium">ℹ️ Sobre Permissões</h4>
          <p className="text-sm text-muted-foreground">
            As permissões são definidas automaticamente com base na função selecionada. 
            Após criar o usuário, você pode personalizar permissões específicas na página de detalhes.
          </p>
        </div>
      </form>
    </EntityFormShell>
  );
}
