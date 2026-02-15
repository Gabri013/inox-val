# Precificação Híbrida — Roadmap Executado (v1)

## Objetivo
Aumentar assertividade da precificação no INOX-VAL combinando:
1. motor de engenharia já existente
2. histórico de ordens de produção extraídas do SolidWorks

## Blocos executados

### Bloco 1 — Ingestão e normalização
- Base integrada:
  - `levantamento_ordens_2022.csv`
  - `ordens_com_dimensoes.csv`
- Normalização implementada em serviço:
  - remoção de acentos
  - padronização de texto
  - parse de flags booleanas

### Bloco 2 — Motor híbrido
- Serviço criado:
  - `src/domains/precificacao/services/hybridPricing.service.ts`
- Resultado híbrido calculado:
  - `precoRecomendado`
  - `precoMin`
  - `precoIdeal`
  - `precoMax`
  - `confianca`
  - `justificativa`

### Bloco 3 — Parser de dimensão
- Utilitário criado:
  - `src/domains/precificacao/utils/dimensionParser.ts`
- Suporta formatos com `x`, `X`, `×`, com/sem espaços.

### Bloco 4 — Configuração por fatores
- Arquivo de configuração:
  - `src/domains/precificacao/config/hybridPricing.config.json`
- Fatores editáveis por:
  - família
  - subfamília
  - bandas de dimensão
  - complexidade

### Bloco 5 — Calibração automática
- Script:
  - `scripts/calibrate-hybrid-pricing.mjs`
- Comando:
  - `npm run pricing:calibrate`
- Recalibra fatores com base na distribuição das OPs.

### Bloco 6 — UI e operação
- Tela de precificação atualizada para mostrar:
  - preço base atual
  - fator histórico
  - faixa sugerida
  - justificativas

### Bloco 7 — Validação e relatório
- Script:
  - `scripts/validate-hybrid-pricing.mjs`
- Comando:
  - `npm run pricing:validate`
- Relatórios gerados:
  - `relatorios/hybrid_pricing_validation.json`
  - `relatorios/hybrid_pricing_validation.md`

## Fluxo recomendado de uso
1. `npm run pricing:calibrate`
2. `npm run pricing:validate`
3. `npm run typecheck`
4. `npm run build`
5. Validar na interface com casos reais

## Próxima evolução (v2)
- Regressão supervisionada com histórico real de fechamento de orçamento.
- Ajuste dinâmico de fator por família com janela móvel.
- Registro de feedback de vendedor para recalibração contínua.
