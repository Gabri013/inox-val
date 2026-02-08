# Firestore — Riscos e mitigação (sem alterar rules)

Este documento foca em riscos de segurança/integridade quando `empresaId` falha ou quando algum acesso foge do padrão.

## Riscos

1. Query sem filtro de `empresaId` (vazamento cross-tenant).
2. `collectionGroup(...)` sem `where('empresaId','==',...)`.
3. Leitura por ID sem validar `empresaId` do documento retornado.
4. Writes sem `empresaId`.

## Mitigações (permitidas)

- Fail-safe quando `empresaId` não existe (UI controlada, sem consultas).
- Tratamento consistente de `permission-denied` com estado de erro controlado (sem crash) nas telas críticas.
- Centralizar helpers de query em `src/services/firestore/base.ts`.
- Auditoria (`writeAuditLog`) em ações críticas já existentes.

## O que NÃO é permitido

- Modificar `firestore.rules`.
