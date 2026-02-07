/**
 * CONVERSOR: BOM → Peças Planas para Nesting
 */

import type { BOMItem } from "./types";
import type { PecaPlana, Acabamento, Orientation } from "../../lib/nestingProfissional";

// Mapeamento de categorias por palavras-chave
const CATEGORIA_MAP: Record<string, string> = {
  TAMPO: "TAMPO",
  ENCOSTO: "ENCOSTO",
  ESPELHO: "ESPELHO",
  PRATELEIRA: "PRATELEIRA",
  REFORCO: "REFORCO",
  REFORÇO: "REFORCO",
  PÉ: "PE",
  PE: "PE",
  LATERAL: "LATERAL",
  CUBA: "CUBA",
  QUEDA: "QUEDA",
};

function detectarCategoria(desc: string): string | undefined {
  const descUpper = desc.toUpperCase();
  for (const [palavra, categoria] of Object.entries(CATEGORIA_MAP)) {
    if (descUpper.includes(palavra)) {
      return categoria;
    }
  }
  return undefined;
}

function detectarAcabamento(desc: string, codigo: string): Acabamento {
  const texto = `${desc} ${codigo}`.toUpperCase();

  if (texto.includes("ESCOVADO")) return "ESCOVADO";
  if (texto.includes("POLIDO")) return "POLIDO";
  if (texto.includes("2B")) return "2B";

  // Default: ESCOVADO (mais comum)
  return "ESCOVADO";
}

function detectarOrientation(categoria?: string): Orientation {
  // TAMPO e REFORCO devem alinhar com comprimento da chapa
  if (categoria === "TAMPO" || categoria === "REFORCO") {
    return "ALONG_SHEET_LENGTH";
  }
  return "FREE";
}

export function converterBOMParaNesting(bom: BOMItem[]): PecaPlana[] {
  const pecas: PecaPlana[] = [];

  for (const item of bom) {
    // Filtrar apenas peças de chapa (com dimensões)
    if (!item.w || !item.h || !item.esp) continue;

    // Filtrar por processo (apenas corte/laser)
    const processoUpper = item.processo.toUpperCase();
    if (!processoUpper.includes("CORTE") && !processoUpper.includes("LASER") && !processoUpper.includes("GUILHOTINA")) {
      continue;
    }

    const categoria = detectarCategoria(item.desc);
    const acabamento = detectarAcabamento(item.desc, item.codigo);
    const orientation = detectarOrientation(categoria);

    pecas.push({
      id: item.codigo,
      label: item.desc,
      w_mm: item.w,
      h_mm: item.h,
      qtd: item.qtd,
      material: item.material,
      esp_mm: item.esp,
      acabamento,
      orientation,
      category: categoria,
    });
  }

  return pecas;
}
