/**
 * PAINEL DE ORÇAMENTO
 * Visualização detalhada de custos e precificação
 */

import { useState } from "react";
import { DollarSign, TrendingUp, Clock, Package, Settings, Eye, EyeOff } from "lucide-react";
import type { Orcamento } from "../types/projeto";
import { formatarMoeda, formatarTempo } from "../lib/orcamento";

interface Props {
  orcamento: Orcamento;
  onEditarPrecos?: () => void;
}

export function PainelOrcamento({ orcamento, onEditarPrecos }: Props) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(true);
  const { custoDetalhado: custo } = orcamento;

  const tempoTotal_min =
    custo.maoDeObra.corte.tempo_min +
    custo.maoDeObra.solda.tempo_min +
    custo.maoDeObra.polimento.tempo_min +
    custo.maoDeObra.dobra.tempo_min;

  return (
    <div className="space-y-4">
      {/* Header com Total */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-sm p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-semibold">Orçamento Total</h3>
          </div>
          <button
            onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
            className="p-1.5 hover:bg-green-500/30 rounded-lg transition-colors"
            title={mostrarDetalhes ? "Ocultar detalhes" : "Mostrar detalhes"}
          >
            {mostrarDetalhes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-3xl font-bold mb-1">{formatarMoeda(custo.total)}</div>

        <div className="flex items-center gap-4 text-sm text-green-100">
          <span>Margem: {custo.margem.percentual}%</span>
          <span>•</span>
          <span>Prazo: {formatarTempo(tempoTotal_min)}</span>
        </div>
      </div>

      {/* Detalhes Expansíveis */}
      {mostrarDetalhes && (
        <>
          {/* Custo de Material */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900">Material</h4>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Chapas de Inox</span>
                <span className="font-semibold text-slate-900 font-mono">{formatarMoeda(custo.material.chapas)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Tubos e Perfis</span>
                <span className="font-semibold text-slate-900 font-mono">{formatarMoeda(custo.material.tubos)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Outros Componentes</span>
                <span className="font-semibold text-slate-900 font-mono">{formatarMoeda(custo.material.outros)}</span>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-slate-900">Subtotal Material</span>
                <span className="font-bold text-sky-700 text-lg font-mono">{formatarMoeda(custo.material.total)}</span>
              </div>
            </div>
          </div>

          {/* Custo de Mão de Obra */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900">Mão de Obra</h4>
            </div>

            <div className="space-y-2.5">
              {custo.maoDeObra.corte.tempo_min > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Corte</span>
                    <span className="text-xs text-slate-400">({formatarTempo(custo.maoDeObra.corte.tempo_min)})</span>
                  </div>
                  <span className="font-semibold text-slate-900 font-mono">{formatarMoeda(custo.maoDeObra.corte.custo)}</span>
                </div>
              )}

              {custo.maoDeObra.solda.tempo_min > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Solda</span>
                    <span className="text-xs text-slate-400">({formatarTempo(custo.maoDeObra.solda.tempo_min)})</span>
                  </div>
                  <span className="font-semibold text-slate-900 font-mono">{formatarMoeda(custo.maoDeObra.solda.custo)}</span>
                </div>
              )}

              {custo.maoDeObra.polimento.tempo_min > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Polimento</span>
                    <span className="text-xs text-slate-400">({formatarTempo(custo.maoDeObra.polimento.tempo_min)})</span>
                  </div>
                  <span className="font-semibold text-slate-900 font-mono">{formatarMoeda(custo.maoDeObra.polimento.custo)}</span>
                </div>
              )}

              {custo.maoDeObra.dobra.tempo_min > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Dobra/Vincagem</span>
                    <span className="text-xs text-slate-400">({formatarTempo(custo.maoDeObra.dobra.tempo_min)})</span>
                  </div>
                  <span className="font-semibold text-slate-900 font-mono">{formatarMoeda(custo.maoDeObra.dobra.custo)}</span>
                </div>
              )}

              <div className="pt-2.5 mt-2.5 border-t border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Subtotal M.O.</span>
                  <span className="text-xs text-slate-500">({formatarTempo(tempoTotal_min)})</span>
                </div>
                <span className="font-bold text-purple-700 text-lg font-mono">{formatarMoeda(custo.maoDeObra.total)}</span>
              </div>
            </div>
          </div>

          {/* Resumo Final */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-slate-700" />
              <h4 className="font-semibold text-slate-900">Composição do Preço</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-700">Subtotal (Material + M.O.)</span>
                <span className="font-semibold text-slate-900 font-mono">{formatarMoeda(custo.subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-700">Margem de Lucro ({custo.margem.percentual}%)</span>
                <span className="font-semibold text-green-700 font-mono">+ {formatarMoeda(custo.margem.valor)}</span>
              </div>

              {custo.custoFixo > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">Custo Fixo</span>
                  <span className="font-semibold text-slate-900 font-mono">+ {formatarMoeda(custo.custoFixo)}</span>
                </div>
              )}

              <div className="pt-3 mt-3 border-t-2 border-slate-300 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-lg">TOTAL</span>
                <span className="font-bold text-green-700 text-2xl font-mono">{formatarMoeda(custo.total)}</span>
              </div>
            </div>
          </div>

          {/* Botão Configurar Preços */}
          {onEditarPrecos && (
            <button
              onClick={onEditarPrecos}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-sm font-semibold text-slate-700 hover:text-sky-700"
            >
              <Settings className="w-4 h-4" />
              Configurar Tabela de Preços
            </button>
          )}
        </>
      )}
    </div>
  );
}
