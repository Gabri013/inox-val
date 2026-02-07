/**
 * APONTAMENTO DE PRODUÇÃO - Interface para operadores
 * Fonte oficial: itens via collectionGroup('itens')
 */

import { useMemo, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Play, Pause, Square, User } from 'lucide-react';

import type { ProducaoItem, SetorProducao } from '../producao.types';
import { useAtualizarStatus, useItensSetor, useMoverItem } from '../producao.hooks';

const SETORES: SetorProducao[] = ['Corte', 'Dobra', 'Solda', 'Acabamento', 'Montagem', 'Qualidade', 'Expedicao'];

const OPERADORES = [
  { id: '1', nome: 'João Silva' },
  { id: '2', nome: 'Maria Santos' },
  { id: '3', nome: 'Pedro Costa' },
];

export default function ApontamentoOP() {
  const [operadorId, setOperadorId] = useState<string>(OPERADORES[0].id);
  const [setor, setSetor] = useState<SetorProducao>('Corte');
  const [itemSelecionado, setItemSelecionado] = useState<ProducaoItem | null>(null);

  const { data: itens = [], isLoading } = useItensSetor(setor);
  const moverItem = useMoverItem();
  const atualizarStatus = useAtualizarStatus();

  const operador = useMemo(() => OPERADORES.find((o) => o.id === operadorId)!, [operadorId]);

  const handleIniciar = (item: ProducaoItem) => {
    setItemSelecionado(item);
    atualizarStatus.mutate({
      orderId: item.orderId,
      itemId: item.id,
      status: 'Em Producao',
      operadorId: operador.id,
      operadorNome: operador.nome,
      observacoes: 'Início de produção',
    });
  };

  const handlePausar = (item: ProducaoItem) => {
    setItemSelecionado(item);
    atualizarStatus.mutate({
      orderId: item.orderId,
      itemId: item.id,
      status: 'Pausado',
      operadorId: operador.id,
      operadorNome: operador.nome,
      observacoes: 'Pausa',
    });
  };

  const handleFinalizar = (item: ProducaoItem) => {
    setItemSelecionado(item);
    const idx = SETORES.indexOf(item.setorAtual);
    const proximo = idx >= 0 && idx < SETORES.length - 1 ? SETORES[idx + 1] : null;
    if (!proximo) {
      atualizarStatus.mutate({
        orderId: item.orderId,
        itemId: item.id,
        status: 'Concluido',
        operadorId: operador.id,
        operadorNome: operador.nome,
        observacoes: 'Finalização',
      });
      return;
    }
    moverItem.mutate({
      orderId: item.orderId,
      itemId: item.id,
      novoSetor: proximo,
      setorAnterior: item.setorAtual,
      operadorId: operador.id,
      operadorNome: operador.nome,
      observacoes: `Saída do setor ${item.setorAtual}`,
    });
    atualizarStatus.mutate({
      orderId: item.orderId,
      itemId: item.id,
      status: 'Aguardando',
      operadorId: operador.id,
      operadorNome: operador.nome,
      observacoes: `Aguardando no setor ${proximo}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="p-4 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4" />
            <div className="font-medium">Operador</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {OPERADORES.map((op) => (
              <Button
                key={op.id}
                variant={operadorId === op.id ? 'default' : 'outline'}
                onClick={() => setOperadorId(op.id)}
              >
                {op.nome}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-4 flex-1">
          <div className="font-medium mb-3">Setor</div>
          <div className="flex flex-wrap gap-2">
            {SETORES.map((s) => (
              <Button key={s} variant={setor === s ? 'default' : 'outline'} onClick={() => setSetor(s)}>
                {s}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="font-semibold mb-3">Fila do setor: {setor}</div>

        {isLoading ? (
          <div>Carregando…</div>
        ) : (
          <div className="space-y-3">
            {(itens as ProducaoItem[]).map((item) => (
              <div key={item.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-mono font-semibold">{item.produtoCodigo}</div>
                  <div className="text-sm text-muted-foreground">{item.produtoNome}</div>
                  <div className="text-sm">Status: {item.status}</div>
                  <div className="text-sm">OP: {item.numeroOrdem || item.orderId}</div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleIniciar(item)} disabled={item.status === 'Em Producao'}>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                  <Button variant="outline" onClick={() => handlePausar(item)} disabled={item.status !== 'Em Producao'}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                  <Button variant="destructive" onClick={() => handleFinalizar(item)}>
                    <Square className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
                </div>
              </div>
            ))}

            {itens.length === 0 && <div className="text-muted-foreground">Nenhum item na fila.</div>}
          </div>
        )}

        {itemSelecionado && (
          <div className="mt-4 text-sm text-muted-foreground">
            Operador ativo: {operador.nome}
          </div>
        )}
      </Card>
    </div>
  );
}
