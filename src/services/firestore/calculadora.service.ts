import { FirestoreService } from "./base";
import { COLLECTIONS } from "@/types/firebase";

export interface CalculoEvento {
  id: string;
  empresaId: string;
  userId: string;
  timestamp: any;
  modelo: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  configSnapshot: {
    configCustosId?: string;
    versaoCustos?: number;
    configCalcId?: string;
    versaoCalc?: number;
  };
  durationMs?: number;
}

class CalculadoraService extends FirestoreService<CalculoEvento> {
  constructor() {
    super(COLLECTIONS.calculos, { softDelete: false });
  }
}

export const calculadoraService = new CalculadoraService();
