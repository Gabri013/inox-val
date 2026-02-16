// Tipos auxiliares para custos indiretos e margens
export interface CustosIndiretos {
  frete?: number;
  impostos?: number;
  outros?: number;
}

export interface MargemLucroConfig {
  percentual: number; // Ex: 0.15 para 15%
  minimoAbsoluto?: number; // Valor mínimo absoluto de lucro
}
