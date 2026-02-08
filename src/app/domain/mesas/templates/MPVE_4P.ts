// ==========================================================
// TEMPLATE: MPVE_4P
// Mesa CONTRAVENTADA COM ESPELHO, 4 pés
// ==========================================================

import { Template } from "../types";
import { validarTamanhoContraventada } from "../validators";

const OFFSET_DESENHO = 1.8;
const ENC_DOBRA_FRONTAL = 55;
const ENC_DOBRA_LATERAL = 55;
const ESP_ESPELHO = 215;
const FOLGA_PE = 72;

export const MPVE_4P: Template = {
  id: "MPVE_4P",
  familia: "VINCADA",

  blankTampo: (ctx) => ({
    blankC: ctx.C - OFFSET_DESENHO + 2 * ENC_DOBRA_LATERAL,
    blankL: ctx.L - OFFSET_DESENHO + ENC_DOBRA_FRONTAL + ESP_ESPELHO,
  }),

  validate: (ctx) => {
    const erros: string[] = [];
    const errosBlank = validarTamanhoContraventada(ctx);
    erros.push(...errosBlank);

    if (ctx.C < 800) erros.push("Comprimento mínimo: 800mm");
    if (ctx.L < 400) erros.push("Largura mínima: 400mm");
    if (ctx.H < 700 || ctx.H > 1100) {
      erros.push("Altura deve estar entre 700mm e 1100mm");
    }

    return erros;
  },

  items: [
    {
      key: "tampo",
      desc: "TAMPO COM ESPELHO TRASEIRO",
      codigo: "MPVE-PC01",
      processo: "LASER",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C - OFFSET_DESENHO + 2 * ENC_DOBRA_LATERAL,
      h: (ctx) => ctx.L - OFFSET_DESENHO + ENC_DOBRA_FRONTAL + ESP_ESPELHO,
      esp: () => 0.8,
    },
    {
      key: "reforco_traseiro",
      desc: "REFORÇO ESPELHO TRASEIRO",
      codigo: "MPVE-PC02",
      processo: "GUILHOTINA",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C - 130,
      h: () => 80,
      esp: () => 0.8,
    },
    {
      key: "travessa",
      desc: "TRAVESSA CONTRAVENTADA",
      codigo: "MPVE-PC03",
      processo: "GUILHOTINA",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 2,
      w: (ctx) => ctx.L - 50,
      h: () => 90,
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
  ],
};
