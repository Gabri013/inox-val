import { UnifiedFormField } from "../ui/UnifiedFormField";

interface MesasFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function MesasForm({ formData, setFormData }: MesasFormProps) {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <UnifiedFormField label="Comprimento (mm)" required>
          <input
            type="number"
            value={formData.comprimento || ""}
            onChange={(e) => update("comprimento", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </UnifiedFormField>

        <UnifiedFormField label="Largura (mm)" required>
          <input
            type="number"
            value={formData.largura || ""}
            onChange={(e) => update("largura", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </UnifiedFormField>

        <UnifiedFormField label="Espessura Tampo (mm)" required>
          <input
            type="number"
            value={formData.espessuraTampo || ""}
            onChange={(e) => update("espessuraTampo", Number(e.target.value))}
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </UnifiedFormField>

        <UnifiedFormField label="Borda Tampo (mm)">
          <input
            type="number"
            value={formData.bordaTampo || ""}
            onChange={(e) => update("bordaTampo", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </UnifiedFormField>

        <UnifiedFormField label="Quantidade de Pés" required>
          <select
            value={formData.quantidadePes || 4}
            onChange={(e) => update("quantidadePes", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
          </select>
        </UnifiedFormField>

        <UnifiedFormField label="Tipo de Tubo dos Pés">
          <select
            value={formData.tipoTuboPes || "tuboQuadrado"}
            onChange={(e) => update("tipoTuboPes", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="tuboRedondo">Tubo Redondo</option>
            <option value="tuboQuadrado">Tubo Quadrado</option>
            <option value="tuboRetangular">Tubo Retangular</option>
          </select>
        </UnifiedFormField>

        <UnifiedFormField label="Altura dos Pés (mm)">
          <input
            type="number"
            value={formData.alturaPes || ""}
            onChange={(e) => update("alturaPes", Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </UnifiedFormField>

        <UnifiedFormField label="Prateleira Inferior">
          <select
            value={formData.tipoPrateleiraInferior || "nenhuma"}
            onChange={(e) => update("tipoPrateleiraInferior", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="nenhuma">Nenhuma</option>
            <option value="lisa">Lisa</option>
            <option value="gradeada">Gradeada</option>
            <option value="perfurada">Perfurada</option>
          </select>
        </UnifiedFormField>
      </div>

      <UnifiedFormField label="Contraventamento">
        <input
          type="checkbox"
          checked={formData.temContraventamento || false}
          onChange={(e) => update("temContraventamento", e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 ml-2">Contraventamento</span>
      </UnifiedFormField>
    </div>
  );
}
