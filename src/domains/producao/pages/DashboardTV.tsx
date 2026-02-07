/**
 * DASHBOARD TV - Exibição em tempo real no chão de fábrica
 * Fonte oficial: itens em subcoleções via collectionGroup('itens')
 */

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle2, List } from 'lucide-react';

import { getEmpresaId } from '@/services/firestore/base';
import { producaoItensService } from '../services/producao-itens.service';
import type { ProducaoItem } from '../producao.types';
import type { SetorProducao } from '../producao.types';

const SETORES: SetorProducao[] = ['Corte', 'Dobra', 'Solda', 'Acabamento', 'Montagem', 'Qualidade', 'Expedicao'];

function formatarTempo(segundos: number) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function DashboardTV() {
  const { data: itens = [] } = useQuery({
    queryKey: ['producao', 'tv', 'itens'],
    queryFn: async () => {
      const empresaId = await getEmpresaId();
      const results = await Promise.all(SETORES.map((s) => producaoItensService.getItensPorSetor(empresaId, s)));
      return results.flat();
    },
    refetchInterval: 5000,
  });

  const itensEmProducao = useMemo(() => (itens as ProducaoItem[]).filter((i) => i.status === 'Em Producao'), [itens]);
  const itensAguardando = useMemo(() => (itens as ProducaoItem[]).filter((i) => i.status === 'Aguardando'), [itens]);
  const itensConcluidos = useMemo(() => (itens as ProducaoItem[]).filter((i) => i.status === 'Concluido'), [itens]);

  const [horaAtual, setHoraAtual] = useState(new Date());
  const [temposAtuais, setTemposAtuais] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const novos: Record<string, number> = {};
      itensEmProducao.forEach((item) => {
        const iniciadoEm = item.iniciadoEm;
        if (!iniciadoEm) return;
        const inicio = new Date(iniciadoEm).getTime();
        novos[item.id] = Math.floor((Date.now() - inicio) / 1000);
      });
      setTemposAtuais(novos);
    }, 1000);
    return () => clearInterval(interval);
  }, [itensEmProducao]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Dashboard Produção</h1>
        </div>
        <div className="text-3xl font-mono">{horaAtual.toLocaleTimeString('pt-BR')}</div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center gap-2 text-zinc-300 mb-2">
            <List className="h-5 w-5" />
            <span className="text-xl">Aguardando</span>
          </div>
          <div className="text-6xl font-bold">{itensAguardando.length}</div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center gap-2 text-zinc-300 mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-xl">Em produção</span>
          </div>
          <div className="text-6xl font-bold">{itensEmProducao.length}</div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center gap-2 text-zinc-300 mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xl">Concluídos</span>
          </div>
          <div className="text-6xl font-bold">{itensConcluidos.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Itens em produção</h2>
          <div className="space-y-3">
            {itensEmProducao.slice(0, 12).map((item) => (
              <div key={item.id} className="flex items-center justify-between border border-zinc-800 rounded-lg p-4">
                <div>
                  <div className="text-lg font-semibold">{item.produtoCodigo} - {item.produtoNome}</div>
                  <div className="text-zinc-400">OP: {item.numeroOrdem || item.orderId} • Setor: {String(item.setorAtual || '')}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono">{formatarTempo(temposAtuais[item.id] || 0)}</div>
                </div>
              </div>
            ))}

            {itensEmProducao.length === 0 && (
              <div className="text-zinc-400">Nenhum item em produção no momento.</div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Fila (aguardando)</h2>
          <div className="space-y-3">
            {itensAguardando.slice(0, 12).map((item) => (
              <div key={item.id} className="border border-zinc-800 rounded-lg p-4">
                <div className="text-lg font-semibold">{item.produtoCodigo} - {item.produtoNome}</div>
                <div className="text-zinc-400">OP: {item.numeroOrdem || item.orderId} • Setor: {String(item.setorAtual || '')}</div>
              </div>
            ))}

            {itensAguardando.length === 0 && (
              <div className="text-zinc-400">Nenhum item aguardando no momento.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
