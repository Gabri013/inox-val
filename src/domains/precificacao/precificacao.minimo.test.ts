import { obterPrecoMinimo, validarPrecoMinimoOrcamento } from './precificacao.minimo';

describe('obterPrecoMinimo', () => {
  it('retorna preço mínimo por produto', () => {
    expect(obterPrecoMinimo({ produtoId: 'A' })).toBe(180);
    expect(obterPrecoMinimo({ produtoId: 'B' })).toBe(60);
  });
  it('retorna preço mínimo por categoria', () => {
    expect(obterPrecoMinimo({ categoria: 'A' })).toBe(170);
    expect(obterPrecoMinimo({ categoria: 'B' })).toBe(55);
  });
  it('retorna default se não encontrar', () => {
    expect(obterPrecoMinimo({ produtoId: 'X', categoria: 'X' })).toBe(50);
  });
});

describe('validarPrecoMinimoOrcamento', () => {
  const itens = [
    { modeloId: 'A', categoria: 'A', quantidade: 1 },
    { modeloId: 'B', categoria: 'B', quantidade: 2 },
  ];
  it('valida orçamento acima do mínimo', () => {
    const r = validarPrecoMinimoOrcamento({ itens, total: 300 });
    expect(r.valido).toBe(true);
  });
  it('alerta orçamento abaixo do mínimo', () => {
    const r = validarPrecoMinimoOrcamento({ itens, total: 100 });
    expect(r.valido).toBe(false);
    expect(r.alerta).toMatch(/abaixo do mínimo/);
  });
});
