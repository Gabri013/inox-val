import { sugerirMarkupPorCategoria, simularCenariosPrecificacao } from './precificacao.sugestao';
import type { EstrategiaPrecificacao } from './precificacao.avancada';

describe('sugerirMarkupPorCategoria', () => {
  it('retorna markup correto para categoria conhecida', () => {
    expect(sugerirMarkupPorCategoria('A')).toBe(0.18);
    expect(sugerirMarkupPorCategoria('B')).toBe(0.22);
  });
  it('retorna markup default para categoria desconhecida', () => {
    expect(sugerirMarkupPorCategoria('X')).toBe(0.17);
  });
});

describe('simularCenariosPrecificacao', () => {
  const itens = [
    { id: '1', modeloId: 'A', modeloNome: 'Produto A', descricao: '', quantidade: 2, precoUnitario: 100, subtotal: 200, categoria: 'A' },
    { id: '2', modeloId: 'B', modeloNome: 'Produto B', descricao: '', quantidade: 1, precoUnitario: 50, subtotal: 50, categoria: 'B' },
  ];
  const cenarios: EstrategiaPrecificacao[] = [
    { tipo: 'markup_fixo', percentual: 0.2 },
    { tipo: 'markup_categoria', categorias: { A: 0.1, B: 0.3 } },
  ];
  it('simula múltiplos cenários e retorna totais', () => {
    const resultados = simularCenariosPrecificacao({ itens, cenarios });
    expect(resultados.length).toBe(2);
    expect(resultados[0].total).toBeGreaterThan(0);
    expect(resultados[1].total).toBeGreaterThan(0);
  });
});
