import { useEffect, useState } from "react";
import { Settings, Save, RotateCcw, Building2, Calculator, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { custosService } from "@/domains/custos";
import type { ConfiguracaoCustos, RegimeTributario } from "@/domains/custos";
import { useAuth } from "@/contexts/AuthContext";

type ConfiguracaoCustosFormProps = {
  embedded?: boolean;
};

export function ConfiguracaoCustosForm({ embedded = false }: ConfiguracaoCustosFormProps) {
  const { user, profile } = useAuth();
  const usuarioId = user?.uid;
  const nomeUsuario = profile?.nome || user?.displayName || user?.email || "Usuário";
  const [config, setConfig] = useState<ConfiguracaoCustos>(() =>
    custosService.obterConfiguracao(usuarioId)
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setConfig(custosService.obterConfiguracao(usuarioId));
    setHasChanges(false);
  }, [usuarioId]);

  const handleChange = (field: string, value: any) => {
    setConfig((prev) => {
      const keys = field.split('.');
      const newConfig = { ...prev };
      
      let current: any = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      custosService.atualizarConfiguracao(config, nomeUsuario, usuarioId);
      setHasChanges(false);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  const handleReset = () => {
    const novaConfig = custosService.resetarConfiguracao(usuarioId);
    setConfig(novaConfig);
    setHasChanges(false);
    toast.info("Configurações resetadas para o padrão");
  };

  const containerClass = embedded ? "space-y-6" : "container mx-auto py-8 px-4 max-w-6xl";

  return (
    <div className={containerClass}>
      {!embedded && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Configurações de Custos</h1>
                <p className="text-muted-foreground">
                  Configure margens, impostos e regras de precificação
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges}
              >
                <RotateCcw className="size-4 mr-2" />
                Resetar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <Save className="size-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      )}

      {embedded && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="size-4 mr-2" />
            Resetar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="size-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      )}

      {hasChanges && (
        <div className="mb-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-900">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.
          </p>
        </div>
      )}

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="size-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="impostos" className="gap-2">
            <Calculator className="size-4" />
            Impostos
          </TabsTrigger>
          <TabsTrigger value="margens" className="gap-2">
            <Percent className="size-4" />
            Margens
          </TabsTrigger>
          <TabsTrigger value="custos" className="gap-2">
            <DollarSign className="size-4" />
            Custos Indiretos
          </TabsTrigger>
        </TabsList>

        {/* Aba: Empresa */}
        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Informações que aparecerão nas propostas comerciais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input
                    id="razaoSocial"
                    value={config.empresa.razaoSocial}
                    onChange={(e) => handleChange('empresa.razaoSocial', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={config.empresa.cnpj}
                    onChange={(e) => handleChange('empresa.cnpj', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={config.empresa.endereco}
                  onChange={(e) => handleChange('empresa.endereco', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={config.empresa.telefone}
                    onChange={(e) => handleChange('empresa.telefone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.empresa.email}
                    onChange={(e) => handleChange('empresa.email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site">Site</Label>
                  <Input
                    id="site"
                    value={config.empresa.site || ''}
                    onChange={(e) => handleChange('empresa.site', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Padrão (propostas)</Label>
                <Textarea
                  id="observacoes"
                  rows={6}
                  value={config.observacoesPadrao}
                  onChange={(e) => handleChange('observacoesPadrao', e.target.value)}
                  placeholder="Texto padrão que aparecerá em todas as propostas..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Impostos */}
        <TabsContent value="impostos">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Impostos</CardTitle>
              <CardDescription>
                Configure o regime tributário e alíquotas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regime">Regime Tributário</Label>
                <Select
                  value={config.impostos.regime}
                  onValueChange={(v) => handleChange('impostos.regime', v as RegimeTributario)}
                >
                  <SelectTrigger id="regime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                    <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                    <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.impostos.regime === 'SIMPLES_NACIONAL' ? (
                <div className="space-y-2">
                  <Label htmlFor="aliquotaSimples">Alíquota Simples Nacional (%)</Label>
                  <Input
                    id="aliquotaSimples"
                    type="number"
                    step="0.1"
                    value={config.impostos.aliquotaSimples || 0}
                    onChange={(e) => handleChange('impostos.aliquotaSimples', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Exemplo: 8.6% para indústria no anexo II
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icms">ICMS (%)</Label>
                    <Input
                      id="icms"
                      type="number"
                      step="0.1"
                      value={config.impostos.aliquotaICMS || 0}
                      onChange={(e) => handleChange('impostos.aliquotaICMS', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ipi">IPI (%)</Label>
                    <Input
                      id="ipi"
                      type="number"
                      step="0.1"
                      value={config.impostos.aliquotaIPI || 0}
                      onChange={(e) => handleChange('impostos.aliquotaIPI', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pis">PIS (%)</Label>
                    <Input
                      id="pis"
                      type="number"
                      step="0.1"
                      value={config.impostos.aliquotaPIS || 0}
                      onChange={(e) => handleChange('impostos.aliquotaPIS', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cofins">COFINS (%)</Label>
                    <Input
                      id="cofins"
                      type="number"
                      step="0.1"
                      value={config.impostos.aliquotaCOFINS || 0}
                      onChange={(e) => handleChange('impostos.aliquotaCOFINS', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Margens */}
        <TabsContent value="margens">
          <Card>
            <CardHeader>
              <CardTitle>Margens de Lucro</CardTitle>
              <CardDescription>
                Configure as margens por categoria de produto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="margemPadrao">Margem Padrão (%)</Label>
                <Input
                  id="margemPadrao"
                  type="number"
                  step="0.1"
                  value={config.margens.margemPadrao}
                  onChange={(e) => handleChange('margens.margemPadrao', parseFloat(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bancadaSimples">Bancada Simples (%)</Label>
                  <Input
                    id="bancadaSimples"
                    type="number"
                    step="0.1"
                    value={config.margens.margensPorCategoria.BANCADA_SIMPLES}
                    onChange={(e) => handleChange('margens.margensPorCategoria.BANCADA_SIMPLES', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bancadaCuba">Bancada com Cuba (%)</Label>
                  <Input
                    id="bancadaCuba"
                    type="number"
                    step="0.1"
                    value={config.margens.margensPorCategoria.BANCADA_COM_CUBA}
                    onChange={(e) => handleChange('margens.margensPorCategoria.BANCADA_COM_CUBA', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bancadaEspecial">Bancada Especial (%)</Label>
                  <Input
                    id="bancadaEspecial"
                    type="number"
                    step="0.1"
                    value={config.margens.margensPorCategoria.BANCADA_ESPECIAL}
                    onChange={(e) => handleChange('margens.margensPorCategoria.BANCADA_ESPECIAL', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="equipamento">Equipamento Custom (%)</Label>
                  <Input
                    id="equipamento"
                    type="number"
                    step="0.1"
                    value={config.margens.margensPorCategoria.EQUIPAMENTO_CUSTOM}
                    onChange={(e) => handleChange('margens.margensPorCategoria.EQUIPAMENTO_CUSTOM', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Custos Indiretos */}
        <TabsContent value="custos">
          <Card>
            <CardHeader>
              <CardTitle>Custos Indiretos</CardTitle>
              <CardDescription>
                Configure os percentuais de overhead e custos fixos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="administrativo">Administrativo (%)</Label>
                  <Input
                    id="administrativo"
                    type="number"
                    step="0.1"
                    value={config.custosIndiretos.percentualAdministrativo}
                    onChange={(e) => handleChange('custosIndiretos.percentualAdministrativo', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Salários, aluguel, contas
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comercial">Comercial (%)</Label>
                  <Input
                    id="comercial"
                    type="number"
                    step="0.1"
                    value={config.custosIndiretos.percentualComercial}
                    onChange={(e) => handleChange('custosIndiretos.percentualComercial', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Marketing, comissões
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logistica">Logística (%)</Label>
                  <Input
                    id="logistica"
                    type="number"
                    step="0.1"
                    value={config.custosIndiretos.percentualLogistica}
                    onChange={(e) => handleChange('custosIndiretos.percentualLogistica', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Frete, embalagem
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custoFixo">Custo Fixo Mensal (R$)</Label>
                  <Input
                    id="custoFixo"
                    type="number"
                    step="100"
                    value={config.custosIndiretos.custoFixoMensal}
                    onChange={(e) => handleChange('custosIndiretos.custoFixoMensal', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="volumeMensal">Volume Mensal Estimado (R$)</Label>
                  <Input
                    id="volumeMensal"
                    type="number"
                    step="1000"
                    value={config.custosIndiretos.volumeMensalEstimado}
                    onChange={(e) => handleChange('custosIndiretos.volumeMensalEstimado', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium mb-1">Rateio de Custo Fixo</p>
                <p className="text-sm text-muted-foreground">
                  {((config.custosIndiretos.custoFixoMensal / config.custosIndiretos.volumeMensalEstimado) * 100).toFixed(2)}% será adicionado a cada orçamento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ConfiguracaoCustos() {
  return <ConfiguracaoCustosForm />;
}
