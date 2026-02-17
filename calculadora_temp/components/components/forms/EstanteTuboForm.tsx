import { UnifiedFormField } from "../ui/UnifiedFormField";

interface EstanteTuboFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function EstanteTuboForm({ formData, setFormData }: EstanteTuboFormProps) {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <UnifiedFormField label="Comprimento (mm)" required>
          <input type="number" value={formData.comprimento || ""} onChange={(e) => update("comprimento", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </UnifiedFormField>
        <UnifiedFormField label="Largura (mm)" required>
          <input type="number" value={formData.largura || ""} onChange={(e) => update("largura", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </UnifiedFormField>
        <UnifiedFormField label="Altura (mm)" required>
          <input type="number" value={formData.altura || ""} onChange={(e) => update("altura", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </UnifiedFormField>
        <UnifiedFormField label="Quantidade de Planos" required>
          <input type="number" value={formData.quantidadePlanos || ""} onChange={(e) => update("quantidadePlanos", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </UnifiedFormField>
        <UnifiedFormField label="Quantidade de Pés" required>
          <input type="number" value={formData.quantidadePes || ""} onChange={(e) => update("quantidadePes", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </UnifiedFormField>
        <UnifiedFormField label="Tipo Prateleira">
          <select value={formData.tipoPrateleira || "lisa"} onChange={(e) => update("tipoPrateleira", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="lisa">Lisa</option>
            <option value="gradeada">Gradeada</option>
            <option value="perfurada">Perfurada</option>
          </select>
        </UnifiedFormField>
      </div>
    </div>
  );
}
