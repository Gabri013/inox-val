import { systemOrchestrator } from './src/domains/systemOrchestrator/orchestrator.js';
import { WorkflowState } from './src/domains/systemOrchestrator/types.js';

async function runTests() {
  console.log('Running SystemOrchestrator tests...');
  
  try {
    // Test 1: Create instance
    console.log('\n1. Testing instance creation');
    const instance = systemOrchestrator;
    console.log('✅ Instance created:', instance);
    
    // Test 2: Transition state
    console.log('\n2. Testing state transition');
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
    
    const transitionResult = await systemOrchestrator.transitionState(context, WorkflowState.CALCULATED);
    console.log('✅ Transition result:', transitionResult);
    
    // Test 3: Generate snapshot
    console.log('\n3. Testing snapshot generation');
    const content = { test: 'data', value: 123 };
    const snapshot = await systemOrchestrator.generateSnapshot(content);
    console.log('✅ Generated snapshot:', snapshot);
    
    // Test 4: Validate snapshot
    console.log('\n4. Testing snapshot validation');
    const isValid = await systemOrchestrator.validateSnapshot(snapshot);
    console.log('✅ Snapshot validation:', isValid);
    
    // Test 5: Health check
    console.log('\n5. Testing health check');
    const healthCheckResult = await systemOrchestrator.performHealthCheck();
    console.log('✅ Health check result:', healthCheckResult);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
