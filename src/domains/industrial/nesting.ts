/**
 * ============================================================================
 * NESTING INDUSTRIAL PERFEITO
 * ============================================================================
 * Minimiza desperdício com restrições reais de fabricação
 */

import type { SheetPart } from './bom';
import type { MaterialKey, DimensaoChapa, ConfiguracoesSistema } from './entities';

// ============================================================================
// RESULTADO DE NESTING
// ============================================================================

export interface PecaAlocadaNesting {
  id: string;
  sheetPartId: string;
  descricao: string;
  x: number;              // mm (posição na chapa)
  y: number;              // mm
  largura: number;        // mm
  altura: number;         // mm
  rotacionada: boolean;
  sentidoEscovado?: 'horizontal' | 'vertical';
}

export interface ChapaUtilizada {
  numero: number;
  materialKey: string;
  dimensao: DimensaoChapa;
  pecas: PecaAlocadaNesting[];
  
  // Áreas
  areaTotal: number;        // m² (área da chapa)
  areaUtilizada: number;    // m² (soma das peças)
  areaPerdida: number;      // m² (sobra + kerf + margens)
  
  // Aproveitamento
  aproveitamento: number;   // % (areaUtilizada / areaTotal)
  perda: number;            // % (1 - aproveitamento)
  
  // Peso
  pesoTotal: number;        // kg (peso total da chapa comprada)
  pesoUtilizado: number;    // kg (peso das peças)
  pesoPerdido: number;      // kg (peso da sobra)
}

export interface ResultadoNestingGrupo {
  materialKey: string;
  familia: string;
  
  chapas: ChapaUtilizada[];
  
  // Totais do grupo
  totalChapas: number;
  totalKgComprado: number;
  totalKgUtilizado: number;
  totalKgPerdido: number;
  
  aproveitamentoMedio: number;  // %
  perdaMedio: number;           // %
  
  // Custos
  custoMaterial: number;        // R$
}

export interface ResultadoNestingCompleto {
  grupos: ResultadoNestingGrupo[];
  
  // Totais gerais
  totalChapasTodasFamilias: number;
  totalKgCompradoGeral: number;
  totalKgUtilizadoGeral: number;
  totalKgPerdidoGeral: number;
  
  aproveitamentoGeralMedio: number;  // %
  perdaGeralMedia: number;           // %
  perdaRealAjustada: number;         // % (com perdaMinimaOperacional + perdaSetup)
  
  custoMaterialTotal: number;        // R$
  
  avisos: string[];
}

// ============================================================================
// NESTING ENGINE COM RESTRIÇÕES REAIS
// ============================================================================

interface EspacoLivre {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export class NestingIndustrial {
  private chapaLargura: number;
  private chapaAltura: number;
  private espacosLivres: EspacoLivre[];
  private pecasAlocadas: PecaAlocadaNesting[];
  
  // Restrições reais
  private kerfMm: number;
  private margemMinima: number;
  private margemBorda: number;
  
  constructor(
    dimensao: DimensaoChapa,
    config: ConfiguracoesSistema
  ) {
    this.chapaLargura = dimensao.largura;
    this.chapaAltura = dimensao.altura;
    this.kerfMm = config.kerfMm;
    this.margemMinima = config.margemMinimaEntrePecasMm;
    this.margemBorda = config.margemBordaMm;
    
    // Área útil inicial (descontando margens das bordas)
    this.espacosLivres = [{
      x: this.margemBorda,
      y: this.margemBorda,
      largura: this.chapaLargura - (2 * this.margemBorda),
      altura: this.chapaAltura - (2 * this.margemBorda),
    }];
    
    this.pecasAlocadas = [];
  }
  
  /**
   * Tenta alocar uma peça considerando:
   * - Kerf (largura do corte)
   * - Margem mínima entre peças
   * - Sentido do escovado (se aplicável)
   */
  alocar(part: SheetPart): boolean {
    const larguraPeca = part.larguraMm;
    const alturaPeca = part.alturaMm;
    
    // Dimensões reais necessárias (peça + kerf + margem)
    const larguraNecessaria = larguraPeca + this.kerfMm + this.margemMinima;
    const alturaNecessaria = alturaPeca + this.kerfMm + this.margemMinima;
    
    // Tentar sem rotação
    let melhorEspaco = this.encontrarMelhorEspaco(larguraNecessaria, alturaNecessaria);
    let rotacionar = false;
    
    // Tentar com rotação (se permitido)
    if (!melhorEspaco && part.permiteRotacao) {
      melhorEspaco = this.encontrarMelhorEspaco(alturaNecessaria, larguraNecessaria);
      rotacionar = true;
    }
    
    if (!melhorEspaco) return false;
    
    // Verificar sentido escovado (se aplicável)
    if (part.sentidoEscovado) {
      // Aqui você pode adicionar lógica para garantir sentido correto
      // Por ora, apenas registramos
    }
    
    // Alocar
    const larguraFinal = rotacionar ? alturaPeca : larguraPeca;
    const alturaFinal = rotacionar ? larguraPeca : alturaPeca;
    
    this.pecasAlocadas.push({
      id: `alocado_${this.pecasAlocadas.length + 1}`,
      sheetPartId: part.id,
      descricao: `${part.familia}_${part.larguraMm}x${part.alturaMm}`,
      x: melhorEspaco.x,
      y: melhorEspaco.y,
      largura: larguraFinal,
      altura: alturaFinal,
      rotacionada: rotacionar,
      sentidoEscovado: part.sentidoEscovado,
    });
    
    // Dividir espaço
    this.dividirEspaco(melhorEspaco, larguraNecessaria, alturaNecessaria);
    
    return true;
  }
  
  private encontrarMelhorEspaco(largura: number, altura: number): EspacoLivre | null {
    let melhor: EspacoLivre | null = null;
    let menorSobra = Infinity;
    
    for (const espaco of this.espacosLivres) {
      if (espaco.largura >= largura && espaco.altura >= altura) {
        const sobra = (espaco.largura * espaco.altura) - (largura * altura);
        if (sobra < menorSobra) {
          menorSobra = sobra;
          melhor = espaco;
        }
      }
    }
    
    return melhor;
  }
  
  private dividirEspaco(espaco: EspacoLivre, largura: number, altura: number): void {
    this.espacosLivres = this.espacosLivres.filter(e => e !== espaco);
    
    const sobraH = espaco.largura - largura;
    const sobraV = espaco.altura - altura;
    
    // Criar novos espaços livres
    if (sobraH > this.margemMinima) {
      this.espacosLivres.push({
        x: espaco.x + largura,
        y: espaco.y,
        largura: sobraH,
        altura: espaco.altura,
      });
    }
    
    if (sobraV > this.margemMinima) {
      this.espacosLivres.push({
        x: espaco.x,
        y: espaco.y + altura,
        largura: largura,
        altura: sobraV,
      });
    }
  }
  
  getPecas(): PecaAlocadaNesting[] {
    return this.pecasAlocadas;
  }
  
  calcularEstatisticas(materialKey: MaterialKey): {
    areaTotal: number;
    areaUtilizada: number;
    areaPerdida: number;
    aproveitamento: number;
    perda: number;
    pesoTotal: number;
    pesoUtilizado: number;
    pesoPerdido: number;
  } {
    const areaTotal = (this.chapaLargura * this.chapaAltura) / 1_000_000; // m²
    
    let areaUtilizada = 0;
    for (const peca of this.pecasAlocadas) {
      areaUtilizada += (peca.largura * peca.altura) / 1_000_000;
    }
    
    const areaPerdida = areaTotal - areaUtilizada;
    const aproveitamento = (areaUtilizada / areaTotal) * 100;
    const perda = 100 - aproveitamento;
    
    // Peso
    const espessuraM = materialKey.espessuraMm / 1000;
    const pesoTotal = areaTotal * espessuraM * materialKey.densidade;
    const pesoUtilizado = areaUtilizada * espessuraM * materialKey.densidade;
    const pesoPerdido = pesoTotal - pesoUtilizado;
    
    return {
      areaTotal,
      areaUtilizada,
      areaPerdida,
      aproveitamento,
      perda,
      pesoTotal,
      pesoUtilizado,
      pesoPerdido,
    };
  }
}

// ============================================================================
// EXECUTAR NESTING PARA UM GRUPO DE PEÇAS
// ============================================================================

export function executarNesting(
  parts: SheetPart[],
  materialKey: MaterialKey,
  familia: string,
  config: ConfiguracoesSistema
): ResultadoNestingGrupo {
  const avisos: string[] = [];
  
  // Expandir peças por quantidade
  const pecasExpandidas: SheetPart[] = [];
  for (const part of parts) {
    for (let i = 0; i < part.quantidade; i++) {
      pecasExpandidas.push({ ...part, quantidade: 1 });
    }
  }
  
  // Ordenar por área decrescente (heurística)
  pecasExpandidas.sort((a, b) => 
    (b.larguraMm * b.alturaMm) - (a.larguraMm * a.alturaMm)
  );
  
  // Testar todas as dimensões disponíveis
  let melhorResultado: ChapaUtilizada[] = [];
  let menorChapas = Infinity;
  
  for (const dimensao of materialKey.dimensoesChapaDisponiveis) {
    const resultado: ChapaUtilizada[] = [];
    const pecasRestantes = [...pecasExpandidas];
    let numeroChapa = 1;
    
    while (pecasRestantes.length > 0) {
      const engine = new NestingIndustrial(dimensao, config);
      
      let alocouAlgo = false;
      for (let i = pecasRestantes.length - 1; i >= 0; i--) {
        if (engine.alocar(pecasRestantes[i])) {
          pecasRestantes.splice(i, 1);
          alocouAlgo = true;
        }
      }
      
      if (!alocouAlgo && pecasRestantes.length > 0) {
        avisos.push(`Peça não cabe em chapa ${dimensao.label}: ${pecasRestantes[0].larguraMm}×${pecasRestantes[0].alturaMm}mm`);
        break;
      }
      
      const stats = engine.calcularEstatisticas(materialKey);
      
      resultado.push({
        numero: numeroChapa++,
        materialKey: materialKey.materialKey,
        dimensao,
        pecas: engine.getPecas(),
        areaTotal: stats.areaTotal,
        areaUtilizada: stats.areaUtilizada,
        areaPerdida: stats.areaPerdida,
        aproveitamento: stats.aproveitamento,
        perda: stats.perda,
        pesoTotal: stats.pesoTotal,
        pesoUtilizado: stats.pesoUtilizado,
        pesoPerdido: stats.pesoPerdido,
      });
    }
    
    if (resultado.length < menorChapas && pecasRestantes.length === 0) {
      menorChapas = resultado.length;
      melhorResultado = resultado;
    }
  }
  
  // Calcular totais
  const totalChapas = melhorResultado.length;
  const totalKgComprado = melhorResultado.reduce((sum, c) => sum + c.pesoTotal, 0);
  const totalKgUtilizado = melhorResultado.reduce((sum, c) => sum + c.pesoUtilizado, 0);
  const totalKgPerdido = totalKgComprado - totalKgUtilizado;
  
  const aproveitamentoMedio = totalKgComprado > 0 
    ? (totalKgUtilizado / totalKgComprado) * 100 
    : 0;
  const perdaMedio = 100 - aproveitamentoMedio;
  
  // Custo
  const custoMaterial = totalKgComprado * materialKey.precoPorKg;
  
  return {
    materialKey: materialKey.materialKey,
    familia,
    chapas: melhorResultado,
    totalChapas,
    totalKgComprado,
    totalKgUtilizado,
    totalKgPerdido,
    aproveitamentoMedio,
    perdaMedio,
    custoMaterial,
  };
}

// ============================================================================
// EXECUTAR NESTING COMPLETO PARA TODAS AS FAMÍLIAS
// ============================================================================

export function executarNestingCompleto(
  parts: SheetPart[],
  registry: Record<string, MaterialKey>,
  config: ConfiguracoesSistema
): ResultadoNestingCompleto {
  const avisos: string[] = [];
  const grupos: ResultadoNestingGrupo[] = [];
  
  // Agrupar por materialKey + familia
  const gruposPecas = new Map<string, SheetPart[]>();
  for (const part of parts) {
    const chave = `${part.materialKey}|${part.familia}`;
    const arr = gruposPecas.get(chave) || [];
    arr.push(part);
    gruposPecas.set(chave, arr);
  }
  
  // Executar nesting para cada grupo
  for (const [chave, pecas] of gruposPecas) {
    const [materialKey, familia] = chave.split('|');
    const material = registry[materialKey];
    
    if (!material) {
      avisos.push(`Material não encontrado: ${materialKey}`);
      continue;
    }
    
    const resultado = executarNesting(pecas, material, familia, config);
    grupos.push(resultado);
    
    // Avisar se aproveitamento baixo
    if (resultado.aproveitamentoMedio < config.aproveitamentoMinimoAceitavel) {
      avisos.push(
        `Baixo aproveitamento (${resultado.aproveitamentoMedio.toFixed(1)}%) ` +
        `para ${familia} - ${materialKey}`
      );
    }
  }
  
  // Totais gerais
  const totalChapasTodasFamilias = grupos.reduce((sum, g) => sum + g.totalChapas, 0);
  const totalKgCompradoGeral = grupos.reduce((sum, g) => sum + g.totalKgComprado, 0);
  const totalKgUtilizadoGeral = grupos.reduce((sum, g) => sum + g.totalKgUtilizado, 0);
  const totalKgPerdidoGeral = totalKgCompradoGeral - totalKgUtilizadoGeral;
  
  const aproveitamentoGeralMedio = totalKgCompradoGeral > 0 
    ? (totalKgUtilizadoGeral / totalKgCompradoGeral) * 100 
    : 0;
  const perdaGeralMedia = 100 - aproveitamentoGeralMedio;
  
  // PERDA REAL AJUSTADA
  // perdaReal = max(perdaMinimaOperacional, perdaNesting) + perdaSetup
  const perdaRealAjustada = Math.max(
    config.perdaMinimaOperacional,
    perdaGeralMedia
  ) + config.perdaSetup;
  
  const custoMaterialTotal = grupos.reduce((sum, g) => sum + g.custoMaterial, 0);
  
  return {
    grupos,
    totalChapasTodasFamilias,
    totalKgCompradoGeral,
    totalKgUtilizadoGeral,
    totalKgPerdidoGeral,
    aproveitamentoGeralMedio,
    perdaGeralMedia,
    perdaRealAjustada,
    custoMaterialTotal,
    avisos,
  };
}
