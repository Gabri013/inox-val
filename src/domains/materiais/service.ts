/**
 * ============================================================================
 * SERVIÇO DE MATERIAIS
 * ============================================================================
 * Lógica de negócio para gestão de materiais e preços
 */

import * as repo from './repository';
import type {
  ChapaPadrao,
  TuboDefinicao,
  CantoneiraDefinicao,
  AcessorioDefinicao,
  ProcessoDefinicao,
  ConfiguracoesMateriais,
  TipoInox,
} from './types';

// ============================================================================
// CACHE (para performance em produção)
// ============================================================================

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  
  const age = Date.now() - item.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function limparCache(): void {
  cache.clear();
}

// ============================================================================
// CHAPAS
// ============================================================================

export async function obterChapasPadrao(): Promise<ChapaPadrao[]> {
  const cacheKey = 'chapas_padrao';
  const cached = getCached<ChapaPadrao[]>(cacheKey);
  if (cached) return cached;
  
  const chapas = await repo.listarChapasPadrao();
  setCache(cacheKey, chapas);
  return chapas;
}

export async function calcularCustoChapa(params: {
  tipoInox: TipoInox;
  espessuraMm: number;
  areaM2: number;
}): Promise<{
  custoTotal: number;
  custoKg: number;
  kgTotal: number;
  precoKg: number;
}> {
  const { tipoInox, espessuraMm, areaM2 } = params;
  
  const precoChapa = await repo.obterPrecosChapa(tipoInox, espessuraMm);
  if (!precoChapa) {
    throw new Error(
      `Preço não cadastrado para chapa ${tipoInox} ${espessuraMm}mm`
    );
  }
  
  const config = await repo.obterConfiguracoesMateriais();
  
  // Cálculo: área (m²) × espessura (m) × densidade (kg/m³)
  const espessuraM = espessuraMm / 1000;
  const volumeM3 = areaM2 * espessuraM;
  const kgTotal = volumeM3 * config.densidadeInoxKgM3;
  
  const custoKg = kgTotal * precoChapa.precoKg;
  const custoTotal = custoKg;
  
  return {
    custoTotal,
    custoKg,
    kgTotal,
    precoKg: precoChapa.precoKg,
  };
}

// ============================================================================
// TUBOS
// ============================================================================

export async function obterTubos(): Promise<TuboDefinicao[]> {
  const cacheKey = 'tubos';
  const cached = getCached<TuboDefinicao[]>(cacheKey);
  if (cached) return cached;
  
  const tubos = await repo.listarTubos();
  setCache(cacheKey, tubos);
  return tubos;
}

export async function calcularCustoTubo(params: {
  tuboId: string;
  tipoInox: TipoInox;
  metros: number;
}): Promise<{
  custoTotal: number;
  kgTotal: number;
  precoKg: number;
  kgPorMetro: number;
}> {
  const { tuboId, tipoInox, metros } = params;
  
  const tubos = await obterTubos();
  const tubo = tubos.find(t => t.id === tuboId);
  if (!tubo) {
    throw new Error(`Tubo não encontrado: ${tuboId}`);
  }
  
  const precoTubo = await repo.obterPrecoTubo(tuboId, tipoInox);
  if (!precoTubo) {
    throw new Error(
      `Preço não cadastrado para tubo ${tubo.descricao} ${tipoInox}`
    );
  }
  
  const kgTotal = metros * tubo.kgPorMetro;
  const custoTotal = kgTotal * precoTubo.precoKg;
  
  return {
    custoTotal,
    kgTotal,
    precoKg: precoTubo.precoKg,
    kgPorMetro: tubo.kgPorMetro,
  };
}

// ============================================================================
// CANTONEIRAS
// ============================================================================

export async function obterCantoneiras(): Promise<CantoneiraDefinicao[]> {
  const cacheKey = 'cantoneiras';
  const cached = getCached<CantoneiraDefinicao[]>(cacheKey);
  if (cached) return cached;
  
  const cantoneiras = await repo.listarCantoneiras();
  setCache(cacheKey, cantoneiras);
  return cantoneiras;
}

export async function calcularCustoCantoneira(params: {
  cantoneiraId: string;
  tipoInox: TipoInox;
  metros: number;
}): Promise<{
  custoTotal: number;
  kgTotal: number;
  precoKg: number;
  kgPorMetro: number;
}> {
  const { cantoneiraId, tipoInox, metros } = params;
  
  const cantoneiras = await obterCantoneiras();
  const cantoneira = cantoneiras.find(c => c.id === cantoneiraId);
  if (!cantoneira) {
    throw new Error(`Cantoneira não encontrada: ${cantoneiraId}`);
  }
  
  const precoCantoneira = await repo.obterPrecoCantoneira(cantoneiraId, tipoInox);
  if (!precoCantoneira) {
    throw new Error(
      `Preço não cadastrado para cantoneira ${cantoneira.descricao} ${tipoInox}`
    );
  }
  
  const kgTotal = metros * cantoneira.kgPorMetro;
  const custoTotal = kgTotal * precoCantoneira.precoKg;
  
  return {
    custoTotal,
    kgTotal,
    precoKg: precoCantoneira.precoKg,
    kgPorMetro: cantoneira.kgPorMetro,
  };
}

// ============================================================================
// ACESSÓRIOS
// ============================================================================

export async function obterAcessorios(): Promise<AcessorioDefinicao[]> {
  const cacheKey = 'acessorios';
  const cached = getCached<AcessorioDefinicao[]>(cacheKey);
  if (cached) return cached;
  
  const acessorios = await repo.listarAcessorios();
  setCache(cacheKey, acessorios);
  return acessorios;
}

export async function calcularCustoAcessorio(params: {
  sku: string;
  quantidade: number;
}): Promise<{
  custoTotal: number;
  precoUnitario: number;
  acessorio: AcessorioDefinicao;
}> {
  const { sku, quantidade } = params;
  
  const acessorio = await repo.obterAcessorio(sku);
  if (!acessorio) {
    throw new Error(`Acessório não encontrado: ${sku}`);
  }
  
  const custoTotal = quantidade * acessorio.precoUnitario;
  
  return {
    custoTotal,
    precoUnitario: acessorio.precoUnitario,
    acessorio,
  };
}

// ============================================================================
// PROCESSOS
// ============================================================================

export async function obterProcessos(): Promise<ProcessoDefinicao[]> {
  const cacheKey = 'processos';
  const cached = getCached<ProcessoDefinicao[]>(cacheKey);
  if (cached) return cached;
  
  const processos = await repo.listarProcessos();
  setCache(cacheKey, processos);
  return processos;
}

export async function calcularCustoProcesso(params: {
  tipo: string;
  minutos: number;
}): Promise<{
  custoTotal: number;
  custoPorHora: number;
  horas: number;
  processo: ProcessoDefinicao;
}> {
  const { tipo, minutos } = params;
  
  const processo = await repo.obterProcesso(tipo);
  if (!processo) {
    throw new Error(`Processo não encontrado: ${tipo}`);
  }
  
  const horas = minutos / 60;
  const custoTotal = horas * processo.custoPorHora;
  
  return {
    custoTotal,
    custoPorHora: processo.custoPorHora,
    horas,
    processo,
  };
}

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

export async function obterConfiguracoes(): Promise<ConfiguracoesMateriais> {
  const cacheKey = 'configuracoes_materiais';
  const cached = getCached<ConfiguracoesMateriais>(cacheKey);
  if (cached) return cached;
  
  const config = await repo.obterConfiguracoesMateriais();
  setCache(cacheKey, config);
  return config;
}

// ============================================================================
// VALIDAÇÕES
// ============================================================================

export interface ErroValidacao {
  campo: string;
  mensagem: string;
}

export async function validarMateriais(): Promise<ErroValidacao[]> {
  const erros: ErroValidacao[] = [];
  
  try {
    const chapas = await obterChapasPadrao();
    if (chapas.length === 0) {
      erros.push({
        campo: 'chapas',
        mensagem: 'Nenhuma chapa padrão cadastrada',
      });
    }
    
    const tubos = await obterTubos();
    if (tubos.length === 0) {
      erros.push({
        campo: 'tubos',
        mensagem: 'Nenhum tubo cadastrado',
      });
    }
    
    const acessorios = await obterAcessorios();
    if (acessorios.length === 0) {
      erros.push({
        campo: 'acessorios',
        mensagem: 'Nenhum acessório cadastrado',
      });
    }
    
    const processos = await obterProcessos();
    if (processos.length === 0) {
      erros.push({
        campo: 'processos',
        mensagem: 'Nenhum processo cadastrado',
      });
    }
  } catch (error) {
    erros.push({
      campo: 'sistema',
      mensagem: 'Erro ao validar materiais: ' + (error as Error).message,
    });
  }
  
  return erros;
}

// ============================================================================
// RESUMO DE PREÇOS (para exibir na interface)
// ============================================================================

export interface ResumoPrecos {
  chapas: Array<{
    tipoInox: TipoInox;
    espessura: number;
    precoKg: number;
  }>;
  tubos: Array<{
    descricao: string;
    tipoInox: TipoInox;
    precoKg: number;
    kgPorMetro: number;
  }>;
  cantoneiras: Array<{
    descricao: string;
    tipoInox: TipoInox;
    precoKg: number;
    kgPorMetro: number;
  }>;
  acessoriosMaisUsados: Array<{
    nome: string;
    sku: string;
    preco: number;
  }>;
  configuracoes: ConfiguracoesMateriais;
}

export async function obterResumoPrecos(): Promise<ResumoPrecos> {
  const config = await obterConfiguracoes();
  const acessorios = await obterAcessorios();
  
  return {
    chapas: [],
    tubos: [],
    cantoneiras: [],
    acessoriosMaisUsados: acessorios.slice(0, 10).map(a => ({
      nome: a.nome,
      sku: a.sku,
      preco: a.precoUnitario,
    })),
    configuracoes: config,
  };
}
