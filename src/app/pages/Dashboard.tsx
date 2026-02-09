import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Factory,
  AlertTriangle,
  Clock,
  ArrowRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useNavigate } from "react-router-dom";

import { useDashboardMetrics } from "../hooks/useDashboardMetrics";

export default function Dashboard() {
  const navigate = useNavigate();
  const metrics = useDashboardMetrics();
  const { ordensProducaoList, ordensConcluidasList, materiaisCriticos, loading, error } = metrics;

  // BarChart: Produção e Faturamento dos últimos 6 meses
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d;
  });
  const salesData = months.map((d) => {
    // Faturamento e produção por mês
    const faturamento = metrics.ordensConcluidasList
      .filter((op: any) => {
        const data = op.dataConclusao ? new Date(op.dataConclusao) : op.dataAbertura ? new Date(op.dataAbertura) : null;
        return data && data.getMonth() === d.getMonth() && data.getFullYear() === d.getFullYear();
      })
      .reduce((acc: number, op: any) => acc + (op.total ?? 0), 0);
    const producao = metrics.ordensConcluidasList
      .filter((op: any) => {
        const data = op.dataConclusao ? new Date(op.dataConclusao) : op.dataAbertura ? new Date(op.dataAbertura) : null;
        return data && data.getMonth() === d.getMonth() && data.getFullYear() === d.getFullYear();
      }).length;
    return {
      month: d.toLocaleString("pt-BR", { month: "short" }),
      vendas: faturamento,
      producao,
    };
  });

  // PieChart: Categorias de Produtos
  // Exemplo: Agrupar materiaisCriticos por tipo
  const categoryMap: Record<string, number> = {};
  materiaisCriticos.forEach((mat: any) => {
    categoryMap[mat.tipo ?? "Outros"] = (categoryMap[mat.tipo ?? "Outros"] || 0) + 1;
  });
  const totalCat = Object.values(categoryMap).reduce((a, b) => a + b, 0);
  const colors = ["#3b82f6", "#10b981", "#f59e42", "#a78bfa", "#ef4444", "#6366f1", "#fbbf24"];
  const productCategories = Object.entries(categoryMap).map(([name, value], i) => ({
    name,
    value: totalCat ? Math.round((value / totalCat) * 100) : 0,
    color: colors[i % colors.length],
  }));

  if (loading) return <div className="p-8 text-center text-lg">Carregando métricas...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Erro: {error}</div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metrics.receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="size-3 text-green-500" />
              <span className={metrics.receitaVaria !== null && metrics.receitaVaria >= 0 ? "text-green-500" : "text-red-500"}>
                {metrics.receitaVaria !== null ? `${metrics.receitaVaria.toFixed(1)}%` : "sem dados"}
              </span> em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens em Aberto</CardTitle>
            <Factory className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ordensEmAberto}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.ordensEmProducao} em produção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais Críticos</CardTitle>
            <AlertTriangle className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.materiaisCriticos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.materiaisCriticos.length > 0 ? "Necessitam reposição urgente" : "Nenhum material crítico"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Pendentes</CardTitle>
            <ShoppingCart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.comprasPendentes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.comprasPendentes > 0 ? "Aguardando aprovação" : "Nenhuma compra pendente"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {materiaisCriticos.some(m => m.urgencia === "critica") && (
        <Card className="border-danger/50 bg-danger/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="size-5" />
              Alertas Críticos de Estoque
            </CardTitle>
            <CardDescription>Materiais esgotados que impedem a produção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {materiaisCriticos
                .filter(m => m.urgencia === "critica")
                .map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="size-5 text-danger" />
                      <div>
                        <p className="font-medium">{material.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {material.atual} / {material.minimo} unidades
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => navigate("/compras")}>
                      Solicitar Compra
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ordens em Aberto */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ordens em Produção</CardTitle>
                <CardDescription>Acompanhamento em tempo real</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/ordens")}> 
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ordensProducaoList.length === 0 ? (
              <div className="text-muted-foreground">Nenhuma ordem em produção</div>
            ) : (
              ordensProducaoList.map((op: any) => (
                <div key={op.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium font-mono text-sm">{op.numero}</p>
                      <p className="text-xs text-muted-foreground">{op.clienteNome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{op.progresso ?? 0}%</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {op.dataPrevisao ? new Date(op.dataPrevisao).toLocaleDateString("pt-BR") : "-"}
                      </p>
                    </div>
                  </div>
                  <Progress value={op.progresso ?? 0} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Materiais Abaixo do Mínimo</CardTitle>
                <CardDescription>Necessitam reposição</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/estoque")}> 
                Ver Estoque
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {materiaisCriticos.length === 0 ? (
              <div className="text-muted-foreground">Nenhum material abaixo do mínimo</div>
            ) : (
              materiaisCriticos.map((material: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {material.urgencia === "critica" && (
                        <AlertTriangle className="size-4 text-red-600" />
                      )}
                      {material.urgencia === "alta" && (
                        <AlertTriangle className="size-4 text-yellow-600" />
                      )}
                      <span className="font-medium text-sm">{material.nome}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {material.saldoDisponivel} / {material.minimo} un
                    </span>
                  </div>
                  <Progress 
                    value={material.saldoDisponivel && material.minimo ? Math.round((material.saldoDisponivel / material.minimo) * 100) : 0} 
                    className={`h-2 ${
                      material.urgencia === "critica" ? "[&>div]:bg-red-600" :
                      material.urgencia === "alta" ? "[&>div]:bg-yellow-600" :
                      "[&>div]:bg-blue-600"
                    }`}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Produção e Faturamento</CardTitle>
            <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="vendas" 
                  fill="hsl(var(--primary))" 
                  name="Faturamento (R$)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="producao" 
                  fill="#10b981" 
                  name="Ordens Produzidas"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Categorias de Produtos</CardTitle>
            <CardDescription>Distribuição por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate("/orcamentos")}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ArrowRight className="size-4 text-primary" />
                </div>
                <span className="font-semibold">Novo Orçamento</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Criar proposta comercial
              </p>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate("/ordens")}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Factory className="size-4 text-blue-600" />
                </div>
                <span className="font-semibold">Nova Ordem</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Criar ordem de produção
              </p>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate("/compras")}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <ShoppingCart className="size-4 text-green-600" />
                </div>
                <span className="font-semibold">Solicitar Compra</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Requisitar materiais
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





