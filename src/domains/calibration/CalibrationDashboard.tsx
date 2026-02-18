import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Calendar, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Baseline, CalibrationRun } from './types';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';



export function CalibrationDashboard() {
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [runs, setRuns] = useState<CalibrationRun[]>([]);
  const [stats, setStats] = useState({
    totalBaselines: 0,
    totalRuns: 0,
    avgMape: 0,
    successfulRuns: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Mock data - replace with actual service call
    const mockBaselines: Baseline[] = Array.from({ length: 12 }, (_, i) => ({
      id: `baseline-${i + 1}`,
      templateKey: `template-${(i % 3) + 1}`,
      inputs: { size: `100x${50 + i * 10}` },
      expectedCost: {
        material: 100 + i * 50,
        process: 50 + i * 25,
        overhead: 20 + i * 10,
        margin: 30 + i * 15,
        total: 200 + i * 100,
      },
      expectedMetrics: {
        weldMeters: 10 + i * 2,
        cutMeters: 5 + i,
        finishM2: 2 + i * 0.5,
        bendCount: 3 + i,
      },
      notes: 'Test baseline',
      createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'user@test.com',
    }));

    const mockRuns: CalibrationRun[] = Array.from({ length: 8 }, (_, i) => ({
      id: `run-${i + 1}`,
      companyId: 'test-company',
      baselineId: `baseline-${(i % 12) + 1}`,
      results: [],
      calibrationFactors: [],
      adjustments: [],
      metrics: {
        mape: 0.03 + i * 0.005,
        maxError: 0.1 + i * 0.02,
        minError: -0.05 - i * 0.01,
        errorDistribution: [],
      },
      status: 'completed',
      createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    }));

    setBaselines(mockBaselines);
    setRuns(mockRuns);

    setStats({
      totalBaselines: mockBaselines.length,
      totalRuns: mockRuns.length,
      avgMape: mockRuns.reduce((sum, run) => sum + run.metrics.mape, 0) / mockRuns.length,
      successfulRuns: mockRuns.filter(run => run.status === 'completed').length,
    });
  };

  const handleCreateBaseline = () => {
    // TODO: Navigate to baseline editor
    console.log('Create new baseline');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calibração de Custos</h1>
        <Button onClick={handleCreateBaseline} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Baseline
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Baselines</p>
              <p className="text-2xl font-bold">{stats.totalBaselines}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Runs Realizados</p>
              <p className="text-2xl font-bold">{stats.successfulRuns}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">MAPE Médio</p>
              <p className="text-2xl font-bold">{(stats.avgMape * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Atingiu Alvo</p>
              <p className="text-2xl font-bold">
                {runs.filter(run => run.metrics.mape <= 0.05).length}/{runs.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Baselines List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Baselines Ativas</h2>
        </div>
        
        <div className="space-y-4">
          {baselines.map(baseline => (
            <div key={baseline.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">{baseline.templateKey}</h3>
                <p className="text-sm text-gray-500">
                  Criada em {new Date(baseline.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Ver</Button>
                <Button size="sm">Editar</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Chart */}
       <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-lg font-semibold">Performance das Calibrações</h2>
         </div>
         
         <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={runs.map((run, index) => ({
               run: `Run ${index + 1}`,
               mape: (run.metrics.mape * 100).toFixed(1),
               maxError: (run.metrics.maxError * 100).toFixed(1),
               minError: (run.metrics.minError * 100).toFixed(1)
             }))}>
               <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
               <XAxis dataKey="run" className="text-xs" />
               <YAxis className="text-xs" />
               <Tooltip 
                 contentStyle={{ 
                   backgroundColor: "hsl(var(--card))", 
                   border: "1px solid hsl(var(--border))",
                   borderRadius: "8px"
                 }} 
               />
               <Legend />
               <Line 
                 type="monotone" 
                 dataKey="mape" 
                 stroke="#3b82f6" 
                 strokeWidth={2}
                 name="MAPE (%)"
                 dot={{ r: 3 }}
                 activeDot={{ r: 5 }}
               />
               <Line 
                 type="monotone" 
                 dataKey="maxError" 
                 stroke="#ef4444" 
                 strokeWidth={2}
                 name="Erro Máximo (%)"
                 dot={{ r: 3 }}
                 activeDot={{ r: 5 }}
               />
               <Line 
                 type="monotone" 
                 dataKey="minError" 
                 stroke="#10b981" 
                 strokeWidth={2}
                 name="Erro Mínimo (%)"
                 dot={{ r: 3 }}
                 activeDot={{ r: 5 }}
               />
             </LineChart>
           </ResponsiveContainer>
         </div>
       </Card>
    </div>
  );
}
