import { useEffect, useMemo, useState } from "react";
import { FormField } from "./FormField";
import type { ProdutoFormDefaults } from "../../config/pricingConfig";

interface BancadasFormProps {
  formData: any;
  setFormData: (data: any) => void;
  defaults?: ProdutoFormDefaults;
}


export function BancadasForm({ formData, setFormData, defaults }: BancadasFormProps) {
    // Garante que campos padrão industriais sempre estão presentes no formData
    useEffect(() => {
      const patch: any = {};
      if (formData.quantidadePes === undefined || formData.quantidadePes === null) patch.quantidadePes = 4;
      if (formData.alturaPes === undefined) patch.alturaPes = 900;
      if (formData.espessuraChapa === undefined) patch.espessuraChapa = 1;
      if (!formData.tipoTuboPes) patch.tipoTuboPes = "tuboRedondo";
      if (Object.keys(patch).length > 0) setFormData({ ...formData, ...patch });
    }, [formData]);
  // Novos campos de configuração
  const configDefaults = {
    precoKgInox: 45,
    precoKgTuboPes: 45,
    precoKgTuboContraventamento: 45,
    fatorVenda: 3,
    scrapMinPct: 15,
  };

  const resolvedDefaults = useMemo(
    () => ({
      ...configDefaults,
      ...(defaults || {}),
    }),
    [defaults]
  );

  const [config, setConfig] = useState(() => ({
    precoKgInox: formData.precoKgInox ?? resolvedDefaults.precoKgInox,
    precoKgTuboPes: formData.precoKgTuboPes ?? resolvedDefaults.precoKgTuboPes,
    precoKgTuboContraventamento: formData.precoKgTuboContraventamento ?? resolvedDefaults.precoKgTuboContraventamento,
    fatorVenda: formData.fatorVenda ?? resolvedDefaults.fatorVenda,
    scrapMinPct: formData.scrapMinPct ?? resolvedDefaults.scrapMinPct,
  }));

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      precoKgInox: formData.precoKgInox ?? prev.precoKgInox ?? resolvedDefaults.precoKgInox,
      precoKgTuboPes: formData.precoKgTuboPes ?? prev.precoKgTuboPes ?? resolvedDefaults.precoKgTuboPes,
      precoKgTuboContraventamento:
        formData.precoKgTuboContraventamento ??
        prev.precoKgTuboContraventamento ??
        resolvedDefaults.precoKgTuboContraventamento,
      fatorVenda: formData.fatorVenda ?? prev.fatorVenda ?? resolvedDefaults.fatorVenda,
      scrapMinPct: formData.scrapMinPct ?? prev.scrapMinPct ?? resolvedDefaults.scrapMinPct,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedDefaults]);

  // Atualiza formData ao mudar config
  useEffect(() => {
    setFormData({ ...formData, ...config });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // Permite vírgula ou ponto e campo vazio
  const parseInput = (val: string) => {
    if (val === "") return "";
    // Troca vírgula por ponto e tenta converter
    const num = Number(val.replace(",", "."));
    return isNaN(num) ? "" : num;
  };

  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateCuba = (field: string, value: any) => {
    setFormData({
      ...formData,
      cuba: { ...(formData.cuba || {}), [field]: value },
    });
  };

  // Garantir valor padrão para orcamentoTipo
  const orcamentoTipo = formData.orcamentoTipo || "bancadaComCuba";

  return (
    <div className="space-y-4">
      {/* Configuração de Preços e Markup */}
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Configuração de Preços e Markup</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label="Preço/kg Inox (R$)" required>
            <input
              type="text"
              inputMode="decimal"
              value={config.precoKgInox === 0 ? "" : config.precoKgInox ?? ""}
              onChange={e => setConfig(c => ({ ...c, precoKgInox: parseInput(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Preço/kg Tubo dos Pés (R$)" required>
            <input
              type="text"
              inputMode="decimal"
              value={config.precoKgTuboPes === 0 ? "" : config.precoKgTuboPes ?? ""}
              onChange={e => setConfig(c => ({ ...c, precoKgTuboPes: parseInput(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Preço/kg Tubo Contraventamento (R$)" required>
            <input
              type="text"
              inputMode="decimal"
              value={config.precoKgTuboContraventamento === 0 ? "" : config.precoKgTuboContraventamento ?? ""}
              onChange={e => setConfig(c => ({ ...c, precoKgTuboContraventamento: parseInput(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Fator de Venda (Markup)" required>
            <input
              type="text"
              inputMode="decimal"
              value={config.fatorVenda === 0 ? "" : config.fatorVenda ?? ""}
              onChange={e => setConfig(c => ({ ...c, fatorVenda: parseInput(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Desperdício Mínimo (%)" required>
            <input
              type="text"
              inputMode="decimal"
              value={config.scrapMinPct === 0 ? "" : config.scrapMinPct ?? ""}
              onChange={e => setConfig(c => ({ ...c, scrapMinPct: parseInput(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        </div>
        <div className="text-xs text-gray-600 mt-2">Esses valores são usados apenas neste orçamento.</div>
      </div>
      {/* Tipo de Orçamento */}
      <FormField label="Tipo de Orçamento" required>
        <select
          value={orcamentoTipo}
          onChange={(e) => update("orcamentoTipo", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="somenteTampo">Somente Tampo</option>
          <option value="somenteCuba">Somente Cuba</option>
          <option value="bancadaSemCuba">Bancada sem Cuba</option>
          <option value="bancadaComCuba">Bancada com Cuba</option>
        </select>
      </FormField>

      {/* Dimensões - apenas campos essenciais para Somente Tampo */}
      {orcamentoTipo === "somenteTampo" ? (
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Comprimento (mm)" required>
            <input
              type="text"
              inputMode="decimal"
              value={formData.comprimento === 0 ? "" : formData.comprimento ?? ""}
              onChange={(e) => update("comprimento", parseInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Largura (mm)" required>
            <input
              type="text"
              inputMode="decimal"
              value={formData.largura === 0 ? "" : formData.largura ?? ""}
              onChange={(e) => update("largura", parseInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Altura Frontal (mm)">
            <input
              type="text"
              inputMode="decimal"
              value={formData.alturaFrontal === 0 ? "" : formData.alturaFrontal ?? ""}
              onChange={(e) => update("alturaFrontal", parseInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Espessura Chapa (mm)" required>
            <input
              type="text"
              inputMode="decimal"
              value={formData.espessuraChapa === 0 ? "" : formData.espessuraChapa ?? ""}
              onChange={(e) => update("espessuraChapa", parseInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* ...campos existentes para outros tipos... */}
          <FormField label="Comprimento (mm)" required>
            <input
              type="text"
              inputMode="decimal"
              value={formData.comprimento === 0 ? "" : formData.comprimento ?? ""}
              onChange={(e) => update("comprimento", parseInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Largura (mm)" required>
            <input
              type="text"
              inputMode="decimal"
              value={formData.largura === 0 ? "" : formData.largura ?? ""}
              onChange={(e) => update("largura", parseInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          {/* Altura Frontal apenas para Cuba ou Bancada */}
          <FormField
            label={orcamentoTipo === "somenteCuba" ? "Profundidade (mm)" : "Altura Frontal (mm)"}
            required={orcamentoTipo === "somenteCuba"}
          >
            <input
              type="text"
              inputMode="decimal"
              value={formData.alturaFrontal === 0 ? "" : formData.alturaFrontal ?? ""}
              onChange={(e) => update("alturaFrontal", parseInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
          <FormField label="Espessura Chapa (mm)" required>
            <input
              type="text"
              inputMode="decimal"
              value={formData.espessuraChapa === 0 ? "" : formData.espessuraChapa ?? ""}
              onChange={(e) => update("espessuraChapa", parseInput(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        </div>
      )}

      {/* Cuba (apenas se bancadaComCuba) */}
      {orcamentoTipo === "bancadaComCuba" && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Dimensões da Cuba</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="L (mm)" required>
              <input
                type="number"
                value={formData.cuba?.L || ""}
                onChange={(e) => updateCuba("L", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>

            <FormField label="W (mm)" required>
              <input
                type="number"
                value={formData.cuba?.W || ""}
                onChange={(e) => updateCuba("W", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>

            <FormField label="H (mm)" required>
              <input
                type="number"
                value={formData.cuba?.H || ""}
                onChange={(e) => updateCuba("H", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>

            <FormField label="Espessura (mm)" required>
              <input
                type="number"
                value={formData.cuba?.t || ""}
                onChange={(e) => updateCuba("t", Number(e.target.value))}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>
          </div>
        </div>
      )}

      {/* Estrutura - APENAS se NÃO for somente cuba NEM somente tampo */}
      {orcamentoTipo !== "somenteCuba" && orcamentoTipo !== "somenteTampo" && (
        <>
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Estrutura</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Quantidade de Pés" required>
                <select
                  value={formData.quantidadePes ?? 4}
                  onChange={(e) => update("quantidadePes", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                </select>
              </FormField>

              <FormField label="Tipo de Tubo dos Pés">
                <select
                  value={formData.tipoTuboPes || "tuboRedondo"}
                  onChange={(e) => update("tipoTuboPes", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled
                >
                  <option value="tuboRedondo">Tubo Redondo 38,1</option>
                </select>
              </FormField>

              <FormField label="Altura dos Pés (mm)">
                <input
                  type="number"
                  value={formData.alturaPes || ""}
                  onChange={(e) => update("alturaPes", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>

              <FormField label="Opção de Estrutura">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="estruturaOption"
                      checked={formData.tipoPrateleiraInferior !== "nenhuma"}
                      onChange={() => {
                        update("tipoPrateleiraInferior", "lisa");
                        update("temContraventamento", false);
                        update("usarMaoFrancesa", false);
                      }}
                    />
                    <span className="text-sm text-gray-700">Prateleira Inferior</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="estruturaOption"
                      checked={formData.temContraventamento}
                      onChange={() => {
                        update("tipoPrateleiraInferior", "nenhuma");
                        update("temContraventamento", true);
                        update("usarMaoFrancesa", false);
                      }}
                    />
                    <span className="text-sm text-gray-700">Contraventamento</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="estruturaOption"
                      checked={formData.usarMaoFrancesa}
                      onChange={() => {
                        update("tipoPrateleiraInferior", "nenhuma");
                        update("temContraventamento", false);
                        update("usarMaoFrancesa", true);
                      }}
                    />
                    <span className="text-sm text-gray-700">Usar Mão Francesa</span>
                  </label>
                </div>
              </FormField>
            </div>
          </div>


        </>
      )}

      {/* Número de cubas (apenas se somenteCuba ou bancadaComCuba) */}
      {(orcamentoTipo === "somenteCuba" || orcamentoTipo === "bancadaComCuba") && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <FormField label="Quantidade de Cubas">
            <input
              type="number"
              value={formData.quantidadeCubas || 1}
              onChange={(e) => update("quantidadeCubas", Math.max(1, Number(e.target.value)))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>
        </div>
      )}
    </div>
  );
}
