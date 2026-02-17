import { UnifiedFormField } from "../ui/UnifiedFormField";

interface BancadasFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function BancadasForm({ formData, setFormData }: BancadasFormProps) {
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
      {/* Tipo de Orçamento */}
      <UnifiedFormField label="Tipo de Orçamento" required>
        <select
          value={orcamentoTipo}
          onChange={(e) => update("orcamentoTipo", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="somenteCuba">Somente Cuba</option>
          <option value="bancadaSemCuba">Bancada sem Cuba</option>
          <option value="bancadaComCuba">Bancada com Cuba</option>
        </select>
      </UnifiedFormField>

      {/* Dimensões */}
      <div className="grid grid-cols-2 gap-4">
        <UnifiedFormField label="Comprimento (mm)" required>
          <input
            type="number"
            value={formData.comprimento || ""}
            onChange={(e) => update("comprimento", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </UnifiedFormField>

        <UnifiedFormField label="Largura (mm)" required>
          <input
            type="number"
            value={formData.largura || ""}
            onChange={(e) => update("largura", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </UnifiedFormField>

        {/* Altura Frontal apenas para Cuba ou Bancada */}
        <UnifiedFormField
          label={orcamentoTipo === "somenteCuba" ? "Profundidade (mm)" : "Altura Frontal (mm)"}
          required={orcamentoTipo === "somenteCuba"}
        >
          <input
            type="number"
            value={formData.alturaFrontal || ""}
            onChange={(e) => update("alturaFrontal", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </UnifiedFormField>

        <UnifiedFormField label="Espessura Chapa (mm)" required>
          <input
            type="number"
            value={formData.espessuraChapa || ""}
            onChange={(e) => update("espessuraChapa", Number(e.target.value))}
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </UnifiedFormField>
      </div>

      {/* Cuba (apenas se bancadaComCuba) */}
      {orcamentoTipo === "bancadaComCuba" && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Dimensões da Cuba</h3>
          <div className="grid grid-cols-2 gap-4">
            <UnifiedFormField label="L (mm)" required>
              <input
                type="number"
                value={formData.cuba?.L || ""}
                onChange={(e) => updateCuba("L", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </UnifiedFormField>

            <UnifiedFormField label="W (mm)" required>
              <input
                type="number"
                value={formData.cuba?.W || ""}
                onChange={(e) => updateCuba("W", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </UnifiedFormField>

            <UnifiedFormField label="H (mm)" required>
              <input
                type="number"
                value={formData.cuba?.H || ""}
                onChange={(e) => updateCuba("H", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </UnifiedFormField>

            <UnifiedFormField label="Espessura (mm)" required>
              <input
                type="number"
                value={formData.cuba?.t || ""}
                onChange={(e) => updateCuba("t", Number(e.target.value))}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </UnifiedFormField>
          </div>
        </div>
      )}

      {/* Estrutura - APENAS se NÃO for somente cuba */}
      {orcamentoTipo !== "somenteCuba" && (
        <>
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Estrutura</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Quantidade de Pés" required>
                <select
                  value={formData.quantidadePes || 4}
                  onChange={(e) => update("quantidadePes", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={7}>7</option>
                </select>
              </FormField>

              <FormField label="Tipo de Tubo dos Pés">
                <select
                  value={formData.tipoTuboPes || "tuboQuadrado"}
                  onChange={(e) => update("tipoTuboPes", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="tuboRedondo">Tubo Redondo</option>
                  <option value="tuboQuadrado">Tubo Quadrado</option>
                  <option value="tuboRetangular">Tubo Retangular</option>
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

              <FormField label="Prateleira Inferior">
                <select
                  value={formData.tipoPrateleiraInferior || "nenhuma"}
                  onChange={(e) => update("tipoPrateleiraInferior", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="nenhuma">Nenhuma</option>
                  <option value="lisa">Lisa</option>
                  <option value="gradeada">Gradeada</option>
                  <option value="perfurada">Perfurada</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Opções */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.temContraventamento || false}
                onChange={(e) => update("temContraventamento", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Contraventamento</span>
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