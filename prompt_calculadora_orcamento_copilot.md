Você é um engenheiro de software sênior e arquiteto de dados.
Quero que você crie uma **calculadora de orçamento industrial** usando dados históricos de produtos SolidWorks.

## Contexto
Tenho dois arquivos CSV já gerados:
1. `levantamento_ordens_2022.csv` com colunas:
   - Codigo, Descricao, Pasta, Familia, Subfamilia, Segmento, TemProjeto, TemBloco, TemRender
2. `ordens_com_dimensoes.csv` com colunas:
   - Codigo, Descricao, Dimensao, TemDim

As ordens seguem padrão `Sxxxxx - descrição` e muitas descrições contêm dimensão (ex.: `1500X700X900`).

## Objetivo
Construir um sistema local que:
1. Faça ingestão dos CSVs
2. Limpe/normalize os dados (acentuação, encoding, espaços, separadores)
3. Extraia variáveis de engenharia da descrição
4. Gere um cálculo de orçamento sugerido por produto
5. Exponha isso em API + interface simples

## Regras de negócio desejadas (MVP)
1. Chave principal: `Codigo`
2. Se houver dimensão, separar em `largura_mm`, `profundidade_mm`, `altura_mm`
3. Criar `volume_bruto_mm3` e `area_base_mm2`
4. Peso de complexidade:
   - +0.20 se `TemProjeto = True`
   - +0.10 se `TemBloco = True`
   - +0.05 se `TemRender = True`
5. Fator por família (configurável em arquivo `.json`)
6. Fórmula inicial de orçamento (parametrizável):
   - `preco = base_familia + (coef_area * area_base_m2) + (coef_volume * volume_m3) + (coef_complexidade * fator_complexidade)`
7. Retornar também faixa de confiança (baixa/média/alta) com base na completude dos dados

## Stack desejada
- Backend: Python + FastAPI
- Dados: pandas
- Persistência: SQLite
- Frontend: Streamlit (ou React simples, escolha a mais rápida)
- Testes: pytest

## O que você deve entregar
1. Estrutura de pastas do projeto
2. Código completo (arquivos principais)
3. Script de carga inicial dos CSVs
4. Endpoint `/orcamento` recebendo ao menos:
   - codigo (opcional)
   - familia (opcional)
   - dimensoes (opcional)
5. Endpoint `/health`
6. Interface mínima com formulário para simulação
7. Arquivo `config_precificacao.json` com parâmetros editáveis
8. README com instruções de execução
9. Testes unitários para parser de dimensão e fórmula de preço

## Requisitos técnicos importantes
- Tipagem clara
- Tratamento de erro amigável
- Logs básicos
- Código modular (parser, regras de preço, API, UI)
- Sem hardcode de caminho absoluto

## Entregue primeiro
1. Plano técnico curto
2. Estrutura de diretórios
3. Depois gere os arquivos em blocos, prontos para copiar no VS Code
