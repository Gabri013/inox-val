import { UnifiedFormField } from "../ui/UnifiedFormField";

interface CoifasFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function CoifasForm({ formData, setFormData }: CoifasFormProps) {
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
        <UnifiedFormField label="Tipo de Coifa">
          <select value={formData.tipoCoifa || "4-aguas"} onChange={(e) => update("tipoCoifa", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="3-aguas">3 águas</option>
            <option value="4-aguas">4 águas</option>
          </select>
        </UnifiedFormField>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={formData.incluirDuto || false} onChange={(e) => update("incluirDuto", e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
          <span className="text-sm text-gray-700">Incluir Duto</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={formData.incluirCurva || false} onChange={(e) => update("incluirCurva", e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
          <span className="text-sm text-gray-700">Incluir Curva</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={formData.incluirChapeu || false} onChange={(e) => update("incluirChapeu", e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
          <span className="text-sm text-gray-700">Incluir Chapéu</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={formData.incluirInstalacao || false} onChange={(e) => update("incluirInstalacao", e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
          <span className="text-sm text-gray-700">Incluir Instalação</span>
        </label>
      </div>
    </div>
  );
}
