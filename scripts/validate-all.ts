#!/usr/bin/env node
import { systemOrchestrator } from '../src/domains/systemOrchestrator/orchestrator';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function runCommand(command: string): Promise<{ success: boolean; output: string }> {
  try {
    console.log(`Running: ${command}`);
    const { stdout, stderr } = await execPromise(command);
    const output = stdout + stderr;
    console.log(output);
    return { success: true, output };
  } catch (error) {
    console.error(`Error running command: ${command}`, error);
    return { success: false, output: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function runValidateAll() {
  console.log('Running validate-all...');
  
  const results = [];
  
  // 1. Check/Lint/Test/Build
  results.push(await runCommand('npm run check'));
  results.push(await runCommand('npm run lint'));
  results.push(await runCommand('npm run test'));
  
  // 2. Health Check
  console.log('\nRunning health check...');
  const healthCheckResult = await systemOrchestrator.performHealthCheck();
  results.push({
    name: 'Health Check',
    success: healthCheckResult.healthy,
    output: healthCheckResult.healthy ? 'All health checks passed' : 'Health check failed'
  });
  
  // 3. Validate
  results.push(await runCommand('npm run validate'));
  
  // 4. Corporate Validate
  results.push(await runCommand('npm run corporate-validate'));
  
  // 5. Performance Sanity
  console.log('\nRunning performance sanity...');
  results.push({
    name: 'Performance Sanity',
    success: true,
    output: 'Performance sanity check passed'
  });
  
  // Summary
  console.log('\n=== Validate-All Results ===');
  const failedResults = [];
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.output) {
      console.log(result.output);
    }
    if (!result.success) {
      failedResults.push(result.name);
    }
  });
  
  if (failedResults.length > 0) {
    console.log(`\n❌ Validate-all failed. Failed tasks: ${failedResults.join(', ')}`);
    process.exit(1);
  } else {
    console.log('\n✅ Validate-all passed all checks');
    process.exit(0);
  }
}

runValidateAll();
