# Relatório de coleta de dados (Disco D:)

## Escopo coletado
- Raiz analisada: `D:\2022`
- Critério de identificação de ordens: pastas com padrão `S<codigo> - <descricao>`
- Arquivo principal gerado: `levantamento_ordens_2022.csv`
- Arquivo auxiliar gerado: `ordens_com_dimensoes.csv`

## Resultado geral
- **Total de ordens identificadas:** 1018
- **Ordens com pasta `PROJETO`:** 862
- **Ordens com pasta `BLOCO`:** 629
- **Ordens com pasta `RENDER`:** 628
- **Ordens com dimensão detectada no nome:** 881

## Estrutura dos dados no CSV
Campos em `levantamento_ordens_2022.csv`:
- `Codigo`
- `Descricao`
- `Pasta`
- `Familia`
- `Subfamilia`
- `Segmento`
- `TemProjeto`
- `TemBloco`
- `TemRender`

Campos em `ordens_com_dimensoes.csv`:
- `Codigo`
- `Descricao`
- `Dimensao`
- `TemDim`

## Famílias com maior volume
1. MOBILIARIO (263)
2. REDES (138)
3. REFRIGERAÇÃO (129)
4. DISTRIBUIÇÃO (116)
5. AUXILIARES (112)
6. COCÇÃO (86)

## Observações
- Existem caracteres com codificação quebrada (acentuação) em parte dos nomes; recomenda-se normalização UTF-8 no pipeline.
- O padrão de código `Sxxxxx` está consistente para boa parte dos produtos e é útil como chave primária.
- As dimensões no nome (ex.: `1500X700X900`) podem ser usadas para cálculo paramétrico de custo.
