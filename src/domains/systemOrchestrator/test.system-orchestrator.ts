import { describe, it, expect } from 'vitest';
import { systemOrchestrator } from './orchestrator';
import { WorkflowState } from './types';

describe('SystemOrchestrator', () => {
  it('should create an instance of SystemOrchestrator', () => {
    expect(systemOrchestrator).toBeDefined();
  });

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

  it('should generate a valid snapshot', async () => {
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

  it('should perform health check', async () => {
    const result = await systemOrchestrator.performHealthCheck();
    
    expect(result.healthy).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.checks.length).toBeGreaterThan(0);
  });
});
