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
  tuboRedondo: 0,
  tuboQuadrado: 0,
  tuboRetangular: 0,

  // Exemplos de chaves detalhadas (coloque kg/m real)
  // "tuboQuadrado_40x40x1.2": 0,
  // "tuboRedondo_38.1x1.2": 0,
  // "tuboRetangular_40x20x1.2": 0,
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
  peNivelador: 0,
  maoFrancesa: 0,
  rodizio: 0,
  valvula: 0,
  mangueira: 0,
  joelho: 0,
  pedal: 0,
  bicaAlta: 0,
  bicaBaixa: 0,
  mdf: 0,
};

/*
  Função que monta as tabelas prontas para o motor.
  Você passa o preço/kg (que vem do form) e pode mostrar overhead.
*/
export function makeDefaultTables(params: { inoxKgPrice: number; overheadPercent?: number }): PricingTables {
  return {
    inoxKgPrice: params.inoxKgPrice,
    densityKgPerM3: 7900,
    sheetCatalog: DEFAULT_SHEET_CATALOG,

    tubeKgPerMeter: DEFAULT_TUBE_KG_PER_METER,
    angleKgPerMeter: DEFAULT_ANGLE_KG_PER_METER,

    accessoryUnitPrice: DEFAULT_ACCESSORY_UNIT_PRICE,

    processCostPerHour: DEFAULT_PROCESS_COST_PER_HOUR,

    overheadPercent: params.overheadPercent ?? 0,
  };
}
