/**
 * ============================================================================
 * ENGINE DE NESTING - OTIMIZAÇÃO DE APROVEITAMENTO DE CHAPAS
 * ============================================================================
 * 
 * Por que o nesting é obrigatório:
 * 
 * O custo real de uma bancada NÃO depende apenas da área das peças somadas.
 * Depende de QUANTAS CHAPAS você vai comprar e QUANTO vai desperdiçar.
 * 
 * Exemplo:
 * - Peças: 2,5 m² de inox
 * - Chapa disponível: 3,125 m² (2,5×1,25m)
 * - Sem nesting: "preciso de 1 chapa" ❌ ERRADO
 * - Com nesting: descobrir que as peças NÃO cabem em 1 chapa,
 *   precisam de 2 chapas = 6,25 m² = custo 2,5× maior!
 * 
 * O nesting calcula:
 * 1. Quantas chapas reais serão necessárias
 * 2. Qual tamanho de chapa minimiza desperdício
 * 3. Aproveitamento real (área útil / área total)
 * 4. Sobra de material (aparas e retalhos)
 * 
 * Sem nesting preciso, o vendedor erra o custo e a empresa perde dinheiro.
 * 
 * Fluxo: BOM → Nesting → Custo Real → Preço Correto → Margem Preservada
 * ============================================================================
 */

import type { 
  ItemNesting, 
  MaterialBase, 
  ResultadoAproveitamento, 
  ParametrosCalculo,
  TipoMaterial 
} from './nesting.types';

/**
 * Calcula o aproveitamento de uma bancada de nesting
 */
export function calcularAproveitamento(
  itens: ItemNesting[],
  materialBase: MaterialBase,
  parametros: ParametrosCalculo
): ResultadoAproveitamento {
  const tipo = materialBase.tipo;
  
  switch (tipo) {
    case 'CHAPA':
      return calcularAproveitamentoChapa(itens, materialBase, parametros);
    case 'TUBO':
    case 'PERFIL':
    case 'BARRA':
      return calcularAproveitamentoLinear(itens, materialBase, parametros);
    default:
      throw new Error(`Tipo de material não suportado: ${tipo}`);
  }
}

/**
 * Calcula aproveitamento para chapas (2D)
 */
function calcularAproveitamentoChapa(
  itens: ItemNesting[],
  materialBase: MaterialBase,
  parametros: ParametrosCalculo
): ResultadoAproveitamento {
  if (!materialBase.largura || !materialBase.comprimento) {
    throw new Error('Material base deve ter largura e comprimento definidos');
  }
  
  // Área da chapa mãe em mm²
  const areaChapaMae = materialBase.largura * materialBase.comprimento;
  void areaChapaMae;
  
  // Calcula área útil descontando perdas de borda
  const larguraUtil = materialBase.largura - (parametros.perdaBorda * 2);
  const comprimentoUtil = materialBase.comprimento - (parametros.perdaBorda * 2);
  const areaUtil = larguraUtil * comprimentoUtil;
  
  // Calcula área total necessária dos itens
  let areaTotalItens = 0;
  
  for (const item of itens) {
    if (!item.largura || !item.comprimento) {
      throw new Error(`Item ${item.descricao} deve ter largura e comprimento definidos`);
    }
    
    // Área do item incluindo espaçamento de corte
    const larguraComEspacamento = item.largura + parametros.espacamentoCorte;
    const comprimentoComEspacamento = item.comprimento + parametros.espacamentoCorte;
    const areaItem = larguraComEspacamento * comprimentoComEspacamento;
    
    areaTotalItens += areaItem * item.quantidade;
  }
  
  // Aplica eficiência de corte (considera desperdício por má otimização)
  const areaConsiderada = areaTotalItens / (parametros.eficienciaCorte / 100);
  
  // Calcula quantas chapas são necessárias
  const quantidadeChapas = Math.ceil(areaConsiderada / areaUtil);
  
  // Calcula aproveitamento real
  const areaUsada = areaConsiderada;
  const areaDisponivel = areaUtil * quantidadeChapas;
  const aproveitamento = (areaUsada / areaDisponivel) * 100;
  
  // Calcula sobra em m²
  const sobra = ((areaDisponivel - areaUsada) / 1000000); // mm² para m²
  
  // Custos
  const custoMaterial = materialBase.custoTotal * quantidadeChapas;
  
  // Custo de corte estimado (baseado no perímetro total a ser cortado)
  let perimetroTotal = 0;
  for (const item of itens) {
    const perimetroItem = 2 * ((item.largura || 0) + (item.comprimento || 0));
    perimetroTotal += perimetroItem * item.quantidade;
  }
  const custoCorte = (perimetroTotal / 1000) * 2.5; // R$ 2,50 por metro linear
  
  return {
    quantidadeMateriais: quantidadeChapas,
    aproveitamento: Math.min(aproveitamento, 100),
    sobra,
    custoMaterial,
    custoCorte,
    custoTotal: custoMaterial + custoCorte,
  };
}

/**
 * Calcula aproveitamento para materiais lineares (tubos, perfis, barras)
 */
function calcularAproveitamentoLinear(
  itens: ItemNesting[],
  materialBase: MaterialBase,
  parametros: ParametrosCalculo
): ResultadoAproveitamento {
  if (!materialBase.comprimento) {
    throw new Error('Material base deve ter comprimento definido');
  }
  
  // Comprimento útil descontando perdas
  const comprimentoUtil = materialBase.comprimento - (parametros.perdaBorda * 2);
  
  // Ordena itens por comprimento decrescente (heurística gulosa)
  const itensOrdenados = [...itens]
    .flatMap(item => Array(item.quantidade).fill({
      ...item,
      quantidade: 1
    }))
    .sort((a, b) => (b.comprimento || 0) - (a.comprimento || 0));
  
  // Algoritmo First-Fit Decreasing (FFD)
  const barras: number[] = []; // Espaço usado em cada barra
  
  for (const item of itensOrdenados) {
    const comprimentoNecessario = (item.comprimento || 0) + parametros.espacamentoCorte;
    
    // Tenta encaixar em uma barra existente
    let encaixou = false;
    for (let i = 0; i < barras.length; i++) {
      if (barras[i] + comprimentoNecessario <= comprimentoUtil) {
        barras[i] += comprimentoNecessario;
        encaixou = true;
        break;
      }
    }
    
    // Se não encaixou, cria nova barra
    if (!encaixou) {
      barras.push(comprimentoNecessario);
    }
  }
  
  // Aplica eficiência
  const quantidadeBarras = Math.ceil(barras.length / (parametros.eficienciaCorte / 100));
  
  // Calcula aproveitamento
  const comprimentoUsado = barras.reduce((acc, val) => acc + val, 0);
  const comprimentoDisponivel = comprimentoUtil * quantidadeBarras;
  const aproveitamento = (comprimentoUsado / comprimentoDisponivel) * 100;
  
  // Sobra em metros
  const sobra = (comprimentoDisponivel - comprimentoUsado) / 1000;
  
  // Custos
  const custoMaterial = materialBase.custoTotal * quantidadeBarras;
  const custoCorte = itensOrdenados.length * 3.0; // R$ 3,00 por corte
  
  return {
    quantidadeMateriais: quantidadeBarras,
    aproveitamento: Math.min(aproveitamento, 100),
    sobra,
    custoMaterial,
    custoCorte,
    custoTotal: custoMaterial + custoCorte,
  };
}

/**
 * Calcula o peso total dos itens
 */
export function calcularPesoTotal(itens: ItemNesting[]): number {
  return itens.reduce((acc, item) => {
    return acc + ((item.peso || 0) * item.quantidade);
  }, 0);
}

/**
 * Calcula a área total dos itens (para chapas)
 */
export function calcularAreaTotal(itens: ItemNesting[]): number {
  return itens.reduce((acc, item) => {
    if (item.largura && item.comprimento) {
      const area = (item.largura * item.comprimento) / 1000000; // mm² para m²
      return acc + (area * item.quantidade);
    }
    return acc;
  }, 0);
}

/**
 * Valida se os itens são compatíveis com o tipo de material
 */
export function validarCompatibilidade(
  itens: ItemNesting[],
  tipoMaterial: TipoMaterial
): { valido: boolean; erros: string[] } {
  const erros: string[] = [];
  
  for (const item of itens) {
    switch (tipoMaterial) {
      case 'CHAPA':
        if (!item.largura || !item.comprimento) {
          erros.push(`Item "${item.descricao}" requer largura e comprimento para chapas`);
        }
        break;
      case 'TUBO':
      case 'PERFIL':
      case 'BARRA':
        if (!item.comprimento) {
          erros.push(`Item "${item.descricao}" requer comprimento para materiais lineares`);
        }
        break;
    }
  }
  
  return {
    valido: erros.length === 0,
    erros,
  };
}

/**
 * Parâmetros padrão de cálculo
 */
export const PARAMETROS_PADRAO: ParametrosCalculo = {
  espacamentoCorte: 3, // 3mm entre peças
  perdaBorda: 10, // 10mm de perda nas bordas
  eficienciaCorte: 85, // 85% de eficiência
};
