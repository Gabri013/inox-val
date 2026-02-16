import { useCallback, useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { toast } from "sonner";
import { buildBOMByTipo, type ProdutoTipo } from "../domains/precificacao/engine/bomBuilder";
import { makeDefaultTables } from "../domains/precificacao/engine/defaultTables";
import {
  validateBeforeQuoteV2,
  quoteWithSheetSelectionV2,
  type BuiltBOM,
  type QuoteResultV2,
  type SheetPolicy,
} from "../domains/precificacao/engine/quoteV2";
import { BancadasForm } from "./forms/BancadasForm";
import { LavatoriosForm } from "./forms/LavatoriosForm";
import { PrateleirasForm } from "./forms/PrateleirasForm";
import { MesasForm } from "./forms/MesasForm";
import { EstanteCantoneiraForm } from "./forms/EstanteCantoneiraForm";
import { EstanteTuboForm } from "./forms/EstanteTuboForm";
import { CoifasForm } from "./forms/CoifasForm";
import { ChapaPlanaForm } from "./forms/ChapaPlanaForm";
import { MaterialRedondoForm } from "./forms/MaterialRedondoForm";
import { CantoneiraForm } from "./forms/CantoneiraForm";
import { PortasBatentesForm } from "./forms/PortasBatentesForm";
import { OrdemProducaoExcelForm } from "./forms/OrdemProducaoExcelForm";
import { QuoteResults } from "./QuoteResults";
import { OpQuoteResults } from "./OpQuoteResults";
import { estimateSheetCostByOp } from "../services/sheetEstimation.service";
import { DEFAULT_PROCESS_RULES } from "../services/processRouting.service";
import type {
  OpNormalizationResult,
  OpPricingSnapshot,
  OpPricingTotals,
  ProcessRule,
  SheetEstimationOverride,
  SheetEstimationResult,
} from "../types/opPricing";
import { sheetSpecsService } from "@/services/firestore/sheetSpecs.service";
import { processRulesService } from "@/services/firestore/processRules.service";
import { orcamentosService } from "@/services/firestore/orcamentos.service";
import { precificacaoService } from "@/services/firestore/precificacao.service";
import { hybridPricingService, setHybridPricingConfig } from "../services/hybridPricing.service";
import type { HybridPricingResult } from "../types/hybridPricing";
import { usePricingConfig } from "../hooks/usePricingConfig";
import type { PricingFormDefaults } from "../config/pricingConfig";

const PRODUTOS: Array<{ id: ProdutoTipo; label: string }> = [
  { id: "bancadas", label: "Bancadas" },
  { id: "lavatorios", label: "Lavatórios" },
  { id: "prateleiras", label: "Prateleiras" },
  { id: "mesas", label: "Mesas" },
  { id: "estanteCantoneira", label: "Estante Cantoneira" },
  { id: "estanteTubo", label: "Estante Tubo" },
  { id: "coifas", label: "Coifas" },
  { id: "chapaPlana", label: "Chapa Plana" },
  { id: "materialRedondo", label: "Material Redondo" },
  { id: "cantoneira", label: "Cantoneira" },
  { id: "portasBatentes", label: "Portas e Batentes" },
  { id: "ordemProducaoExcel", label: "Precificação por OP" },
];

type CalculationState =
  | { kind: "default"; quote: QuoteResultV2; hybrid?: HybridPricingResult }
  | {
      kind: "op";
      normalization: OpNormalizationResult;
      estimation: SheetEstimationResult;
      totals: OpPricingTotals;
      snapshot: OpPricingSnapshot;
    };

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPercent = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed > 1 ? parsed / 100 : parsed;
};

const round = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const isDocumentTooLargeError = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("maximum") &&
    (normalized.includes("size") || normalized.includes("large") || normalized.includes("too big"))
  );
};

const pickFirstFinite = (...values: unknown[]) => {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return undefined;
};

const normalizeFamilyForProduto = (produto: ProdutoTipo) => {
  const map: Record<ProdutoTipo, string> = {
    bancadas: "MOBILIARIO",
    lavatorios: "MOBILIARIO",
    prateleiras: "MOBILIARIO",
    mesas: "MOBILIARIO",
    estanteCantoneira: "ESTRUTURA",
    estanteTubo: "ESTRUTURA",
    coifas: "EXAUSTAO",
    chapaPlana: "AUXILIARES",
    materialRedondo: "ESTRUTURA",
    cantoneira: "ESTRUTURA",
    portasBatentes: "REFRIGERACAO",
    ordemProducaoExcel: "AUXILIARES",
  };
  return map[produto] || "AUXILIARES";
};

const inferDimensaoFromForm = (formData: any): string | undefined => {
  const width = pickFirstFinite(
    formData.largura,
    formData.L,
    formData.w,
    formData.width,
    formData.porta?.largura,
    formData.batente?.largura,
    formData.cuba?.L
  );

  const depth = pickFirstFinite(
    formData.profundidade,
    formData.W,
    formData.d,
    formData.depth,
    formData.comprimento,
    formData.porta?.comprimento,
    formData.batente?.comprimento,
    formData.cuba?.W
  );

  const height = pickFirstFinite(
    formData.altura,
    formData.alturaFrontal,
    formData.alturaPes,
    formData.H,
    formData.h,
    formData.height,
    formData.porta?.altura,
    formData.batente?.altura,
    formData.cuba?.H
  );

  if (width && depth && height) {
    return `${Math.round(width)}X${Math.round(depth)}X${Math.round(height)}`;
  }
  if (width && depth) {
    return `${Math.round(width)}X${Math.round(depth)}`;
  }
  return undefined;
};

const buildOpTotals = (params: {
  custoMaterialChapa: number;
  demaisCustos: number;
  margemPct: number;
  impostosPct: number;
}): OpPricingTotals => {
  const subtotalBase = params.custoMaterialChapa + params.demaisCustos;
  const margemValor = subtotalBase * (params.margemPct / 100);
  const impostosValor = (subtotalBase + margemValor) * (params.impostosPct / 100);
  const precoFinal = subtotalBase + margemValor + impostosValor;
  return {
    custoMaterialChapa: round(params.custoMaterialChapa),
    demaisCustos: round(params.demaisCustos),
    subtotalBase: round(subtotalBase),
    margemPct: round(params.margemPct),
    margemValor: round(margemValor),
    impostosPct: round(params.impostosPct),
    impostosValor: round(impostosValor),
    precoFinal: round(precoFinal),
  };
};

export function PrecificacaoPage() {
  const { config: pricingConfig } = usePricingConfig();
  const pricingProfilesConfig = pricingConfig.pricingProfiles;
  const formDefaults: PricingFormDefaults = pricingConfig.formDefaults;

  useEffect(() => {
    setHybridPricingConfig(pricingConfig.hybridPricing);
  }, [pricingConfig.hybridPricing]);

  const getProfileForProduto = useCallback(
    (produto: ProdutoTipo) => pricingProfilesConfig.produtoTipoToProfile[produto] || pricingProfilesConfig.defaultProfile,
    [pricingProfilesConfig]
  );

  const applyProfileDefaults = useCallback(
    (profileId: string, current: any = {}) => {
      const profile =
        pricingProfilesConfig.profiles[profileId] || pricingProfilesConfig.profiles[pricingProfilesConfig.defaultProfile];
      return {
        ...current,
        pricingProfile: profileId,
        markup: profile.markup,
        minMarginPct: profile.minMarginPct,
        scrapMinPct: profile.scrapMinPct,
        overheadPercent: profile.overheadPercent,
        urgencia: current.urgencia || "normal",
      };
    },
    [pricingProfilesConfig]
  );

  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoTipo>("bancadas");
  const [formData, setFormData] = useState<any>({});
  const [result, setResult] = useState<CalculationState | null>(null);
  const [savingOrcamento, setSavingOrcamento] = useState(false);
  const [fechamentoStats, setFechamentoStats] = useState<{
    total: number;
    ganhoPct: number;
    erroMedioPct: number;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("precificacao_historico_prefill");
      if (!raw) {
        setFormData((prev: any) => applyProfileDefaults(getProfileForProduto("bancadas"), prev));
        return;
      }
      const parsed = JSON.parse(raw);
      const profileId = parsed.pricingProfile || getProfileForProduto("bancadas");
      setFormData((prev: any) => applyProfileDefaults(profileId, { ...prev, ...parsed }));
    } catch {
      setFormData((prev: any) => applyProfileDefaults(getProfileForProduto("bancadas"), prev));
    }
  }, [applyProfileDefaults, getProfileForProduto]);

  useEffect(() => {
    carregarStatsFechamento();
  }, []);

  useEffect(() => {
    const payload = {
      historicoCodigo: formData.historicoCodigo || "",
      historicoFamilia: formData.historicoFamilia || "",
      historicoSubfamilia: formData.historicoSubfamilia || "",
      historicoDimensao: formData.historicoDimensao || "",
      urgencia: formData.urgencia || "normal",
      pricingProfile: formData.pricingProfile || getProfileForProduto(produtoSelecionado),
    };
    localStorage.setItem("precificacao_historico_prefill", JSON.stringify(payload));
  }, [
    formData.historicoCodigo,
    formData.historicoFamilia,
    formData.historicoSubfamilia,
    formData.historicoDimensao,
    formData.urgencia,
    formData.pricingProfile,
    produtoSelecionado,
  ]);

  const handleCalcularClassico = (): CalculationState | null => {
    if (produtoSelecionado === "bancadas" && formData.orcamentoTipo === "bancadaComCuba") {
      if (!formData.cuba || !formData.cuba.L || !formData.cuba.W || !formData.cuba.H) {
        toast.error("Para bancada com cuba, informe as dimensões da cuba (L, W, H).", {
          duration: 4000,
        });
        return null;
      }
    }

    if (produtoSelecionado === "lavatorios" && formData.tipo === "lavatorioPadrao" && !formData.modeloPadrao) {
      toast.error("Para lavatório padrão, selecione o modelo (750/850/FDE).", {
        duration: 4000,
      });
      return null;
    }

    let bom: BuiltBOM;
    try {
      bom = buildBOMByTipo(produtoSelecionado, formData, {
        orcamentoTipo: formData.orcamentoTipo,
      });
    } catch (error: any) {
      toast.error(error?.message || "Erro ao gerar BOM. Verifique os dados informados.", { duration: 4000 });
      return null;
    }

    const mappedProfileId =
      pricingProfilesConfig.produtoTipoToProfile[produtoSelecionado] || pricingProfilesConfig.defaultProfile;
    const selectedProfileId = formData.pricingProfile || mappedProfileId;
    const selectedProfile =
      pricingProfilesConfig.profiles[selectedProfileId] ||
      pricingProfilesConfig.profiles[pricingProfilesConfig.defaultProfile];

    const inoxKgPrice = toNumber(formData.precoKg ?? formData.precoKgInox, 45);
    const tubeKgPrice = toNumber(
      formData.precoKgTubo ?? formData.precoKgTuboPes ?? formData.precoKg ?? formData.precoKgInox,
      inoxKgPrice
    );
    const overheadPercent = toPercent(formData.overheadPercent, selectedProfile.overheadPercent);

    const tables = makeDefaultTables({
      inoxKgPrice,
      tubeKgPrice,
      overheadPercent,
      tubeKgPricePes: toNumber(formData.precoKgTuboPes, tubeKgPrice),
      tubeKgPriceContraventamento: toNumber(formData.precoKgTuboContraventamento, tubeKgPrice),
    });

    const rules = {
      markup: toNumber(formData.markup ?? formData.fatorVenda, selectedProfile.markup),
      minMarginPct: toPercent(formData.minMarginPct, selectedProfile.minMarginPct),
    };

    const families = Array.from(new Set(bom.sheetParts.map((part) => part.family)));
    const sheetPolicyByFamily: Record<string, SheetPolicy> = {};
    const quantity = toNumber(formData.quantidade ?? formData.quantidadeCubas, 1);
    const autoSheetCostMode = quantity >= 6 ? "bought" : "used";

    for (const family of families) {
      sheetPolicyByFamily[family] = {
        mode: formData.sheetMode || "auto",
        manualSheetId: formData.sheetMode === "manual" ? formData.sheetSelected : undefined,
        costMode: autoSheetCostMode,
        scrapMinPct: toPercent(formData.scrapMinPct, selectedProfile.scrapMinPct),
      };
    }

    const errors = validateBeforeQuoteV2({
      tables,
      rules,
      sheetPolicyByFamily,
      bom,
    });
    if (errors.length > 0) {
      toast.error(
        `Não foi possível calcular:\n${errors
          .slice(0, 5)
          .map((item) => `• ${item.message}`)
          .join("\n")}`,
        { duration: 5000 }
      );
      return null;
    }

    const quote = quoteWithSheetSelectionV2({
      tables,
      rules,
      sheetPolicyByFamily,
      bom,
    });

    if (quote.warnings.length > 0) {
      toast("Atenção", {
        description: quote.warnings.slice(0, 3).map((warning) => `• ${warning}`).join("\n"),
        duration: 5000,
      });
    }

    const dimensaoManual = (formData.historicoDimensao as string) || inferDimensaoFromForm(formData);
    const produtoMap: Record<ProdutoTipo, string> = {
      bancadas: "MOBILIARIO",
      lavatorios: "MOBILIARIO",
      prateleiras: "MOBILIARIO",
      mesas: "MOBILIARIO",
      estanteCantoneira: "MOBILIARIO",
      estanteTubo: "MOBILIARIO",
      coifas: "EXAUSTAO",
      chapaPlana: "AUXILIARES",
      materialRedondo: "AUXILIARES",
      cantoneira: "AUXILIARES",
      portasBatentes: "REFRIGERACAO",
      ordemProducaoExcel: "AUXILIARES",
    };

    const hybrid = hybridPricingService.calculate({
      codigo: formData.historicoCodigo,
      familia: formData.historicoFamilia || produtoMap[produtoSelecionado],
      subfamilia: formData.historicoSubfamilia,
      descricao: formData.descricao,
      dimensao: dimensaoManual,
      urgencia: formData.urgencia || "normal",
      precoBaseAtual: quote.costs.priceSuggested,
    });

    return { kind: "default", quote, hybrid };
  };

  const handleCalcularPorOp = async (): Promise<CalculationState | null> => {
    const normalization = formData.opNormalization as OpNormalizationResult | undefined;
    if (!normalization || normalization.items.length === 0) {
      toast.error("Importe uma OP válida para calcular.");
      return null;
    }

    const specsResult = await sheetSpecsService.listActive();
    if (!specsResult.success || !specsResult.data) {
      toast.error(specsResult.error || "Não foi possível carregar a tabela de chapas (sheet_specs).");
      return null;
    }

    const rulesResult = await processRulesService.listActive();
    const processRules: ProcessRule[] =
      rulesResult.success && rulesResult.data && rulesResult.data.items.length > 0
        ? rulesResult.data.items
        : DEFAULT_PROCESS_RULES;

    const override: SheetEstimationOverride = {
      scrapPct: formData.overrideScrapPct === "" ? undefined : toPercent(formData.overrideScrapPct, 0),
      efficiency: formData.overrideEfficiency === "" ? undefined : toPercent(formData.overrideEfficiency, 0),
    };

    const estimation = estimateSheetCostByOp({
      items: normalization.items,
      sheetSpecs: specsResult.data.items,
      processRules,
      override,
    });

    const totals = buildOpTotals({
      custoMaterialChapa: estimation.totals.materialCost,
      demaisCustos: toNumber(formData.demaisCustos, 0),
      margemPct: toNumber(formData.margemPct, 30),
      impostosPct: toNumber(formData.impostosPct, 0),
    });

    const snapshot: OpPricingSnapshot = {
      fileName: formData.importedFileName,
      sheetName: normalization.sheetName,
      items: normalization.items,
      classificationResults: estimation.classificationResults,
      processRulesUsed: processRules,
      overrides: override,
      breakdown: estimation.groups,
      excludedItems: estimation.excludedItems,
      pending: estimation.pending,
      totals,
      canFinalize: estimation.canFinalize,
    };

    if (estimation.pending.length > 0) {
      toast.warning(`Foram encontradas ${estimation.pending.length} pendências no cálculo por OP.`);
    }

    return {
      kind: "op",
      normalization,
      estimation,
      totals,
      snapshot,
    };
  };

  const carregarStatsFechamento = async () => {
    const runs = await precificacaoService.list({
      where: [{ field: "mode", operator: "==", value: "classic" }],
      orderBy: [{ field: "createdAt", direction: "desc" }],
      limit: 120,
    });

    if (!runs.success || !runs.data) return;

    const rows = runs.data.items
      .map((item: any) => item?.outputs?.fechamento)
      .filter((f: any) => f && (f.status === "ganho" || f.status === "perdido"));

    if (rows.length === 0) {
      setFechamentoStats({ total: 0, ganhoPct: 0, erroMedioPct: 0 });
      return;
    }

    const ganhos = rows.filter((r: any) => r.status === "ganho").length;
    const erroMedio =
      rows.reduce((acc: number, r: any) => acc + Math.abs(Number(r.deltaPercent) || 0), 0) /
      Math.max(rows.length, 1);

    setFechamentoStats({
      total: rows.length,
      ganhoPct: Number(((ganhos / rows.length) * 100).toFixed(1)),
      erroMedioPct: Number(erroMedio.toFixed(2)),
    });
  };

  const handleCalcular = async () => {
    if (produtoSelecionado === "ordemProducaoExcel") {
      const opResult = await handleCalcularPorOp();
      if (opResult) setResult(opResult);
      return;
    }

    const classic = handleCalcularClassico();
    if (classic) setResult(classic);
  };

  const handleRegistrarFechamentoClassico = async (payload: {
    status: "ganho" | "perdido";
    precoFechado: number;
    motivo?: string;
  }) => {
    if (!result || result.kind !== "default") return;

    const createResult = await precificacaoService.create({
      mode: "classic",
      sheetName: produtoSelecionado,
      inputFileName: formData.importedFileName,
      overrides: {
        pricingProfile: formData.pricingProfile,
        urgencia: formData.urgencia || "normal",
      },
      outputs: {
        custos: result.quote.costs,
        historico: result.hybrid,
        contexto: {
          familia: normalizeFamilyForProduto(produtoSelecionado),
          subfamilia: (formData.historicoSubfamilia || "").toString().trim().toUpperCase(),
          produtoTipo: produtoSelecionado,
        },
        fechamento: {
          ...payload,
          deltaPercent: Number(
            (((payload.precoFechado - (result.hybrid?.precoIdeal ?? result.quote.costs.priceSuggested)) /
              Math.max(result.hybrid?.precoIdeal ?? result.quote.costs.priceSuggested, 1)) *
              100).toFixed(2)
          ),
        },
      },
    } as any);

    if (!createResult.success) {
      throw new Error(createResult.error || "Não foi possível registrar o fechamento.");
    }

    await carregarStatsFechamento();
  };

  const handleRecalibrarComFechamentos = async () => {
    const runs = await precificacaoService.list({
      where: [{ field: "mode", operator: "==", value: "classic" }],
      orderBy: [{ field: "createdAt", direction: "desc" }],
      limit: 200,
    });

    if (!runs.success || !runs.data) {
      toast.error("Não foi possível carregar fechamentos para recalibrar.");
      return;
    }

    const rows = runs.data.items
      .map((item: any) => ({
        familia: item?.outputs?.contexto?.familia,
        precoIdeal: item?.outputs?.historico?.precoIdeal,
        precoFechado: item?.outputs?.fechamento?.precoFechado,
        status: item?.outputs?.fechamento?.status,
      }))
      .filter((r: any) => r.familia && r.precoIdeal > 0 && r.precoFechado > 0 && r.status === "ganho");

    if (rows.length < 5) {
      toast.warning("Amostra insuficiente para recalibração (mínimo 5 fechamentos ganhos).");
      return;
    }

    const grouped = rows.reduce((acc: Record<string, { sum: number; count: number }>, row: any) => {
      if (!acc[row.familia]) acc[row.familia] = { sum: 0, count: 0 };
      acc[row.familia].sum += row.precoFechado / row.precoIdeal;
      acc[row.familia].count += 1;
      return acc;
    }, {});

    const existingOverridesRaw = localStorage.getItem("hybrid_pricing_overrides");
    const existingOverrides = existingOverridesRaw ? JSON.parse(existingOverridesRaw) : {};
    const familiaFactors = { ...(existingOverrides.familiaFactors || {}) };

    Object.entries(grouped).forEach(([familia, stats]) => {
      if (stats.count < 2) return;
      const media = stats.sum / Math.max(stats.count, 1);
      const ajuste = Math.max(0.97, Math.min(1.03, media));
      const atualBase = familiaFactors[familia] ?? pricingConfig.hybridPricing.familiaFactors[familia] ?? 1;
      familiaFactors[familia] = Number((atualBase * ajuste).toFixed(4));
    });

    const payload = {
      ...existingOverrides,
      familiaFactors,
      updatedAt: new Date().toISOString(),
      source: "pricing_runs_closing_feedback",
    };

    localStorage.setItem("hybrid_pricing_overrides", JSON.stringify(payload));
    toast.success("Recalibração aplicada com base nos fechamentos ganhos.");
  };

  const handleSalvarOrcamentoOp = async () => {
    if (!result || result.kind !== "op") return;
    if (!result.estimation.canFinalize) {
      toast.error("Existem pendências críticas. Corrija antes de salvar o orçamento.");
      return;
    }

    setSavingOrcamento(true);
    try {
      const runResult = await precificacaoService.create({
        mode: "op",
        sheetName: result.normalization.sheetName,
        inputFileName: formData.importedFileName,
        overrides: {
          scrapPct: result.snapshot.overrides.scrapPct,
          efficiency: result.snapshot.overrides.efficiency,
          margemPct: result.totals.margemPct,
          impostosPct: result.totals.impostosPct,
          demaisCustos: result.totals.demaisCustos,
        },
        outputs: {
          totals: result.totals,
          breakdown: result.estimation.groups,
          pending: result.estimation.pending,
          excludedItems: result.estimation.excludedItems,
          classificationResults: result.estimation.classificationResults,
          normalizedItems: result.normalization.items,
          processRulesUsed: result.snapshot.processRulesUsed || [],
        },
      } as any);

      const opPricingRunId = runResult.success && runResult.data ? runResult.data.id : undefined;
      const now = new Date();
      const validade = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const total = result.totals.precoFinal;

      const createPayload = {
        clienteId: formData.clienteId || "cliente-nao-informado",
        clienteNome: formData.clienteNome || "Cliente não informado",
        data: now,
        validade,
        status: "Aguardando Aprovacao" as const,
        itens: [
          {
            id: `op-${Date.now()}`,
            modeloId: "precificacao-op",
            modeloNome: "Precificação por OP",
            descricao: formData.importedFileName || "Ordem de Produção",
            quantidade: 1,
            precoUnitario: total,
            subtotal: total,
          },
        ],
        subtotal: total,
        desconto: 0,
        total,
        observacoes: "Orçamento gerado via modo Precificação por OP.",
        opPricingRunId,
        opPricingSnapshot: result.snapshot,
      };

      let createResult = await orcamentosService.create(createPayload as any);

      if (!createResult.success && isDocumentTooLargeError(createResult.error || "")) {
        const reducedSnapshot: OpPricingSnapshot = {
          ...result.snapshot,
          items: [],
          classificationResults: result.snapshot.classificationResults.slice(0, 120),
          excludedItems: result.snapshot.excludedItems.slice(0, 80),
          pending: result.snapshot.pending.slice(0, 80),
        };
        createResult = await orcamentosService.create({
          ...createPayload,
          opPricingSnapshot: reducedSnapshot,
          observacoes:
            "Orçamento gerado via modo Precificação por OP (snapshot reduzido no orçamento; dados completos em pricing_runs).",
        } as any);
      }

      if (!createResult.success) {
        throw new Error(createResult.error || "Não foi possível salvar o orçamento.");
      }

      toast.success(`Orçamento salvo com sucesso (${createResult.data?.numero || "sem número"}).`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao salvar orçamento.";
      toast.error(message);
    } finally {
      setSavingOrcamento(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sistema de Precificação Inox</h1>
              <p className="text-sm text-muted-foreground">Modo clássico + modo por OP (consumo de chapa)</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-4">Tipo de Produto</h2>
              <div className="space-y-2">
                {PRODUTOS.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => {
                      setProdutoSelecionado(produto.id);
                      setFormData((prev: any) => applyProfileDefaults(getProfileForProduto(produto.id), prev));
                      setResult(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      produtoSelecionado === produto.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent text-foreground"
                    }`}
                  >
                    {produto.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {PRODUTOS.find((item) => item.id === produtoSelecionado)?.label}
              </h2>

              {produtoSelecionado === "bancadas" && (
                <BancadasForm formData={formData} setFormData={setFormData} defaults={formDefaults.bancadas} />
              )}
              {produtoSelecionado === "lavatorios" && (
                <LavatoriosForm formData={formData} setFormData={setFormData} defaults={formDefaults.lavatorios} />
              )}
              {produtoSelecionado === "prateleiras" && (
                <PrateleirasForm formData={formData} setFormData={setFormData} defaults={formDefaults.prateleiras} />
              )}
              {produtoSelecionado === "mesas" && (
                <MesasForm formData={formData} setFormData={setFormData} defaults={formDefaults.mesas} />
              )}
              {produtoSelecionado === "estanteCantoneira" && (
                <EstanteCantoneiraForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "estanteTubo" && (
                <EstanteTuboForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "coifas" && <CoifasForm formData={formData} setFormData={setFormData} />}
              {produtoSelecionado === "chapaPlana" && (
                <ChapaPlanaForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "materialRedondo" && (
                <MaterialRedondoForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "cantoneira" && (
                <CantoneiraForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "portasBatentes" && (
                <PortasBatentesForm formData={formData} setFormData={setFormData} />
              )}
              {produtoSelecionado === "ordemProducaoExcel" && (
                <OrdemProducaoExcelForm formData={formData} setFormData={setFormData} />
              )}

              {produtoSelecionado !== "ordemProducaoExcel" && (
                <div className="mt-6 border border-border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold text-foreground mb-3">Aprimorar com histórico (SolidWorks)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={formData.pricingProfile || getProfileForProduto(produtoSelecionado)}
                      onChange={(e) => setFormData((prev: any) => applyProfileDefaults(e.target.value, prev))}
                      className="px-3 py-2 rounded-md border border-border bg-background"
                    >
                      {Object.entries(pricingProfilesConfig.profiles).map(([id, profile]) => (
                        <option key={id} value={id}>{profile.label}</option>
                      ))}
                    </select>
                    <input
                      value={formData.historicoCodigo || ""}
                      onChange={(e) => setFormData({ ...formData, historicoCodigo: e.target.value })}
                      placeholder="Código (ex.: S154330)"
                      className="px-3 py-2 rounded-md border border-border bg-background"
                    />
                    <input
                      value={formData.historicoFamilia || ""}
                      onChange={(e) => setFormData({ ...formData, historicoFamilia: e.target.value })}
                      placeholder="Família (opcional)"
                      className="px-3 py-2 rounded-md border border-border bg-background"
                    />
                    <input
                      value={formData.historicoSubfamilia || ""}
                      onChange={(e) => setFormData({ ...formData, historicoSubfamilia: e.target.value })}
                      placeholder="Subfamília (opcional)"
                      className="px-3 py-2 rounded-md border border-border bg-background"
                    />
                    <input
                      value={formData.historicoDimensao || ""}
                      onChange={(e) => setFormData({ ...formData, historicoDimensao: e.target.value })}
                      placeholder="Dimensão (ex.: 1500X700X900)"
                      className="px-3 py-2 rounded-md border border-border bg-background"
                    />
                    <select
                      value={formData.urgencia || "normal"}
                      onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
                      className="px-3 py-2 rounded-md border border-border bg-background"
                    >
                      <option value="normal">Urgência: Normal</option>
                      <option value="urgente">Urgência: Urgente</option>
                      <option value="super">Urgência: Super urgente</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleCalcular}
                className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Calculator className="w-5 h-5" />
                <span>Calcular Orçamento</span>
              </button>
            </div>

            {fechamentoStats && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-4">
                <h3 className="font-semibold text-foreground mb-2">Painel de assertividade (fechamentos)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-md border border-border p-3">
                    <div className="text-muted-foreground">Amostra</div>
                    <div className="text-lg font-semibold">{fechamentoStats.total}</div>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <div className="text-muted-foreground">Taxa de ganho</div>
                    <div className="text-lg font-semibold text-green-600">{fechamentoStats.ganhoPct}%</div>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <div className="text-muted-foreground">Erro médio vs recomendado</div>
                    <div className="text-lg font-semibold">{fechamentoStats.erroMedioPct}%</div>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleRecalibrarComFechamentos}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium"
                  >
                    Recalibrar fatores com fechamentos ganhos
                  </button>
                </div>
              </div>
            )}

            {result?.kind === "default" && (
              <QuoteResults
                quote={result.quote}
                hybrid={result.hybrid}
                onRegistrarFechamento={handleRegistrarFechamentoClassico}
              />
            )}
            {result?.kind === "op" && (
              <OpQuoteResults
                normalization={result.normalization}
                estimation={result.estimation}
                totals={result.totals}
                onSave={handleSalvarOrcamentoOp}
                saving={savingOrcamento}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
