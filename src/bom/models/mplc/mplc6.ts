/**
 * Modelo MPLC6
 * Centro Contraventada (6 pés)
 * REGRA: Pés = Ø38mm, Contraventamento = Ø25mm (1")
 */

import { BOMResult, MesaConfig, BOMItem, CUSTOS_MAO_OBRA, PRECOS_COMPONENTES } from '../../types';
import {
  r1,
  r2,
  ABA,
  DOBRA,
  RAIO,
  calcularPesoChapa,
  calcularCustoChapa,
  calcularPesoTubo,
  calcularCustoTubo,
  validarConfig,
  MAT_CHAPA_08,
  MAT_CHAPA_20,
  MAT_TUBO_25,
  MAT_TUBO_38,
} from '../utils';

const OFFSET_DESENHO = 1.8;
const FOLGA_CONTRAV = 130;
const FOLGA_PE = 72;

const H_REFORCO_FRONTAL = 93;
const CASQUILHO_DIM = 61;
const CASQUILHO_ESP = 2.0;

export function gerarBOM_MPLC6(config: MesaConfig): BOMResult {
  const { l, c, h, material = 'INOX_304' } = config;
  const espessura_chapa = config.espessura_chapa || 0.8;

  const bom: BOMItem[] = [];
  const { avisos } = validarConfig(config);

  const somaDobras = ABA + DOBRA + RAIO;
  const blankC = r1((c - OFFSET_DESENHO) + 2 * somaDobras);
  const blankL = r1((l - OFFSET_DESENHO) + 2 * somaDobras);

  const addChapaItem = (
    item: Omit<BOMItem, 'peso' | 'pesoTotal' | 'custo' | 'custoTotal'>
  ) => {
    if (!item.w || !item.h || !item.espessura) {
      bom.push({ ...item });
      return;
    }
    const peso = calcularPesoChapa(item.h, item.w, item.espessura, material);
    const custo = calcularCustoChapa(peso, material);
    bom.push({
      ...item,
      peso,
      pesoTotal: peso * item.qtd,
      custo,
      custoTotal: custo * item.qtd,
    });
  };

  // 1. TAMPO (blank real)
  addChapaItem({
    desc: 'TAMPO LISO CENTRO',
    qtd: 1,
    w: blankL,
    h: blankC,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'LASER',
    codigo: 'MPLC-PC01',
    unidade: 'pç',
  });

  // 2. REFORÇO FRONTAL (2x)
  addChapaItem({
    desc: 'REFORÇO FRONTAL',
    qtd: 2,
    w: r1(c - FOLGA_CONTRAV),
    h: H_REFORCO_FRONTAL,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'GUILHOTINA',
    codigo: 'MPLC-PC03',
    unidade: 'pç',
  });

  // 3. CASQUILHOS (6)
  addChapaItem({
    desc: 'CASQUILHO',
    qtd: 6,
    w: CASQUILHO_DIM,
    h: CASQUILHO_DIM,
    espessura: CASQUILHO_ESP,
    material: MAT_CHAPA_20,
    processo: 'LASER',
    codigo: 'PPB-01B',
    unidade: 'pç',
  });

  // 4. PÉ NIVELADOR (6)
  bom.push({
    desc: 'PÉ NIVELADOR 1 1/2" - NYLON',
    qtd: 6,
    w: 0,
    h: 0,
    espessura: 0,
    material: '1006036',
    processo: 'ALMOXARIFADO',
    codigo: '1006036',
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.PE_REGULAVEL,
    custoTotal: PRECOS_COMPONENTES.PE_REGULAVEL * 6,
    unidade: 'un',
  });

  // 5. PÉS (TUBO)
  const comprimentoPe = r1(h - FOLGA_PE);
  const pesoPe = calcularPesoTubo(comprimentoPe);
  bom.push({
    desc: 'PÉ (TUBO)',
    qtd: 6,
    w: comprimentoPe,
    h: 0,
    espessura: 0,
    material: MAT_TUBO_38,
    processo: 'CORTE',
    codigo: 'PPB-02',
    peso: pesoPe,
    pesoTotal: pesoPe * 6,
    custo: calcularCustoTubo(comprimentoPe),
    custoTotal: calcularCustoTubo(comprimentoPe) * 6,
    unidade: 'pç',
  });

  // 6. CONTRAVENTAMENTOS (2 laterais + 2 traseiros)
  const contravL = r1(l - FOLGA_CONTRAV);
  const contravC = r1(c - FOLGA_CONTRAV);
  const pesoContravL = calcularPesoTubo(contravL, 'TUBO_25x1_2');
  const pesoContravC = calcularPesoTubo(contravC, 'TUBO_25x1_2');

  bom.push({
    desc: 'CONTRAV. LATERAL',
    qtd: 2,
    w: contravL,
    h: 0,
    espessura: 0,
    material: MAT_TUBO_25,
    processo: 'CORTE',
    codigo: 'MPLC-PT01',
    peso: pesoContravL,
    pesoTotal: pesoContravL * 2,
    custo: calcularCustoTubo(contravL, 'TUBO_25x1_2'),
    custoTotal: calcularCustoTubo(contravL, 'TUBO_25x1_2') * 2,
    unidade: 'pç',
  });
  bom.push({
    desc: 'CONTRAV. TRASEIRO',
    qtd: 2,
    w: contravC,
    h: 0,
    espessura: 0,
    material: MAT_TUBO_25,
    processo: 'CORTE',
    codigo: 'MPLC-PT02',
    peso: pesoContravC,
    pesoTotal: pesoContravC * 2,
    custo: calcularCustoTubo(contravC, 'TUBO_25x1_2'),
    custoTotal: calcularCustoTubo(contravC, 'TUBO_25x1_2') * 2,
    unidade: 'pç',
  });

  // TOTAIS
  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaM2 = bom.reduce((acc, item) => {
    if (!item.w || !item.h || item.w <= 0 || item.h <= 0) return acc;
    return acc + (item.w * item.h * item.qtd) / 1_000_000;
  }, 0);
  const custoMaoObra = areaM2 * CUSTOS_MAO_OBRA.BANCADA_SIMPLES + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: 'MPLC6',
    descricao: 'Centro Contraventada (6 pés)',
    dimensoes: { comprimento: l, largura: c, altura: h },
    bom,
    totais: {
      pesoTotal: r2(pesoTotal),
      custoMaterial: r2(custoMaterial),
      custoMaoObra: r2(custoMaoObra),
      custoTotal: r2(custoTotal),
      areaChapas: r2(areaM2),
      numComponentes: bom.length,
    },
    avisos: avisos.length > 0 ? avisos : undefined,
  };
}