import { FormField } from "./FormField";

interface CantoneiraFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function CantoneiraForm({ formData, setFormData }: CantoneiraFormProps) {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Comprimento (mm)" required>
          <input type="number" value={formData.comprimento || ""} onChange={(e) => update("comprimento", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Lado A (mm)" required>
          <input type="number" value={formData.ladoA || ""} onChange={(e) => update("ladoA", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Lado B (mm)" required>
          <input type="number" value={formData.ladoB || ""} onChange={(e) => update("ladoB", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Espessura (mm)" required>
          <input type="number" value={formData.espessura || ""} onChange={(e) => update("espessura", Number(e.target.value))} step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ℹ️ A chave para kg/m será: <strong>{formData.ladoA || 0}×{formData.ladoB || 0}×{formData.espessura || 0}</strong>
        </p>
      </div>
    </div>
  );
}
