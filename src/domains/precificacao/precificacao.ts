import type { ItemOrcamento } from '@/app/types/workflow';
import type { CustosIndiretos, MargemLucroConfig } from '@/app/types/precificacao';

export interface ResultadoPrecificacao {
  subtotal: number;
  desconto: number;
  custosIndiretos: CustosIndiretos;
  margemLucro: MargemLucroConfig;
  lucro: number;
  total: number;
  alertaMargem?: string;
}

export function calcularPrecificacao({
  itens,
  desconto = 0,
  custosIndiretos = { frete: 0, impostos: 0, outros: 0 },
  margemLucro = { percentual: 0.15, minimoAbsoluto: 50 },
}: {
  itens: ItemOrcamento[];
  desconto?: number;
  custosIndiretos?: CustosIndiretos;
  margemLucro?: MargemLucroConfig;
}): ResultadoPrecificacao {
  // Validação rigorosa dos dados de entrada
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error('Precificação: lista de itens inválida ou vazia.');
  }
  itens.forEach((item, idx) => {
    if (typeof item.quantidade !== 'number' || item.quantidade <= 0) {
      throw new Error(`Precificação: quantidade inválida no item ${idx + 1}`);
    }
    if (typeof item.precoUnitario !== 'number' || item.precoUnitario < 0) {
      throw new Error(`Precificação: preço unitário inválido no item ${idx + 1}`);
    }
  });
  if (typeof desconto !== 'number' || desconto < 0) {
    throw new Error('Precificação: desconto inválido.');
  }
  if (!custosIndiretos || typeof custosIndiretos !== 'object') {
    throw new Error('Precificação: custos indiretos inválidos.');
  }
  if (!margemLucro || typeof margemLucro !== 'object' || typeof margemLucro.percentual !== 'number' || margemLucro.percentual < 0) {
    throw new Error('Precificação: margem de lucro inválida.');
  }

  const subtotal = itens.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const descontoSeguro = Math.min(Math.max(0, desconto), subtotal);
  const totalCustosIndiretos = (custosIndiretos.frete || 0) + (custosIndiretos.impostos || 0) + (custosIndiretos.outros || 0);
  const baseLucro = subtotal + totalCustosIndiretos - descontoSeguro;
  let lucro = baseLucro * (margemLucro.percentual || 0);
  if (margemLucro.minimoAbsoluto && lucro < margemLucro.minimoAbsoluto) {
    lucro = margemLucro.minimoAbsoluto;
  }
  const total = baseLucro + lucro;
  let alertaMargem: string | undefined = undefined;
  if ((lucro / (subtotal + totalCustosIndiretos)) < 0.05) {
    alertaMargem = 'Margem de lucro abaixo de 5%';
  }
  return {
    subtotal,
    desconto: descontoSeguro,
    custosIndiretos,
    margemLucro,
    lucro,
    total,
    alertaMargem,
  };
}
