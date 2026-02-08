# Permissões e Controle de Acesso

Objetivo: consolidar como o sistema decide visibilidade de módulos e proteção de rotas.

## Sidebar

A sidebar filtra itens por permissão do módulo:

- `src/app/components/layout/Root.tsx` usa `usePermissions().canAccess(module)` para filtrar `navigation`.

## Rotas

- Rotas protegidas: `src/app/components/ProtectedRoute.tsx`.

## Perfis (exemplo)

Perfis sugeridos pelo plano (exemplos, não hardcoded aqui):

- ADMIN: acesso total
- GESTOR: produção, ordens, orçamentos
- OPERADOR: produção/apontamento
- COMERCIAL: clientes + orçamentos

## Importante

- Mesmo com UI bloqueando, o enforcement real depende do Firestore (`firestore.rules`).

