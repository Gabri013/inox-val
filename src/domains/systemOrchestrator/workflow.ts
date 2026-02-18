import { WorkflowState, OrchestratorContext, TransitionResult, GuardResult, AuditEvent } from './types';
import { guards, approvalGuards } from './guards';
import { auditService } from './audit';

const stateTransitions: Record<WorkflowState, WorkflowState[]> = {
  [WorkflowState.DRAFT]: [WorkflowState.CALCULATED],
  [WorkflowState.CALCULATED]: [WorkflowState.VALIDATED, WorkflowState.DRAFT],
  [WorkflowState.VALIDATED]: [WorkflowState.CORPORATE_OK, WorkflowState.CALCULATED],
  [WorkflowState.CORPORATE_OK]: [WorkflowState.APPROVED, WorkflowState.VALIDATED],
  [WorkflowState.APPROVED]: [WorkflowState.FINALIZED, WorkflowState.CORPORATE_OK],
  [WorkflowState.FINALIZED]: [WorkflowState.DELIVERED, WorkflowState.APPROVED],
  [WorkflowState.DELIVERED]: [WorkflowState.IN_PRODUCTION, WorkflowState.FINALIZED],
  [WorkflowState.IN_PRODUCTION]: [WorkflowState.CLOSED, WorkflowState.DELIVERED],
  [WorkflowState.CLOSED]: []
};

export class WorkflowEngine {
  async transition(
    context: OrchestratorContext,
    targetState: WorkflowState
  ): Promise<TransitionResult> {
    const events: AuditEvent[] = [];
    const guardResults: GuardResult[] = [];

    events.push(auditService.createEvent(context, 'TRANSITION_START', context.state, targetState));

    try {
      if (!this.isValidTransition(context.state, targetState)) {
        throw new Error(`Transição inválida: ${context.state} -> ${targetState}`);
      }

      const transitionGuards = this.getGuardsForTransition(context.state, targetState);
      
      for (const guard of transitionGuards) {
        const result = await guard.check(context);
        guardResults.push(result);
        
        if (!result.passed && guard.severity === 'block') {
          events.push(auditService.createEvent(context, 'TRANSITION_BLOCKED', context.state, targetState, {
            guard: guard.name,
            reason: result.message,
            details: result.details
          }));
          
          return {
            success: false,
            guards: guardResults,
            events,
            error: `Transição bloqueada por: ${result.message}`
          };
        }
      }

      events.push(auditService.createEvent(context, 'TRANSITION_COMPLETED', context.state, targetState));

      return {
        success: true,
        newState: targetState,
        guards: guardResults,
        events
      };
    } catch (error) {
      events.push(auditService.createEvent(context, 'TRANSITION_FAILED', context.state, targetState, {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
      
      return {
        success: false,
        guards: guardResults,
        events,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private isValidTransition(fromState: WorkflowState, toState: WorkflowState): boolean {
    return stateTransitions[fromState].includes(toState);
  }

  private getGuardsForTransition(_fromState: WorkflowState, toState: WorkflowState): any[] {
    const transitionGuards: any[] = [];
    
    if (toState === WorkflowState.FINALIZED) {
      transitionGuards.push(...guards[WorkflowState.FINALIZED]);
    }
    
    if (toState === WorkflowState.APPROVED) {
      transitionGuards.push(...approvalGuards);
    }
    
    if (toState === WorkflowState.VALIDATED) {
      transitionGuards.push(...guards[WorkflowState.VALIDATED]);
    }
    
    return transitionGuards;
  }

  canTransition(fromState: WorkflowState, toState: WorkflowState): boolean {
    return stateTransitions[fromState].includes(toState);
  }

  getValidTransitions(state: WorkflowState): WorkflowState[] {
    return stateTransitions[state];
  }
}

export const workflowEngine = new WorkflowEngine();
