/**
 * ============================================================================
 * ENGINE DE ORÇAMENTO V2 - COMPLETO
 * ============================================================================
 * Sistema completo de orçamento com BOM + Nesting + Custos
 */

import type {
  ChapaPadrao,
  TipoInox,
} from '../materiais/types';
import * as materiaisService from '../materiais/service';

// ============================================================================
// TIPOS - BOM (Bill of Materials)
// ============================================================================

export interface PecaChapa {
  id: string;
  descricao: string;
  largura: number;   // mm
  altura: number;    // mm
  quantidade: number;
  espessuraMm: number;
  tipoInox: TipoInox;
  familia: string;
  podeRotacionar?: boolean;
}

export interface PecaTubo {
  id: string;
  descricao: string;
  tuboId: string;
  metros: number;
  tipoInox: TipoInox;
}

export interface PecaCantoneira {
  id: string;
  descricao: string;
  cantoneiraId: string;
  metros: number;
  tipoInox: TipoInox;
}

export interface PecaAcessorio {
  id: string;
  sku: string;
  descricao: string;
  quantidade: number;
}

export interface ProcessoFabricacao {
  id: string;
  tipo: string;
  descricao: string;
  minutos: number;
}

export interface BOM {
  pecasChapa: PecaChapa[];
  pecasTubo: PecaTubo[];
  pecasCantoneira: PecaCantoneira[];
  pecasAcessorio: PecaAcessorio[];
  processos: ProcessoFabricacao[];
}

// ============================================================================
// TIPOS - NESTING
// ============================================================================

export interface ItemNesting {
  id: string;
  descricao: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
  rotacionada: boolean;
}

export interface ChapaAlocada {
  numero: number;
  chapa: ChapaPadrao;
  itens: ItemNesting[];
  areaUtilizada: number;  // m²
  areaTotal: number;      // m²
  aproveitamento: number; // %
}

export interface ResultadoNesting {
  familia: string;
  espessuraMm: number;
  tipoInox: TipoInox;
  chapas: ChapaAlocada[];
  totalChapas: number;
  areaUtilizadaTotal: number;
  areaTotalChapas: number;
  aproveitamentoMedio: number;
  kgTotal: number;
  custoTotal: number;
}

// ============================================================================
// TIPOS - CUSTOS
// ============================================================================

export interface ItemCusto {
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  detalhes?: string;
}

export interface CategoriaCusto {
  nome: string;
  itens: ItemCusto[];
  subtotal: number;
}

export interface ResumoFinanceiro {
  custoMateriais: number;
  custoProcessos: number;
  custoAcessorios: number;
  subtotalDireto: number;
  overhead: number;
  custoTotal: number;
  margemMinima: number;
  precoMinimo: number;
  markup: number;
  precoSugerido: number;
}

export interface ResultadoOrcamento {
  bom: BOM;
  nesting: ResultadoNesting[];
  categorias: CategoriaCusto[];
  resumo: ResumoFinanceiro;
  avisos: string[];
  dataCalculo: string;
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

export interface ErroValidacao {
  campo: string;
  mensagem: string;
}

export async function validarBOM(bom: BOM): Promise<ErroValidacao[]> {
  const erros: ErroValidacao[] = [];
  
  if (!bom.pecasChapa.length && !bom.pecasTubo.length && !bom.pecasCantoneira.length) {
    erros.push({
      campo: 'bom',
      mensagem: 'BOM vazio: adicione pelo menos uma peça',
    });
  }
  
  for (const peca of bom.pecasChapa) {
    if (peca.largura <= 0 || peca.altura <= 0) {
      erros.push({
        campo: `peca_${peca.id}`,
        mensagem: `Dimensões inválidas para peça: ${peca.descricao}`,
      });
    }
    if (peca.quantidade <= 0) {
      erros.push({
        campo: `peca_${peca.id}`,
        mensagem: `Quantidade inválida para peça: ${peca.descricao}`,
      });
    }
    if (peca.espessuraMm <= 0) {
      erros.push({
        campo: `peca_${peca.id}`,
        mensagem: `Espessura inválida para peça: ${peca.descricao}`,
      });
    }
  }
  
  for (const tubo of bom.pecasTubo) {
    if (tubo.metros <= 0) {
      erros.push({
        campo: `tubo_${tubo.id}`,
        mensagem: `Metragem inválida para tubo: ${tubo.descricao}`,
      });
    }
  }
  
  for (const acessorio of bom.pecasAcessorio) {
    if (acessorio.quantidade <= 0) {
      erros.push({
        campo: `acessorio_${acessorio.id}`,
        mensagem: `Quantidade inválida para acessório: ${acessorio.descricao}`,
      });
    }
  }
  
  for (const processo of bom.processos) {
    if (processo.minutos < 0) {
      erros.push({
        campo: `processo_${processo.id}`,
        mensagem: `Tempo inválido para processo: ${processo.descricao}`,
      });
    }
  }
  
  return erros;
}

// ============================================================================
// NESTING 2D SIMPLIFICADO (usa algoritmo Guillotine)
// ============================================================================

interface EspacoLivre {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

class NestingEngine {
  private chapaLargura: number;
  private chapaAltura: number;
  private espacosLivres: EspacoLivre[] = [];
  private itensAlocados: ItemNesting[] = [];
  
  constructor(chapa: ChapaPadrao) {
    this.chapaLargura = chapa.largura;
    this.chapaAltura = chapa.altura;
    this.espacosLivres = [{
      x: 0,
      y: 0,
      largura: chapa.largura,
      altura: chapa.altura,
    }];
  }
  
  alocar(peca: PecaChapa, tentativa: number): boolean {
    let melhorEspaco: EspacoLivre | null = null;
    let rotacionar = false;
    let menorSobra = Infinity;
    
    for (const espaco of this.espacosLivres) {
      if (espaco.largura >= peca.largura && espaco.altura >= peca.altura) {
        const sobra = (espaco.largura * espaco.altura) - (peca.largura * peca.altura);
        if (sobra < menorSobra) {
          menorSobra = sobra;
          melhorEspaco = espaco;
          rotacionar = false;
        }
      }
      
      if (peca.podeRotacionar && espaco.largura >= peca.altura && espaco.altura >= peca.largura) {
        const sobra = (espaco.largura * espaco.altura) - (peca.altura * peca.largura);
        if (sobra < menorSobra) {
          menorSobra = sobra;
          melhorEspaco = espaco;
          rotacionar = true;
        }
      }
    }
    
    if (!melhorEspaco) return false;
    
    const larguraFinal = rotacionar ? peca.altura : peca.largura;
    const alturaFinal = rotacionar ? peca.largura : peca.altura;
    
    this.itensAlocados.push({
      id: `${peca.id}_${tentativa}`,
      descricao: peca.descricao,
      x: melhorEspaco.x,
      y: melhorEspaco.y,
      largura: larguraFinal,
      altura: alturaFinal,
      rotacionada: rotacionar,
    });
    
    this.dividirEspaco(melhorEspaco, larguraFinal, alturaFinal);
    return true;
  }
  
  private dividirEspaco(espaco: EspacoLivre, largura: number, altura: number) {
    this.espacosLivres = this.espacosLivres.filter(e => e !== espaco);
    
    const sobraH = espaco.largura - largura;
    const sobraV = espaco.altura - altura;
    
    if (sobraH > 0) {
      this.espacosLivres.push({
        x: espaco.x + largura,
        y: espaco.y,
        largura: sobraH,
        altura: espaco.altura,
      });
    }
    
    if (sobraV > 0) {
      this.espacosLivres.push({
        x: espaco.x,
        y: espaco.y + altura,
        largura: largura,
        altura: sobraV,
      });
    }
  }
  
  getItens(): ItemNesting[] {
    return this.itensAlocados;
  }
  
  getEstatisticas() {
    const areaTotal = (this.chapaLargura * this.chapaAltura) / 1_000_000; // m²
    const areaUtilizada = this.itensAlocados.reduce(
      (sum, item) => sum + ((item.largura * item.altura) / 1_000_000),
      0
    );
    return {
      areaTotal,
      areaUtilizada,
      aproveitamento: (areaUtilizada / areaTotal) * 100,
    };
  }
}

async function calcularNesting(
  pecas: PecaChapa[],
  familia: string,
  espessuraMm: number,
  tipoInox: TipoInox
): Promise<ResultadoNesting> {
  const chapas = await materiaisService.obterChapasPadrao();
  const config = await materiaisService.obterConfiguracoes();
  
  const pecasDaFamilia = pecas.filter(
    p => p.familia === familia && p.espessuraMm === espessuraMm && p.tipoInox === tipoInox
  );
  
  const pecasExpandidas: PecaChapa[] = [];
  for (const peca of pecasDaFamilia) {
    for (let i = 0; i < peca.quantidade; i++) {
      pecasExpandidas.push({ ...peca, quantidade: 1 });
    }
  }
  
  pecasExpandidas.sort((a, b) => (b.largura * b.altura) - (a.largura * a.altura));
  
  let melhorResultado: ChapaAlocada[] = [];
  let menorChapas = Infinity;
  
  for (const chapaBase of chapas) {
    const resultado: ChapaAlocada[] = [];
    const pecasRestantes = [...pecasExpandidas];
    let numeroChapa = 1;
    
    while (pecasRestantes.length > 0) {
      const engine = new NestingEngine(chapaBase);
      
      for (let i = pecasRestantes.length - 1; i >= 0; i--) {
        if (engine.alocar(pecasRestantes[i], numeroChapa)) {
          pecasRestantes.splice(i, 1);
        }
      }
      
      const stats = engine.getEstatisticas();
      
      resultado.push({
        numero: numeroChapa++,
        chapa: chapaBase,
        itens: engine.getItens(),
        areaUtilizada: stats.areaUtilizada,
        areaTotal: stats.areaTotal,
        aproveitamento: stats.aproveitamento,
      });
      
      if (pecasRestantes.length > 0 && engine.getItens().length === 0) {
        break;
      }
    }
    
    if (resultado.length < menorChapas && pecasRestantes.length === 0) {
      menorChapas = resultado.length;
      melhorResultado = resultado;
    }
  }
  
  const areaUtilizadaTotal = melhorResultado.reduce((sum, c) => sum + c.areaUtilizada, 0);
  const areaTotalChapas = melhorResultado.reduce((sum, c) => sum + c.areaTotal, 0);
  const aproveitamentoMedio = areaTotalChapas > 0 ? (areaUtilizadaTotal / areaTotalChapas) * 100 : 0;
  
  const espessuraM = espessuraMm / 1000;
  const volumeM3 = areaTotalChapas * espessuraM;
  const kgTotal = volumeM3 * config.densidadeInoxKgM3;
  
  const custoChapa = await materiaisService.calcularCustoChapa({
    tipoInox,
    espessuraMm,
    areaM2: areaTotalChapas,
  });
  
  return {
    familia,
    espessuraMm,
    tipoInox,
    chapas: melhorResultado,
    totalChapas: melhorResultado.length,
    areaUtilizadaTotal,
    areaTotalChapas,
    aproveitamentoMedio,
    kgTotal,
    custoTotal: custoChapa.custoTotal,
  };
}

// ============================================================================
// CÁLCULO DE ORÇAMENTO COMPLETO
// ============================================================================

export async function calcularOrcamento(bom: BOM): Promise<ResultadoOrcamento> {
  const avisos: string[] = [];
  const categorias: CategoriaCusto[] = [];
  
  const erros = await validarBOM(bom);
  if (erros.length > 0) {
    throw new Error(`Erros de validação: ${erros.map(e => e.mensagem).join(', ')}`);
  }
  
  const config = await materiaisService.obterConfiguracoes();
  
  const familias = new Set<string>();
  for (const peca of bom.pecasChapa) {
    const key = `${peca.familia}|${peca.espessuraMm}|${peca.tipoInox}`;
    familias.add(key);
  }
  
  const nestingResults: ResultadoNesting[] = [];
  let custoMateriais = 0;
  
  for (const key of familias) {
    const [familia, espessura, tipoInox] = key.split('|');
    const resultado = await calcularNesting(
      bom.pecasChapa,
      familia,
      Number(espessura),
      tipoInox as TipoInox
    );
    nestingResults.push(resultado);
    custoMateriais += resultado.custoTotal;
    
    if (resultado.aproveitamentoMedio < 60) {
      avisos.push(
        `Baixo aproveitamento (${resultado.aproveitamentoMedio.toFixed(1)}%) para ${familia} ${espessura}mm`
      );
    }
  }
  
  const itensChapasCat: ItemCusto[] = nestingResults.map(n => ({
    descricao: `Chapa ${n.tipoInox} ${n.espessuraMm}mm - ${n.familia}`,
    quantidade: n.totalChapas,
    unidade: 'chapa(s)',
    valorUnitario: n.custoTotal / n.totalChapas,
    valorTotal: n.custoTotal,
    detalhes: `${n.kgTotal.toFixed(2)}kg, ${n.aproveitamentoMedio.toFixed(1)}% aproveitamento`,
  }));
  
  let custoTubos = 0;
  const itensTubosCat: ItemCusto[] = [];
  for (const tubo of bom.pecasTubo) {
    const custo = await materiaisService.calcularCustoTubo({
      tuboId: tubo.tuboId,
      tipoInox: tubo.tipoInox,
      metros: tubo.metros,
    });
    custoTubos += custo.custoTotal;
    itensTubosCat.push({
      descricao: tubo.descricao,
      quantidade: tubo.metros,
      unidade: 'm',
      valorUnitario: custo.custoTotal / tubo.metros,
      valorTotal: custo.custoTotal,
      detalhes: `${custo.kgTotal.toFixed(2)}kg`,
    });
  }
  
  let custoCantoneiras = 0;
  const itensCantoneiraCat: ItemCusto[] = [];
  for (const cantoneira of bom.pecasCantoneira) {
    const custo = await materiaisService.calcularCustoCantoneira({
      cantoneiraId: cantoneira.cantoneiraId,
      tipoInox: cantoneira.tipoInox,
      metros: cantoneira.metros,
    });
    custoCantoneiras += custo.custoTotal;
    itensCantoneiraCat.push({
      descricao: cantoneira.descricao,
      quantidade: cantoneira.metros,
      unidade: 'm',
      valorUnitario: custo.custoTotal / cantoneira.metros,
      valorTotal: custo.custoTotal,
      detalhes: `${custo.kgTotal.toFixed(2)}kg`,
    });
  }
  
  categorias.push({
    nome: 'Chapas',
    itens: itensChapasCat,
    subtotal: custoMateriais,
  });
  
  if (itensTubosCat.length > 0) {
    categorias.push({
      nome: 'Tubos',
      itens: itensTubosCat,
      subtotal: custoTubos,
    });
  }
  
  if (itensCantoneiraCat.length > 0) {
    categorias.push({
      nome: 'Cantoneiras',
      itens: itensCantoneiraCat,
      subtotal: custoCantoneiras,
    });
  }
  
  custoMateriais += custoTubos + custoCantoneiras;
  
  let custoAcessorios = 0;
  const itensAcessoriosCat: ItemCusto[] = [];
  for (const acessorio of bom.pecasAcessorio) {
    const custo = await materiaisService.calcularCustoAcessorio({
      sku: acessorio.sku,
      quantidade: acessorio.quantidade,
    });
    custoAcessorios += custo.custoTotal;
    itensAcessoriosCat.push({
      descricao: custo.acessorio.nome,
      quantidade: acessorio.quantidade,
      unidade: custo.acessorio.unidade,
      valorUnitario: custo.precoUnitario,
      valorTotal: custo.custoTotal,
    });
  }
  
  if (itensAcessoriosCat.length > 0) {
    categorias.push({
      nome: 'Acessórios',
      itens: itensAcessoriosCat,
      subtotal: custoAcessorios,
    });
  }
  
  let custoProcessos = 0;
  const itensProcessosCat: ItemCusto[] = [];
  for (const processo of bom.processos) {
    const custo = await materiaisService.calcularCustoProcesso({
      tipo: processo.tipo,
      minutos: processo.minutos,
    });
    custoProcessos += custo.custoTotal;
    itensProcessosCat.push({
      descricao: custo.processo.descricao,
      quantidade: custo.horas,
      unidade: 'h',
      valorUnitario: custo.custoPorHora,
      valorTotal: custo.custoTotal,
      detalhes: `${processo.minutos}min`,
    });
  }
  
  if (itensProcessosCat.length > 0) {
    categorias.push({
      nome: 'Processos',
      itens: itensProcessosCat,
      subtotal: custoProcessos,
    });
  }
  
  const subtotalDireto = custoMateriais + custoProcessos + custoAcessorios;
  const overhead = subtotalDireto * (config.overheadPercent / 100);
  const custoTotal = subtotalDireto + overhead;
  
  const margemMinima = config.margemLucroMinima / 100;
  const precoMinimo = custoTotal / (1 - margemMinima);
  const precoSugerido = custoTotal * config.markupPadrao;
  
  const resumo: ResumoFinanceiro = {
    custoMateriais,
    custoProcessos,
    custoAcessorios,
    subtotalDireto,
    overhead,
    custoTotal,
    margemMinima,
    precoMinimo,
    markup: config.markupPadrao,
    precoSugerido: Math.max(precoSugerido, precoMinimo),
  };
  
  return {
    bom,
    nesting: nestingResults,
    categorias,
    resumo,
    avisos,
    dataCalculo: new Date().toISOString(),
  };
}
