/**
 * SISTEMA DE ORÇAMENTO E PRECIFICAÇÃO
 * Cálculo automático de custos baseado em BOM e Nesting
 */

import type { Resultado } from "../domain/mesas/types";
import type { ResultadoNesting } from "./nestingProfissional";
import type { TabelaPrecos, CustoDetalhado, Orcamento } from "../types/projeto";

// ========== CÁLCULO DE CUSTO DE MATERIAL ==========

function calcularCustoMaterial(
  bom: Resultado,
  nesting: ResultadoNesting | undefined,
  tabela: TabelaPrecos
): { chapas: number; tubos: number; outros: number; total: number } {
  let custoChapas = 0;
  let custoTubos = 0;
  let custoOutros = 0;

  // Se temos nesting, usar área real das chapas consumidas
  if (nesting?.resumo) {
    const areaTotal_m2 = nesting.resumo.areaTotal_m2;

    // Pegar espessura mais comum (simplificação)
    const grupos = nesting.grupos;
    if (grupos.length > 0) {
      const espMaisComum = grupos[0].esp_mm;
      const material = grupos[0].material;

      let precoPorM2 = tabela.materiais["AISI304_2.0mm"]; // Padrão

      // Mapear material + espessura
      const key = `${material}_${espMaisComum}mm` as keyof typeof tabela.materiais;
      if (tabela.materiais[key]) {
        precoPorM2 = tabela.materiais[key];
      } else if (espMaisComum === 1.5) {
        precoPorM2 = tabela.materiais["AISI304_1.5mm"];
      } else if (espMaisComum === 2.0) {
        precoPorM2 = tabela.materiais["AISI304_2.0mm"];
      } else if (espMaisComum === 3.0) {
        precoPorM2 = tabela.materiais["AISI304_3.0mm"];
      }

      custoChapas = areaTotal_m2 * precoPorM2;
    }
  } else {
    // Fallback: estimar pela BOM
    for (const item of bom.bom) {
      if (item.w && item.h) {
        // Chapa plana
        const area_m2 = (item.w * item.h * item.qtd) / 1_000_000;
        const esp = item.esp || 2.0;

        let precoPorM2 = tabela.materiais["AISI304_2.0mm"];
        if (esp <= 1.5) precoPorM2 = tabela.materiais["AISI304_1.5mm"];
        else if (esp <= 2.0) precoPorM2 = tabela.materiais["AISI304_2.0mm"];
        else precoPorM2 = tabela.materiais["AISI304_3.0mm"];

        custoChapas += area_m2 * precoPorM2;
      }
    }
  }

  // Calcular tubos (estimativa simplificada)
  const numTubos = bom.bom.filter((item) => item.diametro || item.desc.includes("Tubo")).length;
  custoTubos = numTubos * 45; // R$ 45 por tubo médio

  // Outros (pés, niveladores, etc)
  const numOutros = bom.bom.filter((item) => !item.w && !item.h && !item.diametro && !item.desc.includes("Tubo")).length;
  custoOutros = numOutros * 15; // R$ 15 por item médio

  return {
    chapas: custoChapas,
    tubos: custoTubos,
    outros: custoOutros,
    total: custoChapas + custoTubos + custoOutros,
  };
}

// ========== CÁLCULO DE MÃO DE OBRA ==========

function calcularCustoMaoDeObra(
  bom: Resultado,
  nesting: ResultadoNesting | undefined,
  tabela: TabelaPrecos
): {
  corte: { tempo_min: number; custo: number };
  solda: { tempo_min: number; custo: number };
  polimento: { tempo_min: number; custo: number };
  dobra: { tempo_min: number; custo: number };
  total: number;
} {
  // CORTE: baseado no número de chapas
  const numChapas = nesting?.resumo.totalChapas || Math.ceil(bom.bom.filter((i) => i.w && i.h).length / 3);
  const tempoCorte_min = numChapas * 15; // 15min por chapa
  const custoCorte = tempoCorte_min * tabela.maoDeObra.corte;

  // SOLDA: baseado no número de junções
  const numSoldas = bom.bom.length * 2; // 2 pontos de solda por item (estimativa)
  const tempoSolda_min = numSoldas * 3; // 3min por solda
  const custoSolda = tempoSolda_min * tabela.maoDeObra.solda;

  // POLIMENTO: baseado na área total
  const areaPol_m2 = nesting?.resumo.areaPecas_m2 || 2.0;
  const tempoPolimento_min = areaPol_m2 * 20; // 20min por m²
  const custoPolimento = tempoPolimento_min * tabela.maoDeObra.polimento;

  // DOBRA: apenas se tiver mesa vincada
  const temDobra = bom.bom.some((i) => i.desc.includes("Vincado") || i.desc.includes("Cuba"));
  const tempoDobra_min = temDobra ? 30 : 0;
  const custoDobra = tempoDobra_min * tabela.maoDeObra.dobra;

  return {
    corte: { tempo_min: tempoCorte_min, custo: custoCorte },
    solda: { tempo_min: tempoSolda_min, custo: custoSolda },
    polimento: { tempo_min: tempoPolimento_min, custo: custoPolimento },
    dobra: { tempo_min: tempoDobra_min, custo: custoDobra },
    total: custoCorte + custoSolda + custoPolimento + custoDobra,
  };
}

// ========== GERAÇÃO DO ORÇAMENTO ==========

export function gerarOrcamento(bom: Resultado, nesting: ResultadoNesting | undefined, tabela: TabelaPrecos): Orcamento {
  const custoMaterial = calcularCustoMaterial(bom, nesting, tabela);
  const custoMaoDeObra = calcularCustoMaoDeObra(bom, nesting, tabela);

  const subtotal = custoMaterial.total + custoMaoDeObra.total;
  const valorMargem = subtotal * (tabela.margemPadrao / 100);
  const custoFixo = tabela.custoFixo || 0;
  const total = subtotal + valorMargem + custoFixo;

  const custoDetalhado: CustoDetalhado = {
    material: custoMaterial,
    maoDeObra: custoMaoDeObra,
    subtotal,
    margem: {
      percentual: tabela.margemPadrao,
      valor: valorMargem,
    },
    custoFixo,
    total,
  };

  return {
    custoDetalhado,
    tabelaUsada: tabela,
    dataGeracao: new Date().toISOString(),
  };
}

// ========== FORMATAÇÃO ==========

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarTempo(minutos: number): string {
  if (minutos < 60) {
    return `${Math.ceil(minutos)}min`;
  }

  const horas = Math.floor(minutos / 60);
  const mins = Math.ceil(minutos % 60);

  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
}
