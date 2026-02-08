// ==========================================================
// TIPOS DO SISTEMA DE GERAÇÃO DE BOM
// Contrato único - fonte da verdade
// ==========================================================

export type Familia = "CENTRO" | "ENCOSTO" | "VINCADA" | "CONTRAVENTADA";
export type Estrutura = "CONTRAVENTADA" | "PRATELEIRA";
export type Lado = "ESQUERDO" | "DIREITO";
export type EspelhoLateral = "NENHUM" | Lado;

// ==========================================================
// INPUT DO WIZARD
// ==========================================================
export type WizardInput = {
  familia: Familia;
  estrutura: Estrutura;
  C: number; // comprimento (C_txt)
  L: number; // largura/profundidade (L_txt)
  H: number; // altura

  numPes?: 4 | 6; // pode ser default automático
  espelhoLateral?: EspelhoLateral;

  // VINCADA - cuba obrigatória
  cuba?: { comp: number; larg: number; prof: number };
};

// ==========================================================
// ITEM DA BOM
// ==========================================================
export type BOMItem = {
  desc: string;
  codigo: string;
  processo: string;
  material: string;
  unidade: "pç" | "un";
  qtd: number;
  w?: number; // largura em mm
  h?: number; // altura em mm
  esp?: number; // espessura em mm
  diametro?: number; // diâmetro em mm (para tubos)
  comprimento?: number; // comprimento em mm (para tubos/perfis)
  acabamento?: string; // acabamento (opcional)
};

// ==========================================================
// RESULTADO DA GERAÇÃO
// ==========================================================
export type Resultado =
  | {
      ok: true;
      templateId: string;
      meta: {
        numPes: 4 | 6;
        chapaUsada: string; // ex: "Chapa 2000×1250"
      };
      blanks: {
        tampo: { blankC: number; blankL: number };
        prateleira?: { blankC: number; blankL: number } | null;
      };
      bom: BOMItem[];
      avisos?: string[];
    }
  | {
      ok: false;
      erros: string[];
    };

// ==========================================================
// CONTEXTO DE FÓRMULAS (usado em templates)
// ==========================================================
export type FormulaCtx = {
  C: number;
  L: number;
  H: number;
  numPes: 4 | 6;
  opts: {
    estrutura: "CONTRAVENTADA" | "PRATELEIRA";
    espelhoLateral: EspelhoLateral;
    cuba?: { comp: number; larg: number; prof: number };
  };
};

// ==========================================================
// EXPRESSÕES DE DIMENSÃO E QUANTIDADE
// ==========================================================
export type DimExpr = (ctx: FormulaCtx) => number;
export type QtyExpr = (ctx: FormulaCtx) => number;
export type EnabledExpr = (ctx: FormulaCtx) => boolean;

// ==========================================================
// ITEM DO TEMPLATE
// ==========================================================
export type TemplateItem = {
  key: string; // identificador único
  desc: string; // descrição
  codigo: string; // código do produto
  processo: string; // CORTE, DOBRA, etc.
  material: string; // AÇO INOX 304, etc.
  unidade: "pç" | "un";
  qtd: QtyExpr;
  w?: DimExpr; // largura (opcional)
  h?: DimExpr; // altura (opcional)
  esp?: DimExpr; // espessura (opcional)
  diametro?: DimExpr; // diâmetro (para tubos)
  comprimento?: DimExpr; // comprimento (para tubos/perfis)
  acabamento?: string; // acabamento (opcional)
  enabled?: EnabledExpr; // condição para incluir item
};

// ==========================================================
// TEMPLATE COMPLETO
// ==========================================================
export type Template = {
  id: string; // ex: "MPLC_4P"
  familia: Familia;
  blankTampo: (ctx: FormulaCtx) => { blankC: number; blankL: number };
  blankPrateleira?: (ctx: FormulaCtx) => { blankC: number; blankL: number };
  validate?: (ctx: FormulaCtx) => string[]; // retorna erros
  items: TemplateItem[];
};
