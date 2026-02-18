import { TransitionGuard, OrchestratorContext, GuardResult, WorkflowState } from './types';

export const guards: Record<WorkflowState, TransitionGuard[]> = {
  [WorkflowState.DRAFT]: [],
  [WorkflowState.CALCULATED]: [],
  [WorkflowState.VALIDATED]: [],
  [WorkflowState.CORPORATE_OK]: [],
  [WorkflowState.APPROVED]: [],
  [WorkflowState.FINALIZED]: [
    {
      name: "activePriceCheck",
      description: "Verificar se todos os materiais têm preço ativo",
      severity: "block",
      check: async (context: OrchestratorContext): Promise<GuardResult> => {
        if (!context.snapshot?.materials) {
          return { passed: false, message: "Nenhum material encontrado no snapshot" };
        }
        
        const materialsWithActivePrice = context.snapshot.materials.filter(
          (material: any) => material.price && material.price > 0 && material.isActive !== false
        );
        
        if (materialsWithActivePrice.length !== context.snapshot.materials.length) {
          return { 
            passed: false, 
            message: `Existem ${context.snapshot.materials.length - materialsWithActivePrice.length} materiais sem preço ativo` 
          };
        }
        
        return { passed: true };
      }
    },
    {
      name: "nestingCheck",
      description: "Verificar se o nesting está completo",
      severity: "block",
      check: async (context: OrchestratorContext): Promise<GuardResult> => {
        if (!context.snapshot?.nesting) {
          return { passed: false, message: "Nenhum nesting encontrado no snapshot" };
        }
        
        if (!context.snapshot.nesting.isComplete) {
          return { passed: false, message: "Nesting não está completo" };
        }
        
        return { passed: true };
      }
    }
  ],
  [WorkflowState.DELIVERED]: [],
  [WorkflowState.IN_PRODUCTION]: [],
  [WorkflowState.CLOSED]: []
};

export const pdfGenerationGuards: TransitionGuard[] = [
  {
    name: "commercialTermsCheck",
    description: "Verificar se os termos comerciais estão presentes",
    severity: "block",
    check: async (context: OrchestratorContext): Promise<GuardResult> => {
      if (!context.snapshot?.commercialTerms) {
        return { passed: false, message: "Termos comerciais não encontrados" };
      }
      
      if (!context.snapshot.commercialTerms.terms || context.snapshot.commercialTerms.terms.trim() === "") {
        return { passed: false, message: "Termos comerciais estão vazios" };
      }
      
      return { passed: true };
    }
  }
];

export const approvalGuards: TransitionGuard[] = [
  {
    name: "discountCheck",
    description: "Verificar se o desconto é excessivamente alto",
    severity: "block",
    check: async (context: OrchestratorContext): Promise<GuardResult> => {
      if (!context.snapshot?.pricing) {
        return { passed: false, message: "Informações de precificação não encontradas" };
      }
      
      const discountThreshold = 30; // 30% threshold
      if (context.snapshot.pricing.discount > discountThreshold) {
        return { 
          passed: false, 
          message: `Desconto de ${context.snapshot.pricing.discount}% é maior que o limite permitido de ${discountThreshold}%` 
        };
      }
      
      return { passed: true };
    }
  }
];
