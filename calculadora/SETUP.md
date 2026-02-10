# ⚙️ Configuração Inicial - Sistema de Precificação

## 🎯 Passo a Passo OBRIGATÓRIO

### 1. Editar Tabela de Tubos (kg/m)

**Arquivo**: `/domains/precificacao/engine/defaultTables.ts`

**Localização**: Linha ~28

```typescript
export const DEFAULT_TUBE_KG_PER_METER: Record<string, number> = {
  // ⚠️ VALORES ZERADOS - SUBSTITUA PELOS REAIS DA SUA FÁBRICA
  tuboRedondo: 0,        // Ex: 1.09 kg/m
  tuboQuadrado: 0,       // Ex: 1.42 kg/m
  tuboRetangular: 0,     // Ex: 1.17 kg/m
};
```

#### Como obter kg/m real:

**Opção A - Calculadora** (para perfis simples):
```
kg/m = (Perímetro × espessura × densidade) / 1000

Exemplo: Tubo quadrado 40×40mm, espessura 1.2mm
Perímetro = 4 × 40 = 160mm
kg/m = (160 × 1.2 × 7.9) / 1000 = 1.52 kg/m
```

**Opção B - Tabelas do fabricante** (mais preciso):
- Consulte catálogo do seu fornecedor
- Procure por "peso linear" ou "kg/m"

**Opção C - Pesagem real**:
- Corte 1 metro de tubo
- Pese em balança de precisão

---

### 2. Editar Tabela de Cantoneiras (kg/m)

**Arquivo**: `/domains/precificacao/engine/defaultTables.ts`

**Localização**: Linha ~43

```typescript
export const DEFAULT_ANGLE_KG_PER_METER: Record<string, number> = {
  // ⚠️ FORMATO: "ladoA×ladoB×espessura"
  "30x30x3": 0,          // Ex: 1.35 kg/m
  "40x40x3": 0,          // Ex: 1.82 kg/m
  cantoneiraPadrao: 0,   // Fallback genérico
};
```

#### Chave DEVE ser igual ao formato no builder:

```typescript
// O builder de cantoneira gera:
angleKey: `${ladoA}×${ladoB}×${espessura}`

// Logo, para cantoneira 30×30×3mm:
"30x30x3": 1.35
```

---

### 3. Editar Tabela de Acessórios (R$ unitário)

**Arquivo**: `/domains/precificacao/engine/defaultTables.ts`

**Localização**: Linha ~56

```typescript
export const DEFAULT_ACCESSORY_UNIT_PRICE: Record<string, number> = {
  // ⚠️ VALORES ZERADOS - COLOQUE PREÇOS REAIS
  peNivelador: 0,        // Ex: 8.50
  maoFrancesa: 0,        // Ex: 22.00
  rodizio: 0,            // Ex: 35.00
  valvula: 0,            // Ex: 18.00
  mangueira: 0,          // Ex: 12.00
  joelho: 0,             // Ex: 15.00
  pedal: 0,              // Ex: 45.00
  bicaAlta: 0,           // Ex: 65.00
  bicaBaixa: 0,          // Ex: 48.00
  mdf: 0,                // Ex: 30.00 (por porta)
};
```

#### Importante:
- SKU deve bater EXATAMENTE com os usados nos builders
- Se adicionar novo acessório, adicione aqui também

---

### 4. Editar Tabela de Processos (R$/hora)

**Arquivo**: `/domains/precificacao/engine/defaultTables.ts`

**Localização**: Linha ~20

```typescript
export const DEFAULT_PROCESS_COST_PER_HOUR: Record<ProcessKind, number> = {
  cut: 0,                // Ex: 85 (corte)
  bend: 0,               // Ex: 95 (dobra)
  weld: 0,               // Ex: 110 (solda)
  finish: 0,             // Ex: 70 (acabamento)
  assembly: 0,           // Ex: 65 (montagem)
  installation: 0,       // Ex: 120 (instalação)
};
```

#### Como calcular custo/hora:

```
Custo/hora = (Salário mensal + encargos + overhead) / horas trabalhadas

Exemplo:
- Soldador: R$ 3.500 + 80% encargos = R$ 6.300/mês
- 176 horas/mês (22 dias × 8h)
- Overhead máquina: R$ 40/h
Custo/hora = (6300 / 176) + 40 = R$ 75,80
```

---

### 5. Configurar Preço/kg do Inox

**Local**: Interface web → Botão "Configurações"

**Valor típico**: R$ 45,00 a R$ 65,00 (304) | R$ 75,00 a R$ 95,00 (316)

- Consulte cotação do seu fornecedor
- Atualize mensalmente (preço varia)

---

### 6. Configurar Markup (Fator de Venda)

**Local**: Interface web → Botão "Configurações"

**Valor sugerido**: 2.5 a 3.5

```
Preço = Custo × Markup

Exemplo:
- Custo: R$ 500
- Markup: 3
- Preço: R$ 1.500
```

**OBS**: O sistema tem margem mínima de 25% (anti-prejuízo ativo). Se o markup resultar em margem menor, o preço mínimo seguro será usado.

---

## 🧪 Teste de Validação

### Teste 1: Bancada Simples

1. Selecione "Bancadas"
2. Tipo: "Bancada sem Cuba"
3. Preencha:
   - Comprimento: 1200mm
   - Largura: 700mm
   - Espessura: 1.2mm
   - Altura frontal: 150mm
   - 4 pés (tubo quadrado)
   - Altura pés: 850mm
4. Configure:
   - Preço/kg: R$ 50,00
   - Markup: 3
5. Clique "Calcular"

**Resultado esperado**:
- Custo de chapas > 0
- Custo de tubos > 0 (se cadastrou kg/m)
- Preço sugerido = custo × 3 (ou preço mínimo)

---

### Teste 2: Validação de Erro

1. Selecione "Cantoneira"
2. Preencha:
   - Comprimento: 2000mm
   - Lado A: 30mm
   - Lado B: 30mm
   - Espessura: 3mm
3. **NÃO cadastre** `"30x30x3"` na tabela
4. Clique "Calcular"

**Resultado esperado**:
```
❌ Toast de erro:
"Sem kg/m cadastrado para cantoneira: 30x30x3"
```

Se o erro aparecer = validação funcionando ✅

---

## 📊 Checklist de Lançamento

Antes de usar em produção:

- [ ] Cadastrei kg/m de TODOS os tubos usados
- [ ] Cadastrei kg/m de TODAS as cantoneiras usadas
- [ ] Cadastrei preço unitário de TODOS os acessórios
- [ ] Cadastrei custo/h de TODOS os processos
- [ ] Testei 1 produto de cada tipo
- [ ] Comparei resultado com orçamento manual (validação)
- [ ] Atualizei preço/kg do inox (último mês)
- [ ] Defini markup conforme política comercial
- [ ] Verifiquei margem mínima (25% é adequado?)

---

## 🚨 Erros Comuns

### "Sem kg/m cadastrado para tubo: tuboQuadrado"

**Causa**: Valor zerado ou chave errada na tabela

**Solução**:
```typescript
// Verifique se está assim:
tuboQuadrado: 0,  // ❌ ERRADO

// Corrija para:
tuboQuadrado: 1.42,  // ✅ CORRETO (exemplo)
```

---

### "Não foi possível calcular - Preço/kg do inox inválido"

**Causa**: Preço/kg não foi configurado ou está zerado

**Solução**:
- Clique em "Configurações"
- Insira preço/kg válido (ex: 50)
- Tente calcular novamente

---

### "Dados incompletos - Para bancada com cuba, informe as dimensões"

**Causa**: Tipo "Bancada com Cuba" sem dimensões da cuba

**Solução**:
- Role até "Dimensões da Cuba"
- Preencha L, W, H, Espessura
- Calcule novamente

---

## 🔄 Manutenção Mensal

1. **Atualizar preço/kg do inox** (fornecedor)
2. **Revisar custos de acessórios** (inflação)
3. **Validar kg/m** (se trocar fornecedor de perfis)
4. **Ajustar markup** (conforme margem desejada)

---

## 📞 Suporte

Em caso de dúvidas sobre:

- **Cálculo de kg/m**: Consulte catálogo do fabricante
- **Preço de mercado**: Consulte fornecedor ou índices INDA
- **Margem adequada**: Consulte gestor comercial
- **Erros técnicos**: Verifique console do navegador (F12)

---

**Sistema pronto para uso após configuração completa! ✅**
