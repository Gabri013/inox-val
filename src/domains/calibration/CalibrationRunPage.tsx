import { useState, useEffect } from 'react';
import { Target, BarChart3, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { CalibrationRun, CalibrationRecommendation } from './types';

import { validateCalibrationTarget } from './calibration.engine';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CalibrationRunPageProps {
  runId: string;
}

export function CalibrationRunPage({ runId }: CalibrationRunPageProps) {
  const [run, setRun] = useState<CalibrationRun | null>(null);
  const [recommendations, setRecommendations] = useState<CalibrationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRunData();
  }, [runId]);

  const loadRunData = async () => {
    // Mock data - replace with actual service call
    const mockRun: CalibrationRun = {
      id: runId,
      companyId: 'test-company',
      baselineId: 'baseline-1',
      results: Array.from({ length: 15 }, (_, i) => ({
        partId: `part-${i + 1}`,
        actualCost: 100 + i * 20 + Math.random() * 50,
        expectedCost: 110 + i * 20,
        error: -10 + Math.random() * 20,
        errorPercent: -0.1 + Math.random() * 0.2,
      })),
      calibrationFactors: [
        {
          id: 'factor-1',
          type: 'global',
          factors: { material: 1.02, weld: 0.98, cut: 0.98, finish: 0.98, assembly: 0.98 },
          description: 'Ajuste global de custos',
          effectiveFrom: new Date().toISOString(),
          active: true,
        },
      ],
      adjustments: [],
      metrics: {
        mape: 0.045,
        maxError: 0.12,
        minError: -0.08,
        errorDistribution: Array.from({ length: 10 }, () => -0.1 + Math.random() * 0.2),
      },
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date().toISOString(),
    };

    setRun(mockRun);
    setRecommendations([
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
    ]);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!run) {
    return <div>Run not found</div>;
  }

  const mapePercentage = run.metrics.mape * 100;
  const isTargetMet = validateCalibrationTarget(run.metrics.mape);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Run de Calibração</h1>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">Status</h2>
            <p className="text-sm text-gray-500 mt-1">
              Criado em: {new Date(run.createdAt).toLocaleString()}
            </p>
            {run.completedAt && (
              <p className="text-sm text-gray-500">
                Concluído em: {new Date(run.completedAt).toLocaleString()}
              </p>
            )}
          </div>
          <Badge 
            className={run.status === 'completed' ? 'bg-green-100 text-green-800' : 
                     run.status === 'running' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}
          >
            {run.status}
          </Badge>
        </div>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">MAPE</p>
              <p className="text-2xl font-bold">{mapePercentage.toFixed(1)}%</p>
              <div className="mt-2">
                <Progress 
                  value={mapePercentage * 2} 
                  className={isTargetMet ? 'bg-green-200' : 'bg-red-200'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isTargetMet ? '✓ Alvo alcançado (<= 5%)' : '✗ Alvo não alcançado'}
                </p>
              </div>
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
              <p className="text-2xl font-bold">{(run.metrics.maxError * 100).toFixed(1)}%</p>
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
              <p className="text-2xl font-bold">{(run.metrics.minError * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Resultados Detalhados</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-right">Actual</th>
                <th className="px-4 py-2 text-right">Expected</th>
                <th className="px-4 py-2 text-right">Erro (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {run.results.map((result) => (
                <tr key={result.partId} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{result.partId}</td>
                  <td className="px-4 py-2 text-right">
                    R$ {result.actualCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    R$ {result.expectedCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={
                      result.errorPercent > 0.05 ? 'text-red-600' :
                      result.errorPercent < -0.05 ? 'text-green-600' : 'text-gray-600'
                    }>
                      {result.errorPercent > 0 ? '+' : ''}{(result.errorPercent * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recomendações de Ajuste</h2>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{rec.type}</h3>
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
                <div className="mt-3 flex gap-2">
                  <Button size="sm">Aplicar</Button>
                  <Button variant="outline" size="sm">Ignorar</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error Distribution */}
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-lg font-semibold mb-4">Distribuição de Erros</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={run.results.map((result, index) => ({
              item: `Item ${index + 1}`,
              error: (result.errorPercent * 100).toFixed(1)
            }))}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="item" 
                className="text-xs" 
                angle={-45} 
                textAnchor="end"
                height={80}
              />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Bar 
                dataKey="error" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
