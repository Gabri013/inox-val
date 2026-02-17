import { DollarSign, Package, TrendingUp, AlertTriangle } from "lucide-react";
import type { QuoteResultV2 } from "../../domains/precificacao/engine/quoteV2";

interface QuoteResultsProps {
  quote: QuoteResultV2;
}

export function QuoteResults({ quote }: QuoteResultsProps) {
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-green-600" />
        Resultado do Orçamento
      </h2>

      {/* Preço Final */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Preço Sugerido</p>
            <p className="text-4xl font-bold text-green-700">{formatMoney(quote.costs.priceSuggested)}</p>
          </div>
          <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
        </div>
        <div className="mt-4 pt-4 border-t border-green-200">
          <p className="text-sm text-gray-600">
            Preço Mínimo Seguro: <span className="font-semibold text-gray-900">{formatMoney(quote.costs.priceMinSafe)}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Custo Base: <span className="font-semibold text-gray-900">{formatMoney(quote.costs.costBase)}</span>
          </p>
        </div>
      </div>

      {/* Detalhamento de Custos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Detalhamento de Custos
        </h3>
        <div className="space-y-2">
          <CostRow label="Chapas" value={quote.costs.sheet} />
          <CostRow label="Tubos" value={quote.costs.tubes} />
          <CostRow label="Cantoneiras" value={quote.costs.angles} />
          <CostRow label="Acessórios" value={quote.costs.accessories} />
          <CostRow label="Processos" value={quote.costs.processes} />
          <CostRow label="Overhead" value={quote.costs.overhead} />
        </div>
      </div>

      {/* Nesting Details */}
      {quote.nestingByGroup.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Nesting de Chapas</h3>
          <div className="space-y-3">
            {quote.nestingByGroup.map((group, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {group.groupKey.split("|")[0]} - {group.groupKey.split("|")[1]}mm
                  </span>
                  <span className="text-sm text-gray-600">{group.nesting.sheet.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Chapas usadas:</span>{" "}
                    <span className="font-semibold">{group.nesting.sheetsUsed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Eficiência:</span>{" "}
                    <span className="font-semibold">{formatPercent(group.nesting.efficiency)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Área útil:</span>{" "}
                    <span className="font-semibold">{group.nesting.areaUsedM2.toFixed(2)} m²</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Desperdício:</span>{" "}
                    <span className="font-semibold">{formatPercent(group.nesting.waste)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Kg comprado:</span>{" "}
                    <span className="font-semibold">{group.kgBought} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {quote.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Avisos
          </h3>
          <ul className="space-y-1">
            {quote.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-yellow-700">• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  if (value === 0) return null;

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{formatMoney(value)}</span>
    </div>
  );
}
