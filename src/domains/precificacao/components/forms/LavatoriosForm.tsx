import { useEffect, useMemo, useState } from "react";
import { FormField } from "./FormField";
import type { ProdutoFormDefaults } from "../../config/pricingConfig";

interface LavatoriosFormProps {
  formData: any;
  setFormData: (data: any) => void;
  defaults?: ProdutoFormDefaults;
}

export function LavatoriosForm({ formData, setFormData, defaults }: LavatoriosFormProps) {
    // Configuração industrial local
    const configDefaults = {
      precoKg: 45,
      markup: 3,
      overheadPercent: 0,
      minMarginPct: 0.25,
    };
    const resolvedDefaults = useMemo(
      () => ({
        ...configDefaults,
        ...(defaults || {}),
      }),
      [defaults]
    );
    const [config, setConfig] = useState(() => ({
      precoKg: formData.precoKg ?? resolvedDefaults.precoKg,
      markup: formData.markup ?? resolvedDefaults.markup,
      overheadPercent: formData.overheadPercent ?? resolvedDefaults.overheadPercent,
      minMarginPct: formData.minMarginPct ?? resolvedDefaults.minMarginPct,
    }));
    useEffect(() => {
      setConfig((prev) => ({
        ...prev,
        precoKg: formData.precoKg ?? prev.precoKg ?? resolvedDefaults.precoKg,
        markup: formData.markup ?? prev.markup ?? resolvedDefaults.markup,
        overheadPercent: formData.overheadPercent ?? prev.overheadPercent ?? resolvedDefaults.overheadPercent,
        minMarginPct: formData.minMarginPct ?? prev.minMarginPct ?? resolvedDefaults.minMarginPct,
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedDefaults]);
    useEffect(() => {
      setFormData({ ...formData, ...config });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config]);
    const parseInput = (val: string) => {
      if (val === "") return "";
      const num = Number(val.replace(",", "."));
      return isNaN(num) ? "" : num;
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
              onChange={e => setConfig(c => ({ ...c, precoKg: parseInput(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Markup" required>
            <input
              type="text"
              inputMode="decimal"
              value={config.markup === 0 ? "" : config.markup ?? ""}
              onChange={e => setConfig(c => ({ ...c, markup: parseInput(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Overhead (%)">
            <input
              type="text"
              inputMode="decimal"
              value={config.overheadPercent === 0 ? "" : config.overheadPercent ?? ""}
              onChange={e => setConfig(c => ({ ...c, overheadPercent: parseInput(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Margem Mínima (%)">
            <input
              type="text"
              inputMode="decimal"
              value={config.minMarginPct === 0 ? "" : config.minMarginPct ?? ""}
              onChange={e => setConfig(c => ({ ...c, minMarginPct: parseInput(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        </div>
        <div className="text-xs text-gray-600 mt-2">Esses valores são usados apenas neste orçamento.</div>
      </div>
      <FormField label="Tipo" required>
        <select
          value={formData.tipo || "lavatorioPadrao"}
          onChange={(e) => update("tipo", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="lavatorioPadrao">Lavatório Padrão</option>
          <option value="lavatorioCirurgico">Lavatório Cirúrgico</option>
        </select>
      </FormField>

      {formData.tipo === "lavatorioPadrao" ? (
        <FormField label="Modelo" required>
          <select
            value={formData.modeloPadrao || "750"}
            onChange={(e) => update("modeloPadrao", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="750">750 (750×500mm)</option>
            <option value="850">850 (850×500mm)</option>
            <option value="FDE">FDE (850×550mm)</option>
          </select>
        </FormField>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Comprimento (mm)" required>
            <input
              type="number"
              value={formData.comprimento || ""}
              onChange={(e) => update("comprimento", Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Largura (mm)" required>
            <input
              type="number"
              value={formData.largura || ""}
              onChange={(e) => update("largura", Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Acessórios Hidráulicos</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "valvula", label: "Válvula" },
            { key: "mangueiras", label: "Mangueiras" },
            { key: "joelho", label: "Joelho" },
            { key: "pedal", label: "Pedal" },
            { key: "bicaAlta", label: "Bica Alta" },
            { key: "bicaBaixa", label: "Bica Baixa" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData[item.key] || false}
                onChange={(e) => update(item.key, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
