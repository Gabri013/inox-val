import { calcularPrecificacao } from './precificacao';

describe('calcularPrecificacao - validação rigorosa', () => {
  it('lança erro se itens for vazio', () => {
    expect(() => calcularPrecificacao({ itens: [] })).toThrow();
  });
  it('lança erro se quantidade for inválida', () => {
    expect(() => calcularPrecificacao({ itens: [{ id: '1', modeloId: 'A', modeloNome: '', descricao: '', quantidade: 0, precoUnitario: 10, subtotal: 0 }] })).toThrow();
  });
  it('lança erro se preço unitário for negativo', () => {
    expect(() => calcularPrecificacao({ itens: [{ id: '1', modeloId: 'A', modeloNome: '', descricao: '', quantidade: 1, precoUnitario: -5, subtotal: -5 }] })).toThrow();
  });
  it('lança erro se desconto for negativo', () => {
    expect(() => calcularPrecificacao({ itens: [{ id: '1', modeloId: 'A', modeloNome: '', descricao: '', quantidade: 1, precoUnitario: 10, subtotal: 10 }], desconto: -1 })).toThrow();
  });
  it('lança erro se margem for inválida', () => {
    expect(() => calcularPrecificacao({ itens: [{ id: '1', modeloId: 'A', modeloNome: '', descricao: '', quantidade: 1, precoUnitario: 10, subtotal: 10 }], margemLucro: { percentual: -0.1, minimoAbsoluto: 0 } })).toThrow();
  });
});
