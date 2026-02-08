/**
 * Utilitários compartilhados para cálculo de BOM
 */

import { MATERIAIS, TUBOS, PRECOS_COMPONENTES, MesaConfig } from '../types';

/**
 * Arredonda para 2 casas decimais
 */
export function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Arredonda para 1 casa decimal
 */
export function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Calcula peso de chapa em kg
 */
export function calcularPesoChapa(
  comprimento: number, // mm
  largura: number, // mm
  espessura: number, // mm
  material: 'INOX_304' | 'INOX_430' = 'INOX_304'
): number {
  const volume = (comprimento / 10) * (largura / 10) * (espessura / 10); // dm³
  const densidade = MATERIAIS[material].densidade;
  return r2(volume * densidade);
}

/**
 * Calcula custo de chapa em R$
 */
export function calcularCustoChapa(
  peso: number, // kg
  material: 'INOX_304' | 'INOX_430' = 'INOX_304'
): number {
  const custoKg = MATERIAIS[material].custoKg;
  return r2(peso * custoKg);
}

/**
 * Calcula peso de tubo em kg
 */
export function calcularPesoTubo(
  comprimento: number, // mm
  tipo: keyof typeof TUBOS = 'TUBO_38x1_2'
): number {
  const tubo = TUBOS[tipo];
  const pesoKg = (comprimento / 1000) * tubo.pesoMetro;
  return r2(pesoKg);
}

/**
 * Calcula custo de tubo em R$
 */
export function calcularCustoTubo(
  comprimento: number, // mm
  tipo: keyof typeof TUBOS = 'TUBO_38x1_2'
): number {
  const tubo = TUBOS[tipo];
  const custoR$ = (comprimento / 1000) * tubo.custoMetro;
  return r2(custoR$);
}

/**
 * Determina número de pés baseado no comprimento
 */
export function determinarNumeroPes(comprimento: number, forcado?: number): number {
  if (forcado) return forcado;
  return comprimento > 1900 ? 6 : 4;
}

/**
 * Calcula custo de cuba baseado no tamanho
 */
export function calcularCustoCuba(largura: number, comprimento: number): number {
  if (largura <= 350 && comprimento <= 400) {
    return PRECOS_COMPONENTES.CUBA_PEQUENA;
  } else if (largura >= 500 || comprimento >= 600) {
    return PRECOS_COMPONENTES.CUBA_GRANDE;
  }
  return PRECOS_COMPONENTES.CUBA_MEDIA;
}

/**
 * Constantes comuns
 */
export const ESPELHO_ALTURA = 150; // mm
export const ESPELHO_LATERAL_LARGURA = 150; // mm
export const PRATELEIRA_OFFSET_L = -100; // mm (recuo)
export const PRATELEIRA_OFFSET_C = -100; // mm (recuo)
export const BORDA_AGUA_ALTURA_PADRAO = 50; // mm
export const BANDEIRA_ALTURA = 150; // mm (reforço contraventado)

/**
 * Parâmetros de dobra (ajuste conforme desenho técnico)
 * Soma (ABA + DOBRA + RAIO) = 70.65mm para fechar o blank base 1500x700
 */
export const ABA = 50; // mm
export const DOBRA = 10; // mm
export const RAIO = 10.65; // mm

/**
 * Materiais padrão
 * REGRA: Pés/travessas = Ø38mm, Contraventamento = Ø25mm (1")
 */
export const MAT_CHAPA_08 = 'INOX_304_0.8mm';
export const MAT_CHAPA_10 = 'INOX_304_1.0mm';
export const MAT_CHAPA_12 = 'INOX_304_1.2mm';
export const MAT_CHAPA_20 = 'INOX_304_2.0mm';
export const MAT_TUBO_25 = 'TUBO_25x1.2mm'; // Contraventamento (1")
export const MAT_TUBO_38 = 'TUBO_38x1.2mm'; // Pés e travessas

/**
 * Valida configuração da mesa
 */
export function validarConfig(config: MesaConfig): { valido: boolean; avisos: string[] } {
  const avisos: string[] = [];

  if (config.l < 500 || config.l > 5000) {
    avisos.push('Comprimento deve estar entre 500mm e 5000mm');
  }

  if (config.c < 400 || config.c > 1500) {
    avisos.push('Largura deve estar entre 400mm e 1500mm');
  }

  if (config.h < 700 || config.h > 1200) {
    avisos.push('Altura deve estar entre 700mm e 1200mm');
  }

  if (config.l > 3000) {
    avisos.push('Comprimento acima de 3000mm pode requerer emenda ou chapa especial');
  }

  if (config.temCuba) {
    if (!config.larguraCuba || !config.comprimentoCuba) {
      avisos.push('Dimensões da cuba são obrigatórias quando há cuba');
    }

    if (config.larguraCuba && config.larguraCuba > config.c - 200) {
      avisos.push('Largura da cuba deve ser menor que largura da bancada - 200mm');
    }

    if (config.comprimentoCuba && config.comprimentoCuba > config.l - 200) {
      avisos.push('Comprimento da cuba deve ser menor que comprimento da bancada - 200mm');
    }
  }

  return {
    valido: avisos.length === 0,
    avisos,
  };
}
