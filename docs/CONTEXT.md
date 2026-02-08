CONTEXT.md — PROJETO INOX-VAL
VISÃO GERAL

Projeto: INOX-VAL
Tipo: ERP industrial para fabricação de produtos em aço inox
Stack: Vite + React + TypeScript + Firebase Auth + Firestore + React Query

Objetivo atual:
Deixar o sistema 100% utilizável em ambiente real de fábrica, com foco principal em:

Produção funcionando de ponta a ponta com segurança multi-tenant

Evolução da calculadora industrial para um sistema de produtos parametrizados integrado ao ERP

REGRAS GLOBAIS (CRÍTICAS)

Estas regras não podem ser violadas:

Multi-tenant obrigatório por empresaId

Nenhuma leitura ou escrita pode acessar dados de outra empresa

Todas as queries devem filtrar por empresaId

Não alterar a lógica atual de Produção

Produção já está operacional

Mudanças só são permitidas se forem:

Correções de segurança

Correções de integridade de dados

Melhorias internas sem mudar o fluxo

Não modificar regras do Firestore

O modelo novo deve se encaixar nas regras atuais

Nada pode exigir afrouxar segurança

Mudanças devem ser incrementais

Pequenos PRs

Baixo risco

Sistema sempre funcional

MÓDULO DE PRODUÇÃO (EXISTENTE E ESTÁVEL)
Estrutura principal no Firestore
ordens_producao/{ordemId}
ordens_producao/{ordemId}/items/{itemId}
movimentacoes (por item ou coleção equivalente já usada)

Cada ORDEM DE PRODUÇÃO tem:

empresaId

Dados gerais da ordem

Cada ITEM DE PRODUÇÃO tem:

empresaId

ordemId

setorAtual

status

Histórico registrado em movimentações

Invariantes obrigatórias

Para todo item de produção:

empresaId deve ser igual ao da ordem

ordemId deve bater com o documento pai

setorAtual deve ser um setor válido

status deve ser um status válido

Para toda movimentação:

Referenciar item existente

Conter empresaId

Conter setor/status de origem e destino

Conter timestamp e usuário

O QUE PRECISA SER VALIDADO AGORA (PRODUÇÃO)
Fluxo 1 — Ordem aparece na produção

Criar ordem de produção

Confirmar que aparece nas telas de Produção e no Dashboard TV

Fluxo 2 — Item passa por múltiplos setores

Exemplo:
Corte → Dobra → Solda

Validar:

setorAtual é atualizado corretamente

status acompanha o estado real

Uma movimentação é registrada a cada troca

Fluxo 3 — Conclusão de item

Item marcado como concluído

status = Concluido

Progresso 100%

Nenhum avanço adicional permitido

Fluxo 4 — Teste multi-tenant

Usuário da empresa A não pode ver dados da empresa B

Firestore deve bloquear acesso direto por ID

PRÓXIMA EVOLUÇÃO: CALCULADORA PARAMETRIZADA

A calculadora atual (focada em bancadas) será transformada em um sistema de produtos configuráveis, mas sem alterar Produção.

Objetivo

Permitir que o ERP gere automaticamente:

BOM real

Consumo de chapa

Itens de produção

NOVO DOMÍNIO (SEM IMPACTAR PRODUÇÃO)
1. Catálogo de produtos parametrizados
produtos_parametrizados/{produtoId}


Campos:

empresaId

tipo (BANCADA, GABINETE, ARMARIO, MESA…)

nome

ativo

versaoAtual

2. Versões de engenharia
produtos_parametrizados/{produtoId}/versoes/{versaoId}


Campos:

schemaParametros (definição dos campos editáveis)

engineKey (ex: bancada_v1)

Regras e limites técnicos

3. Resultados de cálculo (imutáveis)
geracoes_engenharia/{geracaoId}


Campos:

empresaId

produtoId

versao

parametrosUsados

resultado:

bom[]

consumoChapa[]

custos[]

hashParametros

createdAt, createdBy

ENGINE DE ENGENHARIA

A lógica da calculadora sai da UI e vira um motor isolado.

Exemplo inicial:

/domains/engenharia/engines/bancada/v1.ts


Entrada:

Parâmetros normalizados (L, P, H, espessuras, etc.)

Saída padronizada:

BOM técnica

Consumo de chapa

Avisos técnicos

INTEGRAÇÃO COM ORÇAMENTOS

Itens de orçamento poderão referenciar um produto parametrizado:

Campos opcionais no item:

produtoParamRef

geracaoRef

snapshotResultado

Itens antigos continuam funcionando sem isso.

PONTE FUTURA PARA PRODUÇÃO

Quando um orçamento for aprovado:

Criar ordens_producao normalmente

Para cada item parametrizado:

Criar item na subcoleção items

Preencher exatamente os campos que Produção já espera

Adicionar apenas rastreio extra:

origem = "parametrizado"

geracaoId

produtoParamId

Produção continua funcionando sem saber que veio da calculadora.