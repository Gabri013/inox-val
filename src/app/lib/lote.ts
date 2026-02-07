/**
 * SISTEMA DE MODO LOTE
 * Gerenciamento de múltiplas mesas com nesting conjunto
 */

import { gerarBOM } from "../domain/mesas";
import { converterBOMParaNesting } from "../domain/mesas/conversorBOMParaNesting";
import { calcularNestingProfissional } from "./nestingProfissional";
import type { ItemLote, Lote } from "../types/projeto";
import type { Familia, Estrutura, EspelhoLateral } from "../domain/mesas/types";
import type { PecaNesting } from "./nestingProfissional";

export interface ConfiguracaoMesaLote {
  nome: string;
  familia: Familia;
  C: number;
  L: number;
  H: number;
  espelhoLateral?: EspelhoLateral;
  cuba?: { comp: number; larg: number; prof: number };
  estrutura: Estrutura;
}

/**
 * Cria um item de lote a partir de uma configuração de mesa
 */
export function criarItemLote(config: ConfiguracaoMesaLote): ItemLote | null {
  const input = {
    familia: config.familia,
    estrutura: config.estrutura,
    C: config.C,
    L: config.L,
    H: config.H,
    espelhoLateral: config.familia === "CENTRO" ? undefined : config.espelhoLateral,
    cuba: config.familia === "VINCADA" ? config.cuba : undefined,
  };

  const bomResult = gerarBOM(input);

  if (!bomResult.ok) {
    return null;
  }

  return {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nome: config.nome,
    configuracao: {
      familia: config.familia,
      C: config.C,
      L: config.L,
      H: config.H,
      espelhoLateral: config.espelhoLateral,
      cuba: config.cuba,
      estrutura: config.estrutura,
    },
    bom: bomResult,
  };
}

/**
 * Calcula nesting conjunto para todos os itens do lote
 */
export function calcularNestingLote(itens: ItemLote[]) {
  // Coletar todas as peças de todos os itens
  const todasPecas: PecaNesting[] = [];

  itens.forEach((item, index) => {
    if (item.bom.ok) {
      const pecasItem = converterBOMParaNesting(item.bom.bom);

      // Adicionar prefixo com número do item para rastreabilidade
      pecasItem.forEach((peca) => {
        todasPecas.push({
          ...peca,
          label: `[${index + 1}] ${peca.label}`,
        });
      });
    }
  });

  // Calcular nesting com todas as peças misturadas
  return calcularNestingProfissional(todasPecas);
}

/**
 * Consolida BOM de múltiplos itens
 */
export function consolidarBOMLote(itens: ItemLote[]) {
  const bomConsolidado: Record<
    string,
    {
      desc: string;
      qtd: number;
      material: string;
      esp?: number;
      w?: number;
      h?: number;
      diametro?: number;
      comprimento?: number;
    }
  > = {};

  itens.forEach((item) => {
    if (item.bom.ok) {
      item.bom.bom.forEach((bomItem) => {
        // Criar chave única baseada nas propriedades
        const key = `${bomItem.desc}_${bomItem.esp || 0}_${bomItem.w || 0}_${bomItem.h || 0}_${bomItem.diametro || 0}_${bomItem.comprimento || 0}`;

        if (bomConsolidado[key]) {
          bomConsolidado[key].qtd += bomItem.qtd;
        } else {
          bomConsolidado[key] = { ...bomItem };
        }
      });
    }
  });

  return Object.values(bomConsolidado).sort((a, b) => {
    // Ordenar: chapas primeiro, depois tubos, depois outros
    const aIsChapa = !!(a.w && a.h);
    const bIsChapa = !!(b.w && b.h);
    const aIsTubo = !!(a.diametro || a.comprimento);
    const bIsTubo = !!(b.diametro || b.comprimento);

    if (aIsChapa && !bIsChapa) return -1;
    if (!aIsChapa && bIsChapa) return 1;
    if (aIsTubo && !bIsTubo) return -1;
    if (!aIsTubo && bIsTubo) return 1;

    return a.desc.localeCompare(b.desc);
  });
}

/**
 * Calcula estatísticas do lote
 */
export function calcularEstatisticasLote(itens: ItemLote[]) {
  let totalItens = 0;
  let totalChapas = 0;
  let totalTubos = 0;
  let totalOutros = 0;

  itens.forEach((item) => {
    if (item.bom.ok) {
      totalItens += item.bom.bom.length;
      item.bom.bom.forEach((bomItem) => {
        if (bomItem.w && bomItem.h) totalChapas += bomItem.qtd;
        else if (bomItem.diametro || bomItem.comprimento) totalTubos += bomItem.qtd;
        else totalOutros += bomItem.qtd;
      });
    }
  });

  return {
    totalItens,
    totalChapas,
    totalTubos,
    totalOutros,
    totalMesas: itens.length,
  };
}
