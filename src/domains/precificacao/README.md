# Precificacao

Modulo gerado a partir da planilha `data/planilha_preco.xls`.

## Fluxo

1. Converter XLS para XLSX:
   - Windows: `scripts/convert_xls_to_xlsx.ps1`
   - Linux/Mac: `scripts/convert_xls_to_xlsx.sh`
2. Gerar modelo: `npm run sheet:extract`
3. Gerar engine: `npm run sheet:generate`
4. Teste equivalencia: `npm run sheet:test-equivalence`

## Observacoes

- A engine atual gera apenas um runtime simples (placeholder).
- A avaliacao de formulas deve ser implementada com DAG e funcoes Excel-like.
