// ==========================================================
// SISTEMA PROFISSIONAL DE NESTING - MULTI-ALGORITMOS
// Implementa: FFDH, Best Fit, Guillotine, Maximal Rectangles
// ==========================================================
import { CHAPAS_INDUSTRIAIS } from "./calculadoraIndustrial";

export interface PecaNesting {
  desc: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
  rotacionada?: boolean;
}

export interface ResultadoNesting {
  chapa: { nome: string; comprimento: number; largura: number };
  pecasPorChapa: PecaNesting[][];
  eficiencia: number;
  areaUtilizada: number;
  areaTotal: number;
  totalChapas: number;
  algoritmo?: string;
  desperdicio?: number;
}

interface Retangulo {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ==========================================================
// CONFIGURAÇÕES
// ==========================================================
const CONFIG = {
  MARGEM_SEGURANCA: 2, // mm de margem entre peças (kerf)
  PERMITIR_ROTACAO: true,
  MAX_TENTATIVAS: 100,
};

// ==========================================================
// UTILITÁRIOS
// ==========================================================

/**
 * Verifica se duas peças se sobrepõem
 */
function verificarSobreposicao(r1: Retangulo, r2: Retangulo): boolean {
  return !(
    r1.x + r1.w <= r2.x ||
    r2.x + r2.w <= r1.x ||
    r1.y + r1.h <= r2.y ||
    r2.y + r2.h <= r1.y
  );
}

/**
 * Verifica se uma peça cabe dentro da chapa
 */
function pecaCabeNaChapa(peca: Retangulo, chapaW: number, chapaH: number): boolean {
  return peca.x >= 0 && peca.y >= 0 && peca.x + peca.w <= chapaW && peca.y + peca.h <= chapaH;
}

/**
 * Verifica se uma posição é válida (sem sobreposição)
 */
function posicaoValida(peca: Retangulo, pecasColocadas: PecaNesting[], chapaW: number, chapaH: number): boolean {
  void pecasColocadas;
  // Verifica limites da chapa
  if (!pecaCabeNaChapa(peca, chapaW, chapaH)) {
    return false;
  }

  // Verifica sobreposição com outras peças
  for (const outraPeca of pecasColocadas) {
    if (outraPeca.x === undefined || outraPeca.y === undefined) continue;

    const r2: Retangulo = {
      x: outraPeca.x,
      y: outraPeca.y,
      w: outraPeca.w,
      h: outraPeca.h,
    };

    if (verificarSobreposicao(peca, r2)) {
      return false;
    }
  }

  return true;
}

void posicaoValida;

// ==========================================================
// ALGORITMO 1: FFDH AVANÇADO (First Fit Decreasing Height)
// ==========================================================
function algoritmoFFDH(pecas: PecaNesting[], chapaW: number, chapaH: number): PecaNesting[][] {
  const chapas: PecaNesting[][] = [];
  let chapaAtual: PecaNesting[] = [];

  // Níveis (linhas horizontais)
  let niveis: { y: number; alturaMaxima: number; espacoRestante: number }[] = [];
  let nivelAtual = { y: 0, alturaMaxima: 0, espacoRestante: chapaW };

  // Ordena por altura decrescente
  const pecasOrdenadas = [...pecas].sort((a, b) => {
    const areaA = a.w * a.h;
    const areaB = b.w * b.h;
    if (Math.abs(b.h - a.h) > 10) return b.h - a.h; // Prioriza altura
    return areaB - areaA; // Depois área
  });

  for (const peca of pecasOrdenadas) {
    let posicionada = false;
    let rotacionada = false;

    // Tenta posicionar sem rotação e com rotação
    const tentativas: Array<{ w: number; h: number; rot: boolean }> = [{ w: peca.w, h: peca.h, rot: false }];

    // Adiciona tentativa com rotação se permitido
    if (CONFIG.PERMITIR_ROTACAO && peca.w !== peca.h) {
      tentativas.push({ w: peca.h, h: peca.w, rot: true });
    }

    for (const tentativa of tentativas) {
      const w = tentativa.w;
      const h = tentativa.h;
      rotacionada = tentativa.rot;

      // Espaço necessário COM margem
      const wComMargem = w + CONFIG.MARGEM_SEGURANCA;
      const hComMargem = h + CONFIG.MARGEM_SEGURANCA;

      // Tenta encaixar no nível atual
      if (wComMargem <= nivelAtual.espacoRestante && nivelAtual.y + hComMargem <= chapaH) {
        const x = chapaW - nivelAtual.espacoRestante;

        const novaPeca: PecaNesting = {
          ...peca,
          x,
          y: nivelAtual.y,
          w: rotacionada ? peca.h : peca.w,
          h: rotacionada ? peca.w : peca.h,
          rotacionada,
        };

        chapaAtual.push(novaPeca);
        nivelAtual.espacoRestante -= wComMargem;
        nivelAtual.alturaMaxima = Math.max(nivelAtual.alturaMaxima, hComMargem);
        posicionada = true;
        break;
      }

      // Tenta encaixar em níveis anteriores
      for (let i = 0; i < niveis.length; i++) {
        const nivel = niveis[i];
        if (wComMargem <= nivel.espacoRestante && nivel.y + hComMargem <= chapaH) {
          const x = chapaW - nivel.espacoRestante;

          const novaPeca: PecaNesting = {
            ...peca,
            x,
            y: nivel.y,
            w: rotacionada ? peca.h : peca.w,
            h: rotacionada ? peca.w : peca.h,
            rotacionada,
          };

          chapaAtual.push(novaPeca);
          nivel.espacoRestante -= wComMargem;
          nivel.alturaMaxima = Math.max(nivel.alturaMaxima, hComMargem);
          posicionada = true;
          break;
        }
      }

      if (posicionada) break;
    }

    // Se não conseguiu posicionar, cria novo nível ou nova chapa
    if (!posicionada) {
      if (nivelAtual.alturaMaxima > 0) {
        niveis.push(nivelAtual);
      }

      const novoY = nivelAtual.y + nivelAtual.alturaMaxima;

      // Dimensões da peça (usa a primeira tentativa sem rotação)
      const w = peca.w;
      const h = peca.h;
      const wComMargem = w + CONFIG.MARGEM_SEGURANCA;
      const hComMargem = h + CONFIG.MARGEM_SEGURANCA;

      // Tenta criar novo nível na mesma chapa
      if (novoY + hComMargem <= chapaH) {
        nivelAtual = { y: novoY, alturaMaxima: hComMargem, espacoRestante: chapaW - wComMargem };

        const novaPeca: PecaNesting = {
          ...peca,
          x: 0,
          y: novoY,
          w: peca.w,
          h: peca.h,
          rotacionada: false,
        };

        chapaAtual.push(novaPeca);
      } else {
        // Nova chapa
        if (chapaAtual.length > 0) {
          chapas.push(chapaAtual);
        }

        chapaAtual = [];
        niveis = [];
        nivelAtual = { y: 0, alturaMaxima: hComMargem, espacoRestante: chapaW - wComMargem };

        const novaPeca: PecaNesting = {
          ...peca,
          x: 0,
          y: 0,
          w: peca.w,
          h: peca.h,
          rotacionada: false,
        };

        chapaAtual.push(novaPeca);
      }
    }
  }

  if (chapaAtual.length > 0) {
    chapas.push(chapaAtual);
  }

  return chapas;
}

// ==========================================================
// ALGORITMO 2: BEST FIT (Melhor encaixe) - CORRIGIDO V2
// ==========================================================
function algoritmoBestFit(pecas: PecaNesting[], chapaW: number, chapaH: number): PecaNesting[][] {
  const chapas: PecaNesting[][] = [];
  let chapaAtual: PecaNesting[] = [];

  // Ordena por área decrescente
  const pecasOrdenadas = [...pecas].sort((a, b) => {
    const areaA = a.w * a.h;
    const areaB = b.w * b.h;
    return areaB - areaA;
  });

  for (const peca of pecasOrdenadas) {
    let melhorPosicao: { x: number; y: number; w: number; h: number; rot: boolean } | null = null;
    let menorDesperdicio = Infinity;

    // Gera pontos candidatos (cantos das peças existentes + origem)
    const pontosCandidatos: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];

    for (const pecaExistente of chapaAtual) {
      if (pecaExistente.x !== undefined && pecaExistente.y !== undefined) {
        // Pontos nos cantos das peças COM margem de segurança
        pontosCandidatos.push(
          { x: pecaExistente.x + pecaExistente.w + CONFIG.MARGEM_SEGURANCA, y: pecaExistente.y },
          { x: pecaExistente.x, y: pecaExistente.y + pecaExistente.h + CONFIG.MARGEM_SEGURANCA }
        );
      }
    }

    // Testa cada ponto candidato
    for (const ponto of pontosCandidatos) {
      // Tenta sem rotação e com rotação
      const orientacoes = [{ w: peca.w, h: peca.h, rot: false }];

      if (CONFIG.PERMITIR_ROTACAO && peca.w !== peca.h) {
        orientacoes.push({ w: peca.h, h: peca.w, rot: true });
      }

      for (const orient of orientacoes) {
        // Verifica se cabe na chapa
        if (ponto.x + orient.w > chapaW || ponto.y + orient.h > chapaH) {
          continue;
        }

        // Cria retângulo candidato (tamanho real da peça)
        const candidato: Retangulo = {
          x: ponto.x,
          y: ponto.y,
          w: orient.w,
          h: orient.h,
        };

        // Verifica sobreposição (usa dimensões reais sem margem extra)
        let temSobreposicao = false;
        for (const pecaExistente of chapaAtual) {
          if (pecaExistente.x === undefined || pecaExistente.y === undefined) continue;

          const r1: Retangulo = {
            x: candidato.x,
            y: candidato.y,
            w: candidato.w,
            h: candidato.h,
          };

          const r2: Retangulo = {
            x: pecaExistente.x,
            y: pecaExistente.y,
            w: pecaExistente.w,
            h: pecaExistente.h,
          };

          if (verificarSobreposicao(r1, r2)) {
            temSobreposicao = true;
            break;
          }
        }

        if (!temSobreposicao) {
          // Calcula desperdício (distância até o canto)
          const desperdicio = candidato.x + candidato.y;

          if (desperdicio < menorDesperdicio) {
            menorDesperdicio = desperdicio;
            melhorPosicao = {
              x: candidato.x,
              y: candidato.y,
              w: orient.w,
              h: orient.h,
              rot: orient.rot,
            };
          }
        }
      }
    }

    // Posiciona na melhor posição encontrada
    if (melhorPosicao) {
      chapaAtual.push({
        ...peca,
        x: melhorPosicao.x,
        y: melhorPosicao.y,
        w: melhorPosicao.rot ? peca.h : peca.w,
        h: melhorPosicao.rot ? peca.w : peca.h,
        rotacionada: melhorPosicao.rot,
      });
    } else {
      // Nova chapa
      if (chapaAtual.length > 0) {
        chapas.push(chapaAtual);
      }

      chapaAtual = [
        {
          ...peca,
          x: 0,
          y: 0,
          w: peca.w,
          h: peca.h,
          rotacionada: false,
        },
      ];
    }
  }

  if (chapaAtual.length > 0) {
    chapas.push(chapaAtual);
  }

  return chapas;
}

// ==========================================================
// ALGORITMO 3: GUILLOTINE CUT (Corte guilhotina) - CORRIGIDO V2
// ==========================================================
function algoritmoGuillotine(pecas: PecaNesting[], chapaW: number, chapaH: number): PecaNesting[][] {
  const chapas: PecaNesting[][] = [];
  let chapaAtual: PecaNesting[] = [];

  // Espaços livres disponíveis
  let espacosLivres: Retangulo[] = [{ x: 0, y: 0, w: chapaW, h: chapaH }];

  // Ordena por área decrescente
  const pecasOrdenadas = [...pecas].sort((a, b) => {
    const areaA = a.w * a.h;
    const areaB = b.w * b.h;
    return areaB - areaA;
  });

  for (const peca of pecasOrdenadas) {
    let posicionada = false;

    // Orientações possíveis
    const orientacoes = [{ w: peca.w, h: peca.h, rot: false }];

    if (CONFIG.PERMITIR_ROTACAO && peca.w !== peca.h) {
      orientacoes.push({ w: peca.h, h: peca.w, rot: true });
    }

    // Ordena espaços livres por área (menor primeiro = melhor encaixe)
    espacosLivres.sort((a, b) => a.w * a.h - b.w * b.h);

    // Tenta encaixar em cada espaço livre
    for (let i = 0; i < espacosLivres.length && !posicionada; i++) {
      const espaco = espacosLivres[i];

      for (const orient of orientacoes) {
        const w = orient.w;
        const h = orient.h;

        // Verifica se a peça cabe no espaço (SEM margem extra aqui)
        if (w <= espaco.w && h <= espaco.h) {
          // Posiciona a peça
          chapaAtual.push({
            ...peca,
            x: espaco.x,
            y: espaco.y,
            w: orient.w,
            h: orient.h,
            rotacionada: orient.rot,
          });

          // Remove o espaço usado
          espacosLivres.splice(i, 1);

          // Cria novos espaços livres (corte guilhotina)
          const margem = CONFIG.MARGEM_SEGURANCA;

          // Espaço à direita
          if (espaco.w - w - margem > 50) {
            // mínimo 50mm
            espacosLivres.push({
              x: espaco.x + w + margem,
              y: espaco.y,
              w: espaco.w - w - margem,
              h: h,
            });
          }

          // Espaço acima
          if (espaco.h - h - margem > 50) {
            // mínimo 50mm
            espacosLivres.push({
              x: espaco.x,
              y: espaco.y + h + margem,
              w: espaco.w,
              h: espaco.h - h - margem,
            });
          }

          posicionada = true;
          break;
        }
      }
    }

    // Se não conseguiu posicionar, cria nova chapa
    if (!posicionada) {
      if (chapaAtual.length > 0) {
        chapas.push(chapaAtual);
      }

      // Reinicia com nova chapa
      chapaAtual = [
        {
          ...peca,
          x: 0,
          y: 0,
          w: peca.w,
          h: peca.h,
          rotacionada: false,
        },
      ];

      // Reinicia espaços livres
      espacosLivres = [];

      const w = peca.w;
      const h = peca.h;
      const margem = CONFIG.MARGEM_SEGURANCA;

      // Espaço à direita da primeira peça
      if (w + margem < chapaW) {
        espacosLivres.push({
          x: w + margem,
          y: 0,
          w: chapaW - w - margem,
          h: chapaH,
        });
      }

      // Espaço acima da primeira peça
      if (h + margem < chapaH) {
        espacosLivres.push({
          x: 0,
          y: h + margem,
          w: chapaW,
          h: chapaH - h - margem,
        });
      }
    }
  }

  if (chapaAtual.length > 0) {
    chapas.push(chapaAtual);
  }

  return chapas;
}

// ==========================================================
// VALIDAÇÃO DE RESULTADO
// ==========================================================
function validarResultado(chapas: PecaNesting[][], chapaW: number, chapaH: number): boolean {
  for (const chapa of chapas) {
    for (let i = 0; i < chapa.length; i++) {
      const peca1 = chapa[i];

      // Verifica se está dentro da chapa
      if (peca1.x === undefined || peca1.y === undefined) return false;
      if (peca1.x < 0 || peca1.y < 0) return false;
      if (peca1.x + peca1.w > chapaW || peca1.y + peca1.h > chapaH) return false;

      // Verifica sobreposição com outras peças (usa dimensões reais)
      // NÃO adiciona margem aqui porque os algoritmos já garantiram o espaçamento
      for (let j = i + 1; j < chapa.length; j++) {
        const peca2 = chapa[j];
        if (peca2.x === undefined || peca2.y === undefined) continue;

        const r1: Retangulo = {
          x: peca1.x,
          y: peca1.y,
          w: peca1.w, // SEM margem extra
          h: peca1.h, // SEM margem extra
        };
        const r2: Retangulo = {
          x: peca2.x,
          y: peca2.y,
          w: peca2.w, // SEM margem extra
          h: peca2.h, // SEM margem extra
        };

        if (verificarSobreposicao(r1, r2)) {
          console.error(`Sobreposição detectada entre peças ${i} e ${j}:`, {
            peca1: r1,
            peca2: r2,
          });
          return false;
        }
      }
    }
  }
  return true;
}

// ==========================================================
// FUNÇÃO PRINCIPAL - MULTI-ALGORITMOS
// ==========================================================
export function nestingMultiChapas(pecas: PecaNesting[]): ResultadoNesting | null {
  let melhorResultado: ResultadoNesting | null = null;
  let melhorEficiencia = 0;

  // Testa cada tipo de chapa
  for (const chapa of CHAPAS_INDUSTRIAIS) {
    // Testa cada algoritmo
    const algoritmos = [
      { nome: "FFDH Avançado", funcao: algoritmoFFDH },
      { nome: "Best Fit", funcao: algoritmoBestFit },
      { nome: "Guillotine Cut", funcao: algoritmoGuillotine },
    ];

    for (const algoritmo of algoritmos) {
      try {
        const chapasResult = algoritmo.funcao(pecas, chapa.comprimento, chapa.largura);

        // Valida o resultado
        if (!validarResultado(chapasResult, chapa.comprimento, chapa.largura)) {
          console.warn(`Algoritmo ${algoritmo.nome} gerou resultado inválido`);
          continue;
        }

        // Calcula métricas
        const areaUsada = pecas.reduce((a, b) => a + b.w * b.h, 0);
        const areaTotal = chapa.comprimento * chapa.largura * chapasResult.length;
        const eficiencia = areaTotal > 0 ? (areaUsada / areaTotal) * 100 : 0;
        const desperdicio = areaTotal - areaUsada;

        // Verifica se é melhor
        if (
          eficiencia > melhorEficiencia ||
          (eficiencia === melhorEficiencia && chapasResult.length < (melhorResultado?.totalChapas || Infinity))
        ) {
          melhorEficiencia = eficiencia;
          melhorResultado = {
            chapa,
            pecasPorChapa: chapasResult,
            eficiencia,
            areaUtilizada: areaUsada,
            areaTotal,
            totalChapas: chapasResult.length,
            algoritmo: algoritmo.nome,
            desperdicio,
          };
        }
      } catch (error) {
        console.error(`Erro no algoritmo ${algoritmo.nome}:`, error);
      }
    }
  }

  return melhorResultado;
}
