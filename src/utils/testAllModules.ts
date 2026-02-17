// Teste sintético de todos os módulos de precificação INOX
// Executa validação e simulação de orçamento para cada ProdutoTipo
// Resultado: Nenhum NaN, bloqueio/erro se faltar dado obrigatório

import { buildBOMByTipo } from '@/domains/precificacao/domains/precificacao/engine/bomBuilder';
import { makeDefaultTables } from '@/domains/precificacao/domains/precificacao/engine/defaultTables';
import { quoteWithSheetSelectionV2, validateBeforeQuoteV2 } from '@/domains/precificacao/domains/precificacao/engine/quoteV2';

const produtos = [
  {
    tipo: 'bancadas',
    input: {
      comprimento: 1000,
      largura: 700,
      alturaFrontal: 100,
      espessuraChapa: 1,
      quantidadeCubas: 1,
      tipoCuba: 'sem',
      quantidadePes: 4,
      tipoTuboPes: 'tuboRedondo',
      alturaPes: 900,
      temContraventamento: false,
      tipoPrateleiraInferior: 'nenhuma',
      usarMaoFrancesa: false,
    },
    ctx: { orcamentoTipo: 'bancadaSemCuba' as 'bancadaSemCuba' },
  },
  // Teste com todos acessórios hidráulicos ativados
  {
    tipo: 'lavatorios',
    input: {
      tipo: 'lavatorioPadrao',
      modeloPadrao: '750',
      valvula: true,
      mangueiras: true,
      joelho: true,
      pedal: true,
      bicaAlta: true,
      bicaBaixa: true,
    },
  },
  // Teste estante tubo com rodízio
  {
    tipo: 'estanteTubo',
    input: {
      comprimento: 1200,
      largura: 500,
      altura: 1800,
      quantidadePlanos: 4,
      quantidadePes: 4,
      tipoPrateleira: 'lisa',
      incluirRodizios: true,
    },
  },
  // Teste estante cantoneira sem rodízio (deve exigir pé nivelador)
  {
    tipo: 'estanteCantoneira',
    input: {
      comprimento: 1200,
      largura: 500,
      altura: 1800,
      quantidadePlanos: 4,
      tipoPrateleira: 'lisa',
      quantidadePes: 4,
      espessuraChapa: 1,
      incluirRodizios: false,
    },
  },
  // Teste prateleira com kit fixação
  {
    tipo: 'prateleiras',
    input: {
      tipo: 'lisa',
      comprimento: 1000,
      profundidade: 400,
      bordaDobrada: false,
      espessuraChapa: 1,
      usarMaoFrancesa: true,
    },
  },
  {
    tipo: 'mesas',
    input: {
      comprimento: 1200,
      largura: 700,
      espessuraTampo: 1,
      bordaTampo: 40,
      quantidadePes: 4,
      tipoTuboPes: 'tuboRedondo',
      alturaPes: 900,
      tipoPrateleiraInferior: 'nenhuma',
      temContraventamento: false,
    },
  },
  {
    tipo: 'lavatorios',
    input: {
      tipo: 'lavatorioPadrao',
      modeloPadrao: '750',
      valvula: true,
      mangueiras: true,
      joelho: true,
      pedal: false,
      bicaAlta: false,
      bicaBaixa: false,
    },
  },
  {
    tipo: 'prateleiras',
    input: {
      tipo: 'lisa',
      comprimento: 1000,
      profundidade: 400,
      bordaDobrada: false,
      espessuraChapa: 1,
      usarMaoFrancesa: true,
    },
  },
  // Adicione outros produtos conforme necessário
];

const tables = makeDefaultTables({ inoxKgPrice: 45, tubeKgPrice: 45, overheadPercent: 0.1 });
const rules = { minMarginPct: 0.15, markup: 3 };
const sheetPolicyByFamily = {};

for (const prod of produtos) {
  try {
    const bom = buildBOMByTipo(prod.tipo as any, prod.input, prod.ctx);
    const errors = validateBeforeQuoteV2({ tables, rules, sheetPolicyByFamily, bom });
    if (errors.length > 0) {
      console.error(`[${prod.tipo}] Falha de validação:`, errors);
      continue;
    }
    const quote = quoteWithSheetSelectionV2({ tables, rules, sheetPolicyByFamily, bom });
    const hasNaN = Object.values(quote.costs).some(v => !Number.isFinite(v));
    if (hasNaN) {
      console.error(`[${prod.tipo}] Resultado contém NaN!`, quote.costs);
    } else {
      console.log(`[${prod.tipo}] OK:`, quote.costs);
    }
  } catch (e) {
    console.error(`[${prod.tipo}] Erro:`, e);
  }
}
