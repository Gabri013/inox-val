import type {
  GlobalParams,
  BancadasInput,
  BancadasResult,
  LavatoriosInput,
  LavatoriosResult,
  PrateleirasInput,
  MesasInput,
  EstanteCantoneiraInput,
  EstanteTuboInput,
  CoifaInput,
  ChapaPlanaInput,
  MaterialRedondoInput,
  CantoneiraInput,
  PortasBatentesInput,
  ResultadoBase,
  TipoPrateleira,
  TipoPrateleiraEstante,
  TipoTuboPes,
  LavatorioModeloPadrao,
} from './types';

const DENSIDADE_INOX = 8000; // kg/m³

const toArea = (comprimento: number, largura: number) => (comprimento * largura) / 1_000_000;

const pesoChapa = (areaM2: number, espessuraMm: number) =>
  areaM2 * (espessuraMm / 1000) * DENSIDADE_INOX;

const custoMaterial = (pesoKg: number, precoKg: number) => pesoKg * precoKg;

const aplicarDesperdicio = (valor: number, percentual: number) => valor * (1 + percentual);

const aplicarMaoDeObra = (valor: number, percentual: number) => valor * (1 + percentual);

const aplicarFatorVenda = (valor: number, fator: number) => valor * fator;

const resumoBase = (valorMaterial: number, params: GlobalParams): ResultadoBase => {
  const comDesperdicio = aplicarDesperdicio(valorMaterial, params.percentualDesperdicio);
  const custoProducao = aplicarMaoDeObra(comDesperdicio, params.percentualMaoDeObra);
  const precoFinal = aplicarFatorVenda(custoProducao, params.fatorVenda);
  return {
    custoMaterial: comDesperdicio,
    custoProducao,
    precoFinal,
  };
};

const prateleiraFactor = (tipo: TipoPrateleira) => {
  switch (tipo) {
    case 'gradeada':
      return 0.75;
    case 'perfurada':
      return 0.85;
    case 'nenhuma':
      return 0;
    default:
      return 1;
  }
};

const prateleiraEstanteFactor = (tipo: TipoPrateleiraEstante) => {
  switch (tipo) {
    case 'gradeada':
      return 0.8;
    case 'perfurada':
      return 0.9;
    default:
      return 1;
  }
};

const tuboKgPorMetro = (tipo: TipoTuboPes) => {
  switch (tipo) {
    case 'tuboQuadrado':
      return 2.6;
    case 'tuboRetangular':
      return 3;
    default:
      return 2.2;
  }
};

const maoFrancesaKg = (comprimento: number) => Math.max(1, Math.ceil(comprimento / 600)) * 0.8;

const modeloPadraoDimensoes: Record<LavatorioModeloPadrao, { comprimento: number; largura: number; profundidade: number; alturaFrontal: number }> = {
  '750': { comprimento: 750, largura: 500, profundidade: 400, alturaFrontal: 300 },
  '850': { comprimento: 850, largura: 550, profundidade: 450, alturaFrontal: 350 },
  FDE: { comprimento: 1000, largura: 600, profundidade: 450, alturaFrontal: 400 },
};

const acessorioPreco = {
  bicaAlta: 120,
  bicaBaixa: 90,
  pedal: 180,
  mangueiras: 60,
  joelho: 50,
  valvula: 80,
};

export const calcularBancadas = (input: BancadasInput, params: GlobalParams): BancadasResult => {
  const areaTampo = toArea(input.comprimento, input.largura);
  const areaFrontal = toArea(input.comprimento, input.alturaFrontal);
  const areaPrateleira = areaTampo * prateleiraFactor(input.tipoPrateleiraInferior);
  const areaContraventamento = input.temContraventamento ? areaTampo * 0.05 : 0;
  const areaChapa = areaTampo + areaFrontal + areaPrateleira + areaContraventamento;

  // Cuba: área 600x400, multiplicador 1 (igual planilha)
  const cubaAreaBase = toArea(600, 400);
  const areaCubas = cubaAreaBase * input.quantidadeCubas;

  const pesoChapaTotal = pesoChapa(areaChapa, input.espessuraChapa);
  const pesoCubasTotal = pesoChapa(areaCubas, input.espessuraChapa);

  const tuboComprimento = input.quantidadePes * (input.alturaPes / 1000) + (input.comprimento + input.largura) * 2 / 1000;
  const pesoEstrutura = tuboComprimento * tuboKgPorMetro(input.tipoTuboPes);

  const pesoMaoFrancesa = input.usarMaoFrancesa ? maoFrancesaKg(input.comprimento) : 0;

  // Aplica fatorTampo e fatorCuba separadamente
  const custoChapa = custoMaterial(pesoChapaTotal, params.precoKgInox) * params.fatorTampo;
  const custoCubas = custoMaterial(pesoCubasTotal, params.precoKgInox) * params.fatorCuba;
  const custoEstrutura = custoMaterial(pesoEstrutura, params.precoKgInox);
  const custoAcessorios = custoMaterial(pesoMaoFrancesa, params.precoKgInox);

  const custoBase = custoChapa + custoCubas + custoEstrutura + custoAcessorios;
  const baseResumo = resumoBase(custoBase, params);

  return {
    custoChapa,
    custoEstrutura,
    custoCubas,
    custoAcessorios,
    ...baseResumo,
  };
};

export const calcularLavatorios = (input: LavatoriosInput, params: GlobalParams): LavatoriosResult => {
  const dimensoes = input.tipo === 'lavatorioPadrao'
    ? modeloPadraoDimensoes[input.modeloPadrao ?? '750']
    : {
        comprimento: input.comprimento ?? 1000,
        largura: input.largura ?? 500,
        profundidade: input.profundidade ?? 450,
        alturaFrontal: input.alturaFrontal ?? 350,
      };

  const areaTampo = toArea(dimensoes.comprimento, dimensoes.largura);
  const areaLaterais = toArea(dimensoes.comprimento, dimensoes.profundidade) * 2 + toArea(dimensoes.largura, dimensoes.profundidade) * 2;
  const areaFrontal = toArea(dimensoes.comprimento, dimensoes.alturaFrontal);
  const areaTotal = areaTampo + areaLaterais + areaFrontal;

  const pesoTotal = pesoChapa(areaTotal, 1.2);
  const custoMaterialBase = custoMaterial(pesoTotal, params.precoKgInox);

  const custoAcessorios =
    (input.bicaAlta ? acessorioPreco.bicaAlta : 0) +
    (input.bicaBaixa ? acessorioPreco.bicaBaixa : 0) +
    (input.pedal ? acessorioPreco.pedal : 0) +
    (input.mangueiras ? acessorioPreco.mangueiras : 0) +
    (input.joelho ? acessorioPreco.joelho : 0) +
    (input.valvula ? acessorioPreco.valvula : 0);

  const baseResumo = resumoBase(custoMaterialBase + custoAcessorios, params);

  return {
    custoAcessorios,
    ...baseResumo,
  };
};

export const calcularPrateleiras = (input: PrateleirasInput, params: GlobalParams): ResultadoBase => {
  const areaBase = toArea(input.comprimento, input.profundidade);
  const areaBorda = input.bordaDobrada ? areaBase * 0.1 : 0;
  const areaTotal = (areaBase + areaBorda) * (input.tipo === 'gradeada' ? 0.7 : 1);
  const pesoTotal = pesoChapa(areaTotal, input.espessuraChapa);
  const custoBase = custoMaterial(pesoTotal, params.precoKgInox);
  const custoMaoFrancesa = input.usarMaoFrancesa ? custoMaterial(maoFrancesaKg(input.comprimento), params.precoKgInox) : 0;
  return resumoBase(custoBase + custoMaoFrancesa, params);
};

export const calcularMesas = (input: MesasInput, params: GlobalParams): ResultadoBase => {
  const areaTampo = toArea(input.comprimento, input.largura);
  const areaBorda = toArea(input.comprimento * 2 + input.largura * 2, input.bordaTampo);
  const areaPrateleira = areaTampo * prateleiraFactor(input.tipoPrateleiraInferior);
  const areaTotal = areaTampo + areaBorda + areaPrateleira;
  const pesoTotal = pesoChapa(areaTotal, input.espessuraTampo);

  const tuboComprimento = input.quantidadePes * (input.alturaPes / 1000) + (input.comprimento + input.largura) * 2 / 1000;
  const pesoEstrutura = tuboComprimento * tuboKgPorMetro(input.tipoTuboPes) * (input.temContraventamento ? 1.1 : 1);

  const custoBase = custoMaterial(pesoTotal + pesoEstrutura, params.precoKgInox);
  return resumoBase(custoBase, params);
};

export const calcularEstanteCantoneira = (input: EstanteCantoneiraInput, params: GlobalParams): ResultadoBase => {
  const areaPlano = toArea(input.comprimento, input.largura) * prateleiraEstanteFactor(input.tipoPrateleira);
  const areaTotal = areaPlano * input.quantidadePlanos;
  const pesoPlanos = pesoChapa(areaTotal, input.espessuraChapa);
  const pesoEstrutura = (input.quantidadePes * input.altura / 1000) * 2.4;
  const pesoRodizios = input.incluirRodizios ? 2.5 : 0;
  const custoBase = custoMaterial(pesoPlanos + pesoEstrutura + pesoRodizios, params.precoKgInox);
  return resumoBase(custoBase, params);
};

export const calcularEstanteTubo = (input: EstanteTuboInput, params: GlobalParams): ResultadoBase => {
  const areaPlano = toArea(input.comprimento, input.largura) * prateleiraEstanteFactor(input.tipoPrateleira);
  const areaTotal = areaPlano * input.quantidadePlanos;
  const pesoPlanos = pesoChapa(areaTotal, 1.2);
  const comprimentoTubo = input.quantidadePes * input.altura / 1000 + (input.comprimento + input.largura) * 2 / 1000;
  const custoEstrutura = comprimentoTubo * input.valorMetroTubo;
  const custoBase = custoMaterial(pesoPlanos, params.precoKgInox) + custoEstrutura;
  return resumoBase(custoBase, params);
};

export const calcularCoifas = (input: CoifaInput, params: GlobalParams): ResultadoBase => {
  const areaBase = toArea(input.comprimento, input.largura);
  const areaLaterais = toArea(input.comprimento, input.altura) + toArea(input.largura, input.altura) * 2;
  const areaTotal = (areaBase + areaLaterais) * (input.tipoCoifa === '4-aguas' ? 1.15 : 1.05);
  const pesoTotal = pesoChapa(areaTotal, 1.2);

  const custoAcessorios =
    (input.incluirDuto ? 250 : 0) +
    (input.incluirCurva ? 180 : 0) +
    (input.incluirChapeu ? 220 : 0) +
    (input.incluirInstalacao ? 500 : 0);

  const custoBase = custoMaterial(pesoTotal, params.precoKgInox) + custoAcessorios;
  return resumoBase(custoBase, params);
};

export const calcularChapaPlana = (input: ChapaPlanaInput, params: GlobalParams): ResultadoBase => {
  const area = toArea(input.comprimento, input.largura);
  const peso = pesoChapa(area, input.espessura);
  const custoBase = custoMaterial(peso, input.precoKg);
  return resumoBase(custoBase, params);
};

export const calcularMaterialRedondo = (input: MaterialRedondoInput, params: GlobalParams): ResultadoBase => {
  const raio = input.diametro / 2;
  const areaLateral = (2 * Math.PI * raio * input.altura) / 1_000_000;
  const areaBase = (Math.PI * raio * raio) / 1_000_000;
  const areaTotal = areaLateral + areaBase;
  const peso = pesoChapa(areaTotal, input.espessura) * (1 + input.percentualRepuxo / 100);
  const custoBase = custoMaterial(peso, params.precoKgInox);
  return resumoBase(custoBase, params);
};

export const calcularCantoneira = (input: CantoneiraInput, params: GlobalParams): ResultadoBase => {
  const area = toArea(input.comprimento, input.ladoA + input.ladoB);
  const peso = pesoChapa(area, input.espessura);
  const custoBase = custoMaterial(peso, params.precoKgInox);
  return resumoBase(custoBase, params);
};

export const calcularPortasBatentes = (input: PortasBatentesInput, params: GlobalParams): ResultadoBase => {
  const areaPorta = toArea(input.porta.altura, input.porta.largura);
  const pesoPortaFrente = pesoChapa(areaPorta, input.porta.espessuraFrente);
  const pesoPortaVerso = pesoChapa(areaPorta, input.porta.espessuraVerso);
  const custoMDF = input.porta.preenchimentoMDF ? 120 : 0;

  const perimetroBatente = (input.batente.altura + input.batente.largura) * 2;
  const areaBatente = toArea(perimetroBatente, input.batente.perfil);
  const pesoBatente = pesoChapa(areaBatente, input.batente.espessura);

  const custoBase = custoMaterial(pesoPortaFrente + pesoPortaVerso + pesoBatente, params.precoKgInox) + custoMDF;
  return resumoBase(custoBase, params);
};
