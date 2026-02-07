// ==========================================================
// ENGINE DE GERAÇÃO DE BOM
// Processa input do wizard → seleciona template → gera BOM
// ==========================================================

import { WizardInput, Resultado, FormulaCtx, BOMItem } from "./types";
import { escolherTemplateId, defaultNumPes } from "./selector";
import { templatesById } from "./templates/registry";
import { selecionarChapa } from "./validators";

/**
 * Interface para peças do nesting (compatível com nestingIndustrial.ts)
 */
export interface PecaNesting {
  desc: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
  rotacionada?: boolean;
}

/**
 * Expande BOM para formato do nesting
 * Filtra apenas itens que são chapas de inox (processo LASER/GUILHOTINA)
 * Exclui tubos, perfis e itens de almoxarifado
 */
export function expandirParaNesting(bom: BOMItem[]): PecaNesting[] {
  const pecas: PecaNesting[] = [];

  for (const item of bom) {
    // FILTRO CRÍTICO: Apenas chapas de aço inox
    const isChapa =
      (item.processo === "LASER" || item.processo === "GUILHOTINA") &&
      item.material.includes("AÇO INOX") &&
      item.w !== undefined &&
      item.h !== undefined;

    if (!isChapa) {
      continue; // Ignora tubos, perfis, almoxarifado
    }

    // Adiciona N peças (quantidade)
    for (let i = 0; i < item.qtd; i++) {
      pecas.push({
        desc: item.desc,
        w: item.w!,
        h: item.h!,
      });
    }
  }

  return pecas;
}

/**
 * Função principal: recebe input do wizard e retorna BOM completa
 */
export function gerarBOM(input: WizardInput): Resultado {
  // 1. Determina número de pés (se não informado)
  const numPes = input.numPes ?? defaultNumPes(input.C);

  // 2. Seleciona template correto
  const templateId = escolherTemplateId({ ...input, numPes });
  const template = templatesById[templateId];

  if (!template) {
    return {
      ok: false,
      erros: [`Template ${templateId} não encontrado`],
    };
  }

  // 3. Monta contexto para as fórmulas
  const ctx: FormulaCtx = {
    C: input.C,
    L: input.L,
    H: input.H,
    numPes,
    opts: {
      estrutura: input.estrutura,
      espelhoLateral: input.espelhoLateral ?? "NENHUM",
      cuba: input.cuba,
    },
  };

  // 4. Valida dimensões
  if (template.validate) {
    const erros = template.validate(ctx);
    if (erros.length > 0) {
      return { ok: false, erros };
    }
  }

  // 5. Calcula blanks
  const blanks = {
    tampo: template.blankTampo(ctx),
    prateleira: template.blankPrateleira ? template.blankPrateleira(ctx) : undefined,
  };

  // 6. Gera BOM
  const bom: BOMItem[] = [];
  const avisos: string[] = [];

  for (const item of template.items) {
    // Verifica se item está habilitado
    if (item.enabled && !item.enabled(ctx)) {
      continue;
    }

    // Calcula dimensões
    const w = item.w ? item.w(ctx) : undefined;
    const h = item.h ? item.h(ctx) : undefined;
    const esp = item.esp ? item.esp(ctx) : undefined;
    const diametro = item.diametro ? item.diametro(ctx) : undefined;
    const comprimento = item.comprimento ? item.comprimento(ctx) : undefined;
    const qtd = item.qtd(ctx);

    // Validação de dimensões
    if (w !== undefined && w <= 0) {
      avisos.push(`Item "${item.desc}": largura inválida (${w}mm)`);
      continue;
    }

    if (h !== undefined && h <= 0) {
      avisos.push(`Item "${item.desc}": altura inválida (${h}mm)`);
      continue;
    }

    bom.push({
      desc: item.desc,
      codigo: item.codigo,
      processo: item.processo,
      material: item.material,
      unidade: item.unidade,
      qtd,
      w,
      h,
      esp,
      diametro,
      comprimento,
      acabamento: item.acabamento,
    });
  }

  return {
    ok: true,
    templateId,
    meta: {
      numPes,
      chapaUsada: selecionarChapa(blanks.tampo.blankC, blanks.tampo.blankL),
    },
    blanks,
    bom,
    avisos: avisos.length > 0 ? avisos : undefined,
  };
}
