// ==========================================================
// TEMPLATE: MPLEP_4P
// Mesa ENCOSTO, COM PRATELEIRA, SEM ESPELHO LATERAL, 4 pés
// ==========================================================

import { Template } from "../types";
import { validarTamanhoEncosto } from "../validators";

const OFFSET_DESENHO = 1.8;
const ENC_DOBRA_FRONTAL = 70.65;

// Valores do .txt (encosto traseiro) - FÓRMULA CORRETA
const ENC_REDUCAO_L = 31;
const ENC_SEG_83 = 83;
const ENC_SEG_32_5 = 32.5;
const ENC_SEG_12_8 = 12.8;

// Prateleira do encosto (valores do .txt)
const PRAT_OFF_C = 1.82;
const PRAT_OFF_L = -2.88; // NEGATIVO (era +1.82, estava errado)

const FOLGA_PE = 72;

export const MPLEP_4P: Template = {
  id: "MPLEP_4P",
  familia: "ENCOSTO",

  blankTampo: (ctx) => ({
    blankC: ctx.C - OFFSET_DESENHO + 2 * ENC_DOBRA_FRONTAL,
    // Fórmula do .txt: 70.65 + (L - 31) + 83 + 32.5 + 12.8 = L + 167.95
    blankL: ENC_DOBRA_FRONTAL + (ctx.L - ENC_REDUCAO_L) + ENC_SEG_83 + ENC_SEG_32_5 + ENC_SEG_12_8,
  }),

  blankPrateleira: (ctx) => ({
    blankC: ctx.C + PRAT_OFF_C,
    blankL: ctx.L + PRAT_OFF_L, // L - 2.88
  }),

  validate: (ctx) => {
    const erros: string[] = [];
    const errosBlank = validarTamanhoEncosto(ctx);
    erros.push(...errosBlank);

    if (ctx.C < 800) erros.push("Comprimento mínimo: 800mm");
    if (ctx.L < 400) erros.push("Largura mínima: 400mm");
    if (ctx.H < 700 || ctx.H > 1100) {
      erros.push("Altura deve estar entre 700mm e 1100mm");
    }

    // Valida blank da prateleira
    const blankPratC = ctx.C + PRAT_OFF_C;
    const blankPratL = ctx.L + PRAT_OFF_L;
    if (blankPratC > 3000) {
      erros.push("Comprimento muito grande para prateleira (blank > 3000mm)");
    }
    if (blankPratL > 1250) {
      erros.push("Largura muito grande para prateleira (blank > 1250mm)");
    }

    return erros;
  },

  items: [
    {
      key: "tampo",
      desc: "TAMPO COM ENCOSTO TRASEIRO",
      codigo: "MPLEP-PC01",
      processo: "LASER",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C - OFFSET_DESENHO + 2 * ENC_DOBRA_FRONTAL,
      // Mesma fórmula do blank: L + 167.95
      h: (ctx) => ENC_DOBRA_FRONTAL + (ctx.L - ENC_REDUCAO_L) + ENC_SEG_83 + ENC_SEG_32_5 + ENC_SEG_12_8,
      esp: () => 0.8,
    },
    {
      key: "reforco_padrao",
      desc: "REF. PADRÃO MESA ENCOSTO",
      codigo: "PPB-30",
      processo: "GUILHOTINA",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 3,
      w: () => 135.58,
      h: (ctx) => ctx.L - 50,
      esp: () => 0.8,
    },
    {
      key: "reforco_traseiro",
      desc: "REFORÇO ESPELHO TRASEIRO",
      codigo: "MPLEP-PC02",
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
      qtd: () => 4,
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
      qtd: () => 4,
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
      qtd: () => 4,
    },
    {
      key: "prateleira",
      desc: "PRATELEIRA INFERIOR (4 LADOS / 3 DOBRAS)",
      codigo: "MPLEP-PRAT01",
      processo: "LASER",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C + PRAT_OFF_C,
      h: (ctx) => ctx.L + PRAT_OFF_L, // L - 2.88
      esp: () => 0.8,
      enabled: (ctx) => ctx.opts.estrutura === "PRATELEIRA",
    },
    {
      key: "reforco_frontal",
      desc: "REFORÇO FRONTAL",
      codigo: "MPLEP-PC03",
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
