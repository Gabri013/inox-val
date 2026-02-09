import { useEffect, useMemo, useState } from 'react';
import { GLOBAL_FIELDS, getProductConfig, PRODUCT_CONFIGS, type FieldConfig } from '../system/formConfig';
import type { GlobalParams, ProdutoTipo } from '../system/types';
import {
  calcularBancadas,
  calcularChapaPlana,
  calcularCantoneira,
  calcularCoifas,
  calcularEstanteCantoneira,
  calcularEstanteTubo,
  calcularLavatorios,
  calcularMaterialRedondo,
  calcularMesas,
  calcularPortasBatentes,
  calcularPrateleiras,
} from '../system/calculations';

type FieldValue = string | boolean;

const DEFAULT_GLOBAL_VALUES: Record<string, string> = {
  precoKgInox: '37',
  fatorTampo: '3',
  fatorCuba: '3',
  fatorVenda: '3',
  percentualDesperdicio: '5',
  percentualMaoDeObra: '20',
};

const RESULT_LABELS: Record<string, string> = {
  custoChapa: 'Custo da chapa',
  custoEstrutura: 'Custo da estrutura',
  custoCubas: 'Custo das cubas',
  custoAcessorios: 'Custo dos acessórios',
  custoMaterial: 'Custo material',
  custoProducao: 'Custo produção',
  precoFinal: 'Preço final',
};

const parseNumber = (value: FieldValue) => {
  if (typeof value === 'boolean') return value ? 1 : 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.replace(/\s/g, '');
  const cleaned = normalized.includes(',')
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized;
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

const buildDefaultValues = (fields: FieldConfig[]) => {
  const values: Record<string, FieldValue> = {};
  fields.forEach((field) => {
    if (field.type === 'boolean') {
      values[field.name] = false;
      return;
    }
    if (field.type === 'select' && field.options?.length) {
      values[field.name] = String(field.options[0].value);
      return;
    }
    values[field.name] = '';
  });
  return values;
};

const getNestedValue = (values: Record<string, FieldValue>, path: string) => values[path];

const setNestedValue = (values: Record<string, FieldValue>, path: string, value: FieldValue) => ({
  ...values,
  [path]: value,
});

const buildGlobalParams = (values: Record<string, string>): GlobalParams => ({
  precoKgInox: parseNumber(values.precoKgInox),
  fatorTampo: parseNumber(values.fatorTampo),
  fatorCuba: parseNumber(values.fatorCuba),
  fatorVenda: parseNumber(values.fatorVenda),
  percentualDesperdicio: parseNumber(values.percentualDesperdicio) / 100,
  percentualMaoDeObra: parseNumber(values.percentualMaoDeObra) / 100,
});

export default function PrecificacaoPage() {
  const [produtoTipo, setProdutoTipo] = useState<ProdutoTipo>('bancadas');
  const [globalValues, setGlobalValues] = useState<Record<string, string>>(DEFAULT_GLOBAL_VALUES);
  const [productValues, setProductValues] = useState<Record<string, FieldValue>>({});
  const [result, setResult] = useState<Record<string, number> | null>(null);
  // Opção de orçamento: 'somenteCuba', 'bancadaSemCuba', 'bancadaComCuba'
  const [orcamentoTipo, setOrcamentoTipo] = useState<'somenteCuba' | 'bancadaSemCuba' | 'bancadaComCuba'>('bancadaComCuba');

  const productConfig = useMemo(() => getProductConfig(produtoTipo), [produtoTipo]);

  useEffect(() => {
    if (!productConfig) return;
    setProductValues(buildDefaultValues(productConfig.fields));
    setResult(null);
  }, [productConfig, produtoTipo]);

  // Exibe campos conforme a opção de orçamento
  const isFieldVisible = (field: FieldConfig) => {
    if (produtoTipo !== 'bancadas') {
      if (!field.dependsOn) return true;
      const currentValue = getNestedValue(productValues, field.dependsOn.field);
      return String(currentValue) === String(field.dependsOn.value);
    }
    // Para bancadas/cubas:
    if (orcamentoTipo === 'somenteCuba') {
      // Mostra campos de cuba e dimensões/espessura
      return [
        'quantidadeCubas',
        'tipoCuba',
        'comprimento',
        'largura',
        'espessuraChapa',
        'alturaFrontal', // se altura da cuba for relevante
      ].includes(field.name);
    }
    if (orcamentoTipo === 'bancadaSemCuba') {
      // Não mostra campos de cuba
      if (['quantidadeCubas', 'tipoCuba'].includes(field.name)) return false;
      return true;
    }
    // Padrão: mostra tudo
    if (!field.dependsOn) return true;
    const currentValue = getNestedValue(productValues, field.dependsOn.field);
    return String(currentValue) === String(field.dependsOn.value);
  };

  const handleGlobalChange = (field: string, value: string) => {
    setGlobalValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (field: FieldConfig, value: FieldValue) => {
    setProductValues((prev) => setNestedValue(prev, field.name, value));
  };

  const toResultMap = (input: object) => {
    const map: Record<string, number> = {};
    Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        map[key] = value;
      }
    });
    return map;
  };

  const handleCalculate = () => {
    const params = buildGlobalParams(globalValues);
    switch (produtoTipo) {
      case 'bancadas': {
        // Monta os parâmetros conforme a opção de orçamento
        let args: any = {};
        if (orcamentoTipo === 'somenteCuba') {
          args = {
            quantidadeCubas: parseNumber(productValues.quantidadeCubas),
            tipoCuba: String(productValues.tipoCuba || 'sem'),
            comprimento: parseNumber(productValues.comprimento),
            largura: parseNumber(productValues.largura),
            alturaFrontal: parseNumber(productValues.alturaFrontal),
            espessuraChapa: parseNumber(productValues.espessuraChapa),
          };
        } else if (orcamentoTipo === 'bancadaSemCuba') {
          args = {
            comprimento: parseNumber(productValues.comprimento),
            largura: parseNumber(productValues.largura),
            alturaFrontal: parseNumber(productValues.alturaFrontal),
            espessuraChapa: parseNumber(productValues.espessuraChapa),
            quantidadePes: parseNumber(productValues.quantidadePes) as 4 | 5 | 6 | 7,
            tipoTuboPes: String(productValues.tipoTuboPes || 'tuboRedondo'),
            alturaPes: parseNumber(productValues.alturaPes),
            temContraventamento: Boolean(productValues.temContraventamento),
            tipoPrateleiraInferior: String(productValues.tipoPrateleiraInferior || 'nenhuma'),
            usarMaoFrancesa: Boolean(productValues.usarMaoFrancesa),
            quantidadeCubas: 0,
            tipoCuba: 'sem',
          };
        } else {
          args = {
            comprimento: parseNumber(productValues.comprimento),
            largura: parseNumber(productValues.largura),
            alturaFrontal: parseNumber(productValues.alturaFrontal),
            espessuraChapa: parseNumber(productValues.espessuraChapa),
            quantidadeCubas: parseNumber(productValues.quantidadeCubas),
            tipoCuba: String(productValues.tipoCuba || 'sem'),
            quantidadePes: parseNumber(productValues.quantidadePes) as 4 | 5 | 6 | 7,
            tipoTuboPes: String(productValues.tipoTuboPes || 'tuboRedondo'),
            alturaPes: parseNumber(productValues.alturaPes),
            temContraventamento: Boolean(productValues.temContraventamento),
            tipoPrateleiraInferior: String(productValues.tipoPrateleiraInferior || 'nenhuma'),
            usarMaoFrancesa: Boolean(productValues.usarMaoFrancesa),
          };
        }
        setResult(toResultMap(calcularBancadas(args, params)));
        return;
      }
      case 'lavatorios':
        setResult(toResultMap(
          calcularLavatorios(
            {
              tipo: String(productValues.tipo || 'lavatorioPadrao') as any,
              modeloPadrao: String(productValues.modeloPadrao || '750') as any,
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              profundidade: parseNumber(productValues.profundidade),
              alturaFrontal: parseNumber(productValues.alturaFrontal),
              bicaAlta: Boolean(productValues.bicaAlta),
              bicaBaixa: Boolean(productValues.bicaBaixa),
              pedal: Boolean(productValues.pedal),
              mangueiras: Boolean(productValues.mangueiras),
              joelho: Boolean(productValues.joelho),
              valvula: Boolean(productValues.valvula),
            },
            params
          )
        ));
        return;
      case 'prateleiras':
        setResult(toResultMap(
          calcularPrateleiras(
            {
              tipo: String(productValues.tipo || 'lisa') as any,
              comprimento: parseNumber(productValues.comprimento),
              profundidade: parseNumber(productValues.profundidade),
              bordaDobrada: Boolean(productValues.bordaDobrada),
              espessuraChapa: parseNumber(productValues.espessuraChapa),
              usarMaoFrancesa: Boolean(productValues.usarMaoFrancesa),
            },
            params
          )
        ));
        return;
      case 'mesas':
        setResult(toResultMap(
          calcularMesas(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              espessuraTampo: parseNumber(productValues.espessuraTampo),
              bordaTampo: parseNumber(productValues.bordaTampo),
              quantidadePes: parseNumber(productValues.quantidadePes) as 4 | 5 | 6 | 7,
              tipoTuboPes: String(productValues.tipoTuboPes || 'tuboRedondo') as any,
              alturaPes: parseNumber(productValues.alturaPes),
              tipoPrateleiraInferior: String(productValues.tipoPrateleiraInferior || 'nenhuma') as any,
              temContraventamento: Boolean(productValues.temContraventamento),
            },
            params
          )
        ));
        return;
      case 'estanteCantoneira':
        setResult(toResultMap(
          calcularEstanteCantoneira(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              altura: parseNumber(productValues.altura),
              quantidadePlanos: parseNumber(productValues.quantidadePlanos),
              tipoPrateleira: String(productValues.tipoPrateleira || 'lisa') as any,
              quantidadePes: parseNumber(productValues.quantidadePes),
              espessuraChapa: parseNumber(productValues.espessuraChapa),
              incluirRodizios: Boolean(productValues.incluirRodizios),
            },
            params
          )
        ));
        return;
      case 'estanteTubo':
        setResult(toResultMap(
          calcularEstanteTubo(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              altura: parseNumber(productValues.altura),
              quantidadePlanos: parseNumber(productValues.quantidadePlanos),
              quantidadePes: parseNumber(productValues.quantidadePes),
              tipoPrateleira: String(productValues.tipoPrateleira || 'lisa') as any,
              valorMetroTubo: parseNumber(productValues.valorMetroTubo),
            },
            params
          )
        ));
        return;
      case 'coifas':
        setResult(toResultMap(
          calcularCoifas(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              altura: parseNumber(productValues.altura),
              tipoCoifa: String(productValues.tipoCoifa || '3-aguas') as any,
              incluirDuto: Boolean(productValues.incluirDuto),
              incluirCurva: Boolean(productValues.incluirCurva),
              incluirChapeu: Boolean(productValues.incluirChapeu),
              incluirInstalacao: Boolean(productValues.incluirInstalacao),
            },
            params
          )
        ));
        return;
      case 'chapaPlana':
        setResult(toResultMap(
          calcularChapaPlana(
            {
              comprimento: parseNumber(productValues.comprimento),
              largura: parseNumber(productValues.largura),
              espessura: parseNumber(productValues.espessura),
              precoKg: parseNumber(productValues.precoKg),
            },
            params
          )
        ));
        return;
      case 'materialRedondo':
        setResult(toResultMap(
          calcularMaterialRedondo(
            {
              diametro: parseNumber(productValues.diametro),
              altura: parseNumber(productValues.altura),
              espessura: parseNumber(productValues.espessura),
              percentualRepuxo: parseNumber(productValues.percentualRepuxo),
            },
            params
          )
        ));
        return;
      case 'cantoneira':
        setResult(toResultMap(
          calcularCantoneira(
            {
              comprimento: parseNumber(productValues.comprimento),
              ladoA: parseNumber(productValues.ladoA),
              ladoB: parseNumber(productValues.ladoB),
              espessura: parseNumber(productValues.espessura),
            },
            params
          )
        ));
        return;
      case 'portasBatentes':
        setResult(toResultMap(
          calcularPortasBatentes(
            {
              porta: {
                altura: parseNumber(productValues['porta.altura']),
                largura: parseNumber(productValues['porta.largura']),
                espessuraFrente: parseNumber(productValues['porta.espessuraFrente']),
                espessuraVerso: parseNumber(productValues['porta.espessuraVerso']),
                preenchimentoMDF: Boolean(productValues['porta.preenchimentoMDF']),
              },
              batente: {
                altura: parseNumber(productValues['batente.altura']),
                largura: parseNumber(productValues['batente.largura']),
                perfil: parseNumber(productValues['batente.perfil']),
                espessura: parseNumber(productValues['batente.espessura']),
              },
            },
            params
          )
        ));
        return;
      default:
        setResult(null);
    }
  };

  const resultEntries = useMemo(() => {
    if (!result) return [] as Array<{ key: string; label: string; value: number }>;
    const priority = ['custoChapa', 'custoEstrutura', 'custoCubas', 'custoAcessorios', 'custoMaterial', 'custoProducao', 'precoFinal'];
    return Object.entries(result)
      .filter(([, value]) => typeof value === 'number')
      .map(([key, value]) => ({ key, label: RESULT_LABELS[key] ?? key, value }))
      .sort((a, b) => {
        const aIndex = priority.indexOf(a.key);
        const bIndex = priority.indexOf(b.key);
        const aOrder = aIndex === -1 ? priority.length : aIndex;
        const bOrder = bIndex === -1 ? priority.length : bIndex;
        return aOrder - bOrder;
      });
  }, [result]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Precificação</h1>
        <p className="text-sm text-muted-foreground">
          Selecione o produto, preencha os parâmetros e obtenha o orçamento automaticamente.
        </p>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-sm font-semibold">1) Parâmetros globais</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {GLOBAL_FIELDS.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
              <input
                type="number"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={globalValues[field.name] ?? ''}
                onChange={(event) => handleGlobalChange(field.name, event.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h2 className="text-sm font-semibold">2) Tipo de produto</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={produtoTipo}
            onChange={(event) => setProdutoTipo(event.target.value as ProdutoTipo)}
          >
            {PRODUCT_CONFIGS.map((config) => (
              <option key={config.type} value={config.type}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
        {productConfig && (
          <p className="mt-2 text-xs text-muted-foreground">{productConfig.description}</p>
        )}
      </div>

      {productConfig && (
        <div className="rounded-md border p-4">
          <h2 className="text-sm font-semibold">3) Medidas e opções</h2>
          {/* Campo de seleção para tipo de orçamento (apenas para bancadas/cubas) */}
          {produtoTipo === 'bancadas' && (
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground">O que deseja orçar?</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm mt-1"
                value={orcamentoTipo}
                onChange={e => setOrcamentoTipo(e.target.value as any)}
              >
                <option value="somenteCuba">Somente a cuba</option>
                <option value="bancadaSemCuba">Bancada sem cuba</option>
                <option value="bancadaComCuba">Bancada com cuba</option>
              </select>
            </div>
          )}
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {productConfig.fields.filter(isFieldVisible).map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                {field.type === 'boolean' ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(productValues[field.name])}
                      onChange={(event) => handleProductChange(field, event.target.checked)}
                    />
                    <span>Sim</span>
                  </label>
                ) : field.type === 'select' ? (
                  <select
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={String(productValues[field.name] ?? '')}
                    onChange={(event) => handleProductChange(field, event.target.value)}
                  >
                    {field.options?.map((option) => (
                      <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={String(productValues[field.name] ?? '')}
                    onChange={(event) => handleProductChange(field, event.target.value)}
                  />
                )}
                {field.unit && (
                  <p className="text-[11px] text-muted-foreground">Unidade: {field.unit}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={handleCalculate}
            >
              Calcular orçamento
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-md border p-4">
          <h2 className="text-sm font-semibold">4) Resultado</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {resultEntries.map((item) => (
              <div key={item.key} className="rounded-md border bg-muted/40 p-3">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
