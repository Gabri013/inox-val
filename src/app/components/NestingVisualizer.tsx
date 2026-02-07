/**
 * VISUALIZADOR DE NESTING PROFISSIONAL
 * Com legenda colorida e seleção de chapa
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Download, Settings, Maximize2 } from "lucide-react";
import type { GrupoResultado, CATALOGO_CHAPAS, ChapasPadrao } from "../lib/nestingProfissional";
import { CATALOGO_CHAPAS as CATALOGO } from "../lib/nestingProfissional";

interface Props {
  grupo: GrupoResultado;
}

export function NestingVisualizer({ grupo }: Props) {
  const [chapaAtual, setChapaAtual] = useState(0);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(grupo.chosenSheet.label);

  const chapa = grupo.sheetsUsed[chapaAtual];
  const margem = grupo.params.margem_mm;

  // Agrupar peças por categoria para legenda
  const legendaMap = new Map<string, { label: string; cor: string; qtd: number }>();

  for (const chapaUsada of grupo.sheetsUsed) {
    for (const placement of chapaUsada.placements) {
      const key = placement.label;
      if (!legendaMap.has(key)) {
        legendaMap.set(key, {
          label: placement.label,
          cor: placement.cor || "#6b7280",
          qtd: 0,
        });
      }
      legendaMap.get(key)!.qtd++;
    }
  }

  const legendaItens = Array.from(legendaMap.values()).sort((a, b) => a.label.localeCompare(b.label));

  const handleChangeTamanho = (label: string) => {
    setTamanhoSelecionado(label);
    // TODO: Implementar recálculo do nesting com nova chapa
    alert(`Recalcular nesting com chapa ${label} - Em breve!`);
  };

  return (
    <div className="space-y-4">
      {/* Header com Info do Grupo */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900">
              {grupo.material} · {grupo.esp_mm}mm · {grupo.acabamento}
            </h3>
            <p className="text-sm text-slate-600">
              Chapa {grupo.chosenSheet.label} · {grupo.totals.sheetCount} unidade(s)
            </p>
          </div>
          <button
            onClick={() => setMostrarConfig(!mostrarConfig)}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            title="Configurações"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Seleção de Tamanho de Chapa */}
        {mostrarConfig && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-slate-300 pt-3 mt-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tamanho da Chapa (Automático ou Manual)</label>
            <select
              value={tamanhoSelecionado}
              onChange={(e) => handleChangeTamanho(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
            >
              {CATALOGO.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}mm {c.label === grupo.chosenSheet.label && "(atual)"}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              O sistema escolhe automaticamente o tamanho que minimiza desperdício. Você pode forçar um tamanho específico aqui.
            </p>
          </motion.div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-xs text-slate-600 mb-1">Área Peças</div>
            <div className="text-lg font-bold text-slate-900">{grupo.totals.partsArea_m2.toFixed(3)}m²</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-xs text-slate-600 mb-1">Área Total</div>
            <div className="text-lg font-bold text-slate-900">
              {(grupo.totals.sheetCount * grupo.totals.sheetArea_m2).toFixed(3)}m²
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-xs text-slate-600 mb-1">Eficiência</div>
            <div className="text-lg font-bold text-green-600">{grupo.totals.utilization.toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-xs text-slate-600 mb-1">Peso Total</div>
            <div className="text-lg font-bold text-slate-900">{grupo.totals.peso_kg.toFixed(1)}kg</div>
          </div>
        </div>
      </div>

      {/* Navegação entre Chapas */}
      {grupo.sheetsUsed.length > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChapaAtual(Math.max(0, chapaAtual - 1))}
            disabled={chapaAtual === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <div className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-slate-900 text-sm">
            {chapaAtual + 1} / {grupo.sheetsUsed.length}
          </div>
          <button
            onClick={() => setChapaAtual(Math.min(grupo.sheetsUsed.length - 1, chapaAtual + 1))}
            disabled={chapaAtual === grupo.sheetsUsed.length - 1}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Canvas de Visualização */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="bg-slate-800 rounded-lg p-4 overflow-auto">
          <ChapaCanvas chapa={chapa} margem={margem} />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="space-y-1">
            <div className="text-slate-600">
              Tamanho: <span className="font-semibold text-slate-900">{chapa.w_mm}×{chapa.h_mm}mm</span>
            </div>
            <div className="text-slate-600">
              Peças encaixadas: <span className="font-semibold text-slate-900">{chapa.placements.length}</span>
            </div>
            <div className="text-slate-600">
              Aproveitamento: <span className="font-semibold text-green-600">{chapa.utilizacao.toFixed(1)}%</span>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
            <Download className="w-4 h-4" />
            Exportar DXF
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Maximize2 className="w-4 h-4" />
          Legenda de Peças
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {legendaItens.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: item.cor }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{item.label}</div>
                <div className="text-xs text-slate-600">Qtd: {item.qtd}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Canvas SVG
function ChapaCanvas({ chapa, margem }: { chapa: any; margem: number }) {
  const scale = 0.2;
  const width = chapa.w_mm * scale;
  const height = chapa.h_mm * scale;

  return (
    <svg width="100%" height="auto" viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {/* Fundo da chapa */}
      <rect x={0} y={0} width={width} height={height} fill="#1e293b" stroke="#475569" strokeWidth={2} rx={4} />

      {/* Margem (área não utilizável) */}
      <rect
        x={margem * scale}
        y={margem * scale}
        width={(chapa.w_mm - 2 * margem) * scale}
        height={(chapa.h_mm - 2 * margem) * scale}
        fill="none"
        stroke="#64748b"
        strokeWidth={1}
        strokeDasharray="4 2"
      />

      {/* Peças */}
      {chapa.placements.map((peca: any, i: number) => {
        const x = (peca.x_mm + margem) * scale;
        const y = (peca.y_mm + margem) * scale;
        const w = peca.w_mm * scale;
        const h = peca.h_mm * scale;

        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={peca.cor || "#6b7280"} fillOpacity={0.85} stroke="white" strokeWidth={1.5} rx={2} />
            <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={Math.max(8, Math.min(w, h) * 0.15)} fontWeight="bold">
              {i + 1}
            </text>
            {peca.rotated && (
              <text x={x + 4} y={y + 12} fill="white" fontSize={8} fontWeight="bold">
                ↻
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
