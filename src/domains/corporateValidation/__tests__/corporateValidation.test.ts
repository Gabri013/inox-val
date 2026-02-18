import { describe, it, expect } from 'vitest';
import { CorporateValidationService } from '../corporateValidation.service';

describe('CorporateValidationService', () => {
  describe('generateReport', () => {
    it('should generate a valid report', () => {
      // Mock data
      const validationService = new CorporateValidationService();
      
      const mockResult = {
        overallResult: 'PASS' as const,
        isValid: true,
        modules: {
          commercial: {
            isValid: true,
            errors: [],
            warnings: [],
            termsAccepted: true,
            priceValidityConsistent: true,
            discountApprovalRequired: false,
            discountApproved: true,
            snapshotHash: 'abc123',
            hmacSignature: 'def456',
            clientAcceptanceTimestamp: '2024-01-15T10:30:00Z'
          },
          accounting: {
            isValid: true,
            errors: [],
            warnings: [],
            costClassification: {
              directMaterials: 1000,
              directLabor: 500,
              indirectMaterials: 200,
              indirectLabor: 100,
              overhead: 300,
              otherExpenses: 50,
              totalCost: 2150
            },
              fiscalSimulations: [
                {
                  regime: 'SIMPLES' as const,
                  totalRevenue: 3000,
                  totalCost: 2150,
                  taxableIncome: 850,
                  taxPayable: 360,
                  netProfit: 490,
                  effectiveTaxRate: 12
                }
              ],
            realProfitMeetsTarget: true,
            fiscalProfitPositive: true
          },
          security: {
            isValid: true,
            errors: [],
            warnings: [],
            fraudScore: {
              score: 25,
              threshold: 70,
              isRisky: false,
              factors: []
            },
            events: [],
            manualPriceChangesBlocked: 0,
            anomaliesDetected: 0
          },
          traceability: {
            isValid: true,
            errors: [],
            warnings: [],
            versionedItems: [
                {
                  id: 'TMPL-001',
                  type: 'TEMPLATE' as const,
                  version: '1.0.0',
                  name: 'Orçamento Padrão'
                }
              ],
            changelog: [],
            allItemsVersioned: true,
            hasCompleteChangelog: true
          }
        },
        summary: {
          totalErrors: 0,
          totalWarnings: 0,
          failingModules: [],
          passingModules: ['Commercial Compliance', 'Accounting Validation', 'Security Audit', 'Traceability']
        },
        generatedAt: '2024-01-15T10:30:00Z'
      };

      const report = validationService.generateReport(mockResult);
      
      // Verify report contains key sections
      expect(report).toContain('# Corporate Validation Report');
      expect(report).toContain('## Overall Result');
      expect(report).toContain('**PASS**');
      expect(report).toContain('## Detailed Results');
      expect(report).toContain('### Commercial Compliance');
      expect(report).toContain('### Accounting Validation');
      expect(report).toContain('### Security Audit');
      expect(report).toContain('### Traceability');
    });
  });
});
