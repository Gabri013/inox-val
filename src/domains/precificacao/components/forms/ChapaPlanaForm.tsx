import { FormField } from "./FormField";

interface ChapaPlanaFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ChapaPlanaForm({ formData, setFormData }: ChapaPlanaFormProps) {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Material" required>
          <select value={formData.material || "inox_304"} onChange={e => update("material", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="inox_304">Inox 304</option>
            <option value="inox_430">Inox 430</option>
            <option value="galvanizado">Galvanizado</option>
            <option value="outro">Outro</option>
          </select>
        </FormField>
        <FormField label="Comprimento (mm)" required>
          <input type="number" value={formData.comprimento || ""} onChange={(e) => update("comprimento", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Largura (mm)" required>
          <input type="number" value={formData.largura || ""} onChange={(e) => update("largura", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Espessura (mm)" required>
          <input type="number" value={formData.espessura || ""} onChange={(e) => update("espessura", Number(e.target.value))} step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Preço/kg (R$)">
          <input type="number" value={formData.precoKg || ""} onChange={(e) => update("precoKg", Number(e.target.value))} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Serviço de corte (m)">
          <input type="number" value={formData.servicoCorteM || ""} onChange={e => update("servicoCorteM", Number(e.target.value))} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
        <FormField label="Serviço de dobra (un)">
          <input type="number" value={formData.servicoDobraUn || ""} onChange={e => update("servicoDobraUn", Number(e.target.value))} step="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </FormField>
      </div>
    </div>
  );
}

