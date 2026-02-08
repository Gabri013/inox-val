/**
 * ============================================================================
 * ALGORITMO 2D BIN PACKING - GUILLOTINE BEST-FIT
 * ============================================================================
 * 
 * Implementação de algoritmo real de nesting 2D para múltiplas chapas.
 * 
 * CARACTERÍSTICAS:
 * - Algoritmo Guillotine (cortes ortogonais)
 * - Best-Fit Decreasing Height (BFDH) para otimização
 * - Suporta rotação de 90°
 * - Múltiplas chapas (Chapa 1, Chapa 2, ...)
 * - Apenas chapas padrão: 2000×1250 e 3000×1250
 * 
 * REFERÊNCIAS:
 * - Jylänki, J. (2010). "A Thousand Ways to Pack the Bin"
 * - Wei, L., et al. (2020). "Bin Packing Problem"
 * ============================================================================
 */

import type { 
  PecaNesting,
} from './types';

// ============================================================================
// ESTRUTURAS AUXILIARES
// ============================================================================

interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

interface EspacoLivre extends Retangulo {
  id: string;
}

interface PecaParaAlocar {
  id: string;
  largura: number;
  altura: number;
  label: string;
  tentativasRestantes: number; // Quantas vezes ainda precisa ser alocada
}

// ============================================================================
// CLASSE PRINCIPAL - NESTING 2D
// ============================================================================

export class Nesting2D {
  private chapaLargura: number;
  private chapaAltura: number;
  private espacosLivres: EspacoLivre[] = [];
  private pecasAlocadas: Array<{
    id: string;
    x: number;
    y: number;
    largura: number;
    altura: number;
    rotacionada: boolean;
    label: string;
  }> = [];
  private proximoIdEspaco = 0;

  constructor(largura: number, altura: number) {
    this.chapaLargura = largura;
    this.chapaAltura = altura;
    
    // Inicializar com um único espaço livre (a chapa inteira)
    this.espacosLivres = [{
      id: `espaco-0`,
      x: 0,
      y: 0,
      largura,
      altura,
    }];
  }

  /**
   * Tenta alocar uma peça no melhor espaço livre disponível
   * @returns true se conseguiu alocar, false se não há espaço
   */
  alocarPeca(peca: PecaParaAlocar): boolean {
    // Tentar encontrar o melhor espaço (sem rotação)
    let melhorEspaco = this.encontrarMelhorEspaco(peca.largura, peca.altura);
    let rotacionada = false;

    // Se não couber, tentar com rotação de 90°
    if (!melhorEspaco) {
      melhorEspaco = this.encontrarMelhorEspaco(peca.altura, peca.largura);
      rotacionada = true;
    }

    // Se ainda não couber, retornar false
    if (!melhorEspaco) {
      return false;
    }

    // Dimensões finais (considerando rotação)
    const larguraFinal = rotacionada ? peca.altura : peca.largura;
    const alturaFinal = rotacionada ? peca.largura : peca.altura;

    // Criar peça alocada
    const pecaAlocada = {
      id: peca.id,
      x: melhorEspaco.x,
      y: melhorEspaco.y,
      largura: larguraFinal,
      altura: alturaFinal,
      rotacionada,
      label: peca.label,
    };

    this.pecasAlocadas.push(pecaAlocada);

    // Dividir o espaço livre usando Guillotine Split
    this.dividirEspacoGuillotine(melhorEspaco, larguraFinal, alturaFinal);

    return true;
  }

  /**
   * Encontra o melhor espaço livre que cabe a peça
   * Usa heurística Best-Fit (menor espaço que cabe)
   */
  private encontrarMelhorEspaco(largura: number, altura: number): EspacoLivre | null {
    let melhorEspaco: EspacoLivre | null = null;
    let menorAreaSobra = Infinity;

    for (const espaco of this.espacosLivres) {
      // Verificar se a peça cabe
      if (espaco.largura >= largura && espaco.altura >= altura) {
        // Calcular área de sobra (menor = melhor fit)
        const areaSobra = (espaco.largura * espaco.altura) - (largura * altura);
        
        if (areaSobra < menorAreaSobra) {
          menorAreaSobra = areaSobra;
          melhorEspaco = espaco;
        }
      }
    }

    return melhorEspaco;
  }

  /**
   * Divide o espaço livre usando Guillotine Split
   * Cria dois novos espaços retangulares após alocar uma peça
   */
  private dividirEspacoGuillotine(espaco: EspacoLivre, larguraPeca: number, alturaPeca: number) {
    // Remover o espaço usado
    this.espacosLivres = this.espacosLivres.filter(e => e.id !== espaco.id);

    // Calcular sobras
    const sobraHorizontal = espaco.largura - larguraPeca;
    const sobraVertical = espaco.altura - alturaPeca;

    // Escolher orientação de corte (maior sobra)
    const cortarHorizontal = sobraHorizontal >= sobraVertical;

    if (cortarHorizontal) {
      // Corte horizontal: espaço direito e espaço acima

      // Espaço à direita
      if (sobraHorizontal > 0) {
        this.espacosLivres.push({
          id: `espaco-${++this.proximoIdEspaco}`,
          x: espaco.x + larguraPeca,
          y: espaco.y,
          largura: sobraHorizontal,
          altura: espaco.altura,
        });
      }

      // Espaço acima
      if (sobraVertical > 0) {
        this.espacosLivres.push({
          id: `espaco-${++this.proximoIdEspaco}`,
          x: espaco.x,
          y: espaco.y + alturaPeca,
          largura: larguraPeca,
          altura: sobraVertical,
        });
      }
    } else {
      // Corte vertical: espaço acima e espaço direito

      // Espaço acima
      if (sobraVertical > 0) {
        this.espacosLivres.push({
          id: `espaco-${++this.proximoIdEspaco}`,
          x: espaco.x,
          y: espaco.y + alturaPeca,
          largura: espaco.largura,
          altura: sobraVertical,
        });
      }

      // Espaço à direita
      if (sobraHorizontal > 0) {
        this.espacosLivres.push({
          id: `espaco-${++this.proximoIdEspaco}`,
          x: espaco.x + larguraPeca,
          y: espaco.y,
          largura: sobraHorizontal,
          altura: alturaPeca,
        });
      }
    }
  }

  /**
   * Retorna as peças alocadas nesta chapa
   */
  getPecasAlocadas(): Array<{
    id: string;
    x: number;
    y: number;
    largura: number;
    altura: number;
    rotacionada: boolean;
    label: string;
  }> {
    return this.pecasAlocadas;
  }

  /**
   * Calcula estatísticas de aproveitamento
   */
  getEstatisticas() {
    const areaTotal = this.chapaLargura * this.chapaAltura;
  const areaUtilizada = this.pecasAlocadas.reduce(
    (sum: number, p) => sum + (p.largura * p.altura),
    0
  );
    
    return {
      areaTotal: areaTotal / 1_000_000, // mm² -> m²
      areaUtilizada: areaUtilizada / 1_000_000, // mm² -> m²
      aproveitamentoPct: (areaUtilizada / areaTotal) * 100,
      sobra: ((areaTotal - areaUtilizada) / 1_000_000),
    };
  }
}

// ============================================================================
// FUNÇÃO PRINCIPAL - CALCULAR NESTING PARA MÚLTIPLAS CHAPAS
// ============================================================================

export interface ResultadoNesting2D {
  chapas: Array<{
    numero: number;
    chapa: { largura: number; altura: number };
    pecas: Array<{
      id: string;
      x: number;
      y: number;
      largura: number;
      altura: number;
      rotacionada: boolean;
      label: string;
    }>;
    aproveitamentoPct: number;
    areaUtilizada: number;
    areaTotal: number;
    sobra: number;
  }>;
  melhorOpcao: '2000×1250' | '3000×1250';
  totalChapasUsadas: number;
  aproveitamentoMedio: number;
  areaUtilizadaTotal: number;
  areaTotalChapas: number;
  sobraTotal: number;
}

/**
 * Calcula nesting para múltiplas chapas e escolhe a melhor opção
 */
export function calcularNesting2D(pecas: PecaNesting[]): ResultadoNesting2D {
  // Preparar peças para alocação (expandir quantidade)
  const pecasParaAlocar: PecaParaAlocar[] = [];
  
  pecas.forEach((peca) => {
    for (let i = 0; i < peca.quantidade; i++) {
      pecasParaAlocar.push({
        id: `${peca.id}-${i + 1}`,
        largura: peca.largura,
        altura: peca.comprimento,
        label: peca.descricao,
        tentativasRestantes: 1,
      });
    }
  });

  // Ordenar peças por área decrescente (heurística BFDH - Best-Fit Decreasing Height)
  pecasParaAlocar.sort((a, b) => {
    const areaA = a.largura * a.altura;
    const areaB = b.largura * b.altura;
    return areaB - areaA; // Decrescente
  });

  // Testar ambas as chapas padrão
  const opcao2000 = alocarEmChapas(pecasParaAlocar, 2000, 1250);
  const opcao3000 = alocarEmChapas(pecasParaAlocar, 3000, 1250);

  // Escolher melhor opção (menos chapas, ou maior aproveitamento em caso de empate)
  let melhorResultado = opcao2000;
  let melhorOpcao: '2000×1250' | '3000×1250' = '2000×1250';

  if (opcao3000.totalChapasUsadas < opcao2000.totalChapasUsadas) {
    melhorResultado = opcao3000;
    melhorOpcao = '3000×1250';
  } else if (
    opcao3000.totalChapasUsadas === opcao2000.totalChapasUsadas &&
    opcao3000.aproveitamentoMedio > opcao2000.aproveitamentoMedio
  ) {
    melhorResultado = opcao3000;
    melhorOpcao = '3000×1250';
  }

  return {
    ...melhorResultado,
    melhorOpcao,
  };
}

/**
 * Aloca peças em múltiplas chapas do mesmo tamanho
 */
function alocarEmChapas(
  pecas: PecaParaAlocar[],
  largura: number,
  altura: number
): Omit<ResultadoNesting2D, 'melhorOpcao'> {
  const chapas: Array<{
    numero: number;
    chapa: { largura: number; altura: number };
    pecas: Array<{
      id: string;
      x: number;
      y: number;
      largura: number;
      altura: number;
      rotacionada: boolean;
      label: string;
    }>;
    aproveitamentoPct: number;
    areaUtilizada: number;
    areaTotal: number;
    sobra: number;
  }> = [];
  const pecasRestantes = [...pecas];

  let numeroChapa = 1;

  // Continuar criando chapas até todas as peças serem alocadas
  while (pecasRestantes.length > 0) {
    const nesting = new Nesting2D(largura, altura);
    const pecasAlocadasNestaChapa: PecaParaAlocar[] = [];

    // Tentar alocar o máximo de peças nesta chapa
    for (let i = pecasRestantes.length - 1; i >= 0; i--) {
      const peca = pecasRestantes[i];
      
      if (nesting.alocarPeca(peca)) {
        pecasAlocadasNestaChapa.push(peca);
        pecasRestantes.splice(i, 1); // Remover da lista
      }
    }

    // Se não conseguiu alocar nenhuma peça, há um problema (peça maior que chapa)
    if (pecasAlocadasNestaChapa.length === 0 && pecasRestantes.length > 0) {
      console.error('ERRO: Peça não cabe em nenhuma chapa padrão:', pecasRestantes[0]);
      break;
    }

    // Adicionar chapa ao resultado
    const stats = nesting.getEstatisticas();
    
    chapas.push({
      numero: numeroChapa++,
      chapa: { largura, altura },
      pecas: nesting.getPecasAlocadas(),
      aproveitamentoPct: stats.aproveitamentoPct,
      areaUtilizada: stats.areaUtilizada,
      areaTotal: stats.areaTotal,
      sobra: stats.sobra,
    });
  }

  // Calcular estatísticas gerais
  const totalChapasUsadas = chapas.length;
  const areaUtilizadaTotal = chapas.reduce((sum, c) => sum + c.areaUtilizada, 0);
  const areaTotalChapas = chapas.reduce((sum, c) => sum + c.areaTotal, 0);
  const sobraTotal = chapas.reduce((sum, c) => sum + c.sobra, 0);
  const aproveitamentoMedio = 
    areaTotalChapas > 0 ? (areaUtilizadaTotal / areaTotalChapas) * 100 : 0;

  return {
    chapas,
    totalChapasUsadas,
    aproveitamentoMedio,
    areaUtilizadaTotal,
    areaTotalChapas,
    sobraTotal,
  };
}
