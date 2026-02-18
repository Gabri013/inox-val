import { useState, useEffect } from 'react';
import { Download, FileText, BarChart3, Target, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CalibrationReport } from './types';

interface CalibrationReportPageProps {
  reportId: string;
}

export function CalibrationReportPage({ reportId }: CalibrationReportPageProps) {
  const [report, setReport] = useState<CalibrationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [reportId]);

  const loadReportData = async () => {
    // Mock data - replace with actual service call
    const mockReport: CalibrationReport = {
      companyId: 'test-company',
      runId: 'run-1',
      baselineId: 'baseline-1',
      templateKey: 'template-1',
      inputs: { size: '100x60', material: 'stainless-steel' },
      costBreakdown: {
        material: { actual: 1200, expected: 1150, error: 50 },
        process: { actual: 650, expected: 600, error: 50 },
        overhead: { actual: 250, expected: 200, error: 50 },
        margin: { actual: 400, expected: 450, error: -50 },
      },
      metricsBreakdown: {
        weldMeters: { actual: 12.5, expected: 12.0, error: 0.5 },
        cutMeters: { actual: 6.8, expected: 7.0, error: -0.2 },
        finishM2: { actual: 2.8, expected: 3.0, error: -0.2 },
        bendCount: { actual: 3.5, expected: 3.0, error: 0.5 },
      },
      overallMetrics: {
        mape: 0.045,
        maxError: 0.12,
        minError: -0.08,
      },
      recommendations: [
        {
          id: 'rec-1',
          type: 'factor',
          targetKey: 'global',
          currentValue: 1.02,
          recommendedValue: 1.01,
          reason: 'Material cost overpredicted by 1%',
          impact: 'medium',
          urgency: 'low',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setReport(mockReport);
    setIsLoading(false);
  };

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    if (report) {
      console.log(`Exporting report as ${format}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const mapePercentage = report.overallMetrics.mape * 100;
  const isTargetMet = mapePercentage <= 5;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatório de Calibração</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport('csv')} 
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('json')} 
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Resumo Executivo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Template</p>
            <p className="font-medium">{report.templateKey}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Data</p>
            <p className="font-medium">
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">MAPE</p>
            <p className="text-2xl font-bold text-blue-600">
              {mapePercentage.toFixed(1)}%
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <Badge className={isTargetMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isTargetMet ? '✓ Alvo Atingido' : '✗ Alvo Não Atingido'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Cost Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Breakdown de Custos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Categoria</th>
                <th className="px-4 py-2 text-right">Actual</th>
                <th className="px-4 py-2 text-right">Expected</th>
                <th className="px-4 py-2 text-right">Erro</th>
                <th className="px-4 py-2 text-right">Erro (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(report.costBreakdown).map(([category, values]) => (
                <tr key={category} className="hover:bg-gray-50">
                  <td className="px-4 py-3 capitalize">{category}</td>
                  <td className="px-4 py-3 text-right">
                    R$ {values.actual.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    R$ {values.expected.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={values.error > 0 ? 'text-red-600' : 'text-green-600'}>
                      {values.error > 0 ? '+' : ''}{values.error.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={
                      Math.abs(values.error / values.expected) > 0.05 ? 'text-red-600' : 
                      Math.abs(values.error / values.expected) > 0.02 ? 'text-yellow-600' : 'text-green-600'
                    }>
                      {((values.error / values.expected) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">
                  R$ {Object.values(report.costBreakdown).reduce((sum, v) => sum + v.actual, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  R$ {Object.values(report.costBreakdown).reduce((sum, v) => sum + v.expected, 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={
                    Object.values(report.costBreakdown).reduce((sum, v) => sum + v.error, 0) > 0 
                      ? 'text-red-600' : 'text-green-600'
                  }>
                    {Object.values(report.costBreakdown).reduce((sum, v) => sum + v.error, 0).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {((Object.values(report.costBreakdown).reduce((sum, v) => sum + v.error, 0) / 
                    Object.values(report.costBreakdown).reduce((sum, v) => sum + v.expected, 0)) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Metrics Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Breakdown de Métricas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Métrica</th>
                <th className="px-4 py-2 text-right">Actual</th>
                <th className="px-4 py-2 text-right">Expected</th>
                <th className="px-4 py-2 text-right">Erro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(report.metricsBreakdown).map(([metric, values]) => (
                <tr key={metric} className="hover:bg-gray-50">
                  <td className="px-4 py-3 capitalize">
                    {metric === 'weldMeters' ? 'Métros de Solda' :
                     metric === 'cutMeters' ? 'Métros de Corte' :
                     metric === 'finishM2' ? 'M2 de Acabamento' : 'Dobras'}
                  </td>
                  <td className="px-4 py-3 text-right">{values.actual.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{values.expected.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={values.error > 0 ? 'text-red-600' : 'text-green-600'}>
                      {values.error > 0 ? '+' : ''}{values.error.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Statistical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">MAPE</p>
              <p className="text-2xl font-bold">{mapePercentage.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Erro Máximo</p>
              <p className="text-2xl font-bold">{(report.overallMetrics.maxError * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Erro Mínimo</p>
              <p className="text-2xl font-bold">{(report.overallMetrics.minError * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recomendações</h2>
          <div className="space-y-4">
            {report.recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium capitalize">{rec.type}</h3>
                  <Badge variant="outline" className="capitalize">
                    {rec.impact}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Valor Atual</p>
                    <p className="font-medium">{rec.currentValue.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Recomendado</p>
                    <p className="font-medium">{rec.recommendedValue.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Inputs */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Inputs do Template</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="text-sm text-gray-600 overflow-x-auto">
            {JSON.stringify(report.inputs, null, 2)}
          </pre>
        </div>
      </Card>
    </div>
  );
}
