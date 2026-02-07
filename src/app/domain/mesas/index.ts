// ==========================================================
// EXPORTS PÚBLICOS DO SISTEMA DE MESAS
// ==========================================================

export * from "./types";
export { gerarBOM, expandirParaNesting } from "./engine";
export type { PecaNesting } from "./engine";
export { escolherTemplateId, defaultNumPes } from "./selector";
