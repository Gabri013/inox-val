# Firestore Map

Mapa de coleções e padrões de acesso.

## Fonte

- Regras: `firestore.rules` (não modificar)
- Índices: `firestore.indexes.json`
- Padrão de multi-tenant: `src/services/firestore/base.ts` (uso de `empresaId`)

## Produção

Ver `docs/fluxo-firestore.md`.

## Orçamentos / Ordens / Clientes / Produtos

Os acessos devem ocorrer via services em `src/services/firestore/*.service.ts`.

