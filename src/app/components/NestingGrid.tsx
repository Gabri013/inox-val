/**
 * VISUALIZADOR GRID DE CHAPAS
 * Mostra todas as chapas em miniaturas com navegação
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Package } from "lucide-react";
import type { GrupoResultado, ChapaResultado } from "../lib/nestingProfissional";

interface Props {
  grupo: GrupoResultado;
  chapaAtiva?: number;
  onSelecionarChapa?: (index: number) => void;
}

export function NestingGrid({ grupo, chapaAtiva = 0, onSelecionarChapa }: Props) {
  const [modoGrid, setModoGrid] = useState(true);
  const [chapaExpandida, setChapaExpandida] = useState(chapaAtiva);

  const chapas = grupo.sheetsUsed;

  const handleSelecionarChapa = (index: number) => {
    setChapaExpandida(index);
    onSelecionarChapa?.(index);
  };

  const proxima = () => {
    if (chapaExpandida < chapas.length - 1) {
      handleSelecionarChapa(chapaExpandida + 1);
    }
  };

  const anterior = () => {
    if (chapaExpandida > 0) {
      handleSelecionarChapa(chapaExpandida - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            {grupo.material} · {grupo.esp_mm}mm · {grupo.acabamento}
          </h3>
          <p className="text-sm text-slate-600">
            {chapas.length} {chapas.length === 1 ? "chapa" : "chapas"} · {grupo.chosenSheet.label}
          </p>
        </div>

        <button
          onClick={() => setModoGrid(!modoGrid)}
          className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-sm font-semibold"
        >
          {modoGrid ? <Maximize2 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
          {modoGrid ? "Expandir" : "Grid"}
        </button>
      </div>

      {/* Modo Grid - Miniaturas */}
      {modoGrid ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {chapas.map((chapa, idx) => (
            <button
              key={idx}
              onClick={() => {
                setModoGrid(false);
                handleSelecionarChapa(idx);
              }}
              className={`group relative bg-white border-2 rounded-lg p-3 transition-all ${
                idx === chapaExpandida ? "border-sky-500 shadow-md" : "border-slate-200 hover:border-sky-300 hover:shadow-sm"
              }`}
            >
              {/* Miniatura */}
              <div className="aspect-[4/3] bg-slate-50 rounded-lg overflow-hidden mb-2 relative">
                <MiniaturaNesting chapa={chapa} />

                {/* Badge de Eficiência */}
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                    chapa.utilizacao >= 80
                      ? "bg-green-600 text-white"
                      : chapa.utilizacao >= 60
                      ? "bg-amber-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {chapa.utilizacao.toFixed(0)}%
                </div>
              </div>

              {/* Info */}
              <div className="text-left">
                <div className="font-semibold text-slate-900 text-sm mb-1">Chapa {idx + 1}</div>
                <div className="text-xs text-slate-600">
                  {chapa.placements.length} {chapa.placements.length === 1 ? "peça" : "peças"}
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-sky-600/0 group-hover:bg-sky-600/5 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white rounded-lg px-3 py-1.5 shadow-lg">
                  <span className="text-xs font-semibold text-sky-700">Click para expandir</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Modo Expandido - Chapa Grande */
        <div className="space-y-4">
          {/* Navegação */}
          <div className="flex items-center justify-between bg-slate-100 rounded-lg p-3">
            <button
              onClick={anterior}
              disabled={chapaExpandida === 0}
              className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div className="text-center">
              <div className="font-bold text-slate-900">
                Chapa {chapaExpandida + 1} de {chapas.length}
              </div>
              <div className="text-sm text-slate-600">
                {chapas[chapaExpandida].placements.length} peças · {chapas[chapaExpandida].utilization.toFixed(1)}% eficiência
              </div>
            </div>

            <button
              onClick={proxima}
              disabled={chapaExpandida === chapas.length - 1}
              className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Visualização da Chapa */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
            <ChapaExpandida chapa={chapas[chapaExpandida]} grupo={grupo} />
          </div>

          {/* Lista de Peças */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
            <h4 className="font-semibold text-slate-900 mb-3">
              Peças nesta chapa ({chapas[chapaExpandida].placements.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chapas[chapaExpandida].placements.map((placement, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: placement.cor }} />
                  <span className="flex-1 text-slate-900 font-medium truncate">{placement.label}</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {placement.w_mm.toFixed(0)}×{placement.h_mm.toFixed(0)}
                  </span>
                  {placement.rotated && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">90°</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== MINIATURA ==========

function MiniaturaNesting({ chapa }: { chapa: ChapaResultado }) {
  const margin = 4;
  const scale = 0.05; // Escala reduzida para miniatura

  const viewW = chapa.sheet_w_mm * scale + margin * 2;
  const viewH = chapa.sheet_h_mm * scale + margin * 2;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-full" style={{ background: "#f8fafc" }}>
      {/* Chapa */}
      <rect
        x={margin}
        y={margin}
        width={chapa.sheet_w_mm * scale}
        height={chapa.sheet_h_mm * scale}
        fill="white"
        stroke="#cbd5e1"
        strokeWidth="0.5"
      />

      {/* Peças */}
      {chapa.placements.map((p, i) => (
        <rect
          key={i}
          x={margin + p.x_mm * scale}
          y={margin + p.y_mm * scale}
          width={p.w_mm * scale}
          height={p.h_mm * scale}
          fill={p.cor}
          stroke="#1e293b"
          strokeWidth="0.3"
          opacity="0.9"
        />
      ))}
    </svg>
  );
}

// ========== CHAPA EXPANDIDA ==========

function ChapaExpandida({ chapa, grupo }: { chapa: ChapaResultado; grupo: GrupoNesting }) {
  const margin = 20;
  const maxW = 800;
  const scale = Math.min(maxW / chapa.sheet_w_mm, 0.4);

  const viewW = chapa.sheet_w_mm * scale + margin * 2;
  const viewH = chapa.sheet_h_mm * scale + margin * 2;

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Dimensões</div>
          <div className="font-semibold text-slate-900 font-mono">
            {chapa.sheet_w_mm}×{chapa.sheet_h_mm}mm
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Área Total</div>
          <div className="font-semibold text-slate-900">
            {(chapa.sheet_w_mm * chapa.sheet_h_mm / 1_000_000).toFixed(2)}m²
          </div>
        </div>
        <div
          className={`rounded-lg p-3 ${
            chapa.utilization >= 80 ? "bg-green-50" : chapa.utilization >= 60 ? "bg-amber-50" : "bg-red-50"
          }`}
        >
          <div className="text-xs text-slate-500 mb-1">Eficiência</div>
          <div
            className={`font-bold text-lg ${
              chapa.utilization >= 80 ? "text-green-700" : chapa.utilization >= 60 ? "text-amber-700" : "text-red-700"
            }`}
          >
            {chapa.utilization.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* SVG */}
      <div className="flex justify-center">
        <svg viewBox={`0 0 ${viewW} ${viewH}`} className="max-w-full" style={{ maxHeight: "500px" }}>
          {/* Chapa */}
          <rect
            x={margin}
            y={margin}
            width={chapa.sheet_w_mm * scale}
            height={chapa.sheet_h_mm * scale}
            fill="white"
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Peças */}
          {chapa.placements.map((p, i) => (
            <g key={i}>
              <rect
                x={margin + p.x_mm * scale}
                y={margin + p.y_mm * scale}
                width={p.w_mm * scale}
                height={p.h_mm * scale}
                fill={p.cor}
                stroke="#1e293b"
                strokeWidth="1.5"
                opacity="0.85"
              />

              {/* Label */}
              {p.w_mm * scale > 30 && p.h_mm * scale > 20 && (
                <text
                  x={margin + p.x_mm * scale + (p.w_mm * scale) / 2}
                  y={margin + p.y_mm * scale + (p.h_mm * scale) / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#1e293b"
                  fontSize="10"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {p.label.length > 15 ? p.label.substring(0, 12) + "..." : p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
