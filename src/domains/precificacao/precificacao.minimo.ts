// Regras de preço mínimo por produto/categoria
const PRECO_MINIMO_PRODUTO: Record<string, number> = {
  'A': 180,
  'B': 60,
  'default': 50,
};
const PRECO_MINIMO_CATEGORIA: Record<string, number> = {
  'A': 170,
  'B': 55,
  'default': 45,
};

export function obterPrecoMinimo({ produtoId, categoria }: { produtoId?: string; categoria?: string }) {
  if (produtoId && PRECO_MINIMO_PRODUTO[produtoId]) return PRECO_MINIMO_PRODUTO[produtoId];
  if (categoria && PRECO_MINIMO_CATEGORIA[categoria]) return PRECO_MINIMO_CATEGORIA[categoria];
  return PRECO_MINIMO_PRODUTO.default;
}

// Validação do orçamento final
export function validarPrecoMinimoOrcamento({ itens, total }: { itens: any[]; total: number }) {
  let precoMinimoTotal = 0;
  for (const item of itens) {
    const min = obterPrecoMinimo({ produtoId: item.modeloId, categoria: item.categoria });
    precoMinimoTotal += min * (item.quantidade || 1);
  }
  if (total < precoMinimoTotal) {
    return {
      valido: false,
      precoMinimoTotal,
      alerta: `Preço do orçamento (${total}) está abaixo do mínimo permitido (${precoMinimoTotal})!`,
    };
  }
  return { valido: true, precoMinimoTotal };
}
