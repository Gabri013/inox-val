/**
 * Formulário de Orçamento
 * Integrado com Calculadora Rápida para adicionar itens baseados em modelos
 */

import { useState } from 'react';
import { Trash2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import type { Orcamento, ItemOrcamento } from '../../types/workflow';
import { CalculadoraModal } from './CalculadoraModal';
import { formatCurrency } from '@/shared/lib/format';

interface OrcamentoFormProps {
  onSubmit: (orcamento: Omit<Orcamento, 'id' | 'numero'>) => void;
  onCancel: () => void;
}

export function OrcamentoForm({ onSubmit, onCancel }: OrcamentoFormProps) {
  const [clienteNome, setClienteNome] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [validade, setValidade] = useState(15); // dias
  const [desconto, setDesconto] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [showCalculadora, setShowCalculadora] = useState(false);

  const handleAddItem = (item: ItemOrcamento) => {
    setItens(prev => [...prev, item]);
    setShowCalculadora(false);
    toast.success('Item adicionado ao orçamento');
  };

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
    toast.info('Item removido');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteNome.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }

    if (itens.length === 0) {
      toast.error('Adicione pelo menos um item ao orçamento');
      return;
    }

    const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal - desconto;

    const orcamento: Omit<Orcamento, 'id' | 'numero'> = {
      clienteId: clienteId || `cliente-${Date.now()}`,
      clienteNome,
      data: new Date(),
      validade: new Date(Date.now() + validade * 24 * 60 * 60 * 1000),
      status: 'Rascunho',
      itens,
      subtotal,
      desconto,
      total,
      observacoes: observacoes.trim() || undefined,
    };

    onSubmit(orcamento);
  };

  const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - desconto;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do Cliente */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Dados do Cliente</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clienteNome">Nome do Cliente *</Label>
              <Input
                id="clienteNome"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex: Empresa ABC Ltda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clienteId">Código do Cliente (opcional)</Label>
              <Input
                id="clienteId"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                placeholder="Ex: CLI-001"
              />
            </div>
          </div>
        </div>

        {/* Validade e Desconto */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Condições Comerciais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validade">Validade (dias)</Label>
              <Input
                id="validade"
                type="number"
                min="1"
                value={validade}
                onChange={(e) => setValidade(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desconto">Desconto (R$)</Label>
              <Input
                id="desconto"
                type="number"
                min="0"
                step="0.01"
                value={desconto}
                onChange={(e) => setDesconto(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Itens */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Itens do Orçamento</h3>
            <Button
              type="button"
              onClick={() => setShowCalculadora(true)}
              size="sm"
              className="gap-2"
            >
              <Calculator className="size-4" />
              Adicionar Item
            </Button>
          </div>

          {itens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Calculator className="size-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum item adicionado</p>
              <p className="text-sm">Clique em "Adicionar Item" para calcular uma bancada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {itens.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-card"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.modeloNome}</span>
                      <span className="text-sm text-muted-foreground">
                        × {item.quantidade}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.descricao}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono font-medium">
                      {formatCurrency(item.subtotal)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.precoUnitario)}/un
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo Financeiro */}
        {itens.length > 0 && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Desconto:</span>
                <span className="font-mono">-{formatCurrency(desconto)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="font-mono">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações (opcional)</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Informações adicionais sobre o orçamento..."
            rows={3}
          />
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Criar Orçamento
          </Button>
        </div>
      </form>

      {/* Modal da Calculadora */}
      {showCalculadora && (
        <CalculadoraModal
          onAddItem={handleAddItem}
          onClose={() => setShowCalculadora(false)}
        />
      )}
    </>
  );
}
