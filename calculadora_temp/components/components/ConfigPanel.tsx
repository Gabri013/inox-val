import { DEFAULT_SHEET_CATALOG } from "../../domains/precificacao/engine/defaultTables";

interface ConfigPanelProps {
  precoKgInox: number;
  setPrecoKgInox: (value: number) => void;
  fatorVenda: number;
  setFatorVenda: (value: number) => void;
  sheetMode: "auto" | "manual";
  setSheetMode: (value: "auto" | "manual") => void;
  sheetSelected: string;
  setSheetSelected: (value: string) => void;
  sheetCostMode: "bought" | "used";
  setSheetCostMode: (value: "bought" | "used") => void;
  scrapMinPct: number;
  setScrapMinPct: (value: number) => void;
}

export function ConfigPanel({
  precoKgInox,
  setPrecoKgInox,
  fatorVenda,
  setFatorVenda,
  sheetMode,
  setSheetMode,
  sheetSelected,
  setSheetSelected,
  sheetCostMode,
  setSheetCostMode,
  scrapMinPct,
  setScrapMinPct,
}: ConfigPanelProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Globais</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço/kg Inox (R$)
          </label>
          <input
            type="number"
            value={precoKgInox}
            onChange={(e) => setPrecoKgInox(Number(e.target.value))}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fator de Venda (Markup)
          </label>
          <input
            type="number"
            value={fatorVenda}
            onChange={(e) => setFatorVenda(Number(e.target.value))}
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* NOVO: Modo de Custo de Chapa */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💰 Modo de Custo de Chapa
          </label>
          <select
            value={sheetCostMode}
            onChange={(e) => setSheetCostMode(e.target.value as "bought" | "used")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="used">USADA (kg útil + scrap%) - Sobra vira estoque ✅</option>
            <option value="bought">COMPRADA (chapa inteira) - Sobra vira perda total</option>
          </select>
          <p className="mt-1 text-xs text-gray-600">
            {sheetCostMode === "used" 
              ? "✅ Recomendado para peças únicas: cobra apenas o material usado + desperdício mínimo"
              : "⚠️ Cobra a chapa inteira. Use apenas para lotes ou quando sobra não será reaproveitada"
            }
          </p>
        </div>

        {/* NOVO: Scrap Mínimo (só aparece em modo "used") */}
        {sheetCostMode === "used" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Desperdício Mínimo (%)
            </label>
            <input
              type="number"
              value={scrapMinPct}
              onChange={(e) => setScrapMinPct(Number(e.target.value))}
              min="0"
              max="50"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-600">
              Adiciona {scrapMinPct}% sobre o material útil para cobrir cortes, rebarbas e pequenas perdas.
              Recomendado: 10-20% para cuba, 5-10% para tampos grandes.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modo de Seleção de Chapa
          </label>
          <select
            value={sheetMode}
            onChange={(e) => setSheetMode(e.target.value as "auto" | "manual")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="auto">Automático (menor custo)</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {sheetMode === "manual" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapa Selecionada
            </label>
            <select
              value={sheetSelected}
              onChange={(e) => setSheetSelected(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DEFAULT_SHEET_CATALOG.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Importante:</strong> O sistema usa margem mínima de 25% para anti-prejuízo. 
          O preço sugerido nunca será menor que (custo / 0.75).
        </p>
      </div>
    </div>
  );
}