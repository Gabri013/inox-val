import { calcularPrecificacao } from './precificacao';

describe('calcularPrecificacao', () => {
  it('calcula corretamente com valores padrão', () => {
    const itens = [
      { id: '1', modeloId: 'A', modeloNome: 'Produto A', descricao: '', quantidade: 2, precoUnitario: 100, subtotal: 200 },
      { id: '2', modeloId: 'B', modeloNome: 'Produto B', descricao: '', quantidade: 1, precoUnitario: 50, subtotal: 50 },
    ];
    const result = calcularPrecificacao({ itens });
    expect(result.subtotal).toBe(250);
    expect(result.desconto).toBe(0);
    expect(result.custosIndiretos.frete).toBe(0);
    expect(result.lucro).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(result.subtotal);
  });

  it('aplica desconto corretamente', () => {
    const itens = [
      { id: '1', modeloId: 'A', modeloNome: 'Produto A', descricao: '', quantidade: 1, precoUnitario: 100, subtotal: 100 },
    ];
    const result = calcularPrecificacao({ itens, desconto: 20 });
    expect(result.desconto).toBe(20);
    expect(result.total).toBeGreaterThan(0);
  });

  it('aplica custos indiretos e margem mínima', () => {
    const itens = [
      { id: '1', modeloId: 'A', modeloNome: 'Produto A', descricao: '', quantidade: 1, precoUnitario: 10, subtotal: 10 },
    ];
    const result = calcularPrecificacao({
      itens,
      custosIndiretos: { frete: 5, impostos: 2, outros: 3 },
      margemLucro: { percentual: 0.1, minimoAbsoluto: 10 },
    });
    expect(result.custosIndiretos.frete).toBe(5);
    expect(result.lucro).toBe(10); // mínimo absoluto
    expect(result.total).toBe(30);
  });

  it('alerta margem baixa', () => {
    const itens = [
      { id: '1', modeloId: 'A', modeloNome: 'Produto A', descricao: '', quantidade: 1, precoUnitario: 100, subtotal: 100 },
    ];
    const result = calcularPrecificacao({ itens, margemLucro: { percentual: 0.01, minimoAbsoluto: 0 } });
    expect(result.alertaMargem).toBeDefined();
  });
});
