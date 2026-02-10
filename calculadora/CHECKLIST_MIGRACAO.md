# ✅ CHECKLIST DE MIGRAÇÃO - INOX-VAL

Use este checklist para acompanhar o progresso da migração passo a passo.

---

## 📋 PRÉ-MIGRAÇÃO

### Preparação
- [ ] Repositório inox-val clonado localmente
- [ ] Protótipo Figma Make baixado/acessível
- [ ] Branch de desenvolvimento criada (`feat/precificacao-v2`)
- [ ] Backup dos arquivos antigos realizado
- [ ] Git status limpo (sem alterações pendentes)

### Verificação de Dependências
- [ ] Node.js instalado (v16+)
- [ ] NPM ou Yarn funcionando
- [ ] Git configurado corretamente
- [ ] Editor de código pronto (VSCode recomendado)

---

## 🚀 MIGRAÇÃO AUTOMÁTICA

### Script de Migração
- [ ] Executar `chmod +x SCRIPT_MIGRACAO.sh`
- [ ] Rodar `./SCRIPT_MIGRACAO.sh ~/inox-val ~/prototipo`
- [ ] Verificar mensagem "✨ MIGRAÇÃO AUTOMÁTICA CONCLUÍDA!"
- [ ] Revisar saída do script para erros

---

## 🔧 AJUSTES MANUAIS

### 1. Atualizar Rotas (`src/app/routes.tsx`)

- [ ] Abrir arquivo `src/app/routes.tsx`
- [ ] Adicionar import:
  ```typescript
  import PrecificacaoV2 from './pages/PrecificacaoV2';
  ```
- [ ] Adicionar rota:
  ```typescript
  {
    path: "/precificacao",
    element: <PrecificacaoV2 />,
  }
  ```
- [ ] Remover rotas antigas:
  - [ ] `/calculadora-mesas`
  - [ ] `/calculadora-rapida`
  - [ ] `/calculadoras`
- [ ] Salvar arquivo

### 2. Atualizar Navegação/Menu

**Localizar arquivo do menu (geralmente em `src/app/components/`):**

- [ ] Procurar por "Calculadora" ou "menu" nos componentes
- [ ] Atualizar link para `/precificacao`
- [ ] Atualizar texto do menu (ex: "Precificação V2")
- [ ] Atualizar ícone (se necessário)
- [ ] Salvar arquivo

### 3. Adicionar Toaster no Root

**Em `src/app/App.tsx` ou `src/main.tsx`:**

- [ ] Adicionar import:
  ```typescript
  import { Toaster } from './components/ui/sonner';
  ```
- [ ] Adicionar componente:
  ```typescript
  <Toaster />
  ```
- [ ] Salvar arquivo

### 4. Verificar Contexto de Autenticação (se aplicável)

- [ ] Verificar se PrecificacaoV2 precisa de autenticação
- [ ] Adicionar `useAuth()` se necessário
- [ ] Envolver rota com `<ProtectedRoute>` se aplicável
- [ ] Salvar arquivo

---

## 🧪 TESTES

### Compilação

- [ ] Executar `npm run build` (ou `yarn build`)
- [ ] ✅ 0 erros de TypeScript
- [ ] ✅ 0 avisos críticos
- [ ] Build gerado com sucesso

### Desenvolvimento Local

- [ ] Executar `npm run dev` (ou `yarn dev`)
- [ ] Aplicação iniciou sem erros
- [ ] Acessar `http://localhost:3000` (ou porta configurada)
- [ ] Login funcionando (se aplicável)

### Teste de Navegação

- [ ] Menu aparece corretamente
- [ ] Link "Precificação V2" visível
- [ ] Clicar no link
- [ ] Página carrega sem erros
- [ ] Layout responsivo funcionando

### Teste Funcional Básico

#### Configurações:
- [ ] Clicar botão "Configurações" (ícone ⚙️)
- [ ] Painel abre corretamente
- [ ] Campo "Preço/kg Inox" visível
- [ ] Campo "Fator de Venda (Markup)" visível
- [ ] **Campo "Modo de Custo de Chapa" visível** ⭐
- [ ] **Campo "Desperdício Mínimo (%)" aparece ao selecionar "USADA"** ⭐
- [ ] Configurar valores:
  - Preço/kg: R$ 45
  - Markup: 3
  - Modo: USADA (kg útil + scrap%)
  - Scrap: 15%
- [ ] Fechar painel

#### Cálculo de Cuba:
- [ ] Selecionar produto: "Bancadas"
- [ ] Tipo orçamento: "Somente Cuba"
- [ ] Dimensões:
  - Largura: 500mm
  - Profundidade: 500mm
  - Altura: 200mm
- [ ] Espessura: 1,0mm
- [ ] Clicar "Calcular Orçamento"
- [ ] **Validar resultado (modo USADA):**
  - Custo Chapas: ~R$ 100-120
  - Custo Processos: ~R$ 100-120
  - Custo Base: ~R$ 220-250
  - Preço Sugerido: **~R$ 650-750** ✅

#### Validar Modo COMPRADA:
- [ ] Abrir Configurações
- [ ] Trocar para: "COMPRADA (chapa inteira)"
- [ ] Recalcular mesma cuba
- [ ] **Validar resultado:**
  - Custo Chapas: ~R$ 550-600
  - Preço Sugerido: **~R$ 1.900-2.100** ✅

#### Outros Produtos (Opcional):
- [ ] Testar produto: Mesas
- [ ] Testar produto: Estante Tubo
- [ ] Testar produto: Prateleiras
- [ ] Validar cálculos fazem sentido

### Teste de Responsividade

- [ ] Desktop (1920×1080): Layout OK
- [ ] Tablet (768×1024): Layout OK
- [ ] Mobile (375×667): Layout OK
- [ ] Campos acessíveis em todas resoluções

### Teste de Warnings

- [ ] Cálculo mostra warnings informativos
- [ ] Warning sobre modo "USADO" aparece:
  ```
  Família "cuba": modo USADO (kg útil + 15% scrap). Sobra vira estoque.
  ```
- [ ] Warnings são claros e úteis

---

## 🔍 VALIDAÇÃO DE CÓDIGO

### Imports Corretos

- [ ] PrecificacaoV2.tsx importa corretamente de `../components/precificacao/`
- [ ] ConfigPanel.tsx importa corretamente de `../../domains/`
- [ ] QuoteResults.tsx sem erros de import
- [ ] Formulários importam FormField corretamente

### TypeScript

- [ ] Nenhum `any` desnecessário
- [ ] Todos os tipos importados corretamente
- [ ] Interface `SheetPolicy` tem `costMode` e `scrapMinPct`
- [ ] Enum `SheetCostMode` definido

### Performance

- [ ] Cálculo executa em < 3 segundos
- [ ] Interface responde instantaneamente
- [ ] Sem re-renders desnecessários

---

## 🧹 LIMPEZA

### Arquivos Removidos

- [ ] `CalculadoraMesasWizard.tsx` deletado
- [ ] `CalculadoraRapida.tsx` deletado
- [ ] `Calculadoras.tsx` deletado
- [ ] Imports antigos removidos de routes.tsx
- [ ] Backup salvo em `backup_calculadoras_antigas/`

### Código Limpo

- [ ] Sem comentários `// TODO` não resolvidos
- [ ] Sem `console.log()` de debug
- [ ] Sem código comentado
- [ ] Indentação consistente

---

## 📝 GIT & DEPLOY

### Commit

- [ ] Revisar mudanças: `git status`
- [ ] Adicionar arquivos: `git add .`
- [ ] Commit com mensagem clara:
  ```bash
  git commit -m "feat: implementar sistema de precificação V2
  
  - Substituir CalculadoraMesasWizard e CalculadoraRapida
  - Adicionar 11 tipos de produtos
  - Implementar modo bought/used para chapas
  - Nesting automático de chapas
  - Proteção anti-prejuízo
  - Interface moderna com Tailwind CSS"
  ```

### Push & Pull Request

- [ ] Push para GitHub: `git push origin feat/precificacao-v2`
- [ ] Criar Pull Request
- [ ] Adicionar descrição detalhada
- [ ] Solicitar review
- [ ] Aguardar aprovação

### Deploy

- [ ] Merge na branch principal
- [ ] Deploy automático (se configurado)
- [ ] OU deploy manual:
  - Vercel: `vercel --prod`
  - Firebase: `firebase deploy`
  - Outro: seguir documentação
- [ ] Verificar deploy bem-sucedido
- [ ] Testar em produção

---

## 🎯 VALIDAÇÃO FINAL EM PRODUÇÃO

### Smoke Tests

- [ ] Acesso à aplicação funcionando
- [ ] Login/autenticação OK
- [ ] Navegação para /precificacao OK
- [ ] Cálculo de teste bem-sucedido
- [ ] Nenhum erro no console do navegador

### Monitoramento

- [ ] Verificar logs de erro (Sentry/LogRocket)
- [ ] Monitorar performance (Lighthouse/GTmetrix)
- [ ] Coletar feedback de usuários
- [ ] Documentar problemas encontrados

---

## 📊 MÉTRICAS DE SUCESSO

### Objetivos Atingidos

- [ ] **Redução de preços:** Peças únicas 60-70% mais baratas
- [ ] **Tempo de cálculo:** < 3 segundos
- [ ] **Precisão:** ±5% vs. cotação real
- [ ] **Produtos suportados:** 11 tipos diferentes
- [ ] **Responsividade:** Funciona em mobile/tablet/desktop
- [ ] **Zero erros críticos** em produção

---

## 🎉 CONCLUSÃO

### Checklist Completo?

- [ ] ✅ Todos os itens acima marcados
- [ ] ✅ Sistema testado e validado
- [ ] ✅ Deploy em produção bem-sucedido
- [ ] ✅ Usuários satisfeitos com novo sistema

---

## 📞 SUPORTE

Se algum item não puder ser marcado:

1. ❌ **Revisar documentação:**
   - `PLANO_MIGRACAO_INOX_VAL.md`
   - `IMPLEMENTACAO_DO_ZERO.md`
   - `SNIPPETS_COPY_PASTE.md`

2. ❌ **Verificar logs de erro:**
   - Console do navegador (F12)
   - Terminal do servidor
   - Arquivo de logs

3. ❌ **Consultar seção de Troubleshooting:**
   - `PLANO_MIGRACAO_INOX_VAL.md` → "🆘 RESOLUÇÃO DE PROBLEMAS"

---

## ✨ PARABÉNS!

Se todos os itens estão marcados, você migrou com sucesso o Sistema de Precificação V2! 🎉

**Próximos passos:**
- Coletar feedback dos usuários
- Ajustar tabelas técnicas conforme necessidade
- Adicionar novos produtos (se necessário)
- Otimizar performance (se aplicável)

**Tempo médio de migração:** 4-6 horas

**Resultado esperado:** Sistema de precificação industrial completo, moderno e preciso! 🚀
