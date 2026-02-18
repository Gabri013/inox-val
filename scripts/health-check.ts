#!/usr/bin/env node
import { healthCheckService } from '../src/domains/systemOrchestrator/healthCheck';

async function runHealthCheck() {
  console.log('Running health check...');
  
  try {
    const result = await healthCheckService.performHealthCheck();
    
    console.log(`\nHealth Check Result: ${result.healthy ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Timestamp: ${result.timestamp.toISOString()}`);
    console.log(`\nDetailed Results:`);
    
    result.checks.forEach(check => {
      const status = check.passed ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${check.message}`);
      
      if (check.details) {
        const detailsStr = JSON.stringify(check.details, null, 2);
        console.log(`   Details: ${detailsStr}`);
      }
    });
    
    if (!result.healthy) {
      const failedChecks = result.checks.filter(check => !check.passed);
      console.log(`\n❌ Health check failed with ${failedChecks.length} errors`);
      process.exit(1);
    }
    
    console.log(`\n✅ All checks passed`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error during health check:`, error);
    process.exit(1);
  }
}

runHealthCheck();
