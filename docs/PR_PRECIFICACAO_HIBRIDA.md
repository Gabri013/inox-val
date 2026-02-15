# PR — Precificação Híbrida com Histórico de OP

## Resumo
Implementa uma camada de precificação híbrida no INOX-VAL, combinando o motor atual de engenharia com fatores históricos extraídos das ordens de produção (SolidWorks).

## O que entrou
- Serviço de precificação híbrida:
  - `src/domains/precificacao/services/hybridPricing.service.ts`
- Parser de dimensão robusto:
  - `src/domains/precificacao/utils/dimensionParser.ts`
- Tipos de resultado híbrido:
  - `src/domains/precificacao/types/hybridPricing.ts`
- Config de fatores editável:
  - `src/domains/precificacao/config/hybridPricing.config.json`
- Integração na tela de precificação:
  - `src/domains/precificacao/components/PrecificacaoPage.tsx`
  - `src/domains/precificacao/components/QuoteResults.tsx`
- Base histórica integrada:
  - `levantamento_ordens_2022.csv`
  - `ordens_com_dimensoes.csv`

## Scripts adicionados
- Calibração dos fatores por distribuição real das OPs:
  - `scripts/calibrate-hybrid-pricing.mjs`
  - `npm run pricing:calibrate`
- Validação de cobertura com relatório:
  - `scripts/validate-hybrid-pricing.mjs`
  - `npm run pricing:validate`
- Pipeline completo:
  - `npm run pricing:full`

## Relatórios
- `relatorios/hybrid_pricing_validation.json`
- `relatorios/hybrid_pricing_validation.md`

## Critérios de validação executados
- `npm run pricing:full` ✅
- `npm run build` ✅

## Impacto funcional
- Mantém preço base atual (engenharia)
- Adiciona preço recomendado com fator histórico
- Exibe faixa min/ideal/max
- Informa confiança e justificativas
- Fallback neutro quando faltar histórico

## Observações
- Existem mudanças locais não relacionadas a este PR no repositório (ex.: `src/app/pages/Configuracoes.tsx`) que não fazem parte do escopo desta entrega.
