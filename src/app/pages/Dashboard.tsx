import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Weight,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const kpis = [
  {
    label: 'Total de Orçamentos',
    value: '847',
    change: '+12.5%',
    trend: 'up',
    icon: Package,
    miniData: [40, 45, 42, 50, 48, 55, 52],
  },
  {
    label: 'Produção Ativa',
    value: '23',
    change: '+8.3%',
    trend: 'up',
    icon: TrendingUp,
    miniData: [30, 32, 35, 33, 38, 40, 42],
  },
  {
    label: 'Receita Estimada',
    value: 'R$ 2.4M',
    change: '+15.8%',
    trend: 'up',
    icon: DollarSign,
    miniData: [50, 52, 48, 55, 60, 58, 65],
  },
  {
    label: 'Peso Total Calculado',
    value: '14.2t',
    change: '-3.2%',
    trend: 'down',
    icon: Weight,
    miniData: [60, 58, 62, 59, 57, 55, 54],
  },
];

const recentCalculations = [
  {
    id: 'CALC-2847',
    client: 'Petrobras S.A.',
    steelType: 'Inox 316L',
    thickness: '3.0mm',
    dimensions: '2000 x 1000',
    weight: '47.1 kg',
    total: 'R$ 12.847,00',
    status: 'approved',
  },
  {
    id: 'CALC-2846',
    client: 'Vale Mineração',
    steelType: 'Inox 304',
    thickness: '2.5mm',
    dimensions: '1500 x 800',
    weight: '23.5 kg',
    total: 'R$ 6.345,00',
    status: 'pending',
  },
  {
    id: 'CALC-2845',
    client: 'Embraer',
    steelType: 'Inox 430',
    thickness: '4.0mm',
    dimensions: '2500 x 1200',
    weight: '94.2 kg',
    total: 'R$ 18.923,00',
    status: 'production',
  },
  {
    id: 'CALC-2844',
    client: 'Usiminas',
    steelType: 'Inox 316L',
    thickness: '2.0mm',
    dimensions: '1000 x 600',
    weight: '9.4 kg',
    total: 'R$ 2.564,00',
    status: 'approved',
  },
  {
    id: 'CALC-2843',
    client: 'Braskem',
    steelType: 'Inox 304',
    thickness: '3.5mm',
    dimensions: '1800 x 900',
    weight: '44.6 kg',
    total: 'R$ 9.876,00',
    status: 'pending',
  },
];

const chartData = [
  { month: 'Jan', value: 2100 },
  { month: 'Fev', value: 2350 },
  { month: 'Mar', value: 2200 },
  { month: 'Abr', value: 2680 },
  { month: 'Mai', value: 2890 },
  { month: 'Jun', value: 2400 },
];

const statusConfig = {
  approved: { label: 'Aprovado', color: '#00C853', bgColor: 'rgba(0, 200, 67, 0.15)' },
  pending: { label: 'Pendente', color: '#F9A825', bgColor: 'rgba(249, 168, 37, 0.15)' },
  production: { label: 'Produção', color: '#2962FF', bgColor: 'rgba(41, 98, 255, 0.15)' },
};

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: '#E6EDF7' }}>Dashboard</h1>
          <p className="text-lg mt-1" style={{ color: '#A9B4C6' }}>
            Visão geral do sistema de cálculo e gestão industrial
          </p>
        </div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="h-12 px-6 rounded-lg font-semibold flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
              boxShadow: '0 0 20px rgba(41, 98, 255, 0.35)',
              color: 'white',
            }}
          >
            <Plus className="w-5 h-5" />
            Novo Cálculo
          </Button>
        </motion.div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="rounded-xl border overflow-hidden group hover:border-opacity-30 transition-all"
              style={{
                background: '#1A2233',
                borderColor: '#2A3448',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm mb-2" style={{ color: '#A9B4C6' }}>{kpi.label}</p>
                    <h3 className="text-4xl font-bold" style={{ color: '#E6EDF7' }}>{kpi.value}</h3>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
                      boxShadow: '0 5px 15px rgba(41, 98, 255, 0.3)',
                    }}
                  >
                    <kpi.icon className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" style={{ color: '#00C853' }} />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" style={{ color: '#D32F2F' }} />
                    )}
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: kpi.trend === 'up' ? '#00C853' : '#D32F2F' }}
                    >
                      {kpi.change}
                    </span>
                  </div>
                  
                  {/* Mini Chart */}
                  <div className="w-24 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpi.miniData.map((v, i) => ({ value: v }))}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2962FF" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2"
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
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1" style={{ color: '#E6EDF7' }}>
                  Receita Mensal
                </h3>
                <p className="text-sm" style={{ color: '#A9B4C6' }}>
                  Evolução dos últimos 6 meses
                </p>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2962FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2962FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3448" strokeOpacity={0.3} />
                  <XAxis dataKey="month" stroke="#A9B4C6" fontSize={12} />
                  <YAxis stroke="#A9B4C6" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#121826', 
                      border: '1px solid #2A3448',
                      borderRadius: '10px',
                      color: '#E6EDF7',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2962FF" 
                    strokeWidth={3}
                    fill="url(#colorValue)"
                    dot={{ fill: '#2962FF', r: 5, strokeWidth: 2, stroke: '#1A2233' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
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
                Distribuição
              </h3>

              <div className="space-y-4">
                {[
                  { label: 'Inox 304', value: 45, color: '#2962FF' },
                  { label: 'Inox 316L', value: 30, color: '#00C8FF' },
                  { label: 'Inox 430', value: 25, color: '#FF6D00' },
                ].map((item, idx) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: '#E6EDF7' }}>
                        {item.label}
                      </span>
                      <span className="text-sm font-bold" style={{ color: '#E6EDF7' }}>
                        {item.value}%
                      </span>
                    </div>
                    <div 
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: '#121826' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ delay: 0.6 + idx * 0.1, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1" style={{ color: '#E6EDF7' }}>
                  Cálculos Recentes
                </h3>
                <p className="text-sm" style={{ color: '#A9B4C6' }}>
                  Últimos pedidos processados no sistema
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="rounded-lg border"
                style={{
                  borderColor: '#2A3448',
                  color: '#A9B4C6',
                }}
              >
                Ver Todos
              </Button>
            </div>

            <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#2A3448' }}>
              <table className="w-full">
                <thead style={{ background: '#121826' }}>
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A9B4C6' }}>ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A9B4C6' }}>Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A9B4C6' }}>Tipo de Aço</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A9B4C6' }}>Espessura</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A9B4C6' }}>Dimensões</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A9B4C6' }}>Peso</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A9B4C6' }}>Valor Total</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A9B4C6' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalculations.map((calc, idx) => (
                    <motion.tr
                      key={calc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.05 }}
                      className="border-t transition-all"
                      style={{ borderColor: '#2A3448' }}
                      whileHover={{ background: 'rgba(41, 98, 255, 0.05)' }}
                    >
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono" style={{ color: '#00C8FF' }}>{calc.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium" style={{ color: '#E6EDF7' }}>{calc.client}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm" style={{ color: '#A9B4C6' }}>{calc.steelType}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm" style={{ color: '#A9B4C6' }}>{calc.thickness}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono" style={{ color: '#A9B4C6' }}>{calc.dimensions}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold" style={{ color: '#E6EDF7' }}>{calc.weight}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold" style={{ color: '#E6EDF7' }}>{calc.total}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge 
                          className="rounded-md font-medium text-xs border"
                          style={{
                            background: statusConfig[calc.status as keyof typeof statusConfig].bgColor,
                            color: statusConfig[calc.status as keyof typeof statusConfig].color,
                            borderColor: statusConfig[calc.status as keyof typeof statusConfig].color,
                          }}
                        >
                          {statusConfig[calc.status as keyof typeof statusConfig].label}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
