import pricingProfilesJson from "./pricingProfiles.json";
import hybridPricingJson from "./hybridPricing.config.json";
import type { ProdutoTipo } from "../domains/precificacao/engine/bomBuilder";

export type PricingProfile = {
  label: string;
  markup: number;
  minMarginPct: number;
  scrapMinPct: number;
  overheadPercent: number;
};

export type PricingProfilesConfig = {
  defaultProfile: string;
  profiles: Record<string, PricingProfile>;
  produtoTipoToProfile: Record<string, string>;
};

export type HybridPricingConfig = {
  defaultFactor: number;
  fallbackRange: { min: number; max: number };
  familiaFactors: Record<string, number>;
  subfamiliaFactors: Record<string, number>;
  complexityBonus: {
    temProjeto: number;
    temBloco: number;
    temRender: number;
  };
  dimensaoBands: Array<{ maxMaiorLadoMm: number; factor: number }>;
};

export type ProdutoFormDefaults = {
  precoKg?: number;
  markup?: number;
  overheadPercent?: number;
  minMarginPct?: number;
  precoKgInox?: number;
  precoKgTuboPes?: number;
  precoKgTuboContraventamento?: number;
  fatorVenda?: number;
  scrapMinPct?: number;
};

export type PricingFormDefaults = Record<ProdutoTipo | "global", ProdutoFormDefaults>;

export type PricingConfig = {
  pricingProfiles: PricingProfilesConfig;
  hybridPricing: HybridPricingConfig;
  formDefaults: PricingFormDefaults;
  updatedAt?: string;
  updatedBy?: string;
};

export const DEFAULT_PRICING_PROFILES = pricingProfilesJson as PricingProfilesConfig;
export const DEFAULT_HYBRID_PRICING = hybridPricingJson as HybridPricingConfig;

export const DEFAULT_FORM_DEFAULTS: PricingFormDefaults = {
  bancadas: {
    precoKgInox: 45,
    precoKgTuboPes: 45,
    precoKgTuboContraventamento: 45,
    fatorVenda: 3,
    scrapMinPct: 15,
  },
  lavatorios: {
    precoKg: 45,
    markup: 3,
    overheadPercent: 0,
    minMarginPct: 0.25,
  },
  prateleiras: {
    precoKg: 45,
    markup: 3,
    overheadPercent: 0,
    minMarginPct: 0.25,
  },
  mesas: {
    precoKg: 45,
    markup: 3,
    overheadPercent: 0,
    minMarginPct: 0.25,
  },
  estanteCantoneira: {},
  estanteTubo: {},
  coifas: {},
  chapaPlana: {},
  materialRedondo: {},
  cantoneira: {},
  portasBatentes: {},
  ordemProducaoExcel: {},
  global: {},
};

const mergeNumberRecord = (
  base: Record<string, number>,
  override?: Record<string, number>
): Record<string, number> => ({
  ...base,
  ...(override || {}),
});

const mergeHybridConfig = (override?: Partial<HybridPricingConfig>): HybridPricingConfig => {
  const base = DEFAULT_HYBRID_PRICING;
  return {
    defaultFactor: override?.defaultFactor ?? base.defaultFactor,
    fallbackRange: {
      min: override?.fallbackRange?.min ?? base.fallbackRange.min,
      max: override?.fallbackRange?.max ?? base.fallbackRange.max,
    },
    familiaFactors: mergeNumberRecord(base.familiaFactors, override?.familiaFactors),
    subfamiliaFactors: mergeNumberRecord(base.subfamiliaFactors, override?.subfamiliaFactors),
    complexityBonus: {
      temProjeto: override?.complexityBonus?.temProjeto ?? base.complexityBonus.temProjeto,
      temBloco: override?.complexityBonus?.temBloco ?? base.complexityBonus.temBloco,
      temRender: override?.complexityBonus?.temRender ?? base.complexityBonus.temRender,
    },
    dimensaoBands:
      override?.dimensaoBands && override.dimensaoBands.length > 0
        ? override.dimensaoBands
        : base.dimensaoBands,
  };
};

const mergeProfiles = (override?: Partial<PricingProfilesConfig>): PricingProfilesConfig => {
  const base = DEFAULT_PRICING_PROFILES;
  return {
    defaultProfile: override?.defaultProfile ?? base.defaultProfile,
    profiles: {
      ...base.profiles,
      ...(override?.profiles || {}),
    },
    produtoTipoToProfile: {
      ...base.produtoTipoToProfile,
      ...(override?.produtoTipoToProfile || {}),
    },
  };
};

const formDefaultKeys: Array<ProdutoTipo | "global"> = [
  "bancadas",
  "lavatorios",
  "prateleiras",
  "mesas",
  "estanteCantoneira",
  "estanteTubo",
  "coifas",
  "chapaPlana",
  "materialRedondo",
  "cantoneira",
  "portasBatentes",
  "ordemProducaoExcel",
  "global",
];

const mergeFormDefaults = (override?: Partial<PricingFormDefaults>): PricingFormDefaults => {
  const merged: Partial<PricingFormDefaults> = {};
  formDefaultKeys.forEach((key) => {
    merged[key] = {
      ...(DEFAULT_FORM_DEFAULTS[key] || {}),
      ...((override || {})[key] || {}),
    } as ProdutoFormDefaults;
  });
  return merged as PricingFormDefaults;
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  pricingProfiles: DEFAULT_PRICING_PROFILES,
  hybridPricing: DEFAULT_HYBRID_PRICING,
  formDefaults: DEFAULT_FORM_DEFAULTS,
};

export const buildEffectivePricingConfig = (override?: Partial<PricingConfig>): PricingConfig => {
  const mergedProfiles = mergeProfiles(override?.pricingProfiles);
  const mergedHybrid = mergeHybridConfig(override?.hybridPricing);
  const mergedFormDefaults = mergeFormDefaults(override?.formDefaults);

  return {
    pricingProfiles: mergedProfiles,
    hybridPricing: mergedHybrid,
    formDefaults: mergedFormDefaults,
    updatedAt: override?.updatedAt,
    updatedBy: override?.updatedBy,
  };
};

export const PRICING_CONFIG_TYPE = "PRECIFICACAO" as const;
