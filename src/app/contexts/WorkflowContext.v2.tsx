/**
 * ============================================================================
 * WORKFLOW CONTEXT V2 - FIREBASE
 * ============================================================================
 * 
 * NOVA VERSÃO que usa Firebase Services ao invés de estado local.
 * 
 * MUDANÇAS:
 * - Dados vêm do Firebase (não mais estado local)
 * - Usa hooks customizados (useOrcamentos, useOrdens)
 * - Mantém compatibilidade com código existente
 * - Adiciona loading states
 * 
 * MIGRAÇÃO:
 * 1. Trocar import de WorkflowContext para WorkflowContext.v2
 * 2. Componentes que usam o context continuam funcionando
 * 3. Dados agora vêm do Firebase automaticamente
 * 
 * ============================================================================
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import {
  Orcamento,
  OrdemProducao,
  SolicitacaoCompra,
  MovimentacaoEstoque,
  WorkflowContextType,
  ItemMaterial
} from "../types/workflow";
import { useAuth } from "@/contexts/AuthContext";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useOrdens } from "@/hooks/useOrdens";
import { useAudit } from "./AuditContext";
import { isModeloValido } from "@/bom/models";
import { CHAPAS_PADRAO } from "@/domains/calculadora";
import type { ResultadoCalculadora } from "@/domains/calculadora";
import { estoqueMateriaisService } from "@/domains/estoque";

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

/**
 * VALIDAÇÕES RUNTIME (mantidas)
 */
function validarOrcamento(orcamento: Partial<Orcamento>): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  if (!orcamento.itens || orcamento.itens.length === 0) {
    erros.push("Orçamento precisa ter pelo menos 1 item");
  }

  if (orcamento.itens && orcamento.itens.length > 200) {
    erros.push("Orçamento não pode ter mais de 200 itens");
  }

  orcamento.itens?.forEach((item, index) => {
    if (!item.modeloId) {
      erros.push(`Item ${index + 1}: modeloId é obrigatório`);
    } else if (!isModeloValido(item.modeloId)) {
      erros.push(`Item ${index + 1}: modeloId "${item.modeloId}" não existe no registry`);
    }

    if (!item.calculoSnapshot) {
      erros.push(`Item ${index + 1}: calculoSnapshot é obrigatório`);
    } else {
      const snapshot = item.calculoSnapshot as ResultadoCalculadora;
      
      if (!snapshot.bom || !snapshot.bom.itens || snapshot.bom.itens.length === 0) {
        erros.push(`Item ${index + 1}: BOM vazia ou inválida`);
      }

      if (!snapshot.nesting || !snapshot.nesting.melhorOpcao) {
        erros.push(`Item ${index + 1}: Nesting vazio ou inválido`);
      } else {
        const chapaUsada = snapshot.nesting.melhorOpcao.chapa;
        const chapaValida = CHAPAS_PADRAO.some(
          c => c.comprimento === chapaUsada.comprimento && c.largura === chapaUsada.largura
        );
        if (!chapaValida) {
          erros.push(
            `Item ${index + 1}: Chapa ${chapaUsada.comprimento}×${chapaUsada.largura} não permitida. ` +
            `Apenas 2000×1250 e 3000×1250 são aceitas`
          );
        }
      }

      if (!snapshot.custos || snapshot.custos.categorias.length === 0) {
        erros.push(`Item ${index + 1}: Custos vazios ou inválidos`);
      }
    }
  });

  return { valido: erros.length === 0, erros };
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addLog } = useAudit();
  
  // Usar hooks Firebase
  const orcamentosHook = useOrcamentos({ autoLoad: !!user });
  const ordensHook = useOrdens({ autoLoad: !!user });
  
  // Estado local para solicitações e movimentações (TODO: migrar para Firebase)
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCompra[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);

  // ============= ORÇAMENTOS =============
  
  const addOrcamento = useCallback<WorkflowContextType["addOrcamento"]>(async (data) => {
    const validacao = validarOrcamento(data);
    if (!validacao.valido) {
      throw new Error(`Erros de validação: ${validacao.erros.join(", ")}`);
    }

    const result = await orcamentosHook.createOrcamento({
      numero: `ORC-${String(orcamentosHook.orcamentos.length + 1).padStart(4, '0')}`,
      ...data as any,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao criar orçamento');
    }

    addLog({
      action: "create",
      module: "orcamentos",
      recordId: result.data.id,
      recordName: result.data.numero,
      description: `Criou orçamento ${result.data.numero} para ${result.data.clienteNome}`,
      newData: result.data
    });
    
    return result.data;
  }, [orcamentosHook, addLog]);

  const updateOrcamento = useCallback<WorkflowContextType["updateOrcamento"]>(async (id, data) => {
    const orcamento = orcamentosHook.orcamentos.find(o => o.id === id);
    
    await orcamentosHook.updateOrcamento(id, data as any);
    
    if (orcamento) {
      addLog({
        action: "update",
        module: "orcamentos",
        recordId: id,
        recordName: orcamento.numero,
        description: `Atualizou orçamento ${orcamento.numero}`,
        oldData: orcamento,
        newData: data
      });
    }
  }, [orcamentosHook, addLog]);

  const converterOrcamentoEmOrdem = useCallback<WorkflowContextType["converterOrcamentoEmOrdem"]>(async (orcamentoId) => {
    const orcamento = orcamentosHook.orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) throw new Error("Orçamento não encontrado");

    // REGRA DE NEGÓCIO: OP só pode ser criada de orçamento APROVADO
    if (orcamento.status !== "Aprovado") {
      throw new Error("Apenas orçamentos aprovados podem ser convertidos em ordem de produção");
    }

    const result = await ordensHook.createOrdemDeOrcamento(orcamentoId);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao criar ordem de produção');
    }

    addLog({
      action: "create",
      module: "ordens",
      recordId: result.data.id,
      recordName: result.data.numero,
      description: `Converteu orçamento ${orcamento.numero} em ordem de produção ${result.data.numero}`,
      newData: result.data
    });

    return result.data;
  }, [orcamentosHook.orcamentos, ordensHook, addLog]);

  // ============= ORDENS DE PRODUÇÃO =============

  const addOrdem = useCallback<WorkflowContextType["addOrdem"]>(async (data) => {
    throw new Error(
      "addOrdem não é permitido. Use converterOrcamentoEmOrdem para criar ordens de produção."
    );
  }, []);

  const updateOrdem = useCallback<WorkflowContextType["updateOrdem"]>(async (id, data) => {
    const ordem = ordensHook.ordens.find(o => o.id === id);
    
    await ordensHook.updateOrdem(id, data as any);
    
    if (ordem) {
      addLog({
        action: "update",
        module: "ordens",
        recordId: id,
        recordName: ordem.numero,
        description: `Atualizou ordem ${ordem.numero}`,
        oldData: ordem,
        newData: data
      });
    }
  }, [ordensHook, addLog]);

  // ============= SOLICITAÇÕES DE COMPRA (TODO: migrar para Firebase) =============

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateNumero = (prefix: string, count: number) => `${prefix}-${String(count + 1).padStart(4, '0')}`;

  const addSolicitacaoCompra = useCallback<WorkflowContextType["addSolicitacaoCompra"]>((data) => {
    const newSolicitacao: SolicitacaoCompra = {
      id: generateId(),
      numero: generateNumero("SC", solicitacoes.length),
      ...data
    };
    
    setSolicitacoes(prev => [...prev, newSolicitacao]);
    
    addLog({
      action: "create",
      module: "compras",
      recordId: newSolicitacao.id,
      recordName: newSolicitacao.numero,
      description: `Criou solicitação de compra ${newSolicitacao.numero}`,
      newData: newSolicitacao
    });
    
    return newSolicitacao;
  }, [solicitacoes.length, addLog]);

  const updateSolicitacaoCompra = useCallback<WorkflowContextType["updateSolicitacaoCompra"]>((id, data) => {
    setSolicitacoes(prev => prev.map(sol => 
      sol.id === id ? { ...sol, ...data } : sol
    ));
    
    const solicitacao = solicitacoes.find(s => s.id === id);
    if (solicitacao) {
      addLog({
        action: "update",
        module: "compras",
        recordId: id,
        recordName: solicitacao.numero,
        description: `Atualizou solicitação ${solicitacao.numero}`,
        oldData: solicitacao,
        newData: data
      });
    }
  }, [solicitacoes, addLog]);

  // ============= MOVIMENTAÇÕES (TODO: migrar para Firebase) =============

  const addMovimentacao = useCallback<WorkflowContextType["addMovimentacao"]>((data) => {
    const newMovimentacao: MovimentacaoEstoque = {
      id: generateId(),
      numero: generateNumero("MOV", movimentacoes.length),
      ...data
    };
    
    setMovimentacoes(prev => [...prev, newMovimentacao]);
    
    addLog({
      action: "create",
      module: "estoque",
      recordId: newMovimentacao.id,
      recordName: newMovimentacao.numero,
      description: `Registrou movimentação de estoque ${newMovimentacao.numero}`,
      newData: newMovimentacao
    });
    
    return newMovimentacao;
  }, [movimentacoes.length, addLog]);

  // ============= VERIFICAÇÃO DE MATERIAIS =============

  const verificarMateriaisParaOrdem = useCallback(async (ordemId: string) => {
    const ordem = ordensHook.ordens.find(o => o.id === ordemId);
    if (!ordem) throw new Error("Ordem não encontrada");

    const orcamento = orcamentosHook.orcamentos.find(o => o.id === ordem.orcamentoId);
    if (!orcamento) throw new Error("Orçamento vinculado não encontrado");

    const materiaisFaltantes = await estoqueMateriaisService.verificarMateriais(
      orcamento.itens.map(item => item.calculoSnapshot)
    );

    return materiaisFaltantes;
  }, [orcamentosHook.orcamentos, ordensHook.ordens]);

  const value: WorkflowContextType = {
    orcamentos: orcamentosHook.orcamentos,
    ordens: ordensHook.ordens,
    solicitacoes,
    movimentacoes,
    addOrcamento,
    updateOrcamento,
    converterOrcamentoEmOrdem,
    addOrdem,
    updateOrdem,
    addSolicitacaoCompra,
    updateSolicitacaoCompra,
    addMovimentacao,
    verificarMateriaisParaOrdem
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow deve ser usado dentro de WorkflowProvider");
  }
  return context;
}
