PLANO DE EXECUÇÃO — INOX-VAL (MODO SEGURO, SEM QUEBRAR PRODUÇÃO)

Você está no repositório INOX-VAL (React + Vite + TypeScript + Firebase/Firestore).

OBJETIVO: Tornar o sistema mais estável, auditável e pronto para finalização, SEM alterar lógica de negócio da Produção e SEM alterar regras do Firestore.

⚠️ RESTRIÇÕES ABSOLUTAS
NÃO:
	•	alterar firestore.rules
	•	alterar estrutura de coleções
	•	alterar fluxos de Produção (Entrada, Saída, Finalizar)
	•	mudar comportamento de React Query
	•	refatorar regras de cálculo existentes

PODE:
	•	limpeza de código morto
	•	padronização de imports
	•	melhoria de tipagem
	•	documentação técnica
	•	scripts de validação
	•	organização de exports
	•	análise de performance (somente relatório)
	•	preparação de testes (placeholders)

Se algo exigir decisão de arquitetura ou mudar comportamento → PARAR e registrar como “Pendência”.

⸻

ETAPA 1 — LIMPEZA SEGURA DE CÓDIGO
	1.	Remover imports não usados
	2.	Remover variáveis não usadas
	3.	Remover console.log esquecidos
	4.	Se houver dúvida se algo é usado → comentar ao invés de apagar

⸻

ETAPA 2 — TIPAGEM TYPESCRIPT (SEM MUDAR DADOS)
	•	Substituir any por tipos existentes dos domínios
	•	Garantir uso correto de:
	•	producao.types.ts
	•	cliente.types.ts
	•	estoque.types.ts
	•	Não alterar formato de dados persistidos

⸻

ETAPA 3 — PADRONIZAÇÃO INTERNA DE NOMES

Somente variáveis internas, sem afetar banco:
	•	movId → movimentoId (interno)
	•	setor → setorAtual (quando for estado atual)
	•	updatedAt → manter padrão único no código (não alterar no banco)

⸻

ETAPA 4 — UNIFICAÇÃO DE IMPORTS FIREBASE

Resolver o warning de import dinâmico vs estático:

Padronizar para IMPORT ESTÁTICO de src/lib/firebase.ts
Remover dynamic import em services/firestore/base.ts
Garantir que Auth, Login, Signup e ResetPassword continuam funcionando

⸻

ETAPA 5 — ORGANIZAÇÃO DE EXPORTS DO DOMÍNIO PRODUÇÃO

Em src/domains/producao/index.ts:
	•	Exportar apenas o que é realmente usado
	•	Remover re-exports confusos
	•	Garantir que nada importa producao.service.ts legado

⸻

ETAPA 6 — DOCUMENTAÇÃO AUTOMÁTICA

Criar pasta /docs se não existir.

Criar:

docs/arquitetura-producao.md
→ Fluxo item → setor → movimentação

docs/fluxo-firestore.md
→ Estrutura de orders_producao / items / movimentacoes

docs/hooks-react-query.md
→ Lista de hooks de Produção e o que cada um invalida

docs/dependencias-dominios.md
→ Mapa de dependências entre domínios

docs/performance-analise.md
→ Pontos com muitos renders ou queries (somente relatório)

docs/firestore-riscos.md
→ Riscos potenciais se empresaId faltar (sem alterar rules)

docs/VALIDACAO-PRODUCAO.md
→ Checklist de smoke test manual

⸻

ETAPA 7 — QUALIDADE DE CÓDIGO
	•	Adicionar JSDoc nos services de Produção
	•	Adicionar comentários explicando hooks complexos
	•	Dividir funções muito grandes em menores SEM alterar lógica

⸻

ETAPA 8 — PREPARAÇÃO DE TESTES (SEM IMPLEMENTAR)

Criar pastas:

src/domains/producao/tests
src/domains/clientes/tests

Criar arquivos vazios:
	•	producao.service.test.ts
	•	hooks.test.ts

⸻

ETAPA 9 — SCRIPTS DE VALIDAÇÃO

Criar pasta /scripts

Criar scripts/validate.ps1 com:

npm ci
npm run typecheck
npm run build

Apenas script auxiliar, não precisa rodar agora.

⸻

ETAPA 10 — RELATÓRIO FINAL OBRIGATÓRIO

Criar:

docs/TRABALHO-NOTURNO-RELATORIO.md

Listar:
	•	arquivos criados
	•	arquivos alterados
	•	arquivos removidos
	•	o que foi comentado em vez de removido
	•	confirmação explícita: “nenhuma lógica de negócio foi alterada”

⸻

FORMATO DE ENTREGA

Organizar mudanças em até 5 grupos (commits ou PRs):
	1.	cleanup-and-consistency
	2.	typing-improvements
	3.	firebase-imports-unification
	4.	docs-and-runbooks
	5.	validation-scripts

Cada grupo deve ter:
	•	resumo técnico
	•	lista de arquivos afetados
	•	como validar localmente

⸻

CRITÉRIO DE PARADA

Se em qualquer momento for necessário:
	•	alterar regra do Firestore
	•	alterar estrutura de dados
	•	alterar fluxo de Produção
	•	alterar comportamento de hooks

PARAR e registrar como “Pendência para aprovação”.

