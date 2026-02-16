// Sugestão automática de markup/margem por categoria
// Exemplo de função que pode ser chamada no frontend ou backend

const HISTORICO_MARKUP_CATEGORIA: Record<string, number> = {
  A: 0.18,
  B: 0.22,
  C: 0.15,
  default: 0.17,
};

export function sugerirMarkupPorCategoria(categoria: string): number {
  return HISTORICO_MARKUP_CATEGORIA[categoria] ?? HISTORICO_MARKUP_CATEGORIA.default;
}

// Simulação de cenários de precificação
import { calcularPrecificacaoAvancada, EstrategiaPrecificacao } from './precificacao.avancada';
import type { ItemOrcamento, Orcamento } from '@/app/types/workflow';

export function simularCenariosPrecificacao({
  itens,
  desconto = 0,
  custosIndiretos,
  margemLucro,
  cenarios,
}: {
  itens: ItemOrcamento[];
  desconto?: number;
  custosIndiretos?: any;
  margemLucro?: any;
  cenarios: EstrategiaPrecificacao[];
}) {
  return cenarios.map((estrategia) => {
    const resultado = calcularPrecificacaoAvancada({ itens, desconto, custosIndiretos, margemLucro, estrategia });
    return {
      estrategia,
      total: resultado.total,
      lucro: resultado.lucro,
      alerta: resultado.alertaMargem,
      log: resultado.log,
    };
  });
}
