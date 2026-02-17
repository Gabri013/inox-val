// Tipos para Calculadora Rápida
// IMPORTANTE: Este módulo usa EXCLUSIVAMENTE os modelos parametrizados de /src/bom/models
// NÃO permite criação de produtos livres

import type { ModeloBOM } from '../../bom/models';
import type { MesaConfig, BOMResult } from '../../bom/types';

// ========================================
// ENTRADA - Dados do Vendedor
// ========================================

// Re-exportar tipos do sistema BOM
export type { ModeloBOM, MesaConfig, BOMResult };

export interface DadosPrecificacao {
  // Preços de materiais para cálculo de custo
  precoKgInox304?: number; // R$/kg
  precoKgInox430?: number; // R$/kg
  precoKgInox316?: number; // R$/kg
  
  precoMetroTubo25?: number; // R$/m (contraventamento 1")
  precoMetroTubo38?: number; // R$/m (pés/travessas)
  precoMetroTubo50?: number; // R$/m (reforçado)
  
  // Acessórios
  precoPeRegulavel?: number; // R$/un
  precoCasquilho?: number; // R$/un
  
  // Margens
  perdaMaterial: number; // % (ex: 10 = 10%)
  custoMaoObra?: number; // R$ fixo ou calculado por área
  margemLucro: number; // % (ex: 30 = 30%)
}

export interface EntradaCalculadora {
  modelo: ModeloBOM; // Modelo DEVE ser um dos modelos de /src/bom/models
  config: MesaConfig; // Configuração do modelo (dimensões + opções)
  precificacao: DadosPrecificacao; // Dados para cálculo de preço
}

// ========================================
// PROCESSAMENTO - Nesting
// ========================================

export interface DimensaoChapa {
  id: string;
  nome: string;
  comprimento: number; // mm
  largura: number; // mm
  area: number; // m²
}

export interface PecaNesting {
  id: string;
  descricao: string;
  comprimento: number;
  largura: number;
  quantidade: number;
  area: number; // m² unitária
}

export interface ResultadoNestingChapa {
  chapa: DimensaoChapa;
  pecasAlocadas: number;
  quantidadeChapas: number;
  areaUtilizada: number; // m²
  areaTotal: number; // m²
  aproveitamento: number; // %
  sobra: number; // %
  // Novos campos para nesting 2D real (compatibilidade com nesting.types.ts)
  itensAlocados?: Array<{
    id: string;
    descricao: string;
    posicao: {
      x: number;
      y: number;
      largura: number;
      altura: number;
      rotacionada: boolean;
    };
  }>;
  chapasLayouts?: Array<{
    index: number;
    itensAlocados: Array<{
      id: string;
      descricao: string;
      posicao: {
        x: number;
        y: number;
        largura: number;
        altura: number;
        rotacionada: boolean;
      };
    }>;
    aproveitamento: number;
  }>;
}

export interface ResultadoNesting {
  opcoes: ResultadoNestingChapa[];
  melhorOpcao: ResultadoNestingChapa;
  pecas: PecaNesting[];
  totalAreaPecas: number; // m²
  // Compatibilidade com visualizadores legados
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
  melhorOpcaoLabel?: string;
}

// ========================================
// PROCESSAMENTO - Precificação
// ========================================

export interface CustoItem {
  descricao: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  subtotal: number;
  observacao?: string;
}

export interface CustoCategoria {
  categoria: string;
  itens: CustoItem[];
  subtotal: number;
}

export interface ResultadoPrecificacao {
  custosMaterial: CustoCategoria;
  custosMaoObra: CustoCategoria;
  
  subtotalMaterial: number;
  perdaMaterial: number;
  totalComPerda: number;
  
  custoMaoObra: number;
  custoTotal: number;
  
  margemLucro: number;
  precoFinal: number;
  
  breakdown: {
    percentualMaterial: number;
    percentualMaoObra: number;
    percentualMargem: number;
  };
}

// ========================================
// SAÍDA - Resultado Completo
// ========================================

export interface ResultadoCalculadora {
  entrada: EntradaCalculadora;
  bomResult: BOMResult; // Resultado direto do gerarBOMIndustrial
  // Compatibilidade com chamadas antigas
  bom?: BOMResult;
  nesting: ResultadoNesting;
  // Compatibilidade com chamadas antigas
  custos?: {
    categorias: CustoCategoria[];
    custoTotal: number;
  };
  precificacao: ResultadoPrecificacao;
  dataCalculo: string;
  versao: string;
}

// ========================================
// HISTÓRICO E SALVAMENTO
// ========================================

export interface CalculadoraSalva {
  id: string;
  nome: string;
  cliente?: string;
  vendedor: string;
  resultado: ResultadoCalculadora;
  dataCriacao: string;
  dataAtualizacao: string;
  status: 'rascunho' | 'aprovado' | 'convertido';
}

// Chapas padrão disponíveis para nesting
// REGRA DE NEGÓCIO: APENAS 2000×1250 e 3000×1250 (outras removidas)
export const CHAPAS_PADRAO: DimensaoChapa[] = [
  {
    id: 'chapa-2000x1250',
    nome: 'Chapa 2000×1250mm',
    comprimento: 2000,
    largura: 1250,
    area: 2.5,
  },
  {
    id: 'chapa-3000x1250',
    nome: 'Chapa 3000×1250mm',
    comprimento: 3000,
    largura: 1250,
    area: 3.75,
  },
];

// Valores padrão para precificação
export const VALORES_PADRAO: DadosPrecificacao = {
  precoKgInox304: 42.0,
  precoKgInox430: 35.0,
  precoKgInox316: 55.0,
  precoMetroTubo25: 30.0,
  precoMetroTubo38: 44.1,
  precoMetroTubo50: 73.5,
  precoPeRegulavel: 15.0,
  precoCasquilho: 3.5,
  perdaMaterial: 10,
  custoMaoObra: 200,
  margemLucro: 30,
};
