# EVERYCODE_MASTER_EXECUTION (Refatorado)

Objetivo: concluir o plano com respostas curtas e execucao incremental, evitando estouro de TPM. 
Regras globais:
- Respostas curtas (max 8 linhas).
- Nunca despejar arquivos inteiros no chat.
- Trabalhar em blocos pequenos e registrar no RELATORIO_FINAL.
- Evitar comandos que geram grande volume de saida.
- Nunca executar comandos que gerem saida massiva. Se houver risco de volume alto, usar filtros (head, tail, Select-Object, rg) ou limitar linhas. Se o comando puder estourar TPM, dividir em passos menores e parar apos a primeira amostra.
- Se ocorrer erro de TPM, aguardar o tempo solicitado, ajustar o comando que causou o estouro (reduzir escopo/saida) e continuar a partir do ultimo passo valido.

2 / 5 un                                                                                                            │
   Aço Inox                                                                                                            │
   2 / 5 un                                                                                                            │
   Parafuso                                                                                                            │
   0 / 1 un                                                                                                            │
                                                                                                                       │
   EVITAR ESSES ERROS DE DE ESCRITA Ã§Ã£ QUE ESTA COANTECNEDO                                                          │
                                                                                                                       │
   AÃ§Ãµes                                                                                                             │
   AÃ§Ãµes RÃ¡pidas                                                                                                    │
   Acesso rÃ¡pido Ã s principais funcionalidades   
   
## Fase A - Auditoria
A1. Inventario de rotas, paginas e modulos.
A2. Scripts: typecheck, build, check e validate.ps1.

## Fase B - Sistema 100% utilizavel
B1. Auth: login/signup/reset/logout funcionando.
B2. Rotas protegidas: sem tela branca; sem acesso redireciona.
B3. CRUD por services e multi-tenant em todos os modulos principais.
B4. Producao: nao alterar fluxo; corrigir inconsistencias.
B5. UX: toasts, loading, vazios sem crash.
B6. Build warnings e chunking (se necessario).

## Fase C - Precificacao
C0. Planilha em /data.
C1. Extracao -> model + inventario.
C2. Engine (formula evaluator) + compute.
C3. Teste equivalencia.
C4. UI minima + persistencia.

## Fase D - Relatorio final
Atualizar docs/RELATORIO_FINAL.md e validar build.


