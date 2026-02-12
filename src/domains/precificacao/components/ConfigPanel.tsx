import { DEFAULT_SHEET_CATALOG } from "../domains/precificacao/engine/defaultTables";

interface ConfigPanelProps {
  precoKgInox: number;
  setPrecoKgInox: (value: number) => void;
  precoKgTuboPes: number;
  setPrecoKgTuboPes: (value: number) => void;
  precoKgTuboContraventamento: number;
  setPrecoKgTuboContraventamento: (value: number) => void;
  fatorVenda: number;
  setFatorVenda: (value: number) => void;
  sheetMode: "auto" | "manual";
  setSheetMode: (value: "auto" | "manual") => void;
  sheetSelected: string;
  setSheetSelected: (value: string) => void;
  scrapMinPct: number;
  setScrapMinPct: (value: number) => void;
}

export function ConfigPanel({
  precoKgInox,
  setPrecoKgInox,
  precoKgTuboPes,
  setPrecoKgTuboPes,
  precoKgTuboContraventamento,
  setPrecoKgTuboContraventamento,
  fatorVenda,
  setFatorVenda,
  sheetMode,
  setSheetMode,
  sheetSelected,
  setSheetSelected,
  scrapMinPct,
  setScrapMinPct,
}: ConfigPanelProps) {
  // Permite vírgula ou ponto e campo vazio
  const parseInput = (val: string) => {
    if (val.trim() === "") return null;
    const num = Number(val.replace(",", "."));
    return Number.isNaN(num) ? null : num;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Globais</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço/kg Inox (R$)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={precoKgInox === 0 ? "" : precoKgInox ?? ""}
            onChange={(e) => setPrecoKgInox(parseInput(e.target.value) ?? 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço/kg Tubo dos Pés (R$)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={precoKgTuboPes === 0 ? "" : precoKgTuboPes ?? ""}
            onChange={(e) => setPrecoKgTuboPes(parseInput(e.target.value) ?? 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço/kg Tubo Contraventamento (R$)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={precoKgTuboContraventamento === 0 ? "" : precoKgTuboContraventamento ?? ""}
            onChange={(e) => setPrecoKgTuboContraventamento(parseInput(e.target.value) ?? 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fator de Venda (Markup)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={fatorVenda === 0 ? "" : fatorVenda ?? ""}
            onChange={(e) => setFatorVenda(parseInput(e.target.value) ?? 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Modo de custo de chapa agora é automático */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modo de Custo de Chapa
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
            Automático
          </div>
          <p className="mt-1 text-xs text-gray-600">
            O sistema escolhe automaticamente: peças únicas usam "USADA" (kg útil + scrap), lotes grandes usam "COMPRADA" (chapa inteira).
          </p>
        </div>

        {/* Campo de scrap sempre visível, pois modo é automático */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desperdício Mínimo (%)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={scrapMinPct === 0 ? "" : scrapMinPct ?? ""}
            onChange={(e) => setScrapMinPct(parseInput(e.target.value) ?? 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-600">
            Adiciona {scrapMinPct}% sobre o material útil para cobrir cortes, rebarbas e pequenas perdas.
            Recomendado: 10-20% para cuba, 5-10% para tampos grandes.
          </p>
        </div>

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
          <strong>Importante:</strong> O sistema usa margem mínima de 25% para anti-prejuízo.
          O preço sugerido nunca será menor que (custo / 0.75).
        </p>
      </div>
    </div>
  );
}
