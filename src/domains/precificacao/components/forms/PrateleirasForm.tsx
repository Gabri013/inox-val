import { useEffect, useState } from "react";
import { FormField } from "./FormField";

interface PrateleirasFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

type LocalConfig = {
  precoKg: number;
  markup: number;
  overheadPercent: number;
  minMarginPct: number;
};

export function PrateleirasForm({ formData, setFormData }: PrateleirasFormProps) {
    // Configuração industrial local
    const configDefaults = {
      precoKg: 45,
      markup: 3,
      overheadPercent: 0,
      minMarginPct: 0.25,
    };
    const [config, setConfig] = useState<LocalConfig>(() => ({
      precoKg: formData.precoKg ?? configDefaults.precoKg,
      markup: formData.markup ?? configDefaults.markup,
      overheadPercent: formData.overheadPercent ?? configDefaults.overheadPercent,
      minMarginPct: formData.minMarginPct ?? configDefaults.minMarginPct,
    }));
    useEffect(() => {
      setFormData({ ...formData, ...config });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config]);
    const parseInput = (val: string) => {
      if (val.trim() === "") return null;
      const num = Number(val.replace(",", "."));
      return Number.isNaN(num) ? null : num;
    };
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Configuração de Preços e Markup */}
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Configuração de Preços e Markup</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label="Preço/kg (R$)" required>
            <input
              type="text"
              inputMode="decimal"
              value={config.precoKg === 0 ? "" : config.precoKg ?? ""}
              onChange={(e) => setConfig((c) => ({ ...c, precoKg: parseInput(e.target.value) ?? 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Markup" required>
            <input
              type="text"
              inputMode="decimal"
              value={config.markup === 0 ? "" : config.markup ?? ""}
              onChange={(e) => setConfig((c) => ({ ...c, markup: parseInput(e.target.value) ?? 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Overhead (%)">
            <input
              type="text"
              inputMode="decimal"
              value={config.overheadPercent === 0 ? "" : config.overheadPercent ?? ""}
              onChange={(e) => setConfig((c) => ({ ...c, overheadPercent: parseInput(e.target.value) ?? 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Margem Mínima (%)">
            <input
              type="text"
              inputMode="decimal"
              value={config.minMarginPct === 0 ? "" : config.minMarginPct ?? ""}
              onChange={(e) => setConfig((c) => ({ ...c, minMarginPct: parseInput(e.target.value) ?? 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        </div>
        <div className="text-xs text-gray-600 mt-2">Esses valores são usados apenas neste orçamento.</div>
      </div>
      <FormField label="Tipo" required>
        <select
          value={formData.tipo || "lisa"}
          onChange={(e) => update("tipo", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="lisa">Lisa</option>
          <option value="gradeada">Gradeada</option>
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Comprimento (mm)" required>
          <input
            type="number"
            value={formData.comprimento || ""}
            onChange={(e) => update("comprimento", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <FormField label="Profundidade (mm)" required>
          <input
            type="number"
            value={formData.profundidade || ""}
            onChange={(e) => update("profundidade", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <FormField label="Espessura Chapa (mm)" required>
          <input
            type="number"
            value={formData.espessuraChapa || ""}
            onChange={(e) => update("espessuraChapa", Number(e.target.value))}
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </FormField>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.bordaDobrada || false}
            onChange={(e) => update("bordaDobrada", e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Borda Dobrada</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.usarMaoFrancesa || false}
            onChange={(e) => update("usarMaoFrancesa", e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Usar Mão Francesa</span>
        </label>
      </div>
    </div>
  );
}

