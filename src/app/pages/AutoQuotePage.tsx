// ============================================================
// AUTO QUOTE PAGE - Automatic equipment pricing interface
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Calculator, 
  Package, 
  Settings, 
  AlertTriangle, 
  Download,
  RefreshCw,
  Eye,
  Layers,
  DollarSign,
  Factory,
  Box
} from 'lucide-react';

import {
  EquipmentInputs,
  PricingResult,
} from '@/domains/pricingSystem/pricing.types';
import {
  getAllTemplates,
  getTemplate,
  runPricingPipeline,
  canFinalize,
  createSnapshot,
  downloadSnapshot,
  getCostBreakdown,
} from '@/domains/pricingSystem';
import { DEFAULT_RULESET } from '@/domains/engine/ruleset';

// ============================================================
// Mock Data (would come from database in production)
// ============================================================

const MOCK_MATERIALS = [
  {
    key: 'SHEET#SS304#1.2#POLIDO#3000x1250#DEFAULT',
    kind: 'sheet' as const,
    alloy: '304',
    thicknessMm: 1.2,
    finish: 'POLIDO',
    format: { widthMm: 3000, heightMm: 1250, supplierFormatName: '3000x1250' },
    supplierId: 'DEFAULT',
    densityKgM3: 7930,
    active: true,
    priceHistory: [{
      currency: 'BRL',
      pricePerKg: 45,
      supplierId: 'DEFAULT',
      validFrom: '2024-01-01',
      updatedAt: '2024-01-01'
    }]
  },
  {
    key: 'SHEET#SS304#1.5#POLIDO#3000x1250#DEFAULT',
    kind: 'sheet' as const,
    alloy: '304',
    thicknessMm: 1.5,
    finish: 'POLIDO',
    format: { widthMm: 3000, heightMm: 1250, supplierFormatName: '3000x1250' },
    supplierId: 'DEFAULT',
    densityKgM3: 7930,
    active: true,
    priceHistory: [{
      currency: 'BRL',
      pricePerKg: 45,
      supplierId: 'DEFAULT',
      validFrom: '2024-01-01',
      updatedAt: '2024-01-01'
    }]
  },
  {
    key: 'TUBE#SS304#40x40x1.2#6000#DEFAULT',
    kind: 'tube' as const,
    alloy: '304',
    finish: 'POLIDO',
    tubeProfile: { widthMm: 40, heightMm: 40, thicknessMm: 1.2, lengthMm: 6000 },
    supplierId: 'DEFAULT',
    densityKgM3: 7930,
    active: true,
    priceHistory: [{
      currency: 'BRL',
      pricePerMeter: 25,
      supplierId: 'DEFAULT',
      validFrom: '2024-01-01',
      updatedAt: '2024-01-01'
    }]
  }
];

const MOCK_PROCESSES = [
  { key: 'CORTE_LASER' as const, label: 'Corte a Laser', active: true, costModel: { setupMinutes: 15, costPerHour: 180, costPerMeter: 8 } },
  { key: 'DOBRA' as const, label: 'Dobra', active: true, costModel: { setupMinutes: 20, costPerHour: 150, costPerBend: 3 } },
  { key: 'SOLDA_TIG' as const, label: 'Solda TIG', active: true, costModel: { setupMinutes: 30, costPerHour: 200, costPerMeter: 25 } },
  { key: 'POLIMENTO' as const, label: 'Polimento', active: true, costModel: { setupMinutes: 30, costPerHour: 120, costPerM2: 45 } },
  { key: 'MONTAGEM' as const, label: 'Montagem', active: true, costModel: { setupMinutes: 30, costPerHour: 100, costPerUnit: 10 } },
  { key: 'EMBALAGEM' as const, label: 'Embalagem', active: true, costModel: { setupMinutes: 10, costPerHour: 60, costPerUnit: 5 } },
];

// ============================================================
// Main Component
// ============================================================

export default function AutoQuotePage() {
  // State
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [inputs, setInputs] = useState<EquipmentInputs>({
    width: 1000,
    depth: 600,
    height: 900,
    thickness: 1.2,
    finish: 'POLIDO',
    hasShelf: false,
    hasBacksplash: false,
    backsplashHeight: 300,
    hasCasters: false,
  });
  
  const [result, setResult] = useState<PricingResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // Get templates
  const templates = useMemo(() => getAllTemplates(), []);
  
  // Get selected template info
  const template = useMemo(() => {
    return selectedTemplate ? getTemplate(selectedTemplate) : null;
  }, [selectedTemplate]);
  
  // Handle input change
  const handleInputChange = useCallback((field: keyof EquipmentInputs, value: unknown) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setResult(null); // Clear result when inputs change
  }, []);
  
  // Calculate pricing
  const handleCalculate = useCallback(() => {
    if (!template) {
      setErrors(['Selecione um equipamento']);
      return;
    }
    
    setIsCalculating(true);
    setErrors([]);
    setWarnings([]);
    
    // Run pricing pipeline
    const pipelineResult = runPricingPipeline(
      template,
      inputs,
      MOCK_MATERIALS,
      MOCK_PROCESSES,
      DEFAULT_RULESET
    );
    
    if (pipelineResult.success && pipelineResult.result) {
      setResult(pipelineResult.result);
      setWarnings(pipelineResult.warnings);
    } else {
      setErrors(pipelineResult.errors.map(e => e.message));
      setWarnings(pipelineResult.warnings);
    }
    
    setIsCalculating(false);
  }, [template, inputs]);
  
  // Check if can finalize
  const finalization = useMemo(() => {
    if (!result) return null;
    return canFinalize(result, DEFAULT_RULESET);
  }, [result]);
  
  // Generate quote
  const handleGenerateQuote = useCallback(() => {
    if (!result) return;
    
    const snapshot = createSnapshot(result);
    downloadSnapshot(snapshot);
  }, [result]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orçamento Automático</h1>
          <p className="text-muted-foreground">
            Sistema de precificação automática de equipamentos
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          v{DEFAULT_RULESET.version}
        </Badge>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Input */}
        <div className="lg:col-span-1 space-y-6">
          {/* Equipment Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Equipamento
              </CardTitle>
              <CardDescription>
                Selecione o tipo de equipamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {template && (
                <p className="text-sm text-muted-foreground mt-2">
                  {template.description}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Dimensions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Dimensões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="width">Largura (mm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={inputs.width}
                    onChange={e => handleInputChange('width', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="depth">Prof. (mm)</Label>
                  <Input
                    id="depth"
                    type="number"
                    value={inputs.depth}
                    onChange={e => handleInputChange('depth', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Altura (mm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={inputs.height}
                    onChange={e => handleInputChange('height', Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="thickness">Espessura (mm)</Label>
                <Select 
                  value={inputs.thickness.toString()} 
                  onValueChange={v => handleInputChange('thickness', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.8">0.8mm</SelectItem>
                    <SelectItem value="1.0">1.0mm</SelectItem>
                    <SelectItem value="1.2">1.2mm</SelectItem>
                    <SelectItem value="1.5">1.5mm</SelectItem>
                    <SelectItem value="2.0">2.0mm</SelectItem>
                    <SelectItem value="2.5">2.5mm</SelectItem>
                    <SelectItem value="3.0">3.0mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="finish">Acabamento</Label>
                <Select 
                  value={inputs.finish} 
                  onValueChange={v => handleInputChange('finish', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POLIDO">Polido</SelectItem>
                    <SelectItem value="ESCOVADO">Escovado</SelectItem>
                    <SelectItem value="2B">2B (Natural)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Opções
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hasShelf">Com prateleira</Label>
                <Switch
                  id="hasShelf"
                  checked={inputs.hasShelf}
                  onCheckedChange={v => handleInputChange('hasShelf', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="hasBacksplash">Com espelho</Label>
                <Switch
                  id="hasBacksplash"
                  checked={inputs.hasBacksplash}
                  onCheckedChange={v => handleInputChange('hasBacksplash', v)}
                />
              </div>
              
              {inputs.hasBacksplash && (
                <div>
                  <Label htmlFor="backsplashHeight">Altura do espelho (mm)</Label>
                  <Input
                    id="backsplashHeight"
                    type="number"
                    value={inputs.backsplashHeight}
                    onChange={e => handleInputChange('backsplashHeight', Number(e.target.value))}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label htmlFor="hasCasters">Com rodízios</Label>
                <Switch
                  id="hasCasters"
                  checked={inputs.hasCasters}
                  onCheckedChange={v => handleInputChange('hasCasters', v)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Calculate Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCalculate}
            disabled={!selectedTemplate || isCalculating}
          >
            {isCalculating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Preço
              </>
            )}
          </Button>
        </div>
        
        {/* Right Panel - Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erros</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Avisos</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {result ? (
            <>
              {/* Price Summary */}
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Preço Final
                    </span>
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(result.finalPrice)}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Preço mínimo: {formatCurrency(result.minPrice)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(result.totalMaterialCost)}</div>
                      <div className="text-sm text-muted-foreground">Material</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(result.totalProcessCost)}</div>
                      <div className="text-sm text-muted-foreground">Processos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(result.overhead.totalOverhead)}</div>
                      <div className="text-sm text-muted-foreground">Overhead</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{result.margin.marginPercent.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Margem</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Details Tabs */}
              <Tabs defaultValue="breakdown">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                  <TabsTrigger value="bom">BOM</TabsTrigger>
                  <TabsTrigger value="nesting">Nesting</TabsTrigger>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="breakdown" className="space-y-4">
                  {/* Cost Breakdown Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Custos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getCostBreakdown(result).map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span>{item.category}</span>
                              <span>{formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)</span>
                            </div>
                            <Progress value={item.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Material Costs */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Custos de Material</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.materialCost.map((mc, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <div className="font-medium">{mc.materialKey.split('#')[2]}mm</div>
                              <div className="text-sm text-muted-foreground">
                                {mc.sheetsUsed} chapas • {mc.totalKg.toFixed(1)}kg
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{formatCurrency(mc.totalCost)}</div>
                              <div className="text-sm text-muted-foreground">
                                Perda: {formatCurrency(mc.wasteCost)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Process Costs */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Custos de Processos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.processCost.map((pc, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <div className="font-medium">{pc.processLabel}</div>
                              <div className="text-sm text-muted-foreground">{pc.details}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{formatCurrency(pc.totalCost)}</div>
                              <div className="text-sm text-muted-foreground">
                                {pc.estimatedMinutes}min
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="bom">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bill of Materials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Sheet Parts */}
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Chapas ({result.bom.sheetParts.length})
                          </h4>
                          <div className="space-y-1">
                            {result.bom.sheetParts.map((part, i) => (
                              <div key={i} className="flex justify-between text-sm p-2 bg-muted rounded">
                                <span>{part.label}</span>
                                <span className="text-muted-foreground">
                                  {part.blank.width}x{part.blank.height}mm • {part.thickness}mm • x{part.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tube Parts */}
                        {result.bom.tubes.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Factory className="h-4 w-4" />
                              Tubos ({result.bom.tubes.length})
                            </h4>
                            <div className="space-y-1">
                              {result.bom.tubes.map((tube, i) => (
                                <div key={i} className="flex justify-between text-sm p-2 bg-muted rounded">
                                  <span>{tube.label}</span>
                                  <span className="text-muted-foreground">
                                    {tube.profile} • {tube.length}mm • x{tube.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Accessories */}
                        {result.bom.accessories.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Acessórios ({result.bom.accessories.length})
                            </h4>
                            <div className="space-y-1">
                              {result.bom.accessories.map((acc, i) => (
                                <div key={i} className="flex justify-between text-sm p-2 bg-muted rounded">
                                  <span>{acc.label}</span>
                                  <span className="text-muted-foreground">
                                    {acc.sku} • x{acc.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="nesting">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resultado do Nesting</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-4 bg-muted rounded">
                          <div className="text-2xl font-bold">{result.nestingResult.totalSheets}</div>
                          <div className="text-sm text-muted-foreground">Chapas</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded">
                          <div className="text-2xl font-bold">{result.nestingResult.utilization.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Aproveitamento</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded">
                          <div className="text-2xl font-bold">{(result.nestingResult.wasteArea / 1000000).toFixed(2)}m²</div>
                          <div className="text-sm text-muted-foreground">Perda</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {result.nestingResult.layouts.map((layout, i) => (
                          <div key={i} className="p-3 bg-muted rounded">
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">Chapa {i + 1}</span>
                              <span className="text-sm text-muted-foreground">
                                {layout.sheetWidth}x{layout.sheetHeight}mm
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>{layout.parts.length} peças</span>
                              <span>{((layout.usedArea / (layout.sheetWidth * layout.sheetHeight)) * 100).toFixed(1)}% uso</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalhes do Cálculo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Equipamento</Label>
                            <div className="font-medium">{result.equipmentType}</div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Versão do Ruleset</Label>
                            <div className="font-medium">{result.rulesetVersion}</div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Timestamp</Label>
                            <div className="font-medium">{new Date(result.timestamp).toLocaleString('pt-BR')}</div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Hash</Label>
                            <div className="font-mono text-sm">{result.hash.substring(0, 16)}...</div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <Label className="text-muted-foreground">Inputs</Label>
                          <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(result.inputs, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        const json = JSON.stringify(result, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `orcamento-${result.hash.substring(0, 8)}.json`;
                        a.click();
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver JSON
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleGenerateQuote}
                      disabled={!finalization?.canFinalize}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Orçamento
                    </Button>
                  </div>
                  
                  {finalization && !finalization.canFinalize && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Não é possível finalizar</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-4">
                          {finalization.blockers.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um equipamento e clique em Calcular</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}