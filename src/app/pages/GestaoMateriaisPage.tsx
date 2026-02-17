/**
 * ============================================================================
 * PÁGINA DE GESTÃO DE MATERIAIS
 * ============================================================================
 * Interface para gerenciar preços de materiais, tubos, cantoneiras e acessórios
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Save } from 'lucide-react';
import * as materiaisService from '@/domains/materiais/service';
import * as materiaisRepo from '@/domains/materiais/repository';
import type {
  TuboDefinicao,
  CantoneiraDefinicao,
  AcessorioDefinicao,
  ConfiguracoesMateriais,
  TipoInox,
} from '@/domains/materiais/types';

export default function GestaoMateriaisPage() {
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestão de Materiais</h1>
        <p className="text-muted-foreground">
          Gerencie preços de materiais, tubos, cantoneiras e acessórios
        </p>
      </div>

      {mensagem && (
        <Alert className={mensagem.tipo === 'sucesso' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <AlertDescription>{mensagem.texto}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="chapas" className="mt-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chapas">Chapas</TabsTrigger>
          <TabsTrigger value="tubos">Tubos</TabsTrigger>
          <TabsTrigger value="cantoneiras">Cantoneiras</TabsTrigger>
          <TabsTrigger value="acessorios">Acessórios</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="chapas">
          <GestaoChapas setMensagem={setMensagem} />
        </TabsContent>

        <TabsContent value="tubos">
          <GestaoTubos setMensagem={setMensagem} />
        </TabsContent>

        <TabsContent value="cantoneiras">
          <GestaoCantoneiras setMensagem={setMensagem} />
        </TabsContent>

        <TabsContent value="acessorios">
          <GestaoAcessorios setMensagem={setMensagem} />
        </TabsContent>

        <TabsContent value="configuracoes">
          <GestaoConfiguracoes setMensagem={setMensagem} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// GESTÃO DE CHAPAS
// ============================================================================

function GestaoChapas({ setMensagem }: any) {
  const [tipoInox, setTipoInox] = useState<TipoInox>('304');
  const [espessura, setEspessura] = useState<number>(1.0);
  const [precoKg, setPrecoKg] = useState<number>(42.0);
  const [fornecedor, setFornecedor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [precos, setPrecos] = useState<any[]>([]);

  const espessuras = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0];

  const carregarPrecos = async () => {
    setLoading(true);
    try {
      const resultado = await materiaisService.obterResumoPrecos();
      setPrecos(resultado.chapas || []);
    } catch (error) {
      console.error('Erro ao carregar preços:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPrecos();
  }, []);

  const salvarPreco = async () => {
    setLoading(true);
    try {
      await materiaisRepo.atualizarPrecoChapa(tipoInox, espessura, precoKg, fornecedor);
      setMensagem({ tipo: 'sucesso', texto: `Preço atualizado: ${tipoInox} ${espessura}mm - R$ ${precoKg}/kg` });
      materiaisService.limparCache();
      await carregarPrecos();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao atualizar preço: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Atualizar Preço de Chapa</CardTitle>
          <CardDescription>
            Configure os preços de chapas de inox por tipo e espessura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Tipo de Inox</Label>
              <Select value={tipoInox} onValueChange={(v) => setTipoInox(v as TipoInox)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="304">INOX 304</SelectItem>
                  <SelectItem value="316">INOX 316</SelectItem>
                  <SelectItem value="430">INOX 430</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Espessura (mm)</Label>
              <Select value={espessura.toString()} onValueChange={(v) => setEspessura(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {espessuras.map(e => (
                    <SelectItem key={e} value={e.toString()}>{e}mm</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Preço (R$/kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={precoKg}
                onChange={(e) => setPrecoKg(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Fornecedor</Label>
              <Input
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Nome do fornecedor"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={salvarPreco} disabled={loading} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preços Atuais</CardTitle>
          <CardDescription>Últimos preços cadastrados por tipo e espessura</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Espessura</TableHead>
                <TableHead>Preço (R$/kg)</TableHead>
                <TableHead>Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {precos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum preço cadastrado. Adicione o primeiro preço acima.
                  </TableCell>
                </TableRow>
              ) : (
                precos.map((preco, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge variant={preco.tipoInox === '304' ? 'default' : 'secondary'}>
                        {preco.tipoInox}
                      </Badge>
                    </TableCell>
                    <TableCell>{preco.espessura}mm</TableCell>
                    <TableCell className="font-mono">R$ {preco.precoKg.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(preco.dataAtualizacao).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// GESTÃO DE TUBOS
// ============================================================================

function GestaoTubos({ setMensagem }: any) {
  const [tubos, setTubos] = useState<TuboDefinicao[]>([]);

  useEffect(() => {
    carregarTubos();
  }, []);

  const carregarTubos = async () => {
    try {
      const resultado = await materiaisService.obterTubos();
      setTubos(resultado);
    } catch (error) {
      console.error('Erro ao carregar tubos:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catálogo de Tubos</CardTitle>
        <CardDescription>Tubos cadastrados com kg/m</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Dimensões</TableHead>
              <TableHead>kg/m</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tubos.map((tubo) => (
              <TableRow key={tubo.id}>
                <TableCell>
                  <Badge>{tubo.tipo}</Badge>
                </TableCell>
                <TableCell>{tubo.descricao}</TableCell>
                <TableCell className="text-sm">
                  {tubo.diametro && `Ø ${tubo.diametro}mm`}
                  {tubo.lado && `${tubo.lado}×${tubo.lado}mm`}
                  {tubo.largura && tubo.altura && `${tubo.largura}×${tubo.altura}mm`}
                  {` × ${tubo.espessuraParede}mm`}
                </TableCell>
                <TableCell className="font-mono">{tubo.kgPorMetro.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={tubo.ativo ? 'default' : 'secondary'}>
                    {tubo.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GESTÃO DE CANTONEIRAS
// ============================================================================

function GestaoCantoneiras({ setMensagem }: any) {
  const [cantoneiras, setCantoneiras] = useState<CantoneiraDefinicao[]>([]);

  useEffect(() => {
    carregarCantoneiras();
  }, []);

  const carregarCantoneiras = async () => {
    try {
      const resultado = await materiaisService.obterCantoneiras();
      setCantoneiras(resultado);
    } catch (error) {
      console.error('Erro ao carregar cantoneiras:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catálogo de Cantoneiras</CardTitle>
        <CardDescription>Cantoneiras cadastradas com kg/m</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Dimensões</TableHead>
              <TableHead>kg/m</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cantoneiras.map((cant) => (
              <TableRow key={cant.id}>
                <TableCell>{cant.descricao}</TableCell>
                <TableCell className="text-sm font-mono">
                  {cant.ladoA}×{cant.ladoB}×{cant.espessura}mm
                </TableCell>
                <TableCell className="font-mono">{cant.kgPorMetro.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={cant.ativo ? 'default' : 'secondary'}>
                    {cant.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GESTÃO DE ACESSÓRIOS
// ============================================================================

function GestaoAcessorios({ setMensagem }: any) {
  const [acessorios, setAcessorios] = useState<AcessorioDefinicao[]>([]);

  useEffect(() => {
    carregarAcessorios();
  }, []);

  const carregarAcessorios = async () => {
    try {
      const resultado = await materiaisService.obterAcessorios();
      setAcessorios(resultado);
    } catch (error) {
      console.error('Erro ao carregar acessórios:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catálogo de Acessórios</CardTitle>
        <CardDescription>Acessórios cadastrados com preços unitários</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço Unit.</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {acessorios.map((acess) => (
              <TableRow key={acess.id}>
                <TableCell className="font-mono text-sm">{acess.sku}</TableCell>
                <TableCell>{acess.nome}</TableCell>
                <TableCell>
                  <Badge variant="outline">{acess.categoria}</Badge>
                </TableCell>
                <TableCell className="font-mono">
                  R$ {acess.precoUnitario.toFixed(2)}/{acess.unidade}
                </TableCell>
                <TableCell className="text-sm">
                  {acess.estoque !== undefined ? (
                    <span className={acess.estoque < (acess.estoqueMinimo || 0) ? 'text-red-600' : ''}>
                      {acess.estoque}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={acess.ativo ? 'default' : 'secondary'}>
                    {acess.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

function GestaoConfiguracoes({ setMensagem }: any) {
  const [config, setConfig] = useState<ConfiguracoesMateriais | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarConfig();
  }, []);

  const carregarConfig = async () => {
    setLoading(true);
    try {
      const resultado = await materiaisService.obterConfiguracoes();
      setConfig(resultado);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarConfig = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      await materiaisRepo.atualizarConfiguracoesMateriais(config);
      setMensagem({ tipo: 'sucesso', texto: 'Configurações atualizadas com sucesso!' });
      materiaisService.limparCache();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar configurações: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  if (!config) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Globais</CardTitle>
        <CardDescription>
          Configure parâmetros gerais do sistema de orçamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Densidade do Inox (kg/m³)</Label>
            <Input
              type="number"
              value={config.densidadeInoxKgM3}
              onChange={(e) => setConfig({ ...config, densidadeInoxKgM3: Number(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground mt-1">Padrão: 7900 kg/m³</p>
          </div>

          <div>
            <Label>Margem de Perda de Material (%)</Label>
            <Input
              type="number"
              value={config.margemPerdaMaterial}
              onChange={(e) => setConfig({ ...config, margemPerdaMaterial: Number(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground mt-1">Desperdício no corte</p>
          </div>

          <div>
            <Label>Overhead (%)</Label>
            <Input
              type="number"
              value={config.overheadPercent}
              onChange={(e) => setConfig({ ...config, overheadPercent: Number(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground mt-1">Custos fixos/indiretos</p>
          </div>

          <div>
            <Label>Margem de Lucro Mínima (%)</Label>
            <Input
              type="number"
              value={config.margemLucroMinima}
              onChange={(e) => setConfig({ ...config, margemLucroMinima: Number(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground mt-1">Anti-prejuízo</p>
          </div>

          <div>
            <Label>Markup Padrão (multiplicador)</Label>
            <Input
              type="number"
              step="0.1"
              value={config.markupPadrao}
              onChange={(e) => setConfig({ ...config, markupPadrao: Number(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground mt-1">Ex: 2.5 = 2.5× o custo</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={salvarConfig} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
