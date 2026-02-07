/**
 * Modelo MPLCP6
 * Centro com Prateleira (6 pés)
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
  MAT_TUBO_38,
} from '../utils';

const OFFSET_DESENHO = 1.8;
const FOLGA_PE = 72;

const PPB30_W = 135.58;
const PPB30_H_FOLGA = 50;

const FOLGA_REFORCO_FRONTAL = 130;
const H_REFORCO_FRONTAL = 93;

const FOLGA_REFORCO_PRAT = 120;
const H_REFORCO_PRAT = 113.1;

const PRATELEIRA_OFFSET = 1.82;

const CASQUILHO_DIM = 61;
const CASQUILHO_ESP = 2.0;

export function gerarBOM_MPLCP6(config: MesaConfig): BOMResult {
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

  // Tampo
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

  // Reforço padrão (6 pés => 5)
  addChapaItem({
    desc: 'REF. PADRÃO MESA LISA CENTRO',
    qtd: 5,
    w: PPB30_W,
    h: r1(l - PPB30_H_FOLGA),
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'GUILHOTINA',
    codigo: 'PPB-30',
    unidade: 'pç',
  });

  // Reforço frontal
  addChapaItem({
    desc: 'REFORÇO FRONTAL',
    qtd: 2,
    w: r1(c - FOLGA_REFORCO_FRONTAL),
    h: H_REFORCO_FRONTAL,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'GUILHOTINA',
    codigo: 'MPLC-PC03',
    unidade: 'pç',
  });

  addChapaItem({
    desc: 'REFORÇO DA PRATELEIRA',
    qtd: 1,
    w: r1(c - FOLGA_REFORCO_PRAT),
    h: H_REFORCO_PRAT,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'GUILHOTINA',
    codigo: 'LISA-MC-1500X700-PC02',
    unidade: 'pç',
  });

  addChapaItem({
    desc: 'PRATELEIRA PADRÃO',
    qtd: 1,
    w: r2(c + PRATELEIRA_OFFSET),
    h: r2(l + PRATELEIRA_OFFSET),
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'LASER',
    codigo: 'LISA-MC-1500X700-PC01',
    unidade: 'pç',
  });

  // Casquilhos (6)
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

  // PÉ NIVELADOR (6)
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
    modelo: 'MPLCP6',
    descricao: 'Centro com Prateleira (6 pés)',
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
