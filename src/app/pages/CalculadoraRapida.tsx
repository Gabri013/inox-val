import { useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/app/components/ui/button';
import { FormularioEntrada } from '@/domains/calculadora/components/FormularioEntrada';
import { CalculadoraEngine } from '@/domains/calculadora/engine';
import type { EntradaCalculadora, ResultadoCalculadora } from '@/domains/calculadora/types';
import { ResultadoCalculadoraView } from '@/domains/calculadora/components/ResultadoCalculadora';

export default function CalculadoraRapida() {
  const [resultado, setResultado] = useState<ResultadoCalculadora | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleCalcular = (entrada: EntradaCalculadora) => {
    setCarregando(true);
    try {
      const out = CalculadoraEngine.calcular(entrada);
      setResultado(out);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Calculadora Rápida"
        description="Selecione um modelo, informe dimensões e gere BOM + nesting + preço"
        icon={Calculator}
        actions={
          resultado ? (
            <Button variant="outline" onClick={() => setResultado(null)}>
              <RotateCcw className="size-4" />
              Novo cálculo
            </Button>
          ) : null
        }
      />

      <div className="mt-6 max-w-6xl space-y-6">
        {!resultado ? (
          <FormularioEntrada onCalcular={handleCalcular} carregando={carregando} />
        ) : (
          <ResultadoCalculadoraView
            resultado={resultado}
            onNovo={() => setResultado(null)}
            salvarLabel="Salvar (em breve)"
          />
        )}
      </div>
    </div>
  );
}

