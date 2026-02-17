/* ========= LÓGICA (11 PRODUTOS) PARA APLICAR NO SITE =========
   Objetivo: para cada ProdutoTipo retornar BuiltBOM:
   - sheetParts (retângulos de blank) => nesting (auto/manual)
   - tubeParts (m) => custo por kg/m
   - accessories (SKU) => custo unitário
   - processes (min) => custo/h (se não tiver, deixe 0 e bloqueie com validação)

   IMPORTANTE:
   - Onde o blank real depende de dobras, aqui eu uso "bounding box" (retângulo externo).
   - Para ficar 100% real, depois você refina cada peça (blank real) com suas regras de dobra.
*/

export type ProdutoTipo =
  | "bancadas"
  | "lavatorios"
  | "prateleiras"
  | "mesas"
  | "estanteCantoneira"
  | "estanteTubo"
  | "coifas"
  | "chapaPlana"
  | "materialRedondo"
  | "cantoneira"
  | "portasBatentes";

export type ProcessKind = "cut" | "bend" | "weld" | "finish" | "assembly" | "installation";

export interface SheetPartRect {
  id: string;
  w: number;           // mm
  h: number;           // mm
  qty: number;
  thicknessMm: number; // mm
  family: string;
  canRotate?: boolean;
}

export interface TubePart {
  id: string;
  meters: number;
  tubeKey: string; // chave kg/m
  family: string;
}

export interface AnglePart {
  id: string;
  meters: number;
  angleKey: string; // chave kg/m cantoneira (se preferir, trate como tubeParts com outra tabela)
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

/* =========================
   Helpers
   ========================= */
const mm = (n: number) => (Number.isFinite(n) ? n : 0);
const mFromMm = (mmVal: number) => mmVal / 1000;

function tubeKeyFromTipo(tipo: string) {
  // padronize as chaves que existem na sua tabela kg/m
  if (tipo === "tuboQuadrado") return "tuboQuadrado";
  if (tipo === "tuboRetangular") return "tuboRetangular";
  return "tuboRedondo";
}

/* ==========================================================
   1) BANCADAS (3 modos: somenteCuba / bancadaSemCuba / bancadaComCuba)
   ========================================================== */

export type TipoCuba = "sem" | "com" | "comEspelho";
export type TipoPrateleira = "lisa" | "gradeada" | "perfurada" | "nenhuma";

export interface BancadasInput {
  comprimento: number;
  largura: number;
  alturaFrontal: number; // usado como "espelho" da bancada; para cuba use profundidade (ver abaixo)
  espessuraChapa: number;
  quantidadeCubas: number;
  tipoCuba: TipoCuba;
  quantidadePes: 4 | 5 | 6 | 7;
  tipoTuboPes: "tuboRedondo" | "tuboQuadrado" | "tuboRetangular";
  alturaPes: number;
  temContraventamento: boolean;
  tipoPrateleiraInferior: TipoPrateleira;
  usarMaoFrancesa: boolean;

  // NOVO (para bancadaComCuba ficar real e não "achismo"):
  cuba?: { L: number; W: number; H: number; t: number }; // mm
}

export function buildBOM_Bancadas(
  input: BancadasInput,
  orcamentoTipo: "somenteCuba" | "bancadaSemCuba" | "bancadaComCuba"
): BuiltBOM {
  const sheetParts: SheetPartRect[] = [];
  const tubeParts: TubePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessItem[] = [];

  const L = mm(input.comprimento);
  const W = mm(input.largura);
  const t = mm(input.espessuraChapa);

  // 1.1 Somente cuba (cuba soldada retangular: 1 fundo + 4 laterais)
  if (orcamentoTipo === "somenteCuba") {
    // aqui usa alturaFrontal como profundidade se você ainda não tem campo separado
    const H = mm(input.alturaFrontal);

    sheetParts.push(
      { id: "cuba_fundo", w: L, h: W, qty: 1, thicknessMm: t, family: "cuba" },
      { id: "cuba_lat_L", w: L, h: H, qty: 2, thicknessMm: t, family: "cuba" },
      { id: "cuba_lat_W", w: W, h: H, qty: 2, thicknessMm: t, family: "cuba" }
    );

    return { sheetParts, tubeParts, accessories, processes };
  }

  // 1.2 Bancada (tampo) - retângulo externo
  sheetParts.push({ id: "tampo", w: L, h: W, qty: 1, thicknessMm: t, family: "tampo" });

  // 1.3 Espelho/saia frontal (se você usa alturaFrontal como espelho)
  if (input.alturaFrontal > 0) {
    sheetParts.push({ id: "espelho_traseiro", w: L, h: mm(input.alturaFrontal), qty: 1, thicknessMm: t, family: "tampo" });
  }

  // 1.4 Prateleira inferior (se for de chapa)
  if (input.tipoPrateleiraInferior !== "nenhuma") {
    sheetParts.push({
      id: `prateleira_inferior_${input.tipoPrateleiraInferior}`,
      w: L,
      h: W,
      qty: 1,
      thicknessMm: t,
      family: "prateleira",
    });
  }

  // 1.5 Estrutura tubular (pés + travessas)
  const qtdPes = input.quantidadePes;
  const alturaPes = mm(input.alturaPes);

  const metrosPes = mFromMm(qtdPes * alturaPes);

  const perimetro = mFromMm(2 * (L + W));
  const metrosTravessas = input.temContraventamento ? perimetro : perimetro * 0.5;

  const tubeKey = tubeKeyFromTipo(input.tipoTuboPes);

  tubeParts.push({
    id: "estrutura_tubos",
    meters: metrosPes + metrosTravessas,
    tubeKey,
    family: "estrutura",
  });

  // acessórios comuns
  accessories.push({ sku: "peNivelador", description: "Pé nivelador", qty: qtdPes });
  if (input.usarMaoFrancesa) accessories.push({ sku: "maoFrancesa", description: "Mão francesa", qty: 2 });

  // 1.6 Bancada com cuba (somente se tiver dimensões da cuba)
  if (orcamentoTipo === "bancadaComCuba") {
    if (input.cuba) {
      const c = input.cuba;
      sheetParts.push(
        { id: "cuba_fundo", w: c.L, h: c.W, qty: input.quantidadeCubas || 1, thicknessMm: c.t, family: "cuba" },
        { id: "cuba_lat_L", w: c.L, h: c.H, qty: 2 * (input.quantidadeCubas || 1), thicknessMm: c.t, family: "cuba" },
        { id: "cuba_lat_W", w: c.W, h: c.H, qty: 2 * (input.quantidadeCubas || 1), thicknessMm: c.t, family: "cuba" }
      );
    } else {
      // Sem dimensões => não monta cuba (você deve bloquear com toast)
    }
  }

  return { sheetParts, tubeParts, accessories, processes };
}

/* ==========================================================
   2) LAVATÓRIOS (padrão/cirúrgico)
   - Padrão: use modelo (750/850/FDE) para mapear dimensões (tabela interna)
   - Cirúrgico: usa dimensões informadas (bounding box)
   ========================================================== */

export type LavatorioTipo = "lavatorioPadrao" | "lavatorioCirurgico";
export type LavatorioModeloPadrao = "750" | "850" | "FDE";

export interface LavatoriosInput {
  tipo: LavatorioTipo;
  modeloPadrao?: LavatorioModeloPadrao;
  comprimento?: number;
  largura?: number;
  profundidade?: number;
  alturaFrontal?: number;
  bicaAlta?: boolean;
  bicaBaixa?: boolean;
  pedal?: boolean;
  mangueiras?: boolean;
  joelho?: boolean;
  valvula?: boolean;
}

const LAVATORIO_PADRAO_DIM: Record<LavatorioModeloPadrao, { L: number; W: number; t: number }> = {
  // Você deve ajustar para seus modelos reais
  "750": { L: 750, W: 500, t: 1.0 },
  "850": { L: 850, W: 500, t: 1.0 },
  "FDE": { L: 850, W: 550, t: 1.0 },
};

export function buildBOM_Lavatorios(input: LavatoriosInput): BuiltBOM {
  const sheetParts: SheetPartRect[] = [];
  const tubeParts: TubePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessItem[] = [];

  let L = 0, W = 0, t = 1.0;

  if (input.tipo === "lavatorioPadrao") {
    const m = input.modeloPadrao ?? "750";
    L = LAVATORIO_PADRAO_DIM[m].L;
    W = LAVATORIO_PADRAO_DIM[m].W;
    t = LAVATORIO_PADRAO_DIM[m].t;
  } else {
    L = mm(input.comprimento ?? 0);
    W = mm(input.largura ?? 0);
    t = 1.0; // ideal: adicionar espessura do lavatório no form
  }

  // Corpo mínimo: retângulo de tampo/base (refine depois)
  sheetParts.push({ id: "lavatorio_tampo", w: L, h: W, qty: 1, thicknessMm: t, family: "lavatorio" });

  // acessórios hidráulicos
  if (input.valvula) accessories.push({ sku: "valvula", description: "Válvula", qty: 1 });
  if (input.mangueiras) accessories.push({ sku: "mangueira", description: "Mangueira", qty: 1 });
  if (input.joelho) accessories.push({ sku: "joelho", description: "Joelho", qty: 1 });
  if (input.pedal) accessories.push({ sku: "pedal", description: "Pedal", qty: 1 });
  if (input.bicaAlta) accessories.push({ sku: "bicaAlta", description: "Bica alta", qty: 1 });
  if (input.bicaBaixa) accessories.push({ sku: "bicaBaixa", description: "Bica baixa", qty: 1 });

  return { sheetParts, tubeParts, accessories, processes };
}

/* ==========================================================
   3) PRATELEIRAS
   ========================================================== */

export interface PrateleirasInput {
  tipo: "lisa" | "gradeada";
  comprimento: number;
  profundidade: number;
  bordaDobrada: boolean;
  espessuraChapa: number;
  usarMaoFrancesa: boolean;
}

export function buildBOM_Prateleiras(input: PrateleirasInput): BuiltBOM {
  const sheetParts: SheetPartRect[] = [];
  const tubeParts: TubePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessItem[] = [];

  sheetParts.push({
    id: `prateleira_${input.tipo}`,
    w: mm(input.comprimento),
    h: mm(input.profundidade),
    qty: 1,
    thicknessMm: mm(input.espessuraChapa),
    family: "prateleira",
  });

  if (input.usarMaoFrancesa) accessories.push({ sku: "maoFrancesa", description: "Mão francesa", qty: 2 });

  return { sheetParts, tubeParts, accessories, processes };
}

/* ==========================================================
   4) MESAS
   ========================================================== */

export interface MesasInput {
  comprimento: number;
  largura: number;
  espessuraTampo: number;
  bordaTampo: number;
  quantidadePes: 4 | 5 | 6 | 7;
  tipoTuboPes: "tuboRedondo" | "tuboQuadrado" | "tuboRetangular";
  alturaPes: number;
  tipoPrateleiraInferior: TipoPrateleira;
  temContraventamento: boolean;
}

export function buildBOM_Mesas(input: MesasInput): BuiltBOM {
  const sheetParts: SheetPartRect[] = [];
  const tubeParts: TubePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessItem[] = [];

  const L = mm(input.comprimento);
  const W = mm(input.largura);
  const t = mm(input.espessuraTampo);

  sheetParts.push({ id: "mesa_tampo", w: L, h: W, qty: 1, thicknessMm: t, family: "tampo" });

  if (input.tipoPrateleiraInferior !== "nenhuma") {
    sheetParts.push({
      id: `mesa_prateleira_${input.tipoPrateleiraInferior}`,
      w: L,
      h: W,
      qty: 1,
      thicknessMm: t,
      family: "prateleira",
    });
  }

  const qtdPes = input.quantidadePes;
  const metrosPes = mFromMm(qtdPes * mm(input.alturaPes));
  const perimetro = mFromMm(2 * (L + W));
  const metrosTravessas = input.temContraventamento ? perimetro : perimetro * 0.5;

  tubeParts.push({
    id: "mesa_estrutura",
    meters: metrosPes + metrosTravessas,
    tubeKey: tubeKeyFromTipo(input.tipoTuboPes),
    family: "estrutura",
  });

  accessories.push({ sku: "peNivelador", description: "Pé nivelador", qty: qtdPes });

  return { sheetParts, tubeParts, accessories, processes };
}

/* ==========================================================
   5) ESTANTE/ CARRO EM CANTONEIRA
   ========================================================== */

export interface EstanteCantoneiraInput {
  comprimento: number;
  largura: number;
  altura: number;
  quantidadePlanos: number;
  tipoPrateleira: "lisa" | "gradeada" | "perfurada";
  quantidadePes: number;
  espessuraChapa: number;
  incluirRodizios: boolean;
}

export function buildBOM_EstanteCantoneira(input: EstanteCantoneiraInput): BuiltBOM {
  const sheetParts: SheetPartRect[] = [];
  const tubeParts: TubePart[] = [];
  const angleParts: AnglePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessItem[] = [];

  const L = mm(input.comprimento);
  const W = mm(input.largura);
  const H = mm(input.altura);
  const t = mm(input.espessuraChapa);

  // Planos em chapa
  sheetParts.push({
    id: `estante_planos_${input.tipoPrateleira}`,
    w: L,
    h: W,
    qty: Math.max(1, Math.floor(input.quantidadePlanos)),
    thicknessMm: t,
    family: "prateleira",
  });

  // Estrutura em cantoneira: montantes + perímetros por nível (regra explícita)
  const pes = Math.max(1, Math.floor(input.quantidadePes));
  const metrosMontantes = mFromMm(pes * H);
  const metrosPerimetros = mFromMm(Math.max(1, input.quantidadePlanos) * 2 * (L + W));

  angleParts.push({
    id: "estante_cantoneira",
    meters: metrosMontantes + metrosPerimetros,
    angleKey: "cantoneiraPadrao", // defina chaves reais
    family: "estrutura",
  });

  if (input.incluirRodizios) accessories.push({ sku: "rodizio", description: "Rodízio", qty: pes });

  return { sheetParts, tubeParts, angleParts, accessories, processes };
}

/* ==========================================================
   6) ESTANTE/ CARRO EM TUBO
   ========================================================== */

export interface EstanteTuboInput {
  comprimento: number;
  largura: number;
  altura: number;
  quantidadePlanos: number;
  quantidadePes: number;
  tipoPrateleira: "lisa" | "gradeada" | "perfurada";
  valorMetroTubo: number; // opcional no motor (se você quiser custo por R$/m ao invés de R$/kg)
}

export function buildBOM_EstanteTubo(input: EstanteTuboInput): BuiltBOM {
  const sheetParts: SheetPartRect[] = [];
  const tubeParts: TubePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessItem[] = [];

  const L = mm(input.comprimento);
  const W = mm(input.largura);
  const H = mm(input.altura);

  sheetParts.push({
    id: `estante_planos_${input.tipoPrateleira}`,
    w: L,
    h: W,
    qty: Math.max(1, Math.floor(input.quantidadePlanos)),
    thicknessMm: 1.0, // ideal: expor espessura no form
    family: "prateleira",
  });

  const pes = Math.max(1, Math.floor(input.quantidadePes));
  const metrosMontantes = mFromMm(pes * H);
  const metrosPerimetros = mFromMm(Math.max(1, input.quantidadePlanos) * 2 * (L + W));

  tubeParts.push({
    id: "estante_tubos",
    meters: metrosMontantes + metrosPerimetros,
    tubeKey: "tuboPadrao", // defina chaves reais
    family: "estrutura",
  });

  return { sheetParts, tubeParts, accessories, processes };
}

/* ==========================================================
   7) COIFAS (mínimo: envelope; refine depois em peças)
   ========================================================== */

export interface CoifaInput {
  comprimento: number;
  largura: number;
  altura: number;
  tipoCoifa: "3-aguas" | "4-aguas";
  incluirDuto: boolean;
  incluirCurva: boolean;
  incluirChapeu: boolean;
  incluirInstalacao: boolean;
}

export function buildBOM_Coifas(input: CoifaInput): BuiltBOM {
  const sheetParts: SheetPartRect[] = [];
  const tubeParts: TubePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessItem[] = [];

  const L = mm(input.comprimento);
  const W = mm(input.largura);
  const A = mm(input.altura);
  const t = 1.0; // ideal: espessura da coifa por regra (304/316 etc)

  // Envelope aproximado -> transforma em 2 retângulos grandes (para nesting) (refine depois)
  // Peça 1: "topo+base" ~ L×W (x2)
  // Peça 2: "laterais" ~ L×A e W×A (x2) (agrupar)
  sheetParts.push(
    { id: "coifa_topo", w: L, h: W, qty: 1, thicknessMm: t, family: "coifa" },
    { id: "coifa_lateral_L", w: L, h: A, qty: 2, thicknessMm: t, family: "coifa" },
    { id: "coifa_lateral_W", w: W, h: A, qty: 2, thicknessMm: t, family: "coifa" }
  );

  if (input.incluirDuto) sheetParts.push({ id: "duto", w: L, h: A, qty: 1, thicknessMm: t, family: "coifa" });
  if (input.incluirCurva) sheetParts.push({ id: "curva", w: W, h: A, qty: 1, thicknessMm: t, family: "coifa" });
  if (input.incluirChapeu) sheetParts.push({ id: "chapeu", w: W, h: W, qty: 1, thicknessMm: t, family: "coifa" });

  if (input.incluirInstalacao) processes.push({ kind: "installation", description: "Instalação", minutes: 0 });

  return { sheetParts, tubeParts, accessories, processes };
}

/* ==========================================================
   8) CHAPA PLANA
   ========================================================== */

export interface ChapaPlanaInput {
  comprimento: number;
  largura: number;
  espessura: number;
  precoKg: number;
}

export function buildBOM_ChapaPlana(input: ChapaPlanaInput): BuiltBOM {
  return {
    sheetParts: [{ id: "chapa_plana", w: mm(input.comprimento), h: mm(input.largura), qty: 1, thicknessMm: mm(input.espessura), family: "default" }],
    tubeParts: [],
    accessories: [],
    processes: [],
  };
}

/* ==========================================================
   9) MATERIAL REDONDO (repuxo) - precisa tabela interna (não inventa)
   ========================================================== */

export interface MaterialRedondoInput {
  diametro: number;
  altura: number;
  espessura: number;
  percentualRepuxo: number;
}

export function buildBOM_MaterialRedondo(_input: MaterialRedondoInput): BuiltBOM {
  // Sem modelo técnico de repuxo definido, não gera chapa/retângulos sem inventar.
  // Você deve mapear para: "blank circular equivalente" ou "kg fixo por diâmetro/altura" em tabela.
  return { sheetParts: [], tubeParts: [], accessories: [], processes: [] };
}

/* ==========================================================
   10) CANTONEIRA (perfil em L)
   ========================================================== */

export interface CantoneiraInput {
  comprimento: number;
  ladoA: number;
  ladoB: number;
  espessura: number;
}

export function buildBOM_Cantoneira(input: CantoneiraInput): BuiltBOM {
  return {
    sheetParts: [],
    tubeParts: [],
    angleParts: [{
      id: "cantoneira",
      meters: mFromMm(mm(input.comprimento)),
      angleKey: `${mm(input.ladoA)}x${mm(input.ladoB)}x${mm(input.espessura)}`,
      family: "estrutura",
    }],
    accessories: [],
    processes: [],
  };
}

/* ==========================================================
   11) PORTAS E BATENTES
   ========================================================== */

export interface PortasBatentesInput {
  porta: {
    altura: number;
    largura: number;
    espessuraFrente: number;
    espessuraVerso: number;
    preenchimentoMDF: boolean;
  };
  batente: {
    altura: number;
    largura: number;
    perfil: number;
    espessura: number;
  };
}

export function buildBOM_PortasBatentes(input: PortasBatentesInput): BuiltBOM {
  const sheetParts: SheetPartRect[] = [];
  const tubeParts: TubePart[] = [];
  const accessories: AccessoryPart[] = [];
  const processes: ProcessItem[] = [];

  const Lp = mm(input.porta.largura);
  const Hp = mm(input.porta.altura);

  sheetParts.push(
    { id: "porta_face_frente", w: Lp, h: Hp, qty: 1, thicknessMm: mm(input.porta.espessuraFrente), family: "portas" },
    { id: "porta_face_verso", w: Lp, h: Hp, qty: 1, thicknessMm: mm(input.porta.espessuraVerso), family: "portas" }
  );

  const Lb = mm(input.batente.largura);
  const Hb = mm(input.batente.altura);

  sheetParts.push({ id: "batente", w: Lb, h: Hb, qty: 1, thicknessMm: mm(input.batente.espessura), family: "portas" });

  if (input.porta.preenchimentoMDF) accessories.push({ sku: "mdf", description: "Preenchimento MDF", qty: 1 });

  return { sheetParts, tubeParts, accessories, processes };
}

/* ==========================================================
   DISPATCH (um único build para os 11)
   ========================================================== */

export function buildBOMByTipo(
  tipo: ProdutoTipo,
  input: any,
  ctx?: { orcamentoTipo?: "somenteCuba" | "bancadaSemCuba" | "bancadaComCuba" }
): BuiltBOM {
  switch (tipo) {
    case "bancadas":
      return buildBOM_Bancadas(input as BancadasInput, ctx?.orcamentoTipo ?? "bancadaComCuba");
    case "lavatorios":
      return buildBOM_Lavatorios(input as LavatoriosInput);
    case "prateleiras":
      return buildBOM_Prateleiras(input as PrateleirasInput);
    case "mesas":
      return buildBOM_Mesas(input as MesasInput);
    case "estanteCantoneira":
      return buildBOM_EstanteCantoneira(input as EstanteCantoneiraInput);
    case "estanteTubo":
      return buildBOM_EstanteTubo(input as EstanteTuboInput);
    case "coifas":
      return buildBOM_Coifas(input as CoifaInput);
    case "chapaPlana":
      return buildBOM_ChapaPlana(input as ChapaPlanaInput);
    case "materialRedondo":
      return buildBOM_MaterialRedondo(input as MaterialRedondoInput);
    case "cantoneira":
      return buildBOM_Cantoneira(input as CantoneiraInput);
    case "portasBatentes":
      return buildBOM_PortasBatentes(input as PortasBatentesInput);
  }
}
