/**
 * ============================================================================
 * BOM FABRICÁVEL PERFEITO
 * ============================================================================
 * Representa a fabricação real com dobras, recortes, furos
 */

import type { TipoProcesso } from './entities';

// ============================================================================
// GEOMETRIA DE FABRICAÇÃO
// ============================================================================

export interface Ponto {
  x: number;  // mm
  y: number;  // mm
}

export interface Dobra {
  id: string;
  posicaoMm: number;      // Distância da borda
  anguloGraus: number;    // 90, 45, etc
  raioInterno: number;    // mm
  comprimentoMm: number;  // Comprimento da dobra
  direcao: 'cima' | 'baixo' | 'esquerda' | 'direita';
  observacoes?: string;
}

export interface Recorte {
  id: string;
  tipo: 'retangular' | 'circular' | 'poligonal' | 'customizado';
  pontos: Ponto[];        // Coordenadas do recorte
  diametro?: number;      // Para circular
  largura?: number;       // Para retangular
  altura?: number;        // Para retangular
  observacoes?: string;
}

export interface Furo {
  id: string;
  x: number;              // mm
  y: number;              // mm
  diametro: number;       // mm
  profundidade?: number;  // mm (se não for passante)
  roscado: boolean;
  tipoRosca?: string;     // Ex: "M6", "M8"
  observacoes?: string;
}

// ============================================================================
// SHEET PART — Peça de Chapa Fabricável
// ============================================================================

export interface SheetPart {
  id: string;
  materialKey: string;    // Chave única do material
  larguraMm: number;
  alturaMm: number;
  quantidade: number;
  familia: string;        // Para agrupamento no nesting
  permiteRotacao: boolean;
  
  // Geometria de fabricação
  dobras: Dobra[];
  recortes: Recorte[];
  furos: Furo[];
  
  // Metadados
  acabamento?: string;    // Se diferente do padrão do material
  sentidoEscovado?: 'horizontal' | 'vertical';  // Importante para nesting
  observacoes?: string;
  
  // Cálculos (preenchidos pelo sistema)
  areaM2?: number;
  pesoKg?: number;
  blankDevelopedLargura?: number;  // Largura desenvolvida (com dobras)
  blankDevelopedAltura?: number;   // Altura desenvolvida
}

// ============================================================================
// TUBE PART — Peça de Tubo
// ============================================================================

export interface TubePart {
  id: string;
  tubeKey: string;        // Chave única do tubo
  comprimentoMm: number;
  quantidade: number;
  
  // Cortes nas extremidades
  cortePonta1?: {
    angulo: number;       // Graus
    tipo: 'reto' | 'bisel' | 'meia-cana';
  };
  cortePonta2?: {
    angulo: number;
    tipo: 'reto' | 'bisel' | 'meia-cana';
  };
  
  // Furos ao longo do tubo
  furos?: Array<{
    distanciaDaPontaMm: number;
    diametro: number;
    posicaoAngular?: number;  // Graus (0-360)
  }>;
  
  observacoes?: string;
  
  // Cálculos
  pesoKg?: number;
}

// ============================================================================
// ANGLE PART — Peça de Cantoneira
// ============================================================================

export interface AnglePart {
  id: string;
  angleKey: string;       // Chave única da cantoneira
  comprimentoMm: number;
  quantidade: number;
  
  // Cortes
  cortePonta1?: {
    angulo: number;
    lado: 'A' | 'B' | 'ambos';
  };
  cortePonta2?: {
    angulo: number;
    lado: 'A' | 'B' | 'ambos';
  };
  
  // Furos
  furos?: Array<{
    distanciaDaPontaMm: number;
    lado: 'A' | 'B';
    diametro: number;
  }>;
  
  observacoes?: string;
  
  // Cálculos
  pesoKg?: number;
}

// ============================================================================
// ACCESSORY PART — Peça de Acessório
// ============================================================================

export interface AccessoryPart {
  id: string;
  sku: string;            // SKU único do acessório
  quantidade: number;
  observacoes?: string;
}

// ============================================================================
// PROCESS PART — Processo de Fabricação
// ============================================================================

export interface ProcessPart {
  id: string;
  processKey: string;     // Chave única do processo
  tipo: TipoProcesso;
  descricao: string;
  
  // Métricas variadas por tipo
  tempoMinutos?: number;
  metrosCorte?: number;
  metrosSolda?: number;
  areaAcabamentoM2?: number;
  quantidadeDobras?: number;
  quantidadeOperacoes?: number;
  
  // Referência a peças (opcional)
  pecasAfetadas?: string[];  // IDs das peças
  
  observacoes?: string;
}

// ============================================================================
// BOM FABRICÁVEL COMPLETO
// ============================================================================

export interface BOMFabricavel {
  id: string;
  versao: string;
  dataCriacao: string;
  
  // Peças
  sheetParts: SheetPart[];
  tubeParts: TubePart[];
  angleParts: AnglePart[];
  accessories: AccessoryPart[];
  processes: ProcessPart[];
  
  // Metadados do produto
  produto: {
    codigo?: string;
    nome: string;
    descricao?: string;
    categoria?: string;
    cliente?: string;
    projeto?: string;
  };
  
  // Observações gerais
  observacoes?: string;
  
  // Validação
  validado: boolean;
  erros: string[];
  avisos: string[];
}

// ============================================================================
// CÁLCULO DE BLANK DESENVOLVIDO (DESENVOLVIDA)
// ============================================================================

/**
 * Calcula as dimensões do blank desenvolvido considerando dobras
 * 
 * Fórmula: L_desenvolvida = L_externa + k * θ * (R + t/2)
 * 
 * Onde:
 * - L_externa: comprimento externo
 * - k: fator K (0.33 para maioria dos inox)
 * - θ: ângulo em radianos
 * - R: raio interno
 * - t: espessura
 */
export function calcularBlankDesenvolvido(
  larguraExterna: number,
  alturaExterna: number,
  espessura: number,
  dobras: Dobra[]
): { largura: number; altura: number } {
  const fatorK = 0.33;  // Típico para inox
  
  let larguraDev = larguraExterna;
  let alturaDev = alturaExterna;
  
  for (const dobra of dobras) {
    const anguloRad = (dobra.anguloGraus * Math.PI) / 180;
    const adicional = fatorK * anguloRad * (dobra.raioInterno + espessura / 2);
    
    if (dobra.direcao === 'cima' || dobra.direcao === 'baixo') {
      alturaDev += adicional;
    } else {
      larguraDev += adicional;
    }
  }
  
  return {
    largura: larguraDev,
    altura: alturaDev,
  };
}

// ============================================================================
// CÁLCULO DE ÁREA E PESO
// ============================================================================

export function calcularAreaPeso(
  part: SheetPart,
  densidade: number  // kg/m³
): { areaM2: number; pesoKg: number } {
  // Usar blank desenvolvido se houver dobras
  let largura = part.larguraMm;
  let altura = part.alturaMm;
  
  if (part.dobras.length > 0) {
    const dev = calcularBlankDesenvolvido(
      part.larguraMm,
      part.alturaMm,
      part.blankDevelopedLargura || 0,  // espessura vem do materialKey
      part.dobras
    );
    largura = dev.largura;
    altura = dev.altura;
  }
  
  // Área
  let areaM2 = (largura * altura) / 1_000_000;
  
  // Subtrair área de recortes
  for (const recorte of part.recortes) {
    if (recorte.tipo === 'circular' && recorte.diametro) {
      const areaRecorte = Math.PI * Math.pow(recorte.diametro / 2, 2) / 1_000_000;
      areaM2 -= areaRecorte;
    } else if (recorte.tipo === 'retangular' && recorte.largura && recorte.altura) {
      const areaRecorte = (recorte.largura * recorte.altura) / 1_000_000;
      areaM2 -= areaRecorte;
    }
  }
  
  // Subtrair área de furos
  for (const furo of part.furos) {
    const areaFuro = Math.PI * Math.pow(furo.diametro / 2, 2) / 1_000_000;
    areaM2 -= areaFuro;
  }
  
  // Peso = área × espessura × densidade
  // Espessura vem do materialKey, precisa ser passada
  const pesoKg = areaM2 * densidade;  // Simplificado aqui
  
  return { areaM2, pesoKg };
}

// ============================================================================
// BUILDER DE BOM
// ============================================================================

export class BOMBuilder {
  private bom: Partial<BOMFabricavel>;
  
  constructor() {
    this.bom = {
      id: `BOM_${Date.now()}`,
      versao: '1.0',
      dataCriacao: new Date().toISOString(),
      sheetParts: [],
      tubeParts: [],
      angleParts: [],
      accessories: [],
      processes: [],
      validado: false,
      erros: [],
      avisos: [],
    };
  }
  
  setProduto(produto: BOMFabricavel['produto']): this {
    this.bom.produto = produto;
    return this;
  }
  
  addSheetPart(part: SheetPart): this {
    this.bom.sheetParts!.push(part);
    return this;
  }
  
  addTubePart(part: TubePart): this {
    this.bom.tubeParts!.push(part);
    return this;
  }
  
  addAnglePart(part: AnglePart): this {
    this.bom.angleParts!.push(part);
    return this;
  }
  
  addAccessory(part: AccessoryPart): this {
    this.bom.accessories!.push(part);
    return this;
  }
  
  addProcess(part: ProcessPart): this {
    this.bom.processes!.push(part);
    return this;
  }
  
  build(): BOMFabricavel {
    return this.bom as BOMFabricavel;
  }
}

// ============================================================================
// EXEMPLO DE USO
// ============================================================================

export function exemploCreateBOM(): BOMFabricavel {
  const builder = new BOMBuilder();
  
  builder.setProduto({
    nome: 'Bancada Industrial 2000×800',
    codigo: 'BANC-2000-800',
    categoria: 'bancadas',
  });
  
  // Tampo com dobra
  builder.addSheetPart({
    id: 'tampo_001',
    materialKey: 'CHAPA_304_POLIDO_1.2',
    larguraMm: 2000,
    alturaMm: 800,
    quantidade: 1,
    familia: 'tampo',
    permiteRotacao: false,
    dobras: [
      {
        id: 'dobra_frontal',
        posicaoMm: 50,
        anguloGraus: 90,
        raioInterno: 2,
        comprimentoMm: 2000,
        direcao: 'baixo',
      },
    ],
    recortes: [],
    furos: [
      { id: 'furo_01', x: 100, y: 400, diametro: 35, roscado: false },
      { id: 'furo_02', x: 1900, y: 400, diametro: 35, roscado: false },
    ],
  });
  
  // Estrutura tubular
  builder.addTubePart({
    id: 'pe_001',
    tubeKey: 'TUBE_Q_40x40x1.2_304',
    comprimentoMm: 850,
    quantidade: 4,
  });
  
  // Acessórios
  builder.addAccessory({
    id: 'acc_001',
    sku: 'PE-REGULAVEL-304-M10',
    quantidade: 4,
  });
  
  // Processos
  builder.addProcess({
    id: 'proc_001',
    processKey: 'CORTE_LASER_304',
    tipo: 'CORTE',
    descricao: 'Corte a laser do tampo',
    metrosCorte: 5.6,
    tempoMinutos: 25,
  });
  
  builder.addProcess({
    id: 'proc_002',
    processKey: 'DOBRA_PRENSA_100T',
    tipo: 'DOBRA',
    descricao: 'Dobra frontal do tampo',
    quantidadeDobras: 1,
    tempoMinutos: 10,
  });
  
  return builder.build();
}
