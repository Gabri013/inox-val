/**
 * ============================================================================
 * ALGORITMO DE PACKING 2D PARA NESTING DE CHAPAS
 * ============================================================================
 * 
 * Implementa Shelf First-Fit Decreasing Height (FFDH) com rotação
 * 
 * Características:
 * - Ordena peças por área decrescente (maior primeiro)
 * - Aloca em "prateleiras" (shelf packing)
 * - Suporta rotação de peças (trocar largura/altura)
 * - Considera kerf (espaço entre peças)
 * - Gera múltiplas chapas quando necessário
 * 
 * REGRA: Apenas chapas 2000×1250 e 3000×1250 mm
 * ============================================================================
 */

import type { ItemAlocadoNesting } from './nesting.types';

/**
 * Peça a ser alocada (entrada do algoritmo)
 */
export interface PecaInput {
  id: string;
  descricao: string;
  largura: number; // mm
  altura: number; // mm
}

/**
 * Dimensões da chapa
 */
export interface DimensaoChapa {
  largura: number; // mm
  altura: number; // mm (comprimento)
  nome: string;
}

/**
 * Layout de uma chapa com peças alocadas
 */
export interface LayoutChapa {
  index: number; // 0, 1, 2... (Chapa 1, 2, 3...)
  itensAlocados: ItemAlocadoNesting[];
  aproveitamento: number; // 0-100
  areaUtilizada: number; // mm²
  areaTotal: number; // mm²
}

/**
 * Resultado do packing 2D
 */
export interface ResultadoPacking2D {
  layouts: LayoutChapa[];
  totalChapas: number;
  totalPecasAlocadas: number;
  aproveitamentoMedio: number;
}

/**
 * Representa uma "prateleira" (shelf) no algoritmo de packing
 */
interface Shelf {
  y: number; // posição Y da shelf
  altura: number; // altura da shelf (maior peça)
  larguraUsada: number; // largura já ocupada
}

/**
 * Algoritmo de Packing 2D - Shelf FFDH com rotação
 */
export class Pack2D {
  private readonly kerf: number; // espaço entre peças (mm)
  private readonly margemBorda: number; // margem nas bordas (mm)

  constructor(kerf: number = 5, margemBorda: number = 5) {
    this.kerf = kerf;
    this.margemBorda = margemBorda;
  }

  /**
   * Executa o packing de peças em uma ou mais chapas
   */
  pack(pecas: PecaInput[], chapa: DimensaoChapa): ResultadoPacking2D {
    // Área útil da chapa (descontando margens)
    const larguraUtil = chapa.largura - 2 * this.margemBorda;
    const alturaUtil = chapa.altura - 2 * this.margemBorda;

    // Ordenar peças por área decrescente (maior primeiro)
    const pecasOrdenadas = [...pecas].sort((a, b) => {
      const areaA = a.largura * a.altura;
      const areaB = b.largura * b.altura;
      return areaB - areaA;
    });

    const layouts: LayoutChapa[] = [];
    let pecasRestantes = [...pecasOrdenadas];
    let chapaIndex = 0;

    // Alocar peças em chapas até acabar
    while (pecasRestantes.length > 0) {
      const layout = this.packSingleSheet(
        pecasRestantes,
        larguraUtil,
        alturaUtil,
        chapaIndex
      );

      layouts.push(layout);

      // Remover peças alocadas
      const idsAlocados = new Set(layout.itensAlocados.map(item => item.id));
      pecasRestantes = pecasRestantes.filter(p => !idsAlocados.has(p.id));

      chapaIndex++;

      // Segurança: limitar a 50 chapas
      if (chapaIndex >= 50) {
        console.warn('Pack2D: Limite de 50 chapas atingido');
        break;
      }
    }

    // Calcular estatísticas
    const totalPecasAlocadas = layouts.reduce(
      (sum, layout) => sum + layout.itensAlocados.length,
      0
    );

    const aproveitamentoMedio =
      layouts.length > 0
        ? layouts.reduce((sum, layout) => sum + layout.aproveitamento, 0) /
          layouts.length
        : 0;

    return {
      layouts,
      totalChapas: layouts.length,
      totalPecasAlocadas,
      aproveitamentoMedio: Math.round(aproveitamentoMedio * 10) / 10,
    };
  }

  /**
   * Aloca peças em UMA chapa usando algoritmo Shelf FFDH
   */
  private packSingleSheet(
    pecas: PecaInput[],
    larguraUtil: number,
    alturaUtil: number,
    chapaIndex: number
  ): LayoutChapa {
    const itensAlocados: ItemAlocadoNesting[] = [];
    const shelves: Shelf[] = [];
    let currentY = this.margemBorda;

    for (const peca of pecas) {
      const alocado = this.tryAllocatePiece(
        peca,
        shelves,
        larguraUtil,
        alturaUtil,
        currentY
      );

      if (alocado) {
        itensAlocados.push(alocado);

        // Atualizar currentY se criou nova shelf
        const lastShelf = shelves[shelves.length - 1];
        if (lastShelf) {
          currentY = lastShelf.y + lastShelf.altura + this.kerf;
        }
      }
    }

    // Calcular aproveitamento
    const areaChapa = larguraUtil * alturaUtil;
    const areaUtilizada = itensAlocados.reduce(
      (sum, item) => sum + item.posicao.largura * item.posicao.altura,
      0
    );
    const aproveitamento = areaChapa > 0 ? (areaUtilizada / areaChapa) * 100 : 0;

    return {
      index: chapaIndex,
      itensAlocados,
      aproveitamento: Math.round(aproveitamento * 10) / 10,
      areaUtilizada,
      areaTotal: areaChapa,
    };
  }

  /**
   * Tenta alocar uma peça nas shelves existentes ou cria nova shelf
   */
  private tryAllocatePiece(
    peca: PecaInput,
    shelves: Shelf[],
    larguraUtil: number,
    alturaUtil: number,
    currentY: number
  ): ItemAlocadoNesting | null {
    // Testar orientações (normal e rotacionada)
    const orientacoes: Array<{
      w: number;
      h: number;
      rotacionada: boolean;
    }> = [
      { w: peca.largura, h: peca.altura, rotacionada: false },
      { w: peca.altura, h: peca.largura, rotacionada: true },
    ];

    for (const orientacao of orientacoes) {
      // Tentar alocar em shelves existentes
      for (const shelf of shelves) {
        const espacoDisponivel = larguraUtil - shelf.larguraUsada;

        if (
          orientacao.w <= espacoDisponivel &&
          orientacao.h <= shelf.altura
        ) {
          // Cabe nesta shelf!
          const item: ItemAlocadoNesting = {
            id: peca.id,
            descricao: peca.descricao,
            posicao: {
              x: this.margemBorda + shelf.larguraUsada,
              y: shelf.y,
              largura: orientacao.w,
              altura: orientacao.h,
              rotacionada: orientacao.rotacionada,
            },
          };

          shelf.larguraUsada += orientacao.w + this.kerf;
          return item;
        }
      }

      // Não coube em nenhuma shelf existente → criar nova shelf
      const novaShelfY = currentY;
      const espacoVerticalDisponivel = alturaUtil + this.margemBorda - novaShelfY;

      if (
        orientacao.w <= larguraUtil &&
        orientacao.h <= espacoVerticalDisponivel
      ) {
        // Criar nova shelf
        const novaShelf: Shelf = {
          y: novaShelfY,
          altura: orientacao.h,
          larguraUsada: orientacao.w + this.kerf,
        };
        shelves.push(novaShelf);

        const item: ItemAlocadoNesting = {
          id: peca.id,
          descricao: peca.descricao,
          posicao: {
            x: this.margemBorda,
            y: novaShelfY,
            largura: orientacao.w,
            altura: orientacao.h,
            rotacionada: orientacao.rotacionada,
          },
        };

        return item;
      }
    }

    // Não conseguiu alocar em nenhuma orientação
    return null;
  }
}

/**
 * Helper: Expande peças com quantidade > 1 em múltiplas entradas
 */
export function expandirPecas(
  pecas: Array<{ id: string; descricao: string; largura: number; altura: number; quantidade: number }>
): PecaInput[] {
  const expandidas: PecaInput[] = [];

  pecas.forEach((peca) => {
    for (let i = 0; i < peca.quantidade; i++) {
      expandidas.push({
        id: `${peca.id}-${i + 1}`,
        descricao: peca.descricao,
        largura: peca.largura,
        altura: peca.altura,
      });
    }
  });

  return expandidas;
}
