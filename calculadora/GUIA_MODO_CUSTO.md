# 🎯 GUIA: Como Trocar o Modo de Custo de Chapa

## 📍 Onde Configurar

1. **Abra o sistema de precificação**
2. **Clique no botão "Configurações"** (ícone de engrenagem no topo direito)
3. **Você verá um painel azul com as configurações globais**

---

## 💰 Modo de Custo de Chapa

### **USADA (kg útil + scrap%)** ✅ **[RECOMENDADO para peças únicas]**
- Cobra apenas o material que será **efetivamente usado** na peça
- Adiciona um percentual de desperdício mínimo configurável
- **Sobra da chapa vira ESTOQUE reutilizável**
- **Exemplo:** Cuba de 500×500mm em chapa 1500×1250mm
  - Área útil: 0,25 m² (2,37 kg)
  - Desperdício 15%: +0,36 kg
  - **Total cobrado: 2,73 kg** (não 14,81 kg da chapa inteira!)

### **COMPRADA (chapa inteira)** ⚠️ **[Use com cuidado]**
- Cobra a **chapa inteira** que precisa ser comprada
- **Sobra vira PERDA TOTAL**
- Use apenas quando:
  - Cliente está comprando um lote que consome chapas inteiras
  - Sobra não será reaproveitada
  - Precisa precificar considerando compra de material

---

## 📊 Desperdício Mínimo (%)

**Aparece apenas quando modo = "USADA"**

- **10-20%:** Recomendado para cubas e peças pequenas
- **5-10%:** Recomendado para tampos grandes e mesas
- **15%:** Valor padrão (cobre cortes, rebarbas, pequenas perdas)

Este percentual é adicionado sobre o **kg útil calculado**, não sobre a chapa comprada.

---

## 🔄 Seleção Automática de Chapa

Agora o modo "Automático" escolhe a chapa que **minimiza CUSTO TOTAL**, não desperdício.

Isso significa que entre:
- Chapa 1500×1250 = 1,875 m² → custo menor
- Chapa 2000×1250 = 2,500 m² → custo maior

O sistema escolhe **automaticamente a 1500×1250** mesmo que tenha um pouco mais de desperdício relativo.

---

## 🧮 Exemplo Prático: Cuba Única

### ❌ ANTES (modo "comprada")
```
Cuba 500×500×200mm
Chapa comprada: 1500×1250 = 14,81 kg × R$ 37 = R$ 548
Processos: R$ 118
Custo base: R$ 666,56
Markup 3: R$ 1.999,68
```

### ✅ DEPOIS (modo "usada" + 15% scrap)
```
Cuba 500×500×200mm
Kg útil: 2,37 kg
Scrap 15%: +0,36 kg
Total: 2,73 kg × R$ 37 = R$ 101,01
Processos: R$ 118
Custo base: R$ 219,01
Markup 3: R$ 657,03
```

**Redução de 67% no preço!** 🎉

---

## ⚙️ Configuração Recomendada por Produto

| Produto | Modo Recomendado | Scrap % |
|---------|-----------------|---------|
| Cuba única | USADA | 15-20% |
| Bancada com cuba | USADA | 15% |
| Tampo grande | USADA | 5-10% |
| Lote de cubas (10+) | COMPRADA | - |
| Chapa plana customizada | USADA | 10% |

---

## 🛡️ Proteção Anti-Prejuízo

Independente do modo escolhido, o sistema **sempre garante margem mínima de 25%**:

```
Preço mínimo seguro = custo base / 0,75
```

Se o markup configurado resultar em preço menor, o sistema ajusta automaticamente.

---

## 🚀 Como Testar Agora

1. Clique em **"Configurações"**
2. Altere **"Modo de Custo"** para **"USADA"**
3. Ajuste **"Desperdício Mínimo"** para **15%**
4. Preencha uma cuba (ex: 500×500×200mm)
5. Clique em **"Calcular Orçamento"**
6. Compare os resultados! 🎯
