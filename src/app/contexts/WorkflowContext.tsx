import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  Orcamento,
  OrdemProducao,
  SolicitacaoCompra,
  MovimentacaoEstoque,
  WorkflowContextType
} from "../types/workflow";
import { useAudit } from "./AuditContext";
import { isModeloValido } from "@/bom/models";
import { CHAPAS_PADRAO } from "@/domains/calculadora";
import type { ResultadoCalculadora } from "@/domains/calculadora";
import { estoqueMateriaisService } from "@/domains/estoque";
import type { BOMItem } from "@/bom/types";

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// FunÃ§Ãµes auxiliares
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateNumero = (prefix: string, count: number) => `${prefix}-${String(count + 1).padStart(4, '0')}`;

/**
 * VALIDAÃ‡Ã•ES RUNTIME (Fase 1)
 * Bloqueia criaÃ§Ã£o de orÃ§amentos fora das regras, mesmo que UI tente forÃ§ar
 */
function validarOrcamento(orcamento: Partial<Orcamento>): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validar itens
  if (!orcamento.itens || orcamento.itens.length === 0) {
    erros.push("OrÃ§amento precisa ter pelo menos 1 item");
  }

  if (orcamento.itens && orcamento.itens.length > 200) {
    erros.push("OrÃ§amento nÃ£o pode ter mais de 200 itens");
  }

  orcamento.itens?.forEach((item, index) => {
    // Validar modeloId
    if (!item.modeloId) {
      erros.push(`Item ${index + 1}: modeloId Ã© obrigatÃ³rio`);
    } else if (!isModeloValido(item.modeloId)) {
      erros.push(`Item ${index + 1}: modeloId "${item.modeloId}" nÃ£o existe no registry`);
    }

    // Validar snapshots
    if (!item.calculoSnapshot) {
      erros.push(`Item ${index + 1}: calculoSnapshot Ã© obrigatÃ³rio`);
    } else {
      const snapshot = item.calculoSnapshot as ResultadoCalculadora;
      
      if (!snapshot.bomResult || !snapshot.bomResult.bom || snapshot.bomResult.bom.length === 0) {
        erros.push(`Item ${index + 1}: BOM vazia ou invalida`);
      }

      if (!snapshot.nesting || !snapshot.nesting.melhorOpcao) {
        erros.push(`Item ${index + 1}: Nesting vazio ou invalido`);
      } else {
        // Validar chapas (sÃ³ 2000Ã—1250 e 3000Ã—1250)
        const chapaUsada = snapshot.nesting.melhorOpcao.chapa;
        const chapaValida = CHAPAS_PADRAO.some(
          c => c.comprimento === chapaUsada.comprimento && c.largura === chapaUsada.largura
        );
        if (!chapaValida) {
          erros.push(
            `Item ${index + 1}: Chapa ${chapaUsada.comprimento}Ã—${chapaUsada.largura} nÃ£o permitida. ` +
            `Apenas 2000Ã—1250 e 3000Ã—1250 sÃ£o aceitas`
          );
        }
      }

      if (!snapshot.custos || snapshot.custos.categorias.length === 0) {
        erros.push(`Item ${index + 1}: Custos vazios ou invalidos`);
      }
    }
  });

  return { valido: erros.length === 0, erros };
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { addLog } = useAudit();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [ordens, setOrdens] = useState<OrdemProducao[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCompra[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);

  // ============= ORÃ‡AMENTOS =============
  
  const addOrcamento = useCallback<WorkflowContextType["addOrcamento"]>((data) => {
    const validacao = validarOrcamento(data);
    if (!validacao.valido) {
      throw new Error(`Erros de validaÃ§Ã£o: ${validacao.erros.join(", ")}`);
    }

    const newOrcamento: Orcamento = {
      id: generateId(),
      numero: generateNumero("ORC", orcamentos.length),
      ...data
    };
    
    setOrcamentos(prev => [...prev, newOrcamento]);
    
    addLog({
      action: "create",
      module: "orcamentos",
      recordId: newOrcamento.id,
      recordName: newOrcamento.numero,
      description: `Criou orÃ§amento ${newOrcamento.numero} para ${newOrcamento.clienteNome}`,
      newData: newOrcamento
    });
    
    return newOrcamento;
  }, [orcamentos.length, addLog]);

  const updateOrcamento = useCallback<WorkflowContextType["updateOrcamento"]>((id, data) => {
    setOrcamentos(prev => prev.map(orc => 
      orc.id === id ? { ...orc, ...data } : orc
    ));
    
    const orcamento = orcamentos.find(o => o.id === id);
    if (orcamento) {
      addLog({
        action: "update",
        module: "orcamentos",
        recordId: id,
        recordName: orcamento.numero,
        description: `Atualizou orÃ§amento ${orcamento.numero}`,
        oldData: orcamento,
        newData: data
      });
    }
  }, [orcamentos, addLog]);

  const converterOrcamentoEmOrdem = useCallback<WorkflowContextType["converterOrcamentoEmOrdem"]>((orcamentoId) => {
    const orcamento = orcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) throw new Error("OrÃ§amento nÃ£o encontrado");

    // REGRA DE NEGÃ“CIO: OP sÃ³ pode ser criada de orÃ§amento APROVADO
    if (orcamento.status !== "Aprovado") {
      throw new Error("Apenas orÃ§amentos aprovados podem ser convertidos em ordem de produÃ§Ã£o");
    }

    // Criar ordem de produÃ§Ã£o
    const novaOrdem: OrdemProducao = {
      id: generateId(),
      numero: generateNumero("OP", ordens.length),
      orcamentoId: orcamento.id,
      clienteId: orcamento.clienteId,
      clienteNome: orcamento.clienteNome,
      dataAbertura: new Date(),
      dataPrevisao: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
      status: "Pendente",
      itens: orcamento.itens.map(item => ({
        // Converte ItemOrcamento para ItemMaterial (para OP)
        id: item.id,
        produtoId: item.modeloId,
        produtoNome: item.descricao,
        quantidade: item.quantidade,
        unidade: 'un',
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal,
      })),
      total: orcamento.total,
      prioridade: "Normal",
      observacoes: `Convertido do orÃ§amento ${orcamento.numero}`,
      materiaisReservados: false,
      materiaisConsumidos: false
    };

    setOrdens(prev => [...prev, novaOrdem]);

    // Atualizar orÃ§amento
    updateOrcamento(orcamentoId, {
      status: "Convertido",
      ordemId: novaOrdem.id
    });

    addLog({
      action: "create",
      module: "ordens",
      recordId: novaOrdem.id,
      recordName: novaOrdem.numero,
      description: `Converteu orÃ§amento ${orcamento.numero} em ordem de produÃ§Ã£o ${novaOrdem.numero}`,
      newData: novaOrdem
    });

    return novaOrdem;
  }, [orcamentos, ordens.length, updateOrcamento, addLog]);

  // ============= ORDENS DE PRODUÃ‡ÃƒO =============

  const addOrdem = useCallback<WorkflowContextType["addOrdem"]>((data) => {
    const newOrdem: OrdemProducao = {
      id: generateId(),
      numero: generateNumero("OP", ordens.length),
      ...data
    };
    
    setOrdens(prev => [...prev, newOrdem]);
    
    addLog({
      action: "create",
      module: "ordens",
      recordId: newOrdem.id,
      recordName: newOrdem.numero,
      description: `Criou ordem de produÃ§Ã£o ${newOrdem.numero}`,
      newData: newOrdem
    });
    
    return newOrdem;
  }, [ordens.length, addLog]);

  const updateOrdem = useCallback<WorkflowContextType["updateOrdem"]>((id, data) => {
    setOrdens(prev => prev.map(ord => 
      ord.id === id ? { ...ord, ...data } : ord
    ));
    
    const ordem = ordens.find(o => o.id === id);
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
  }, [ordens, addLog]);

  const verificarDisponibilidade = useCallback<WorkflowContextType["verificarDisponibilidade"]>((produtoId, quantidade) => {
    const faltantes = estoqueMateriaisService.verificarDisponibilidade([
      { materialId: produtoId, quantidade }
    ]);
    return faltantes.length === 0;
  }, []);

  const reservarMateriais = useCallback<WorkflowContextType["reservarMateriais"]>((ordemId) => {
    const ordem = ordens.find(o => o.id === ordemId);
    if (!ordem) return false;

    // Verificar se todos os materiais estÃ£o disponÃ­veis
    const todosMaterialsDisponiveis = ordem.itens.every(item =>
      verificarDisponibilidade(item.produtoId, item.quantidade)
    );

    if (!todosMaterialsDisponiveis) return false;

    // Reservar materiais (apenas marcar como reservado)
    updateOrdem(ordemId, { materiaisReservados: true });

    addLog({
      action: "update",
      module: "ordens",
      recordId: ordemId,
      recordName: ordem.numero,
      description: `Reservou materiais para ordem ${ordem.numero}`
    });

    return true;
  }, [ordens, verificarDisponibilidade, updateOrdem, addLog]);

  const consumirMateriais = useCallback<WorkflowContextType["consumirMateriais"]>((ordemId) => {
    const ordem = ordens.find(o => o.id === ordemId);
    if (!ordem) return false;

    // Consumir materiais do estoque
    const novoEstoque = { ...estoqueMateriaisService.getEstoque?.() };
    const novasMovimentacoes: MovimentacaoEstoque[] = [];

    ordem.itens.forEach(item => {
      novoEstoque[item.produtoId] = (novoEstoque[item.produtoId] || 0) - item.quantidade;
      
      novasMovimentacoes.push({
        id: generateId(),
        data: new Date(),
        tipo: "Saída",
        produtoId: item.produtoId,
        produtoNome: item.produtoNome,
        quantidade: -item.quantidade,
        origem: `Ordem de Producao ${ordem.numero}`,
        referencia: ordem.id,
        usuarioId: "user-001",
        usuarioNome: "Administrador"
      });
    });

    estoqueMateriaisService.setEstoque?.(novoEstoque);
    setMovimentacoes(prev => [...novasMovimentacoes, ...prev]);
    updateOrdem(ordemId, { materiaisConsumidos: true });

    addLog({
      action: "update",
      module: "estoque",
      recordId: ordemId,
      recordName: ordem.numero,
      description: `Consumiu materiais da ordem ${ordem.numero}`
    });

    return true;
  }, [ordens, updateOrdem, addLog]);

  const iniciarProducao = useCallback<WorkflowContextType["iniciarProducao"]>((ordemId) => {
    const ordem = ordens.find(o => o.id === ordemId);
    if (!ordem) return false;

    // Verificar disponibilidade e reservar materiais
    if (!ordem.materiaisReservados) {
      const reservado = reservarMateriais(ordemId);
      if (!reservado) return false;
    }

    // Consumir materiais
    if (!ordem.materiaisConsumidos) {
      consumirMateriais(ordemId);
    }

    // Atualizar status
    updateOrdem(ordemId, { status: "Em Produção" });

    return true;
  }, [ordens, reservarMateriais, consumirMateriais, updateOrdem]);

  const concluirProducao = useCallback<WorkflowContextType["concluirProducao"]>((ordemId) => {
    updateOrdem(ordemId, {
      status: "Concluída",
      dataConclusao: new Date()
    });
  }, [updateOrdem]);

  // ============= COMPRAS =============

  /**
   * Extrai lista de materiais da BOM de uma ordem de produÃ§Ã£o
   */
  const extrairMateriaisDaOrdem = (ordem: OrdemProducao): { materialId: string; quantidade: number; unidade: string; nome: string }[] => {
    const materiaisAgrupados = new Map<string, { quantidade: number; unidade: string; nome: string }>();
    
    // Buscar orÃ§amento original para ter acesso Ã  BOM completa
    const orcamento = orcamentos.find(o => o.id === ordem.orcamentoId);
    if (!orcamento) return [];
    
    // Iterar por cada item do orÃ§amento
    orcamento.itens.forEach(itemOrcamento => {
      const snapshot = itemOrcamento.calculoSnapshot as ResultadoCalculadora | undefined;
      if (!snapshot?.bomResult?.bom) return;
      
      // Extrair materiais da BOM
      snapshot.bomResult.bom.forEach((bomItem: BOMItem) => {
        const materialId = bomItem.material || 'DESCONHECIDO';
        const quantidade = (bomItem.pesoTotal || bomItem.qtd || 0) * itemOrcamento.quantidade;
        const unidade = bomItem.unidade || 'un';
        const nome = bomItem.desc || materialId;
        
        // Agrupar materiais iguais
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

  const verificarNecessidadeCompra = useCallback<WorkflowContextType["verificarNecessidadeCompra"]>((ordemId) => {
    const ordem = ordens.find(o => o.id === ordemId);
    if (!ordem) return [];

    // âœ… NOVA LÃ“GICA: Extrair materiais da BOM real
    const materiaisNecessarios = extrairMateriaisDaOrdem(ordem);
    
    // Verificar disponibilidade no estoque
    const faltantes = estoqueMateriaisService.verificarDisponibilidade(
      materiaisNecessarios.map(m => ({ materialId: m.materialId, quantidade: m.quantidade }))
    );
    
    // Converter para formato ItemMaterial
    return faltantes.map(f => ({
      id: generateId(),
      produtoId: f.materialId,
      produtoNome: f.materialNome,
      quantidade: f.falta,
      unidade: f.unidade,
      precoUnitario: 0, // TODO: buscar preÃ§o do material
      subtotal: 0,
    }));
  }, [ordens, orcamentos]);

  const addSolicitacao = useCallback<WorkflowContextType["addSolicitacao"]>((data) => {
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
      description: `Criou solicitaÃ§Ã£o de compra ${newSolicitacao.numero}`,
      newData: newSolicitacao
    });
    
    return newSolicitacao;
  }, [solicitacoes.length, addLog]);

  const updateSolicitacao = useCallback<WorkflowContextType["updateSolicitacao"]>((id, data) => {
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
        description: `Atualizou solicitaÃ§Ã£o ${solicitacao.numero}`,
        oldData: solicitacao,
        newData: data
      });
    }
  }, [solicitacoes, addLog]);

  return (
    <WorkflowContext.Provider
      value={{
        orcamentos,
        addOrcamento,
        updateOrcamento,
        converterOrcamentoEmOrdem,
        ordens,
        addOrdem,
        updateOrdem,
        iniciarProducao,
        concluirProducao,
        solicitacoes,
        addSolicitacao,
        updateSolicitacao,
        verificarNecessidadeCompra,
        movimentacoes,
        verificarDisponibilidade,
        reservarMateriais,
        consumirMateriais
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow deve ser usado dentro de um WorkflowProvider");
  }
  return context;
}
