/**
 * ============================================================================
 * PÁGINA DE CRIAÇÃO DE ORÇAMENTO
 * ============================================================================
 * Interface para criar orçamentos com BOM + Nesting + Custos
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Separator } from '@/app/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  FileText, 
  Package, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { calcularOrcamento, type BOM, type PecaChapa, type PecaTubo, type PecaAcessorio, type ProcessoFabricacao, type ResultadoOrcamento } from '@/domains/orcamento/engine';
import * as materiaisService from '@/domains/materiais/service';
import type { TuboDefinicao, AcessorioDefinicao, TipoInox } from '@/domains/materiais/types';

export default function CriacaoOrcamentoPage() {
  const [bom, setBom] = useState<BOM>({
    pecasChapa: [],
    pecasTubo: [],
    pecasCantoneira: [],
    pecasAcessorio: [],
    processos: [],
  });

  const [resultado, setResultado] = useState<ResultadoOrcamento | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [tubos, setTubos] = useState<TuboDefinicao[]>([]);
  const [acessorios, setAcessorios] = useState<AcessorioDefinicao[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [tubosData, acessoriosData] = await Promise.all([
        materiaisService.obterTubos(),
        materiaisService.obterAcessorios(),
      ]);
      setTubos(tubosData);
      setAcessorios(acessoriosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const calcular = async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await calcularOrcamento(bom);
      setResultado(res);
    } catch (error) {
      setErro((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setBom({
      pecasChapa: [],
      pecasTubo: [],
      pecasCantoneira: [],
      pecasAcessorio: [],
      processos: [],
    });
    setResultado(null);
    setErro(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Novo Orçamento</h1>
          <p className="text-muted-foreground">
            Crie orçamentos com BOM, nesting automático e cálculo de custos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={limpar}>
            Limpar
          </Button>
          <Button onClick={calcular} disabled={loading || bom.pecasChapa.length === 0}>
            <Calculator className="mr-2 h-4 w-4" />
            {loading ? 'Calculando...' : 'Calcular Orçamento'}
          </Button>
        </div>
      </div>

      {erro && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ENTRADA - BOM */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                BOM - Bill of Materials
              </CardTitle>
              <CardDescription>
                Defina as peças, materiais e processos necessários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chapas">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="chapas">Chapas</TabsTrigger>
                  <TabsTrigger value="tubos">Tubos</TabsTrigger>
                  <TabsTrigger value="acessorios">Acessórios</TabsTrigger>
                  <TabsTrigger value="processos">Processos</TabsTrigger>
                </TabsList>

                <TabsContent value="chapas">
                  <FormularioChapas bom={bom} setBom={setBom} />
                </TabsContent>

                <TabsContent value="tubos">
                  <FormularioTubos bom={bom} setBom={setBom} tubos={tubos} />
                </TabsContent>

                <TabsContent value="acessorios">
                  <FormularioAcessorios bom={bom} setBom={setBom} acessorios={acessorios} />
                </TabsContent>

                <TabsContent value="processos">
                  <FormularioProcessos bom={bom} setBom={setBom} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* RESULTADO */}
        <div>
          {resultado ? (
            <ResultadoOrcamentoView resultado={resultado} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Adicione peças ao BOM e clique em "Calcular Orçamento"
                  <br />
                  para visualizar o resultado
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FORMULÁRIO DE CHAPAS
// ============================================================================

function FormularioChapas({ bom, setBom }: { bom: BOM; setBom: (bom: BOM) => void }) {
  const [nova, setNova] = useState<Partial<PecaChapa>>({
    descricao: '',
    largura: 2000,
    altura: 800,
    quantidade: 1,
    espessuraMm: 1.2,
    tipoInox: '304',
    familia: 'tampo',
    podeRotacionar: true,
  });

  const adicionar = () => {
    if (!nova.descricao) return;
    
    const peca: PecaChapa = {
      id: `chapa_${Date.now()}`,
      descricao: nova.descricao,
      largura: nova.largura || 0,
      altura: nova.altura || 0,
      quantidade: nova.quantidade || 1,
      espessuraMm: nova.espessuraMm || 1.0,
      tipoInox: (nova.tipoInox as TipoInox) || '304',
      familia: nova.familia || 'tampo',
      podeRotacionar: nova.podeRotacionar !== false,
    };

    setBom({ ...bom, pecasChapa: [...bom.pecasChapa, peca] });
    setNova({ ...nova, descricao: '' });
  };

  const remover = (id: string) => {
    setBom({ ...bom, pecasChapa: bom.pecasChapa.filter(p => p.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Descrição</Label>
          <Input
            value={nova.descricao}
            onChange={(e) => setNova({ ...nova, descricao: e.target.value })}
            placeholder="Ex: Tampo da bancada"
          />
        </div>

        <div>
          <Label>Largura (mm)</Label>
          <Input
            type="number"
            value={nova.largura}
            onChange={(e) => setNova({ ...nova, largura: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label>Altura (mm)</Label>
          <Input
            type="number"
            value={nova.altura}
            onChange={(e) => setNova({ ...nova, altura: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label>Quantidade</Label>
          <Input
            type="number"
            value={nova.quantidade}
            onChange={(e) => setNova({ ...nova, quantidade: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label>Espessura (mm)</Label>
          <Select 
            value={nova.espessuraMm?.toString()} 
            onValueChange={(v) => setNova({ ...nova, espessuraMm: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5mm</SelectItem>
              <SelectItem value="0.8">0.8mm</SelectItem>
              <SelectItem value="1.0">1.0mm</SelectItem>
              <SelectItem value="1.2">1.2mm</SelectItem>
              <SelectItem value="1.5">1.5mm</SelectItem>
              <SelectItem value="2.0">2.0mm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tipo de Inox</Label>
          <Select 
            value={nova.tipoInox} 
            onValueChange={(v) => setNova({ ...nova, tipoInox: v as TipoInox })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="304">304</SelectItem>
              <SelectItem value="316">316</SelectItem>
              <SelectItem value="430">430</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Família</Label>
          <Input
            value={nova.familia}
            onChange={(e) => setNova({ ...nova, familia: e.target.value })}
            placeholder="Ex: tampo, prateleira"
          />
        </div>

        <div className="col-span-2">
          <Button onClick={adicionar} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Peça
          </Button>
        </div>
      </div>

      {bom.pecasChapa.length > 0 && (
        <div className="mt-4">
          <Separator className="mb-3" />
          <div className="space-y-2">
            {bom.pecasChapa.map((peca) => (
              <div key={peca.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="text-sm">
                  <strong>{peca.descricao}</strong>
                  <br />
                  {peca.largura}×{peca.altura}mm, {peca.espessuraMm}mm, {peca.tipoInox}, qty: {peca.quantidade}
                </div>
                <Button variant="ghost" size="sm" onClick={() => remover(peca.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FORMULÁRIO DE TUBOS
// ============================================================================

function FormularioTubos({ bom, setBom, tubos }: { bom: BOM; setBom: (bom: BOM) => void; tubos: TuboDefinicao[] }) {
  const [novo, setNovo] = useState<Partial<PecaTubo>>({
    descricao: '',
    tuboId: tubos[0]?.id || '',
    metros: 1,
    tipoInox: '304',
  });

  const adicionar = () => {
    if (!novo.tuboId || !novo.descricao) return;
    
    const peca: PecaTubo = {
      id: `tubo_${Date.now()}`,
      descricao: novo.descricao,
      tuboId: novo.tuboId,
      metros: novo.metros || 0,
      tipoInox: (novo.tipoInox as TipoInox) || '304',
    };

    setBom({ ...bom, pecasTubo: [...bom.pecasTubo, peca] });
    setNovo({ ...novo, descricao: '', metros: 1 });
  };

  const remover = (id: string) => {
    setBom({ ...bom, pecasTubo: bom.pecasTubo.filter(p => p.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Descrição</Label>
          <Input
            value={novo.descricao}
            onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
            placeholder="Ex: Pés e travessas"
          />
        </div>

        <div className="col-span-2">
          <Label>Tipo de Tubo</Label>
          <Select value={novo.tuboId} onValueChange={(v) => setNovo({ ...novo, tuboId: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tubos.map((tubo) => (
                <SelectItem key={tubo.id} value={tubo.id}>
                  {tubo.descricao} ({tubo.kgPorMetro.toFixed(2)} kg/m)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Metros</Label>
          <Input
            type="number"
            step="0.1"
            value={novo.metros}
            onChange={(e) => setNovo({ ...novo, metros: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label>Tipo de Inox</Label>
          <Select value={novo.tipoInox} onValueChange={(v) => setNovo({ ...novo, tipoInox: v as TipoInox })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="304">304</SelectItem>
              <SelectItem value="316">316</SelectItem>
              <SelectItem value="430">430</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Button onClick={adicionar} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Tubo
          </Button>
        </div>
      </div>

      {bom.pecasTubo.length > 0 && (
        <div className="mt-4">
          <Separator className="mb-3" />
          <div className="space-y-2">
            {bom.pecasTubo.map((peca) => (
              <div key={peca.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="text-sm">
                  <strong>{peca.descricao}</strong>
                  <br />
                  {peca.metros}m, {peca.tipoInox}
                </div>
                <Button variant="ghost" size="sm" onClick={() => remover(peca.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FORMULÁRIO DE ACESSÓRIOS
// ============================================================================

function FormularioAcessorios({ bom, setBom, acessorios }: { bom: BOM; setBom: (bom: BOM) => void; acessorios: AcessorioDefinicao[] }) {
  const [novo, setNovo] = useState<Partial<PecaAcessorio>>({
    sku: acessorios[0]?.sku || '',
    descricao: '',
    quantidade: 1,
  });

  const adicionar = () => {
    if (!novo.sku) return;
    
    const acessorio = acessorios.find(a => a.sku === novo.sku);
    if (!acessorio) return;

    const peca: PecaAcessorio = {
      id: `acess_${Date.now()}`,
      sku: novo.sku,
      descricao: acessorio.nome,
      quantidade: novo.quantidade || 1,
    };

    setBom({ ...bom, pecasAcessorio: [...bom.pecasAcessorio, peca] });
    setNovo({ ...novo, quantidade: 1 });
  };

  const remover = (id: string) => {
    setBom({ ...bom, pecasAcessorio: bom.pecasAcessorio.filter(p => p.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Acessório</Label>
          <Select value={novo.sku} onValueChange={(v) => setNovo({ ...novo, sku: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {acessorios.map((acess) => (
                <SelectItem key={acess.sku} value={acess.sku}>
                  {acess.nome} (R$ {acess.precoUnitario.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label>Quantidade</Label>
          <Input
            type="number"
            value={novo.quantidade}
            onChange={(e) => setNovo({ ...novo, quantidade: Number(e.target.value) })}
          />
        </div>

        <div className="col-span-2">
          <Button onClick={adicionar} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Acessório
          </Button>
        </div>
      </div>

      {bom.pecasAcessorio.length > 0 && (
        <div className="mt-4">
          <Separator className="mb-3" />
          <div className="space-y-2">
            {bom.pecasAcessorio.map((peca) => (
              <div key={peca.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="text-sm">
                  <strong>{peca.descricao}</strong>
                  <br />
                  Qtd: {peca.quantidade}
                </div>
                <Button variant="ghost" size="sm" onClick={() => remover(peca.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FORMULÁRIO DE PROCESSOS
// ============================================================================

function FormularioProcessos({ bom, setBom }: { bom: BOM; setBom: (bom: BOM) => void }) {
  const [novo, setNovo] = useState<Partial<ProcessoFabricacao>>({
    tipo: 'corte',
    descricao: '',
    minutos: 30,
  });

  const tiposProcesso = [
    { value: 'corte', label: 'Corte' },
    { value: 'dobra', label: 'Dobra' },
    { value: 'solda', label: 'Solda' },
    { value: 'acabamento', label: 'Acabamento' },
    { value: 'montagem', label: 'Montagem' },
    { value: 'instalacao', label: 'Instalação' },
  ];

  const adicionar = () => {
    if (!novo.descricao) return;
    
    const processo: ProcessoFabricacao = {
      id: `proc_${Date.now()}`,
      tipo: novo.tipo || 'corte',
      descricao: novo.descricao,
      minutos: novo.minutos || 0,
    };

    setBom({ ...bom, processos: [...bom.processos, processo] });
    setNovo({ ...novo, descricao: '', minutos: 30 });
  };

  const remover = (id: string) => {
    setBom({ ...bom, processos: bom.processos.filter(p => p.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Tipo de Processo</Label>
          <Select value={novo.tipo} onValueChange={(v) => setNovo({ ...novo, tipo: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tiposProcesso.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label>Descrição</Label>
          <Input
            value={novo.descricao}
            onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
            placeholder="Ex: Corte a laser"
          />
        </div>

        <div className="col-span-2">
          <Label>Tempo (minutos)</Label>
          <Input
            type="number"
            value={novo.minutos}
            onChange={(e) => setNovo({ ...novo, minutos: Number(e.target.value) })}
          />
        </div>

        <div className="col-span-2">
          <Button onClick={adicionar} className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Processo
          </Button>
        </div>
      </div>

      {bom.processos.length > 0 && (
        <div className="mt-4">
          <Separator className="mb-3" />
          <div className="space-y-2">
            {bom.processos.map((proc) => (
              <div key={proc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="text-sm">
                  <strong>{proc.descricao}</strong>
                  <br />
                  {proc.minutos} minutos
                </div>
                <Button variant="ghost" size="sm" onClick={() => remover(proc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VISUALIZAÇÃO DO RESULTADO
// ============================================================================

function ResultadoOrcamentoView({ resultado }: { resultado: ResultadoOrcamento }) {
  return (
    <div className="space-y-6">
      {/* AVISOS */}
      {resultado.avisos.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {resultado.avisos.map((aviso, idx) => (
                <li key={idx}>{aviso}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* NESTING */}
      <Card>
        <CardHeader>
          <CardTitle>Nesting e Materiais</CardTitle>
          <CardDescription>Otimização de corte e quantidades</CardDescription>
        </CardHeader>
        <CardContent>
          {resultado.nesting.map((n, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">
                  {n.familia} - {n.tipoInox} {n.espessuraMm}mm
                </h4>
                <Badge>{n.aproveitamentoMedio.toFixed(1)}% aproveitamento</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-muted rounded">
                  <div className="text-muted-foreground">Chapas</div>
                  <div className="font-semibold">{n.totalChapas}</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-muted-foreground">Peso</div>
                  <div className="font-semibold">{n.kgTotal.toFixed(2)} kg</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-muted-foreground">Custo</div>
                  <div className="font-semibold">R$ {n.custoTotal.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CUSTOS POR CATEGORIA */}
      {resultado.categorias.map((cat, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-lg">{cat.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {cat.itens.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div>
                        <strong>{item.descricao}</strong>
                        {item.detalhes && (
                          <div className="text-sm text-muted-foreground">{item.detalhes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {item.quantidade} {item.unidade} × R$ {item.valorUnitario.toFixed(2)}
                      </div>
                      <div className="font-semibold">R$ {item.valorTotal.toFixed(2)}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-2" />
            <div className="flex justify-between items-center font-semibold">
              <span>Subtotal</span>
              <span>R$ {cat.subtotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* RESUMO FINANCEIRO */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Custo Materiais</span>
            <span className="font-mono">R$ {resultado.resumo.custoMateriais.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Custo Processos</span>
            <span className="font-mono">R$ {resultado.resumo.custoProcessos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Custo Acessórios</span>
            <span className="font-mono">R$ {resultado.resumo.custoAcessorios.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span>Subtotal Direto</span>
            <span className="font-mono">R$ {resultado.resumo.subtotalDireto.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Overhead</span>
            <span className="font-mono">R$ {resultado.resumo.overhead.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>CUSTO TOTAL</span>
            <span className="font-mono">R$ {resultado.resumo.custoTotal.toFixed(2)}</span>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Preço Mínimo (margem {(resultado.resumo.margemMinima * 100).toFixed(0)}%)</span>
            <span className="font-mono">R$ {resultado.resumo.precoMinimo.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-primary">
            <span>PREÇO SUGERIDO</span>
            <span className="font-mono">R$ {resultado.resumo.precoSugerido.toFixed(2)}</span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Markup: {resultado.resumo.markup.toFixed(1)}×
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
