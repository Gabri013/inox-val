import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Baseline } from './types';
import { validateBaseline } from './baseline.validator';

interface BaselineEditorProps {
  baseline?: Baseline;
  onSave: (baseline: Omit<Baseline, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function BaselineEditor({ baseline, onSave, onCancel }: BaselineEditorProps) {
  const [formData, setFormData] = useState({
    templateKey: baseline?.templateKey || '',
    inputs: baseline?.inputs || {},
    expectedCost: baseline?.expectedCost || {
      material: 0,
      process: 0,
      overhead: 0,
      margin: 0,
      total: 0,
    },
    expectedMetrics: baseline?.expectedMetrics || {
      weldMeters: 0,
      cutMeters: 0,
      finishM2: 0,
      bendCount: 0,
    },
    notes: baseline?.notes || '',
    createdBy: baseline?.createdBy || 'user@test.com',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ]);

  const handleCostChange = (key: keyof typeof formData.expectedCost, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newCosts = { ...formData.expectedCost, [key]: numValue };
    
    // Recalculate total
    newCosts.total = 
      newCosts.material + 
      newCosts.process + 
      newCosts.overhead + 
      newCosts.margin;

    setFormData(prev => ({ ...prev, expectedCost: newCosts }));
  };

  const handleInputChange = (index: number, field: 'key' | 'value', value: string) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    setInputs([...inputs, { key: '', value: '' }]);
  };

  const removeInput = (index: number) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    // Convert inputs to object
    const inputsObject = inputs.reduce((acc, input) => {
      if (input.key.trim()) {
        acc[input.key.trim()] = input.value.trim();
      }
      return acc;
    }, {} as Record<string, any>);

    const baselineData = {
      ...formData,
      inputs: inputsObject,
    };

    // Validate
    const validationResult = validateBaseline({
      ...baselineData,
      id: baseline?.id || 'temp-id',
      createdAt: baseline?.createdAt || new Date().toISOString(),
    });

    if (!validationResult.valid) {
      setValidationErrors(validationResult.errors);
      return;
    }

    onSave(baselineData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {baseline ? 'Editar Baseline' : 'Criar Nova Baseline'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <h3 className="text-red-700 font-semibold mb-2">Erros de Validação:</h3>
          <ul className="text-red-600 text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Informações Básicas</h2>
          
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={formData.templateKey}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, templateKey: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template-1">Template 1 - Mesa Simples</SelectItem>
                <SelectItem value="template-2">Template 2 - Mesa com Tampo</SelectItem>
                <SelectItem value="template-3">Template 3 - Mesa Complexa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre esta baseline..."
              rows={3}
            />
          </div>
        </Card>

        {/* Cost Structure */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Estrutura de Custos</h2>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Label>Materiais</Label>
              <Input
                type="number"
                value={formData.expectedCost.material}
                onChange={(e) => handleCostChange('material', e.target.value)}
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Label>Processos</Label>
              <Input
                type="number"
                value={formData.expectedCost.process}
                onChange={(e) => handleCostChange('process', e.target.value)}
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Label>Overhead</Label>
              <Input
                type="number"
                value={formData.expectedCost.overhead}
                onChange={(e) => handleCostChange('overhead', e.target.value)}
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Label>Margem</Label>
              <Input
                type="number"
                value={formData.expectedCost.margin}
                onChange={(e) => handleCostChange('margin', e.target.value)}
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Label>Total</Label>
              <Input
                type="number"
                value={formData.expectedCost.total}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
        </Card>

        {/* Inputs */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Inputs do Template</h2>
          
          <div className="space-y-3">
            {inputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Chave"
                  value={input.key}
                  onChange={(e) => handleInputChange(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Valor"
                  value={input.value}
                  onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInput(index)}
                  disabled={inputs.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button variant="outline" size="sm" onClick={addInput} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Input
            </Button>
          </div>
        </Card>

        {/* Metrics */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Métricas Esperadas</h2>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Label>Métros de Solda</Label>
              <Input
                type="number"
                value={formData.expectedMetrics.weldMeters}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expectedMetrics: { ...prev.expectedMetrics, weldMeters: parseFloat(e.target.value) || 0 },
                }))}
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Label>Métros de Corte</Label>
              <Input
                type="number"
                value={formData.expectedMetrics.cutMeters}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expectedMetrics: { ...prev.expectedMetrics, cutMeters: parseFloat(e.target.value) || 0 },
                }))}
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Label>M2 de Acabamento</Label>
              <Input
                type="number"
                value={formData.expectedMetrics.finishM2}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expectedMetrics: { ...prev.expectedMetrics, finishM2: parseFloat(e.target.value) || 0 },
                }))}
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Label>Quantidade de Dobras</Label>
              <Input
                type="number"
                value={formData.expectedMetrics.bendCount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expectedMetrics: { ...prev.expectedMetrics, bendCount: parseInt(e.target.value) || 0 },
                }))}
                step="1"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
