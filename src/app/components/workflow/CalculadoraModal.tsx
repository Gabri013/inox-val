/**
 * Modal da Calculadora Rápida para Orçamentos
 * Permite calcular item baseado em modelo e adicionar ao orçamento.
 *
 * Usa os componentes do domain layer: FormularioEntrada + CalculadoraEngine
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { ItemOrcamento } from '../../types/workflow';
import { FormularioEntrada } from '@/domains/calculadora/components/FormularioEntrada';
import { CalculadoraEngine } from '@/domains/calculadora/engine';
import { MODELOS_BOM } from '@/bom/models';
import type { EntradaCalculadora, ResultadoCalculadora } from '@/domains/calculadora/types';

interface CalculadoraModalProps {
  onAddItem: (item: ItemOrcamento) => void;
  onClose: () => void;
}

export function CalculadoraModal({ onAddItem, onClose }: CalculadoraModalProps) {
  const [resultado, setResultado] = useState<ResultadoCalculadora | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [showQuantidade, setShowQuantidade] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleCalcular = (entrada: EntradaCalculadora) => {
    setCarregando(true);
    try {
      const result = CalculadoraEngine.calcular(entrada);
      setResultado(result);
      setShowQuantidade(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao calcular');
    } finally {
      setCarregando(false);
    }
  };

  const handleAddToOrcamento = () => {
    if (!resultado) return;

    if (quantidade < 1) {
      toast.error('Quantidade deve ser no mínimo 1');
      return;
    }

    const { modelo, config } = resultado.entrada;
    const precoUnitario = resultado.precificacao.precoFinal;

    // Buscar label do modelo
    const modeloInfo = MODELOS_BOM.find(m => m.value === modelo);
    const modeloNome = modeloInfo?.label ?? String(modelo);

    // Gerar descrição amigável (config usa l/c/h em mm)
    const descricao = `${config.l}×${config.c}×${config.h}mm - ${config.material}`;

    const item: ItemOrcamento = {
      id: `item-${Date.now()}`,
      modeloId: String(modelo),
      modeloNome,
      descricao,
      quantidade,
      calculoSnapshot: resultado,
      precoUnitario,
      subtotal: precoUnitario * quantidade,
    };

    onAddItem(item);
  };

  // Label do modelo para exibição
  const modeloLabel = resultado
    ? (MODELOS_BOM.find(m => m.value === resultado.entrada.modelo)?.label ?? resultado.entrada.modelo)
    : '';

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Orçamento</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {!showQuantidade ? (
            <>
              <p className="text-sm text-muted-foreground">
                Use a calculadora abaixo para configurar o produto e calcular o preço.
              </p>

              <FormularioEntrada onCalcular={handleCalcular} carregando={carregando} />
            </>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium">Produto Calculado</h4>
                <p className="text-sm">
                  {modeloLabel} -{' '}
                  {resultado?.entrada.config.l}×
                  {resultado?.entrada.config.c}×
                  {resultado?.entrada.config.h}mm
                </p>
                <p className="text-lg font-bold font-mono">
                  R$ {resultado?.precificacao.precoFinal.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  autoFocus
                />
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total do Item:</span>
                  <span className="text-xl font-bold font-mono">
                    R$ {((resultado?.precificacao.precoFinal || 0) * quantidade).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQuantidade(false);
                    setResultado(null);
                  }}
                >
                  Voltar para Calculadora
                </Button>

                <Button onClick={handleAddToOrcamento}>
                  Adicionar ao Orçamento
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}