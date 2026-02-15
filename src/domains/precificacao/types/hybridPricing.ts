export interface HybridPricingInput {
  codigo?: string;
  familia?: string;
  subfamilia?: string;
  descricao?: string;
  dimensao?: string;
  temProjeto?: boolean;
  temBloco?: boolean;
  temRender?: boolean;
  urgencia?: "normal" | "urgente" | "super";
  precoBaseAtual: number;
}

export interface HybridPricingBreakdown {
  fatorFamilia: number;
  fatorSubfamilia: number;
  fatorDimensao: number;
  fatorComplexidade: number;
  fatorHistorico: number;
}

export interface HybridPricingResult {
  precoBaseAtual: number;
  precoRecomendado: number;
  precoMin: number;
  precoIdeal: number;
  precoMax: number;
  confianca: "baixa" | "media" | "alta";
  justificativa: string[];
  breakdown: HybridPricingBreakdown;
}
