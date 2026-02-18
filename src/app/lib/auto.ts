/**
 * MÓDULO DE AUTOMAÇÃO - INOX-VAL
 * 
 * Este módulo fornece funções de automação para o workflow industrial:
 * - Auto Accept: Aceitação automática de itens (orçamentos, ordens, materiais)
 * - Auto Decision: Decisão automática baseada em regras
 * - Auto Process: Automação de processos de workflow
 */

import type { 
  Orcamento, 
  OrdemProducao, 
  StatusOrcamento, 
  StatusOrdem,
  PrioridadeOrdem,
  ItemMaterial,
  MovimentacaoEstoque,
  SolicitacaoCompra
} from "../types/workflow";


// ========================================
// CONFIGURAÇÕES DE AUTOMAÇÃO
// ========================================

/** Configurações globais para automação */
export interface AutoConfig {
  /** Valor máximo para auto-aceite de orçamentos */
  orcamentoValorMaxAuto: number;
  /** Valor mínimo para auto-aceite de orçamentos */
  orcamentoValorMinAuto: number;
  /** Prazo em dias para considerar urgente */
  orcamentoPrazoUrgenteDias: number;
  /** Valor mínimo para ordem urgente */
  ordemValorUrgente: number;
  /** Horas para considerar ordem atrasada */
  ordemHorasAtrasado: number;
  /** Habilitar auto-aceite */
  habilitado: boolean;
}

/** Configuração padrão */
export const AUTO_CONFIG_PADRAO: AutoConfig = {
  orcamentoValorMaxAuto: 50000,
  orcamentoValorMinAuto: 100,
  orcamentoPrazoUrgenteDias: 3,
  ordemValorUrgente: 25000,
  ordemHorasAtrasado: 48,
  habilitado: true,
};

/** Resultado de uma operação de automação */
export interface AutoResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

/** Resultado de decisão automática */
export interface DecisionResult {
  decision: 'aprovar' | 'rejeitar' | 'revisar' | 'pendente';
  reason: string;
  confidence: number; // 0-100
  rules: string[];
}

// ========================================
// AUTO ACCEPT - ACEITAÇÃO AUTOMÁTICA
// ========================================

/**
 * Critérios para auto-aceite de orçamento
 */
export interface OrcamentoAcceptCriteria {
  status: StatusOrcamento;
  valorMin?: number;
  valorMax?: number;
  validadeMinimaDias?: number;
}

/**
 * Analisa um orçamento e determina se deve ser aceito automaticamente
 * 
 * @param orcamento - Orçamento a ser analisado
 * @param config - Configuração de automação
 * @returns Resultado da análise com decisão e motivos
 * 
 * @example
 * ```typescript
 * const orcamento = { ... };
 * const result = await analyzeOrcamentoForAutoAccept(orcamento);
 * if (result.shouldAccept) {
 *   await autoAcceptOrcamento(orcamento.id);
 * }
 * ```
 */
export function analyzeOrcamentoForAutoAccept(
  orcamento: Orcamento,
  config: AutoConfig = AUTO_CONFIG_PADRAO
): { shouldAccept: boolean; reason: string; rules: string[] } {
  const rules: string[] = [];
  let shouldAccept = false;
  const reasons: string[] = [];

  // Regra 1: Verificar status atual
  if (orcamento.status !== 'Aguardando Aprovacao') {
    reasons.push(`Status atual é "${orcamento.status}", precisa estar "Aguardando Aprovacao"`);
    return { shouldAccept: false, reason: reasons.join('; '), rules: ['status_check'] };
  }
  rules.push('status_check');

  // Regra 2: Verificar valor mínimo
  if (orcamento.total < config.orcamentoValorMinAuto) {
    reasons.push(`Valor total R$ ${orcamento.total.toFixed(2)} abaixo do mínimo R$ ${config.orcamentoValorMinAuto}`);
  } else {
    rules.push('valor_minimo_ok');
    shouldAccept = true;
  }

  // Regra 3: Verificar valor máximo
  if (orcamento.total > config.orcamentoValorMaxAuto) {
    reasons.push(`Valor total R$ ${orcamento.total.toFixed(2)} acima do máximo para auto-aceite R$ ${config.orcamentoValorMaxAuto}`);
    shouldAccept = false;
  } else {
    rules.push('valor_maximo_ok');
  }

  // Regra 4: Verificar validade
  const hoje = new Date();
  const validade = new Date(orcamento.validade);
  const diasValidade = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasValidade < 0) {
    reasons.push('Orçamento vencido');
    shouldAccept = false;
  } else if (diasValidade <= config.orcamentoPrazoUrgenteDias) {
    rules.push('validade_ok_urgente');
  } else {
    rules.push('validade_ok');
  }

  // Regra 5: Verificar itens
  if (!orcamento.itens || orcamento.itens.length === 0) {
    reasons.push('Orçamento sem itens');
    shouldAccept = false;
  } else {
    rules.push('itens_ok');
  }

  return {
    shouldAccept,
    reason: reasons.length > 0 ? reasons.join('; ') : 'Critérios satisfeitos',
    rules
  };
}

/**
 * Aceita automaticamente um orçamento baseado nos critérios configurados
 * 
 * @param orcamentoId - ID do orçamento a ser aceito
 * @param orcamentos - Lista de orçamentos (para busca)
 * @param updateFn - Função para atualizar o orçamento
 * @param config - Configuração de automação
 * @returns Resultado da operação
 */
export async function autoAcceptOrcamento(
  orcamentoId: string,
  orcamentos: Orcamento[],
  updateFn: (id: string, data: Partial<Orcamento>) => Promise<void>,
  config: AutoConfig = AUTO_CONFIG_PADRAO
): Promise<AutoResult<Orcamento>> {
  try {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    
    if (!orcamento) {
      return { success: false, message: 'Orçamento não encontrado' };
    }

    const analysis = analyzeOrcamentoForAutoAccept(orcamento, config);
    
    if (!analysis.shouldAccept) {
      return { 
        success: false, 
        message: `Orçamento não aprovado para auto-aceite: ${analysis.reason}`,
        errors: analysis.rules
      };
    }

    // Executar auto-aceite
    await updateFn(orcamentoId, {
      status: 'Aprovado',
      aprovadoEm: new Date().toISOString()
    });

    return {
      success: true,
      message: `Orçamento ${orcamento.numero} aprovado automaticamente`,
      data: { ...orcamento, status: 'Aprovado', aprovadoEm: new Date() }
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao processar auto-aceite: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

/**
 * Critérios para auto-aceite de ordem de produção
 */
export interface OrdemAcceptCriteria {
  status: StatusOrdem;
  materiaisDisponiveis?: boolean;
  prioridade?: PrioridadeOrdem;
}

/**
 * Analisa uma ordem de produção para auto-aceite
 * 
 * @param ordem - Ordem de produção a ser analisada
 * @param verificarEstoqueFn - Função para verificar disponibilidade no estoque
 * @returns Resultado da análise
 */
export function analyzeOrdemForAutoAccept(
  ordem: OrdemProducao,
  verificarEstoqueFn?: (produtoId: string, quantidade: number) => boolean
): { shouldAccept: boolean; reason: string; rules: string[] } {
  const rules: string[] = [];
  const reasons: string[] = [];
  let shouldAccept = true;

  // Regra 1: Verificar status
  if (ordem.status !== 'Pendente') {
    reasons.push(`Status "${ordem.status}" não permite auto-aceite`);
    shouldAccept = false;
  } else {
    rules.push('status_pendente');
  }

  // Regra 2: Verificar materiais (se função disponível)
  if (verificarEstoqueFn) {
    const materiaisOk = ordem.itens.every(item => 
      verificarEstoqueFn(item.produtoId, item.quantidade)
    );
    
    if (!materiaisOk) {
      reasons.push('Materiais não disponíveis em estoque');
      shouldAccept = false;
    } else {
      rules.push('materiais_disponiveis');
    }
  }

  // Regra 3: Verificar prazo
  const hoje = new Date();
  const previsao = new Date(ordem.dataPrevisao);
  const diasAtraso = Math.ceil((hoje.getTime() - previsao.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasAtraso > 0) {
    reasons.push(`Ordem atrasada há ${diasAtraso} dias`);
  } else {
    rules.push('prazo_ok');
  }

  return { shouldAccept, reason: reasons.join('; ') || 'Pronto para produção', rules };
}

/**
 * Aceita automaticamente uma ordem de produção
 * 
 * @param ordemId - ID da ordem
 * @param ordens - Lista de ordens
 * @param updateFn - Função para atualizar
 * @param config - Configuração
 * @returns Resultado
 */
export async function autoAcceptOrdem(
  ordemId: string,
  ordens: OrdemProducao[],
  updateFn: (id: string, data: Partial<OrdemProducao>) => Promise<void>,
  _config: AutoConfig = AUTO_CONFIG_PADRAO
): Promise<AutoResult<OrdemProducao>> {
  try {
    const ordem = ordens.find(o => o.id === ordemId);
    
    if (!ordem) {
      return { success: false, message: 'Ordem de produção não encontrada' };
    }

    const analysis = analyzeOrdemForAutoAccept(ordem);
    
    if (!analysis.shouldAccept) {
      return {
        success: false,
        message: `Ordem não aprovada para auto-aceite: ${analysis.reason}`,
        errors: analysis.rules
      };
    }

    await updateFn(ordemId, {
      status: 'Em Produção',
      materiaisReservados: true
    });

    return {
      success: true,
      message: `Ordem ${ordem.numero} iniciada automaticamente`,
      data: { ...ordem, status: 'Em Produção', materiaisReservados: true }
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao processar auto-aceite: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

/**
 * Analisa material para auto-aceite de entrada
 * 
 * @param material - Item de material
 * @param estoqueAtual - Estoque atual do produto
 * @returns Resultado da análise
 */
export function analyzeMaterialForAutoAccept(
  material: ItemMaterial,
  estoqueAtual: number = 0
): { shouldAccept: boolean; reason: string; rules: string[] } {
  const rules: string[] = [];
  const reasons: string[] = [];
  let shouldAccept = true;

  // Regra 1: Verificar quantidade positiva
  if (material.quantidade <= 0) {
    reasons.push('Quantidade inválida');
    shouldAccept = false;
  } else {
    rules.push('quantidade_ok');
  }

  // Regra 2: Verificar preço
  if (material.precoUnitario <= 0) {
    reasons.push('Preço inválido');
    shouldAccept = false;
  } else {
    rules.push('preco_ok');
  }

  // Regra 3: Verificar se não é entrada excessiva (maior que 10x estoque atual)
  if (material.quantidade > estoqueAtual * 10 && estoqueAtual > 0) {
    reasons.push('Quantidade muito superior ao estoque atual - revisar');
    shouldAccept = false;
  } else {
    rules.push('quantidade_razoavel');
  }

  return { shouldAccept, reason: reasons.join('; ') || 'Material ok', rules };
}

/**
 * Aceita automaticamente uma entrada de material
 * 
 * @param material - Material a ser aceito
 * @param addMovimentacaoFn - Função para adicionar movimentação
 * @returns Resultado
 */
export async function autoAcceptMaterial(
  material: ItemMaterial,
  addMovimentacaoFn: (mov: Omit<MovimentacaoEstoque, 'id'>) => Promise<MovimentacaoEstoque>
): Promise<AutoResult<MovimentacaoEstoque>> {
  try {
    const analysis = analyzeMaterialForAutoAccept(material);
    
    if (!analysis.shouldAccept) {
      return {
        success: false,
        message: `Material não aprovado para auto-aceite: ${analysis.reason}`,
        errors: analysis.rules
      };
    }

    const movimentacao = await addMovimentacaoFn({
      data: new Date().toISOString(),
      tipo: 'Entrada',
      produtoId: material.produtoId,
      produtoNome: material.produtoNome,
      quantidade: material.quantidade,
      origem: 'Entrada Automática',
      referencia: material.id,
      usuarioId: 'sistema-auto',
      usuarioNome: 'Automação'
    });

    return {
      success: true,
      message: `Material ${material.produtoNome} aceito automaticamente`,
      data: movimentacao
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao processar auto-aceite de material: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

// ========================================
// AUTO DECISION - DECISÃO AUTOMÁTICA
// ========================================

/**
 * Decide se um orçamento deve ser aprovado ou rejeitado automaticamente
 * 
 * @param orcamento - Orçamento a ser analisado
 * @param config - Configuração de automação
 * @returns Resultado da decisão
 */
export function decideAprovacaoOrcamento(
  orcamento: Orcamento,
  config: AutoConfig = AUTO_CONFIG_PADRAO
): DecisionResult {
  const rules: string[] = [];
  let decision: DecisionResult['decision'] = 'pendente';
  let confidence = 0;
  const reasons: string[] = [];

  // Verificar se já foi processado
  if (orcamento.status !== 'Aguardando Aprovacao') {
    return {
      decision: 'revisar',
      reason: `Status atual "${orcamento.status}" não permite decisão automática`,
      confidence: 0,
      rules: ['status_nao_pendente']
    };
  }

  // Regra de valor
  rules.push('avaliar_valor');
  if (orcamento.total >= config.orcamentoValorMinAuto && orcamento.total <= config.orcamentoValorMaxAuto) {
    decision = 'aprovar';
    confidence += 40;
    reasons.push('Valor dentro da faixa permitida');
  } else if (orcamento.total > config.orcamentoValorMaxAuto) {
    decision = 'revisar';
    confidence += 30;
    reasons.push('Valor acima do limite - requer revisão manual');
  }

  // Regra de validade
  rules.push('avaliar_validade');
  const hoje = new Date();
  const validade = new Date(orcamento.validade);
  const diasValidade = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diasValidade < 0) {
    decision = 'rejeitar';
    confidence += 50;
    reasons.push('Orçamento vencido');
  } else if (diasValidade <= config.orcamentoPrazoUrgenteDias) {
    confidence += 20;
    reasons.push(`Validade curta (${diasValidade} dias) - prioridade alta`);
  } else {
    confidence += 10;
  }

  // Regra de itens
  rules.push('avaliar_itens');
  if (orcamento.itens && orcamento.itens.length > 0) {
    const itensValidos = orcamento.itens.every(item => 
      item.quantidade > 0 && item.precoUnitario > 0
    );
    
    if (itensValidos) {
      confidence += 20;
      reasons.push('Itens válidos');
    } else {
      decision = 'revisar';
      confidence = 10;
      reasons.push('Itens com dados inválidos');
    }
  } else {
    decision = 'rejeitar';
    confidence += 20;
    reasons.push('Sem itens');
  }

  // Ajuste final de confidence
  confidence = Math.min(confidence, 100);

  return {
    decision,
    reason: reasons.join('; '),
    confidence,
    rules
  };
}

/**
 * Decide a prioridade automaticamente para uma ordem de produção
 * 
 * @param ordem - Ordem de produção
 * @param config - Configuração
 * @returns Prioridade recomendada
 */
export function decidePrioridadeOrdem(
  ordem: OrdemProducao,
  config: AutoConfig = AUTO_CONFIG_PADRAO
): { prioridade: PrioridadeOrdem; reason: string; rules: string[] } {
  const rules: string[] = [];
  const reasons: string[] = [];
  let prioridade: PrioridadeOrdem = 'Normal';

  // Regra 1: Valor da ordem
  rules.push('avaliar_valor');
  if (ordem.total >= config.ordemValorUrgente) {
    prioridade = 'Alta';
    reasons.push(`Valor alto (R$ ${ordem.total.toFixed(2)})`);
  }

  // Regra 2: Prazo de entrega
  rules.push('avaliar_prazo');
  const hoje = new Date();
  const previsao = new Date(ordem.dataPrevisao);
  const diasRestantes = Math.ceil((previsao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    prioridade = 'Urgente';
    reasons.push(`Atrasado há ${Math.abs(diasRestantes)} dias`);
  } else if (diasRestantes <= 3) {
    if (prioridade === 'Normal') prioridade = 'Alta';
    reasons.push(`Prazo curto (${diasRestantes} dias)`);
  } else if (diasRestantes <= 7) {
    reasons.push(`Prazo moderado (${diasRestantes} dias)`);
  }

  // Regra 3: Materiais reservados
  rules.push('avaliar_materiais');
  if (!ordem.materiaisReservados) {
    reasons.push('Materiais não reservados - verificar');
  }

  return {
    prioridade,
    reason: reasons.join('; ') || 'Prioridade normal',
    rules
  };
}

/**
 * Decide alocação de materiais para uma ordem baseado em disponibilidade
 * 
 * @param ordem - Ordem de produção
 * @param estoqueFn - Função para verificar disponibilidade no estoque
 * @returns Resultado da alocação
 */
export function decideAlocacaoMateriais(
  ordem: OrdemProducao,
  estoqueFn: (produtoId: string) => number
): { 
  alocacao: Map<string, { solicitado: number; disponivel: number; autorizado: number }>;
  podeIniciar: boolean;
  reason: string;
  rules: string[];
} {
  const rules: string[] = [];
  const reasons: string[] = [];
  const alocacao = new Map<string, { solicitado: number; disponivel: number; autorizado: number }>();
  let podeIniciar = true;

  rules.push('analisar_estoque');

  ordem.itens.forEach(item => {
    const disponivel = estoqueFn(item.produtoId);
    const autorizado = Math.min(item.quantidade, disponivel);
    
    alocacao.set(item.produtoId, {
      solicitado: item.quantidade,
      disponivel,
      autorizado
    });

    if (disponivel < item.quantidade) {
      reasons.push(`Material ${item.produtoNome}: insuficiente (solicitado: ${item.quantidade}, disponível: ${disponivel})`);
      podeIniciar = false;
    }
  });

  if (podeIniciar) {
    reasons.push('Todos os materiais disponíveis');
  }

  return {
    alocacao,
    podeIniciar,
    reason: reasons.join('; '),
    rules
  };
}

// ========================================
// AUTO PROCESS - PROCESSAMENTO AUTOMÁTICO
// ========================================

/**
 * Configuração para processamento de fila
 */
export interface QueueProcessingConfig {
  /** Máximo de itens para processar por execução */
  maxItemsPerRun: number;
  /** Intervalo entre processamentos (ms) */
  intervalMs: number;
  /** Tipos de itens na fila */
  itemTypes: ('orcamento' | 'ordem' | 'material' | 'compra')[];
}

/** Configuração padrão */
export const QUEUE_CONFIG_PADRAO: QueueProcessingConfig = {
  maxItemsPerRun: 50,
  intervalMs: 60000, // 1 minuto
  itemTypes: ['orcamento', 'ordem', 'material', 'compra']
};

/**
 * Processa automaticamente a fila de itens pendentes
 * 
 * @param orcamentos - Lista de orçamentos
 * @param ordens - Lista de ordens
 * @param updateOrcamentoFn - Função para atualizar orçamento
 * @param updateOrdemFn - Função para atualizar ordem
 * @param config - Configuração
 * @returns Resultado do processamento
 */
export async function autoProcessQueue(
  orcamentos: Orcamento[],
  ordens: OrdemProducao[],
  updateOrcamentoFn: (id: string, data: Partial<Orcamento>) => Promise<void>,
  updateOrdemFn: (id: string, data: Partial<OrdemProducao>) => Promise<void>,
  config: QueueProcessingConfig = QUEUE_CONFIG_PADRAO
): Promise<AutoResult<{ orcamentosProcessados: number; ordensProcessadas: number }>> {
  const results = {
    orcamentosProcessados: 0,
    ordensProcessadas: 0
  };

  try {
    // Processar orçamentos pendentes
    if (config.itemTypes.includes('orcamento')) {
      const orcamentosPendentes = orcamentos
        .filter(o => o.status === 'Aguardando Aprovacao')
        .slice(0, config.maxItemsPerRun);

      for (const orcamento of orcamentosPendentes) {
        const decision = decideAprovacaoOrcamento(orcamento);
        
        if (decision.decision === 'aprovar' && decision.confidence >= 70) {
          await updateOrcamentoFn(orcamento.id, {
            status: 'Aprovado',
            aprovadoEm: new Date().toISOString()
          });
          results.orcamentosProcessados++;
        } else if (decision.decision === 'rejeitar') {
          await updateOrcamentoFn(orcamento.id, {
            status: 'Rejeitado'
          });
          results.orcamentosProcessados++;
        }
      }
    }

    // Processar ordens pendentes
    if (config.itemTypes.includes('ordem')) {
      const ordensPendentes = ordens
        .filter(o => o.status === 'Pendente')
        .slice(0, config.maxItemsPerRun);

      for (const ordem of ordensPendentes) {
        // Auto-atualizar prioridade
        const prioridadeResult = decidePrioridadeOrdem(ordem);
        await updateOrdemFn(ordem.id, {
          prioridade: prioridadeResult.prioridade
        });
        results.ordensProcessadas++;
      }
    }

    return {
      success: true,
      message: `Processados ${results.orcamentosProcessados} orçamentos e ${results.ordensProcessadas} ordens`,
      data: results
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro no processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      data: results
    };
  }
}

/**
 * Notificações para aprovação
 */
export interface AprovarNotification {
  tipo: 'orcamento' | 'ordem' | 'compra';
  id: string;
  numero: string;
  descricao: string;
  valor: number;
  prioridade: PrioridadeOrdem;
  data: Date;
}

/**
 * Gera lista de itens que precisam de aprovação para notificação
 * 
 * @param orcamentos - Lista de orçamentos
 * @param ordens - Lista de ordens
 * @param compras - Lista de solicitações de compra
 * @returns Lista de notificações a serem enviadas
 */
export function autoNotifyAprovar(
  orcamentos: Orcamento[],
  ordens: OrdemProducao[],
  compras?: SolicitacaoCompra[]
): AprovarNotification[] {
  const notifications: AprovarNotification[] = [];

  // Orçamentos aguardando aprovação
  orcamentos
    .filter(o => o.status === 'Aguardando Aprovacao')
    .forEach(orcamento => {
      notifications.push({
        tipo: 'orcamento',
        id: orcamento.id,
        numero: orcamento.numero,
        descricao: `Orçamento para ${orcamento.clienteNome}`,
        valor: orcamento.total,
        prioridade: orcamento.total > AUTO_CONFIG_PADRAO.ordemValorUrgente ? 'Alta' : 'Normal',
        data: new Date(orcamento.data)
      });
    });

  // Ordens com urgência
  ordens
    .filter(o => o.status === 'Pendente' && o.prioridade === 'Urgente')
    .forEach(ordem => {
      notifications.push({
        tipo: 'ordem',
        id: ordem.id,
        numero: ordem.numero,
        descricao: `Ordem de produção para ${ordem.clienteNome}`,
        valor: ordem.total,
        prioridade: 'Urgente',
        data: new Date(ordem.dataAbertura)
      });
    });

  // Compras aguardando
  if (compras) {
    compras
      .filter(c => c.status === 'Solicitada' || c.status === 'Cotação')
      .forEach(compra => {
        notifications.push({
          tipo: 'compra',
          id: compra.id,
          numero: compra.numero,
          descricao: compra.justificativa,
          valor: compra.total,
          prioridade: 'Normal',
          data: new Date(compra.data)
        });
      });
  }

  // Ordenar por prioridade e data
  notifications.sort((a, b) => {
    const prioridadeOrder = { 'Urgente': 0, 'Alta': 1, 'Normal': 2 };
    const prioridadeDiff = prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
    if (prioridadeDiff !== 0) return prioridadeDiff;
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  return notifications;
}

/**
 * Finaliza automaticamente itens concluídos
 * 
 * @param ordens - Lista de ordens
 * @param updateOrdemFn - Função para atualizar ordem
 * @param diasParaFinalizar - Dias após conclusão para finalizar
 * @returns Resultado da operação
 */
export async function autoFinalizeConcluidos(
  ordens: OrdemProducao[],
  _updateOrdemFn: (id: string, data: Partial<OrdemProducao>) => Promise<void>,
  diasParaFinalizar: number = 7
): Promise<AutoResult<{ finalizadas: number }>> {
  try {
    const hoje = new Date();
    let finalizadas = 0;

    const ordensConcluidas = ordens.filter(ordem => {
      if (ordem.status !== 'Concluída') return false;
      
      // Verificar se já passou o prazo para finalização
      const dataConclusao = new Date(ordem.dataConclusao || ordem.dataAbertura);
      const diasPassados = Math.ceil((hoje.getTime() - dataConclusao.getTime()) / (1000 * 60 * 60 * 24));
      
      return diasPassados >= diasParaFinalizar;
    });

    for (const _ordem of ordensConcluidas) {
      // Aqui poderia adicionar lógica adicional de finalização
      // como arquivamento, geração de relatórios, etc.
      finalizadas++;
    }

    return {
      success: true,
      message: `${finalizadas} ordens concluídas prontas para finalização`,
      data: { finalizadas }
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao finalizer: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      data: { finalizadas: 0 }
    };
  }
}

// ========================================
// UTILITÁRIOS DE AUTOMAÇÃO
// ========================================

/**
 * Gera relatório de automação
 * 
 * @param orcamentos - Lista de orçamentos
 * @param ordens - Lista de ordens
 * @returns Relatório de status de automação
 */
export function gerarRelatorioAutomacao(
  orcamentos: Orcamento[],
  ordens: OrdemProducao[]
): {
  orcamentos: {
    total: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    prontosParaAutoAccept: number;
  };
  ordens: {
    total: number;
    pendentes: number;
    emProducao: number;
    concluidas: number;
    urgente: number;
  };
  estatisticas: {
    taxaAprovacaoAutomatica: number;
    valorTotalOrcamentosPendente: number;
    valorTotalOrdensPendente: number;
  };
} {
  const orcamentosP = orcamentos.filter(o => o.status === 'Aguardando Aprovacao');
  
  const ordensP = ordens.filter(o => o.status === 'Pendente');
  const ordensUrgentes = ordens.filter(o => o.prioridade === 'Urgente' || o.prioridade === 'Alta');

  const orcamentosProntos = orcamentosP.filter(o => {
    const analysis = analyzeOrcamentoForAutoAccept(o);
    return analysis.shouldAccept;
  });

  const valorOrcamentosPendente = orcamentosP.reduce((sum, o) => sum + o.total, 0);
  const valorOrdensPendente = ordensP.reduce((sum, o) => sum + o.total, 0);

  return {
    orcamentos: {
      total: orcamentos.length,
      pendentes: orcamentosP.length,
      aprovados: orcamentos.filter(o => o.status === 'Aprovado').length,
      rejeitados: orcamentos.filter(o => o.status === 'Rejeitado').length,
      prontosParaAutoAccept: orcamentosProntos.length
    },
    ordens: {
      total: ordens.length,
      pendentes: ordensP.length,
      emProducao: ordens.filter(o => o.status === 'Em Produção').length,
      concluidas: ordens.filter(o => o.status === 'Concluída').length,
      urgente: ordensUrgentes.length
    },
    estatisticas: {
      taxaAprovacaoAutomatica: orcamentos.length > 0 
        ? (orcamentosProntos.length / orcamentosP.length) * 100 
        : 0,
      valorTotalOrcamentosPendente: valorOrcamentosPendente,
      valorTotalOrdensPendente: valorOrdensPendente
    }
  };
}

/**
 * Valida configuração de automação
 * 
 * @param config - Configuração a validar
 * @returns Erros encontrados (array vazio se válido)
 */
export function validarConfiguracaoAuto(config: AutoConfig): string[] {
  const erros: string[] = [];

  if (config.orcamentoValorMinAuto < 0) {
    erros.push('Valor mínimo não pode ser negativo');
  }

  if (config.orcamentoValorMaxAuto <= config.orcamentoValorMinAuto) {
    erros.push('Valor máximo deve ser maior que o mínimo');
  }

  if (config.orcamentoPrazoUrgenteDias <= 0) {
    erros.push('Prazo urgente deve ser maior que 0');
  }

  if (config.ordemValorUrgente < 0) {
    erros.push('Valor urgente de ordem não pode ser negativo');
  }

  if (config.ordemHorasAtrasado <= 0) {
    erros.push('Horas para atraso deve ser maior que 0');
  }

  return erros;
}
