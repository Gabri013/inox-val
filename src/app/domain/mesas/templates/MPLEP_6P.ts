// ==========================================================
// TEMPLATE: MPLEP_6P
// Mesa ENCOSTO, COM PRATELEIRA, SEM ESPELHO LATERAL, 6 pés
// ==========================================================

import { Template } from "../types";
import { validarTamanhoEncosto } from "../validators";

const OFFSET_DESENHO = 1.8;
const ENC_DOBRA_FRONTAL = 70.65;
const ENC_DOBRA_LATERAL = 70.65;
const ENC_ENCOSTO_ALT = 98.2;
const FOLGA_PE = 72;

export const MPLEP_6P: Template = {
  id: "MPLEP_6P",
  familia: "ENCOSTO",

  blankTampo: (ctx) => ({
    blankC: ctx.C - OFFSET_DESENHO + 2 * ENC_DOBRA_LATERAL,
    blankL: ctx.L - OFFSET_DESENHO + ENC_DOBRA_FRONTAL + ENC_ENCOSTO_ALT,
  }),

  blankPrateleira: (ctx) => ({
    blankC: ctx.C + 1.82,
    blankL: ctx.L + 1.82,
  }),

  validate: (ctx) => {
    const erros: string[] = [];
    const errosBlank = validarTamanhoEncosto(ctx);
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
      desc: "TAMPO COM ENCOSTO TRASEIRO",
      codigo: "MPLEP6-PC01",
      processo: "LASER",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C - OFFSET_DESENHO + 2 * ENC_DOBRA_LATERAL,
      h: (ctx) => ctx.L - OFFSET_DESENHO + ENC_DOBRA_FRONTAL + ENC_ENCOSTO_ALT,
      esp: () => 0.8,
    },
    {
      key: "reforco_padrao",
      desc: "REF. PADRÃO MESA ENCOSTO",
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
      key: "reforco_traseiro",
      desc: "REFORÇO ESPELHO TRASEIRO",
      codigo: "MPLEP6-PC02",
      processo: "GUILHOTINA",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C - 130,
      h: () => 80,
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
      desc: "PRATELEIRA INFERIOR",
      codigo: "MPLEP6-PRAT01",
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
      codigo: "MPLEP6-PC03",
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
