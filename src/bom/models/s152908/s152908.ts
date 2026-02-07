/**
 * Modelo S152908
 * Encosto + 1 Cuba Central + Contraventada (4 pés)
 * REGRA: Pés = Ø38mm, Contraventamento = Ø25mm (1")
 */

import { BOMResult, MesaConfig, BOMItem, CUSTOS_MAO_OBRA, PRECOS_COMPONENTES } from '../../types';
import {
  r1,
  r2,
  calcularPesoChapa,
  calcularCustoChapa,
  calcularPesoTubo,
  calcularCustoTubo,
  calcularCustoCuba,
  validarConfig,
  MAT_CHAPA_08,
  MAT_CHAPA_20,
  MAT_TUBO_25,
  MAT_TUBO_38,
} from '../utils';

const MAT_CHAPA_08_COD = '#304-0,8-1000075';
const MAT_CHAPA_20_COD = '#304-2,0-1000108';

const COD_CUBA = 'PS-CBF-605033';

// Folgas
const FOLGA_PE = 72;
const FOLGA_LAT = 137;
const FOLGA_TRAS = 132;

const FOLGA_REFORCO_PADRAO = 56;
const FOLGA_REFORCO_TRASEIRO = 23;

// Offset do blank do tampo
const OFF_TAMPO_X = 140.61;
const OFF_TAMPO_Y = 174.86;

export function gerarBOM_S152908(config: MesaConfig): BOMResult {
  const { l, c, h, material = 'INOX_304' } = config;
  const espessura_chapa = config.espessura_chapa || 0.8;

  const bom: BOMItem[] = [];
  const { avisos } = validarConfig(config);

  const tampoX = r2(c + OFF_TAMPO_X);
  const tampoY = r2(l + OFF_TAMPO_Y);

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

  // 1) Cuba
  const custoCuba = calcularCustoCuba(500, 600);
  bom.push({
    desc: 'CUBA FABRICADA 600 x 500 x 330 mm',
    qtd: 1,
    w: 0,
    h: 0,
    espessura: 0,
    material: 'INOX 304',
    processo: 'LASER',
    codigo: COD_CUBA,
    pesoTotal: 0,
    custo: custoCuba,
    custoTotal: custoCuba,
    unidade: 'un',
  });

  // 2) Fechamentos espelho
  addChapaItem({
    desc: 'FECHA. DIR. ESPELHO TAMPOS',
    qtd: 1,
    w: 30.4,
    h: 149.37,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'LASER',
    codigo: 'PPB-04',
    unidade: 'pç',
  });
  addChapaItem({
    desc: 'FECHA. ESQ. ESPELHO TAMPOS',
    qtd: 1,
    w: 30.4,
    h: 149.37,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'LASER',
    codigo: 'PPB-04B',
    unidade: 'pç',
  });

  // 3) Reforço traseiro
  addChapaItem({
    desc: 'REFORÇO TRASEIRO',
    qtd: 1,
    w: r1(c - FOLGA_REFORCO_TRASEIRO),
    h: 102.78,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'GUILHOTINA',
    codigo: 'MV-EC1C-CV-PC02',
    unidade: 'pç',
  });

  // 4) Reforços (PPB-06)
  addChapaItem({
    desc: 'REFORÇO',
    qtd: 2,
    w: 113.36,
    h: r2(l - FOLGA_REFORCO_PADRAO),
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'GUILHOTINA',
    codigo: 'PPB-06',
    unidade: 'pç',
  });

  // 5) Tampo com cuba
  addChapaItem({
    desc: 'TAMPO COM CUBA',
    qtd: 1,
    w: tampoY,
    h: tampoX,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'LASER',
    codigo: 'MV-EC1C-CV-PC01',
    unidade: 'pç',
  });

  // 6) Contraventamentos
  const contravL = r1(l - FOLGA_LAT);
  const contravC = r1(c - FOLGA_TRAS);
  const pesoContravL = calcularPesoTubo(contravL, 'TUBO_25x1_2');
  const pesoContravC = calcularPesoTubo(contravC, 'TUBO_25x1_2');

  bom.push({
    desc: 'CONTRAVENTAMENTO LATERAL',
    qtd: 2,
    w: contravL,
    h: 0,
    espessura: 0,
    material: MAT_TUBO_25,
    processo: 'CORTE',
    codigo: 'PPB-13',
    peso: pesoContravL,
    pesoTotal: pesoContravL * 2,
    custo: calcularCustoTubo(contravL, 'TUBO_25x1_2'),
    custoTotal: calcularCustoTubo(contravL, 'TUBO_25x1_2') * 2,
    unidade: 'pç',
  });
  bom.push({
    desc: 'CONTRAVENTAMENTO TRASEIRO',
    qtd: 2,
    w: contravC,
    h: 0,
    espessura: 0,
    material: MAT_TUBO_25,
    processo: 'CORTE',
    codigo: 'MV-EC1C-CV-PT01',
    peso: pesoContravC,
    pesoTotal: pesoContravC * 2,
    custo: calcularCustoTubo(contravC, 'TUBO_25x1_2'),
    custoTotal: calcularCustoTubo(contravC, 'TUBO_25x1_2') * 2,
    unidade: 'pç',
  });

  // 7) Pés (tubo Ø38,1) – qty 4
  const comprimentoPe = r1(h - FOLGA_PE);
  const pesoPe = calcularPesoTubo(comprimentoPe);
  bom.push({
    desc: 'TUBO ø38,1mm PÉ',
    qtd: 4,
    w: comprimentoPe,
    h: 0,
    espessura: 0,
    material: MAT_TUBO_38,
    processo: 'CORTE',
    codigo: 'PPB-02',
    peso: pesoPe,
    pesoTotal: pesoPe * 4,
    custo: calcularCustoTubo(comprimentoPe),
    custoTotal: calcularCustoTubo(comprimentoPe) * 4,
    unidade: 'pç',
  });

  // 8) Casquilhos – 61x61 – qty 4
  addChapaItem({
    desc: 'CASQUILHO',
    qtd: 4,
    w: 61,
    h: 61,
    espessura: 2.0,
    material: MAT_CHAPA_20_COD,
    processo: 'LASER',
    codigo: 'PPB-01B',
    unidade: 'pç',
  });

  // 9) Pé nivelador – qty 4
  bom.push({
    desc: 'PÉ NIVELADOR 1 1/2" - NYLON',
    qtd: 4,
    w: 0,
    h: 0,
    espessura: 0,
    material: 'ABS',
    processo: 'ALMOXARIFADO',
    codigo: '1006036',
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.PE_REGULAVEL,
    custoTotal: PRECOS_COMPONENTES.PE_REGULAVEL * 4,
    unidade: 'un',
  });

  // CÁLCULO DE TOTAIS
  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaM2 = bom.reduce((acc, item) => {
    if (!item.w || !item.h || item.w <= 0 || item.h <= 0) return acc;
    return acc + (item.w * item.h * item.qtd) / 1_000_000;
  }, 0);
  const custoMaoObra = areaM2 * CUSTOS_MAO_OBRA.BANCADA_CUBA + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: 'S152908',
    descricao: 'Encosto + 1 Cuba Central + Contraventada (4 pés)',
    dimensoes: {
      comprimento: l,
      largura: c,
      altura: h,
    },
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
    recomendacoes: l > 2000 ? ['Considere 6 pés para comprimentos acima de 2000mm'] : undefined,
  };
}