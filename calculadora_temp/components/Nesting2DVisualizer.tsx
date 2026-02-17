/**
 * ============================================================================
 * VISUALIZADOR DE NESTING 2D - MÚLTIPLAS CHAPAS
 * ============================================================================
 * 
 * Desenha o layout real das peças posicionadas em cada chapa.
 * Suporta múltiplas chapas (Chapa 1, Chapa 2, Chapa 3, ...)
 * 
 * CARACTERÍSTICAS:
 * - Desenha blank (peças) posicionados nas chapas
 * - Navegação entre chapas (tabs)
 * - Zoom e Pan
 * - Cores por tipo de peça
 * - Indicador de rotação
 * - Estatísticas por chapa
 * ============================================================================
 */

import { useRef, useEffect, useState } from 'react';
import { Maximize2, TrendingUp, Layers, ZoomIn, ZoomOut, Move, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import type { ResultadoNesting as ResultadoNestingBase } from '../types';

type ResultadoNesting = ResultadoNestingBase & {
  chapas?: Array<{
    numero: number;
    chapa: { largura: number; altura: number };
    pecas: Array<{
      id?: string;
      x: number;
      y: number;
      largura: number;
      altura: number;
      rotacionada?: boolean;
      label?: string;
    }>;
    aproveitamentoPct: number;
    sobra: number;
  }>;
  totalChapasUsadas?: number;
  aproveitamentoMedio?: number;
  areaUtilizadaTotal?: number;
  areaTotalChapas?: number;
  sobraTotal?: number;
  melhorOpcao?: string;
};

interface Nesting2DVisualizerProps {
  resultado: ResultadoNesting;
}

export function Nesting2DVisualizer({ resultado }: Nesting2DVisualizerProps) {
  const [chapaAtual, setChapaAtual] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const chapas = resultado.chapas || [];
  const chapa = chapas[chapaAtual];

  // Controles de zoom e pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.3, Math.min(5, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(5, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.3, prev / 1.2));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePrevChapa = () => {
    setChapaAtual((prev) => Math.max(0, prev - 1));
  };

  const handleNextChapa = () => {
    setChapaAtual((prev) => Math.min(chapas.length - 1, prev + 1));
  };

  // Cores por tipo de peça
  const getCor = (label?: string): string => {
    if (!label) return '#6b7280';
    
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('tampo') || labelLower.includes('blank')) return '#3b82f6'; // Azul
    if (labelLower.includes('espelho') || labelLower.includes('traseiro')) return '#ef4444'; // Vermelho
    if (labelLower.includes('reforço') || labelLower.includes('reforco')) return '#f59e0b'; // Laranja
    if (labelLower.includes('prateleira')) return '#06b6d4'; // Ciano
    if (labelLower.includes('borda')) return '#ec4899'; // Rosa
    if (labelLower.includes('casquilho')) return '#6366f1'; // Índigo
    
    return '#10b981'; // Verde (padrão)
  };

  // Desenhar chapa no canvas
  useEffect(() => {
    if (!canvasRef.current || !chapa) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensões da chapa (mm)
    const chapaLargura = chapa.chapa.largura;
    const chapaAltura = chapa.chapa.altura;

    // Calcular escala base para caber no canvas
    const maxWidth = 900;
    const maxHeight = 600;
    const baseScale = Math.min(
      maxWidth / chapaLargura,
      maxHeight / chapaAltura
    );

    canvas.width = chapaLargura * baseScale;
    canvas.height = chapaAltura * baseScale;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplicar transformações (zoom + pan)
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Desenhar fundo da chapa
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar borda da chapa
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3 / zoom;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Desenhar peças
    chapa.pecas.forEach((peca) => {
      const x = peca.x * baseScale;
      const y = peca.y * baseScale;
      const w = peca.largura * baseScale;
      const h = peca.altura * baseScale;

      const cor = getCor(peca.label);

      // Preencher peça
      ctx.fillStyle = cor + '50'; // 50 = transparência
      ctx.fillRect(x, y, w, h);

      // Borda da peça
      ctx.strokeStyle = cor;
      ctx.lineWidth = 2 / zoom;
      ctx.strokeRect(x, y, w, h);

      // Label da peça (se couber)
      if (w > 50 && h > 30) {
        ctx.fillStyle = '#1f2937';
        ctx.font = `bold ${11 / zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const label = peca.label || 'Peça';
        const rotacao = peca.rotacionada ? ' ⟲' : '';
        const texto = `${label}${rotacao}`;
        const dimensoes = `${peca.largura.toFixed(0)}×${peca.altura.toFixed(0)}`;

        // Fundo branco para legibilidade
        const textWidth = Math.max(
          ctx.measureText(texto).width,
          ctx.measureText(dimensoes).width
        );
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
          x + w / 2 - textWidth / 2 - 4,
          y + h / 2 - 14,
          textWidth + 8,
          28
        );

        // Texto
        ctx.fillStyle = '#1f2937';
        ctx.font = `bold ${11 / zoom}px sans-serif`;
        ctx.fillText(texto, x + w / 2, y + h / 2 - 6);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = `${9 / zoom}px sans-serif`;
        ctx.fillText(dimensoes, x + w / 2, y + h / 2 + 8);
      }
    });

    // Dimensões da chapa (canto superior direito)
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${14 / zoom}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `${chapaLargura} × ${chapaAltura} mm`,
      canvas.width - 10,
      10
    );

    ctx.restore();

  }, [chapa, zoom, pan]);

  // Resetar zoom/pan ao trocar de chapa
  useEffect(() => {
    handleReset();
  }, [chapaAtual]);

  if (!chapas || chapas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nesting 2D</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma chapa para exibir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Maximize2 className="w-5 h-5 text-purple-600" />
          Nesting 2D - Layout Real das Chapas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">
                Total Chapas
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {resultado.totalChapasUsadas ?? chapas.length}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {resultado.melhorOpcao ?? "Melhor opcao"}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-900">
                Aproveitamento
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {(resultado.aproveitamentoMedio ?? 0).toFixed(1)}%
            </p>
            <p className="text-xs text-green-700 mt-1">
              Média geral
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <Maximize2 className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-900">
                Área Utilizada
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {(resultado.areaUtilizadaTotal ?? 0).toFixed(2)} m²
            </p>
            <p className="text-xs text-purple-700 mt-1">
              De {(resultado.areaTotalChapas ?? 0).toFixed(2)} m²
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <Maximize2 className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-900">
                Sobra
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {(resultado.sobraTotal ?? 0).toFixed(2)} m²
            </p>
            <p className="text-xs text-orange-700 mt-1">
              {(100 - (resultado.aproveitamentoMedio ?? 0)).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Navegação entre Chapas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrevChapa}
              disabled={chapaAtual === 0}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Chapa {chapa.numero} de {(resultado.totalChapasUsadas ?? chapas.length)}
            </Badge>
            
            <Button
              onClick={handleNextChapa}
              disabled={chapaAtual === chapas.length - 1}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Estatísticas da Chapa Atual */}
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Peças:</span>{' '}
              <span className="font-bold">{chapa.pecas.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Aproveitamento:</span>{' '}
              <span className="font-bold text-green-600">
                {chapa.aproveitamentoPct.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Sobra:</span>{' '}
              <span className="font-bold text-orange-600">
                {chapa.sobra.toFixed(2)} m²
              </span>
            </div>
          </div>
        </div>

        {/* Controles de Zoom */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleZoomIn}
            variant="outline"
            size="sm"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleZoomOut}
            variant="outline"
            size="sm"
            title="Diminuir zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            title="Resetar visualização"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Move className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Arraste para mover | Scroll para zoom
            </span>
          </div>
          <Badge variant="secondary" className="ml-2">
            {(zoom * 100).toFixed(0)}%
          </Badge>
        </div>

        {/* Canvas */}
        <div
          className="border rounded-md overflow-hidden bg-white cursor-move"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Lista de Peças da Chapa Atual */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">
            Peças Alocadas na Chapa {chapa.numero}:
          </h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {chapa.pecas.map((peca, idx) => (
              <div
                key={(peca as any).id || `${chapa.numero}-${idx}`}
                className="text-xs flex justify-between items-center py-2 px-3 hover:bg-accent rounded"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getCor(peca.label) }}
                  />
                  <span className="font-medium">
                    {idx + 1}. {peca.label || 'Peça'}
                  </span>
                  {peca.rotacionada && (
                    <Badge variant="secondary" className="text-xs">
                      Rotacionada ⟲
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {peca.largura.toFixed(0)} × {peca.altura.toFixed(0)} mm
                  <span className="ml-2 text-muted-foreground/70">
                    @ ({peca.x.toFixed(0)}, {peca.y.toFixed(0)})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="pt-4 border-t space-y-2">
          <h3 className="text-sm font-medium">Legenda de Cores:</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Tampo/Blank</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Reforço</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Espelho/Traseiro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Prateleira</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Borda</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Outros</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ⟲ indica peça rotacionada 90°
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
