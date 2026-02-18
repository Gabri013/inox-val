import { loadEnv } from '../_loadEnv';
loadEnv();

import { writeValidationReport } from './report';
import { validateEnvironment, validateBuild } from './validators/env';
import { validateFirestore } from './validators/firestore';
import { validateMaterials } from './validators/materials';
import { validateProcesses } from './validators/processes';
import { validateSettings } from './validators/settings';
import { validateTemplates } from './validators/templates';
import { validatePresets } from './validators/presets';
import { validateE2EFlow } from './validators/e2e';
import { validateSnapshots } from './validators/snapshots';
import { validatePDF } from './validators/pdf';
import { validatePurchasing } from './validators/purchasing';
import { validateProduction } from './validators/production';
import { validateSecurity } from './validators/security';
import { validatePerformance } from './validators/performance';
import { validateMemoization } from './validators/memoization';
import { ValidationResult, ValidatorResult } from './types';

export async function runAllValidations(): Promise<ValidationResult> {
  const validators = [
    validateEnvironment,
    validateBuild,
    validateFirestore,
    validateMaterials,
    validateProcesses,
    validateSettings,
    validateTemplates,
    validatePresets,
    validateE2EFlow,
    validateSnapshots,
    validatePDF,
    validatePurchasing,
    validateProduction,
    validateSecurity,
    validatePerformance,
    validateMemoization
  ];

  console.log('Iniciando validação completa...');
  console.log(`Total de validadores: ${validators.length}`);
  console.log('--------------------------');

  const results = await Promise.all(validators.map(async validator => {
    console.log(`Executando: ${validator.name}...`);
    try {
      const result = await validator();
      console.log(`✅ ${validator.name} - ${result.status} (${result.duration}ms)`);
      return {
        name: validator.name,
        ...result
      };
    } catch (error) {
      console.log(`❌ ${validator.name} - failed: ${error.message}`);
      return {
        name: validator.name,
        status: 'failed' as const,
        error: error.message || 'Unknown error',
        duration: 0
      };
    }
  }));

  console.log('--------------------------');
  const allPass = results.every(r => r.status === 'passed');
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  console.log(`Resultado final: ${allPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Passados: ${passed} | Falhos: ${failed} | Avisos: ${warnings}`);

  return {
    timestamp: new Date().toISOString(),
    results,
    allPass
  };
}

// Check if we're running this file directly
const isMain = process.argv[1] && process.argv[1].endsWith('index.ts');
if (isMain) {
  runAllValidations()
    .then((result) => {
      writeValidationReport(result);
      process.exit(result.allPass ? 0 : 1);
    })
    .catch((error) => {
      console.error('Erro durante a validação:', error);
      process.exit(1);
    });
}
