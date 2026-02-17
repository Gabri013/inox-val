/**
 * ============================================================================
 * MOTOR DE CÁLCULO DA CALCULADORA RÁPIDA
 * ============================================================================
 * 
 * REGRA FUNDAMENTAL:
 * Este motor usa EXCLUSIVAMENTE os modelos parametrizados de /src/bom/models.
 * NÃO permite criação de produtos livres.
 * 
 * Fluxo obrigatório:
 * 1. Selecionar modelo existente (ModeloBOM)
 * 2. Configurar dimensões e opções (MesaConfig)
 * 3. Gerar BOM via gerarBOMIndustrial()
 * 4. Calcular Nesting otimizado com Pack2D (layout real)
 * 5. Calcular Precificação detalhada
 * ============================================================================
 */

import { gerarBOMIndustrial } from '../../bom/models';
import type { BOMItem } from '../../bom/types';
import { Pack2D, expandirPecas } from '../nesting/pack2d';
import type { ResultadoNestingChapa as ResultadoNestingChapaReal } from '../nesting/nesting.types';
import {
  type EntradaCalculadora,
  type ResultadoCalculadora,
  type ResultadoNesting,
  type PecaNesting,
  type ResultadoNestingChapa,
  type ResultadoPrecificacao,
  type CustoCategoria,
  type CustoItem,
  CHAPAS_PADRAO,
} from './types';

/**
 * Motor de Cálculo da Calculadora Rápida
 * 
 * Executa as 3 etapas técnicas obrigatórias:
 * 1. BOM - Geração via modelos parametrizados (gerarBOMIndustrial)
 * 2. Nesting - Otimização de chapas
 * 3. Precificação - Cálculo de custos e preço final
 */
export class CalculadoraEngine {
  private static _unusedBomItem?: BOMItem;
  
  /**
   * ETAPA 1: GERAÇÃO DE BOM
   * Usa os modelos reais de /src/bom/models via gerarBOMIndustrial
   */
  private static gerarBOM(entrada: EntradaCalculadora) {
    const { modelo, config } = entrada;
    
    // Chamar a função dos modelos reais
    const bomResult = gerarBOMIndustrial(modelo, config);
    
    return bomResult;
  }
  
  /**
   * ETAPA 2: NESTING COM PACK2D REAL
   * Calcula aproveitamento de chapas com layout 2D real (posições x/y)
   */
  static calcularNesting(bomResult: import('../../bom/types').BOMResult): ResultadoNesting {
    void this._unusedBomItem;
    // Extrair peças de chapa da BOM
    const pecasChapa = bomResult.bom.filter(item => 
      item.material?.includes('CHAPA') || 
      item.processo?.includes('LASER') ||
      (item.w && item.h && item.espessura)
    );
    
    // Converter para formato de nesting
    const pecas: PecaNesting[] = pecasChapa
      .filter(item => item.w && item.h)
      .map((item, idx) => ({
        id: `peca-${idx + 1}`,
        descricao: item.desc,
        comprimento: item.h || 0,
        largura: item.w || 0,
        quantidade: item.qtd,
        area: ((item.h || 0) * (item.w || 0)) / 1_000_000, // Converter mm² para m²
      }));
    
    // Calcular área total das peças
    const totalAreaPecas = pecas.reduce((sum, p) => sum + (p.area * p.quantidade), 0);
    
    // Se não há peças de chapa, retornar resultado vazio
    if (pecas.length === 0) {
      const chapaDefault = CHAPAS_PADRAO[0];
      return {
        opcoes: [],
        melhorOpcao: {
          chapa: chapaDefault,
          pecasAlocadas: 0,
          quantidadeChapas: 0,
          areaUtilizada: 0,
          areaTotal: 0,
          aproveitamento: 0,
          sobra: 0,
          // Adicionar campos obrigatórios para evitar erro
          itensAlocados: [],
          chapasLayouts: [],
        },
        pecas: [],
        totalAreaPecas: 0,
      };
    }
    
    // ========================================================================
    // NOVO: Usar Pack2D para calcular nesting real com posições
    // ========================================================================
    
    const packer = new Pack2D(5, 5); // kerf 5mm, margem 5mm
    
    // Testar cada opção de chapa padrão com Pack2D
    const opcoes: ResultadoNestingChapa[] = CHAPAS_PADRAO.map(chapa => {
      // Expandir peças com quantidade > 1
      const pecasExpandidas = expandirPecas(
        pecas.map(p => ({
          id: p.id,
          descricao: p.descricao,
          largura: p.largura,
          altura: p.comprimento,
          quantidade: p.quantidade,
        }))
      );
      
      // Executar packing 2D
      const resultado = packer.pack(pecasExpandidas, {
        largura: chapa.largura,
        altura: chapa.comprimento,
        nome: chapa.nome,
      });
      
      // Converter resultado do Pack2D para formato da calculadora
      const quantidadeChapas = resultado.totalChapas;
      const areaUtilizada = resultado.layouts.reduce(
        (sum, layout) => sum + layout.areaUtilizada,
        0
      ) / 1_000_000; // mm² → m²
      
      const areaTotal = quantidadeChapas * chapa.area;
      const aproveitamento = areaTotal > 0 ? (areaUtilizada / areaTotal) * 100 : 0;
      const sobra = 100 - aproveitamento;
      
      // Pegar itens da primeira chapa para compatibilidade com UI antiga
      const primeiraChapa = resultado.layouts[0];
      const itensAlocados = primeiraChapa?.itensAlocados || [];
      
      // Montar chapasLayouts para múltiplas chapas
      const chapasLayouts = resultado.layouts.map(layout => ({
        index: layout.index,
        itensAlocados: layout.itensAlocados,
        aproveitamento: layout.aproveitamento,
      }));
      
      return {
        chapa,
        pecasAlocadas: resultado.totalPecasAlocadas,
        quantidadeChapas,
        areaUtilizada: Math.round(areaUtilizada * 1000) / 1000,
        areaTotal: Math.round(areaTotal * 1000) / 1000,
        aproveitamento: Math.round(aproveitamento * 10) / 10,
        sobra: Math.round(sobra * 10) / 10,
        // Campos novos para layout 2D real
        itensAlocados,
        chapasLayouts,
      } as ResultadoNestingChapa & ResultadoNestingChapaReal;
    });
    
    // Determinar melhor opção (maior aproveitamento)
    const melhorOpcao = opcoes.reduce((melhor, atual) => 
      atual.aproveitamento > melhor.aproveitamento ? atual : melhor
    );
    
    return {
      opcoes,
      melhorOpcao,
      pecas,
      totalAreaPecas: Math.round(totalAreaPecas * 1000) / 1000,
    };
  }
  
  /**
   * ETAPA 3: PRECIFICAÇÃO
   * Calcula custos detalhados baseado na BOM real e preços configurados
   */
  static calcularPrecificacao(
    entrada: EntradaCalculadora,
    bomResult: import('../../bom/types').BOMResult,
    nesting: ResultadoNesting
  ): ResultadoPrecificacao {
    void nesting;
    const { precificacao } = entrada;
    
    // Usar os custos já calculados na BOM
    const custoMaterialBOM = bomResult.totais.custoMaterial || 0;
    const custoMaoObraBOM = bomResult.totais.custoMaoObra || 0;
    
    // Criar categorias de custo baseadas na BOM
    const itensMaterial: CustoItem[] = bomResult.bom.map(item => ({
      descricao: item.desc,
      quantidade: item.qtd,
      unidade: item.unidade || 'un',
      precoUnitario: item.custo || 0,
      subtotal: item.custoTotal || 0,
      observacao: item.obs,
    }));
    
    const custosMaterial: CustoCategoria = {
      categoria: 'Material',
      itens: itensMaterial,
      subtotal: custoMaterialBOM,
    };
    
    // Mão de obra
    const custoMaoObra = precificacao.custoMaoObra || custoMaoObraBOM;
    const custosMaoObra: CustoCategoria = {
      categoria: 'Mão de Obra',
      itens: [
        {
          descricao: 'Fabricação e Montagem',
          quantidade: 1,
          unidade: 'un',
          precoUnitario: custoMaoObra,
          subtotal: custoMaoObra,
        },
      ],
      subtotal: custoMaoObra,
    };
    
    // Cálculos finais
    const subtotalMaterial = custoMaterialBOM;
    const perdaMaterial = subtotalMaterial * (precificacao.perdaMaterial / 100);
    const totalComPerda = subtotalMaterial + perdaMaterial;
    
    const custoTotal = totalComPerda + custoMaoObra;
    
    const margemLucro = custoTotal * (precificacao.margemLucro / 100);
    const precoFinal = custoTotal + margemLucro;
    
    // Breakdown percentual
    const breakdown = {
      percentualMaterial: Math.round((totalComPerda / custoTotal) * 100),
      percentualMaoObra: Math.round((custoMaoObra / custoTotal) * 100),
      percentualMargem: precificacao.margemLucro,
    };
    
    return {
      custosMaterial,
      custosMaoObra,
      subtotalMaterial: Math.round(subtotalMaterial * 100) / 100,
      perdaMaterial: Math.round(perdaMaterial * 100) / 100,
      totalComPerda: Math.round(totalComPerda * 100) / 100,
      custoMaoObra: Math.round(custoMaoObra * 100) / 100,
      custoTotal: Math.round(custoTotal * 100) / 100,
      margemLucro: Math.round(margemLucro * 100) / 100,
      precoFinal: Math.round(precoFinal * 100) / 100,
      breakdown,
    };
  }
  
  /**
   * PROCESSO COMPLETO
   * Executa todas as 3 etapas e retorna resultado completo
   */
  static calcular(entrada: EntradaCalculadora): ResultadoCalculadora {
    // Etapa 1: Gerar BOM usando modelos reais
    const bomResult = this.gerarBOM(entrada);
    
    // Etapa 2: Calcular Nesting
    const nesting = this.calcularNesting(bomResult);
    
    // Etapa 3: Calcular Precificação
    const precificacao = this.calcularPrecificacao(entrada, bomResult, nesting);

    return {
      entrada,
      bomResult,
      bom: bomResult,
      nesting,
      custos: {
        categorias: [precificacao.custosMaterial, precificacao.custosMaoObra],
        custoTotal: precificacao.custoTotal,
      },
      precificacao,
      dataCalculo: new Date().toISOString(),
      versao: '2.0.0',
    };
  }
}
