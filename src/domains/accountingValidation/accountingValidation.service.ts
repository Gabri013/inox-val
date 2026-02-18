import {
  AccountingValidationConfig,
  AccountingValidationResult,
  CostClassification,
  FiscalSimulationResult,
  QuoteCostData,
  TaxRegime
} from './types';

export class AccountingValidationService {
  private config: AccountingValidationConfig;

  constructor(config: AccountingValidationConfig) {
    this.config = config;
  }

  validateQuote(costData: QuoteCostData): AccountingValidationResult {
    const costClassification = this.classifyCosts(costData);
    const fiscalSimulations = this.simulateFiscalRegimes(costData, costClassification);

    const result: AccountingValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      costClassification,
      fiscalSimulations,
      realProfitMeetsTarget: false,
      fiscalProfitPositive: true
    };

    // Check real profit target
    const realProfitMargin = this.calculateRealProfitMargin(costData);
    if (realProfitMargin < this.config.profitTarget) {
      result.isValid = false;
      result.errors.push(
        `Real profit margin of ${realProfitMargin.toFixed(2)}% is below target of ${this.config.profitTarget}%`
      );
    } else {
      result.realProfitMeetsTarget = true;
    }

    // Check fiscal profit
    const fiscalProfitNegative = fiscalSimulations.some(sim => sim.netProfit < this.config.minFiscalProfit);
    if (fiscalProfitNegative) {
      result.isValid = false;
      result.errors.push('Negative fiscal profit detected');
      result.fiscalProfitPositive = false;
    }

    return result;
  }

  private classifyCosts(costData: QuoteCostData): CostClassification {
    // Simple classification based on common industry standards
    const directMaterials = costData.materials * 0.7; // 70% of materials as direct
    const indirectMaterials = costData.materials * 0.3; // 30% as indirect
    const directLabor = costData.labor * 0.8; // 80% of labor as direct
    const indirectLabor = costData.labor * 0.2; // 20% as indirect

    return {
      directMaterials,
      directLabor,
      indirectMaterials,
      indirectLabor,
      overhead: costData.overhead,
      otherExpenses: costData.otherExpenses,
      totalCost: costData.materials + costData.labor + costData.overhead + costData.otherExpenses
    };
  }

  private simulateFiscalRegimes(
    costData: QuoteCostData,
    classification: CostClassification
  ): FiscalSimulationResult[] {
    const regimes: TaxRegime[] = ['SIMPLES', 'PRESUMIDO', 'REAL'];
    return regimes.map(regime => this.simulateRegime(regime, costData, classification));
  }

  private simulateRegime(
    regime: TaxRegime,
    costData: QuoteCostData,
    classification: CostClassification
  ): FiscalSimulationResult {
    switch (regime) {
      case 'SIMPLES':
        return this.simulateSimplesNacional(costData);
      case 'PRESUMIDO':
        return this.simulateLucroPresumido(costData, classification);
      case 'REAL':
        return this.simulateLucroReal(costData, classification);
      default:
        throw new Error(`Unsupported tax regime: ${regime}`);
    }
  }

  private simulateSimplesNacional(costData: QuoteCostData): FiscalSimulationResult {
    const totalRevenue = costData.totalRevenue;
    const totalCost = costData.materials + costData.labor + costData.overhead + costData.otherExpenses;
    const profit = totalRevenue - totalCost;

    // Simple Nacional rate (simplified calculation)
    const taxRate = totalRevenue <= 2_000_000 ? 0.12 : 0.18;
    const taxPayable = totalRevenue * taxRate;
    const netProfit = profit - taxPayable;

    return {
      regime: 'SIMPLES',
      totalRevenue,
      totalCost,
      taxableIncome: profit,
      taxPayable,
      netProfit,
      effectiveTaxRate: (taxPayable / totalRevenue) * 100
    };
  }

  private simulateLucroPresumido(
    costData: QuoteCostData,
    classification: CostClassification
  ): FiscalSimulationResult {
    const totalRevenue = costData.totalRevenue;
    const totalCost = costData.materials + costData.labor + costData.overhead + costData.otherExpenses;
    const profit = totalRevenue - totalCost;

    // Lucro Presumido rate for services (simplified)
    const taxRate = 0.25;
    const taxPayable = totalRevenue * taxRate;
    const netProfit = profit - taxPayable;

    return {
      regime: 'PRESUMIDO',
      totalRevenue,
      totalCost,
      taxableIncome: profit,
      taxPayable,
      netProfit,
      effectiveTaxRate: (taxPayable / totalRevenue) * 100
    };
  }

  private simulateLucroReal(
    costData: QuoteCostData,
    classification: CostClassification
  ): FiscalSimulationResult {
    const totalRevenue = costData.totalRevenue;
    const totalCost = costData.materials + costData.labor + costData.overhead + costData.otherExpenses;
    const profit = totalRevenue - totalCost;

    // Lucro Real calculation (simplified)
    const taxRate = 0.34;
    const taxPayable = profit * taxRate;
    const netProfit = profit - taxPayable;

    return {
      regime: 'REAL',
      totalRevenue,
      totalCost,
      taxableIncome: profit,
      taxPayable,
      netProfit,
      effectiveTaxRate: (taxPayable / totalRevenue) * 100
    };
  }

  private calculateRealProfitMargin(costData: QuoteCostData): number {
    const totalCost = costData.materials + costData.labor + costData.overhead + costData.otherExpenses;
    const profit = costData.totalRevenue - totalCost;
    return (profit / costData.totalRevenue) * 100;
  }
}

// Default configuration
export const defaultAccountingConfig: AccountingValidationConfig = {
  profitTarget: 15, // 15%
  minFiscalProfit: 0 // Positive fiscal profit required
};

// Singleton instance
let instance: AccountingValidationService | null = null;
export function getAccountingValidationService(): AccountingValidationService {
  if (!instance) {
    instance = new AccountingValidationService(defaultAccountingConfig);
  }
  return instance;
}
