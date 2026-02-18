/**
 * ============================================================================
 * WORKFLOW CONTEXT V2 - FIREBASE
 * ============================================================================
 * 
 * NOVA VERSÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢O que usa Firebase Services ao invÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©s de estado local.
 * 
 * MUDANÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡AS:
 * - Dados vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªm do Firebase (nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o mais estado local)
 * - Usa hooks customizados (useOrcamentos, useOrdens)
 * - MantÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©m compatibilidade com cÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³digo existente
 * - Adiciona loading states
 * 
 * MIGRAÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ES RUNTIME (mantidas)
 */
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);
import { Orcamento, SolicitacaoCompra, MovimentacaoEstoque, WorkflowContextType } from "../types/workflow";
import { useAuth } from "@/app/hooks/useAuth";
import { useAudit } from "./AuditContext";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useOrdens } from "@/hooks/useOrdens";

import { estoqueMateriaisService } from "@/domains/estoque/estoque-material.service";
import type { ResultadoCalculadora } from "@/domains/catalogo/types";
import { isModeloValido } from "@/bom/models";

function validarOrcamento(orcamento: Partial<Orcamento>): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  if (!orcamento.itens || orcamento.itens.length === 0) {
    erros.push("OrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amento precisa ter pelo menos 1 item");
  }

  if (orcamento.itens && orcamento.itens.length > 200) {
    erros.push("OrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amento nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o pode ter mais de 200 itens");
  }

  orcamento.itens?.forEach((item, index) => {
    if (!item) {
      erros.push(`Item ${index + 1}: Item inválido`);
      return;
    }
    if (!item.modeloId) {
      erros.push(`Item ${index + 1}: modeloId ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âé obrigatÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rio`);
    } else if (!isModeloValido(item.modeloId)) {
      erros.push(`Item ${index + 1}: modeloId "${item.modeloId}" nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o existe no registry`);
    }

    if (!item.calculoSnapshot) {
      erros.push(`Item ${index + 1}: calculoSnapshot ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âé obrigatÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rio`);
    } else {
      const snapshot = item.calculoSnapshot as ResultadoCalculadora;
      
      if (!snapshot.consumoMateriais || snapshot.consumoMateriais.length === 0) {
        erros.push(`Item ${index + 1}: Consumo de materiais vazio ou inválido`);
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
  
  // Estado local para solicitaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes e movimentaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes (TODO: migrar para Firebase)
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCompra[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);

  // ============= ORÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡AMENTOS =============
  
  const addOrcamento = useCallback<WorkflowContextType["addOrcamento"]>(async (data) => {
    const validacao = validarOrcamento(data);
    if (!validacao.valido) {
      throw new Error(`Erros de validaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o: ${validacao.erros.join(", ")}`);
    }

    const result = await orcamentosHook.createOrcamento({
      numero: `ORC-${String(orcamentosHook.orcamentos.length + 1).padStart(4, '0')}`,
      ...data as any,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao criar orÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amento');
    }

    addLog({
      action: "create",
      module: "orcamentos",
      recordId: result.data.id,
      recordName: result.data.numero,
      description: `Criou orÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amento ${result.data.numero} para ${result.data.clienteNome}`,
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
        description: `Atualizou orÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amento ${orcamento.numero}`,
        oldData: orcamento,
        newData: data
      });
    }
  }, [orcamentosHook, addLog]);

  const converterOrcamentoEmOrdem = useCallback<WorkflowContextType["converterOrcamentoEmOrdem"]>(async (orcamentoId) => {
    const orcamento = orcamentosHook.orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) throw new Error("OrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amento nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrado");

    // REGRA DE NEGÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“CIO: OP sÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³ pode ser criada de orÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amento APROVADO
    if (orcamento.status !== "Aprovado") {
      throw new Error("Apenas orÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amentos aprovados podem ser convertidos em ordem de produÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o");
    }

    const result = await ordensHook.createOrdemDeOrcamento(orcamentoId);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao criar ordem de produÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o');
    }

    addLog({
      action: "create",
      module: "ordens",
      recordId: result.data.id,
      recordName: result.data.numero,
      description: `Converteu orÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amento ${orcamento.numero} em ordem de produÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o ${result.data.numero}`,
      newData: result.data
    });

    return result.data;
  }, [orcamentosHook.orcamentos, ordensHook, addLog]);

  // ============= ORDENS DE PRODUÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢O =============

  const addOrdem = useCallback(async (_data: any) => {
    throw new Error(
      "addOrdem nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃO ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âé permitido. Use converterOrcamentoEmOrdem para criar ordens de produÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o."
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

  // ============= SOLICITAÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ES DE COMPRA (TODO: migrar para Firebase) =============

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateNumero = (prefix: string, count: number) => `${prefix}-${String(count + 1).padStart(4, '0')}`;

  const addSolicitacaoCompra = useCallback((data: Omit<SolicitacaoCompra, "id" | "numero">) => {
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
      description: `Criou solicitaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o de compra ${newSolicitacao.numero}`,
      newData: newSolicitacao
    });
    
    return newSolicitacao;
  }, [solicitacoes.length, addLog]);

  const addSolicitacao = useCallback((data: Omit<SolicitacaoCompra, "id" | "numero">) => {
    return addSolicitacaoCompra(data);
  }, [addSolicitacaoCompra]);

  const updateSolicitacaoCompra = useCallback((id: string, data: Partial<Omit<SolicitacaoCompra, "id" | "numero">>) => {
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
        description: `Atualizou solicitaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o ${solicitacao.numero}`,
        oldData: solicitacao,
        newData: data
      });
    }
  }, [solicitacoes, addLog]);

  const updateSolicitacao = useCallback((id: string, data: Partial<Omit<SolicitacaoCompra, "id" | "numero">>) => {
    return updateSolicitacaoCompra(id, data);
  }, [updateSolicitacaoCompra]);

  // ============= MOVIMENTAÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ES (TODO: migrar para Firebase) =============

  const addMovimentacao = useCallback((data: Omit<MovimentacaoEstoque, "id">) => {
    const newMovimentacao: MovimentacaoEstoque = {
      id: generateId(),
      ...data
    };
    
    setMovimentacoes(prev => [...prev, newMovimentacao]);
    
    addLog({
      action: "create",
      module: "estoque",
      recordId: newMovimentacao.id,
      recordName: newMovimentacao.id,
      description: `Registrou movimentaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o de estoque ${newMovimentacao.id}`,
      newData: newMovimentacao
    });
    
    return newMovimentacao;
  }, [movimentacoes.length, addLog]);

  const verificarDisponibilidade = useCallback<WorkflowContextType["verificarDisponibilidade"]>((produtoId, quantidade) => {
    const faltantes = estoqueMateriaisService.verificarDisponibilidade([
      { materialId: produtoId, quantidade }
    ]);
    return faltantes.length === 0;
  }, []);

  // ============= VERIFICAÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢O DE MATERIAIS =============

  const extrairMateriaisDaOrcamento = (orcamento: Orcamento) => {
    const materiaisAgrupados = new Map<string, { quantidade: number; unidade: string; nome: string }>();

    orcamento.itens.forEach(itemOrcamento => {
      const snapshot = itemOrcamento.calculoSnapshot as ResultadoCalculadora | undefined;
      if (!snapshot?.consumoMateriais || snapshot.consumoMateriais.length === 0) return;

      snapshot.consumoMateriais.forEach((bomItem: any) => {
        const materialId = bomItem.material || "DESCONHECIDO";
        const quantidade = (bomItem.pesoTotal || bomItem.qtd || 0) * itemOrcamento.quantidade;
        const unidade = bomItem.unidade || "un";
        const nome = bomItem.desc || materialId;

        if (materiaisAgrupados.has(materialId)) {
          const atual = materiaisAgrupados.get(materialId)!;
          atual.quantidade += quantidade;
        } else {
          materiaisAgrupados.set(materialId, { quantidade, unidade, nome });
        }
      });
    });

    return Array.from(materiaisAgrupados.entries()).map(([materialId, dados]) => ({
      materialId,
      ...dados,
    }));
  };

  const verificarMateriaisParaOrdem = useCallback(async (ordemId: string) => {
    const ordem = ordensHook.ordens.find(o => o.id === ordemId);
    if (!ordem) throw new Error("Ordem nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrada");

    const orcamento = orcamentosHook.orcamentos.find(o => o.id === ordem.orcamentoId);
    if (!orcamento) throw new Error("OrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§amento vinculado nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrado");

    const materiaisNecessarios = extrairMateriaisDaOrcamento(orcamento);
    return estoqueMateriaisService.verificarDisponibilidade(
      materiaisNecessarios.map(m => ({ materialId: m.materialId, quantidade: m.quantidade }))
    );
  }, [orcamentosHook.orcamentos, ordensHook.ordens]);

  const verificarNecessidadeCompra = useCallback<WorkflowContextType["verificarNecessidadeCompra"]>(async (ordemId) => {
    const ordem = ordensHook.ordens.find(o => o.id === ordemId);
    if (!ordem) return [];

    const orcamento = orcamentosHook.orcamentos.find(o => o.id === ordem.orcamentoId);
    if (!orcamento) return [];

    const materiaisNecessarios = extrairMateriaisDaOrcamento(orcamento);
    const faltantes = estoqueMateriaisService.verificarDisponibilidade(
      materiaisNecessarios.map(m => ({ materialId: m.materialId, quantidade: m.quantidade }))
    );

    return faltantes.map(f => ({
      id: generateId(),
      produtoId: f.materialId,
      produtoNome: f.materialNome,
      quantidade: f.falta,
      unidade: f.unidade,
      precoUnitario: 0,
      subtotal: 0,
    }));
  }, [orcamentosHook.orcamentos, ordensHook.ordens]);

  const reservarMateriais = useCallback<WorkflowContextType["reservarMateriais"]>((ordemId) => {
    const ordem = ordensHook.ordens.find(o => o.id === ordemId);
    if (!ordem) return false;

    const orcamento = orcamentosHook.orcamentos.find(o => o.id === ordem.orcamentoId);
    if (!orcamento) return false;

    const materiaisNecessarios = extrairMateriaisDaOrcamento(orcamento);
    const faltantes = estoqueMateriaisService.verificarDisponibilidade(
      materiaisNecessarios.map(m => ({ materialId: m.materialId, quantidade: m.quantidade }))
    );
    if (faltantes.length > 0) return false;

    const usuario = user?.displayName || user?.email || "Sistema";
    estoqueMateriaisService.reservarMateriais(
      ordemId,
      materiaisNecessarios.map(m => ({ materialId: m.materialId, quantidade: m.quantidade })),
      usuario
    );
    return true;
  }, [ordensHook.ordens, orcamentosHook.orcamentos, user]);

  const consumirMateriais = useCallback<WorkflowContextType["consumirMateriais"]>((ordemId) => {
    const ordem = ordensHook.ordens.find(o => o.id === ordemId);
    if (!ordem) return false;

    const orcamento = orcamentosHook.orcamentos.find(o => o.id === ordem.orcamentoId);
    if (!orcamento) return false;

    const materiaisNecessarios = extrairMateriaisDaOrcamento(orcamento);
    const usuario = user?.displayName || user?.email || "Sistema";
    estoqueMateriaisService.consumirMateriais(
      ordemId,
      materiaisNecessarios.map(m => ({ materialId: m.materialId, quantidade: m.quantidade })),
      usuario
    );
    return true;
  }, [ordensHook.ordens, orcamentosHook.orcamentos, user]);

  const iniciarProducao = useCallback<WorkflowContextType["iniciarProducao"]>(async (ordemId, operadorNome) => {
    const nome = operadorNome || user?.displayName || user?.email || "Operador";
    const result = await ordensHook.iniciarProducao(ordemId, nome);
    return { success: result.success, error: result.error };
  }, [ordensHook, user]);

  const concluirProducao = useCallback<WorkflowContextType["concluirProducao"]>(async (ordemId) => {
    await ordensHook.concluirProducao(ordemId);
  }, [ordensHook]);

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
    iniciarProducao,
    concluirProducao,
    verificarDisponibilidade,
    reservarMateriais,
    consumirMateriais,
    addSolicitacao,
    updateSolicitacao,
    verificarNecessidadeCompra,
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
