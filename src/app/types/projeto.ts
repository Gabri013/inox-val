/**
 * TIPOS PARA BIBLIOTECA DE PROJETOS E ORÇAMENTO
 * Sistema completo de persistência e precificação
 */

import type { Familia, Estrutura, EspelhoLateral, Resultado } from "../domain/mesas/types";
import type { ResultadoNesting } from "../lib/nestingProfissional";

// ========== PROJETO ==========

export interface ConfiguracaoMesa {
  familia: Familia;
  C: number;
  L: number;
  H: number;
  espelhoLateral?: EspelhoLateral;
  cuba?: { comp: number; larg: number };
  estrutura: Estrutura;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao?: string;
  dataCriacao: string;
  dataModificacao: string;
  configuracao: ConfiguracaoMesa;
  bom: Resultado;
  nesting?: ResultadoNesting;
  orcamento?: Orcamento;
  tags?: string[];
}

// ========== ORÇAMENTO ==========

export interface TabelaPrecos {
  // Materiais (R$/m²)
  materiais: {
    "AISI304_1.5mm": number;
    "AISI304_2.0mm": number;
    "AISI304_3.0mm": number;
    "AISI430_1.5mm": number;
    "AISI430_2.0mm": number;
  };

  // Mão de Obra (R$/min)
  maoDeObra: {
    corte: number;
    solda: number;
    polimento: number;
    dobra: number;
  };

  // Margem de lucro (%)
  margemPadrao: number;

  // Custos fixos
  custoFixo?: number;
}

export interface CustoDetalhado {
  material: {
    chapas: number;
    tubos: number;
    outros: number;
    total: number;
  };
  maoDeObra: {
    corte: { tempo_min: number; custo: number };
    solda: { tempo_min: number; custo: number };
    polimento: { tempo_min: number; custo: number };
    dobra: { tempo_min: number; custo: number };
    total: number;
  };
  subtotal: number;
  margem: { percentual: number; valor: number };
  custoFixo: number;
  total: number;
}

export interface Orcamento {
  custoDetalhado: CustoDetalhado;
  tabelaUsada: TabelaPrecos;
  dataGeracao: string;
  observacoes?: string;
}

// ========== MODO LOTE ==========

export interface ItemLote {
  id: string;
  nome: string;
  configuracao: ConfiguracaoMesa;
  bom: Resultado;
  orcamento?: Orcamento;
}

export interface Lote {
  id: string;
  nome: string;
  descricao?: string;
  dataCriacao: string;
  itens: ItemLote[];
  nestingConjunto?: ResultadoNesting;
  orcamentoTotal?: Orcamento;
}

// ========== LOCAL STORAGE ==========

export interface DatabaseLocal {
  projetos: Projeto[];
  lotes: Lote[];
  tabelaPrecos: TabelaPrecos;
  ultimaAtualizacao: string;
}

// ========== EXPORTAÇÃO ==========

export interface OpcoesExportacao {
  incluirBOM: boolean;
  incluirNesting: boolean;
  incluirOrcamento: boolean;
  formato: "PDF" | "EXCEL" | "PNG" | "JSON";
}
