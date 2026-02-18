#!/usr/bin/env node
import { loadEnv } from './_loadEnv';
loadEnv();

import { getCorporateValidationService } from '../src/domains/corporateValidation/corporateValidation.service';
import { CorporateValidationInput } from '../src/domains/corporateValidation/types';
import fs from 'fs';
import path from 'path';

// Parse CLI arguments for snapshot file
const args = process.argv.slice(2);
const snapshotArg = args.find(arg => arg.startsWith('snapshot='));
const snapshotPath = snapshotArg ? snapshotArg.split('=')[1] : null;

// Load snapshot data
let input: CorporateValidationInput;

if (snapshotPath) {
  console.log('🔍 Loading snapshot from:', snapshotPath);
  try {
    const snapshotContent = fs.readFileSync(snapshotPath, 'utf8');
    input = JSON.parse(snapshotContent);
  } catch (error) {
    console.error('❌ Error reading snapshot file:', error);
    process.exit(1);
  }
} else {
  console.error('❌ No snapshot file provided. Usage: npm run corporate-validate -- snapshot=path/to/snapshot.json');
  process.exit(1);
}

console.log('🔍 Starting corporate validation process...');
console.log('📄 Validating quote:', input.quoteId);
console.log('');

try {
  // Run validation
  const validationService = getCorporateValidationService();
  const result = validationService.validate(input);

  // Save report
  const reportPath = validationService.saveReport(result);

  console.log('✅ Validation completed!');
  console.log('📊 Overall Result:', result.overallResult);
  console.log('📝 Report generated at:', reportPath);
  console.log('');
  console.log('📈 Summary:');
  console.log(`   - Total Errors: ${result.summary.totalErrors}`);
  console.log(`   - Total Warnings: ${result.summary.totalWarnings}`);
  console.log(`   - Passing Modules: ${result.summary.passingModules.length}`);
  console.log(`   - Failing Modules: ${result.summary.failingModules.length}`);
  console.log('');

  if (result.summary.failingModules.length > 0) {
    console.log('❌ Failing Modules:');
    result.summary.failingModules.forEach(module => {
      console.log(`   - ${module}`);
    });
    console.log('');
  }

  if (result.overallResult === 'FAIL') {
    process.exit(1);
  } else {
    process.exit(0);
  }

} catch (error) {
  console.error('❌ Validation failed:');
  console.error(error);
  process.exit(1);
}
