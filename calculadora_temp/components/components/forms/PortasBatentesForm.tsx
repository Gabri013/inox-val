import { UnifiedFormField } from "../ui/UnifiedFormField";

interface PortasBatentesFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function PortasBatentesForm({ formData, setFormData }: PortasBatentesFormProps) {
  const updatePorta = (field: string, value: any) => {
    setFormData({
      ...formData,
      porta: { ...(formData.porta || {}), [field]: value },
    });
  };

  const updateBatente = (field: string, value: any) => {
    setFormData({
      ...formData,
      batente: { ...(formData.batente || {}), [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Porta</h3>
        <div className="grid grid-cols-2 gap-4">
          <UnifiedFormField label="Altura (mm)" required>
            <input type="number" value={formData.porta?.altura || ""} onChange={(e) => updatePorta("altura", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </UnifiedFormField>
          <UnifiedFormField label="Largura (mm)" required>
            <input type="number" value={formData.porta?.largura || ""} onChange={(e) => updatePorta("largura", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </UnifiedFormField>
          <UnifiedFormField label="Espessura Frente (mm)" required>
            <input type="number" value={formData.porta?.espessuraFrente || ""} onChange={(e) => updatePorta("espessuraFrente", Number(e.target.value))} step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </UnifiedFormField>
          <UnifiedFormField label="Espessura Verso (mm)" required>
            <input type="number" value={formData.porta?.espessuraVerso || ""} onChange={(e) => updatePorta("espessuraVerso", Number(e.target.value))} step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </UnifiedFormField>
        </div>
        <UnifiedFormField label="Preenchimento MDF">
          <input type="checkbox" checked={formData.porta?.preenchimentoMDF || false} onChange={(e) => updatePorta("preenchimentoMDF", e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
          <span className="text-sm text-gray-700 ml-2">Preenchimento MDF</span>
        </UnifiedFormField>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Batente</h3>
        <div className="grid grid-cols-2 gap-4">
          <UnifiedFormField label="Altura (mm)" required>
            <input type="number" value={formData.batente?.altura || ""} onChange={(e) => updateBatente("altura", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </UnifiedFormField>
          <UnifiedFormField label="Largura (mm)" required>
            <input type="number" value={formData.batente?.largura || ""} onChange={(e) => updateBatente("largura", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </UnifiedFormField>
          <UnifiedFormField label="Perfil (mm)">
            <input type="number" value={formData.batente?.perfil || ""} onChange={(e) => updateBatente("perfil", Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </UnifiedFormField>
          <UnifiedFormField label="Espessura (mm)" required>
            <input type="number" value={formData.batente?.espessura || ""} onChange={(e) => updateBatente("espessura", Number(e.target.value))} step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </UnifiedFormField>
        </div>
      </div>
    </div>
  );
}
