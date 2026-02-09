/**
 * Formulario de Orcamento
 * - Manual (descricao/codigo/quantidade)
 * - Importacao OMEI (PDF)
 * - Calculadora Rapida (modelos)
 */

import { useEffect, useState } from 'react';
import { Trash2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import type { Orcamento, ItemOrcamento } from '../../types/workflow';
import { CalculadoraModal } from './CalculadoraModal';
import { formatCurrency } from '@/shared/lib/format';
import { parseOmeiText } from '@/app/lib/omeiImport';

interface OrcamentoFormProps {
  onSubmit: (orcamento: Omit<Orcamento, 'id' | 'numero'>) => void;
  onCancel: () => void;
  initialMode?: 'manual' | 'omei';
}

async function extractTextFromPdf(file: File) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  (pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc;

  const data = await file.arrayBuffer();
  const loadingTask = (pdfjs as any).getDocument({ data });
  const pdf = await loadingTask.promise;
  let text = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    text += `\n${pageText}`;
  }

  return text;
}

export function OrcamentoForm({ onSubmit, onCancel, initialMode = 'manual' }: OrcamentoFormProps) {
  const [mode, setMode] = useState<'manual' | 'omei'>(initialMode);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [validade, setValidade] = useState(15); // dias
  const [desconto, setDesconto] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [showCalculadora, setShowCalculadora] = useState(false);
  const [dataEmissao, setDataEmissao] = useState<Date | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [manualItem, setManualItem] = useState({
    codigo: '',
    descricao: '',
    quantidade: 1,
    precoUnitario: 0,
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleAddItem = (item: ItemOrcamento) => {
    setItens(prev => [...prev, item]);
    setShowCalculadora(false);
    toast.success('Item adicionado ao orcamento');
  };

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
    toast.info('Item removido');
  };

  const handleAddManualItem = () => {
    if (!manualItem.descricao.trim()) {
      toast.error('Informe a descricao do item');
      return;
    }

    const quantidade = manualItem.quantidade > 0 ? manualItem.quantidade : 1;
    const precoUnitario = manualItem.precoUnitario >= 0 ? manualItem.precoUnitario : 0;
    const subtotal = quantidade * precoUnitario;
    const codigo = manualItem.codigo.trim();
    const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const novoItem: ItemOrcamento = {
      id,
      modeloId: codigo || id,
      modeloNome: codigo || manualItem.descricao.trim(),
      descricao: manualItem.descricao.trim(),
      quantidade,
      precoUnitario,
      subtotal,
    };

    setItens(prev => [...prev, novoItem]);
    setManualItem({ codigo: '', descricao: '', quantidade: 1, precoUnitario: 0 });
    toast.success('Item manual adicionado');
  };

  const applyOmeiImport = (rawText: string) => {
    const parsed = parseOmeiText(rawText);

    if (!parsed.clienteNome && !parsed.itens.length) {
      setImportError('Nao foi possivel ler o PDF. Tente novamente.');
      return;
    }

    if (parsed.clienteNome) setClienteNome(parsed.clienteNome);
    if (parsed.cnpj) setClienteId(parsed.cnpj);
    if (parsed.validadeDias) setValidade(parsed.validadeDias);
    if (parsed.dataEmissao) setDataEmissao(parsed.dataEmissao);

    const observacoesImportadas = [
      parsed.numero ? `OMEI: ${parsed.numero}` : '',
      parsed.contato ? `Contato: ${parsed.contato}` : '',
      parsed.email ? `Email: ${parsed.email}` : '',
      parsed.telefone ? `Telefone: ${parsed.telefone}` : '',
      parsed.observacoes ? parsed.observacoes : '',
    ]
      .filter(Boolean)
      .join(' | ');

    if (observacoesImportadas) {
      setObservacoes(observacoesImportadas);
    }

    if (parsed.itens.length > 0) {
      const imported = parsed.itens.map((item, index) => {
        const id = `omei-${Date.now()}-${index}`;
        const codigo = item.codigo ? item.codigo.trim() : '';
        const quantidade = item.quantidade || 1;
        const precoUnitario = 0;
        return {
          id,
          modeloId: codigo || id,
          modeloNome: codigo || item.descricao,
          descricao: item.descricao,
          quantidade,
          precoUnitario,
          subtotal: quantidade * precoUnitario,
        } as ItemOrcamento;
      });
      setItens(imported);
      toast.success(`Importado: ${imported.length} itens`);
    } else {
      toast.error('Nenhum item foi identificado no PDF');
    }
  };

  const handleImportFile = async () => {
    if (!importFile) {
      toast.error('Selecione o PDF do OMEI');
      return;
    }

    setImporting(true);
    setImportError(null);

    try {
      const text = await extractTextFromPdf(importFile);
      applyOmeiImport(text);
    } catch (error) {
      setImportError('Erro ao ler PDF. Tente novamente.');
      toast.error('Erro ao ler PDF');
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteNome.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }

    if (itens.length === 0) {
      toast.error('Adicione pelo menos um item ao orcamento');
      return;
    }

    const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal - desconto;
    const baseDate = dataEmissao || new Date();

    const orcamento: Omit<Orcamento, 'id' | 'numero'> = {
      clienteId: clienteId || `cliente-${Date.now()}`,
      clienteNome,
      data: baseDate,
      validade: new Date(baseDate.getTime() + validade * 24 * 60 * 60 * 1000),
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
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
          >
            Manual
          </Button>
          <Button
            type="button"
            variant={mode === 'omei' ? 'default' : 'outline'}
            onClick={() => setMode('omei')}
          >
            Importar OMEI
          </Button>
        </div>

        {mode === 'omei' && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="omeiPdf">PDF do OMEI</Label>
              <Input
                id="omeiPdf"
                type="file"
                accept="application/pdf"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleImportFile}
                disabled={!importFile || importing}
              >
                {importing ? 'Importando...' : 'Importar PDF'}
              </Button>
              {importError && (
                <span className="text-sm text-destructive">{importError}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              O PDF importado preenche cliente, itens e observacoes. Revise antes de salvar.
            </p>
          </div>
        )}

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
              <Label htmlFor="clienteId">Codigo do Cliente (opcional)</Label>
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
          <h3 className="text-lg font-semibold">Condicoes Comerciais</h3>
          
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
            <h3 className="text-lg font-semibold">Itens do Orcamento</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAddManualItem}
                size="sm"
                variant="outline"
              >
                Adicionar Manual
              </Button>
              <Button
                type="button"
                onClick={() => setShowCalculadora(true)}
                size="sm"
                className="gap-2"
              >
                <Calculator className="size-4" />
                Adicionar via Calculadora
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="manualCodigo">Codigo</Label>
              <Input
                id="manualCodigo"
                value={manualItem.codigo}
                onChange={(e) => setManualItem(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="Ex: 1008999-1"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="manualDescricao">Descricao *</Label>
              <Input
                id="manualDescricao"
                value={manualItem.descricao}
                onChange={(e) => setManualItem(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descricao do item"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manualQtd">Quantidade</Label>
              <Input
                id="manualQtd"
                type="number"
                min="0.01"
                step="0.01"
                value={manualItem.quantidade}
                onChange={(e) => setManualItem(prev => ({ ...prev, quantidade: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manualPreco">Preco Unitario</Label>
              <Input
                id="manualPreco"
                type="number"
                min="0"
                step="0.01"
                value={manualItem.precoUnitario}
                onChange={(e) => setManualItem(prev => ({ ...prev, precoUnitario: Number(e.target.value) }))}
              />
            </div>
          </div>

          {itens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Calculator className="size-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum item adicionado</p>
              <p className="text-sm">Use a calculadora ou adicione manualmente</p>
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
                        x {item.quantidade}
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

        {/* Observacoes */}
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observacoes (opcional)</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Informacoes adicionais sobre o orcamento..."
            rows={3}
          />
        </div>

        {/* Acoes */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Criar Orcamento
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
