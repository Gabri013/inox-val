import { FormField } from "./FormField";

interface MaterialRedondoFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function MaterialRedondoForm({ formData, setFormData }: MaterialRedondoFormProps) {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Atenção:</strong> Material redondo (repuxo) requer tabela técnica específica. 
          Este produto não gera BOM automaticamente sem modelo de cálculo definido.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Diâmetro (mm)" required>
          <input type="number" value={formData.diametro || ""} onChange={(e) => update("diametro", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Altura (mm)" required>
          <input type="number" value={formData.altura || ""} onChange={(e) => update("altura", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Espessura (mm)" required>
          <input type="number" value={formData.espessura || ""} onChange={(e) => update("espessura", Number(e.target.value))} step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Percentual Repuxo (%)">
          <input type="number" value={formData.percentualRepuxo || ""} onChange={(e) => update("percentualRepuxo", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
      </div>
    </div>
  );
}
