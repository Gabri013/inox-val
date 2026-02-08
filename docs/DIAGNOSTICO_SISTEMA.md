# Diagnóstico do Sistema — INOX-VAL

Data: 2026-02-07

Objetivo deste diagnóstico (FASE 1 do `PLANO_EXECUCAO_TOTAL.md`): mapear módulos e riscos técnicos com foco em:

- multi-tenant (`empresaId`) obrigatório em todas as leituras/escritas/queries;
- evitar acesso direto ao Firestore fora do padrão de services;
- estabilidade de Produção (não alterar fluxo);
- build estável (sem crashes, sem regressões).

## Módulos mapeados

- Auth: `src/contexts/AuthContext.tsx`, `src/lib/firebase.ts`
- Usuários / permissões: `src/domains/usuarios/*`, `src/app/hooks/usePermissions` (consumido em `src/app/components/layout/Root.tsx`)
- Clientes: `src/services/firestore/clientes.service.ts`, rotas/páginas em `src/app/pages/Clientes.tsx` (a confirmar)
- Produtos: `src/services/firestore/produtos.service.ts`
- Estoque: `src/services/firestore/estoque.service.ts`
- Orçamentos: `src/services/firestore/orcamentos.service.ts`, `src/hooks/useOrcamentos.ts`, `src/app/pages/Orcamentos.tsx`
- Ordens: `src/services/firestore/ordens.service.ts`, `src/hooks/useOrdens.ts`, `src/app/pages/Ordens.tsx` (a confirmar)
- Produção: `src/domains/producao/*`
- Compras: `src/services/firestore/compras.service.ts`, `src/hooks/useCompras.ts`
- Dashboard: `src/app/pages/Dashboard.tsx` (a confirmar)
- Calculadora: `src/app/pages/CalculadoraMesasWizard.tsx`

## Achados principais

### 1) Multi-tenant (`empresaId`) — pontos críticos

- **Fonte do tenant**: o contexto de empresa é definido no Auth e lido por `getEmpresaId()` em `src/services/firestore/base.ts`.
- **Risco**: qualquer acesso fora dos services pode esquecer o filtro `empresaId`.

Mitigação adotada/planejada:

- Padronizar acesso via `src/services/firestore/*`.
- Fail-safe quando `empresaId` está ausente (não fazer queries globais, exibir erro controlado) — deve ser validado nos módulos críticos.

### 2) Acesso direto ao Firestore fora do padrão

- Encontrado: `src/shared/firebase.ts` inicializa Firestore diretamente.
- Uso: não foi encontrado import direto desse arquivo no `src/` (a confirmar em varredura completa). Mantido como legado **sem alteração**.

Recomendação:

- Se for realmente não utilizado, registrar como candidato a remoção em um PR específico (com validação de build).

### 3) Produção (fluxo crítico)

- Leitura de itens por setor é baseada em `collectionGroup('itens')` e filtro por `empresaId` (ver `src/domains/producao/services/producao-itens.service.ts`).
- UI e mutations ficam em `src/domains/producao/pages/*` e hooks em `src/domains/producao/producao.hooks.ts`.

Riscos a observar:

- duplicação de movimentações em cliques repetidos (update + addDoc sem transação);
- performance do Dashboard TV (possível padrão de múltiplas queries por setor).

### 4) Build e tooling

- O `package.json` não define `typecheck` hoje. O plano solicita `npm run typecheck`; isso precisa ser decidido (adicionar script ou ajustar o script de validação).

## Pendências (exigem decisão humana)

- Definir comando oficial de typecheck (`tsc -p tsconfig.json` vs outra abordagem) e adicionar no `package.json` se desejado.
- Confirmar se `src/shared/firebase.ts` é realmente morto antes de remover.

