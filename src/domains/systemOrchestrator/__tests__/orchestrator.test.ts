import { describe, it, expect } from 'vitest';
import { systemOrchestrator } from '../orchestrator';
import { WorkflowState } from '../types';

describe('SystemOrchestrator', () => {
  describe('transitionState', () => {
    it('should transition from DRAFT to CALCULATED', async () => {
      const context = {
        quoteId: 'test-quote-1',
        state: WorkflowState.DRAFT,
        user: 'test-user',
        snapshot: {
          materials: [],
          nesting: { isComplete: true },
          pricing: { discount: 10 },
          commercialTerms: { terms: 'Test terms' }
        }
      };

      const result = await systemOrchestrator.transitionState(context, WorkflowState.CALCULATED);
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(WorkflowState.CALCULATED);
    });

    it('should block transition to FINALIZED without active materials', async () => {
      const context = {
        quoteId: 'test-quote-2',
        state: WorkflowState.APPROVED,
        user: 'test-user',
        snapshot: {
          materials: [
            { id: '1', price: 0, isActive: true },
            { id: '2', price: 100, isActive: false }
          ],
          nesting: { isComplete: true },
          pricing: { discount: 10 },
          commercialTerms: { terms: 'Test terms' }
        }
      };

      const result = await systemOrchestrator.transitionState(context, WorkflowState.FINALIZED);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('materiais sem preço ativo');
    });

    it('should block transition to FINALIZED without nesting', async () => {
      const context = {
        quoteId: 'test-quote-3',
        state: WorkflowState.APPROVED,
        user: 'test-user',
        snapshot: {
          materials: [
            { id: '1', price: 100, isActive: true },
            { id: '2', price: 200, isActive: true }
          ],
          nesting: { isComplete: false },
          pricing: { discount: 10 },
          commercialTerms: { terms: 'Test terms' }
        }
      };

      const result = await systemOrchestrator.transitionState(context, WorkflowState.FINALIZED);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Nesting não está completo');
    });

    it('should block transition to APPROVED with high discount', async () => {
      const context = {
        quoteId: 'test-quote-4',
        state: WorkflowState.CORPORATE_OK,
        user: 'test-user',
        snapshot: {
          materials: [
            { id: '1', price: 100, isActive: true },
            { id: '2', price: 200, isActive: true }
          ],
          nesting: { isComplete: true },
          pricing: { discount: 35 },
          commercialTerms: { terms: 'Test terms' }
        }
      };

      const result = await systemOrchestrator.transitionState(context, WorkflowState.APPROVED);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Desconto de 35% é maior que o limite permitido de 30%');
    });
  });

  describe('generateSnapshot', () => {
    it('should generate a valid snapshot with SHA256 hash', async () => {
      const content = { test: 'data', value: 123 };
      const snapshot = await systemOrchestrator.generateSnapshot(content);
      
      expect(snapshot.id).toBeDefined();
      expect(snapshot.content).toEqual(content);
      expect(snapshot.sha256).toBeDefined();
      expect(snapshot.timestamp).toBeInstanceOf(Date);
    });

    it('should validate snapshot integrity', async () => {
      const content = { test: 'data', value: 123 };
      const snapshot = await systemOrchestrator.generateSnapshot(content);
      const isValid = await systemOrchestrator.validateSnapshot(snapshot);
      
      expect(isValid).toBe(true);
    });

    it('should detect invalid snapshot', async () => {
      const content = { test: 'data', value: 123 };
      const snapshot = await systemOrchestrator.generateSnapshot(content);
      snapshot.content = { test: 'modified', value: 456 };
      const isValid = await systemOrchestrator.validateSnapshot(snapshot);
      
      expect(isValid).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should perform health check', async () => {
      const result = await systemOrchestrator.performHealthCheck();
      
      expect(result.healthy).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.checks.length).toBeGreaterThan(0);
    });
  });

  describe('validateAll', () => {
    it('should run validate-all process', async () => {
      const result = await systemOrchestrator.validateAll();
      
      expect(result.passed).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });
  });
});
