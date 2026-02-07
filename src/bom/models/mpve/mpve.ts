/**
 * Modelo MPVE
 * Encosto + Borda d'água + Cuba Dir + Contraventada (4 pés)
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
  MAT_TUBO_25, // ✅ Contraventamento = Ø25mm (1")
  MAT_TUBO_38, // ✅ Pés e travessas = Ø38mm
} from '../utils';

const MAT_CHAPA_08_COD = '#304-0,8-1000075';
const MAT_CHAPA_20_COD = '#304-2,0-1000108';

// Estrutura
const FOLGA_PE = 72;
const FOLGA_LATERAL = 135;
const FOLGA_TRASEIRO = 130;

// Casquilho
const CASQUILHO_DIM = 61;
const CASQUILHO_ESP = 2.0;

// Reforços
const REFORCO_PADRAO_W = 120.38;
const REFORCO_PADRAO_L_FOLGA = 56;
const REFORCO_PADRAO_QTD = 2;
const REFORCO_PADRAO_COD = 'PPB-28';

const REFORCO_TRASEIRO_W_FOLGA = 22;
const REFORCO_TRASEIRO_H = 104.28;
const REFORCO_TRASEIRO_COD = 'MPVE-PC02';

// Fechamentos
const FECHAMENTO_W = 30.4;
const FECHAMENTO_H = 148.37;

// Tampo com cuba (desenvolvimento)
const C_MIOLO_FOLGA = 80;
const C_LADO_SUM = 9.1 + 23.2 + 38.1 + 39.5;
const L_MIOLO_FOLGA = 70;
const L_LADO_AGUA = 90 + 32.5 + 12.8;
const L_LADO_DOBRAS = 39.5 + 38.1 + 23.2 + 9.1;

export function gerarBOM_MPVE(config: MesaConfig): BOMResult {
  const { l, c, h, material = 'INOX_304' } = config;
  const espessura_chapa = config.espessura_chapa || 0.8;

  const bom: BOMItem[] = [];
  const { avisos } = validarConfig(config);

  const blankC = r2((c - C_MIOLO_FOLGA) + 2 * C_LADO_SUM);
  const blankL = r2((l - L_MIOLO_FOLGA) + L_LADO_AGUA + L_LADO_DOBRAS);

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

  // Cuba
  const larguraCuba = config.larguraCuba || 400;
  const comprimentoCuba = config.comprimentoCuba || 500;
  const profundidadeCuba = config.profundidadeCuba || 250;
  const custoCuba = calcularCustoCuba(larguraCuba, comprimentoCuba);
  bom.push({
    desc: 'CUBA -500X400X250 CH',
    qtd: 1,
    w: 0,
    h: 0,
    espessura: 0,
    material: 'CUBA',
    processo: 'ALMOXARIFADO',
    codigo: 'CUBA',
    pesoTotal: 0,
    custo: custoCuba,
    custoTotal: custoCuba,
    unidade: 'un',
  });

  // Pé nivelador
  bom.push({
    desc: 'PÉ NIVELADOR 1 1/2" - NYLON',
    qtd: 4,
    w: 0,
    h: 0,
    espessura: 0,
    material: '1006036',
    processo: 'ALMOXARIFADO',
    codigo: '1006036',
    pesoTotal: 0,
    custo: PRECOS_COMPONENTES.PE_REGULAVEL,
    custoTotal: PRECOS_COMPONENTES.PE_REGULAVEL * 4,
    unidade: 'un',
  });

  // Contraventamentos (tubo)
  const contravL = r1(l - FOLGA_LATERAL);
  const contravC = r1(c - FOLGA_TRASEIRO);
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
    codigo: 'MPVE-PT01',
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
    codigo: 'MPVE-PT02',
    peso: pesoContravC,
    pesoTotal: pesoContravC * 2,
    custo: calcularCustoTubo(contravC, 'TUBO_25x1_2'),
    custoTotal: calcularCustoTubo(contravC, 'TUBO_25x1_2') * 2,
    unidade: 'pç',
  });

  // Pés (tubo)
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

  // Reforço padrão
  addChapaItem({
    desc: 'REFORÇO PADRÃO MESA LISA',
    qtd: REFORCO_PADRAO_QTD,
    w: REFORCO_PADRAO_W,
    h: r2(l - REFORCO_PADRAO_L_FOLGA),
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'GUILHOTINA',
    codigo: REFORCO_PADRAO_COD,
    unidade: 'pç',
  });

  // Reforço traseiro
  addChapaItem({
    desc: 'REFORÇO TRASEIRO',
    qtd: 1,
    w: r1(c - REFORCO_TRASEIRO_W_FOLGA),
    h: REFORCO_TRASEIRO_H,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'GUILHOTINA',
    codigo: REFORCO_TRASEIRO_COD,
    unidade: 'pç',
  });

  // Fechamentos
  addChapaItem({
    desc: 'FECHAMENTO DIR ESP TAMPO',
    qtd: 1,
    w: FECHAMENTO_W,
    h: FECHAMENTO_H,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
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
    material: MAT_CHAPA_08_COD,
    processo: 'LASER',
    codigo: 'PPB-04B',
    unidade: 'pç',
  });

  // Tampo com cuba (DIR)
  addChapaItem({
    desc: 'TAMPO COM CUBA DIR',
    qtd: 1,
    w: blankL,
    h: blankC,
    espessura: espessura_chapa,
    material: MAT_CHAPA_08_COD,
    processo: 'LASER',
    codigo: 'MPVE-PC01',
    unidade: 'pç',
  });

  // Casquilhos
  addChapaItem({
    desc: 'CASQUILHO',
    qtd: 4,
    w: CASQUILHO_DIM,
    h: CASQUILHO_DIM,
    espessura: CASQUILHO_ESP,
    material: MAT_CHAPA_20_COD,
    processo: 'LASER',
    codigo: 'PPB-01B',
    unidade: 'pç',
  });

  // TOTAIS
  const pesoTotal = bom.reduce((acc, item) => acc + (item.pesoTotal || 0), 0);
  const custoMaterial = bom.reduce((acc, item) => acc + (item.custoTotal || 0), 0);
  const areaM2 = bom.reduce((acc, item) => {
    if (!item.w || !item.h || item.w <= 0 || item.h <= 0) return acc;
    return acc + (item.w * item.h * item.qtd) / 1_000_000;
  }, 0);
  const custoMaoObra = areaM2 * CUSTOS_MAO_OBRA.BANCADA_BORDA_AGUA + CUSTOS_MAO_OBRA.SETUP;
  const custoTotal = custoMaterial + custoMaoObra;

  return {
    modelo: 'MPVE',
    descricao: 'Encosto + Borda d\'água + Cuba Dir + Contraventada (4 pés)',
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