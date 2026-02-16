import { useState } from 'react';
import { importarCustosExcel } from '@/domains/precificacao/importarCustosExcel';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

// Exemplo de painel de configuração de precificação
export function PrecificacaoConfigPanel({
  initialMinimos = {},
  initialMargens = {},
  onSave,
}: {
  initialMinimos?: Record<string, number>;
  initialMargens?: Record<string, number>;
  onSave: (minimos: Record<string, number>, margens: Record<string, number>) => void;
}) {
  const [minimos, setMinimos] = useState<Record<string, number>>(initialMinimos);
  const [margens, setMargens] = useState<Record<string, number>>(initialMargens);
  const [produto, setProduto] = useState('');
  const [minimo, setMinimo] = useState(0);
  const [margem, setMargem] = useState(0.15);

  function handleAdd() {
    if (produto) {
      setMinimos((prev) => ({ ...prev, [produto]: minimo }));
      setMargens((prev) => ({ ...prev, [produto]: margem }));
      setProduto('');
      setMinimo(0);
      setMargem(0.15);
    }
  }

  function handleSave() {
    onSave(minimos, margens);
  }

  function handleAtualizarCustos() {
    // Exemplo: importar custos da planilha Excel
    const custos = importarCustosExcel({ filePath: 'data/planilha_preco.xlsx', colCodigo: 'Codigo', colDescricao: 'Descricao', colCusto: 'Custo' });
    // Atualiza margens ou mínimos conforme custos importados
    Object.keys(custos).forEach((codigo) => {
      setMinimos((prev) => ({ ...prev, [codigo]: custos[codigo].custo }));
    });
    // Pode exibir um toast ou alerta de sucesso
    alert('Custos atualizados com sucesso!');
  }

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Configuração de Precificação</h2>
      <div className="flex gap-4">
        <div>
          <Label>Produto/Categoria</Label>
          <Input value={produto} onChange={e => setProduto(e.target.value)} placeholder="Ex: A, B, C" />
        </div>
        <div>
          <Label>Preço Mínimo</Label>
          <Input type="number" value={minimo} onChange={e => setMinimo(Number(e.target.value))} />
        </div>
        <div>
          <Label>Margem (%)</Label>
          <Input type="number" value={margem} onChange={e => setMargem(Number(e.target.value))} step="0.01" min="0" max="1" />
        </div>
        <Button onClick={handleAdd}>Adicionar</Button>
      </div>
      <div>
        <h3 className="font-semibold">Regras Atuais</h3>
        <ul>
          {Object.keys(minimos).map((prod) => (
            <li key={prod} className="flex gap-2 items-center">
              <span>{prod}</span>
              <span>Min: R${minimos[prod]}</span>
              <span>Margem: {margens[prod] * 100}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-4 mt-4">
        <Button onClick={handleAtualizarCustos} variant="outline">Atualizar Custos Reais</Button>
        <Button onClick={handleSave}>Salvar Configuração</Button>
      </div>
    </Card>
  );
}
