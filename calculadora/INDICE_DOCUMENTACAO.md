# 📚 ÍNDICE COMPLETO DA DOCUMENTAÇÃO

## Sistema de Precificação Industrial V2 - Migração para INOX-VAL

---

## 🎯 COMECE POR AQUI

### **Para Começar a Migração:**
1. 📄 **[RESUMO_MIGRACAO.md](./RESUMO_MIGRACAO.md)** ⭐ **LEIA PRIMEIRO!**
   - Visão geral executiva
   - O que será substituído
   - Como fazer (rápido vs manual)
   - Teste de validação
   - Comparação antes/depois

---

## 🚀 MIGRAÇÃO PRÁTICA

### **Migração Automática (10 minutos):**
2. 🤖 **[SCRIPT_MIGRACAO.sh](./SCRIPT_MIGRACAO.sh)**
   - Script automatizado completo
   - Execução em um comando
   - Backup automático
   - Ajuste de imports
   - Instalação de dependências

### **Migração Manual (4-6 horas):**
3. 📋 **[PLANO_MIGRACAO_INOX_VAL.md](./PLANO_MIGRACAO_INOX_VAL.md)**
   - Guia passo a passo completo
   - 10 fases detalhadas
   - Estrutura de pastas
   - Integração com rotas
   - Troubleshooting

### **Acompanhamento:**
4. ✅ **[CHECKLIST_MIGRACAO.md](./CHECKLIST_MIGRACAO.md)**
   - Checklist interativo
   - Marcar itens concluídos
   - Pré-migração
   - Testes funcionais
   - Validação final

---

## 📖 GUIAS TÉCNICOS

### **Implementação Completa:**
5. 🏗️ **[IMPLEMENTACAO_DO_ZERO.md](./IMPLEMENTACAO_DO_ZERO.md)**
   - Para projetos novos (do zero)
   - Estrutura completa de pastas
   - Todos os arquivos necessários
   - Dependências
   - Configuração

### **Código Pronto:**
6. ✂️ **[SNIPPETS_COPY_PASTE.md](./SNIPPETS_COPY_PASTE.md)**
   - 10 blocos de código prontos
   - Copy-paste direto
   - Localização exata
   - Ordem de aplicação
   - Validação rápida

### **Sistema Real (Merge):**
7. 🔧 **[IMPLEMENTACAO_SISTEMA_REAL.md](./IMPLEMENTACAO_SISTEMA_REAL.md)**
   - Para integrar em sistema existente
   - Merge manual vs automático
   - Arquivos modificados
   - Novos tipos/interfaces
   - Checklist de validação

---

## 📘 GUIAS PARA USUÁRIOS

### **Manual do Usuário:**
8. 💡 **[GUIA_MODO_CUSTO.md](./GUIA_MODO_CUSTO.md)**
   - Para usuários finais
   - Como usar modo "bought" vs "used"
   - Quando usar cada modo
   - Exemplos práticos
   - Tabela de recomendações
   - Perguntas frequentes

---

## 📂 ARQUIVOS DO SISTEMA

### **Core/Engine (3 arquivos):**

#### 9. **[/domains/precificacao/engine/quoteV2.ts](./domains/precificacao/engine/quoteV2.ts)**
   - Motor de cálculo principal
   - Nesting de chapas
   - Cálculo de tubos/cantoneiras
   - Processos industriais
   - **Modo bought/used** ⭐
   - Anti-prejuízo
   - ~400 linhas

#### 10. **[/domains/precificacao/engine/bomBuilder.ts](./domains/precificacao/engine/bomBuilder.ts)**
   - Construtor de BOM (Bill of Materials)
   - Converte formulários em peças
   - 11 tipos de produtos
   - Lógica específica por família
   - ~800-1500 linhas

#### 11. **[/domains/precificacao/engine/defaultTables.ts](./domains/precificacao/engine/defaultTables.ts)**
   - Tabelas técnicas padrão
   - Catálogo de chapas
   - kg/m de tubos e cantoneiras
   - Preços de acessórios
   - Custos/hora de processos
   - ~100-200 linhas

---

### **Componentes Principais (3 arquivos):**

#### 12. **[/components/PrecificacaoPage.tsx](./components/PrecificacaoPage.tsx)**
   - Página principal
   - Orquestra todo sistema
   - Gerencia estados
   - 10 etapas de cálculo
   - **Integração com modo custo** ⭐
   - ~260 linhas

#### 13. **[/components/ConfigPanel.tsx](./components/ConfigPanel.tsx)**
   - Painel de configurações
   - Preço/kg inox
   - Markup (fator venda)
   - Modo de seleção de chapa
   - **Modo de custo (bought/used)** ⭐
   - **Scrap mínimo (%)** ⭐
   - ~120 linhas

#### 14. **[/components/QuoteResults.tsx](./components/QuoteResults.tsx)**
   - Exibição de resultados
   - Breakdown de custos
   - Nesting por grupo
   - Preço sugerido vs piso
   - Warnings informativos
   - ~150 linhas

---

### **Formulários (12 arquivos):**

#### 15-26. **[/components/forms/*.tsx](./components/forms/)**
   - **BancadasForm.tsx** - Cubas, tampos, prateleiras
   - **LavatoriosForm.tsx** - Lavatórios industriais
   - **PrateleirasForm.tsx** - Prateleiras suspensas
   - **MesasForm.tsx** - Mesas de trabalho
   - **EstanteCantoneiraForm.tsx** - Estantes com cantoneira
   - **EstanteTuboForm.tsx** - Estantes tubulares
   - **CoifasForm.tsx** - Coifas e exaustores
   - **ChapaPlanaForm.tsx** - Chapas planas customizadas
   - **MaterialRedondoForm.tsx** - Tubos diversos
   - **CantoneiraForm.tsx** - Cantoneiras específicas
   - **PortasBatentesForm.tsx** - Portas batentes
   - **FormField.tsx** - Componente auxiliar

---

### **Componentes UI Base (2-3 arquivos):**

#### 27-29. **[/components/ui/*.tsx](./components/ui/)**
   - **toaster.tsx** - Sistema de notificações
   - **use-toast.ts** - Hook de toast
   - **sonner.tsx** - Biblioteca sonner (se necessário)

---

## 🗂️ ESTRUTURA DE ARQUIVOS

```
📁 Documentação/
│
├── 🎯 INÍCIO
│   └── RESUMO_MIGRACAO.md               ⭐ COMECE AQUI
│
├── 🚀 MIGRAÇÃO
│   ├── SCRIPT_MIGRACAO.sh               (Automático)
│   ├── PLANO_MIGRACAO_INOX_VAL.md       (Manual completo)
│   └── CHECKLIST_MIGRACAO.md            (Acompanhamento)
│
├── 📖 GUIAS TÉCNICOS
│   ├── IMPLEMENTACAO_DO_ZERO.md         (Projeto novo)
│   ├── SNIPPETS_COPY_PASTE.md           (Código pronto)
│   └── IMPLEMENTACAO_SISTEMA_REAL.md    (Merge existente)
│
├── 📘 GUIA USUÁRIO
│   └── GUIA_MODO_CUSTO.md               (Manual uso)
│
└── 📂 SISTEMA
    ├── domains/precificacao/engine/
    │   ├── quoteV2.ts
    │   ├── bomBuilder.ts
    │   └── defaultTables.ts
    │
    ├── components/
    │   ├── PrecificacaoPage.tsx
    │   ├── ConfigPanel.tsx
    │   ├── QuoteResults.tsx
    │   │
    │   ├── forms/ (12 arquivos)
    │   │   ├── BancadasForm.tsx
    │   │   └── ... (outros 11)
    │   │
    │   └── ui/ (2-3 arquivos)
    │       ├── toaster.tsx
    │       └── use-toast.ts
    │
    └── styles/
        └── globals.css
```

---

## 🎓 FLUXO DE APRENDIZADO RECOMENDADO

### **1. Entender o Sistema (30 min):**
- [ ] Ler `RESUMO_MIGRACAO.md`
- [ ] Revisar `GUIA_MODO_CUSTO.md`
- [ ] Entender diferença bought vs used

### **2. Escolher Método de Migração (5 min):**

**Opção A - Rápido:**
- [ ] Ler `SCRIPT_MIGRACAO.sh` (cabeçalho)
- [ ] Executar script
- [ ] Fazer 3 ajustes manuais

**Opção B - Manual:**
- [ ] Ler `PLANO_MIGRACAO_INOX_VAL.md`
- [ ] Seguir 10 fases
- [ ] Usar `CHECKLIST_MIGRACAO.md`

### **3. Implementar (10 min - 6h):**
- [ ] Seguir método escolhido
- [ ] Marcar checklist
- [ ] Testar funcionalmente

### **4. Validar (30 min):**
- [ ] Compilar sem erros
- [ ] Testar cálculo de cuba
- [ ] Validar modo bought/used
- [ ] Deploy em produção

---

## 📊 RESUMO DE CONTEÚDO

| Documento | Páginas | Público | Uso |
|-----------|---------|---------|-----|
| RESUMO_MIGRACAO | 5 | Todos | Visão geral |
| PLANO_MIGRACAO_INOX_VAL | 15 | Devs | Guia completo |
| CHECKLIST_MIGRACAO | 10 | Devs | Acompanhamento |
| SCRIPT_MIGRACAO.sh | 3 | Devs | Automação |
| IMPLEMENTACAO_DO_ZERO | 12 | Devs | Projeto novo |
| SNIPPETS_COPY_PASTE | 8 | Devs | Código rápido |
| IMPLEMENTACAO_SISTEMA_REAL | 10 | Devs | Merge |
| GUIA_MODO_CUSTO | 6 | Usuários | Manual uso |
| **TOTAL** | **69 páginas** | - | - |

---

## 🎯 CASOS DE USO

### **"Quero migrar o inox-val RÁPIDO (10 min):"**
1. Ler: `RESUMO_MIGRACAO.md`
2. Executar: `SCRIPT_MIGRACAO.sh`
3. Fazer: 3 ajustes manuais
4. Testar: Cálculo de cuba

### **"Quero migrar com CONTROLE TOTAL (4-6h):"**
1. Ler: `RESUMO_MIGRACAO.md`
2. Seguir: `PLANO_MIGRACAO_INOX_VAL.md`
3. Marcar: `CHECKLIST_MIGRACAO.md`
4. Consultar: `SNIPPETS_COPY_PASTE.md`

### **"Quero implementar em PROJETO NOVO:"**
1. Ler: `IMPLEMENTACAO_DO_ZERO.md`
2. Copiar: Todos os arquivos listados
3. Seguir: Estrutura de pastas
4. Testar: Compilação e funcionalidade

### **"Quero integrar em SISTEMA EXISTENTE:"**
1. Ler: `IMPLEMENTACAO_SISTEMA_REAL.md`
2. Escolher: Opção 1 (completo) ou 2 (merge)
3. Aplicar: Snippets do `SNIPPETS_COPY_PASTE.md`
4. Validar: Checklist de testes

### **"Sou USUÁRIO FINAL, como usar?"**
1. Ler: `GUIA_MODO_CUSTO.md`
2. Entender: Modo bought vs used
3. Seguir: Tabela de recomendações
4. Praticar: Exemplos fornecidos

---

## 🔍 BUSCA RÁPIDA

### **Por Tópico:**

**Modo Bought/Used:**
- `GUIA_MODO_CUSTO.md` → Seção "Como Funciona"
- `quoteV2.ts` → Linhas 316-330
- `ConfigPanel.tsx` → Linhas 55-95

**Nesting de Chapas:**
- `quoteV2.ts` → Função `estimateNesting()`
- `GUIA_MODO_CUSTO.md` → Seção "Exemplo Prático"

**Proteção Anti-Prejuízo:**
- `quoteV2.ts` → Linhas 381-386
- `IMPLEMENTACAO_DO_ZERO.md` → Seção "Tabelas Técnicas"

**Formulários de Produtos:**
- `components/forms/` → 12 arquivos
- `IMPLEMENTACAO_DO_ZERO.md` → Seção "Formulários por Produto"

**Instalação/Setup:**
- `PLANO_MIGRACAO_INOX_VAL.md` → Fase 7
- `IMPLEMENTACAO_DO_ZERO.md` → Seção "Dependências"

---

## 🆘 TROUBLESHOOTING

**Erro na migração:**
→ `PLANO_MIGRACAO_INOX_VAL.md` → Seção "🆘 RESOLUÇÃO DE PROBLEMAS"

**Erro de compilação:**
→ `CHECKLIST_MIGRACAO.md` → Seção "🔍 VALIDAÇÃO DE CÓDIGO"

**Imports errados:**
→ `PLANO_MIGRACAO_INOX_VAL.md` → Fase 3

**Preço não bate:**
→ `GUIA_MODO_CUSTO.md` → Seção "Por que o preço mudou?"

---

## 📞 INFORMAÇÕES ADICIONAIS

**Total de Linhas de Código:** ~3.500 linhas

**Total de Arquivos:** ~20 arquivos

**Tempo de Migração:**
- Automática: 10-30 minutos
- Manual: 4-6 horas

**Pré-requisitos:**
- React + TypeScript
- Tailwind CSS
- Node.js 16+

**Dependências Novas:**
- lucide-react
- sonner@2.0.3

---

## ✨ COMEÇAR AGORA

### **Caminho Recomendado:**

1. **Ler** (15 min):
   ```bash
   cat RESUMO_MIGRACAO.md
   ```

2. **Decidir** (5 min):
   - Automático: `SCRIPT_MIGRACAO.sh`
   - Manual: `PLANO_MIGRACAO_INOX_VAL.md`

3. **Executar** (10 min - 6h):
   - Seguir guia escolhido
   - Marcar checklist

4. **Validar** (30 min):
   - Compilar
   - Testar
   - Deploy

**Total:** 1h - 7h (dependendo do método)

---

## 🎉 RESULTADO FINAL

Ao concluir, você terá:

✅ Sistema de precificação moderno  
✅ 11 tipos de produtos  
✅ Modo bought/used funcionando  
✅ Preços 60-70% menores em peças únicas  
✅ Código limpo e manutenível  
✅ Documentação completa  
✅ Zero código legado  

**Boa sorte! 🚀**
