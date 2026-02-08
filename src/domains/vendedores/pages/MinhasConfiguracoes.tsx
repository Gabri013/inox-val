/**
 * Página: Minhas Configurações
 * Permite ao vendedor configurar preços, margens e preferências
 */

import { useState, useEffect } from 'react';
import { Settings, DollarSign, Package, Percent, Clock, Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Separator } from '@/app/components/ui/separator';
import { Switch } from '@/app/components/ui/switch';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useMinhaConfiguracao, useCreateConfiguracao, useUpdateConfiguracao } from '../vendedor.hooks';
import { 
  MATERIAL_LABELS, 
  ACABAMENTO_LABELS, 
  EMBALAGEM_LABELS,
  type TipoMaterialInox,
  type TipoAcabamento,
  type TipoEmbalagem,
  type ConfiguracaoEmbalagem,
  type TabelaPrecosMaterial,
} from '../vendedor.types';
import { toast } from 'sonner';
import { formatCurrency } from '@/shared/lib/format';

export default function MinhasConfiguracoes() {
  const { data: config, isLoading } = useMinhaConfiguracao();
  const { mutate: createConfig, isPending: isCreating } = useCreateConfiguracao();
  const { mutate: updateConfig, isPending: isUpdating } = useUpdateConfiguracao();

  // Estados do formulário
  const [precosMateriais, setPrecosMateriais] = useState<Record<TipoMaterialInox, TabelaPrecosMaterial>>({
    '201': { precoPorKg: 15.50, dataAtualizacao: Date.now() },
    '304': { precoPorKg: 22.80, dataAtualizacao: Date.now() },
    '316': { precoPorKg: 35.60, dataAtualizacao: Date.now() },
    '430': { precoPorKg: 18.90, dataAtualizacao: Date.now() },
  });

  const [margemLucro, setMargemLucro] = useState(35);
  const [custoMaoObra, setCustoMaoObra] = useState(45.00);
  const [tempoMedio, setTempoMedio] = useState(8);
  const [materialPadrao, setMaterialPadrao] = useState<TipoMaterialInox>('304');
  const [acabamentoPadrao, setAcabamentoPadrao] = useState<TipoAcabamento>('escovado');
  const [espessuraPadrao, setEspessuraPadrao] = useState(0.8);
  const [embalagemPadrao, setEmbalagemPadrao] = useState<TipoEmbalagem>('plastico-bolha');
  const [embalagens, setEmbalagens] = useState<ConfiguracaoEmbalagem[]>([
    {
      tipo: 'plastico-bolha',
      custoBase: 25.00,
      descricao: 'Proteção básica com plástico bolha',
      ativo: true,
    },
    {
      tipo: 'papelao',
      custoBase: 45.00,
      descricao: 'Caixa de papelão reforçado',
      ativo: true,
    },
    {
      tipo: 'madeira',
      custoBase: 180.00,
      descricao: 'Caixa de madeira para transporte pesado',
      ativo: true,
    },
    {
      tipo: 'stretch',
      custoBase: 15.00,
      descricao: 'Filme stretch industrial',
      ativo: true,
    },
    {
      tipo: 'isopor',
      custoBase: 35.00,
      descricao: 'Embalagem com isopor',
      ativo: false,
    },
    {
      tipo: 'sem-embalagem',
      custoBase: 0,
      descricao: 'Sem embalagem - retirada local',
      ativo: true,
    },
  ]);
  const [custosAdicionais, setCustosAdicionais] = useState({
    transporte: 0,
    impostos: 0,
    outros: 0,
  });

  // Carregar dados da configuração
  useEffect(() => {
    if (config) {
      setPrecosMateriais(config.precosMateriais);
      setMargemLucro(config.margemLucroPadrao);
      setCustoMaoObra(config.custoMaoDeObraPorHora);
      setTempoMedio(config.tempoMedioBancada);
      setMaterialPadrao(config.materialPadrao);
      setAcabamentoPadrao(config.acabamentoPadrao);
      setEspessuraPadrao(config.espessuraPadrao);
      setEmbalagemPadrao(config.embalagemPadrao);
      setEmbalagens(config.embalagens);
      setCustosAdicionais((config.custosAdicionais || { transporte: 0, impostos: 0, outros: 0 }) as any);
    }
  }, [config]);

  const handleSave = () => {
    const data = {
      precosMateriais,
      margemLucroPadrao: margemLucro,
      custoMaoDeObraPorHora: custoMaoObra,
      tempoMedioBancada: tempoMedio,
      materialPadrao,
      acabamentoPadrao,
      espessuraPadrao,
      embalagemPadrao,
      embalagens,
      custosAdicionais,
      espessurasDisponiveis: [0.6, 0.8, 1.0, 1.2, 1.5, 2.0],
    };

    if (config) {
      updateConfig(
        { id: config.id, data },
        {
          onSuccess: () => {
            toast.success('Configurações atualizadas com sucesso!');
          },
          onError: () => {
            toast.error('Erro ao atualizar configurações');
          },
        }
      );
    } else {
      createConfig(data, {
        onSuccess: () => {
          toast.success('Configurações criadas com sucesso!');
        },
        onError: () => {
          toast.error('Erro ao criar configurações');
        },
      });
    }
  };

  const updatePrecoMaterial = (material: TipoMaterialInox, preco: number) => {
    setPrecosMateriais(prev => ({
      ...prev,
      [material]: {
        precoPorKg: preco,
        dataAtualizacao: Date.now(),
      },
    }));
  };

  const updateEmbalagem = (index: number, campo: keyof ConfiguracaoEmbalagem, valor: any) => {
    setEmbalagens(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [campo]: valor };
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Minhas Configurações
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure seus preços, margens e preferências de orçamento
          </p>
        </div>
        <Button onClick={handleSave} disabled={isCreating || isUpdating}>
          <Save className="w-4 h-4 mr-2" />
          {config ? 'Salvar Alterações' : 'Criar Configuração'}
        </Button>
      </div>

      {!config && (
        <Alert>
          <AlertDescription>
            Você ainda não possui configurações. Preencha os dados abaixo e clique em "Criar Configuração".
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="precos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="precos">Preços de Material</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
          <TabsTrigger value="embalagem">Embalagem</TabsTrigger>
          <TabsTrigger value="custos">Custos Adicionais</TabsTrigger>
        </TabsList>

        {/* Tab: Preços de Material */}
        <TabsContent value="precos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Tabela de Preços - Materiais
              </CardTitle>
              <CardDescription>
                Configure o preço por kg de cada tipo de inox
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(MATERIAL_LABELS) as TipoMaterialInox[]).map((material) => (
                <div key={material} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">
                      {MATERIAL_LABELS[material]}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Última atualização: {new Date(precosMateriais[material].dataAtualizacao).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">R$/kg:</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={precosMateriais[material].precoPorKg}
                      onChange={(e) => updatePrecoMaterial(material, parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Margem de Lucro e Mão de Obra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Margem de Lucro Padrão (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={margemLucro}
                    onChange={(e) => setMargemLucro(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentual aplicado sobre o custo total
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Custo de Mão de Obra (R$/hora)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={custoMaoObra}
                    onChange={(e) => setCustoMaoObra(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Valor cobrado por hora de trabalho
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tempo Médio de Produção (horas)
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  value={tempoMedio}
                  onChange={(e) => setTempoMedio(parseFloat(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground">
                  Tempo médio para produzir uma bancada padrão
                </p>
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Exemplo de Cálculo:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Custo de Material:</span>
                    <span>R$ 1.000,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mão de Obra ({tempoMedio}h × {formatCurrency(custoMaoObra)}):</span>
                    <span>{formatCurrency(tempoMedio * custoMaoObra)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(1000 + (tempoMedio * custoMaoObra))}</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>Lucro ({margemLucro}%):</span>
                    <span>{formatCurrency((1000 + (tempoMedio * custoMaoObra)) * (margemLucro / 100))}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency((1000 + (tempoMedio * custoMaoObra)) * (1 + margemLucro / 100))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Preferências */}
        <TabsContent value="preferencias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências Padrão</CardTitle>
              <CardDescription>
                Valores que serão pré-selecionados ao criar novos orçamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Material Padrão</Label>
                  <Select value={materialPadrao} onValueChange={(v) => setMaterialPadrao(v as TipoMaterialInox)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(MATERIAL_LABELS) as TipoMaterialInox[]).map((mat) => (
                        <SelectItem key={mat} value={mat}>
                          {MATERIAL_LABELS[mat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Acabamento Padrão</Label>
                  <Select value={acabamentoPadrao} onValueChange={(v) => setAcabamentoPadrao(v as TipoAcabamento)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ACABAMENTO_LABELS) as TipoAcabamento[]).map((acab) => (
                        <SelectItem key={acab} value={acab}>
                          {ACABAMENTO_LABELS[acab]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Espessura Padrão (mm)</Label>
                  <Select value={espessuraPadrao.toString()} onValueChange={(v) => setEspessuraPadrao(parseFloat(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0.6, 0.8, 1.0, 1.2, 1.5, 2.0].map((esp) => (
                        <SelectItem key={esp} value={esp.toString()}>
                          {esp}mm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Embalagem Padrão</Label>
                  <Select value={embalagemPadrao} onValueChange={(v) => setEmbalagemPadrao(v as TipoEmbalagem)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(EMBALAGEM_LABELS) as TipoEmbalagem[]).map((emb) => (
                        <SelectItem key={emb} value={emb}>
                          {EMBALAGEM_LABELS[emb]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Embalagem */}
        <TabsContent value="embalagem" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Opções de Embalagem
              </CardTitle>
              <CardDescription>
                Configure os custos de cada tipo de embalagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {embalagens.map((emb, index) => (
                <div key={emb.tipo} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Switch
                      checked={emb.ativo}
                      onCheckedChange={(checked) => updateEmbalagem(index, 'ativo', checked)}
                    />
                    <div className="flex-1">
                      <Label className="text-base">{EMBALAGEM_LABELS[emb.tipo]}</Label>
                      <p className="text-sm text-muted-foreground">{emb.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Custo:</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={emb.custoBase}
                      onChange={(e) => updateEmbalagem(index, 'custoBase', parseFloat(e.target.value) || 0)}
                      disabled={!emb.ativo}
                      className="w-32"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Custos Adicionais */}
        <TabsContent value="custos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custos Adicionais</CardTitle>
              <CardDescription>
                Custos extras aplicados a todos os orçamentos (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Custo de Transporte (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={custosAdicionais.transporte || 0}
                  onChange={(e) => setCustosAdicionais(prev => ({ 
                    ...prev, 
                    transporte: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Impostos/Taxas (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={custosAdicionais.impostos || 0}
                  onChange={(e) => setCustosAdicionais(prev => ({ 
                    ...prev, 
                    impostos: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Outros Custos (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={custosAdicionais.outros || 0}
                  onChange={(e) => setCustosAdicionais(prev => ({ 
                    ...prev, 
                    outros: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Total de Custos Adicionais:</h4>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    (custosAdicionais.transporte || 0) +
                    (custosAdicionais.impostos || 0) +
                    (custosAdicionais.outros || 0)
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
