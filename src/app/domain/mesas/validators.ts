// ==========================================================
// VALIDAÇÕES DE FABRICAÇÃO
// Garante que blank cabe nas chapas disponíveis
// ==========================================================

import { FormulaCtx } from "./types";

// Chapas padrão disponíveis
export const CHAPAS_DISPONIVEIS = [
  { nome: "Chapa 2000×1250", maxC: 2000, maxL: 1250 },
  { nome: "Chapa 3000×1250", maxC: 3000, maxL: 1250 },
] as const;

/**
 * Calcula o tamanho máximo de mesa acabada que cabe em uma chapa
 * considerando as dobras/offsets do modelo
 */
export function calcularLimitesMaximos(
  offsetDesenho: number,
  dobrasPorLado: number
): {
  maxC_chapa2000: number;
  maxL_chapa2000: number;
  maxC_chapa3000: number;
  maxL_chapa3000: number;
} {
  const margem = 2 * dobrasPorLado; // total das dobras (ambos os lados)

  return {
    // Para chapa 2000×1250
    maxC_chapa2000: 2000 - margem + offsetDesenho,
    maxL_chapa2000: 1250 - margem + offsetDesenho,

    // Para chapa 3000×1250
    maxC_chapa3000: 3000 - margem + offsetDesenho,
    maxL_chapa3000: 1250 - margem + offsetDesenho,
  };
}

/**
 * Valida se o blank do tampo cabe em alguma chapa disponível
 */
export function validarTamanhoBlank(
  blankC: number,
  blankL: number
): { ok: true; chapa: string } | { ok: false; erro: string } {
  // Tenta chapa 2000×1250 primeiro
  if (blankC <= 2000 && blankL <= 1250) {
    return { ok: true, chapa: "2000×1250" };
  }

  // Tenta chapa 3000×1250
  if (blankC <= 3000 && blankL <= 1250) {
    return { ok: true, chapa: "3000×1250" };
  }

  // Não cabe em nenhuma chapa
  const msgC = blankC > 3000 ? `Blank no comprimento (${blankC.toFixed(1)}mm) excede tamanho máximo da chapa (3000mm).` : "";
  const msgL = blankL > 1250 ? `Blank na largura (${blankL.toFixed(1)}mm) excede tamanho máximo da chapa (1250mm).` : "";

  return {
    ok: false,
    erro: `Dimensões do blank excedem chapas disponíveis:\n${msgC}\n${msgL}`.trim(),
  };
}

/**
 * Validação específica para CENTRO (dobras 70.65 por lado)
 */
export function validarTamanhoCentro(ctx: FormulaCtx): string[] {
  const erros: string[] = [];
  const OFFSET = 1.8;
  const DOBRA_LADO = 70.65;

  const limites = calcularLimitesMaximos(OFFSET, DOBRA_LADO);

  // Valida comprimento
  if (ctx.C > limites.maxC_chapa3000) {
    erros.push(
      `Comprimento máximo: ${limites.maxC_chapa3000.toFixed(0)}mm ` + `(blank não pode exceder 3000mm da chapa)`
    );
  } else if (ctx.C > limites.maxC_chapa2000) {
    // Aviso: vai precisar de chapa 3000
    // (não é erro, mas é bom informar)
  }

  // Valida largura
  if (ctx.L > limites.maxL_chapa2000) {
    erros.push(
      `Largura máxima: ${limites.maxL_chapa2000.toFixed(0)}mm ` + `(blank não pode exceder 1250mm da chapa)`
    );
  }

  return erros;
}

/**
 * Validação específica para ENCOSTO
 */
export function validarTamanhoEncosto(ctx: FormulaCtx): string[] {
  const erros: string[] = [];

  // Encosto tem desenvolvimento diferente no lado do espelho
  // blankL = 70.65 + (L - 31) + 83 + 32.5 + 12.8
  const blankL_calculado = 70.65 + (ctx.L - 31) + 83 + 32.5 + 12.8;

  if (blankL_calculado > 1250) {
    const L_max = 1250 - 70.65 - 83 - 32.5 - 12.8 + 31;
    erros.push(
      `Largura máxima para mesa com encosto: ${L_max.toFixed(0)}mm ` + `(desenvolvimento do espelho excede 1250mm)`
    );
  }

  // Comprimento segue mesma regra do centro
  const limites = calcularLimitesMaximos(1.8, 70.65);
  if (ctx.C > limites.maxC_chapa3000) {
    erros.push(`Comprimento máximo: ${limites.maxC_chapa3000.toFixed(0)}mm`);
  }

  return erros;
}

/**
 * Validação específica para VINCADA (cuba + queda d'água)
 */
export function validarTamanhoVincada(ctx: FormulaCtx): string[] {
  const erros: string[] = [];

  // MPVE: blankC = (C - 80) + 2×109.9 = C + 139.8
  const blankC = ctx.C - 80 + 2 * 109.9;
  if (blankC > 3000) {
    const C_max = 3000 - 139.8 + 80;
    erros.push(`Comprimento máximo para mesa vincada: ${C_max.toFixed(0)}mm`);
  }

  // blankL = (L - 70) + 135.3 + 109.9 = L + 175.2
  const blankL = ctx.L - 70 + 135.3 + 109.9;
  if (blankL > 1250) {
    const L_max = 1250 - 175.2 + 70;
    erros.push(`Largura máxima para mesa vincada: ${L_max.toFixed(0)}mm`);
  }

  // Validação da cuba (folga 10mm)
  if (ctx.opts.cuba) {
    const mioloC = ctx.C - 80;
    const mioloL = ctx.L - 70;

    if (ctx.opts.cuba.comp > mioloC - 20) {
      erros.push(
        `Cuba no comprimento (${ctx.opts.cuba.comp}mm) excede o miolo. ` +
          `Máximo permitido: ${(mioloC - 20).toFixed(0)}mm (folga 10mm nas dobras)`
      );
    }

    if (ctx.opts.cuba.larg > mioloL - 20) {
      erros.push(
        `Cuba na largura (${ctx.opts.cuba.larg}mm) excede o miolo. ` +
          `Máximo permitido: ${(mioloL - 20).toFixed(0)}mm (folga 10mm nas dobras)`
      );
    }
  }

  return erros;
}

/**
 * Validação específica para CONTRAVENTADA (sinônimo de vincada no contexto atual)
 */
export function validarTamanhoContraventada(ctx: FormulaCtx): string[] {
  return validarTamanhoVincada(ctx);
}

/**
 * Calcula qual chapa será usada baseada no blank
 */
export function selecionarChapa(blankC: number, blankL: number): string {
  if (blankC <= 2000 && blankL <= 1250) {
    return "Chapa 2000×1250";
  }
  if (blankC <= 3000 && blankL <= 1250) {
    return "Chapa 3000×1250";
  }
  return "NENHUMA (dimensões excedem chapas disponíveis)";
}
