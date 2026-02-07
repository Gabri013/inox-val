/**
 * Formulário de Cliente (Criar/Editar)
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { EntityFormShell } from '@/shared/components/EntityFormShell';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { useCliente, useCreateCliente, useUpdateCliente } from '../clientes.hooks';
import { CreateClienteInput, ClienteStatus } from '../clientes.types';
import { toast } from 'sonner';

const INITIAL_FORM_STATE: CreateClienteInput = {
  nome: '',
  cnpj: '',
  email: '',
  telefone: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  status: 'Ativo',
  observacoes: '',
};

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function ClienteForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CreateClienteInput>(INITIAL_FORM_STATE);
  const [isDirty, setIsDirty] = useState(false);
  const [saveAndNew, setSaveAndNew] = useState(false);

  const { data: cliente, isLoading: loadingCliente } = useCliente(id || null);
  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();

  // Carregar dados ao editar
  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        cnpj: cliente.cnpj,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco || '',
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep || '',
        status: cliente.status,
        observacoes: cliente.observacoes || '',
      });
    }
  }, [cliente]);

  const handleChange = (field: keyof CreateClienteInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    if (!formData.cnpj.trim()) {
      toast.error('CNPJ é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('E-mail é obrigatório');
      return false;
    }
    if (!formData.telefone.trim()) {
      toast.error('Telefone é obrigatório');
      return false;
    }
    if (!formData.cidade.trim()) {
      toast.error('Cidade é obrigatória');
      return false;
    }
    if (!formData.estado.trim()) {
      toast.error('Estado é obrigatório');
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
        navigate('/clientes');
      } else {
        await createMutation.mutateAsync(formData);
        setIsDirty(false);
        
        if (saveAndNew) {
          // Limpar formulário para criar novo
          setFormData(INITIAL_FORM_STATE);
          setSaveAndNew(false);
          toast.success('Cliente criado! Você pode cadastrar outro.');
        } else {
          navigate('/clientes');
        }
      }
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleCancel = () => {
    navigate('/clientes');
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        description={isEditing ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente no sistema'}
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Clientes', href: '/clientes' },
          { label: isEditing ? 'Editar' : 'Novo' },
        ]}
      />

      {loadingCliente && isEditing ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <EntityFormShell
          title={isEditing ? 'Dados do Cliente' : 'Informações do Cliente'}
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
            {/* Nome */}
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome / Razão Social *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome completo ou razão social"
              />
            </div>

            {/* CNPJ */}
            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as ClienteStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* E-mail */}
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@empresa.com.br"
              />
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            {/* CEP */}
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleChange('cep', e.target.value)}
                placeholder="00000-000"
              />
            </div>

            {/* Endereço */}
            <div className="md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                placeholder="Rua, número, complemento"
              />
            </div>

            {/* Cidade */}
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Nome da cidade"
              />
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleChange('estado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BRASIL.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre o cliente"
                rows={4}
              />
            </div>
          </div>
        </EntityFormShell>
      )}
    </div>
  );
}