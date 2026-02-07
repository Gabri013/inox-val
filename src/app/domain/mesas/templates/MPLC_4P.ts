// ==========================================================
// TEMPLATE: MPLC_4P
// Mesa CENTRO, CONTRAVENTADA, 4 pés
// Baseado 100% no arquivo .txt original
// ==========================================================

import { Template } from "../types";
import { validarTamanhoCentro } from "../validators";

// Constantes do .txt
const OFFSET_DESENHO = 1.8;
const DOBRA_LADO_CENTRO = 70.65; // ABA + DOBRA + RAIO = 50 + 10 + 10.65

const FOLGA_CONTRAV = 130;
const FOLGA_PE = 72;

export const MPLC_4P: Template = {
  id: "MPLC_4P",
  familia: "CENTRO",

  // Fórmulas de blank do tampo (do .txt)
  blankTampo: (ctx) => ({
    blankC: ctx.C - OFFSET_DESENHO + 2 * DOBRA_LADO_CENTRO,
    blankL: ctx.L - OFFSET_DESENHO + 2 * DOBRA_LADO_CENTRO,
  }),

  // Validações específicas
  validate: (ctx) => {
    const erros: string[] = [];

    // Validação de tamanho do blank (crítico para fabricação)
    const errosBlank = validarTamanhoCentro(ctx);
    erros.push(...errosBlank);

    // Validações mínimas (segurança/estrutura)
    if (ctx.C < 800) {
      erros.push("Comprimento mínimo: 800mm");
    }

    if (ctx.L < 400) {
      erros.push("Largura mínima: 400mm");
    }

    if (ctx.H < 700 || ctx.H > 1100) {
      erros.push("Altura deve estar entre 700mm e 1100mm");
    }

    return erros;
  },

  items: [
    // TAMPO
    {
      key: "tampo",
      desc: "TAMPO LISO CENTRO",
      codigo: "MPLC-PC01",
      processo: "LASER",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 1,
      w: (ctx) => ctx.C - OFFSET_DESENHO + 2 * DOBRA_LADO_CENTRO,
      h: (ctx) => ctx.L - OFFSET_DESENHO + 2 * DOBRA_LADO_CENTRO,
      esp: () => 0.8,
    },

    // REFORÇOS PADRÃO
    {
      key: "reforco_padrao",
      desc: "REF. PADRÃO MESA LISA CENTRO",
      codigo: "PPB-30",
      processo: "GUILHOTINA",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 3,
      w: () => 135.58,
      h: (ctx) => ctx.L - 50,
      esp: () => 0.8,
    },

    // PERNAS (4 pés)
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

    // CASQUILHOS
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

    // PÉS NIVELADORES
    {
      key: "pe_nivelador",
      desc: 'PÉ NIVELADOR 1 1/2" - NYLON',
      codigo: "1006036",
      processo: "ALMOXARIFADO",
      material: "1006036",
      unidade: "un",
      qtd: () => 4,
    },

    // CONTRAVENTAMENTOS (apenas se estrutura = CONTRAVENTADA)
    {
      key: "contrav_lateral",
      desc: "CONTRAV. LATERAL",
      codigo: "MPLC-PT01",
      processo: "CORTE",
      material: "TUBO REDONDO Ø25mm",
      unidade: "pç",
      qtd: () => 2,
      diametro: () => 25,
      comprimento: (ctx) => ctx.L - FOLGA_CONTRAV,
      esp: () => 1.2,
      enabled: (ctx) => ctx.opts.estrutura === "CONTRAVENTADA",
    },

    {
      key: "contrav_traseiro",
      desc: "CONTRAV. TRASEIRO",
      codigo: "MPLC-PT02",
      processo: "CORTE",
      material: "TUBO REDONDO Ø25mm",
      unidade: "pç",
      qtd: () => 1,
      diametro: () => 25,
      comprimento: (ctx) => ctx.C - FOLGA_CONTRAV,
      esp: () => 1.2,
      enabled: (ctx) => ctx.opts.estrutura === "CONTRAVENTADA",
    },

    {
      key: "contrav_frontal",
      desc: "CONTRAV. FRONTAL",
      codigo: "MPLC-PT03",
      processo: "CORTE",
      material: "TUBO REDONDO Ø25mm",
      unidade: "pç",
      qtd: () => 1,
      diametro: () => 25,
      comprimento: (ctx) => ctx.C - FOLGA_CONTRAV,
      esp: () => 1.2,
      enabled: (ctx) => ctx.opts.estrutura === "CONTRAVENTADA",
    },

    // REFORÇO FRONTAL
    {
      key: "reforco_frontal",
      desc: "REFORÇO FRONTAL",
      codigo: "MPLC-PC03",
      processo: "GUILHOTINA",
      material: "AÇO INOX 304",
      unidade: "pç",
      qtd: () => 2,
      w: (ctx) => ctx.C - FOLGA_CONTRAV,
      h: () => 93,
      esp: () => 0.8,
    },
  ],
};
