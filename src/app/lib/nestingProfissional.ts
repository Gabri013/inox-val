/**
 * SISTEMA DE NESTING PROFISSIONAL
 * MaxRects com regras industriais reais
 */

// ========== TIPOS ==========

export interface ChapasPadrao {
  w: number;
  h: number;
  label: string;
}

export const CATALOGO_CHAPAS: ChapasPadrao[] = [
  { w: 2000, h: 1000, label: "2000×1000" },
  { w: 2000, h: 1220, label: "2000×1220" },
  { w: 2000, h: 1250, label: "2000×1250" },
  { w: 2000, h: 1500, label: "2000×1500" },
  { w: 2500, h: 1250, label: "2500×1250" },
  { w: 3000, h: 1000, label: "3000×1000" },
  { w: 3000, h: 1220, label: "3000×1220" },
  { w: 3000, h: 1250, label: "3000×1250" },
  { w: 3000, h: 1500, label: "3000×1500" },
];

export type Acabamento = "POLIDO" | "ESCOVADO" | "2B";
export type Orientation = "FREE" | "ALONG_SHEET_LENGTH";

export interface PecaPlana {
  id: string;
  label: string;
  w_mm: number;
  h_mm: number;
  qtd: number;
  material: string;
  esp_mm: number;
  acabamento: Acabamento;
  orientation: Orientation;
  category?: string; // "TAMPO", "REFORCO_FRONTAL", etc
}

export interface PecaExpandida {
  id: string;
  label: string;
  w_mm: number;
  h_mm: number;
  material: string;
  esp_mm: number;
  acabamento: Acabamento;
  allowRotate: boolean;
  orientation: Orientation;
  category?: string;
  cor?: string; // Para legenda visual
}

export interface Placement {
  partId: string;
  label: string;
  x_mm: number;
  y_mm: number;
  w_mm: number;
  h_mm: number;
  rotated: boolean;
  category?: string;
  cor?: string;
}

export interface ChapaResultado {
  sheetIndex: number;
  w_mm: number;
  h_mm: number;
  sheet_w_mm?: number;
  sheet_h_mm?: number;
  placements: Placement[];
  utilizacao: number;
  utilization?: number;
}

export interface GrupoResultado {
  grupo: string; // "304-1.2-ESCOVADO"
  material: string;
  esp_mm: number;
  acabamento: Acabamento;
  chosenSheet: { w_mm: number; h_mm: number; label: string };
  params: { margem_mm: number; gap_mm: number };
  totals: {
    partsArea_m2: number;
    sheetArea_m2: number;
    sheetCount: number;
    utilization: number;
    waste_m2: number;
    peso_kg: number;
  };
  sheetsUsed: ChapaResultado[];
}

export interface ResultadoNesting {
  grupos: GrupoResultado[];
  resumo: {
    totalChapas: number;
    areaTotal_m2: number;
    areaPecas_m2: number;
    pesoTotal_kg: number;
    eficienciaMedia: number;
  };
}

// ========== PARÂMETROS ==========

const MARGEM_MM = 10;
const GAP_MM = 2;
const DENSIDADE_INOX = 8000; // kg/m³

// ========== CORES PARA LEGENDA ==========

const CORES_CATEGORIAS: Record<string, string> = {
  TAMPO: "#3b82f6", // azul
  ENCOSTO: "#8b5cf6", // roxo
  ESPELHO: "#ec4899", // rosa
  PRATELEIRA: "#14b8a6", // teal
  REFORCO: "#f59e0b", // amber
  PE: "#ef4444", // vermelho
  TUBO: "#6366f1", // indigo
  LATERAL: "#06b6d4", // cyan
  CUBA: "#10b981", // green
  QUEDA: "#f97316", // orange
};

function gerarCorCategoria(label: string, category?: string): string {
  if (category && CORES_CATEGORIAS[category]) {
    return CORES_CATEGORIAS[category];
  }

  // Fallback: gerar cor baseada no label
  const hash = label.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 55%)`;
}

// ========== EXPANSÃO DA BOM ==========

export function expandirPecasPlanas(pecas: PecaPlana[]): PecaExpandida[] {
  const expandidas: PecaExpandida[] = [];

  for (const peca of pecas) {
    // Normalizar orientação para TAMPO/REFORCO_FRONTAL
    let w_final = peca.w_mm;
    let h_final = peca.h_mm;

    // REGRA: Para tampos e reforços frontais, maior lado = comprimento (w_mm)
    if (peca.category === "TAMPO" || peca.category === "REFORCO") {
      if (peca.h_mm > peca.w_mm) {
        // Inverter para garantir w >= h
        w_final = peca.h_mm;
        h_final = peca.w_mm;
      }
    }

    // Determinar se pode rotacionar
    let allowRotate = peca.acabamento === "POLIDO" || peca.acabamento === "2B";

    // Orientação obrigatória sempre trava rotação
    if (peca.orientation === "ALONG_SHEET_LENGTH") {
      allowRotate = false;
    }

    // Gerar cor
    const cor = gerarCorCategoria(peca.label, peca.category);

    // Expandir qtd
    for (let i = 0; i < peca.qtd; i++) {
      expandidas.push({
        id: `${peca.id}_${i}`,
        label: peca.label,
        w_mm: w_final,
        h_mm: h_final,
        material: peca.material,
        esp_mm: peca.esp_mm,
        acabamento: peca.acabamento,
        allowRotate,
        orientation: peca.orientation,
        category: peca.category,
        cor,
      });
    }
  }

  return expandidas;
}

// ========== AGRUPAMENTO ==========

export function agruparPorMaterialEspAcabamento(pecas: PecaExpandida[]): Map<string, PecaExpandida[]> {
  const grupos = new Map<string, PecaExpandida[]>();

  for (const peca of pecas) {
    const chave = `${peca.material}-${peca.esp_mm}-${peca.acabamento}`;
    if (!grupos.has(chave)) {
      grupos.set(chave, []);
    }
    grupos.get(chave)!.push(peca);
  }

  return grupos;
}

// ========== MAXRECTS ALGORITHM ==========

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

class _MaxRectsPacker {
  private binW: number;
  private binH: number;
  private freeRects: Rect[] = [];

  constructor(binW: number, binH: number) {
    this.binW = binW;
    this.binH = binH;
    this.freeRects = [{ x: 0, y: 0, w: binW, h: binH }];
    void this.binW;
    void this.binH;
  }

  pack(w: number, h: number, allowRotate: boolean): { x: number; y: number; rotated: boolean } | null {
    let bestRect: { x: number; y: number; w: number; h: number; rotated: boolean } | null = null;
    let bestScore = Infinity;

    // Tentar orientação normal
    for (const free of this.freeRects) {
      if (w <= free.w && h <= free.h) {
        // BSSF: Best Short Side Fit (minimiza lado curto sobrando)
        const leftoverW = free.w - w;
        const leftoverH = free.h - h;
        const score = Math.min(leftoverW, leftoverH);

        if (score < bestScore) {
          bestScore = score;
          bestRect = { x: free.x, y: free.y, w, h, rotated: false };
        }
      }
    }

    // Tentar rotação 90°
    if (allowRotate && w !== h) {
      // Só rotacionar se não for quadrado
      for (const free of this.freeRects) {
        if (h <= free.w && w <= free.h) {
          const leftoverW = free.w - h;
          const leftoverH = free.h - w;
          const score = Math.min(leftoverW, leftoverH);

          if (score < bestScore) {
            bestScore = score;
            bestRect = { x: free.x, y: free.y, w: h, h: w, rotated: true };
          }
        }
      }
    }

    if (!bestRect) return null;

    // Atualizar freeRects com melhor split
    this.splitFreeRect(bestRect);

    return { x: bestRect.x, y: bestRect.y, rotated: bestRect.rotated };
  }

  private splitFreeRect(placed: Rect) {
    const newRects: Rect[] = [];

    for (const free of this.freeRects) {
      if (this.intersects(free, placed)) {
        // Split em 4 possíveis retângulos
        // Esquerda
        if (placed.x > free.x) {
          newRects.push({
            x: free.x,
            y: free.y,
            w: placed.x - free.x,
            h: free.h,
          });
        }
        // Direita
        if (placed.x + placed.w < free.x + free.w) {
          newRects.push({
            x: placed.x + placed.w,
            y: free.y,
            w: free.x + free.w - (placed.x + placed.w),
            h: free.h,
          });
        }
        // Cima
        if (placed.y > free.y) {
          newRects.push({
            x: free.x,
            y: free.y,
            w: free.w,
            h: placed.y - free.y,
          });
        }
        // Baixo
        if (placed.y + placed.h < free.y + free.h) {
          newRects.push({
            x: free.x,
            y: placed.y + placed.h,
            w: free.w,
            h: free.y + free.h - (placed.y + placed.h),
          });
        }
      } else {
        newRects.push(free);
      }
    }

    this.freeRects = this.pruneFreeRects(newRects);
  }

  private intersects(a: Rect, b: Rect): boolean {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  }

  private pruneFreeRects(rects: Rect[]): Rect[] {
    const result: Rect[] = [];
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      // Remover retângulos inválidos
      if (rect.w <= 0 || rect.h <= 0) continue;

      let isContained = false;
      for (let j = 0; j < rects.length; j++) {
        if (i !== j && this.isContainedIn(rects[i], rects[j])) {
          isContained = true;
          break;
        }
      }
      if (!isContained) {
        result.push(rects[i]);
      }
    }
    return result;
  }

  private isContainedIn(a: Rect, b: Rect): boolean {
    return a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
  }
}

void _MaxRectsPacker;

// ========== TENTATIVA DE NESTING (UMA ÚNICA CHAPA) ==========

type Heuristica = "BSSF" | "BAF"; // Best Short Side Fit | Best Area Fit

interface PackResult {
  placements: Placement[];
  remaining: PecaExpandida[];
  placedArea_mm2: number;
  score: number;
}

/**
 * Tenta encaixar o MÁXIMO de peças numa única chapa
 * Retorna o que coube + o que sobrou (ao invés de null)
 */
function packSingleSheetAttempt(
  pecas: PecaExpandida[],
  sheetW: number,
  sheetH: number,
  ordenacao: "area" | "maior" | "perimetro" | "menor",
  heuristica: Heuristica = "BSSF"
): PackResult {
  const binW = sheetW - 2 * MARGEM_MM;
  const binH = sheetH - 2 * MARGEM_MM;

  // Clonar e ordenar
  const pecasOrdenadas = [...pecas];
  if (ordenacao === "area") {
    pecasOrdenadas.sort((a, b) => b.w_mm * b.h_mm - a.w_mm * a.h_mm);
  } else if (ordenacao === "maior") {
    pecasOrdenadas.sort((a, b) => Math.max(b.w_mm, b.h_mm) - Math.max(a.w_mm, a.h_mm));
  } else if (ordenacao === "menor") {
    pecasOrdenadas.sort((a, b) => Math.max(a.w_mm, a.h_mm) - Math.max(b.w_mm, b.h_mm));
  } else {
    pecasOrdenadas.sort((a, b) => b.w_mm + b.h_mm - (a.w_mm + a.h_mm));
  }

  const packer = new MaxRectsPackerWithHeuristic(binW, binH, heuristica);
  const placements: Placement[] = [];
  const remaining: PecaExpandida[] = [];
  let placedArea_mm2 = 0;

  for (const peca of pecasOrdenadas) {
    const packW = peca.w_mm + GAP_MM;
    const packH = peca.h_mm + GAP_MM;

    const result = packer.pack(packW, packH, peca.allowRotate);

    if (result) {
      // Coube!
      placements.push({
        partId: peca.id,
        label: peca.label,
        x_mm: result.x,
        y_mm: result.y,
        w_mm: result.rotated ? peca.h_mm : peca.w_mm,
        h_mm: result.rotated ? peca.w_mm : peca.h_mm,
        rotated: result.rotated,
        category: peca.category,
        cor: peca.cor,
      });
      placedArea_mm2 += peca.w_mm * peca.h_mm;
    } else {
      // NÃO coube - vai para restantes
      remaining.push(peca);
    }
  }

  // Score: queremos maximizar área colocada
  const areaChapa = binW * binH;
  const desperdicio = areaChapa - placedArea_mm2;
  const score = desperdicio; // Menor desperdício = melhor

  return { placements, remaining, placedArea_mm2, score };
}

/**
 * MaxRects com suporte a múltiplas heurísticas
 */
class MaxRectsPackerWithHeuristic {
  private binW: number;
  private binH: number;
  private freeRects: Rect[] = [];
  private heuristica: Heuristica;

  constructor(binW: number, binH: number, heuristica: Heuristica = "BSSF") {
    this.binW = binW;
    this.binH = binH;
    this.heuristica = heuristica;
    this.freeRects = [{ x: 0, y: 0, w: binW, h: binH }];
    void this.binW;
    void this.binH;
  }

  pack(w: number, h: number, allowRotate: boolean): { x: number; y: number; rotated: boolean } | null {
    let bestRect: { x: number; y: number; w: number; h: number; rotated: boolean } | null = null;
    let bestScore = Infinity;

    // Tentar orientação normal
    for (const free of this.freeRects) {
      if (w <= free.w && h <= free.h) {
        const score = this.calculateScore(free, w, h);

        if (score < bestScore) {
          bestScore = score;
          bestRect = { x: free.x, y: free.y, w, h, rotated: false };
        }
      }
    }

    // Tentar rotação 90°
    if (allowRotate && w !== h) {
      for (const free of this.freeRects) {
        if (h <= free.w && w <= free.h) {
          const score = this.calculateScore(free, h, w);

          if (score < bestScore) {
            bestScore = score;
            bestRect = { x: free.x, y: free.y, w: h, h: w, rotated: true };
          }
        }
      }
    }

    if (!bestRect) return null;

    // Atualizar freeRects
    this.splitFreeRect(bestRect);

    return { x: bestRect.x, y: bestRect.y, rotated: bestRect.rotated };
  }

  private calculateScore(free: Rect, w: number, h: number): number {
    const leftoverW = free.w - w;
    const leftoverH = free.h - h;

    if (this.heuristica === "BSSF") {
      // Best Short Side Fit
      return Math.min(leftoverW, leftoverH);
    }
    // Best Area Fit
    return leftoverW * leftoverH;
  }

  private splitFreeRect(placed: Rect) {
    const newRects: Rect[] = [];

    for (const free of this.freeRects) {
      if (this.intersects(free, placed)) {
        // Split em 4 direções
        if (placed.x > free.x) {
          newRects.push({
            x: free.x,
            y: free.y,
            w: placed.x - free.x,
            h: free.h,
          });
        }
        if (placed.x + placed.w < free.x + free.w) {
          newRects.push({
            x: placed.x + placed.w,
            y: free.y,
            w: free.x + free.w - (placed.x + placed.w),
            h: free.h,
          });
        }
        if (placed.y > free.y) {
          newRects.push({
            x: free.x,
            y: free.y,
            w: free.w,
            h: placed.y - free.y,
          });
        }
        if (placed.y + placed.h < free.y + free.h) {
          newRects.push({
            x: free.x,
            y: placed.y + placed.h,
            w: free.w,
            h: free.y + free.h - (placed.y + placed.h),
          });
        }
      } else {
        newRects.push(free);
      }
    }

    this.freeRects = this.pruneFreeRects(newRects);
  }

  private intersects(a: Rect, b: Rect): boolean {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  }

  private pruneFreeRects(rects: Rect[]): Rect[] {
    const result: Rect[] = [];
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (rect.w <= 0 || rect.h <= 0) continue;

      let isContained = false;
      for (let j = 0; j < rects.length; j++) {
        if (i !== j && this.isContainedIn(rects[i], rects[j])) {
          isContained = true;
          break;
        }
      }
      if (!isContained) {
        result.push(rects[i]);
      }
    }
    return result;
  }

  private isContainedIn(a: Rect, b: Rect): boolean {
    return a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
  }
}

// ========== MULTI-START PARA UMA ÚNICA CHAPA ==========

/**
 * Multi-start REAL: testa várias combinações de ordenação + heurística
 * Retorna o MELHOR resultado para UMA chapa
 */
function nestingMultiStartSingleSheet(pecas: PecaExpandida[], sheetW: number, sheetH: number, tentativas: number = 100): PackResult {
  let melhorResultado: PackResult | null = null;
  let melhorScore = Infinity;

  const ordenacoes: Array<"area" | "maior" | "perimetro" | "menor"> = ["area", "maior", "perimetro", "menor"];
  const heuristicas: Heuristica[] = ["BSSF", "BAF"];

  // Combinações: 4 ordenações × 2 heurísticas = 8 base
  // Multiplicar por tentativas para variar shuffle
  for (let i = 0; i < tentativas; i++) {
    const ordenacao = ordenacoes[i % ordenacoes.length];
    const heuristica = heuristicas[Math.floor(i / ordenacoes.length) % heuristicas.length];

    const resultado = packSingleSheetAttempt(pecas, sheetW, sheetH, ordenacao, heuristica);

    // Queremos MAXIMIZAR área colocada (minimizar desperdício)
    if (resultado.score < melhorScore) {
      melhorScore = resultado.score;
      melhorResultado = resultado;
    }
  }

  // Fallback: retornar pelo menos vazio se nada coube
  return (
    melhorResultado || {
      placements: [],
      remaining: [...pecas],
      placedArea_mm2: 0,
      score: Infinity,
    }
  );
}

// ========== NESTING COMPLETO PARA UM GRUPO ==========

function nestingGrupo(pecas: PecaExpandida[], chapa: ChapasPadrao): ChapaResultado[] | null {
  const chapas: ChapaResultado[] = [];
  const pecasRestantes = [...pecas];
  let sheetIndex = 0;

  while (pecasRestantes.length > 0) {
    const resultado = nestingMultiStartSingleSheet(pecasRestantes, chapa.w, chapa.h);
    if (!resultado) return null; // Não conseguiu encaixar

    // Remover peças encaixadas
    const idsEncaixados = new Set(resultado.placements.map((p) => p.partId));
    for (let i = pecasRestantes.length - 1; i >= 0; i--) {
      if (idsEncaixados.has(pecasRestantes[i].id)) {
        pecasRestantes.splice(i, 1);
      }
    }

    // Calcular utilização
    const areaUsada = resultado.placedArea_mm2;
    const areaChapa = (chapa.w - 2 * MARGEM_MM) * (chapa.h - 2 * MARGEM_MM);
    const utilizacao = (areaUsada / areaChapa) * 100;

    chapas.push({
      sheetIndex: sheetIndex++,
      w_mm: chapa.w,
      h_mm: chapa.h,
      sheet_w_mm: chapa.w,
      sheet_h_mm: chapa.h,
      placements: resultado.placements,
      utilizacao,
      utilization: utilizacao,
    });
  }

  return chapas;
}

// ========== PRÉ-CHECAGEM ==========

function pecasCabemNaChapa(pecas: PecaExpandida[], chapa: ChapasPadrao): boolean {
  const binW = chapa.w - 2 * MARGEM_MM;
  const binH = chapa.h - 2 * MARGEM_MM;

  for (const peca of pecas) {
    const packW = peca.w_mm + GAP_MM;
    const packH = peca.h_mm + GAP_MM;

    const cabeNormal = packW <= binW && packH <= binH;
    const cabeRotacionado = peca.allowRotate && packH <= binW && packW <= binH;

    if (!cabeNormal && !cabeRotacionado) {
      return false;
    }
  }

  return true;
}

// ========== ESCOLHER MELHOR CHAPA ==========

function escolherMelhorChapa(pecas: PecaExpandida[], chapaEscolhida?: ChapasPadrao): GrupoResultado | null {
  if (!pecas.length) return null;

  const catalogoFiltrado = chapaEscolhida ? [chapaEscolhida] : CATALOGO_CHAPAS.filter((c) => pecasCabemNaChapa(pecas, c));

  if (catalogoFiltrado.length === 0) return null;

  let melhorResultado: { chapa: ChapasPadrao; chapas: ChapaResultado[] } | null = null;
  let melhorScore = Infinity;

  for (const chapa of catalogoFiltrado) {
    const chapas = nestingGrupo(pecas, chapa);
    if (!chapas) continue;

    const areaSheet_m2 = (chapa.w * chapa.h) / 1e6;
    const areaParts_m2 = pecas.reduce((sum, p) => sum + (p.w_mm * p.h_mm) / 1e6, 0);
    const waste_m2 = chapas.length * areaSheet_m2 - areaParts_m2;

    const score = chapas.length * 1_000_000_000 + waste_m2 * 1_000_000;

    if (score < melhorScore) {
      melhorScore = score;
      melhorResultado = { chapa, chapas };
    }
  }

  if (!melhorResultado) return null;

  // Calcular totais
  const chapa = melhorResultado.chapa;
  const chapas = melhorResultado.chapas;

  const areaSheet_m2 = (chapa.w * chapa.h) / 1e6;
  const areaParts_m2 = pecas.reduce((sum, p) => sum + (p.w_mm * p.h_mm) / 1e6, 0);
  const sheetCount = chapas.length;
  const totalArea_m2 = sheetCount * areaSheet_m2;
  const waste_m2 = totalArea_m2 - areaParts_m2;
  const utilization = (areaParts_m2 / totalArea_m2) * 100;

  const esp_mm = pecas[0].esp_mm;
  const peso_kg = totalArea_m2 * (esp_mm / 1000) * DENSIDADE_INOX;

  const material = pecas[0].material;
  const acabamento = pecas[0].acabamento;
  const grupo = `${material}-${esp_mm}-${acabamento}`;

  return {
    grupo,
    material,
    esp_mm,
    acabamento,
    chosenSheet: { w_mm: chapa.w, h_mm: chapa.h, label: chapa.label },
    params: { margem_mm: MARGEM_MM, gap_mm: GAP_MM },
    totals: {
      partsArea_m2: areaParts_m2,
      sheetArea_m2: areaSheet_m2,
      sheetCount,
      utilization,
      waste_m2,
      peso_kg,
    },
    sheetsUsed: chapas,
  };
}

// ========== FUNÇÃO PRINCIPAL ==========

export function calcularNestingProfissional(pecas: PecaPlana[], selecoesChapa?: Map<string, ChapasPadrao>): ResultadoNesting {
  // 1. Expandir peças
  const pecasExpandidas = expandirPecasPlanas(pecas);

  // 2. Agrupar
  const grupos = agruparPorMaterialEspAcabamento(pecasExpandidas);

  // 3. Processar cada grupo
  const resultados: GrupoResultado[] = [];

  for (const [chave, pecasGrupo] of grupos) {
    const chapaEscolhida = selecoesChapa?.get(chave);
    const resultado = escolherMelhorChapa(pecasGrupo, chapaEscolhida);
    if (resultado) {
      resultados.push(resultado);
    }
  }

  // 4. Resumo geral
  const totalChapas = resultados.reduce((sum, r) => sum + r.totals.sheetCount, 0);
  const areaTotal_m2 = resultados.reduce((sum, r) => sum + r.totals.sheetCount * r.totals.sheetArea_m2, 0);
  const pesoTotal_kg = resultados.reduce((sum, r) => sum + r.totals.peso_kg, 0);
  const areaPecasTotal = resultados.reduce((sum, r) => sum + r.totals.partsArea_m2, 0);
  const eficienciaMedia = areaTotal_m2 > 0 ? (areaPecasTotal / areaTotal_m2) * 100 : 0;

  return {
    grupos: resultados,
    resumo: {
      totalChapas,
      areaTotal_m2,
      areaPecas_m2: areaPecasTotal,
      pesoTotal_kg,
      eficienciaMedia,
    },
  };
}
