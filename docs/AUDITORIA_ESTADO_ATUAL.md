# Auditoria do Estado Atual (FASE A1)

Data: 2026-02-07

Este documento consolida o inventário inicial do repositório e os principais riscos encontrados antes de iniciar correções estruturais.

## Resumo executivo

- Stack: React + Vite + TypeScript + Firebase (Auth/Firestore).
- Router: `createBrowserRouter` em `src/app/routes.tsx`.
- Restrições do projeto (do `EVERYCODE_MASTER_EXECUTION.md`):
  - Não alterar `firestore.rules`.
  - Multi-tenant obrigatório: toda leitura/escrita deve respeitar `empresaId`.
  - Não quebrar compatibilidade de collections existentes.
  - Nenhuma página pode depender de mocks em produção.

## Rotas (inventário)

Fonte: `src/app/routes.tsx`.

### Públicas

- `/login`
- `/signup`
- `/reset-password`
- `/aguardando-liberacao`

### Protegidas (children de `/`)

- `/` (Dashboard)
- `/clientes`
- `/clientes/novo`
- `/clientes/:id`
- `/clientes/:id/editar`
- `/produtos`
- `/produtos/novo`
- `/produtos/:id`
- `/produtos/:id/editar`
- `/estoque`
- `/orcamentos`
- `/ordens`
- `/compras`
- `/auditoria`
- `/minhas-configuracoes`
- `/ajuda`
- `/perfil`
- `/configuracoes`
- `/calculadora`
- `/controle-producao`
- `/dashboard-tv`
- `/apontamento-op`
- `/usuarios`
- `/usuarios/aprovacoes`
- `/usuarios/permissoes`
- `/usuarios/novo`
- `/usuarios/:id`
- `/usuarios/:id/editar`
- `/chat`
- `/anuncios`
- `/anuncios/novo`
- `/anuncios/:id/editar`
- `*` (NotFound)

## Páginas (src/app/pages)

Inventário atual em `src/app/pages/`:

- `AguardandoLiberacao.tsx`
- `Ajuda.tsx`
- `Auditoria.tsx`
- `CalculadoraMesasWizard.tsx`
- `CatalogoInsumos.tsx`
- `Clientes.tsx`
- `Compras.tsx`
- `ConfiguracaoCustos.tsx`
- `Configuracoes.tsx`
- `Dashboard.tsx`
- `Estoque.tsx`
- `Login.tsx`
- `NotFound.tsx`
- `Orcamentos.tsx`
- `Ordens.tsx`
- `Perfil.tsx`
- `PopularBanco.tsx`
- `Produtos.tsx`
- `ResetPassword.tsx`
- `Signup.tsx`

Observação: nem todas estas páginas estão necessariamente referenciadas em rotas (ex.: `PopularBanco.tsx`, `CatalogoInsumos.tsx`, `ConfiguracaoCustos.tsx`).

## Domínios / módulos (src/domains)

Inventário atual em `src/domains/`:

- `anuncios`
- `calculadora`
- `catalogo`
- `chat`
- `clientes`
- `configuracoes`
- `custos`
- `estoque`
- `nesting`
- `producao`
- `produtos`
- `usuarios`
- `vendedores`

## Dependências de mocks/seed (risco de produção)

Arquivos explícitos de mock/seed (precisam ser garantidos como **dev-only** e nunca obrigatórios para telas em produção):

- `src/domains/anuncios/anuncios.mock.ts`
- `src/domains/anuncios/anuncios.seed.ts`
- `src/domains/catalogo/seed-data.ts`
- `src/domains/chat/chat.mock.ts`
- `src/domains/chat/chat.seed.ts`
- `src/domains/clientes/clientes.seed.ts`
- `src/domains/producao/producao.seed.ts`
- `src/domains/produtos/produtos.seed.ts`
- `src/domains/usuarios/usuarios.seed.ts`
- `src/services/storage/seed.ts`

Handlers HTTP de “mock” (precisa validar se são usados em runtime):

- `src/services/http/mockClient.ts`
- `src/services/http/calculadoraMockHandler.ts`
- `src/services/http/configuracoesMockHandler.ts`
- `src/services/http/producaoMockHandler.ts`

## Proteção de rotas/permissões (risco UX)

- `ProtectedRoute` (em `src/app/components/ProtectedRoute.tsx`) bloqueia módulo com UI inline “Acesso Negado”.
- Há indício de duas fontes de permissão (`usePermissions().canAccess` e `useAuth().hasPermission`). Precisamos garantir que:
  - a verificação não cause tela em branco por `loading`.
  - rotas sem permissão redirecionem para uma página consistente (“Sem Acesso”), conforme a fase B2 do master.

## Scripts e validação local

Status atual do `package.json` (antes de ajustes nesta auditoria):

- Scripts existentes: `dev`, `build`, `preview`, `seed`, `seed:users`, `test:firebase`.
- Ausentes (requeridos pelo master): `typecheck`, `check` e (se houver base) `lint`.

## Riscos e prováveis erros

- Ausência de `npm run typecheck`/`check` dificulta ciclo incremental por fase.
- Presença de “mock handlers” pode indicar dependência de mocks em produção.
- Multi-tenant: não há garantia (nesta auditoria superficial) de que todas queries/writes estão filtrando por `empresaId`.

## Próximas ações (FASE A2)

- Criar/ajustar scripts `typecheck`, `build`, `check` e `scripts/validate.ps1` (Windows).
- Rodar `npm run check` e usar erros como lista de trabalho para a fase B (rotas/UX/CRUD por services).

