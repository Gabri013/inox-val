import { useMemo, useState } from 'react';
import { compute } from '../engine';
import { precificacaoService } from '@/services/firestore/precificacao.service';
import { useAuth } from '@/contexts/AuthContext';

type OverrideRow = { cell: string; value: string };

const DEFAULT_OVERRIDES: OverrideRow[] = [{ cell: '', value: '' }];

export default function PrecificacaoPage() {
  const { user, profile } = useAuth();
  const [sheetName, setSheetName] = useState('PLANILHA DE PRECO - INOX(Recuperado Automaticamente)');
  const [overrides, setOverrides] = useState<OverrideRow[]>(DEFAULT_OVERRIDES);
  const [result, setResult] = useState<any>(null);

  const overrideMap = useMemo(() => {
    const out: Record<string, string | number | boolean | null> = {};
    overrides.forEach((row) => {
      if (!row.cell) return;
      const trimmed = row.value.trim();
      if (trimmed === '') {
        out[row.cell] = null;
        return;
      }
      const numeric = Number(trimmed);
      out[row.cell] = Number.isFinite(numeric) ? numeric : trimmed;
    });
    return out;
  }, [overrides]);

  const handleCompute = async () => {
    const computed = compute(sheetName, overrideMap);
    setResult(computed);
    if (user?.uid && profile?.empresaId) {
      await precificacaoService.create({
        sheetName,
        overrides: overrideMap,
        outputs: computed.outputs,
      } as any);
    }
  };

  const addRow = () => setOverrides((prev) => [...prev, { cell: '', value: '' }]);

  const updateRow = (index: number, key: keyof OverrideRow, value: string) => {
    setOverrides((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Precificacao</h1>
        <p className="text-sm text-muted-foreground">Simulador basico da planilha embutida.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Planilha</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Nome da aba"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex items-end gap-2">
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={handleCompute}
          >
            Calcular
          </button>
          <button
            className="rounded-md border px-4 py-2 text-sm font-medium"
            onClick={addRow}
          >
            Adicionar override
          </button>
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-sm font-semibold">Overrides</h2>
        <div className="mt-3 space-y-2">
          {overrides.map((row, index) => (
            <div key={index} className="grid grid-cols-2 gap-2">
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Celula (ex: A1)"
                value={row.cell}
                onChange={(e) => updateRow(index, 'cell', e.target.value.toUpperCase())}
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="Valor"
                value={row.value}
                onChange={(e) => updateRow(index, 'value', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className="rounded-md border p-4">
          <h2 className="text-sm font-semibold">Resultado</h2>
          <pre className="mt-2 max-h-[400px] overflow-auto rounded bg-muted p-3 text-xs">
            {JSON.stringify(result.outputs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
