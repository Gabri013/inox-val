/**
 * ============================================================================
 * SERVIÇO DE ESTOQUE POR MATERIAL
 * ============================================================================
 * 
 * Gerencia estoque baseado em MATERIAIS da BOM (chapas, tubos, componentes),
 * não em produtos genéricos.
 * 
 * FLUXO:
 * 1. BOM gera lista de materiais necessários
 * 2. Sistema verifica saldo disponível
 * 3. Se faltar → gera solicitação de compra
 * 4. Ao criar OP → reserva materiais
 * 5. Ao iniciar produção → consome materiais
 * ============================================================================
 */

import { newId } from '@/shared/types/ids';
import { toISOString } from '@/shared/lib/format';
import { 
  MATERIAIS_AUTORIZADOS, 
  buscarMaterial,
} from '@/bom/materials.registry';
import type {
  MovimentoEstoqueMaterial,
  SaldoEstoqueMaterial,
  CreateMovimentoMaterialInput,
  TipoMovimento,
} from './estoque.types';

/**
 * Estado em memória (simula banco de dados)
 * Em produção, isso seria IndexedDB ou API backend
 */
let movimentos: MovimentoEstoqueMaterial[] = [];
let saldos: Map<string, SaldoEstoqueMaterial> = new Map();

/**
 * Inicializar estoque com materiais autorizados
 */
function inicializarEstoque() {
  if (saldos.size > 0) return; // Já inicializado
  
  for (const material of MATERIAIS_AUTORIZADOS) {
    saldos.set(material.codigo, {
      materialId: material.codigo,
      materialNome: material.nome,
      materialCodigo: material.codigo,
      tipoMaterial: material.tipo,
      saldo: 0,
      saldoDisponivel: 0,
      saldoReservado: 0,
      estoqueMinimo: definirEstoqueMinimo(material.tipo),
      unidade: material.unidade,
      custoUnitario: material.custoUnitario,
      valorEstoque: 0,
    });
  }
  
  // Adicionar estoque inicial de exemplo (simular compras anteriores)
  criarEstoqueInicial();
}

/**
 * Define estoque mínimo baseado no tipo de material
 */
function definirEstoqueMinimo(tipo: string): number {
  switch (tipo) {
    case 'CHAPA': return 100; // kg
    case 'TUBO': return 50; // m
    case 'COMPONENTE': return 20; // un
    case 'FIXACAO': return 100; // un
    case 'CONSUMIVEL': return 5; // tubo
    default: return 10;
  }
}

/**
 * Criar estoque inicial de exemplo
 */
function criarEstoqueInicial() {
  // Chapas Inox 304
  registrarMovimento({
    materialId: 'INOX_304_1.2mm',
    tipo: 'ENTRADA',
    quantidade: 500, // kg
    unidade: 'kg',
    origem: 'Estoque inicial',
    usuario: 'Sistema',
  });
  
  registrarMovimento({
    materialId: 'INOX_304_1.0mm',
    tipo: 'ENTRADA',
    quantidade: 300, // kg
    unidade: 'kg',
    origem: 'Estoque inicial',
    usuario: 'Sistema',
  });
  
  // Tubos
  registrarMovimento({
    materialId: 'TUBO_38x1.2mm',
    tipo: 'ENTRADA',
    quantidade: 120, // m
    unidade: 'm',
    origem: 'Estoque inicial',
    usuario: 'Sistema',
  });
  
  registrarMovimento({
    materialId: 'TUBO_25x1.2mm',
    tipo: 'ENTRADA',
    quantidade: 80, // m
    unidade: 'm',
    origem: 'Estoque inicial',
    usuario: 'Sistema',
  });
  
  // Componentes
  registrarMovimento({
    materialId: 'PE_REGULAVEL',
    tipo: 'ENTRADA',
    quantidade: 100, // un
    unidade: 'un',
    origem: 'Estoque inicial',
    usuario: 'Sistema',
  });
  
  registrarMovimento({
    materialId: 'CUBA_MEDIA',
    tipo: 'ENTRADA',
    quantidade: 10, // un
    unidade: 'un',
    origem: 'Estoque inicial',
    usuario: 'Sistema',
  });
}

/**
 * Registrar movimento de estoque
 */
export function registrarMovimento(input: CreateMovimentoMaterialInput): MovimentoEstoqueMaterial {
  inicializarEstoque();
  
  const { materialId, tipo, quantidade, unidade, origem, observacoes, usuario } = input;
  
  // Buscar saldo atual
  const saldo = saldos.get(materialId);
  if (!saldo) {
    throw new Error(`Material não encontrado: ${materialId}`);
  }
  
  const saldoAnterior = saldo.saldo;
  let saldoNovo = saldoAnterior;
  
  // Calcular novo saldo
  switch (tipo) {
    case 'ENTRADA':
      saldoNovo = saldoAnterior + quantidade;
      break;
    case 'SAIDA':
      if (saldo.saldoDisponivel < quantidade) {
        throw new Error(`Saldo insuficiente para ${materialId}. Disponível: ${saldo.saldoDisponivel}, Solicitado: ${quantidade}`);
      }
      saldoNovo = saldoAnterior - quantidade;
      break;
    case 'RESERVA':
      if (saldo.saldoDisponivel < quantidade) {
        throw new Error(`Saldo insuficiente para reservar ${materialId}`);
      }
      // Reserva não altera saldo total, apenas disponível
      saldo.saldoReservado += quantidade;
      saldo.saldoDisponivel -= quantidade;
      break;
    case 'ESTORNO':
      saldoNovo = saldoAnterior + quantidade;
      break;
    case 'AJUSTE':
      saldoNovo = quantidade; // Ajuste absoluto
      break;
  }
  
  // Criar movimento
  const movimento: MovimentoEstoqueMaterial = {
    id: newId(),
    materialId,
    materialNome: saldo.materialNome,
    tipo,
    quantidade,
    unidade,
    saldoAnterior,
    saldoNovo,
    origem,
    observacoes,
    usuario,
    data: toISOString(new Date()),
    criadoEm: toISOString(new Date()),
  };
  
  movimentos.push(movimento);
  
  // Atualizar saldo
  if (tipo !== 'RESERVA') {
    saldo.saldo = saldoNovo;
    saldo.saldoDisponivel = saldoNovo - saldo.saldoReservado;
  }
  saldo.valorEstoque = saldo.saldo * saldo.custoUnitario;
  saldo.ultimaMovimentacao = movimento.data;
  
  return movimento;
}

/**
 * Consultar saldo de um material
 */
export function consultarSaldo(materialId: string): SaldoEstoqueMaterial | undefined {
  inicializarEstoque();
  return saldos.get(materialId);
}

/**
 * Listar todos os saldos
 */
export function listarSaldos(): SaldoEstoqueMaterial[] {
  inicializarEstoque();
  return Array.from(saldos.values());
}

/**
 * Verificar se há estoque suficiente para uma lista de materiais
 * Retorna lista de materiais faltantes
 */
export interface MaterialNecessario {
  materialId: string;
  materialNome: string;
  quantidadeNecessaria: number;
  unidade: string;
  saldoDisponivel: number;
  falta: number;
}

export function verificarDisponibilidade(
  materiais: { materialId: string; quantidade: number }[]
): MaterialNecessario[] {
  inicializarEstoque();
  
  const faltantes: MaterialNecessario[] = [];
  
  for (const item of materiais) {
    const saldo = saldos.get(item.materialId);
    
    if (!saldo) {
      // Material não existe no estoque (erro grave)
      const material = buscarMaterial(item.materialId);
      faltantes.push({
        materialId: item.materialId,
        materialNome: material?.nome || item.materialId,
        quantidadeNecessaria: item.quantidade,
        unidade: material?.unidade || 'un',
        saldoDisponivel: 0,
        falta: item.quantidade,
      });
      continue;
    }
    
    if (saldo.saldoDisponivel < item.quantidade) {
      faltantes.push({
        materialId: item.materialId,
        materialNome: saldo.materialNome,
        quantidadeNecessaria: item.quantidade,
        unidade: saldo.unidade,
        saldoDisponivel: saldo.saldoDisponivel,
        falta: item.quantidade - saldo.saldoDisponivel,
      });
    }
  }
  
  return faltantes;
}

/**
 * Reservar materiais para uma OP
 */
export function reservarMateriais(
  ordemId: string,
  materiais: { materialId: string; quantidade: number }[],
  usuario: string
): void {
  inicializarEstoque();
  
  // Verificar disponibilidade primeiro
  const faltantes = verificarDisponibilidade(materiais);
  if (faltantes.length > 0) {
    throw new Error(`Materiais insuficientes: ${faltantes.map(f => f.materialId).join(', ')}`);
  }
  
  // Reservar cada material
  for (const item of materiais) {
    const saldo = saldos.get(item.materialId);
    if (!saldo) continue;
    
    registrarMovimento({
      materialId: item.materialId,
      tipo: 'RESERVA',
      quantidade: item.quantidade,
      unidade: saldo.unidade,
      origem: `OP ${ordemId}`,
      usuario,
    });
  }
}

/**
 * Consumir materiais reservados (ao iniciar produção)
 */
export function consumirMateriais(
  ordemId: string,
  materiais: { materialId: string; quantidade: number }[],
  usuario: string
): void {
  inicializarEstoque();
  
  for (const item of materiais) {
    const saldo = saldos.get(item.materialId);
    if (!saldo) continue;
    
    // Liberar reserva
    saldo.saldoReservado -= item.quantidade;
    saldo.saldoDisponivel += item.quantidade;
    
    // Consumir (saída)
    registrarMovimento({
      materialId: item.materialId,
      tipo: 'SAIDA',
      quantidade: item.quantidade,
      unidade: saldo.unidade,
      origem: `Produção OP ${ordemId}`,
      usuario,
    });
  }
}

/**
 * Listar movimentos com filtros
 */
export function listarMovimentos(filtros?: {
  materialId?: string;
  tipo?: TipoMovimento;
  dataInicio?: string;
  dataFim?: string;
}): MovimentoEstoqueMaterial[] {
  inicializarEstoque();
  
  let resultado = [...movimentos];
  
  if (filtros?.materialId) {
    resultado = resultado.filter(m => m.materialId === filtros.materialId);
  }
  
  if (filtros?.tipo) {
    resultado = resultado.filter(m => m.tipo === filtros.tipo);
  }
  
  if (filtros?.dataInicio) {
    resultado = resultado.filter(m => m.data >= filtros.dataInicio!);
  }
  
  if (filtros?.dataFim) {
    resultado = resultado.filter(m => m.data <= filtros.dataFim!);
  }
  
  return resultado.sort((a, b) => b.data.localeCompare(a.data));
}

/**
 * Listar materiais em estoque mínimo ou abaixo
 */
export function listarMateriaisCriticos(): SaldoEstoqueMaterial[] {
  inicializarEstoque();
  
  return Array.from(saldos.values()).filter(
    s => s.saldoDisponivel <= s.estoqueMinimo
  );
}

export const estoqueMateriaisService = {
  getEstoque: () => ({} as Record<string, number>),
  setEstoque: (_estoque: Record<string, number>) => {},
  registrarMovimento,
  consultarSaldo,
  listarSaldos,
  verificarDisponibilidade,
  reservarMateriais,
  consumirMateriais,
  listarMovimentos,
  listarMateriaisCriticos,
};
