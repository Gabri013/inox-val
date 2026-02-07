// ==========================================================
// SELETOR DE TEMPLATE
// Escolhe o template correto baseado no wizard
// ==========================================================

import { WizardInput } from "./types";

export type TemplateKey =
  | "MPLC_4P"
  | "MPLC_6P"
  | "MPLCP_4P"
  | "MPLCP_6P"
  | "MPLEP_4P"
  | "MPLEP_6P"
  | "MPLE4_INV_LE_4P"
  | "MPLE4_INV_LE_6P"
  | "MPLE4_INV_LD_4P"
  | "MPLE4_INV_LD_6P"
  | "MPVE_4P"
  | "MPVE_6P";

/**
 * Escolhe o template correto baseado nas entradas do wizard
 *
 * REGRAS:
 * - CENTRO:
 *   - contraventada → MPLC (4p/6p)
 *   - prateleira → MPLCP (4p/6p)
 *
 * - ENCOSTO:
 *   - espelho lateral = NENHUM → MPLEP (4p/6p)
 *   - espelho lateral = ESQUERDO → MPLE4_INV_LE (4p/6p)
 *   - espelho lateral = DIREITO → MPLE4_INV_LD (4p/6p)
 *
 * - VINCADA:
 *   - MPVE (4p/6p)
 */
export function escolherTemplateId(input: WizardInput & { numPes: 4 | 6 }): TemplateKey {
  const p = input.numPes;

  // ===== CENTRO =====
  if (input.familia === "CENTRO") {
    if (input.estrutura === "PRATELEIRA") {
      return p === 6 ? "MPLCP_6P" : "MPLCP_4P";
    }
    // CONTRAVENTADA
    return p === 6 ? "MPLC_6P" : "MPLC_4P";
  }

  // ===== ENCOSTO =====
  if (input.familia === "ENCOSTO") {
    const lateral = input.espelhoLateral ?? "NENHUM";

    if (lateral === "NENHUM") {
      return p === 6 ? "MPLEP_6P" : "MPLEP_4P";
    }

    if (lateral === "ESQUERDO") {
      return p === 6 ? "MPLE4_INV_LE_6P" : "MPLE4_INV_LE_4P";
    }

    // DIREITO
    return p === 6 ? "MPLE4_INV_LD_6P" : "MPLE4_INV_LD_4P";
  }

  // ===== VINCADA =====
  return p === 6 ? "MPVE_6P" : "MPVE_4P";
}

/**
 * Determina número de pés automaticamente baseado no comprimento
 * Regra: C > 1900mm → 6 pés, caso contrário 4 pés
 */
export function defaultNumPes(C: number): 4 | 6 {
  return C > 1900 ? 6 : 4;
}
