/**
 * Calculadora Industrial - BOM para bancadas industriais em inox
 */

export const CHAPAS_INDUSTRIAIS = [
  { nome: "Chapa 2000×1250", comprimento: 2000, largura: 1250 },
  { nome: "Chapa 3000×1250", comprimento: 3000, largura: 1250 },
];

export interface ItemBOM {
  desc: string;
  qtd: number;
  w: number;
  h: number;
  tipo?: "CHAPA" | "TUBO" | "PERFIL" | "OUTRO"; // Novo campo
}

/**
 * Identifica se um item é uma chapa (flat panel) ou outro componente
 */
export function identificarTipoItem(desc: string): "CHAPA" | "TUBO" | "PERFIL" | "OUTRO" {
  const descLower = desc.toLowerCase();
  
  // CHAPAS - itens planos que devem ir para o nesting
  const palavrasChave_Chapa = [
    "tampo",
    "encosto",
    "prateleira",
    "lateral",
    "espelho",
    "painel",
    "fundo",
    "chapa",
  ];
  
  // TUBOS - perfis tubulares (não vão para nesting de chapas)
  const palavrasChave_Tubo = [
    "perna",
    "pé",
    "coluna",
    "tubo",
    "montante",
  ];
  
  // PERFIS - perfis estruturais
  const palavrasChave_Perfil = [
    "travessa",
    "contraventamento",
    "reforço",
    "perfil",
    "cantoneira",
  ];
  
  // Verifica chapas primeiro (prioridade)
  if (palavrasChave_Chapa.some(palavra => descLower.includes(palavra))) {
    return "CHAPA";
  }
  
  // Verifica tubos
  if (palavrasChave_Tubo.some(palavra => descLower.includes(palavra))) {
    return "TUBO";
  }
  
  // Verifica perfis
  if (palavrasChave_Perfil.some(palavra => descLower.includes(palavra))) {
    return "PERFIL";
  }
  
  return "OUTRO";
}

/**
 * Gera BOM baseado nas dimensões e tipo da bancada
 */
export function gerarBomIndustrial(
  c: number,
  l: number,
  a: number,
  tipo: string
): ItemBOM[] {
  const bom: ItemBOM[] = [];

  if (tipo === "Mesa com encosto traseiro e contraventamento") {
    bom.push({ desc: "Tampo", qtd: 1, w: c, h: l, tipo: "CHAPA" });
    bom.push({ desc: "Encosto traseiro", qtd: 1, w: c, h: 100, tipo: "CHAPA" });
    bom.push({ desc: "Perna esquerda", qtd: 1, w: 60, h: a - 20, tipo: "TUBO" });
    bom.push({ desc: "Perna direita", qtd: 1, w: 60, h: a - 20, tipo: "TUBO" });
    bom.push({ desc: "Travessa longitudinal", qtd: 2, w: c - 120, h: 40, tipo: "PERFIL" });
    bom.push({ desc: "Travessa transversal", qtd: 2, w: l - 40, h: 40, tipo: "PERFIL" });
    bom.push({ desc: "Contraventamento diagonal", qtd: 2, w: 300, h: 30, tipo: "PERFIL" });
  } else if (tipo === "Mesa de centro com contraventamento") {
    bom.push({ desc: "Tampo", qtd: 1, w: c, h: l, tipo: "CHAPA" });
    bom.push({ desc: "Perna 1", qtd: 1, w: 60, h: a - 20, tipo: "TUBO" });
    bom.push({ desc: "Perna 2", qtd: 1, w: 60, h: a - 20, tipo: "TUBO" });
    bom.push({ desc: "Perna 3", qtd: 1, w: 60, h: a - 20, tipo: "TUBO" });
    bom.push({ desc: "Perna 4", qtd: 1, w: 60, h: a - 20, tipo: "TUBO" });
    bom.push({ desc: "Travessa longitudinal", qtd: 2, w: c - 120, h: 40, tipo: "PERFIL" });
    bom.push({ desc: "Travessa transversal", qtd: 2, w: l - 120, h: 40, tipo: "PERFIL" });
    bom.push({ desc: "Contraventamento", qtd: 4, w: 250, h: 30, tipo: "PERFIL" });
  }

  // Se tipo não foi definido, identifica automaticamente
  return bom.map(item => ({
    ...item,
    tipo: item.tipo || identificarTipoItem(item.desc)
  }));
}

/**
 * Peça expandida (com posição no nesting)
 */
export interface PecaExpandida {
  desc: string;
  w: number;
  h: number;
  tipo: "CHAPA" | "TUBO" | "PERFIL" | "OUTRO";
  x?: number;
  y?: number;
  rotacionada?: boolean;
}

/**
 * Expande BOM considerando quantidade
 * FILTRA APENAS CHAPAS para nesting
 */
export function expandirBom(bom: ItemBOM[], multiplicador: number = 1): PecaExpandida[] {
  const pecas: PecaExpandida[] = [];

  for (const item of bom) {
    const tipo = item.tipo || identificarTipoItem(item.desc);
    
    // APENAS CHAPAS vão para o nesting
    if (tipo !== "CHAPA") {
      continue;
    }

    const qtdTotal = item.qtd * multiplicador;
    
    for (let i = 0; i < qtdTotal; i++) {
      pecas.push({
        desc: item.desc,
        w: item.w,
        h: item.h,
        tipo,
      });
    }
  }

  return pecas;
}

/**
 * Separa BOM por tipo (para exibição organizada)
 */
export function separarBomPorTipo(bom: ItemBOM[]): {
  chapas: ItemBOM[];
  tubos: ItemBOM[];
  perfis: ItemBOM[];
  outros: ItemBOM[];
} {
  return {
    chapas: bom.filter(item => (item.tipo || identificarTipoItem(item.desc)) === "CHAPA"),
    tubos: bom.filter(item => (item.tipo || identificarTipoItem(item.desc)) === "TUBO"),
    perfis: bom.filter(item => (item.tipo || identificarTipoItem(item.desc)) === "PERFIL"),
    outros: bom.filter(item => (item.tipo || identificarTipoItem(item.desc)) === "OUTRO"),
  };
}
