/**
 * Formulário de Produto (Criar/Editar)
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { EntityFormShell } from '@/shared/components/EntityFormShell';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { useProduto, useCreateProduto, useUpdateProduto } from '../produtos.hooks';
import { CreateProdutoInput, ProdutoTipo, ProdutoUnidade } from '../produtos.types';
import { toast } from 'sonner';

const INITIAL_FORM_STATE: CreateProdutoInput = {
  codigo: '',
  nome: '',
  descricao: '',
  tipo: 'Acabado',
  unidade: 'UN',
  preco: 0,
  custo: 0,
  estoqueMinimo: 0,
  ativo: true,
  observacoes: '',
};

export default function ProdutoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CreateProdutoInput>(INITIAL_FORM_STATE);
  const [isDirty, setIsDirty] = useState(false);
  const [saveAndNew, setSaveAndNew] = useState(false);

  const { data: produto, isLoading: loadingProduto } = useProduto(id || null);
  const createMutation = useCreateProduto();
  const updateMutation = useUpdateProduto();

  // Carregar dados ao editar
  useEffect(() => {
    if (produto) {
      setFormData({
        codigo: produto.codigo,
        nome: produto.nome,
        descricao: produto.descricao || '',
        tipo: produto.tipo,
        unidade: produto.unidade,
        preco: produto.preco,
        custo: produto.custo,
        estoqueMinimo: produto.estoqueMinimo,
        ativo: produto.ativo,
        observacoes: produto.observacoes || '',
      });
    }
  }, [produto]);

  const handleChange = (field: keyof CreateProdutoInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validateForm = (): boolean => {
    if (!formData.codigo.trim()) {
      toast.error('Código é obrigatório');
      return false;
    }
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    if (formData.preco < 0) {
      toast.error('Preço não pode ser negativo');
      return false;
    }
    if (formData.custo < 0) {
      toast.error('Custo não pode ser negativo');
      return false;
    }
    if (formData.estoqueMinimo < 0) {
      toast.error('Estoque mínimo não pode ser negativo');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, data: formData });
        setIsDirty(false);
        navigate('/produtos');
      } else {
        await createMutation.mutateAsync(formData);
        setIsDirty(false);
        
        if (saveAndNew) {
          // Limpar formulário para criar novo
          setFormData(INITIAL_FORM_STATE);
          setSaveAndNew(false);
          toast.success('Produto criado! Você pode cadastrar outro.');
        } else {
          navigate('/produtos');
        }
      }
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleCancel = () => {
    navigate('/produtos');
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const margemLucro = formData.custo > 0 
    ? (((formData.preco - formData.custo) / formData.custo) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar Produto' : 'Novo Produto'}
        description={isEditing ? 'Atualize as informações do produto' : 'Cadastre um novo produto no catálogo'}
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Produtos', href: '/produtos' },
          { label: isEditing ? 'Editar' : 'Novo' },
        ]}
      />

      {loadingProduto && isEditing ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <EntityFormShell
          title={isEditing ? 'Dados do Produto' : 'Informações do Produto'}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isDirty={isDirty}
          isLoading={isLoading}
          submitLabel={isEditing ? 'Atualizar' : 'Cadastrar'}
          additionalActions={
            !isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSaveAndNew(true);
                  handleSubmit();
                }}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Salvar e Criar Outro
              </Button>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                placeholder="EX: BANC-001"
                className="font-mono"
              />
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleChange('tipo', value as ProdutoTipo)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="Acabado">Acabado</SelectItem>
                <SelectItem value="Semiacabado">Semiacabado</SelectItem>
                {isEditing && formData.tipo === "Matéria-Prima" && (
                  <SelectItem value="Matéria-Prima">Matéria-Prima (legado)</SelectItem>
                )}
                {isEditing && formData.tipo === "Componente" && (
                  <SelectItem value="Componente">Componente (legado)</SelectItem>
                )}
              </SelectContent>
            </Select>
            </div>

            {/* Nome */}
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome do produto"
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descrição detalhada do produto"
                rows={3}
              />
            </div>

            {/* Unidade */}
            <div>
              <Label htmlFor="unidade">Unidade de Medida *</Label>
              <Select
                value={formData.unidade}
                onValueChange={(value) => handleChange('unidade', value as ProdutoUnidade)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UN">UN - Unidade</SelectItem>
                  <SelectItem value="KG">KG - Quilograma</SelectItem>
                  <SelectItem value="MT">MT - Metro</SelectItem>
                  <SelectItem value="M2">M² - Metro Quadrado</SelectItem>
                  <SelectItem value="M3">M³ - Metro Cúbico</SelectItem>
                  <SelectItem value="LT">LT - Litro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estoque Mínimo */}
            <div>
              <Label htmlFor="estoqueMinimo">Estoque Mínimo *</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                step="0.01"
                value={formData.estoqueMinimo}
                onChange={(e) => handleChange('estoqueMinimo', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            {/* Custo */}
            <div>
              <Label htmlFor="custo">Custo (R$) *</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                value={formData.custo}
                onChange={(e) => handleChange('custo', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            {/* Preço */}
            <div>
              <Label htmlFor="preco">Preço de Venda (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => handleChange('preco', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            {/* Margem de Lucro (calculada) */}
            <div className="md:col-span-2">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Margem de Lucro:</span>
                  <span className="text-lg font-bold text-primary">{margemLucro}%</span>
                </div>
              </div>
            </div>

            {/* Ativo */}
            <div className="md:col-span-2 flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleChange('ativo', checked)}
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Produto ativo no catálogo
              </Label>
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre o produto"
                rows={3}
              />
            </div>
          </div>
        </EntityFormShell>
      )}
    </div>
  );
}
