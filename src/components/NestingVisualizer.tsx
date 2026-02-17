/**
 * ============================================================================
 * VISUALIZADOR DE NESTING 2D
 * ============================================================================
 * Componente React para visualizar o resultado do nesting graficamente
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { ResultadoNesting, ChapaAlocada } from '@/domains/orcamento/engine';

interface NestingVisualizerProps {
  nesting: ResultadoNesting[];
}

export default function NestingVisualizer({ nesting }: NestingVisualizerProps) {
  const [grupoSelecionado, setGrupoSelecionado] = useState(0);
  const [chapaSelecionada, setChapaSelecionada] = useState(0);
  const [zoom, setZoom] = useState(1);

  if (nesting.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum resultado de nesting disponível
        </CardContent>
      </Card>
    );
  }

  const grupoAtual = nesting[grupoSelecionado];
  const chapaAtual = grupoAtual.chapas[chapaSelecionada];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Visualização de Nesting 2D</CardTitle>
            <CardDescription>
              {grupoAtual.familia} - {grupoAtual.tipoInox} {grupoAtual.espessuraMm}mm
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-mono">{(zoom * 100).toFixed(0)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* SELETOR DE GRUPOS */}
        {nesting.length > 1 && (
          <Tabs value={grupoSelecionado.toString()} onValueChange={(v) => {
            setGrupoSelecionado(Number(v));
            setChapaSelecionada(0);
          }}>
            <TabsList className="mb-4">
              {nesting.map((grupo, idx) => (
                <TabsTrigger key={idx} value={idx.toString()}>
                  {grupo.familia} {grupo.espessuraMm}mm
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* NAVEGAÇÃO DE CHAPAS */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChapaSelecionada(Math.max(0, chapaSelecionada - 1))}
            disabled={chapaSelecionada === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <div className="flex items-center gap-3">
            <Badge variant="outline">
              Chapa {chapaSelecionada + 1} de {grupoAtual.totalChapas}
            </Badge>
            <Badge variant="secondary">
              {chapaAtual.aproveitamento.toFixed(1)}% aproveitamento
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setChapaSelecionada(Math.min(grupoAtual.totalChapas - 1, chapaSelecionada + 1))}
            disabled={chapaSelecionada === grupoAtual.totalChapas - 1}
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* CANVAS DE VISUALIZAÇÃO */}
        <div className="border rounded-lg p-4 bg-muted/30 overflow-auto">
          <ChapaCanvas chapa={chapaAtual} zoom={zoom} />
        </div>

        {/* LEGENDA */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Peças Alocadas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {chapaAtual.itens.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-4 h-4 rounded border-2"
                  style={{ 
                    backgroundColor: getColorForIndex(idx),
                    borderColor: '#000'
                  }}
                />
                <span>
                  {item.descricao} ({item.largura}×{item.altura}mm)
                  {item.rotacionada && <Badge variant="outline" className="ml-1">↻</Badge>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ESTATÍSTICAS */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-3 bg-muted rounded">
            <div className="text-sm text-muted-foreground">Área Utilizada</div>
            <div className="font-semibold">{chapaAtual.areaUtilizada.toFixed(2)} m²</div>
          </div>
          <div className="p-3 bg-muted rounded">
            <div className="text-sm text-muted-foreground">Área Total</div>
            <div className="font-semibold">{chapaAtual.areaTotal.toFixed(2)} m²</div>
          </div>
          <div className="p-3 bg-muted rounded">
            <div className="text-sm text-muted-foreground">Aproveitamento</div>
            <div className="font-semibold">{chapaAtual.aproveitamento.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CANVAS DE CHAPA
// ============================================================================

function ChapaCanvas({ chapa, zoom }: { chapa: ChapaAlocada; zoom: number }) {
  const escala = 0.3 * zoom;
  const larguraCanvas = chapa.chapa.largura * escala;
  const alturaCanvas = chapa.chapa.altura * escala;

  return (
    <svg
      width={larguraCanvas}
      height={alturaCanvas}
      style={{ maxWidth: '100%', height: 'auto' }}
      className="mx-auto"
    >
      {/* CHAPA BASE */}
      <rect
        x={0}
        y={0}
        width={larguraCanvas}
        height={alturaCanvas}
        fill="#f5f5f5"
        stroke="#666"
        strokeWidth={2}
      />

      {/* GRID */}
      {Array.from({ length: Math.floor(chapa.chapa.largura / 100) }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={(i * 100) * escala}
          y1={0}
          x2={(i * 100) * escala}
          y2={alturaCanvas}
          stroke="#ddd"
          strokeWidth={1}
          strokeDasharray="4"
        />
      ))}
      {Array.from({ length: Math.floor(chapa.chapa.altura / 100) }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={(i * 100) * escala}
          x2={larguraCanvas}
          y2={(i * 100) * escala}
          stroke="#ddd"
          strokeWidth={1}
          strokeDasharray="4"
        />
      ))}

      {/* PEÇAS ALOCADAS */}
      {chapa.itens.map((item, idx) => {
        const x = item.x * escala;
        const y = item.y * escala;
        const w = item.largura * escala;
        const h = item.altura * escala;
        const cor = getColorForIndex(idx);

        return (
          <g key={idx}>
            {/* RETÂNGULO DA PEÇA */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={cor}
              stroke="#000"
              strokeWidth={2}
              opacity={0.7}
            />

            {/* TEXTO COM DIMENSÕES */}
            {w > 30 && h > 20 && (
              <>
                <text
                  x={x + w / 2}
                  y={y + h / 2 - 5}
                  textAnchor="middle"
                  fontSize={Math.min(12, w / 10, h / 5)}
                  fill="#000"
                  fontWeight="bold"
                >
                  {item.largura}×{item.altura}
                </text>
                {item.rotacionada && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 10}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#000"
                  >
                    ↻ Rotacionada
                  </text>
                )}
              </>
            )}

            {/* ÍCONE DE ROTAÇÃO */}
            {item.rotacionada && w > 20 && h > 20 && (
              <circle
                cx={x + 10}
                cy={y + 10}
                r={6}
                fill="#fff"
                stroke="#000"
                strokeWidth={1}
              />
            )}
          </g>
        );
      })}

      {/* DIMENSÕES DA CHAPA */}
      <text
        x={larguraCanvas / 2}
        y={alturaCanvas + 20}
        textAnchor="middle"
        fontSize={14}
        fill="#666"
        fontWeight="bold"
      >
        {chapa.chapa.label}
      </text>
    </svg>
  );
}

// ============================================================================
// UTILIDADES
// ============================================================================

const cores = [
  '#3b82f6', // azul
  '#10b981', // verde
  '#f59e0b', // laranja
  '#ef4444', // vermelho
  '#8b5cf6', // roxo
  '#ec4899', // rosa
  '#14b8a6', // teal
  '#f97316', // laranja escuro
  '#6366f1', // indigo
  '#84cc16', // lima
];

function getColorForIndex(idx: number): string {
  return cores[idx % cores.length];
}

// ============================================================================
// EXPORTAR COMO IMAGEM
// ============================================================================

export function exportarNestingPNG(nesting: ResultadoNesting, chapaIdx: number = 0) {
  // TODO: Implementar exportação para PNG usando canvas
  console.log('Exportar nesting para PNG', nesting, chapaIdx);
}

export function exportarNestingDXF(nesting: ResultadoNesting) {
  // TODO: Implementar exportação para DXF (CAD)
  console.log('Exportar nesting para DXF', nesting);
}
