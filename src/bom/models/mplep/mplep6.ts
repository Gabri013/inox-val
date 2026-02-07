/**
 * Modelo MPLEP6
 * Encosto com Prateleira (6 pés)
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

const FOLGA_PE = 72;

// Itens fixos
const FECHAMENTO_W = 30.4;
const FECHAMENTO_H = 148.37;

const REFORCO_PADRAO_W = 133.58;
const REFORCO_PADRAO_L_FOLGA = 54.7;

const REFORCO_TRASEIRO_ESPELHO_W_FOLGA = 22;
const REFORCO_TRASEIRO_ESPELHO_H = 104;

const REFORCO_FRONTAL_FOLGA_C = 130;
const REFORCO_FRONTAL_H = 92.98;

const REFORCO_PRATELEIRA_W = 112.98;
const REFORCO_PRATELEIRA_FOLGA_C = 120.1;

const PRATELEIRA_OFFSET_C = 1.82;
const PRATELEIRA_OFFSET_L = -2.88;

const CASQUILHO_DIM = 61;
const CASQUILHO_ESP = 2.0;

// Desenvolvimento real do tampo
const OFFSET_INTERNO_C = 1.8;
const REDUCAO_L_INTERNA = 31;
const ENCOSTO_83 = 83;
const ENCOSTO_32_5 = 32.5;
const ENCOSTO_12_8 = 12.8;

export function gerarBOM_MPLEP6(config: MesaConfig): BOMResult {
  const { c, l, h, material = 'INOX_304' } = config;
  const espessura_chapa = config.espessura_chapa || 0.8;

  const bom: BOMItem[] = [];
  const { avisos } = validarConfig(config);

  const somaDobras = ABA + DOBRA + RAIO;
  const blankC = r1((c - OFFSET_INTERNO_C) + 2 * somaDobras);
  const blankL = r1(
    somaDobras + (l - REDUCAO_L_INTERNA) + ENCOSTO_83 + ENCOSTO_32_5 + ENCOSTO_12_8
  );

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

  // Niveladores (6)
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

  // Fechamentos
  addChapaItem({
    desc: 'FECHAMENTO DIR ESP TAMPO',
    qtd: 1,
    w: FECHAMENTO_W,
    h: FECHAMENTO_H,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'GUILHOTINA',
    codigo: 'PPB-04',
    unidade: 'pç',
  });
  addChapaItem({
    desc: 'FECHAMENTO ESQ ESP TAMPO',
    qtd: 1,
    w: FECHAMENTO_W,
    h: FECHAMENTO_H,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'LASER',
    codigo: 'PPB-04B',
    unidade: 'pç',
  });

  // Reforço padrão (6 pés -> 5)
  addChapaItem({
    desc: 'REFORÇO PADRÃO MESA LISA',
    qtd: 5,
    w: REFORCO_PADRAO_W,
    h: r2(l - REFORCO_PADRAO_L_FOLGA),
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'GUILHOTINA',
    codigo: 'PPB-27',
    unidade: 'pç',
  });

  // Reforço traseiro espelho
  addChapaItem({
    desc: 'REFORÇO TRASEIRO ESPELHO',
    qtd: 1,
    w: r1(c - REFORCO_TRASEIRO_ESPELHO_W_FOLGA),
    h: REFORCO_TRASEIRO_ESPELHO_H,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'GUILHOTINA',
    codigo: 'MPLE-PC02',
    unidade: 'pç',
  });

  // Reforço frontal (6 pés -> 2)
  addChapaItem({
    desc: 'REFORÇO FRONTAL (BANDEIRA)',
    qtd: 2,
    w: r1(c - REFORCO_FRONTAL_FOLGA_C),
    h: REFORCO_FRONTAL_H,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'GUILHOTINA',
    codigo: 'MPLE-PC03',
    unidade: 'pç',
  });

  // Reforço prateleira
  addChapaItem({
    desc: 'REFORÇO PRATELEIRA LISA',
    qtd: 1,
    w: REFORCO_PRATELEIRA_W,
    h: r2(c - REFORCO_PRATELEIRA_FOLGA_C),
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'GUILHOTINA',
    codigo: 'LISA-ME-1500X700-PC02',
    unidade: 'pç',
  });

  // Tampo MPLE-PC01
  addChapaItem({
    desc: 'TAMPO LISO ENCOSTO',
    qtd: 1,
    w: blankL,
    h: blankC,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'LASER',
    codigo: 'MPLE-PC01',
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

  // Prateleira inferior
  addChapaItem({
    desc: 'PRATELEIRA INFERIOR LISA',
    qtd: 1,
    w: r2(c + PRATELEIRA_OFFSET_C),
    h: r2(l + PRATELEIRA_OFFSET_L),
    espessura: espessura_chapa,
    material: MAT_CHAPA_08,
    processo: 'LASER',
    codigo: 'LISA-ME-1500X700-PC01',
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

  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaChapas = bom.reduce((acc, item) => {
    if (!item.w || !item.h || item.w <= 0 || item.h <= 0) return acc;
    return acc + (item.w * item.h * item.qtd) / 1_000_000;
  }, 0);
  const custoMaoObra = areaChapas * CUSTOS_MAO_OBRA.BANCADA_SIMPLES + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: 'MPLEP6',
    descricao: 'Encosto com Prateleira (6 pés)',
    dimensoes: { comprimento: l, largura: c, altura: h },
    bom,
    totais: {
      pesoTotal: r2(pesoTotal),
      custoMaterial: r2(custoMaterial),
      custoMaoObra: r2(custoMaoObra),
      custoTotal: r2(custoTotal),
      areaChapas: r2(areaChapas),
      numComponentes: bom.length,
    },
    avisos: avisos.length > 0 ? avisos : undefined,
  };
}
