// Base para machine learning de previsão de preços
// Exemplo: regressão linear simples usando dados históricos
// Requer instalação de pacote 'ml-regression'
// npm install ml-regression

import { SLR } from 'ml-regression';

export function treinarModeloPreco({ historico }: { historico: Array<{ custo: number; preco: number }> }) {
  const custos = historico.map(h => h.custo);
  const precos = historico.map(h => h.preco);
  const modelo = new SLR(custos, precos);
  return modelo;
}

export function preverPreco(modelo: any, custo: number) {
  return modelo.predict(custo);
}

// Exemplo de uso:
// const modelo = treinarModeloPreco({ historico: [{ custo: 100, preco: 150 }, { custo: 120, preco: 180 }] });
// const precoPrevisto = preverPreco(modelo, 130);
