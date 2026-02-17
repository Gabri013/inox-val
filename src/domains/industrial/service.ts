/**
 * ============================================================================
 * SERVIÇO REGISTRY — Gerenciamento de Chaves com Cache
 * ============================================================================
 * Carrega e mantém em cache todas as chaves ativas do sistema
 */

import * as repo from './repository';
import type {
  MaterialRegistry,
  MaterialKey,
  TubeKey,
  AngleKey,
  AccessorySKU,
  ProcessKey,
  ConfiguracoesSistema,
  ErroChave,
} from './entities';
import {
  validarMaterialKey,
  validarTubeKey,
  validarAngleKey,
  validarAccessorySKU,
  validarProcessKey,
} from './entities';

// ============================================================================
// CACHE DO REGISTRY
// ============================================================================

let registryCache: MaterialRegistry | null = null;
let configCache: ConfiguracoesSistema | null = null;
let lastUpdate: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function limparCache(): void {
  registryCache = null;
  configCache = null;
  lastUpdate = 0;
}

function isCacheValido(): boolean {
  if (!registryCache || !configCache) return false;
  const age = Date.now() - lastUpdate;
  return age < CACHE_TTL;
}

// ============================================================================
// CARREGAR REGISTRY
// ============================================================================

export async function obterRegistry(forcarReload: boolean = false): Promise<MaterialRegistry> {
  if (!forcarReload && isCacheValido() && registryCache) {
    return registryCache;
  }
  
  console.log('🔄 Carregando registry do Firestore...');
  registryCache = await repo.carregarRegistry();
  lastUpdate = Date.now();
  
  console.log('✅ Registry carregado:', {
    materials: Object.keys(registryCache.materials).length,
    tubes: Object.keys(registryCache.tubes).length,
    angles: Object.keys(registryCache.angles).length,
    accessories: Object.keys(registryCache.accessories).length,
    processes: Object.keys(registryCache.processes).length,
  });
  
  return registryCache;
}

export async function obterConfiguracoes(forcarReload: boolean = false): Promise<ConfiguracoesSistema> {
  if (!forcarReload && isCacheValido() && configCache) {
    return configCache;
  }
  
  configCache = await repo.obterConfiguracoes();
  return configCache;
}

// ============================================================================
// BUSCAR ENTIDADES
// ============================================================================

export async function buscarMaterial(materialKey: string): Promise<MaterialKey | null> {
  const registry = await obterRegistry();
  return registry.materials[materialKey] || null;
}

export async function buscarTubo(tubeKey: string): Promise<TubeKey | null> {
  const registry = await obterRegistry();
  return registry.tubes[tubeKey] || null;
}

export async function buscarCantoneira(angleKey: string): Promise<AngleKey | null> {
  const registry = await obterRegistry();
  return registry.angles[angleKey] || null;
}

export async function buscarAcessorio(sku: string): Promise<AccessorySKU | null> {
  const registry = await obterRegistry();
  return registry.accessories[sku] || null;
}

export async function buscarProcesso(processKey: string): Promise<ProcessKey | null> {
  const registry = await obterRegistry();
  return registry.processes[processKey] || null;
}

// ============================================================================
// LISTAR POR TIPO/CATEGORIA
// ============================================================================

export async function listarMateriaisPorTipo(tipo: string): Promise<MaterialKey[]> {
  const registry = await obterRegistry();
  const keys = registry.materialsByTipo[tipo as keyof typeof registry.materialsByTipo] || [];
  return keys.map(key => registry.materials[key]).filter(Boolean);
}

export async function listarTubosPorFormato(formato: string): Promise<TubeKey[]> {
  const registry = await obterRegistry();
  const keys = registry.tubesByFormato[formato as keyof typeof registry.tubesByFormato] || [];
  return keys.map(key => registry.tubes[key]).filter(Boolean);
}

export async function listarAcessoriosPorCategoria(categoria: string): Promise<AccessorySKU[]> {
  const registry = await obterRegistry();
  const keys = registry.accessoriesByCategoria[categoria as keyof typeof registry.accessoriesByCategoria] || [];
  return keys.map(key => registry.accessories[key]).filter(Boolean);
}

export async function listarProcessosPorTipo(tipo: string): Promise<ProcessKey[]> {
  const registry = await obterRegistry();
  const keys = registry.processesByTipo[tipo as keyof typeof registry.processesByTipo] || [];
  return keys.map(key => registry.processes[key]).filter(Boolean);
}

// ============================================================================
// VALIDAÇÃO COMPLETA
// ============================================================================

export async function validarChaves(chaves: {
  materials?: string[];
  tubes?: string[];
  angles?: string[];
  accessories?: string[];
  processes?: string[];
}): Promise<ErroChave[]> {
  const registry = await obterRegistry();
  const config = await obterConfiguracoes();
  const erros: ErroChave[] = [];
  
  // Validar materiais
  for (const key of chaves.materials || []) {
    const erro = validarMaterialKey(key, registry, config.diasValidadePreco);
    if (erro) erros.push(erro);
  }
  
  // Validar tubos
  for (const key of chaves.tubes || []) {
    const erro = validarTubeKey(key, registry);
    if (erro) erros.push(erro);
  }
  
  // Validar cantoneiras
  for (const key of chaves.angles || []) {
    const erro = validarAngleKey(key, registry);
    if (erro) erros.push(erro);
  }
  
  // Validar acessórios
  for (const sku of chaves.accessories || []) {
    const erro = validarAccessorySKU(sku, registry);
    if (erro) erros.push(erro);
  }
  
  // Validar processos
  for (const key of chaves.processes || []) {
    const erro = validarProcessKey(key, registry);
    if (erro) erros.push(erro);
  }
  
  return erros;
}

// ============================================================================
// ATUALIZAR PREÇOS
// ============================================================================

export async function atualizarPrecoMaterial(
  materialKey: string,
  precoPorKg: number,
  fornecedor?: string
): Promise<void> {
  await repo.atualizarPrecoMaterial(materialKey, precoPorKg, fornecedor);
  limparCache();
}

export async function atualizarPrecoTubo(
  tubeKey: string,
  precoPorKg: number,
  fornecedor?: string
): Promise<void> {
  await repo.atualizarPrecoTubo(tubeKey, precoPorKg, fornecedor);
  limparCache();
}

export async function atualizarPrecoAcessorio(
  sku: string,
  precoUnitario: number,
  fornecedor?: string
): Promise<void> {
  await repo.atualizarPrecoAcessorio(sku, precoUnitario, fornecedor);
  limparCache();
}

// ============================================================================
// CRIAR ENTIDADES
// ============================================================================

export async function criarMaterial(material: MaterialKey): Promise<void> {
  await repo.criarMaterial(material);
  limparCache();
}

export async function criarTubo(tube: TubeKey): Promise<void> {
  await repo.criarTubo(tube);
  limparCache();
}

export async function criarCantoneira(angle: AngleKey): Promise<void> {
  await repo.criarCantoneira(angle);
  limparCache();
}

export async function criarAcessorio(accessory: AccessorySKU): Promise<void> {
  await repo.criarAcessorio(accessory);
  limparCache();
}

export async function criarProcesso(process: ProcessKey): Promise<void> {
  await repo.criarProcesso(process);
  limparCache();
}

// ============================================================================
// ESTATÍSTICAS
// ============================================================================

export async function obterEstatisticasRegistry(): Promise<{
  totalMateriais: number;
  totalTubos: number;
  totalCantoneiras: number;
  totalAcessorios: number;
  totalProcessos: number;
  precosDesatualizados: number;
  dataUltimaAtualizacao: string;
}> {
  const registry = await obterRegistry();
  const config = await obterConfiguracoes();
  
  let precosDesatualizados = 0;
  
  for (const material of Object.values(registry.materials)) {
    const diasDesdeAtualizacao = 
      (Date.now() - new Date(material.dataAtualizacao).getTime()) / (1000 * 60 * 60 * 24);
    
    if (diasDesdeAtualizacao > config.diasValidadePreco) {
      precosDesatualizados++;
    }
  }
  
  return {
    totalMateriais: Object.keys(registry.materials).length,
    totalTubos: Object.keys(registry.tubes).length,
    totalCantoneiras: Object.keys(registry.angles).length,
    totalAcessorios: Object.keys(registry.accessories).length,
    totalProcessos: Object.keys(registry.processes).length,
    precosDesatualizados,
    dataUltimaAtualizacao: registry.dataAtualizacao,
  };
}

// ============================================================================
// BUSCA INTELIGENTE
// ============================================================================

export async function buscarMaterialPorCaracteristicas(
  tipoInox: string,
  espessuraMm: number,
  acabamento?: string
): Promise<MaterialKey[]> {
  const registry = await obterRegistry();
  
  return Object.values(registry.materials).filter(material => 
    material.tipoInox === tipoInox &&
    material.espessuraMm === espessuraMm &&
    (!acabamento || material.acabamento === acabamento)
  );
}

export async function buscarTuboPorDimensoes(
  formato: string,
  dimensao: number,
  espessura: number
): Promise<TubeKey[]> {
  const registry = await obterRegistry();
  
  return Object.values(registry.tubes).filter(tube => {
    if (tube.formato !== formato) return false;
    
    if (formato === 'REDONDO') {
      return tube.dimensoes.diametro === dimensao &&
             tube.dimensoes.espessuraParede === espessura;
    } else if (formato === 'QUADRADO') {
      return tube.dimensoes.largura === dimensao &&
             tube.dimensoes.espessuraParede === espessura;
    }
    
    return false;
  });
}

// ============================================================================
// EXPORTAR REGISTRY PARA JSON (debug/backup)
// ============================================================================

export async function exportarRegistryJSON(): Promise<string> {
  const registry = await obterRegistry();
  return JSON.stringify(registry, null, 2);
}
