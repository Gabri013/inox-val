/* ========= defaultTables.ts (CATÁLOGO MÍNIMO PARA COMEÇAR) =========
   - NÃO é "preço de mercado": é estrutura + chaves para você plugar valores.
   - Você deve editar os números (kg/m e preços) conforme sua realidade.
   - Mantém o motor V2 funcionando e bloqueando quando faltar dado.
*/

import type { PricingTables, ProcessKind, SheetCatalogItem } from "./quoteV2";

export const DEFAULT_SHEET_CATALOG: SheetCatalogItem[] = [
  { id: "2000x1250", w: 2000, h: 1250, label: "2000×1250" },
  { id: "3000x1250", w: 3000, h: 1250, label: "3000×1250" },
  { id: "1500x1250", w: 1500, h: 1250, label: "1500×1250" },
];

export const DEFAULT_PROCESS_COST_PER_HOUR: Record<ProcessKind, number> = {
  cut: 0,          // R$/h (preencha)
  bend: 0,         // R$/h (preencha)
  weld: 0,         // R$/h (preencha)
  finish: 0,       // R$/h (preencha)
  assembly: 0,     // R$/h (preencha)
  installation: 0, // R$/h (preencha)
};

/* 
  TABELA DE kg/m (EXEMPLO)
  Ajuste as chaves para bater com as do seu builder.
  Se você usar apenas "tuboRedondo" genérico hoje, cadastre:
  tubeKgPerMeter["tuboRedondo"] = ...
  O ideal é detalhar: "tuboQuadrado_40x40x1.2" etc.
*/
export const DEFAULT_TUBE_KG_PER_METER: Record<string, number> = {
  // Genéricos (apenas para não travar dev; TROQUE pelos reais)
  tuboRedondo: 2.5, // valor provisório, ajuste para o real
  tuboQuadrado: 2.8, // valor provisório
  tuboRetangular: 2.6, // valor provisório

  // Perfis reais usados na fábrica
  tuboRedondo_38_1x1_2: 1.09, // Ø38,1mm x 1,2mm (pés)
  tuboRedondo_25_4x1_2: 0.74, // Ø25,4mm x 1,2mm (contraventamento)
  // Adicione outros perfis conforme necessário
};

/*
  Cantoneira kg/m
  Eu usei chave `${ladoA}x${ladoB}x${espessura}` no builder.
  Ex: "30x30x3"
*/
export const DEFAULT_ANGLE_KG_PER_METER: Record<string, number> = {
  // Exemplo:
  // "30x30x3": 0,
  // "40x40x3": 0,
  cantoneiraPadrao: 0, // fallback se você não detalhar (refine)
};

/*
  Acessórios (SKU => preço unitário)
  Use os mesmos SKUs que você colocou no builder.
*/
export const DEFAULT_ACCESSORY_UNIT_PRICE: Record<string, number> = {
  // Lavatórios (hidráulica)
  valvula_un: 45, // un
  mangueira_flex_un: 18, // un
  joelho_1_2_un: 7, // un
  pedal_un: 60, // un
  bica_alta_un: 80, // un
  bica_baixa_un: 60, // un

  // Estante Cantoneira / Estante Tubo
  pe_nivelador_un: 12, // un
  rodizio_un: 35, // un
  kit_fixacao_un: 10, // un
  ponteira_plastica_un: 2, // un

  // Coifas
  duto_m: 90, // m
  curva_duto_un: 35, // un
  chapeu_un: 40, // un
  instalacao_un: 300, // un (serviço)

  // Serviços globais
  servico_corte_m: 8, // m
  servico_dobra_un: 12, // un

  // Material Redondo (repuxo)
  setup_repuxo_un: 120, // un
  servico_repuxo_un: 40, // un
  overhead_repuxo_pct: 0, // pct (percentual, se usar)

  // Portas e Batentes
  dobradica_un: 9, // un
  puxador_un: 25, // un
  fechadura_un: 30, // un
  vedacao_m: 6, // m
  // kit_fixacao_un já incluso acima
};

/*
  Função que monta as tabelas prontas para o motor.
  Você passa o preço/kg (que vem do form) e pode mostrar overhead.
*/
export function makeDefaultTables(params: {
  inoxKgPrice: number;
  tubeKgPrice?: number;
  tubeKgPricePes?: number;
  tubeKgPriceContraventamento?: number;
  overheadPercent?: number;
}): PricingTables {
  return {
    inoxKgPrice: params.inoxKgPrice,
    tubeKgPrice: params.tubeKgPrice ?? params.inoxKgPrice,
    tubeKgPricePes: params.tubeKgPricePes ?? params.tubeKgPrice ?? params.inoxKgPrice,
    tubeKgPriceContraventamento:
      params.tubeKgPriceContraventamento ?? params.tubeKgPrice ?? params.inoxKgPrice,
    densityKgPerM3: 7900,
    sheetCatalog: DEFAULT_SHEET_CATALOG,

    tubeKgPerMeter: DEFAULT_TUBE_KG_PER_METER,
    angleKgPerMeter: DEFAULT_ANGLE_KG_PER_METER,

    accessoryUnitPrice: DEFAULT_ACCESSORY_UNIT_PRICE,

    processCostPerHour: DEFAULT_PROCESS_COST_PER_HOUR,

    overheadPercent: params.overheadPercent ?? 0,
  };
}
