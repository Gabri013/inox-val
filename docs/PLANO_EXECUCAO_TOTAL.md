Você está no repositório INOX-VAL.

OBJETIVO: deixar o sistema 100% funcional, estável e consistente para uso real, sem alterar regras de negócio já definidas e sem quebrar fluxos existentes.

⚠️ IMPORTANTE: EXECUTAR TUDO DE FORMA AUTÔNOMA
Não pedir confirmação.
Não pausar para perguntas.
Não solicitar aprovação.
Tomar decisões técnicas seguras baseadas no código existente.

========================================
FASE 1 — DIAGNÓSTICO GERAL DO SISTEMA
========================================

1. Mapear todos os módulos:
- Auth
- Usuários / Permissões
- Clientes
- Produtos
- Estoque
- Orçamentos
- Ordens
- Produção
- Compras
- Dashboard
- Calculadora

2. Identificar:
- Imports quebrados
- Services não utilizados
- Hooks duplicados
- Páginas que acessam Firestore direto fora do padrão
- Uso de any desnecessário
- Queries sem filtro de empresaId
- Possíveis vazamentos multi-tenant

Gerar relatório em:
docs/DIAGNOSTICO_SISTEMA.md

========================================
FASE 2 — PADRONIZAÇÃO DE ACESSO AO FIRESTORE
========================================

Garantir que:
- Todas as leituras/escritas passem por services
- Services usem helpers de tenant
- Nenhuma página faça getDocs direto sem filtro de empresaId
- collectionGroup sempre filtrado por empresaId quando necessário

Se encontrar risco → corrigir
Se encontrar código legado → substituir por padrão novo

========================================
FASE 3 — PERMISSÕES E CONTROLE DE ACESSO
========================================

Implementar lógica consistente de visibilidade de módulos:

Perfis exemplo:
ADMIN → acesso total
GESTOR → acesso produção, ordens, orçamentos
OPERADOR → apenas produção/apontamento
COMERCIAL → clientes + orçamentos

Verificar:
- Sidebar respeita permissões
- Rotas protegidas
- Ações bloqueadas sem permissão

========================================
FASE 4 — PRODUÇÃO (FLUXO CRÍTICO)
========================================

Validar e corrigir:

ControleProdução:
- Entrada muda status
- Saída move setor
- Último setor finaliza

ApontamentoOP:
- Iniciar / Pausar / Finalizar
- Movimentações registradas corretamente

DashboardTV:
- Não faz N+1
- Não busca ordem dentro de loop
- Usa dados dos itens

========================================
FASE 5 — ESTABILIDADE DO BUILD
========================================

Resolver:
- Warnings de dynamic import firebase
- Dividir chunks grandes no Vite
- Garantir npm run build sem erro

========================================
FASE 6 — LIMPEZA SEGURA
========================================

Remover:
- Imports mortos
- Console.logs esquecidos
- Arquivos não utilizados

Substituir:
- any por tipos reais
- Variáveis com nomes inconsistentes

========================================
FASE 7 — DOCUMENTAÇÃO AUTOMÁTICA
========================================

Criar:

docs/ARQUITETURA.md
docs/FLUXO_PRODUCAO.md
docs/FIRESTORE_MAP.md
docs/PERMISSOES.md

========================================
FASE 8 — TESTES DE CONSISTÊNCIA
========================================

Criar script local:

scripts/validar_sistema.ps1

Que execute:
npm run typecheck
npm run build

========================================
RELATÓRIO FINAL OBRIGATÓRIO
========================================

Criar:
docs/RELATORIO_EXECUCAO_AUTONOMA.md

Com:
- Arquivos modificados
- Problemas encontrados
- Correções feitas
- Pontos que exigiriam decisão humana (sem aplicar)
- Confirmação explícita de que regras de negócio não foram alteradas

EXECUTAR TUDO EM LOTES LÓGICOS DE COMMITS.
NÃO PARAR.
NÃO PEDIR CONFIRMAÇÃO.