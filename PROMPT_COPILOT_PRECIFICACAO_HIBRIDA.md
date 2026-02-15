# Prompt para o Copilot — Evolução da Precificação (INOX-VAL)

Você é um engenheiro de software sênior.
Quero que você implemente no projeto **INOX-VAL** uma **precificação híbrida**:
- manter o cálculo atual (material + mão de obra + margem + custo fixo)
- adicionar um fator histórico baseado nos dados coletados do SolidWorks

## Contexto
Repositório: `INOX-VAL`
Arquivos de dados já disponíveis na raiz:
- `levantamento_ordens_2022.csv`
- `ordens_com_dimensoes.csv`

Campos relevantes:
- `Codigo, Descricao, Familia, Subfamilia, Segmento, TemProjeto, TemBloco, TemRender`
- `Dimensao, TemDim`

## Objetivo
Melhorar a assertividade do preço sem quebrar a fórmula atual.

## Estratégia (MVP)
1. **Manter preço atual** como `preco_base_atual`.
2. Criar **fator_historico** por produto usando:
   - família/subfamília
   - faixa de dimensão (largura/profundidade/altura)
   - proxy de complexidade (`TemProjeto`, `TemBloco`, `TemRender`)
3. Gerar **preco_recomendado**:
   - `preco_recomendado = preco_base_atual * fator_historico`
4. Retornar também faixa sugerida:
   - `preco_min = preco_recomendado * 0.93`
   - `preco_ideal = preco_recomendado`
   - `preco_max = preco_recomendado * 1.08`

## Regras iniciais do fator_historico
Defina em arquivo de configuração JSON para facilitar ajuste sem mexer no código.

Exemplo de composição:
- `fator_historico = fator_familia * fator_subfamilia * fator_dimensao * fator_complexidade`

Complexidade inicial:
- +0.20 se `TemProjeto=True`
- +0.10 se `TemBloco=True`
- +0.05 se `TemRender=True`

Transforme a soma em fator multiplicativo:
- `fator_complexidade = 1 + bonus_total`

## Requisitos técnicos
- Não quebrar as telas existentes de orçamento/precificação.
- Código modular:
  - parser de dimensão
  - serviço de histórico
  - serviço de precificação híbrida
- Tipagem forte (TypeScript).
- Tratamento de erro e fallback:
  - se faltar histórico, usar `fator_historico = 1.0`
- Logs básicos para depuração.

## Entregáveis de código
1. Novo módulo: `src/.../precificacao-hibrida/` (sugira a melhor localização no projeto)
2. Parser de dimensão robusto (`1500X700X900`, variações com espaços e `x` minúsculo)
3. Loader dos CSVs
4. Serviço que calcula `fator_historico`
5. Integração com fluxo atual de orçamento
6. Exibição na UI:
   - preço base atual
   - fator histórico
   - preço recomendado
   - faixa min/ideal/max
7. Arquivo de config (ex.: `config_precificacao_hibrida.json`)
8. Testes unitários para:
   - parser de dimensão
   - cálculo de fator
   - fallback sem histórico

## Critérios de aceitação
- Projeto compila e roda normalmente.
- Para produtos com histórico, mostrar recomendação híbrida.
- Para produtos sem histórico, manter comportamento atual.
- Fórmulas e pesos documentados em markdown no repositório.

## Entregue nesta ordem
1. Plano técnico curto (arquitetura + arquivos que serão alterados)
2. Implementação em blocos de arquivos
3. Checklist final de validação manual
