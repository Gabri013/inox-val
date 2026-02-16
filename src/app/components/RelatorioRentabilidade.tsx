import { Card } from '../ui/card';
import { formatCurrency } from '@/shared/lib/format';

// Relatório de rentabilidade e margem por produto, cliente e período
export function RelatorioRentabilidade({
  dados = [],
}: {
  dados: Array<{
    produto: string;
    cliente: string;
    data: string;
    precoOrcado: number;
    custoReal: number;
    margem: number;
  }>;
}) {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Relatório de Rentabilidade e Margem</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Preço Orçado</th>
            <th>Custo Real</th>
            <th>Margem (%)</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item, idx) => (
            <tr key={idx} className={item.margem < 0.05 ? 'bg-destructive/10' : item.margem > 0.3 ? 'bg-success/10' : ''}>
              <td>{item.produto}</td>
              <td>{item.cliente}</td>
              <td>{item.data}</td>
              <td>{formatCurrency(item.precoOrcado)}</td>
              <td>{formatCurrency(item.custoReal)}</td>
              <td className={item.margem < 0.05 ? 'text-destructive font-bold' : item.margem > 0.3 ? 'text-success font-bold' : ''}>
                {(item.margem * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
