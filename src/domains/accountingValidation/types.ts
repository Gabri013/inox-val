export type TaxRegime = 'SIMPLES' | 'PRESUMIDO' | 'REAL';

export interface CostClassification {
  directMaterials: number;
  directLabor: number;
  indirectMaterials: number;
  indirectLabor: number;
  overhead: number;
  otherExpenses: number;
  totalCost: number;
}

export interface FiscalSimulationResult {
  regime: TaxRegime;
  totalRevenue: number;
  totalCost: number;
  taxableIncome: number;
  taxPayable: number;
  netProfit: number;
  effectiveTaxRate: number;
}

export interface AccountingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  costClassification: CostClassification;
  fiscalSimulations: FiscalSimulationResult[];
  realProfitMeetsTarget: boolean;
  fiscalProfitPositive: boolean;
}

export interface AccountingValidationConfig {
  profitTarget: number; // Percentage
  minFiscalProfit: number; // Minimum acceptable fiscal profit
}

export interface QuoteCostData {
  materials: number;
  labor: number;
  overhead: number;
  otherExpenses: number;
  totalRevenue: number;
}
