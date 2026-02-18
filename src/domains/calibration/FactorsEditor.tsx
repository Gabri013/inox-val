import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { CalibrationFactor } from './types';


export function FactorsEditor() {
  const [factors, setFactors] = useState<CalibrationFactor[]>([]);
  const [filteredFactors, setFilteredFactors] = useState<CalibrationFactor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [factorType, setFactorType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState<CalibrationFactor | null>(null);
  const [formData, setFormData] = useState<{
    type: 'global' | 'template' | 'process';
    targetKey: string;
    factors: {
      weld: number;
      cut: number;
      finish: number;
      assembly: number;
      material: number;
    };
    description: string;
    effectiveFrom: string;
    effectiveTo: string;
    active: boolean;
  }>({
    type: 'global',
    targetKey: '',
    factors: {
      weld: 1,
      cut: 1,
      finish: 1,
      assembly: 1,
      material: 1,
    },
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    active: true,
  });

  useEffect(() => {
    loadFactors();
  }, []);

  useEffect(() => {
    let filtered = factors;

    if (searchTerm) {
      filtered = filtered.filter(factor => 
        factor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (factor.targetKey && factor.targetKey.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (factorType !== 'all') {
      filtered = filtered.filter(factor => factor.type === factorType);
    }

    setFilteredFactors(filtered);
  }, [factors, searchTerm, factorType]);

  const loadFactors = async () => {
    // Mock data - replace with actual service call
    const mockFactors: CalibrationFactor[] = [
      {
        id: 'factor-1',
        type: 'global',
        factors: { material: 1.02, weld: 0.98, cut: 0.98, finish: 0.98, assembly: 0.98 },
        description: 'Ajuste global de custos',
        effectiveFrom: '2024-01-01',
        active: true,
      },
      {
        id: 'factor-2',
        type: 'template',
        targetKey: 'template-1',
        factors: { weld: 1.05, cut: 0.95 },
        description: 'Ajuste para template de mesa simples',
        effectiveFrom: '2024-01-15',
        active: true,
      },
      {
        id: 'factor-3',
        type: 'process',
        targetKey: 'welding',
        factors: { weld: 1.03 },
        description: 'Ajuste para processo de solda',
        effectiveFrom: '2024-02-01',
        active: false,
      },
    ];

    setFactors(mockFactors);
  };

  const handleCreate = () => {
    setEditingFactor(null);
    setFormData({
      type: 'global',
      targetKey: '',
      factors: {
        weld: 1,
        cut: 1,
        finish: 1,
        assembly: 1,
        material: 1,
      },
      description: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (factor: CalibrationFactor) => {
    setEditingFactor(factor);
    setFormData({
      type: factor.type as 'global',
      targetKey: factor.targetKey || '',
      factors: {
        weld: factor.factors.weld || 1,
        cut: factor.factors.cut || 1,
        finish: factor.factors.finish || 1,
        assembly: factor.factors.assembly || 1,
        material: factor.factors.material || 1,
      },
      description: factor.description,
      effectiveFrom: factor.effectiveFrom,
      effectiveTo: factor.effectiveTo || '',
      active: factor.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (factorId: string) => {
    setFactors(prev => prev.filter(factor => factor.id !== factorId));
  };

  const handleSubmit = async () => {
    if (editingFactor) {
      // Update existing factor
      setFactors(prev => prev.map(factor => 
        factor.id === editingFactor.id ? { ...factor, ...formData } : factor
      ));
    } else {
      // Create new factor
      const newFactor: CalibrationFactor = {
        id: `factor-${Date.now()}`,
        ...formData,
      };
      setFactors(prev => [...prev, newFactor]);
    }
    setIsDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fatores de Calibração</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Fator
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por descrição ou target key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={factorType} onValueChange={setFactorType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="template">Template</SelectItem>
              <SelectItem value="process">Processo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Factors List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Descrição</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Target</th>
                <th className="px-4 py-2 text-left">Fatores</th>
                <th className="px-4 py-2 text-left">Vigência</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFactors.map((factor) => (
                <tr key={factor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{factor.description}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize">{factor.type}</span>
                  </td>
                  <td className="px-4 py-3">{factor.targetKey || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(factor.factors).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {key}: {value.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(factor.effectiveFrom)}
                    {factor.effectiveTo && ` - ${formatDate(factor.effectiveTo)}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={
                      factor.active ? 'text-green-600' : 'text-red-600'
                    }>
                      {factor.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(factor)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(factor.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFactors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum fator encontrado
          </div>
        )}
      </Card>

      {/* Factor Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFactor ? 'Editar Fator' : 'Novo Fator'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'global' | 'template' | 'process') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="process">Processo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.type !== 'global' && (
                <div>
                  <Label>Target Key</Label>
                  <Input
                    value={formData.targetKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetKey: e.target.value }))}
                    placeholder="Template ou processo key..."
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do fator..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveTo: e.target.value }))}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div>
              <Label>Fatores de Ajuste</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                {(['weld', 'cut', 'finish', 'assembly', 'material'] as const).map((key) => (
                  <div key={key}>
                    <Label className="text-xs">{key}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.factors[key] || 1}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        factors: { ...prev.factors, [key]: parseFloat(e.target.value) || 1 },
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label>Fator Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
