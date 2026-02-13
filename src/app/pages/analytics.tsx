import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const monthlyData = [
  { month: 'Jan', producao: 145, orcamentos: 189, receita: 2100 },
  { month: 'Fev', producao: 132, orcamentos: 165, receita: 2350 },
  { month: 'Mar', producao: 168, orcamentos: 201, receita: 2200 },
  { month: 'Abr', producao: 189, orcamentos: 234, receita: 2680 },
  { month: 'Mai', producao: 205, orcamentos: 256, receita: 2890 },
  { month: 'Jun', producao: 221, orcamentos: 278, receita: 2400 },
];

const steelTypeData = [
  { type: '304', quantidade: 450 },
  { type: '316L', quantidade: 380 },
  { type: '430', quantidade: 290 },
];

export function Analytics() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
              boxShadow: '0 0 20px rgba(41, 98, 255, 0.35)',
            }}
          >
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 style={{ color: '#E6EDF7' }}>Relatórios</h1>
            <p className="text-lg mt-1" style={{ color: '#A9B4C6' }}>
              Análise detalhada de produção e desempenho
            </p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="h-12 px-6 rounded-lg font-semibold flex items-center gap-2 border"
            style={{
              background: '#121826',
              borderColor: '#2A3448',
              color: '#E6EDF7',
            }}
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </Button>
        </motion.div>
      </div>

      {/* KPIs Summary */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Crescimento Médio', value: '+12.8%', icon: TrendingUp },
          { label: 'Total Processado', value: '847 pedidos' },
          { label: 'Receita Acumulada', value: 'R$ 14.6M' },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="rounded-xl border"
              style={{
                background: '#1A2233',
                borderColor: '#2A3448',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              }}
            >
              <CardContent className="p-6">
                <p className="text-sm mb-2" style={{ color: '#A9B4C6' }}>{kpi.label}</p>
                <h3 className="text-3xl font-bold" style={{ color: '#E6EDF7' }}>{kpi.value}</h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Production Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card 
            className="rounded-xl border"
            style={{
              background: '#1A2233',
              borderColor: '#2A3448',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#E6EDF7' }}>
                Evolução Mensal
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3448" strokeOpacity={0.3} />
                  <XAxis dataKey="month" stroke="#A9B4C6" fontSize={12} />
                  <YAxis stroke="#A9B4C6" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#121826', 
                      border: '1px solid #2A3448',
                      borderRadius: '10px',
                      color: '#E6EDF7'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="producao" 
                    stroke="#2962FF" 
                    strokeWidth={3}
                    dot={{ fill: '#2962FF', r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orcamentos" 
                    stroke="#00C8FF" 
                    strokeWidth={3}
                    dot={{ fill: '#00C8FF', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Steel Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card 
            className="rounded-xl border"
            style={{
              background: '#1A2233',
              borderColor: '#2A3448',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#E6EDF7' }}>
                Distribuição por Tipo de Aço
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={steelTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3448" strokeOpacity={0.3} />
                  <XAxis dataKey="type" stroke="#A9B4C6" fontSize={12} />
                  <YAxis stroke="#A9B4C6" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#121826', 
                      border: '1px solid #2A3448',
                      borderRadius: '10px',
                      color: '#E6EDF7'
                    }} 
                  />
                  <Bar 
                    dataKey="quantidade" 
                    fill="#2962FF" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
