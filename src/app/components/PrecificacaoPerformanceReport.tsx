import { Card } from '../ui/card';
import { formatCurrency } from '@/shared/lib/format';

// Exemplo de relatório de performance de precificação
export function PrecificacaoPerformanceReport({
  historico = [],
}: {
  historico: Array<{
    produto: string;
    precoOrcado: number;
    precoMinimo: number;
    margem: number;
    data: string;
    resultado: 'acima' | 'abaixo';
  }>;
}) {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Relatório de Performance de Precificação</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Preço Orçado</th>
            <th>Preço Mínimo</th>
            <th>Margem (%)</th>
            <th>Data</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {historico.map((item, idx) => (
            <tr key={idx} className={item.resultado === 'abaixo' ? 'bg-destructive/10' : ''}>
              <td>{item.produto}</td>
              <td>{formatCurrency(item.precoOrcado)}</td>
              <td>{formatCurrency(item.precoMinimo)}</td>
              <td>{(item.margem * 100).toFixed(2)}%</td>
              <td>{item.data}</td>
              <td className={item.resultado === 'abaixo' ? 'text-destructive font-bold' : 'text-success font-bold'}>
                {item.resultado === 'abaixo' ? 'Abaixo do mínimo' : 'OK'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
