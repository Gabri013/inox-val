# ✂️ SNIPPETS PRONTOS PARA COPY-PASTE

## 📋 Use estes blocos exatos para implementar rapidamente

---

## 1️⃣ QUITEV2.TS - TIPO NOVO

**Localização:** Linha 20 (após `export type SheetMode`)

```typescript
export type SheetCostMode = "bought" | "used"; // NOVO: modo de custo
```

---

## 2️⃣ QUITEV2.TS - INTERFACE SHEETPOLICY

**Localização:** Linhas 96-101 (SUBSTITUIR interface completa)

```typescript
export interface SheetPolicy {
  mode: SheetMode;
  manualSheetId?: string;
  costMode: SheetCostMode;    // NOVO: "bought" ou "used"
  scrapMinPct: number;        // NOVO: ex: 0.15 = 15% de desperdício mínimo
}
```

---

## 3️⃣ QUITEV2.TS - LÓGICA DE CÁLCULO

**Localização:** Linhas 299-340 (SUBSTITUIR todo o bloco do loop `for (const [groupKey, rects]`)

```typescript
for (const [groupKey, rects] of groups.entries()) {
  const [family, thicknessStr] = groupKey.split("|");
  const thicknessMm = Number(thicknessStr);

  const policy = sheetPolicyByFamily[family] ?? { 
    mode: "auto" as const, 
    costMode: "bought" as const,
    scrapMinPct: 0.15 
  };

  let chosen: SheetCatalogItem | undefined;
  if (policy.mode === "manual") {
    chosen = tables.sheetCatalog.find(s => s.id === policy.manualSheetId);
    if (!chosen) warnings.push(`Chapa manual inválida para família "${family}".`);
  } else {
    chosen = pickSheetAuto(rects, tables.sheetCatalog);
  }
  if (!chosen) chosen = tables.sheetCatalog[0];

  const nesting = estimateNesting(rects, chosen);
  
  // NOVO: Calcular custo baseado no modo
  let kgBought: number;
  let costSheet: number;
  
  if (policy.costMode === "used") {
    // MODO "USADA": kg útil × (1 + scrapMinPct)
    const kgUsed = sheetKgFromAreaM2(nesting.areaUsedM2, thicknessMm, tables.densityKgPerM3);
    kgBought = kgUsed * (1 + policy.scrapMinPct);
    costSheet = kgBought * tables.inoxKgPrice;
    warnings.push(`Família "${family}": modo USADO (kg útil + ${(policy.scrapMinPct * 100).toFixed(0)}% scrap). Sobra vira estoque.`);
  } else {
    // MODO "COMPRADA": área comprada × espessura × densidade
    kgBought = sheetKgFromAreaM2(nesting.areaBoughtM2, thicknessMm, tables.densityKgPerM3);
    costSheet = kgBought * tables.inoxKgPrice;
  }

  nestingByGroup.push({
    groupKey,
    nesting,
    kgBought: round2(kgBought),
    costSheet: round2(costSheet),
  });

  costSheetTotal += costSheet;
}
```

---

## 4️⃣ PRECIFICACAOPAGE.TSX - NOVOS ESTADOS

**Localização:** Após linha 45 (após `const [showConfig, setShowConfig]`)

```typescript
const [sheetCostMode, setSheetCostMode] = useState<"bought" | "used">("used");
const [scrapMinPct, setScrapMinPct] = useState(15);
```

---

## 5️⃣ PRECIFICACAOPAGE.TSX - PROPS DO CONFIGPANEL

**Localização:** Dentro do bloco `<ConfigPanel />` (linha ~180)

**SUBSTITUIR:**
```typescript
<ConfigPanel
  precoKgInox={precoKgInox}
  setPrecoKgInox={setPrecoKgInox}
  fatorVenda={fatorVenda}
  setFatorVenda={setFatorVenda}
  sheetMode={sheetMode}
  setSheetMode={setSheetMode}
  sheetSelected={sheetSelected}
  setSheetSelected={setSheetSelected}
/>
```

**POR:**
```typescript
<ConfigPanel
  precoKgInox={precoKgInox}
  setPrecoKgInox={setPrecoKgInox}
  fatorVenda={fatorVenda}
  setFatorVenda={setFatorVenda}
  sheetMode={sheetMode}
  setSheetMode={setSheetMode}
  sheetSelected={sheetSelected}
  setSheetSelected={setSheetSelected}
  sheetCostMode={sheetCostMode}
  setSheetCostMode={setSheetCostMode}
  scrapMinPct={scrapMinPct}
  setScrapMinPct={setScrapMinPct}
/>
```

---

## 6️⃣ PRECIFICACAOPAGE.TSX - SHEETPOLICYBYFAMILY

**Localização:** Linha ~103 (dentro do `handleCalcular`, bloco do loop de famílias)

**SUBSTITUIR:**
```typescript
for (const fam of families) {
  sheetPolicyByFamily[fam] = {
    mode: sheetMode,
    manualSheetId: sheetMode === "manual" ? sheetSelected : undefined,
  };
}
```

**POR:**
```typescript
for (const fam of families) {
  sheetPolicyByFamily[fam] = {
    mode: sheetMode,
    manualSheetId: sheetMode === "manual" ? sheetSelected : undefined,
    costMode: sheetCostMode,
    scrapMinPct: scrapMinPct / 100,
  };
}
```

---

## 7️⃣ CONFIGPANEL.TSX - INTERFACE

**Localização:** Linhas 3-12 (SUBSTITUIR interface completa)

```typescript
interface ConfigPanelProps {
  precoKgInox: number;
  setPrecoKgInox: (value: number) => void;
  fatorVenda: number;
  setFatorVenda: (value: number) => void;
  sheetMode: "auto" | "manual";
  setSheetMode: (value: "auto" | "manual") => void;
  sheetSelected: string;
  setSheetSelected: (value: string) => void;
  sheetCostMode: "bought" | "used";
  setSheetCostMode: (value: "bought" | "used") => void;
  scrapMinPct: number;
  setScrapMinPct: (value: number) => void;
}
```

---

## 8️⃣ CONFIGPANEL.TSX - DESESTRUTURAÇÃO

**Localização:** Linha 14 (SUBSTITUIR parâmetros da função)

```typescript
export function ConfigPanel({
  precoKgInox,
  setPrecoKgInox,
  fatorVenda,
  setFatorVenda,
  sheetMode,
  setSheetMode,
  sheetSelected,
  setSheetSelected,
  sheetCostMode,
  setSheetCostMode,
  scrapMinPct,
  setScrapMinPct,
}: ConfigPanelProps) {
```

---

## 9️⃣ CONFIGPANEL.TSX - NOVOS CAMPOS UI

**Localização:** INSERIR após o campo "Fator de Venda" (linha ~54), ANTES do campo "Modo de Seleção"

```typescript
{/* NOVO: Modo de Custo de Chapa */}
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    💰 Modo de Custo de Chapa
  </label>
  <select
    value={sheetCostMode}
    onChange={(e) => setSheetCostMode(e.target.value as "bought" | "used")}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="used">USADA (kg útil + scrap%) - Sobra vira estoque ✅</option>
    <option value="bought">COMPRADA (chapa inteira) - Sobra vira perda total</option>
  </select>
  <p className="mt-1 text-xs text-gray-600">
    {sheetCostMode === "used" 
      ? "✅ Recomendado para peças únicas: cobra apenas o material usado + desperdício mínimo"
      : "⚠️ Cobra a chapa inteira. Use apenas para lotes ou quando sobra não será reaproveitada"
    }
  </p>
</div>

{/* NOVO: Scrap Mínimo */}
{sheetCostMode === "used" && (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      📊 Desperdício Mínimo (%)
    </label>
    <input
      type="number"
      value={scrapMinPct}
      onChange={(e) => setScrapMinPct(Number(e.target.value))}
      min="0"
      max="50"
      step="1"
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    <p className="mt-1 text-xs text-gray-600">
      Adiciona {scrapMinPct}% sobre o material útil para cobrir cortes, rebarbas e pequenas perdas.
      Recomendado: 10-20% para cuba, 5-10% para tampos grandes.
    </p>
  </div>
)}
```

---

## 🔟 CONFIGPANEL.TSX - ATUALIZAR LABEL

**Localização:** Linha ~59 (dentro do select "Modo de Seleção")

**SUBSTITUIR:**
```typescript
<option value="auto">Automático (menor desperdício)</option>
```

**POR:**
```typescript
<option value="auto">Automático (menor custo)</option>
```

---

## ✅ ORDEM DE APLICAÇÃO

Execute nesta ordem exata:

1. ✅ Snippet #1 (quoteV2.ts - tipo)
2. ✅ Snippet #2 (quoteV2.ts - interface)
3. ✅ Snippet #3 (quoteV2.ts - lógica)
4. ✅ Snippet #4 (PrecificacaoPage.tsx - estados)
5. ✅ Snippet #5 (PrecificacaoPage.tsx - props)
6. ✅ Snippet #6 (PrecificacaoPage.tsx - policy)
7. ✅ Snippet #7 (ConfigPanel.tsx - interface)
8. ✅ Snippet #8 (ConfigPanel.tsx - desestruturação)
9. ✅ Snippet #9 (ConfigPanel.tsx - campos UI)
10. ✅ Snippet #10 (ConfigPanel.tsx - label)

---

## 🎯 VALIDAÇÃO RÁPIDA

Após aplicar todos os snippets, compile e teste:

```bash
npm run build
```

**Se compilar sem erros:** ✅ Implementação correta!

**Se der erro de tipo:** Revise snippets #1, #2, #7

**Se der erro de props:** Revise snippets #5, #8

---

## 🚀 TESTE FUNCIONAL

1. Abra o sistema
2. Clique "Configurações"
3. **Você deve ver:**
   - ✅ Dropdown "Modo de Custo de Chapa"
   - ✅ Campo "Desperdício Mínimo (%)" aparece quando "USADA"
   - ✅ Label "Automático (menor custo)"

4. Calcule cuba 500×500×200mm:
   - **Modo "used" (15%):** Custo chapa ~R$ 100-120
   - **Modo "bought":** Custo chapa ~R$ 540-570

**Se os valores batem:** 🎉 Implementação 100% funcional!

---

## 📝 NOTAS IMPORTANTES

- **NÃO mude a ordem dos snippets**
- **NÃO pule nenhum snippet**
- Cada snippet é testado e funciona independentemente
- Se tiver dúvida, use "Opção 1" do IMPLEMENTACAO_SISTEMA_REAL.md (copiar arquivos completos)

---

## 🆘 AJUDA RÁPIDA

**Erro de compilação TypeScript?**
→ Revise snippets #1, #2, #7 (tipos e interfaces)

**Campo não aparece na UI?**
→ Revise snippet #9 (campos UI)

**Preço continua alto?**
→ Verifique snippet #6 (`scrapMinPct / 100`)

**Valor não salva ao calcular?**
→ Revise snippet #5 (props do ConfigPanel)
