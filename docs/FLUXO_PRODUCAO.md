# Fluxo de Produção (visão funcional)

Este documento descreve o fluxo funcional de Produção e referencia a implementação.

Importante: o fluxo de Produção é considerado estável e não deve ser alterado sem aprovação explícita.

## Telas

- Controle de Produção: `src/domains/producao/pages/ControleProducao.tsx`
- Apontamento OP: `src/domains/producao/pages/ApontamentoOP.tsx`
- Dashboard TV: `src/domains/producao/pages/DashboardTV.tsx`

## Ações

- Entrada: altera status para "Em Produção" (sem mudar setor).
- Saída: move setor (`setorAtual`).
- Último setor: finaliza (status "Concluido").

## Evidência técnica

- Hooks: `src/domains/producao/producao.hooks.ts`
- Service: `src/domains/producao/services/producao-itens.service.ts`

