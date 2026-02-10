import { FormField } from "./FormField";

interface PrateleirasFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function PrateleirasForm({ formData, setFormData }: PrateleirasFormProps) {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
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
