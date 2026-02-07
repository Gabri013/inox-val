// ==========================================================
// TEMPLATE: MPLE4_INV_LE_4P
// Mesa ENCOSTO, com ESPELHO TRASEIRO, LADO ESQUERDO, 4 pés
// ==========================================================

import { Template } from "../types";
import { validarTamanhoEncosto } from "../validators";

const OFFSET_DESENHO = 1.8;
const ENC_DOBRA_FRONTAL = 70.65;
const ENC_DOBRA_LATERAL = 70.65;
const ENC_ESPELHO_ALT = 157.5;
const FOLGA_PE = 72;

export const MPLE4_INV_LE_4P: Template = {
  id: "MPLE4_INV_LE_4P",
  familia: "ENCOSTO",

  blankTampo: (ctx) => ({
    blankC: ctx.C - OFFSET_DESENHO + 2 * ENC_DOBRA_LATERAL,
    blankL: ctx.L - OFFSET_DESENHO + ENC_DOBRA_FRONTAL + ENC_ESPELHO_ALT,
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

    return erros;
  },

  items: [
    {
      key: "tampo",
      desc: "TAMPO COM ESPELHO TRASEIRO",
      codigo: "MPLE4-INV-LE-01",
      processo: "LASER",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C - OFFSET_DESENHO + 2 * ENC_DOBRA_LATERAL,
      h: (ctx) => ctx.L - OFFSET_DESENHO + ENC_DOBRA_FRONTAL + ENC_ESPELHO_ALT,
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
      codigo: "MPLE4-INV-LE-02",
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
  ],
};
