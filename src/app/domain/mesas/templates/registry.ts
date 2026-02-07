// ==========================================================
// REGISTRO DE TEMPLATES
// Índice único de todos os templates disponíveis
// ==========================================================

import { Template } from "../types";

// CENTRO
import { MPLC_4P } from "./MPLC_4P";
import { MPLC_6P } from "./MPLC_6P";
import { MPLCP_4P } from "./MPLCP_4P";
import { MPLCP_6P } from "./MPLCP_6P";

// ENCOSTO
import { MPLEP_4P } from "./MPLEP_4P";
import { MPLEP_6P } from "./MPLEP_6P";
import { MPLE4_INV_LE_4P } from "./MPLE4_INV_LE_4P";
import { MPLE4_INV_LD_4P } from "./MPLE4_INV_LD_4P";

// VINCADA
import { MPVE_4P } from "./MPVE_4P";

// Placeholder para os templates ainda não implementados
const PLACEHOLDER_TEMPLATE = (id: string, familia: "CENTRO" | "ENCOSTO" | "VINCADA"): Template => ({
  id,
  familia,
  blankTampo: (ctx) => ({ blankC: ctx.C, blankL: ctx.L }),
  items: [],
  validate: () => [`Template ${id} ainda não implementado - em desenvolvimento`],
});

export const templatesById: Record<string, Template> = {
  // ✅ CENTRO - COMPLETO
  MPLC_4P,
  MPLC_6P,
  MPLCP_4P,
  MPLCP_6P,

  // ✅ ENCOSTO - IMPLEMENTADOS
  MPLEP_4P,
  MPLEP_6P,
  MPLE4_INV_LE_4P,
  MPLE4_INV_LD_4P,

  // ⚠️ ENCOSTO 6 PESOS - PENDENTES
  MPLE4_INV_LE_6P: PLACEHOLDER_TEMPLATE("MPLE4_INV_LE_6P", "ENCOSTO"),
  MPLE4_INV_LD_6P: PLACEHOLDER_TEMPLATE("MPLE4_INV_LD_6P", "ENCOSTO"),

  // ✅ VINCADA
  MPVE_4P,
  MPVE_6P: PLACEHOLDER_TEMPLATE("MPVE_6P", "VINCADA"),
};
