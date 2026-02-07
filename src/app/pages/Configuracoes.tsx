/**
 * Página de Configurações do Sistema
 * Permite configurar margens, preços, notificações e dados da empresa
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { DollarSign, Settings, Save, Building2, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfiguracaoAtiva, useSalvarConfiguracao } from '@/hooks/useConfiguracoes';
import { VALORES_PADRAO } from '@/domains/calculadora';
import { custosService } from '@/domains/custos';

export default function Configuracoes() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'ADMIN';

  const { data: custosDoc, isLoading: loadingCustos } = useConfiguracaoAtiva('CUSTOS');
  const { data: calcDoc, isLoading: loadingCalc } = useConfiguracaoAtiva('CALCULADORA');
  const { data: geralDoc, isLoading: loadingGeral } = useConfiguracaoAtiva('GERAL');

  const salvarCustos = useSalvarConfiguracao('CUSTOS');
  const salvarCalc = useSalvarConfiguracao('CALCULADORA');
  const salvarGeral = useSalvarConfiguracao('GERAL');

  const defaultCustos = {
    materiais: {
      precoKgInox304: VALORES_PADRAO.precoKgInox304 || 0,
      precoKgInox430: VALORES_PADRAO.precoKgInox430 || 0,
      precoKgInox316: VALORES_PADRAO.precoKgInox316 || 0,
      precoMetroTubo25: VALORES_PADRAO.precoMetroTubo25 || 0,
      precoMetroTubo38: VALORES_PADRAO.precoMetroTubo38 || 0,
      precoMetroTubo50: VALORES_PADRAO.precoMetroTubo50 || 0,
      precoPeRegulavel: VALORES_PADRAO.precoPeRegulavel || 0,
      precoCasquilho: VALORES_PADRAO.precoCasquilho || 0,
    },
    perdas: {
      perdaMaterialPercentual: VALORES_PADRAO.perdaMaterial || 0,
    },
    maoObra: {
      custoHora: VALORES_PADRAO.custoMaoObra || 0,
    },
    margens: {
      margemLucroPercentual: VALORES_PADRAO.margemLucro || 0,
    },
  };

  const defaultCalc = {
    arredondamentos: {
      precoCasas: 2,
      pesoCasas: 3,
      dimensoesCasas: 0,
    },
    fatores: {
      fatorPerda: VALORES_PADRAO.perdaMaterial || 0,
    },
  };

  const defaultGeral = {
    empresa: custosService.obterConfiguracao().empresa,
  };

  const [custos, setCustos] = useState(defaultCustos);
  const [calculadora, setCalculadora] = useState(defaultCalc);
  const [geral, setGeral] = useState(defaultGeral);

  useEffect(() => {
    if (custosDoc?.dados) setCustos({ ...defaultCustos, ...custosDoc.dados });
  }, [custosDoc]);

  useEffect(() => {
    if (calcDoc?.dados) setCalculadora({ ...defaultCalc, ...calcDoc.dados });
  }, [calcDoc]);

  useEffect(() => {
    if (geralDoc?.dados) setGeral({ ...defaultGeral, ...geralDoc.dados });
  }, [geralDoc]);

  const isLoading = loadingCustos || loadingCalc || loadingGeral;

  const handleSaveCustos = () => {
    if (!isAdmin) return toast.error('Apenas administradores podem editar configurações');
    salvarCustos.mutate(custos);
  };

  const handleSaveCalc = () => {
    if (!isAdmin) return toast.error('Apenas administradores podem editar configurações');
    salvarCalc.mutate(calculadora);
  };

  const handleSaveGeral = () => {
    if (!isAdmin) return toast.error('Apenas administradores podem editar configurações');
    salvarGeral.mutate(geral);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Configurações"
        description="Custos, preferências da calculadora e dados gerais"
      />

      <div className="mt-6 max-w-5xl space-y-6">
        {/* Custos e Matéria-prima */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Custos e Matéria-prima
            </CardTitle>
            <CardDescription>
              Configure preços de materiais, perdas, mão de obra e margens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço Kg Inox 304 (R$)</Label>
                <Input
                  type="number"
                  value={custos.materiais.precoKgInox304}
                  onChange={(e) => setCustos({
                    ...custos,
                    materiais: { ...custos.materiais, precoKgInox304: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Preço Kg Inox 430 (R$)</Label>
                <Input
                  type="number"
                  value={custos.materiais.precoKgInox430}
                  onChange={(e) => setCustos({
                    ...custos,
                    materiais: { ...custos.materiais, precoKgInox430: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Preço Kg Inox 316 (R$)</Label>
                <Input
                  type="number"
                  value={custos.materiais.precoKgInox316}
                  onChange={(e) => setCustos({
                    ...custos,
                    materiais: { ...custos.materiais, precoKgInox316: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Preço Tubo 25 (R$/m)</Label>
                <Input
                  type="number"
                  value={custos.materiais.precoMetroTubo25}
                  onChange={(e) => setCustos({
                    ...custos,
                    materiais: { ...custos.materiais, precoMetroTubo25: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Preço Tubo 38 (R$/m)</Label>
                <Input
                  type="number"
                  value={custos.materiais.precoMetroTubo38}
                  onChange={(e) => setCustos({
                    ...custos,
                    materiais: { ...custos.materiais, precoMetroTubo38: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Preço Tubo 50 (R$/m)</Label>
                <Input
                  type="number"
                  value={custos.materiais.precoMetroTubo50}
                  onChange={(e) => setCustos({
                    ...custos,
                    materiais: { ...custos.materiais, precoMetroTubo50: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Preço Pé Regulável (R$)</Label>
                <Input
                  type="number"
                  value={custos.materiais.precoPeRegulavel}
                  onChange={(e) => setCustos({
                    ...custos,
                    materiais: { ...custos.materiais, precoPeRegulavel: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Preço Casquilho (R$)</Label>
                <Input
                  type="number"
                  value={custos.materiais.precoCasquilho}
                  onChange={(e) => setCustos({
                    ...custos,
                    materiais: { ...custos.materiais, precoCasquilho: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Perda de Material (%)</Label>
                <Input
                  type="number"
                  value={custos.perdas.perdaMaterialPercentual}
                  onChange={(e) => setCustos({
                    ...custos,
                    perdas: { perdaMaterialPercentual: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Mão de Obra (R$)</Label>
                <Input
                  type="number"
                  value={custos.maoObra.custoHora}
                  onChange={(e) => setCustos({
                    ...custos,
                    maoObra: { custoHora: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Margem de Lucro (%)</Label>
                <Input
                  type="number"
                  value={custos.margens.margemLucroPercentual}
                  onChange={(e) => setCustos({
                    ...custos,
                    margens: { margemLucroPercentual: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
            </div>

            <Button onClick={handleSaveCustos} disabled={!isAdmin || salvarCustos.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {salvarCustos.isPending ? 'Salvando...' : 'Salvar Custos'}
            </Button>
          </CardContent>
        </Card>

        {/* Preferências da Calculadora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Preferências da Calculadora
            </CardTitle>
            <CardDescription>
              Defina arredondamentos e fatores padrão.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Casas decimais (Preço)</Label>
                <Input
                  type="number"
                  value={calculadora.arredondamentos.precoCasas}
                  onChange={(e) => setCalculadora({
                    ...calculadora,
                    arredondamentos: { ...calculadora.arredondamentos, precoCasas: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Casas decimais (Peso)</Label>
                <Input
                  type="number"
                  value={calculadora.arredondamentos.pesoCasas}
                  onChange={(e) => setCalculadora({
                    ...calculadora,
                    arredondamentos: { ...calculadora.arredondamentos, pesoCasas: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Casas decimais (Dimensões)</Label>
                <Input
                  type="number"
                  value={calculadora.arredondamentos.dimensoesCasas}
                  onChange={(e) => setCalculadora({
                    ...calculadora,
                    arredondamentos: { ...calculadora.arredondamentos, dimensoesCasas: Number(e.target.value) }
                  })}
                  disabled={!isAdmin}
                />
              </div>
            </div>

            <div>
              <Label>Fator de Perda (%)</Label>
              <Input
                type="number"
                value={calculadora.fatores.fatorPerda}
                onChange={(e) => setCalculadora({
                  ...calculadora,
                  fatores: { fatorPerda: Number(e.target.value) }
                })}
                disabled={!isAdmin}
              />
            </div>

            <Button onClick={handleSaveCalc} disabled={!isAdmin || salvarCalc.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {salvarCalc.isPending ? 'Salvando...' : 'Salvar Preferências'}
            </Button>
          </CardContent>
        </Card>

        {/* Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Geral
            </CardTitle>
            <CardDescription>
              Dados gerais usados em documentos e relatórios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Razão Social</Label>
                <Input
                  value={geral.empresa.razaoSocial}
                  onChange={(e) => setGeral({
                    ...geral,
                    empresa: { ...geral.empresa, razaoSocial: e.target.value }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input
                  value={geral.empresa.cnpj}
                  onChange={(e) => setGeral({
                    ...geral,
                    empresa: { ...geral.empresa, cnpj: e.target.value }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={geral.empresa.email}
                  onChange={(e) => setGeral({
                    ...geral,
                    empresa: { ...geral.empresa, email: e.target.value }
                  })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={geral.empresa.telefone}
                  onChange={(e) => setGeral({
                    ...geral,
                    empresa: { ...geral.empresa, telefone: e.target.value }
                  })}
                  disabled={!isAdmin}
                />
              </div>
            </div>

            <Button onClick={handleSaveGeral} disabled={!isAdmin || salvarGeral.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {salvarGeral.isPending ? 'Salvando...' : 'Salvar Geral'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
