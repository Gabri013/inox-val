import levantamentoCsvRaw from "../../../../levantamento_ordens_2022.csv?raw";
import dimensoesCsvRaw from "../../../../ordens_com_dimensoes.csv?raw";
import hybridConfig from "../config/hybridPricing.config.json";
import type { HybridPricingInput, HybridPricingResult } from "../types/hybridPricing";
import { parseDimension } from "../utils/dimensionParser";

interface CsvRow {
  [key: string]: string;
}

interface HistoricalRow {
  codigo: string;
  familia?: string;
  subfamilia?: string;
  descricao?: string;
  dimensao?: string;
  temProjeto?: boolean;
  temBloco?: boolean;
  temRender?: boolean;
}

const normalizeText = (value?: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const toBoolean = (value?: string) => (value || "").toString().toLowerCase() === "true";

const parseCsv = (raw: string): CsvRow[] => {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const splitCsvLine = (line: string) => {
    const out: string[] = [];
    let token = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          token += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        out.push(token);
        token = "";
      } else {
        token += char;
      }
    }
    out.push(token);
    return out.map((item) => item.trim());
  };

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = cols[index] || "";
    });
    return row;
  });
};

const buildHistoricalData = (): HistoricalRow[] => {
  const mainRows = parseCsv(levantamentoCsvRaw);
  const dimRows = parseCsv(dimensoesCsvRaw);

  const dimByCode = new Map<string, string>();
  dimRows.forEach((row) => {
    const codigo = normalizeText(row.Codigo);
    if (!codigo) return;
    if (row.Dimensao) dimByCode.set(codigo, row.Dimensao);
  });

  return mainRows.map((row) => ({
    codigo: normalizeText(row.Codigo),
    familia: normalizeText(row.Familia),
    subfamilia: normalizeText(row.Subfamilia),
    descricao: normalizeText(row.Descricao),
    dimensao: row.Dimensao || dimByCode.get(normalizeText(row.Codigo)) || "",
    temProjeto: toBoolean(row.TemProjeto),
    temBloco: toBoolean(row.TemBloco),
    temRender: toBoolean(row.TemRender),
  }));
};

const historicalData = buildHistoricalData();

const getDimFactor = (dimensao?: string) => {
  const parsed = parseDimension(dimensao);
  if (!parsed) return 1;
  const maxSide = Math.max(parsed.larguraMm, parsed.profundidadeMm, parsed.alturaMm || 0);
  const band = hybridConfig.dimensaoBands.find((item) => maxSide <= item.maxMaiorLadoMm);
  return band?.factor ?? 1;
};

export const hybridPricingService = {
  calculate(input: HybridPricingInput): HybridPricingResult {
    const code = normalizeText(input.codigo);
    const family = normalizeText(input.familia);
    const subfamily = normalizeText(input.subfamilia);

    const matchedByCode = code ? historicalData.find((row) => row.codigo === code) : undefined;

    const resolvedFamily = family || matchedByCode?.familia || "";
    const resolvedSubfamily = subfamily || matchedByCode?.subfamilia || "";
    const resolvedDimensao = input.dimensao || matchedByCode?.dimensao || "";

    const fatorFamilia =
      hybridConfig.familiaFactors[resolvedFamily as keyof typeof hybridConfig.familiaFactors] ??
      hybridConfig.defaultFactor;

    const fatorSubfamilia =
      hybridConfig.subfamiliaFactors[resolvedSubfamily as keyof typeof hybridConfig.subfamiliaFactors] ??
      hybridConfig.defaultFactor;

    const fatorDimensao = getDimFactor(resolvedDimensao);

    const temProjeto = input.temProjeto ?? matchedByCode?.temProjeto ?? false;
    const temBloco = input.temBloco ?? matchedByCode?.temBloco ?? false;
    const temRender = input.temRender ?? matchedByCode?.temRender ?? false;

    const complexityBonus =
      (temProjeto ? hybridConfig.complexityBonus.temProjeto : 0) +
      (temBloco ? hybridConfig.complexityBonus.temBloco : 0) +
      (temRender ? hybridConfig.complexityBonus.temRender : 0);

    const fatorComplexidade = 1 + complexityBonus;
    const fatorUrgencia = input.urgencia === "super" ? 1.12 : input.urgencia === "urgente" ? 1.05 : 1;
    const fatorHistoricoRaw = fatorFamilia * fatorSubfamilia * fatorDimensao * fatorComplexidade * fatorUrgencia;
    const fatorHistorico = clamp(fatorHistoricoRaw, 0.9, 1.45);

    const precoRecomendado = input.precoBaseAtual * fatorHistorico;
    const precoMin = precoRecomendado * hybridConfig.fallbackRange.min;
    const precoMax = precoRecomendado * hybridConfig.fallbackRange.max;

    const confidenceSignals = [Boolean(matchedByCode), Boolean(resolvedFamily), Boolean(parseDimension(resolvedDimensao))];
    const confidenceScore = confidenceSignals.filter(Boolean).length;

    const confianca = confidenceScore >= 3 ? "alta" : confidenceScore === 2 ? "media" : "baixa";
    const confiancaScore = Number(((confidenceScore / 3) * 100).toFixed(0));

    const pendencias: string[] = [];
    if (!matchedByCode) pendencias.push("Sem match por código histórico (Sxxxxxx).");
    if (!resolvedFamily) pendencias.push("Família não informada/detectada.");
    if (!parseDimension(resolvedDimensao)) pendencias.push("Dimensão ausente ou inválida (ex.: 1500X700X900).");

    const justificativa: string[] = [];
    if (matchedByCode) justificativa.push(`Histórico encontrado para código ${matchedByCode.codigo}.`);
    if (resolvedFamily) justificativa.push(`Fator de família aplicado: ${resolvedFamily} (${fatorFamilia.toFixed(2)}).`);
    if (resolvedSubfamily && fatorSubfamilia !== 1)
      justificativa.push(`Fator de subfamília aplicado: ${resolvedSubfamily} (${fatorSubfamilia.toFixed(2)}).`);
    if (resolvedDimensao && fatorDimensao !== 1)
      justificativa.push(`Fator dimensional aplicado (${resolvedDimensao} => ${fatorDimensao.toFixed(2)}).`);
    if (fatorComplexidade !== 1)
      justificativa.push(`Complexidade aplicada (${((fatorComplexidade - 1) * 100).toFixed(0)}%).`);
    if (fatorUrgencia !== 1)
      justificativa.push(`Urgência aplicada (${input.urgencia === "super" ? "super" : "urgente"}).`);
    if (fatorHistorico !== fatorHistoricoRaw)
      justificativa.push("Fator histórico ajustado por limite de segurança (0.90–1.45).");
    if (justificativa.length === 0)
      justificativa.push("Sem dados históricos suficientes. Mantido fator neutro (1.00).");

    return {
      precoBaseAtual: round2(input.precoBaseAtual),
      precoRecomendado: round2(precoRecomendado),
      precoMin: round2(precoMin),
      precoIdeal: round2(precoRecomendado),
      precoMax: round2(precoMax),
      confianca,
      confiancaScore,
      pendencias,
      justificativa,
      breakdown: {
        fatorFamilia: round4(fatorFamilia),
        fatorSubfamilia: round4(fatorSubfamilia),
        fatorDimensao: round4(fatorDimensao),
        fatorComplexidade: round4(fatorComplexidade),
        fatorHistorico: round4(fatorHistorico),
      },
    };
  },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const round2 = (value: number) => Math.round(value * 100) / 100;
const round4 = (value: number) => Math.round(value * 10000) / 10000;
