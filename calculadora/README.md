# Sistema de Precificação Industrial - Inox

Sistema completo de orçamentos para produtos em aço inoxidável com cálculo industrial preciso usando nesting automático de chapas.

## 🎯 Características Principais

### Motor de Cálculo V2
- **Nesting Automático**: Otimização de aproveitamento de chapas com cálculo real de desperdício
- **Anti-Prejuízo**: Margem mínima de 25% garantida automaticamente
- **Cálculo por kg/m**: Tubos e cantoneiras calculados por peso real (kg/metro)
- **Validações Rigorosas**: Sistema bloqueia cálculo se faltar dados técnicos

### 11 Tipos de Produtos

1. **Bancadas** (3 modos)
   - Somente Cuba
   - Bancada sem Cuba
   - Bancada com Cuba (requer dimensões da cuba)

2. **Lavatórios**
   - Padrão (modelos 750/850/FDE)
   - Cirúrgico (dimensões customizadas)

3. **Prateleiras**
   - Lisa ou Gradeada
   - Com/sem borda dobrada
   - Opcional: mão francesa

4. **Mesas**
   - Tampo + estrutura tubular
   - 4 a 7 pés
   - Prateleira inferior opcional

5. **Estante Cantoneira**
   - Estrutura em cantoneira (perfil L)
   - Múltiplos planos
   - Opcional: rodízios

6. **Estante Tubo**
   - Estrutura tubular
   - Múltiplos planos

7. **Coifas**
   - 3 ou 4 águas
   - Duto, curva e chapéu opcionais

8. **Chapa Plana**
   - Produto simples (dimensões + espessura)

9. **Material Redondo**
   - ⚠️ Requer tabela técnica de repuxo (não gera BOM sem modelo)

10. **Cantoneira**
    - Perfil L (ladoA × ladoB × espessura)

11. **Portas e Batentes**
    - Face frente/verso
    - Batente separado
    - Opcional: preenchimento MDF

## 📊 Fluxo de Cálculo

```
1. Preencher formulário do produto
   ↓
2. Gerar BOM física (buildBOMByTipo)
   ↓
3. Montar tabelas de preços
   ↓
4. Validar (validateBeforeQuoteV2)
   ↓
5. Calcular orçamento (quoteWithSheetSelectionV2)
   ↓
6. Exibir resultado com nesting
```

## 🔧 Configurações Globais

### Obrigatórias
- **Preço/kg Inox**: Custo do material por quilograma
- **Fator de Venda (Markup)**: Multiplicador sobre o custo base

### Opcionais
- **Modo de Chapa**: Automático (menor desperdício) ou Manual
- **Chapa Manual**: Seleção de chapa específica (2000×1250, 3000×1250, etc.)

## ⚠️ Pontos Críticos (Bloqueiam com Toast)

### 1. Bancada com Cuba
**Exigência**: Dimensões da cuba (L, W, H, espessura)
```typescript
cuba: { L: 600, W: 400, H: 300, t: 1.2 }
```

### 2. Lavatório Padrão
**Exigência**: Modelo selecionado (750/850/FDE)

### 3. Tubos e Cantoneiras
**Exigência**: kg/m cadastrado na tabela
```typescript
tubeKgPerMeter: {
  "tuboQuadrado": 1.42,
  "tuboRedondo": 1.09,
}
```

### 4. Acessórios
**Exigência**: Preço unitário cadastrado
```typescript
accessoryUnitPrice: {
  "peNivelador": 8.50,
  "maoFrancesa": 22.00,
}
```

### 5. Processos
**Exigência**: Custo/hora cadastrado
```typescript
processCostPerHour: {
  cut: 85,
  weld: 110,
}
```

## 📁 Estrutura de Arquivos

```
/domains/precificacao/engine/
  ├── bomBuilder.ts        # Lógica dos 11 produtos
  ├── quoteV2.ts          # Motor de cálculo + validação
  └── defaultTables.ts    # Tabelas padrão (EDITE OS VALORES!)

/components/
  ├── PrecificacaoPage.tsx    # Página principal
  ├── ConfigPanel.tsx         # Painel de configurações
  ├── QuoteResults.tsx        # Exibição de resultados
  └── forms/
      ├── BancadasForm.tsx
      ├── LavatoriosForm.tsx
      ├── PrateleirasForm.tsx
      ├── MesasForm.tsx
      ├── EstanteCantoneiraForm.tsx
      ├── EstanteTuboForm.tsx
      ├── CoifasForm.tsx
      ├── ChapaPlanaForm.tsx
      ├── MaterialRedondoForm.tsx
      ├── CantoneiraForm.tsx
      └── PortasBatentesForm.tsx
```

## 🚀 Como Usar

1. **Selecione o tipo de produto** na barra lateral
2. **Preencha o formulário** com as dimensões e opções
3. **Configure preço/kg e markup** (botão Configurações no topo)
4. **Clique em "Calcular Orçamento"**
5. **Revise o resultado** com detalhamento de custos e nesting

## 💰 Resultado do Orçamento

O sistema exibe:

- **Preço Sugerido**: max(custo × markup, preço mínimo seguro)
- **Preço Mínimo Seguro**: custo / 0.75 (margem 25%)
- **Custo Base**: soma de todos os componentes

### Detalhamento
- Chapas (com nesting e eficiência)
- Tubos (kg total)
- Cantoneiras (kg total)
- Acessórios (unitário × quantidade)
- Processos (minutos × custo/hora)
- Overhead (% sobre subtotal)

### Nesting de Chapas
Para cada grupo (família + espessura):
- Chapa selecionada
- Chapas usadas
- Área útil vs comprada
- Eficiência (%)
- Desperdício (%)
- Kg comprado

## 📋 Cadastros Necessários

### ANTES DE USAR, EDITE: `/domains/precificacao/engine/defaultTables.ts`

#### 1. Tubos (kg/m)
```typescript
export const DEFAULT_TUBE_KG_PER_METER: Record<string, number> = {
  tuboRedondo: 1.09,      // ⚠️ SUBSTITUA PELOS VALORES REAIS
  tuboQuadrado: 1.42,
  tuboRetangular: 1.17,
};
```

#### 2. Cantoneiras (kg/m)
```typescript
export const DEFAULT_ANGLE_KG_PER_METER: Record<string, number> = {
  "30x30x3": 1.35,        // ⚠️ SUBSTITUA PELOS VALORES REAIS
  "40x40x3": 1.82,
  cantoneiraPadrao: 1.50,
};
```

#### 3. Acessórios (R$ unitário)
```typescript
export const DEFAULT_ACCESSORY_UNIT_PRICE: Record<string, number> = {
  peNivelador: 8.50,      // ⚠️ SUBSTITUA PELOS VALORES REAIS
  maoFrancesa: 22.00,
  rodizio: 35.00,
  valvula: 18.00,
};
```

#### 4. Processos (R$/hora)
```typescript
export const DEFAULT_PROCESS_COST_PER_HOUR: Record<ProcessKind, number> = {
  cut: 85,                // ⚠️ SUBSTITUA PELOS VALORES REAIS
  bend: 95,
  weld: 110,
  finish: 70,
  assembly: 65,
  installation: 120,
};
```

## 🎨 Interface

- **Design Responsivo**: Funciona em desktop e tablet
- **Validação em Tempo Real**: Toast mostra erros antes de calcular
- **Sticky Header**: Barra superior fixa com acesso rápido às configurações
- **Sidebar Sticky**: Seleção de produto sempre visível
- **Cards Organizados**: Formulário, configurações e resultados separados

## 🔒 Garantias de Segurança

1. **Anti-Prejuízo Ativo**: Margem mínima de 25% sempre aplicada
2. **Validação Completa**: Não calcula sem todos os dados necessários
3. **Desperdício Real**: Baseado em nesting, não em percentual fixo
4. **Tabelas Obrigatórias**: Sistema bloqueia se faltar kg/m ou preços

## 📝 Observações Importantes

### Blanks de Dobra
- O sistema usa **bounding box** (retângulo externo)
- Para peças dobradas, refine o blank real usando suas regras de dobra
- Exemplo: espelho de bancada (borda dobrada) → adicionar descontos de dobra

### Material Redondo
- Produto **não gera BOM automaticamente**
- Requer tabela técnica de repuxo específica
- Mapeie para blank circular equivalente ou kg fixo por modelo

### Coifas
- Cálculo usa **envelope aproximado**
- Refine as peças (águas) conforme geometria real
- Planificação de superfícies inclinadas deve ser ajustada

## 🛠️ Próximos Passos Recomendados

1. **Cadastrar valores reais** em defaultTables.ts
2. **Testar com produto real** (ex: bancada 1200×700)
3. **Validar kg/m** dos perfis com fornecedor
4. **Ajustar blanks de dobra** se necessário
5. **Refinar coifas** com geometria precisa
6. **Implementar MaxRects** (nesting mais preciso que heurística)

---

**Motor V2 - Sistema Industrial de Precificação**
*Desenvolvido para eliminar achismos e garantir lucro em cada orçamento*
