/**
 * EXEMPLO DE TESTE DO SISTEMA DE NESTING
 * Para validar funcionamento completo
 */

import { calcularNestingProfissional, type PecaPlana } from "../lib/nestingProfissional";

// Exemplo de peças de uma mesa típica
const pecasExemplo: PecaPlana[] = [
  {
    id: "TAMPO-001",
    label: "Tampo Principal 1500×700",
    w_mm: 1500,
    h_mm: 700,
    qtd: 1,
    material: "AÇO INOX 304",
    esp_mm: 1.2,
    acabamento: "ESCOVADO",
    orientation: "ALONG_SHEET_LENGTH",
    category: "TAMPO",
  },
  {
    id: "ENCOSTO-001",
    label: "Encosto Traseiro 1500×100",
    w_mm: 1500,
    h_mm: 100,
    qtd: 1,
    material: "AÇO INOX 304",
    esp_mm: 1.2,
    acabamento: "ESCOVADO",
    orientation: "FREE",
    category: "ENCOSTO",
  },
  {
    id: "REFORCO-001",
    label: "Reforço Frontal 1474×50",
    w_mm: 1474,
    h_mm: 50,
    qtd: 1,
    material: "AÇO INOX 304",
    esp_mm: 1.2,
    acabamento: "ESCOVADO",
    orientation: "ALONG_SHEET_LENGTH",
    category: "REFORCO",
  },
  {
    id: "LATERAL-001",
    label: "Lateral 674×50",
    w_mm: 674,
    h_mm: 50,
    qtd: 2,
    material: "AÇO INOX 304",
    esp_mm: 1.2,
    acabamento: "ESCOVADO",
    orientation: "FREE",
    category: "LATERAL",
  },
];

export function testarNesting() {
  console.log("🧪 TESTANDO SISTEMA DE NESTING PROFISSIONAL\n");

  const resultado = calcularNestingProfissional(pecasExemplo);

  console.log("📊 RESUMO GERAL:");
  console.log(`   Total de chapas: ${resultado.resumo.totalChapas}`);
  console.log(`   Área total: ${resultado.resumo.areaTotal_m2.toFixed(3)}m²`);
  console.log(`   Peso total: ${resultado.resumo.pesoTotal_kg.toFixed(1)}kg`);
  console.log(`   Eficiência média: ${resultado.resumo.eficienciaMedia.toFixed(1)}%\n`);

  for (const grupo of resultado.grupos) {
    console.log(`\n🔧 GRUPO: ${grupo.grupo}`);
    console.log(`   Material: ${grupo.material}`);
    console.log(`   Espessura: ${grupo.esp_mm}mm`);
    console.log(`   Acabamento: ${grupo.acabamento}`);
    console.log(`   Chapa escolhida: ${grupo.chosenSheet.label}mm`);
    console.log(`   Quantidade de chapas: ${grupo.totals.sheetCount}`);
    console.log(`   Aproveitamento: ${grupo.totals.utilization.toFixed(1)}%`);
    console.log(`   Desperdício: ${grupo.totals.waste_m2.toFixed(3)}m²`);
    console.log(`   Peso: ${grupo.totals.peso_kg.toFixed(1)}kg\n`);

    for (const chapa of grupo.sheetsUsed) {
      console.log(`   📋 Chapa #${chapa.sheetIndex + 1}:`);
      console.log(`      Tamanho: ${chapa.w_mm}×${chapa.h_mm}mm`);
      console.log(`      Peças encaixadas: ${chapa.placements.length}`);
      console.log(`      Aproveitamento: ${chapa.utilizacao.toFixed(1)}%`);

      for (const peca of chapa.placements) {
        console.log(
          `         - ${peca.label} → Pos: (${peca.x_mm}, ${peca.y_mm}) | Tamanho: ${peca.w_mm}×${peca.h_mm}mm ${peca.rotated ? "↻" : ""}`
        );
      }
    }
  }

  return resultado;
}

// Descomentar para rodar o teste:
// testarNesting();
