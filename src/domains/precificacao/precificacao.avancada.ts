import type { ItemOrcamento } from '@/app/types/workflow';
import type { CustosIndiretos, MargemLucroConfig } from '@/app/types/precificacao';

export type EstrategiaPrecificacao =
  | { tipo: 'markup_fixo'; percentual: number }
  | { tipo: 'markup_categoria'; categorias: Record<string, number> }
  | { tipo: 'preco_minimo'; valor: number }
  | { tipo: 'personalizada'; fn: (params: PrecificacaoParams) => number };

export interface PrecificacaoParams {
  itens: ItemOrcamento[];
  desconto?: number;
  custosIndiretos?: CustosIndiretos;
  margemLucro?: MargemLucroConfig;
  estrategia?: EstrategiaPrecificacao;
}

export function calcularPrecificacaoAvancada(params: PrecificacaoParams) {
  const { itens, desconto = 0, custosIndiretos = { frete: 0, impostos: 0, outros: 0 }, margemLucro = { percentual: 0.15, minimoAbsoluto: 50 }, estrategia } = params;
  const subtotal = itens.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const descontoSeguro = Math.min(Math.max(0, desconto), subtotal);
  const totalCustosIndiretos = (custosIndiretos.frete || 0) + (custosIndiretos.impostos || 0) + (custosIndiretos.outros || 0);
  const baseLucro = subtotal + totalCustosIndiretos - descontoSeguro;

  let lucro = 0;
  let log = [];

  if (!estrategia || estrategia.tipo === 'markup_fixo') {
    const percentual = estrategia?.percentual ?? margemLucro.percentual;
    lucro = baseLucro * percentual;
    log.push(`Markup fixo aplicado: ${percentual * 100}%`);
  } else if (estrategia.tipo === 'markup_categoria') {
    let totalLucro = 0;
    for (const item of itens) {
      const cat = (item as any).categoria || 'default';
      const perc = estrategia.categorias[cat] ?? margemLucro.percentual;
      totalLucro += (item.subtotal || 0) * perc;
      log.push(`Markup categoria '${cat}': ${perc * 100}% sobre ${item.subtotal}`);
    }
    lucro = totalLucro + totalCustosIndiretos * (margemLucro.percentual || 0);
  } else if (estrategia.tipo === 'preco_minimo') {
    lucro = Math.max(baseLucro * (margemLucro.percentual || 0), estrategia.valor);
    log.push(`Lucro mínimo garantido: R$${estrategia.valor}`);
  } else if (estrategia.tipo === 'personalizada') {
    lucro = estrategia.fn(params);
    log.push('Estratégia personalizada aplicada.');
  }

  if (margemLucro.minimoAbsoluto && lucro < margemLucro.minimoAbsoluto) {
    log.push(`Lucro ajustado para mínimo absoluto: R$${margemLucro.minimoAbsoluto}`);
    lucro = margemLucro.minimoAbsoluto;
  }

  const total = baseLucro + lucro;
  let alertaMargem: string | undefined = undefined;
  if ((lucro / (subtotal + totalCustosIndiretos)) < 0.05) {
    alertaMargem = 'Margem de lucro abaixo de 5%';
    log.push(alertaMargem);
  }

  return {
    subtotal,
    desconto: descontoSeguro,
    custosIndiretos,
    margemLucro,
    lucro,
    total,
    alertaMargem,
    log,
  };
}
