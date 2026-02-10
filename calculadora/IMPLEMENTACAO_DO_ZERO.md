# 🚀 IMPLEMENTAÇÃO COMPLETA DO ZERO

## 📋 ÍNDICE
1. [Estrutura de Pastas](#estrutura)
2. [Dependências Necessárias](#dependencias)
3. [Arquivos do Core/Engine](#core)
4. [Arquivos de UI/Components](#components)
5. [Integração no Projeto](#integracao)
6. [Configuração e Testes](#testes)

---

## 📁 ESTRUTURA DE PASTAS <a name="estrutura"></a>

Crie esta estrutura no seu projeto:

```
seu-projeto/
├── src/
│   ├── domains/
│   │   └── precificacao/
│   │       └── engine/
│   │           ├── quoteV2.ts          ⭐ Motor de cálculo
│   │           ├── bomBuilder.ts       ⭐ Construtor de BOM
│   │           └── defaultTables.ts    ⭐ Tabelas técnicas
│   │
│   ├── components/
│   │   ├── PrecificacaoPage.tsx        ⭐ Página principal
│   │   ├── ConfigPanel.tsx             ⭐ Painel de config
│   │   ├── QuoteResults.tsx            ⭐ Exibição de resultados
│   │   │
│   │   ├── forms/                      ⭐ Formulários por produto
│   │   │   ├── BancadasForm.tsx
│   │   │   ├── LavatoriosForm.tsx
│   │   │   ├── PrateleirasForm.tsx
│   │   │   ├── MesasForm.tsx
│   │   │   ├── EstanteCantoneiraForm.tsx
│   │   │   ├── EstanteTuboForm.tsx
│   │   │   ├── CoifasForm.tsx
│   │   │   ├── ChapaPlanaForm.tsx
│   │   │   ├── MaterialRedondoForm.tsx
│   │   │   ├── CantoneiraForm.tsx
│   │   │   └── PortasBatentesForm.tsx
│   │   │
│   │   └── ui/                         ⭐ Componentes UI base
│   │       ├── toaster.tsx
│   │       └── use-toast.ts
│   │
│   ├── styles/
│   │   └── globals.css                 ⭐ Estilos Tailwind
│   │
│   └── App.tsx                         ⭐ Entrada da aplicação
```

---

## 📦 DEPENDÊNCIAS NECESSÁRIAS <a name="dependencias"></a>

### **1. Instalação via NPM/Yarn:**

```bash
# React + TypeScript (você já deve ter)
npm install react react-dom

# Tailwind CSS v4 (já configurado no projeto)
# Nenhuma ação necessária se já estiver usando Tailwind

# Lucide Icons (para ícones)
npm install lucide-react

# Nenhuma biblioteca adicional necessária!
```

### **2. TypeScript Config (tsconfig.json):**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  }
}
```

---

## ⚙️ ARQUIVOS DO CORE/ENGINE <a name="core"></a>

### **Total: 3 arquivos essenciais**

#### **Arquivo 1: `/domains/precificacao/engine/quoteV2.ts`** (400 linhas)
- Motor de cálculo completo
- Nesting de chapas
- Cálculo de tubos, cantoneiras, acessórios
- Processos industriais
- Anti-prejuízo com margem mínima
- **MODO NOVO:** "bought" vs "used" com scrap%

#### **Arquivo 2: `/domains/precificacao/engine/bomBuilder.ts`** (estimado 800-1500 linhas)
- Converte formulários em BOM (Bill of Materials)
- 11 tipos de produtos diferentes
- Lógica específica para cada família
- Cálculo de dimensões, áreas, volumes

#### **Arquivo 3: `/domains/precificacao/engine/defaultTables.ts`** (100-200 linhas)
- Catálogo de chapas padrão
- Tabelas de kg/m para tubos
- Tabelas de kg/m para cantoneiras
- Preços de acessórios (pés, válvulas, etc.)
- Custos/hora de processos (corte, solda, dobra, etc.)

---

## 🎨 ARQUIVOS DE UI/COMPONENTS <a name="components"></a>

### **Total: 16 arquivos**

#### **Principais (3):**
1. **PrecificacaoPage.tsx** (~260 linhas)
   - Orquestra todo o sistema
   - Gerencia estados globais
   - Chama validação + cálculo
   - Exibe resultados

2. **ConfigPanel.tsx** (~120 linhas)
   - Configurações globais
   - Preço/kg inox
   - Markup
   - **Modo de custo (bought/used)**
   - **Scrap mínimo (%)**
   - Seleção de chapa (auto/manual)

3. **QuoteResults.tsx** (~150 linhas)
   - Exibe breakdown de custos
   - Mostra nesting por grupo
   - Preço sugerido vs piso
   - Warnings

#### **Formulários por Produto (11):**
4. BancadasForm.tsx
5. LavatoriosForm.tsx
6. PrateleirasForm.tsx
7. MesasForm.tsx
8. EstanteCantoneiraForm.tsx
9. EstanteTuboForm.tsx
10. CoifasForm.tsx
11. ChapaPlanaForm.tsx
12. MaterialRedondoForm.tsx
13. CantoneiraForm.tsx
14. PortasBatentesForm.tsx

#### **UI Base (2):**
15. ui/toaster.tsx
16. ui/use-toast.ts

---

## 🔗 INTEGRAÇÃO NO PROJETO <a name="integracao"></a>

### **Opção A: Página Dedicada (Recomendado)**

Se você usa **React Router**, adicione uma rota:

```typescript
// routes.tsx
import { PrecificacaoPage } from './components/PrecificacaoPage';

const routes = [
  // ... suas rotas existentes
  {
    path: "/precificacao",
    element: <PrecificacaoPage />
  }
];
```

### **Opção B: Integração no App.tsx**

```typescript
// App.tsx
import { PrecificacaoPage } from "./components/PrecificacaoPage";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
    <div>
      <PrecificacaoPage />
      <Toaster />
    </div>
  );
}
```

### **Opção C: Como Modal/Seção**

```typescript
// Seu componente existente
import { PrecificacaoPage } from "./components/PrecificacaoPage";

function SeuComponente() {
  const [showCalc, setShowCalc] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowCalc(true)}>
        Abrir Calculadora
      </button>
      
      {showCalc && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <PrecificacaoPage />
        </div>
      )}
    </>
  );
}
```

---

## 🧪 CONFIGURAÇÃO E TESTES <a name="testes"></a>

### **Passo 1: Verificar Compilação**

```bash
npm run build
# ou
yarn build
```

**Esperado:** ✅ 0 erros de TypeScript

### **Passo 2: Testar Localmente**

```bash
npm run dev
# ou
yarn dev
```

Acesse: `http://localhost:3000` (ou sua porta)

### **Passo 3: Teste Funcional Básico**

1. ✅ **Abrir Configurações**
   - Clicar botão "Configurações" (ícone engrenagem)
   - Verificar campos aparecem

2. ✅ **Configurar Modo "USADA"**
   - Selecionar "USADA (kg útil + scrap%)"
   - Ajustar scrap para 15%
   - Preço/kg: R$ 45
   - Markup: 3

3. ✅ **Calcular Cuba Simples**
   - Produto: "Bancadas"
   - Tipo orçamento: "Somente Cuba"
   - Dimensões: L=500, W=500, H=200
   - Espessura: 1,0mm
   - Clicar "Calcular Orçamento"

4. ✅ **Validar Resultado**
   - Custo Chapas: ~R$ 113-120
   - Custo Processos: ~R$ 118
   - Custo Base: ~R$ 230-240
   - Preço Sugerido: ~R$ 690-720

5. ✅ **Testar Modo "COMPRADA"**
   - Trocar para "COMPRADA"
   - Recalcular mesma cuba
   - Custo Chapas: ~R$ 666
   - Preço Sugerido: ~R$ 1.999

**Se os valores batem:** 🎉 Sistema 100% funcional!

---

## 📊 TABELAS TÉCNICAS PRÉ-CONFIGURADAS

O sistema já vem com:

### **Chapas Padrão:**
- 2000×1250mm
- 1500×1250mm
- 2000×1000mm
- 1500×1000mm
- 1250×1000mm

### **Tubos (kg/m):**
- 1"×1"×1,2mm → 1,37 kg/m
- 1½"×1½"×1,2mm → 2,12 kg/m
- 2"×2"×1,5mm → 3,48 kg/m

### **Cantoneiras (kg/m):**
- 1"×1"×1/8" → 1,15 kg/m
- 1½"×1½"×3/16" → 2,65 kg/m

### **Acessórios:**
- Pé inox: R$ 8,00
- Válvula saída: R$ 12,00
- Sifão: R$ 15,00

### **Processos (R$/hora):**
- Corte: R$ 80/h
- Dobra: R$ 100/h
- Solda: R$ 120/h
- Acabamento: R$ 60/h
- Montagem: R$ 80/h

**Você pode customizar todas essas tabelas editando `/domains/precificacao/engine/defaultTables.ts`**

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1: Setup Inicial**
- [ ] Criar estrutura de pastas
- [ ] Instalar dependências
- [ ] Configurar TypeScript

### **Fase 2: Core/Engine**
- [ ] Copiar `quoteV2.ts`
- [ ] Copiar `bomBuilder.ts`
- [ ] Copiar `defaultTables.ts`
- [ ] Compilar e verificar erros

### **Fase 3: UI Base**
- [ ] Copiar `ui/toaster.tsx`
- [ ] Copiar `ui/use-toast.ts`
- [ ] Compilar e verificar

### **Fase 4: Components Principais**
- [ ] Copiar `PrecificacaoPage.tsx`
- [ ] Copiar `ConfigPanel.tsx`
- [ ] Copiar `QuoteResults.tsx`
- [ ] Compilar e verificar

### **Fase 5: Formulários**
- [ ] Copiar todos os 11 arquivos de `/components/forms/`
- [ ] Compilar e verificar

### **Fase 6: Integração**
- [ ] Integrar no App.tsx ou criar rota
- [ ] Adicionar Toaster no root
- [ ] Testar navegação

### **Fase 7: Testes**
- [ ] Teste funcional básico (cuba)
- [ ] Testar todos os 11 produtos
- [ ] Validar modo bought vs used
- [ ] Verificar warnings aparecem

---

## 🚀 PRÓXIMOS PASSOS

Após implementar tudo:

1. **Customizar Tabelas:**
   - Edite `defaultTables.ts` com seus preços reais
   - Adicione seus tubos/cantoneiras específicos

2. **Ajustar Processos:**
   - Configure tempos de cada processo
   - Ajuste custos/hora conforme sua operação

3. **Branding:**
   - Customize cores em `globals.css`
   - Ajuste logo/título em `PrecificacaoPage.tsx`

4. **Backend (Opcional):**
   - Salvar orçamentos em banco
   - Exportar PDF
   - Histórico de clientes

---

## 📚 ORDEM DE EXTRAÇÃO DOS ARQUIVOS

### **Prioridade ALTA (Essencial para funcionar):**
1. ⭐ quoteV2.ts
2. ⭐ bomBuilder.ts
3. ⭐ defaultTables.ts
4. ⭐ PrecificacaoPage.tsx
5. ⭐ ConfigPanel.tsx
6. ⭐ QuoteResults.tsx
7. ⭐ ui/toaster.tsx
8. ⭐ ui/use-toast.ts

### **Prioridade MÉDIA (1 produto para testar):**
9. ✅ BancadasForm.tsx (comece por este)

### **Prioridade BAIXA (Outros produtos - adicione conforme necessidade):**
10-20. Outros formulários de produtos

---

## 💡 DICA PRO

**Comece pequeno:**
1. Implemente apenas CORE + UI Base + BancadasForm
2. Teste completamente
3. Depois adicione outros formulários conforme necessidade

Isso reduz a implementação inicial de ~3000 linhas para ~1500 linhas.

---

## 🆘 PROBLEMAS COMUNS

### **Erro: "Cannot find module 'lucide-react'"**
```bash
npm install lucide-react
```

### **Erro: Tailwind classes não funcionam**
Verifique `globals.css` tem:
```css
@import "tailwindcss";
```

### **Erro: "toast is not defined"**
Certifique-se que `<Toaster />` está no root do App.tsx

### **Cálculo retorna valores errados**
Verifique:
- Preço/kg configurado corretamente
- Densidade = 7900 kg/m³
- Tabelas de kg/m cadastradas

---

## ✨ RESULTADO FINAL

Sistema completo com:
- ✅ 11 tipos de produtos industriais
- ✅ Cálculo preciso com nesting de chapas
- ✅ Modo "usado" vs "comprado" (novo!)
- ✅ Proteção anti-prejuízo
- ✅ Interface intuitiva
- ✅ Configurável via UI
- ✅ Zero dependências pesadas
- ✅ TypeScript 100% tipado
- ✅ Responsivo (desktop/mobile)

**Tempo estimado de implementação: 2-4 horas**
