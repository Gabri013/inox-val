import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { getCorporateValidationService } from '@/domains/corporateValidation/corporateValidation.service';
import { CorporateValidationInput, CorporateValidationResult } from '@/domains/corporateValidation/types';
import { FileText, CheckCircle, XCircle, AlertCircle, Download, Upload } from 'lucide-react';

const CorporateValidationPage = () => {
  const [snapshotPath, setSnapshotPath] = useState<string>('samples/snapshot-pass.json');
  const [validationResult, setValidationResult] = useState<CorporateValidationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Carregar dados do snapshot padrão
    loadSnapshotData(snapshotPath);
  }, []);

  const loadSnapshotData = async (_path: string) => {
    setLoading(true);
    try {
      // Simulamos o carregamento de dados do snapshot
      // Em uma implementação real, você pode carregar dados de um arquivo JSON ou API
      
      // Dados padrão de exemplo
      const sampleInput: CorporateValidationInput = {
        quoteId: 'QUO-2024-001',
        quoteContent: `
          Orçamento #QUO-2024-001
          Data: 2024-01-15
          Validade do preço: 2024-02-15
          
          Termos e Condições:
          - Prazo de entrega: 30 dias
          - Forma de pagamento: 50% antecipado, 50% ao término
          - Responsabilidade: Fornecedor se responsabiliza por defeitos de fabricação
          - Garantia: 1 ano
          
          Itens:
          1. Produto A - R$ 1.000,00
          2. Produto B - R$ 2.000,00
          Total: R$ 3.000,00
          
          Desconto: 8%
          Preço final: R$ 2.760,00
        `,
        priceValidityDate: '2024-02-15',
        discountPercentage: 8,
        discountApproved: true,
        clientAcceptanceTimestamp: new Date().toISOString(),

        costData: {
          materials: 1500,
          labor: 800,
          overhead: 400,
          otherExpenses: 200,
          totalRevenue: 3000
        },

        securityData: {
          finalPrice: 2760,
          calculatedPrice: 2760,
          marginPercentage: 15.22,
          discountPercentage: 8,
          totalCost: 2900,
          originalMaterials: ['AÇO INOX 304', 'AÇO CARBONO'],
          actualMaterials: ['AÇO INOX 304', 'AÇO CARBONO'],
          manualChanges: 0
        },

        userId: 'USER-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

        versionedItems: [
          {
            id: 'TMPL-001',
            type: 'TEMPLATE',
            version: '1.0.0',
            name: 'Orçamento Padrão'
          },
          {
            id: 'PROC-001',
            type: 'PROCESS',
            version: '2.1.3',
            name: 'Corte Laser'
          },
          {
            id: 'MAT-001',
            type: 'MATERIAL',
            version: '1.2.0',
            name: 'AÇO INOX 304'
          },
          {
            id: 'SET-001',
            type: 'SETTING',
            version: '3.0.1',
            name: 'Configurações de Preço'
          },
          {
            id: 'CAL-001',
            type: 'CALIBRATION_FACTOR',
            version: '1.0.5',
            name: 'Fator de Calibração Laser'
          }
        ],

        changelog: [
          {
            id: 'CL-001',
            itemId: 'TMPL-001',
            itemType: 'TEMPLATE',
            versionBefore: '0.9.0',
            versionAfter: '1.0.0',
            changeReason: 'Atualização de termos e condições',
            userId: 'ADM-001',
            timestamp: '2024-01-10T10:30:00Z',
            details: 'Adicionadas cláusulas de responsabilidade e garantia'
          },
          {
            id: 'CL-002',
            itemId: 'PROC-001',
            itemType: 'PROCESS',
            versionBefore: '2.1.2',
            versionAfter: '2.1.3',
            changeReason: 'Otimização de processo',
            userId: 'ENG-001',
            timestamp: '2024-01-12T14:45:00Z',
            details: 'Ajuste na velocidade de corte para melhor qualidade'
          }
        ]
      };

      // Executar validação corporativa
      const validationService = getCorporateValidationService();
      const result = validationService.validate(sampleInput);
      
      setValidationResult(result);
    } catch (error) {
      console.error('Erro ao carregar dados do snapshot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSnapshotSelect = (path: string) => {
    setSnapshotPath(path);
    loadSnapshotData(path);
  };

  const handleDownloadReport = () => {
    if (validationResult) {
      const validationService = getCorporateValidationService();
      validationService.saveReport(validationResult);
      
      // Simulamos o download do relatório
      const link = document.createElement('a');
      link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(validationService.generateReport(validationResult))}`;
      link.download = 'CORPORATE_VALIDATION_REPORT.md';
      link.click();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Validação Corporativa</h1>
        <div className="flex gap-4">
          <Select value={snapshotPath} onValueChange={handleSnapshotSelect}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione um snapshot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="samples/snapshot-pass.json">Snapshot Pass (Margem 20%)</SelectItem>
              <SelectItem value="samples/snapshot-fail.json">Snapshot Fail (Margem 3%)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleDownloadReport} disabled={!validationResult}>
            <Download className="w-4 h-4 mr-2" />
            Baixar Relatório
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados de validação...</p>
          </div>
        </div>
      ) : validationResult ? (
        <div className="space-y-6">
          {/* Resumo Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Resumo da Validação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-4">
                <div className="flex-1">
                  <div className="text-2xl font-bold">
                    {validationResult.overallResult === 'PASS' ? (
                      <span className="text-green-600">✓ PASS</span>
                    ) : (
                      <span className="text-red-600">✗ FAIL</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total de módulos: {validationResult.summary.passingModules.length + validationResult.summary.failingModules.length}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Passados: {validationResult.summary.passingModules.length}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-lg font-semibold text-red-600">
                    <XCircle className="w-5 h-5" />
                    Falhos: {validationResult.summary.failingModules.length}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-lg font-semibold text-yellow-600">
                    <AlertCircle className="w-5 h-5" />
                    Avisos: {validationResult.summary.totalWarnings}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Módulos Passados</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">
                    {validationResult.summary.passingModules.length}
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600 font-medium">Módulos Falhados</div>
                  <div className="text-2xl font-bold text-red-700 mt-1">
                    {validationResult.summary.failingModules.length}
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium">Total de Erros</div>
                  <div className="text-2xl font-bold text-yellow-700 mt-1">
                    {validationResult.summary.totalErrors}
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total de Avisos</div>
                  <div className="text-2xl font-bold text-blue-700 mt-1">
                    {validationResult.summary.totalWarnings}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes dos Módulos */}
          {Object.entries(validationResult.modules).map(([moduleKey, moduleResult]) => (
            <Card key={moduleKey} className={
              moduleResult.isValid 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {moduleResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  {moduleKey}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Detalhes específicos por módulo */}
                  {moduleKey === 'commercial' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Termos Aceitos:</span>
                          <span className={(moduleResult as any).termsAccepted ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {(moduleResult as any).termsAccepted ? 'Sim' : 'Não'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Validade do Preço:</span>
                          <span className={(moduleResult as any).priceValidityConsistent ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {(moduleResult as any).priceValidityConsistent ? 'Consistente' : 'Inconsistente'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Desconto Aprovado:</span>
                          <span className={(moduleResult as any).discountApproved ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {(moduleResult as any).discountApproved ? 'Sim' : 'Não'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Aprovação Necessária:</span>
                          <span className={(moduleResult as any).discountApprovalRequired ? 'text-yellow-600 font-semibold' : 'text-green-600 font-semibold'}>
                            {(moduleResult as any).discountApprovalRequired ? 'Sim' : 'Não'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground bg-white p-2 rounded mt-2">
                        <p className="font-medium">Hash SHA256:</p>
                        <p>{(moduleResult as any).snapshotHash}</p>
                      </div>
                      
                      <div className="text-xs text-muted-foreground bg-white p-2 rounded">
                        <p className="font-medium">Assinatura HMAC:</p>
                        <p>{(moduleResult as any).hmacSignature}</p>
                      </div>
                    </div>
                  )}

                  {moduleKey === 'accounting' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Lucro Real Alvo:</span>
                          <span className={(moduleResult as any).realProfitMeetsTarget ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {(moduleResult as any).realProfitMeetsTarget ? 'Sim' : 'Não'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Lucro Fiscal Positivo:</span>
                          <span className={(moduleResult as any).fiscalProfitPositive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {(moduleResult as any).fiscalProfitPositive ? 'Sim' : 'Não'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Custo Total:</span>
                          <span className="font-semibold">
                            R$ {(moduleResult as any).costClassification.totalCost.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Custos Diretos:</span>
                          <span className="font-semibold">
                            R$ {((moduleResult as any).costClassification.directMaterials + (moduleResult as any).costClassification.directLabor).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Custos Indiretos:</span>
                          <span className="font-semibold">
                            R$ {((moduleResult as any).costClassification.indirectMaterials + (moduleResult as any).costClassification.indirectLabor).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Overhead:</span>
                          <span className="font-semibold">
                            R$ {(moduleResult as any).costClassification.overhead.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Simulação Fiscal */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Simulação Fiscal</h4>
                        <div className="bg-white p-3 rounded">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Regime</TableHead>
                                <TableHead>Receita Total</TableHead>
                                <TableHead>Lucro Líquido</TableHead>
                                <TableHead>Imposto Pago</TableHead>
                                <TableHead>Alíquota Efetiva</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(moduleResult as any).fiscalSimulations.map((sim: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{sim.regime}</TableCell>
                                  <TableCell>R$ {sim.totalRevenue.toFixed(2)}</TableCell>
                                  <TableCell className={sim.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    R$ {sim.netProfit.toFixed(2)}
                                  </TableCell>
                                  <TableCell>R$ {sim.taxPayable.toFixed(2)}</TableCell>
                                  <TableCell>{sim.effectiveTaxRate.toFixed(2)}%</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}

                  {moduleKey === 'security' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Score de Fraude:</span>
                          <span className={(moduleResult as any).fraudScore.score < 70 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {(moduleResult as any).fraudScore.score}/100
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Nível de Risco:</span>
                          <span className={(moduleResult as any).fraudScore.isRisky ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                            {(moduleResult as any).fraudScore.isRisky ? 'Alto Risco' : 'Baixo Risco'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Alterações Manuais Bloqueadas:</span>
                          <span className="font-semibold">{(moduleResult as any).manualPriceChangesBlocked}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Anomalias Detectadas:</span>
                          <span className="font-semibold">{(moduleResult as any).anomaliesDetected}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {moduleKey === 'traceability' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Todos os Itens Versionados:</span>
                          <span className={(moduleResult as any).allItemsVersioned ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {(moduleResult as any).allItemsVersioned ? 'Sim' : 'Não'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Changelog Completo:</span>
                          <span className={(moduleResult as any).hasCompleteChangelog ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {(moduleResult as any).hasCompleteChangelog ? 'Sim' : 'Não'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Itens Versionados:</span>
                          <span className="font-semibold">{(moduleResult as any).versionedItems.length}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Entradas no Changelog:</span>
                          <span className="font-semibold">{(moduleResult as any).changelog.length}</span>
                        </div>
                      </div>
                      
                      {/* Itens Versionados */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Itens Versionados</h4>
                        <div className="bg-white p-3 rounded overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Versão</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(moduleResult as any).versionedItems.map((item: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{item.type}</TableCell>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>{item.id}</TableCell>
                                  <TableCell>{item.version}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Erros e Avisos */}
                  {(moduleResult.errors.length > 0 || moduleResult.warnings.length > 0) && (
                    <div className="mt-4 space-y-2">
                      {moduleResult.errors.length > 0 && (
                        <div className="bg-red-50 p-3 rounded">
                          <h4 className="text-sm font-medium text-red-600 mb-2">Erros</h4>
                          <ul className="space-y-1 text-sm text-red-700">
                            {moduleResult.errors.map((error: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {moduleResult.warnings.length > 0 && (
                        <div className="bg-yellow-50 p-3 rounded">
                          <h4 className="text-sm font-medium text-yellow-600 mb-2">Avisos</h4>
                          <ul className="space-y-1 text-sm text-yellow-700">
                            {moduleResult.warnings.map((warning: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum dado de validação carregado</p>
          <Button onClick={() => loadSnapshotData(snapshotPath)} className="mt-4">
            <Upload className="w-4 h-4 mr-2" />
            Carregar Dados
          </Button>
        </div>
      )}
    </div>
  );
};

export default CorporateValidationPage;
