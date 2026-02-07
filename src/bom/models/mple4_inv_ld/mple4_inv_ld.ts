/**
 * Modelo MPLE4_INV_LD
 * Encosto Espelho Traseiro + Lateral Dir (4 pés)
 */

import { BOMResult, MesaConfig, BOMItem, CUSTOS_MAO_OBRA } from '../../types';
import {
  r1,
  r2,
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

const MAT_CHAPA_08_COD = '#304-0,8-1000075';
const MAT_CHAPA_20_COD = '#304-2,0-1000108';

const CASQUILHO_DIM = 63.4;
const CASQUILHO_ESP = 2.0;

const FOLGA_PE = 70;
const FOLGA_CONTRAV_L = 149;
const FOLGA_CONTRAV_C = 124;

export function gerarBOM_MPLE4_INV_LD(config: MesaConfig): BOMResult {
  const { c, l, h, material = 'INOX_304' } = config;
  const espessura_chapa = config.espessura_chapa || 0.8;

  const bom: BOMItem[] = [];
  const { avisos } = validarConfig(config);

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

  // TAMPO COM ESPELHOS
  addChapaItem({
    desc: 'TAMPO COM ESPELHO TRASEIRO E LATERAL DIREITO',
    qtd: 1,
    w: r1(c + 180),
    h: r1(l + 180),
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'LASER',
    codigo: 'MPLE4-INV-LD-PC01',
    unidade: 'pç',
  });

  // REFORÇOS
  addChapaItem({
    desc: 'REFORÇO FRONTAL (BANDEIRA)',
    qtd: 1,
    w: r1(c - 124),
    h: 113,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'GUILHOTINA',
    codigo: 'MPLE4-INV-LD-PC04',
    unidade: 'pç',
  });

  addChapaItem({
    desc: 'REFORÇO TRASEIRO',
    qtd: 1,
    w: r1(c - 5),
    h: 86,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'LASER',
    codigo: 'MPLE4-INV-LD-PC02',
    unidade: 'pç',
  });

  addChapaItem({
    desc: 'REFORÇO LATERAL',
    qtd: 1,
    w: r1(l - 5),
    h: 86,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'LASER',
    codigo: 'MPLE4-INV-LD-PC03',
    unidade: 'pç',
  });

  addChapaItem({
    desc: 'REFORÇO INFERIOR P/ TAMPO',
    qtd: 3,
    w: 120,
    h: r1(l - 43),
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'GUILHOTINA',
    codigo: 'MPLE4-INV-LD-PC05',
    unidade: 'pç',
  });

  // ESPELHOS
  addChapaItem({
    desc: 'ESPELHO LADO DIREITO',
    qtd: 1,
    w: 20,
    h: 148,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'GUILHOTINA',
    codigo: 'MPLE4-INV-LD-PC06',
    unidade: 'pç',
  });

  addChapaItem({
    desc: 'ESPELHO LADO ESQUERDO',
    qtd: 1,
    w: 20,
    h: 148,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'LASER',
    codigo: 'MPLE4-INV-LD-PC07',
    unidade: 'pç',
  });

  // CASQUILHOS
  addChapaItem({
    desc: 'CASQUILHO',
    qtd: 4,
    w: CASQUILHO_DIM,
    h: CASQUILHO_DIM,
    espessura: CASQUILHO_ESP,
    material: MAT_CHAPA_20_COD,
    processo: 'LASER',
    codigo: 'MPLE4-INV-LD-PC08',
    unidade: 'pç',
  });

  // PÉS (TUBO)
  const comprimentoPe = r1(h - FOLGA_PE);
  const pesoPe = calcularPesoTubo(comprimentoPe);
  bom.push({
    desc: 'PÉ (TUBO)',
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

  // CONTRAVENTAMENTOS
  const contravL = r1(l - FOLGA_CONTRAV_L);
  const contravC = r1(c - FOLGA_CONTRAV_C);
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
    codigo: 'MPLE4-INV-LD-PT01',
    peso: pesoContravL,
    pesoTotal: pesoContravL * 2,
    custo: calcularCustoTubo(contravL, 'TUBO_25x1_2'),
    custoTotal: calcularCustoTubo(contravL, 'TUBO_25x1_2') * 2,
    unidade: 'pç',
  });
  bom.push({
    desc: 'CONTRAV. TRASEIRO',
    qtd: 1,
    w: contravC,
    h: 0,
    espessura: 0,
    material: MAT_TUBO_25,
    processo: 'CORTE',
    codigo: 'MPLE4-INV-LD-PT02',
    peso: pesoContravC,
    pesoTotal: pesoContravC,
    custo: calcularCustoTubo(contravC, 'TUBO_25x1_2'),
    custoTotal: calcularCustoTubo(contravC, 'TUBO_25x1_2'),
    unidade: 'pç',
  });

  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaM2 = bom.reduce((acc, item) => {
    if (!item.w || !item.h || item.w <= 0 || item.h <= 0) return acc;
    return acc + (item.w * item.h * item.qtd) / 1_000_000;
  }, 0);
  const custoMaoObra = areaM2 * CUSTOS_MAO_OBRA.BANCADA_SIMPLES + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: 'MPLE4_INV_LD',
    descricao: 'Encosto Espelho Traseiro + Lateral Dir (4 pés)',
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
