# PR1 — MODO FORÇA TOTAL (deixar o ERP funcionando)

## Objetivo (único)
Deixar o sistema FUNCIONANDO fim-a-fim: login, navegação, páginas carregando dados reais, ações do usuário funcionando, sem telas quebradas, sem erros no console, build verde.

## Liberdade total de implementação
Você (AI) pode:
- refatorar, mover arquivos, reescrever telas, trocar componentes
- criar services, hooks, stores, validators
- ajustar rotas, layouts, providers
- alterar Firestore rules e estrutura de dados SE necessário
- criar coleções/índices e scripts de seed/migrate SE necessário
- remover mocks/hardcode e substituir por dados reais
- ajustar RBAC/perfis para um modelo simples se o atual estiver impedindo o funcionamento

## Guardrails (para não destruir o projeto)
1) Manter build verde:
   - Zero erros TypeScript
   - `npm run build` deve passar
2) Não deixar páginas “meio prontas”:
   - Toda página tocada deve ter loading/error/empty e não pode quebrar.
3) Se mudar regras/dados, documentar:
   - Liste o que mudou (coleções, campos, rules, índices)
   - Crie um script de migração/seed (se aplicável)
4) Sempre registrar mudanças:
   - Trabalhar em commits pequenos e frequentes
   - Mensagens de commit claras por módulo
5) Se uma funcionalidade for impossível de concluir agora:
   - Desabilitar a rota/botão com aviso “em manutenção” (temporário)
   - Nunca deixar quebrando o app

## Critérios de PRONTO (Definition of Done)
O sistema é considerado “funcional” quando:
- Login funciona e carrega perfil
- Sidebar/rotas não levam a telas em branco
- Módulos principais (Clientes, Produtos, Orçamentos, Produção se existir) têm ao menos:
  - listagem carregando do banco
  - criar e editar funcionando
  - excluir funcionando (ou desativado com aviso e motivo)
- Nenhuma tela gera erro fatal no console
- Build passa

## Estratégia de execução (obrigatória)
### Fase 0 — Diagnóstico rápido
- Rodar build e listar erros bloqueantes
- Rodar app e mapear rotas quebradas
- Identificar mocks e serviços ausentes

### Fase 1 — Fazer rodar (primeiro “verde”)
- Corrigir erros TS/build
- Corrigir providers/rotas/context
- Garantir Auth + carregamento de perfil

### Fase 2 — Conectar banco de verdade
- Padronizar acesso ao Firestore (services)
- Criar hooks para telas
- Substituir mocks por queries reais

### Fase 3 — Tornar CRUD usável
- Implementar CRUD mínimo nos módulos críticos
- Validar formulários
- Tratar erros e estados da UI

### Fase 4 — Endurecer segurança e consistência
- Ajustar rules, índices e validações
- Garantir multi-tenant se possível; se estiver bloqueando, simplificar temporariamente e documentar

## Regras de execução no terminal (sempre)
A cada conjunto de mudanças:
- Rodar `npm run build`
- Se existir: `npm run lint` e `npm run test`
- Registrar resultado (passou/falhou e por quê)

## Entrega final obrigatória
No fim, fornecer:
1) Lista de rotas e status (OK / Em manutenção)
2) Lista de coleções/fields no Firestore usados
3) Alterações em rules/índices (se houver)
4) Como rodar local e como fazer deploy
