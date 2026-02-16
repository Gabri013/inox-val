import { calcularPrecificacaoAvancada } from './precificacao.avancada';

describe('calcularPrecificacaoAvancada', () => {
  const itens = [
    { id: '1', modeloId: 'A', modeloNome: 'Produto A', descricao: '', quantidade: 2, precoUnitario: 100, subtotal: 200, categoria: 'A' },
    { id: '2', modeloId: 'B', modeloNome: 'Produto B', descricao: '', quantidade: 1, precoUnitario: 50, subtotal: 50, categoria: 'B' },
  ];

  it('aplica markup fixo', () => {
    const r = calcularPrecificacaoAvancada({ itens, estrategia: { tipo: 'markup_fixo', percentual: 0.2 } });
    expect(r.lucro).toBeCloseTo((250 * 0.2));
    expect(r.log.join()).toMatch(/Markup fixo/);
  });

  it('aplica markup por categoria', () => {
    const r = calcularPrecificacaoAvancada({ itens, estrategia: { tipo: 'markup_categoria', categorias: { A: 0.1, B: 0.3 } } });
    expect(r.lucro).toBeCloseTo((200 * 0.1) + (50 * 0.3));
    expect(r.log.join()).toMatch(/Markup categoria/);
  });

  it('aplica lucro mínimo', () => {
    const r = calcularPrecificacaoAvancada({ itens, estrategia: { tipo: 'preco_minimo', valor: 100 } });
    expect(r.lucro).toBeGreaterThanOrEqual(100);
    expect(r.log.join()).toMatch(/Lucro mínimo/);
  });

  it('aplica estratégia personalizada', () => {
    const r = calcularPrecificacaoAvancada({ itens, estrategia: { tipo: 'personalizada', fn: () => 123 } });
    expect(r.lucro).toBe(123);
    expect(r.log.join()).toMatch(/personalizada/);
  });
});
