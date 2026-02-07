// ==========================================================
// TEMPLATE: MPLCP_6P
// Mesa CENTRO, COM PRATELEIRA, 6 pés
// ==========================================================

import { Template } from "../types";
import { validarTamanhoCentro } from "../validators";

const OFFSET_DESENHO = 1.8;
const DOBRA_LADO_CENTRO = 70.65;
const FOLGA_PE = 72;

export const MPLCP_6P: Template = {
  id: "MPLCP_6P",
  familia: "CENTRO",

  blankTampo: (ctx) => ({
    blankC: ctx.C - OFFSET_DESENHO + 2 * DOBRA_LADO_CENTRO,
    blankL: ctx.L - OFFSET_DESENHO + 2 * DOBRA_LADO_CENTRO,
  }),

  blankPrateleira: (ctx) => {
    const blankC = ctx.C + 1.82;
    const blankL = ctx.L + 1.82;
    return { blankC, blankL };
  },

  validate: (ctx) => {
    const erros: string[] = [];
    const errosBlank = validarTamanhoCentro(ctx);
    erros.push(...errosBlank);

    if (ctx.C < 1900) {
      erros.push("Mesa de 6 pés recomendada apenas para C ≥ 1900mm");
    }
    if (ctx.C < 800) erros.push("Comprimento mínimo: 800mm");
    if (ctx.L < 400) erros.push("Largura mínima: 400mm");
    if (ctx.H < 700 || ctx.H > 1100) {
      erros.push("Altura deve estar entre 700mm e 1100mm");
    }

    const blankPratC = ctx.C + 1.82;
    const blankPratL = ctx.L + 1.82;
    if (blankPratC > 3000) {
      erros.push("Comprimento muito grande para prateleira");
    }
    if (blankPratL > 1250) {
      erros.push("Largura muito grande para prateleira");
    }

    return erros;
  },

  items: [
    {
      key: "tampo",
      desc: "TAMPO LISO CENTRO",
      codigo: "MPLCP6-PC01",
      processo: "LASER",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C - OFFSET_DESENHO + 2 * DOBRA_LADO_CENTRO,
      h: (ctx) => ctx.L - OFFSET_DESENHO + 2 * DOBRA_LADO_CENTRO,
      esp: () => 0.8,
    },
    {
      key: "reforco_padrao",
      desc: "REF. PADRÃO MESA LISA CENTRO",
      codigo: "PPB-30",
      processo: "GUILHOTINA",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 4,
      w: () => 135.58,
      h: (ctx) => ctx.L - 50,
      esp: () => 0.8,
    },
    {
      key: "perna",
      desc: "PÉ (TUBO)",
      codigo: "PPB-02",
      processo: "CORTE",
      material: "TUBO REDONDO Ø38mm",
      unidade: "pç",
      qtd: () => 6,
      diametro: () => 38,
      comprimento: (ctx) => ctx.H - FOLGA_PE,
      esp: () => 1.2,
    },
    {
      key: "casquilho",
      desc: "CASQUILHO",
      codigo: "PPB-01B",
      processo: "LASER",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 6,
      w: () => 61,
      h: () => 61,
      esp: () => 2.0,
    },
    {
      key: "pe_nivelador",
      desc: 'PÉ NIVELADOR 1 1/2" - NYLON',
      codigo: "1006036",
      processo: "ALMOXARIFADO",
      material: "1006036",
      unidade: "un",
      qtd: () => 6,
    },
    {
      key: "prateleira",
      desc: "PRATELEIRA INFERIOR (4 LADOS / 3 DOBRAS)",
      codigo: "MPLCP6-PRAT01",
      processo: "LASER",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C + 1.82,
      h: (ctx) => ctx.L + 1.82,
      esp: () => 0.8,
      enabled: (ctx) => ctx.opts.estrutura === "PRATELEIRA",
    },
    {
      key: "reforco_frontal",
      desc: "REFORÇO FRONTAL",
      codigo: "MPLCP6-PC03",
      processo: "GUILHOTINA",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 2,
      w: (ctx) => ctx.C - 130,
      h: () => 93,
      esp: () => 0.8,
    },
  ],
};
