import * as fs from 'fs';
import * as path from 'path';
import { getCommercialComplianceService } from '../commercialCompliance/commercialCompliance.service';
import { getAccountingValidationService } from '../accountingValidation/accountingValidation.service';
import { getSecurityAuditService } from '../securityAudit/securityAudit.service';
import { getTraceabilityService } from '../traceability/traceability.service';
import { CorporateValidationInput, CorporateValidationResult } from './types';

export class CorporateValidationService {
  validate(input: CorporateValidationInput): CorporateValidationResult {
    // Validate each module
    const commercialResult = getCommercialComplianceService().validateQuote(
      input.quoteId,
      input.quoteContent,
      input.priceValidityDate,
      input.discountPercentage,
      input.discountApproved,
      input.clientAcceptanceTimestamp
    );

    const accountingResult = getAccountingValidationService().validateQuote(input.costData);

    const securityResult = getSecurityAuditService().validateQuote(
      input.quoteId,
      input.securityData,
      input.userId,
      input.ipAddress,
      input.userAgent
    );

    const traceabilityResult = getTraceabilityService().validateQuote(
      input.versionedItems as Array<{
        id: string;
        type: 'TEMPLATE' | 'PROCESS' | 'MATERIAL' | 'SETTING' | 'CALIBRATION_FACTOR';
        version: string;
        name: string;
      }>,
      input.changelog as Array<{
        id: string;
        itemId: string;
        itemType: 'TEMPLATE' | 'PROCESS' | 'MATERIAL' | 'SETTING' | 'CALIBRATION_FACTOR';
        versionBefore: string;
        versionAfter: string;
        changeReason: string;
        userId: string;
        timestamp: string;
        details: string;
      }>
    );

    // Calculate overall result
    const allValid = [
      commercialResult.isValid,
      accountingResult.isValid,
      securityResult.isValid,
      traceabilityResult.isValid
    ].every(valid => valid);

    const failingModules: string[] = [];
    const passingModules: string[] = [];

    if (!commercialResult.isValid) failingModules.push('Commercial Compliance');
    else passingModules.push('Commercial Compliance');

    if (!accountingResult.isValid) failingModules.push('Accounting Validation');
    else passingModules.push('Accounting Validation');

    if (!securityResult.isValid) failingModules.push('Security Audit');
    else passingModules.push('Security Audit');

    if (!traceabilityResult.isValid) failingModules.push('Traceability');
    else passingModules.push('Traceability');

    // Calculate totals
    const totalErrors = 
      commercialResult.errors.length + 
      accountingResult.errors.length + 
      securityResult.errors.length + 
      traceabilityResult.errors.length;

    const totalWarnings = 
      commercialResult.warnings.length + 
      accountingResult.warnings.length + 
      securityResult.warnings.length + 
      traceabilityResult.warnings.length;

    const result: CorporateValidationResult = {
      overallResult: allValid ? 'PASS' : 'FAIL',
      isValid: allValid,
      modules: {
        commercial: commercialResult,
        accounting: accountingResult,
        security: securityResult,
        traceability: traceabilityResult
      },
      summary: {
        totalErrors,
        totalWarnings,
        failingModules,
        passingModules
      },
      generatedAt: new Date().toISOString()
    };

    // Generate the ISO traceability report
    getTraceabilityService().generateISOTraceReport(input.quoteId, traceabilityResult);

    return result;
  }

  generateReport(result: CorporateValidationResult): string {
    const report: string[] = [];
    report.push('# Corporate Validation Report');
    report.push(`## Generated: ${result.generatedAt}`);
    report.push('');
    report.push('## Overall Result');
    report.push(`**${result.overallResult}**`);
    report.push('');
    report.push('## Summary');
    report.push(`- **Total Errors**: ${result.summary.totalErrors}`);
    report.push(`- **Total Warnings**: ${result.summary.totalWarnings}`);
    report.push(`- **Passing Modules**: ${result.summary.passingModules.length}/${result.summary.passingModules.length + result.summary.failingModules.length}`);
    report.push('');

    if (result.summary.passingModules.length > 0) {
      report.push('### Passing Modules');
      result.summary.passingModules.forEach(module => {
        report.push(`- ✅ ${module}`);
      });
      report.push('');
    }

    if (result.summary.failingModules.length > 0) {
      report.push('### Failing Modules');
      result.summary.failingModules.forEach(module => {
        report.push(`- ❌ ${module}`);
      });
      report.push('');
    }

    // Detailed module results
    report.push('## Detailed Results');
    report.push('');

    // Commercial Compliance
    report.push('### Commercial Compliance');
    report.push(`- **Status**: ${result.modules.commercial.isValid ? '✅ PASS' : '❌ FAIL'}`);
    report.push(`- **Terms Accepted**: ${result.modules.commercial.termsAccepted ? 'Yes' : 'No'}`);
    report.push(`- **Price Validity Consistent**: ${result.modules.commercial.priceValidityConsistent ? 'Yes' : 'No'}`);
    report.push(`- **Discount Approval Required**: ${result.modules.commercial.discountApprovalRequired ? 'Yes' : 'No'}`);
    report.push(`- **Discount Approved**: ${result.modules.commercial.discountApproved ? 'Yes' : 'No'}`);
    report.push(`- **Snapshot Hash (SHA256)**: ${result.modules.commercial.snapshotHash}`);
    report.push(`- **HMAC Signature**: ${result.modules.commercial.hmacSignature}`);
    report.push(`- **Client Acceptance**: ${result.modules.commercial.clientAcceptanceTimestamp ? result.modules.commercial.clientAcceptanceTimestamp : 'Not accepted'}`);
    if (result.modules.commercial.errors.length > 0) {
      report.push('');
      report.push('#### Errors');
      result.modules.commercial.errors.forEach(error => {
        report.push(`- ${error}`);
      });
    }
    if (result.modules.commercial.warnings.length > 0) {
      report.push('');
      report.push('#### Warnings');
      result.modules.commercial.warnings.forEach(warning => {
        report.push(`- ${warning}`);
      });
    }
    report.push('');

    // Accounting Validation
    report.push('### Accounting Validation');
    report.push(`- **Status**: ${result.modules.accounting.isValid ? '✅ PASS' : '❌ FAIL'}`);
    report.push(`- **Real Profit Meets Target**: ${result.modules.accounting.realProfitMeetsTarget ? 'Yes' : 'No'}`);
    report.push(`- **Fiscal Profit Positive**: ${result.modules.accounting.fiscalProfitPositive ? 'Yes' : 'No'}`);
    report.push(`- **Total Cost**: R$ ${result.modules.accounting.costClassification.totalCost.toFixed(2)}`);
    report.push(`- **Direct Costs**: R$ ${(result.modules.accounting.costClassification.directMaterials + result.modules.accounting.costClassification.directLabor).toFixed(2)}`);
    report.push(`- **Indirect Costs**: R$ ${(result.modules.accounting.costClassification.indirectMaterials + result.modules.accounting.costClassification.indirectLabor).toFixed(2)}`);
    report.push(`- **Overhead**: R$ ${result.modules.accounting.costClassification.overhead.toFixed(2)}`);
    if (result.modules.accounting.errors.length > 0) {
      report.push('');
      report.push('#### Errors');
      result.modules.accounting.errors.forEach(error => {
        report.push(`- ${error}`);
      });
    }
    if (result.modules.accounting.warnings.length > 0) {
      report.push('');
      report.push('#### Warnings');
      result.modules.accounting.warnings.forEach(warning => {
        report.push(`- ${warning}`);
      });
    }
    report.push('');

    // Security Audit
    report.push('### Security Audit');
    report.push(`- **Status**: ${result.modules.security.isValid ? '✅ PASS' : '❌ FAIL'}`);
    report.push(`- **Fraud Score**: ${result.modules.security.fraudScore.score}/100 (Threshold: ${result.modules.security.fraudScore.threshold})`);
    report.push(`- **Risk Level**: ${result.modules.security.fraudScore.isRisky ? 'High Risk' : 'Low Risk'}`);
    report.push(`- **Manual Price Changes Blocked**: ${result.modules.security.manualPriceChangesBlocked}`);
    report.push(`- **Anomalies Detected**: ${result.modules.security.anomaliesDetected}`);
    if (result.modules.security.errors.length > 0) {
      report.push('');
      report.push('#### Errors');
      result.modules.security.errors.forEach(error => {
        report.push(`- ${error}`);
      });
    }
    if (result.modules.security.warnings.length > 0) {
      report.push('');
      report.push('#### Warnings');
      result.modules.security.warnings.forEach(warning => {
        report.push(`- ${warning}`);
      });
    }
    report.push('');

    // Traceability
    report.push('### Traceability');
    report.push(`- **Status**: ${result.modules.traceability.isValid ? '✅ PASS' : '❌ FAIL'}`);
    report.push(`- **All Items Versioned**: ${result.modules.traceability.allItemsVersioned ? 'Yes' : 'No'}`);
    report.push(`- **Complete Changelog**: ${result.modules.traceability.hasCompleteChangelog ? 'Yes' : 'No'}`);
    report.push(`- **Versioned Items**: ${result.modules.traceability.versionedItems.length}`);
    report.push(`- **Changelog Entries**: ${result.modules.traceability.changelog.length}`);
    if (result.modules.traceability.errors.length > 0) {
      report.push('');
      report.push('#### Errors');
      result.modules.traceability.errors.forEach(error => {
        report.push(`- ${error}`);
      });
    }
    if (result.modules.traceability.warnings.length > 0) {
      report.push('');
      report.push('#### Warnings');
      result.modules.traceability.warnings.forEach(warning => {
        report.push(`- ${warning}`);
      });
    }
    report.push('');

    return report.join('\n');
  }

  saveReport(result: CorporateValidationResult, outputPath: string = 'CORPORATE_VALIDATION_REPORT.md'): string {
    const reportContent = this.generateReport(result);
    fs.writeFileSync(outputPath, reportContent);
    return outputPath;
  }
}

// Singleton instance
let instance: CorporateValidationService | null = null;
export function getCorporateValidationService(): CorporateValidationService {
  if (!instance) {
    instance = new CorporateValidationService();
  }
  return instance;
}
