/**
 * Página: Formulário de Anúncio
 * Criar/Editar comunicado administrativo
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Megaphone } from 'lucide-react';
import { EntityFormShell } from '@/shared/components';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { useAnuncio, useCreateAnuncio, useUpdateAnuncio } from '../anuncios.hooks';
import { usePermissions } from '@/app/hooks/usePermissions';
import type { CreateAnuncioDTO } from '../anuncios.types';

export default function AnuncioForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = usePermissions();
  const isEditing = !!id;

  const { data: anuncio, isLoading } = useAnuncio(id || '');
  const createMutation = useCreateAnuncio();
  const updateMutation = useUpdateAnuncio();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAnuncioDTO>();

  const destinatarios = watch('destinatarios');

  // Apenas admin pode criar/editar anúncios
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  // Preencher formulário ao editar
  useEffect(() => {
    if (anuncio && isEditing) {
      setValue('titulo', anuncio.titulo);
      setValue('mensagem', anuncio.mensagem);
      setValue('tipo', anuncio.tipo);
      setValue('destinatarios', anuncio.destinatarios);
      if (anuncio.departamentoAlvo) setValue('departamentoAlvo', anuncio.departamentoAlvo);
      if (anuncio.roleAlvo) setValue('roleAlvo', anuncio.roleAlvo);
      if (anuncio.dataInicio) setValue('dataInicio', anuncio.dataInicio.split('T')[0]);
      if (anuncio.dataFim) setValue('dataFim', anuncio.dataFim.split('T')[0]);
    }
  }, [anuncio, isEditing, setValue]);

  const onSubmit = (data: CreateAnuncioDTO) => {
    // Converter datas para ISO
    const formData = {
      ...data,
      dataInicio: data.dataInicio
        ? new Date(data.dataInicio).toISOString()
        : undefined,
      dataFim: data.dataFim ? new Date(data.dataFim).toISOString() : undefined,
    };

    if (isEditing && id) {
      updateMutation.mutate(
        { id, data: formData },
        {
          onSuccess: () => navigate('/anuncios'),
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => navigate('/anuncios'),
      });
    }
  };

  return (
    <EntityFormShell
      title={isEditing ? 'Editar Anúncio' : 'Novo Anúncio'}
      subtitle={isEditing ? 'Atualize as informações do anúncio' : 'Crie um novo comunicado'}
      icon={Megaphone}
      backTo="/anuncios"
      isLoading={isLoading && isEditing}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Título */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="titulo">Título*</Label>
            <Input
              id="titulo"
              {...register('titulo', { required: 'Título é obrigatório' })}
              placeholder="Ex: Manutenção Programada"
            />
            {errors.titulo && (
              <p className="text-sm text-destructive">{errors.titulo.message}</p>
            )}
          </div>

          {/* Mensagem */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="mensagem">Mensagem*</Label>
            <Textarea
              id="mensagem"
              {...register('mensagem', { required: 'Mensagem é obrigatória' })}
              placeholder="Digite a mensagem do anúncio..."
              rows={4}
            />
            {errors.mensagem && (
              <p className="text-sm text-destructive">{errors.mensagem.message}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo*</Label>
            <Select
              onValueChange={(value) => setValue('tipo', value as any)}
              defaultValue="info"
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="alerta">Alerta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-destructive">{errors.tipo.message}</p>
            )}
          </div>

          {/* Destinatários */}
          <div className="space-y-2">
            <Label htmlFor="destinatarios">Destinatários*</Label>
            <Select
              onValueChange={(value) => {
                setValue('destinatarios', value as any);
                // Limpar campos condicionais
                setValue('departamentoAlvo', undefined);
                setValue('roleAlvo', undefined);
              }}
              defaultValue="todos"
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione os destinatários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="departamento">Por Departamento</SelectItem>
                <SelectItem value="role">Por Função</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Departamento (condicional) */}
          {destinatarios === 'departamento' && (
            <div className="space-y-2">
              <Label htmlFor="departamentoAlvo">Departamento*</Label>
              <Select
                onValueChange={(value) => setValue('departamentoAlvo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TI">TI</SelectItem>
                  <SelectItem value="Engenharia">Engenharia</SelectItem>
                  <SelectItem value="Produção">Produção</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Compras">Compras</SelectItem>
                  <SelectItem value="Estoque">Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Função (condicional) */}
          {destinatarios === 'role' && (
            <div className="space-y-2">
              <Label htmlFor="roleAlvo">Função*</Label>
              <Select onValueChange={(value) => setValue('roleAlvo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Engenharia">Engenharia</SelectItem>
                  <SelectItem value="Producao">Produção</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Data Início */}
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data Início (opcional)</Label>
            <Input
              id="dataInicio"
              type="date"
              {...register('dataInicio')}
            />
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <Label htmlFor="dataFim">Data Fim (opcional)</Label>
            <Input
              id="dataFim"
              type="date"
              {...register('dataFim')}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending
              ? 'Salvando...'
              : isEditing
              ? 'Atualizar'
              : 'Criar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/anuncios')}>
            Cancelar
          </Button>
        </div>
      </form>
    </EntityFormShell>
  );
}
