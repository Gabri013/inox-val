# Relatorio Final - INOX-VAL

Data: 2026-02-07

## Resumo

- Padronizado redirecionamento de acesso negado para rota dedicada.
- Ajustes em permissoes e auditoria de aprovacoes de usuarios.
- Correcoes de multi-tenant em permissoes por role.
- Estruturado o modulo de precificacao (scripts, engine e rota).

## O que foi alterado
- Precificacao: IF/AND/OR agora sao avaliados com short-circuit no runtime gerado.
- Ordens: empty message agora diferencia filtros ativos vs. sem ordens cadastradas.
- Produtos: empty message agora diferencia filtros ativos vs. sem produtos cadastrados.
- Clientes: empty message agora diferencia lista vazia de filtros ativos.
- Orcamentos: padronizadas mensagens de erro nas acoes de orcamentos (criar/convert).
- Orcamentos: bloqueado exportacao quando a lista filtrada esta vazia (evita feedback enganoso).
- Orcamentos: empty state diferencia lista vazia de filtros ativos e oferece limpar filtros.
- Orcamentos: falha ao carregar mostra mensagem acionavel com opcao de tentar novamente.

- `src/app/components/ProtectedRoute.tsx`
- `src/app/pages/SemAcesso.tsx`
- `src/app/routes.tsx`
- `src/app/pages/Orcamentos.tsx`
- `src/domains/usuarios/PermissionsProvider.tsx`
- `src/domains/usuarios/usuarios.approval.service.ts`
- `src/domains/usuarios/pages/UsuariosApproval.tsx`
- `src/domains/usuarios/usuarios.types.ts`
- `src/hooks/useClientes.ts`
- `src/hooks/useOrcamentos.ts`
- `src/hooks/useOrdens.ts`
- `src/contexts/AuthContext.tsx`
- `src/app/providers/AppProviders.tsx`
- `data/planilha_preco.xls`
- `scripts/convert_xls_to_xlsx.ps1`
- `scripts/convert_xls_to_xlsx.sh`
- `scripts/extract_planilha_preco.ts`
- `scripts/generate_engine_from_model.ts`
- `scripts/test_equivalence.ts`
- `src/domains/precificacao/index.ts`
- `src/domains/precificacao/engine/index.ts`
- `src/domains/precificacao/pages/Precificacao.tsx`
- `src/domains/precificacao/README.md`
- `src/services/firestore/precificacao.service.ts`
- `src/types/firebase.ts`

## Como validar

1. `npm run typecheck`
2. `npm run build`

## Status build

- 2026-02-08: `./build-fast.sh` falhou no ambiente local por ausencia de rustup ("rustup is required for consistent builds").
- 2026-02-08: `npm run build` falhou: erro de sintaxe em `src/app/routes.tsx` (caractere \"r\" em CRLF literal na linha 55).
- 2026-02-08: `npm run build` OK (aviso de chunk > 500 kB).

## Pendencias / riscos

- Permissoes por role agora sao filtradas por `empresaId` e possuem fallback para docs legados sem `empresaId`.
- Auditoria em aprovacoes depende de `empresaId` passado pela tela de aprovacoes.
- Engine de formulas implementada com parser basico (SUM/IF/AND/OR etc). Pode precisar ajustes para casos avancados.
- 2026-02-09: Iniciado ajuste incremental (dashboard: duplicacao materiais + acentos quebrados). Em andamento.
