import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PecaNesting {
  desc: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
  rotacionada?: boolean;
}

export interface ChapaNesting {
  nome: string;
  comprimento: number;
  largura: number;
  pecas: PecaNesting[];
}

interface NestingCanvasProps {
  chapas: ChapaNesting[];
  width?: number;
  height?: number;
}

export const NestingCanvas: React.FC<NestingCanvasProps> = ({ chapas, width = 800, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chapaAtual, setChapaAtual] = useState(0);

  // Paleta de cores melhorada e mais vibrante
  const getPaleta = (tipo: string) => {
    const paletas: Record<string, any> = {
      "Tampo": { 
        stroke: "#dc2626", 
        fill: "#fca5a5", 
        shadow: "rgba(220, 38, 38, 0.3)",
        label: "#7f1d1d"
      },
      "Encosto": { 
        stroke: "#ea580c", 
        fill: "#fdba74", 
        shadow: "rgba(234, 88, 12, 0.3)",
        label: "#7c2d12"
      },
      "Perna": { 
        stroke: "#0891b2", 
        fill: "#67e8f9", 
        shadow: "rgba(8, 145, 178, 0.3)",
        label: "#164e63"
      },
      "Travessa": { 
        stroke: "#7c3aed", 
        fill: "#c4b5fd", 
        shadow: "rgba(124, 58, 237, 0.3)",
        label: "#4c1d95"
      },
      "Contraventamento": { 
        stroke: "#16a34a", 
        fill: "#86efac", 
        shadow: "rgba(22, 163, 74, 0.3)",
        label: "#14532d"
      },
    };

    for (const key in paletas) {
      if (tipo.includes(key)) return paletas[key];
    }

    // Cores padrão vibrantes alternadas
    const defaultColors = [
      { stroke: "#ec4899", fill: "#f9a8d4", shadow: "rgba(236, 72, 153, 0.3)", label: "#831843" },
      { stroke: "#f59e0b", fill: "#fcd34d", shadow: "rgba(245, 158, 11, 0.3)", label: "#78350f" },
      { stroke: "#8b5cf6", fill: "#c4b5fd", shadow: "rgba(139, 92, 246, 0.3)", label: "#4c1d95" },
      { stroke: "#10b981", fill: "#6ee7b7", shadow: "rgba(16, 185, 129, 0.3)", label: "#065f46" },
      { stroke: "#06b6d4", fill: "#67e8f9", shadow: "rgba(6, 182, 212, 0.3)", label: "#164e63" },
    ];
    
    return defaultColors[Math.abs(tipo.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % defaultColors.length];
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || chapas.length === 0) return;
    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const chapa = chapas[chapaAtual];
    
    // Calcular escala para uma única chapa centralizada
    const scale = Math.min(
      (width - 2 * padding) / chapa.largura,
      (height - 2 * padding) / chapa.comprimento,
      0.5
    );
    
    const chapaW = chapa.largura * scale;
    const chapaH = chapa.comprimento * scale;
    
    // Centralizar a chapa
    const xOffset = (width - chapaW) / 2;
    const yOffset = (height - chapaH) / 2;

    // Desenhar grid de fundo na chapa para referência
    ctx.save();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    const gridSize = 100 * scale;
    
    for (let x = xOffset; x <= xOffset + chapaW; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, yOffset);
      ctx.lineTo(x, yOffset + chapaH);
      ctx.stroke();
    }
    
    for (let y = yOffset; y <= yOffset + chapaH; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(xOffset, y);
      ctx.lineTo(xOffset + chapaW, y);
      ctx.stroke();
    }
    ctx.restore();

    // Desenhar chapa com borda mais destacada
    ctx.save();
    
    // Sombra externa da chapa
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    // Fundo da chapa com gradiente
    const gradient = ctx.createLinearGradient(xOffset, yOffset, xOffset, yOffset + chapaH);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = gradient;
    ctx.fillRect(xOffset, yOffset, chapaW, chapaH);
    
    ctx.shadowColor = "transparent";
    
    // Borda da chapa
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.strokeRect(xOffset, yOffset, chapaW, chapaH);
    
    // Label da chapa com fundo
    ctx.fillStyle = "rgba(37, 99, 235, 0.1)";
    ctx.fillRect(xOffset, yOffset, 200, 35);
    ctx.font = "600 14px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#1e40af";
    ctx.fillText(chapa.nome, xOffset + 12, yOffset + 22);
    
    ctx.restore();

    // Desenhar peças com visual melhorado
    chapa.pecas.forEach((peca) => {
      const x = typeof peca.x === "number" ? peca.x : 0;
      const y = typeof peca.y === "number" ? peca.y : 0;
      const hasPos = typeof peca.x === "number" && typeof peca.y === "number";
      const px = hasPos ? xOffset + x * scale : xOffset + 8;
      const py = hasPos ? yOffset + y * scale : yOffset + 40;
      const pw = peca.w * scale;
      const ph = peca.h * scale;
      
      ctx.save();
      
      // Obter cores baseadas no tipo de peça
      const paleta = getPaleta(peca.desc);
      
      // Sombra da peça para profundidade
      ctx.shadowColor = paleta.shadow;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;
      
      // Preenchimento com gradiente
      const pecaGradient = ctx.createLinearGradient(px, py, px, py + ph);
      pecaGradient.addColorStop(0, paleta.fill);
      pecaGradient.addColorStop(1, paleta.stroke + "40");
      ctx.fillStyle = pecaGradient;
      ctx.fillRect(px, py, pw, ph);
      
      ctx.shadowColor = "transparent";
      
      // Borda da peça mais grossa
      ctx.strokeStyle = paleta.stroke;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(px, py, pw, ph);
      
      // Borda interna clara para efeito 3D
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 1.5, py + 1.5, pw - 3, ph - 3);
      
      // Indicador de rotação (se aplicável)
      if (peca.rotacionada) {
        ctx.save();
        ctx.fillStyle = paleta.stroke;
        ctx.beginPath();
        ctx.moveTo(px + pw - 12, py + 5);
        ctx.lineTo(px + pw - 5, py + 5);
        ctx.lineTo(px + pw - 5, py + 12);
        ctx.fill();
        ctx.restore();
      }
      
      // Texto com fundo semi-transparente para legibilidade
      const minSize = 35;
      if (pw > minSize && ph > minSize) {
        ctx.font = "600 11px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const textMetrics = ctx.measureText(peca.desc);
        const textWidth = textMetrics.width;
        const textHeight = 16;
        
        // Fundo do texto
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(
          px + pw / 2 - textWidth / 2 - 4,
          py + ph / 2 - textHeight / 2 - 2,
          textWidth + 8,
          textHeight + 4
        );
        
        // Texto
        ctx.fillStyle = paleta.label;
        ctx.fillText(peca.desc, px + pw / 2, py + ph / 2);
        
        // Dimensões (se houver espaço)
        if (ph > 60) {
          ctx.font = "500 9px Inter, system-ui, sans-serif";
          ctx.fillStyle = paleta.label;
          ctx.globalAlpha = 0.7;
          ctx.fillText(`${peca.w}×${peca.h}mm`, px + pw / 2, py + ph / 2 + 12);
          ctx.globalAlpha = 1;
        }
      }
      
      ctx.restore();
    });
    ctx.restore();
  }, [chapas, chapaAtual, width, height]);

  const proximaChapa = () => {
    setChapaAtual((prev) => (prev + 1) % chapas.length);
  };

  const chapaAnterior = () => {
    setChapaAtual((prev) => (prev - 1 + chapas.length) % chapas.length);
  };

  return (
    <div className="space-y-4">
      {/* Navegação por Tabs */}
      {chapas.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {chapas.map((chapa, idx) => (
            <button
              key={idx}
              onClick={() => setChapaAtual(idx)}
              className={`
                flex-shrink-0 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                ${chapaAtual === idx 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span>Chapa {idx + 1}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${chapaAtual === idx ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}
                `}>
                  {chapa.pecas.length}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={width} 
          height={height} 
          className="bg-slate-50 rounded-lg border border-slate-200 shadow-sm w-full"
        />
        
        {/* Controles de navegação */}
        {chapas.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
            <button
              onClick={chapaAnterior}
              className="pointer-events-auto p-3 bg-white/90 hover:bg-white rounded-full shadow-lg border border-slate-200 transition-all hover:scale-110 disabled:opacity-50"
              disabled={chapaAtual === 0}
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={proximaChapa}
              className="pointer-events-auto p-3 bg-white/90 hover:bg-white rounded-full shadow-lg border border-slate-200 transition-all hover:scale-110 disabled:opacity-50"
              disabled={chapaAtual === chapas.length - 1}
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        )}
      </div>

      {/* Indicador de posição */}
      {chapas.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-slate-600">
            Chapa {chapaAtual + 1} de {chapas.length}
          </span>
          <span className="text-sm text-slate-400">•</span>
          <span className="text-sm font-medium text-slate-900">
            {chapas[chapaAtual].pecas.length} peças nesta chapa
          </span>
        </div>
      )}
    </div>
  );
};
