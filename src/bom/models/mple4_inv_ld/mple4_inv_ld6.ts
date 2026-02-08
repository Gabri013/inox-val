/**
 * Modelo MPLE4_INV_LD6
 * Encosto Espelho Traseiro + Lateral Dir (6 pés)
 */

import { BOMResult, MesaConfig, BOMItem, CUSTOS_MAO_OBRA, PRECOS_COMPONENTES } from '../../types';
import {
  r1,
  r2,
  calcularPesoChapa,
  calcularCustoChapa,
  calcularPesoTubo,
  calcularCustoTubo,
  validarConfig,
  MAT_TUBO_25,
  MAT_TUBO_38,
} from '../utils';

const MAT_CHAPA_08_COD = '#304-0,8-1000075';
const MAT_CHAPA_20_COD = '#304-2,0-1000108';

const FOLGA_PE = 70;
const FOLGA_CONTRAV_L = 149;
const FOLGA_CONTRAV_C = 124;

const CASQUILHO_DIM = 63.4;
const CASQUILHO_ESP = 2.0;

export function gerarBOM_MPLE4_INV_LD6(config: MesaConfig): BOMResult {
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

  // TAMPO
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

  // REFORÇO FRONTAL (6 pés -> 2)
  addChapaItem({
    desc: 'REFORÇO FRONTAL (BANDEIRA)',
    qtd: 2,
    w: r1(c - FOLGA_CONTRAV_C),
    h: 113,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'GUILHOTINA',
    codigo: 'MPLE4-INV-LD-PC04',
    unidade: 'pç',
  });

  // REFORÇO TRASEIRO
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

  // REFORÇO LATERAL
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

  // REFORÇO INFERIOR P/ TAMPO (6 pés -> 5)
  addChapaItem({
    desc: 'REFORÇO INFERIOR P/ TAMPO',
    qtd: 5,
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

  // NIVELADORES (6)
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

  // CASQUILHOS (6)
  addChapaItem({
    desc: 'CASQUILHO',
    qtd: 6,
    w: CASQUILHO_DIM,
    h: CASQUILHO_DIM,
    espessura: CASQUILHO_ESP,
    material: MAT_CHAPA_20_COD,
    processo: 'LASER',
    codigo: 'MPLE4-INV-LD-PC08',
    unidade: 'pç',
  });

  // Pés (tubo)
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

  // Contravs: 2 laterais + 2 traseiros
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
    qtd: 2,
    w: contravC,
    h: 0,
    espessura: 0,
    material: MAT_TUBO_25,
    processo: 'CORTE',
    codigo: 'MPLE4-INV-LD-PT02',
    peso: pesoContravC,
    pesoTotal: pesoContravC * 2,
    custo: calcularCustoTubo(contravC, 'TUBO_25x1_2'),
    custoTotal: calcularCustoTubo(contravC, 'TUBO_25x1_2') * 2,
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
    modelo: 'MPLE4_INV_LD6',
    descricao: 'Encosto Espelho Traseiro + Lateral Dir (6 pés)',
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
