#!/usr/bin/env node

import { getCorporateValidationService } from '../src/domains/corporateValidation/corporateValidation.service';
import { CorporateValidationInput } from '../src/domains/corporateValidation/types';

// Sample input for validation - in real scenario, this would be fetched from database or API
const sampleInput: CorporateValidationInput = {
  quoteId: 'QUO-2024-001',
  quoteContent: `
    Orçamento #QUO-2024-001
    Data: 2024-01-15
    Validade do preço: 2024-02-15
    
    Termos e Condições:
    - Prazo de entrega: 30 dias
    - Forma de pagamento: 50% antecipado, 50% ao término
    - Responsabilidade: Fornecedor se responsabiliza por defeitos de fabricação
    - Garantia: 1 ano
    
    Itens:
    1. Produto A - R$ 1.000,00
    2. Produto B - R$ 2.000,00
    Total: R$ 3.000,00
    
    Desconto: 8%
    Preço final: R$ 2.760,00
  `,
  priceValidityDate: '2024-02-15',
  discountPercentage: 8,
  discountApproved: true,
  clientAcceptanceTimestamp: new Date().toISOString(),

  costData: {
    materials: 1500,
    labor: 800,
    overhead: 400,
    otherExpenses: 200,
    totalRevenue: 3000
  },

  securityData: {
    finalPrice: 2760,
    calculatedPrice: 2760,
    marginPercentage: 15.22,
    discountPercentage: 8,
    totalCost: 2900,
    originalMaterials: ['AÇO INOX 304', 'AÇO CARBONO'],
    actualMaterials: ['AÇO INOX 304', 'AÇO CARBONO'],
    manualChanges: 0
  },

  userId: 'USER-123',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  versionedItems: [
    {
      id: 'TMPL-001',
      type: 'TEMPLATE',
      version: '1.0.0',
      name: 'Orçamento Padrão'
    },
    {
      id: 'PROC-001',
      type: 'PROCESS',
      version: '2.1.3',
      name: 'Corte Laser'
    },
    {
      id: 'MAT-001',
      type: 'MATERIAL',
      version: '1.2.0',
      name: 'AÇO INOX 304'
    },
    {
      id: 'SET-001',
      type: 'SETTING',
      version: '3.0.1',
      name: 'Configurações de Preço'
    },
    {
      id: 'CAL-001',
      type: 'CALIBRATION_FACTOR',
      version: '1.0.5',
      name: 'Fator de Calibração Laser'
    }
  ],

  changelog: [
    {
      id: 'CL-001',
      itemId: 'TMPL-001',
      itemType: 'TEMPLATE',
      versionBefore: '0.9.0',
      versionAfter: '1.0.0',
      changeReason: 'Atualização de termos e condições',
      userId: 'ADM-001',
      timestamp: '2024-01-10T10:30:00Z',
      details: 'Adicionadas cláusulas de responsabilidade e garantia'
    },
    {
      id: 'CL-002',
      itemId: 'PROC-001',
      itemType: 'PROCESS',
      versionBefore: '2.1.2',
      versionAfter: '2.1.3',
      changeReason: 'Otimização de processo',
      userId: 'ENG-001',
      timestamp: '2024-01-12T14:45:00Z',
      details: 'Ajuste na velocidade de corte para melhor qualidade'
    }
  ]
};

console.log('🔍 Starting corporate validation process...');
console.log('📄 Validating quote:', sampleInput.quoteId);
console.log('');

try {
  // Run validation
  const validationService = getCorporateValidationService();
  const result = validationService.validate(sampleInput);

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
