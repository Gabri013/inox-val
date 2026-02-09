export interface GlobalParams {
  precoKgInox: number;
  fatorTampo: number;
  fatorCuba: number;
  fatorVenda: number;
  percentualDesperdicio: number;
  percentualMaoDeObra: number;
}

export type TipoCuba = 'sem' | 'com' | 'comEspelho';
export type TipoPrateleira = 'lisa' | 'gradeada' | 'perfurada' | 'nenhuma';
export type TipoCoifa = '3-aguas' | '4-aguas';
export type TipoPrateleiraEstante = 'lisa' | 'gradeada' | 'perfurada';
export type TipoTuboPes = 'tuboRedondo' | 'tuboQuadrado' | 'tuboRetangular';

export interface BancadasInput {
  comprimento: number;
  largura: number;
  alturaFrontal: number;
  espessuraChapa: number;
  quantidadeCubas: number;
  tipoCuba: TipoCuba;
  quantidadePes: 4 | 5 | 6 | 7;
  tipoTuboPes: TipoTuboPes;
  alturaPes: number;
  temContraventamento: boolean;
  tipoPrateleiraInferior: TipoPrateleira;
  usarMaoFrancesa: boolean;
}

export interface BancadasResult {
  custoChapa: number;
  custoEstrutura: number;
  custoCubas: number;
  custoAcessorios: number;
  custoMaterial: number;
  custoProducao: number;
  precoFinal: number;
}

export type LavatorioTipo = 'lavatorioPadrao' | 'lavatorioCirurgico';
export type LavatorioModeloPadrao = '750' | '850' | 'FDE';

export interface LavatoriosInput {
  tipo: LavatorioTipo;
  modeloPadrao?: LavatorioModeloPadrao;
  comprimento?: number;
  largura?: number;
  profundidade?: number;
  alturaFrontal?: number;
  bicaAlta?: boolean;
  bicaBaixa?: boolean;
  pedal?: boolean;
  mangueiras?: boolean;
  joelho?: boolean;
  valvula?: boolean;
}

export interface LavatoriosResult {
  custoAcessorios: number;
  custoMaterial: number;
  custoProducao: number;
  precoFinal: number;
}

export interface PrateleirasInput {
  tipo: 'lisa' | 'gradeada';
  comprimento: number;
  profundidade: number;
  bordaDobrada: boolean;
  espessuraChapa: number;
  usarMaoFrancesa: boolean;
}

export interface MesasInput {
  comprimento: number;
  largura: number;
  espessuraTampo: number;
  bordaTampo: number;
  quantidadePes: 4 | 5 | 6 | 7;
  tipoTuboPes: TipoTuboPes;
  alturaPes: number;
  tipoPrateleiraInferior: TipoPrateleira;
  temContraventamento: boolean;
}

export interface EstanteCantoneiraInput {
  comprimento: number;
  largura: number;
  altura: number;
  quantidadePlanos: number;
  tipoPrateleira: TipoPrateleiraEstante;
  quantidadePes: number;
  espessuraChapa: number;
  incluirRodizios: boolean;
}

export interface EstanteTuboInput {
  comprimento: number;
  largura: number;
  altura: number;
  quantidadePlanos: number;
  quantidadePes: number;
  tipoPrateleira: TipoPrateleiraEstante;
  valorMetroTubo: number;
}

export interface CoifaInput {
  comprimento: number;
  largura: number;
  altura: number;
  tipoCoifa: TipoCoifa;
  incluirDuto: boolean;
  incluirCurva: boolean;
  incluirChapeu: boolean;
  incluirInstalacao: boolean;
}

export interface ChapaPlanaInput {
  comprimento: number;
  largura: number;
  espessura: number;
  precoKg: number;
}

export interface MaterialRedondoInput {
  diametro: number;
  altura: number;
  espessura: number;
  percentualRepuxo: number;
}

export interface CantoneiraInput {
  comprimento: number;
  ladoA: number;
  ladoB: number;
  espessura: number;
}

export interface PortaInput {
  altura: number;
  largura: number;
  espessuraFrente: number;
  espessuraVerso: number;
  preenchimentoMDF: boolean;
}

export interface BatenteInput {
  altura: number;
  largura: number;
  perfil: number;
  espessura: number;
}

export interface PortasBatentesInput {
  porta: PortaInput;
  batente: BatenteInput;
}

export interface ResultadoBase {
  custoMaterial: number;
  custoProducao: number;
  precoFinal: number;
}

export type ProdutoTipo =
  | 'bancadas'
  | 'lavatorios'
  | 'prateleiras'
  | 'mesas'
  | 'estanteCantoneira'
  | 'estanteTubo'
  | 'coifas'
  | 'chapaPlana'
  | 'materialRedondo'
  | 'cantoneira'
  | 'portasBatentes';
