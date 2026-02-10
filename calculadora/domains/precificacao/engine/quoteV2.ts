/* ========= QUOTE ENGINE V2 (com angleParts + chapa auto/manual) =========
   - sheetParts -> nesting -> custo por "área comprada" -> kg -> R$
   - tubeParts  -> metros * kg/m -> kg -> R$
   - angleParts -> metros * kg/m -> kg -> R$
   - accessories -> qty * preço unitário
   - processes -> minutos/60 * R$/h (bloqueia se faltar tabela, via validate)
   - overhead -> % sobre subtotal
   - anti-prejuízo -> priceMinSafe
   - preço sugerido -> max(costBase*markup, priceMinSafe)
*/

/* =========================
   1) TIPOS
   ========================= */

export type Money = number;

export type ProcessKind = "cut" | "bend" | "weld" | "finish" | "assembly" | "installation";
export type SheetMode = "auto" | "manual";
export type SheetCostMode = "bought" | "used"; // NOVO: modo de custo

export interface SheetCatalogItem {
  id: string;
  w: number;     // mm
  h: number;     // mm
  label: string;
}

export interface SheetPartRect {
  id: string;
  w: number;           // mm
  h: number;           // mm
  qty: number;
  thicknessMm: number; // mm
  family: string;      // "cuba" | "tampo" | ...
  canRotate?: boolean;
}

export interface TubePart {
  id: string;
  meters: number;
  tubeKey: string; // tabela kg/m
  family: string;
}

export interface AnglePart {
  id: string;
  meters: number;
  angleKey: string; // tabela kg/m cantoneira
  family: string;
}

export interface AccessoryPart {
  sku: string;
  description: string;
  qty: number;
}

export interface ProcessItem {
  kind: ProcessKind;
  description: string;
  minutes: number;
}

export interface BuiltBOM {
  sheetParts: SheetPartRect[];
  tubeParts: TubePart[];
  angleParts?: AnglePart[];
  accessories: AccessoryPart[];
  processes: ProcessItem[];
}

export interface PricingTables {
  inoxKgPrice: Money; // R$/kg
  densityKgPerM3: number; // 7900
  sheetCatalog: SheetCatalogItem[];

  // kg/m (você cadastra)
  tubeKgPerMeter: Record<string, number>;
  angleKgPerMeter: Record<string, number>;

  // acessórios
  accessoryUnitPrice: Record<string, Money>;

  // processos
  processCostPerHour: Record<ProcessKind, Money>;

  overheadPercent: number; // 0..1
}

export interface PricingRules {
  minMarginPct: number; // 0..1
  markup: number;       // ex: 3
}

export interface SheetPolicy {
  mode: SheetMode;
  manualSheetId?: string;
  costMode: SheetCostMode;    // NOVO: "bought" ou "used"
  scrapMinPct: number;        // NOVO: ex: 0.15 = 15% de desperdício mínimo
}

export interface NestingResult {
  sheet: SheetCatalogItem;
  sheetsUsed: number;
  areaUsedM2: number;
  areaBoughtM2: number;
  efficiency: number;
  waste: number;
}

export interface QuoteResultV2 {
  nestingByGroup: Array<{
    groupKey: string; // "family|thickness"
    nesting: NestingResult;
    costSheet: Money;
    kgBought: number;
  }>;
  costs: {
    sheet: Money;
    tubes: Money;
    angles: Money;
    accessories: Money;
    processes: Money;
    overhead: Money;
    costBase: Money;
    priceMinSafe: Money;
    priceSuggested: Money;
  };
  warnings: string[];
}

/* =========================
   2) VALIDAÇÃO (bloqueia antes)
   ========================= */

export interface ValidationError {
  field: string;
  message: string;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function validateBeforeQuoteV2(params: {
  tables: PricingTables;
  rules: PricingRules;
  sheetPolicyByFamily: Record<string, SheetPolicy>;
  bom: BuiltBOM;
}): ValidationError[] {
  const { tables, rules, sheetPolicyByFamily, bom } = params;
  const errors: ValidationError[] = [];

  if (!(tables.inoxKgPrice > 0)) errors.push({ field: "inoxKgPrice", message: "Preço/kg do inox inválido." });
  if (!(tables.densityKgPerM3 > 0)) errors.push({ field: "density", message: "Densidade inválida." });
  if (!tables.sheetCatalog?.length) errors.push({ field: "sheetCatalog", message: "Catálogo de chapas não cadastrado." });

  if (!(rules.markup > 0)) errors.push({ field: "markup", message: "Markup inválido." });
  if (!(rules.minMarginPct >= 0 && rules.minMarginPct < 1)) errors.push({ field: "minMarginPct", message: "Margem mínima deve ser 0..99%." });

  // sheet policy por família
  const families = Array.from(new Set(bom.sheetParts.map(p => p.family)));
  for (const fam of families) {
    const pol = sheetPolicyByFamily[fam];
    if (!pol) continue;
    if (pol.mode === "manual") {
      if (!pol.manualSheetId) errors.push({ field: `sheetSelected:${fam}`, message: `Selecione chapa manual para família "${fam}".` });
      const ok = tables.sheetCatalog.some(s => s.id === pol.manualSheetId);
      if (!ok) errors.push({ field: `sheetSelected:${fam}`, message: `Chapa manual inválida para família "${fam}".` });
    }
  }

  // sheet parts
  for (const p of bom.sheetParts) {
    if (!(p.w > 0 && p.h > 0 && p.qty > 0)) errors.push({ field: `sheetPart:${p.id}`, message: `Blank inválido: ${p.id}.` });
    if (!(p.thicknessMm > 0)) errors.push({ field: `sheetPart:${p.id}`, message: `Espessura inválida: ${p.id}.` });
  }

  // tube parts
  for (const t of bom.tubeParts) {
    if (t.meters < 0) errors.push({ field: `tube:${t.id}`, message: `Metragem inválida: ${t.id}.` });
    if (t.meters > 0 && !(tables.tubeKgPerMeter[t.tubeKey] > 0)) {
      errors.push({ field: `tubeKey:${t.tubeKey}`, message: `Sem kg/m cadastrado para tubo: ${t.tubeKey}.` });
    }
  }

  // angle parts
  for (const a of bom.angleParts ?? []) {
    if (a.meters < 0) errors.push({ field: `angle:${a.id}`, message: `Metragem inválida: ${a.id}.` });
    if (a.meters > 0 && !(tables.angleKgPerMeter[a.angleKey] > 0)) {
      errors.push({ field: `angleKey:${a.angleKey}`, message: `Sem kg/m cadastrado para cantoneira: ${a.angleKey}.` });
    }
  }

  // accessories
  for (const a of bom.accessories) {
    if (a.qty < 0) errors.push({ field: `acc:${a.sku}`, message: `Quantidade inválida: ${a.sku}.` });
    if (a.qty > 0 && !(tables.accessoryUnitPrice[a.sku] > 0)) {
      errors.push({ field: `accPrice:${a.sku}`, message: `Sem preço cadastrado para acessório: ${a.sku}.` });
    }
  }

  // processes
  for (const pr of bom.processes) {
    if (pr.minutes < 0) errors.push({ field: `process:${pr.kind}`, message: `Minutos inválidos: ${pr.kind}.` });
    if (pr.minutes > 0 && !(tables.processCostPerHour[pr.kind] > 0)) {
      errors.push({ field: `processCost:${pr.kind}`, message: `Sem custo/h cadastrado para processo: ${pr.kind}.` });
    }
  }

  return errors;
}

/* =========================
   3) NESTING (heurística por área + penalidade de forma)
   ========================= */

function mm2ToM2(mm2: number) {
  return mm2 / 1_000_000;
}

function sheetAreaM2(sheet: SheetCatalogItem) {
  return mm2ToM2(sheet.w * sheet.h);
}

function estimateNesting(rects: SheetPartRect[], sheet: SheetCatalogItem): NestingResult {
  const expanded = rects.flatMap(r => Array.from({ length: r.qty }, () => r));

  const areaUsedM2 = expanded.reduce((acc, r) => acc + mm2ToM2(r.w * r.h), 0);
  const areaChapa = sheetAreaM2(sheet);

  const penalties = expanded.map((r) => {
    const a = Math.max(r.w, r.h) / Math.max(1, Math.min(r.w, r.h));
    return 1 + Math.min(0.35, (a - 1) * 0.05);
  });

  const factorForma = penalties.length ? penalties.reduce((a, b) => a + b, 0) / penalties.length : 1;
  const sheetsUsed = Math.max(1, Math.ceil((areaUsedM2 * factorForma) / Math.max(areaChapa, 1e-9)));

  const areaBoughtM2 = sheetsUsed * areaChapa;
  const efficiency = clamp01(areaUsedM2 / Math.max(areaBoughtM2, 1e-9));
  const waste = 1 - efficiency;

  return { sheet, sheetsUsed, areaUsedM2, areaBoughtM2, efficiency, waste };
}

function pickSheetAuto(rects: SheetPartRect[], catalog: SheetCatalogItem[]): SheetCatalogItem {
  let best = catalog[0];
  let bestBought = Number.POSITIVE_INFINITY;

  for (const s of catalog) {
    const n = estimateNesting(rects, s);
    if (n.areaBoughtM2 < bestBought) {
      bestBought = n.areaBoughtM2;
      best = s;
    }
  }
  return best;
}

function sheetKgFromAreaM2(areaM2: number, thicknessMm: number, densityKgPerM3: number) {
  const t = thicknessMm / 1000;
  return areaM2 * t * densityKgPerM3;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/* =========================
   4) QUOTE ENGINE V2
   ========================= */

export function quoteWithSheetSelectionV2(params: {
  tables: PricingTables;
  rules: PricingRules;
  sheetPolicyByFamily: Record<string, SheetPolicy>;
  bom: BuiltBOM;
}): QuoteResultV2 {
  const { tables, rules, sheetPolicyByFamily, bom } = params;
  const warnings: string[] = [];

  // 4.1 Sheet groups: family|thickness
  const groups = new Map<string, SheetPartRect[]>();
  for (const p of bom.sheetParts) {
    const key = `${p.family}|${p.thicknessMm}`;
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }

  // 4.2 Sheet cost with nesting per group
  const nestingByGroup: QuoteResultV2["nestingByGroup"] = [];
  let costSheetTotal = 0;

  for (const [groupKey, rects] of groups.entries()) {
    const [family, thicknessStr] = groupKey.split("|");
    const thicknessMm = Number(thicknessStr);

    const policy = sheetPolicyByFamily[family] ?? { 
      mode: "auto" as const, 
      costMode: "bought" as const,
      scrapMinPct: 0.15 
    };

    let chosen: SheetCatalogItem | undefined;
    if (policy.mode === "manual") {
      chosen = tables.sheetCatalog.find(s => s.id === policy.manualSheetId);
      if (!chosen) warnings.push(`Chapa manual inválida para família "${family}".`);
    } else {
      chosen = pickSheetAuto(rects, tables.sheetCatalog);
    }
    if (!chosen) chosen = tables.sheetCatalog[0];

    const nesting = estimateNesting(rects, chosen);
    
    // NOVO: Calcular custo baseado no modo
    let kgBought: number;
    let costSheet: number;
    
    if (policy.costMode === "used") {
      // MODO "USADA": kg útil × (1 + scrapMinPct)
      const kgUsed = sheetKgFromAreaM2(nesting.areaUsedM2, thicknessMm, tables.densityKgPerM3);
      kgBought = kgUsed * (1 + policy.scrapMinPct);
      costSheet = kgBought * tables.inoxKgPrice;
      warnings.push(`Família "${family}": modo USADO (kg útil + ${(policy.scrapMinPct * 100).toFixed(0)}% scrap). Sobra vira estoque.`);
    } else {
      // MODO "COMPRADA": área comprada × espessura × densidade
      kgBought = sheetKgFromAreaM2(nesting.areaBoughtM2, thicknessMm, tables.densityKgPerM3);
      costSheet = kgBought * tables.inoxKgPrice;
    }

    nestingByGroup.push({
      groupKey,
      nesting,
      kgBought: round2(kgBought),
      costSheet: round2(costSheet),
    });

    costSheetTotal += costSheet;
  }

  // 4.3 Tubes
  let costTubes = 0;
  for (const t of bom.tubeParts) {
    const kgpm = tables.tubeKgPerMeter[t.tubeKey] ?? 0;
    if (t.meters > 0 && !kgpm) warnings.push(`Sem kg/m para tubo "${t.tubeKey}".`);
    costTubes += (t.meters * kgpm) * tables.inoxKgPrice;
  }

  // 4.4 Angles
  let costAngles = 0;
  for (const a of bom.angleParts ?? []) {
    const kgpm = tables.angleKgPerMeter[a.angleKey] ?? 0;
    if (a.meters > 0 && !kgpm) warnings.push(`Sem kg/m para cantoneira "${a.angleKey}".`);
    costAngles += (a.meters * kgpm) * tables.inoxKgPrice;
  }

  // 4.5 Accessories
  let costAccessories = 0;
  for (const a of bom.accessories) {
    const unit = tables.accessoryUnitPrice[a.sku] ?? 0;
    if (a.qty > 0 && !unit) warnings.push(`Sem preço para acessório "${a.sku}".`);
    costAccessories += a.qty * unit;
  }

  // 4.6 Processes
  let costProcesses = 0;
  for (const pr of bom.processes) {
    const cph = tables.processCostPerHour[pr.kind] ?? 0;
    if (pr.minutes > 0 && !cph) warnings.push(`Sem custo/h para processo "${pr.kind}".`);
    costProcesses += (pr.minutes / 60) * cph;
  }

  // 4.7 Overhead
  const overhead = (costSheetTotal + costTubes + costAngles + costAccessories + costProcesses) * clamp01(tables.overheadPercent);

  // 4.8 Cost base
  const costBase = costSheetTotal + costTubes + costAngles + costAccessories + costProcesses + overhead;

  // 4.9 Anti-prejuízo + price suggested
  const minMargin = clamp01(rules.minMarginPct);
  const priceMinSafe = costBase / Math.max(1 - minMargin, 1e-9);

  const priceSuggestedRaw = costBase * rules.markup;
  const priceSuggested = Math.max(priceSuggestedRaw, priceMinSafe);

  return {
    nestingByGroup,
    costs: {
      sheet: round2(costSheetTotal),
      tubes: round2(costTubes),
      angles: round2(costAngles),
      accessories: round2(costAccessories),
      processes: round2(costProcesses),
      overhead: round2(overhead),
      costBase: round2(costBase),
      priceMinSafe: round2(priceMinSafe),
      priceSuggested: round2(priceSuggested),
    },
    warnings,
  };
}