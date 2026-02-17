import { UnifiedFormField } from "../ui/UnifiedFormField";

interface LavatoriosFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function LavatoriosForm({ formData, setFormData }: LavatoriosFormProps) {
  const update = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <UnifiedFormField label="Tipo" required>
        <select
          value={formData.tipo || "lavatorioPadrao"}
          onChange={(e) => update("tipo", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="lavatorioPadrao">Lavatório Padrão</option>
          <option value="lavatorioCirurgico">Lavatório Cirúrgico</option>
        </select>
      </UnifiedFormField>

      {formData.tipo === "lavatorioPadrao" ? (
        <FormField label="Modelo" required>
          <select
            value={formData.modeloPadrao || "750"}
            onChange={(e) => update("modeloPadrao", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="750">750 (750×500mm)</option>
            <option value="850">850 (850×500mm)</option>
            <option value="FDE">FDE (850×550mm)</option>
          </select>
        </FormField>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Comprimento (mm)" required>
            <input
              type="number"
              value={formData.comprimento || ""}
              onChange={(e) => update("comprimento", Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Largura (mm)" required>
            <input
              type="number"
              value={formData.largura || ""}
              onChange={(e) => update("largura", Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Acessórios Hidráulicos</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "valvula", label: "Válvula" },
            { key: "mangueiras", label: "Mangueiras" },
            { key: "joelho", label: "Joelho" },
            { key: "pedal", label: "Pedal" },
            { key: "bicaAlta", label: "Bica Alta" },
            { key: "bicaBaixa", label: "Bica Baixa" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData[item.key] || false}
                onChange={(e) => update(item.key, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
