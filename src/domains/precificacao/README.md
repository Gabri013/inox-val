// Módulo central de precificação
// Fornece funções para cálculo de preço, margem, custos indiretos e validações.
// Permite fácil extensão para múltiplas estratégias de precificação.
//
// Como usar:
// import { calcularPrecificacao } from './precificacao';
// const resultado = calcularPrecificacao({ itens, desconto, custosIndiretos, margemLucro });
//
// Parâmetros:
// - itens: array de itens do orçamento
// - desconto: valor absoluto de desconto
// - custosIndiretos: { frete, impostos, outros }
// - margemLucro: { percentual, minimoAbsoluto }
//
// Retorno:
// - subtotal, desconto, custosIndiretos, margemLucro, lucro, total, alertaMargem
//
// Estratégias futuras:
// - Precificação por categoria
// - Preço mínimo sugerido
// - Simulação de cenários
