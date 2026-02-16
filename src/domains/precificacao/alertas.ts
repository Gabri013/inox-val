// Alertas automáticos de oportunidades de precificação
export function gerarAlertasPrecificacao({
  dados = [],
}: {
  dados: Array<{ produto: string; margem: number; precoOrcado: number; custoReal: number }>;
}) {
  const alertas: Array<{ produto: string; tipo: 'margem_baixa' | 'margem_alta' | 'preco_abaixo_custo'; mensagem: string }> = [];
  for (const item of dados) {
    if (item.margem < 0.05) {
      alertas.push({ produto: item.produto, tipo: 'margem_baixa', mensagem: `Margem baixa (${(item.margem * 100).toFixed(2)}%)` });
    }
    if (item.margem > 0.3) {
      alertas.push({ produto: item.produto, tipo: 'margem_alta', mensagem: `Margem alta (${(item.margem * 100).toFixed(2)}%)` });
    }
    if (item.precoOrcado < item.custoReal) {
      alertas.push({ produto: item.produto, tipo: 'preco_abaixo_custo', mensagem: 'Preço abaixo do custo real!' });
    }
  }
  return alertas;
}

// Exemplo de uso:
// const alertas = gerarAlertasPrecificacao({ dados: [{ produto: 'A', margem: 0.03, precoOrcado: 100, custoReal: 110 }] });
