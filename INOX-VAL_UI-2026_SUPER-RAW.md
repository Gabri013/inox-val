# INOX-VAL — SUPER RAW UI/UX 2026 (Mega Prompt) + Execução em Etapas (Kilo Code)

Este documento foi escrito para o Kilo Code executar **por partes**, sem sobrecarga, mantendo consistência total de layout, componentes, tokens, acessibilidade e performance.

---

## 0) Missão

Construir uma UI/UX **nível SaaS 2026** para o INOX-VAL: fluida, premium, industrial, consistente e extremamente utilizável.

Requisitos principais:

- Design System com **tokens** (cores, tipografia, espaçamento, raio, sombras, motion)
- Component library própria (alto reaproveitamento)
- AppShell moderno (sidebar/topbar/search/breadcrumbs)
- Páginas críticas premium: **/orcamento-rapido**, **/orcamentos/:id**, **/admin**, **/calibracao**, **/dashboard**
- Estados padronizados: loading/empty/error/success
- A11y (contraste, foco, teclado, aria)
- Performance (virtualização, debounce, lazy)
- Debug UI Mode (grid overlay + inspeção de spacing/overflow)
- Sem “hardcode” de cor/spacing fora de tokens
- Tudo conectado: status/flows/snapshots/auditoria refletidos na UI

---

## 1) Conceito visual 2026 (direção de arte)

**Industrial premium** (aço/INOX) + **tech minimal**.

Características:

- Dark-first (mas com light mode de alta qualidade)
- Camadas com superfícies (surface, elevated) e bordas suaves (2xl)
- “Glass subtle” opcional (apenas em topbar/menus; sem exageros)
- Ícones minimalistas
- Tipografia moderna (Inter/Geist-like)
- Densidade confortável (não “apertado”, não “espaçado demais”)
- Microinterações curtas e discretas
- Layout previsível (grids e cards consistentes)

---

## 2) Design System (Tokens) — Obrigatório

Criar: `src/ui/theme/`

Arquivos:
- `tokens.ts` (fonte única)
- `theme.dark.ts`
- `theme.light.ts`
- `typography.tokens.ts`
- `motion.tokens.ts`
- `elevation.tokens.ts`
- `radius.tokens.ts`
- `spacing.tokens.ts`
- `theme.provider.tsx`
- `theme.utils.ts`
- `formatters.ts` (currency, mm, m2, kg, dates)

### 2.1 Tokens (estrutura mínima)

- colors:
  - bg, surface, surface2, surface3
  - border, borderSoft
  - text, textMuted, textSubtle
  - primary, primaryHover, primarySoft
  - accent, accentSoft
  - success/warning/danger/info + soft variants
  - focusRing
- typography:
  - fontFamily
  - sizes: xs, sm, base, lg, xl, 2xl, 3xl
  - weights: 400/500/600
  - lineHeights
- spacing: `2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48`
- radius: `sm, md, lg, xl, 2xl`
- shadow: `sm, md, lg` (difusas, discretas)
- motion:
  - fast 120ms, medium 200ms, slow 300ms
  - easing: cubic-bezier(.4,0,.2,1)

### 2.2 Paleta sugerida 2026 (Dark-first)

**Dark**
- bg: `#0F1115`
- surface: `#151922`
- surface2: `#1A2030`
- surface3: `#20283A`
- border: `#252B3A`
- borderSoft: `rgba(148,163,184,0.12)`
- text: `#F1F5F9`
- textMuted: `#94A3B8`
- textSubtle: `#64748B`

**Primary (INOX-VAL)**
- primary: `#3A7AFE`
- primaryHover: `#2F6BEB`
- primarySoft: `rgba(58,122,254,0.12)`

**Accent (opcional)**
- accent: `#A78BFA`
- accentSoft: `rgba(167,139,250,0.12)`

**Semantic**
- success: `#22C55E`, successSoft: `rgba(34,197,94,0.12)`
- warning: `#FACC15`, warningSoft: `rgba(250,204,21,0.12)`
- danger: `#EF4444`, dangerSoft: `rgba(239,68,68,0.12)`
- info: `#38BDF8`, infoSoft: `rgba(56,189,248,0.12)`

**Focus ring**
- focusRing: `rgba(58,122,254,0.45)`

**Light**
- definir espelho coerente (alto contraste), sem “cinza lavado”.

> Regra: **zero cor hardcoded em componentes** (exceto dentro dos tokens).

---

## 3) Component Library 2026 — Obrigatório

Criar: `src/ui/components2026/`

### 3.1 Layout

- `AppShell2026`
- `Sidebar2026`
- `Topbar2026` (search + actions + user/company)
- `PageContainer`
- `PageHeader` (title/subtitle/actions/breadcrumb)
- `SectionCardPremium`
- `SplitPaneLayout` (lista à esquerda, detalhe à direita)
- `Tabs2026` (aba suave, sem poluição)
- `Drawer2026` (opcional)
- `Modal2026`
- `Breadcrumbs2026`

### 3.2 Inputs (forms premium)

- `TextField2026` (label flutuante)
- `NumberField2026` (com unidade e step)
- `Select2026` (search opcional)
- `SegmentedControl2026`
- `TogglePill2026`
- `MaterialKeyPicker2026` (search + status de preço ativo)
- `PresetPicker2026` (cards ou dropdown, com preview de dimensões)
- `InlineHelp` (tooltips)
- `FormSection` (organização)

### 3.3 Data display

- `DataTable2026` (sorting, filtering; virtualização quando necessário)
- `KpiCard2026` (dashboard)
- `StatusBadge2026` (quote/op)
- `TimelineAudit2026` (eventos)
- `KeyValueList2026` (snapshot/certificado)
- `CodeBlock2026` (para JSON/hash)
- `ProgressBar2026` (utilização chapa etc.)
- `MetricBreakdown2026` (material/process/overhead/margem)

### 3.4 Feedback / estados

- `Toast2026`
- `InlineAlert2026` (info/warn/error/success com soft background)
- `EmptyState2026` (CTA)
- `Skeleton2026`
- `ErrorBoundaryUI2026`
- `ConfirmDialog2026`

### 3.5 Ações

- `ButtonPrimary2026`
- `ButtonSecondary2026`
- `ButtonGhost2026`
- `ButtonDanger2026`
- `IconButton2026`
- `DropdownMenu2026`
- `SplitButton2026`

> Regra: páginas devem compor com esses componentes. Evitar “componentes únicos por página”.

---

## 4) Layout padrões 2026 (grid + densidade + responsivo)

Criar: `src/ui/layout/`

- `layout.constants.ts` (max widths, gaps, paddings)
- `breakpoints.ts`
- `density.ts` (compact/comfortable)

Padrão:
- container max: 1280–1440
- grid 12 colunas
- card padding: 16–24
- gap vertical: 16–24
- inputs em grid 2 colunas (desktop), 1 coluna (mobile)
- sidebar colapsável

---

## 5) Motion/Microinterações 2026

Criar: `src/ui/motion/`

- tokens + helpers
- hover elevate em cards (leve)
- transições discretas em tabs, accordions, dropdown
- skeleton shimmer elegante

Proibir:
- animações longas
- exagero de blur/glass

---

## 6) Status/Workflow visual único

Criar: `src/ui/status/`

- `quoteStatus.ts` mapping:
  - DRAFT, CALCULATED, VALIDATED, CORPORATE_OK, APPROVED, FINALIZED, DELIVERED, IN_PRODUCTION, CLOSED
- `opStatus.ts`
- `statusBadge.tsx` (usa tokens)

Sem cores aleatórias por tela.

---

## 7) Debug UI Mode 2026 (layout debug)

Criar: `src/ui/debug/`

- `DebugUIProvider`
- `GridOverlay12`
- `SpacingInspector` (hover mostra padding/margin)
- `OverflowHighlighter` (marca overflow)
- `ComponentConformanceWarnings` (identificar uso fora do DS)
- `RenderCounterPanel` (somente debug)

Ativação:
- query `?debugUI=1` OU toggle no admin settings.

---

## 8) Páginas críticas (refatorar primeiro)

### 8.1 /orcamento-rapido (Premium)

Layout:
- Split (2 colunas)
- Esquerda:
  - TemplateSelector (cards)
  - PresetPicker
  - Inputs (render dinâmico)
  - Calcular (CTA fixo inferior)
- Direita:
  - Preço final (grande)
  - Breakdown (material/process/overhead/margem)
  - Utilização chapa, barras tubo
  - Warnings/Erros (InlineAlert)
  - Ações: Validar, Finalizar, PDF, Compra, OP (habilitadas por status)

Detalhes colapsáveis:
- BOM
- Nesting viewer
- Lista cortes de tubo
- Regras aplicadas
- Certificado (hash/ruleset)

### 8.2 /orcamentos/:id (Premium)

- Header com status badge + ações
- Abas:
  - Resumo
  - Detalhes (BOM + nesting)
  - Certificado (snapshot/hash/rebuild)
  - Auditoria (timeline)
  - Compra
  - OP

### 8.3 /admin (Premium)

Padrão TwoPane:
- Lista com search, filtros e status
- Detalhe editável com validação inline

Subpáginas:
- Materiais
- Processos
- Templates
- Settings
- Usuários/RBAC

### 8.4 /calibracao (Premium)

- Dashboard de completude (cards)
- Wizard de calibração
- Baselines + MAPE
- Freeze rulesetVersion

### 8.5 /dashboard (CEO mode)

- KPIs + tendências
- Cards limpos
- Tabela dos top itens
- Sem poluição visual

---

## 9) Acessibilidade (A11y) e Teclado

Regras:
- foco visível com focusRing token
- labels sempre associados
- aria em dialogs e dropdowns
- navegação por teclado em forms e tabelas
- contraste AA

Criar docs:
- `docs/UI_A11Y_2026.md`

---

## 10) Performance

- virtualização em tabelas grandes
- debounce em search
- lazy load em seções pesadas
- memoização seletiva

Adicionar painel debug:
- tempo de render
- contagem de renders
- tempo de carregamento da rota

---

## 11) Documentação e “UI Gates”

Criar docs:
- `docs/DESIGN_SYSTEM_2026.md`
- `docs/UI_GUIDELINES_2026.md`
- `docs/UI_DEBUG_MODE_2026.md`
- `docs/COMPONENT_LIBRARY_2026.md`

Criar comando:
- `npm run ui-validate`

O ui-validate deve checar:
- nenhuma cor hardcoded fora tokens
- nenhuma página fora AppShell2026
- páginas críticas usam PageHeader + SectionCardPremium
- componentes críticos existem e são usados

Gerar:
- `UI_VALIDATION_REPORT.md`

---

## 12) DEFINIÇÃO DE PRONTO (UI 2026)

A UI é “pronta, premium e apresentável” quando:

- tokens aplicados globalmente
- light/dark consistentes
- /orcamento-rapido e /orcamentos/:id premium
- /admin e /calibracao consistentes
- debugUI funcional
- ui-validate PASS
- A11y ok
- performance aceitável

---

## 13) PROMPT PARA O KILO CODE EXECUTAR EM PARTES (SEM SOBRECARREGAR)

### Regras de execução

- Executar **uma etapa por vez**.
- Ao final de cada etapa:
  - listar arquivos criados/alterados
  - rodar `npm run check && npm run lint && npm test && npm run build`
  - atualizar checklist de progresso (no topo deste arquivo)
  - gerar mini-relatório: o que foi feito + o que falta

### Checklist (o Kilo Code deve manter)

- [ ] UI-ETAPA 1 — Tokens + Themes + Provider + Formatters
- [ ] UI-ETAPA 2 — Component Library 2026 (base)
- [ ] UI-ETAPA 3 — AppShell2026 + Sidebar + Topbar + Navegação
- [ ] UI-ETAPA 4 — /orcamento-rapido premium (layout + componentes)
- [ ] UI-ETAPA 5 — /orcamentos/:id premium (tabs + timeline + certificado)
- [ ] UI-ETAPA 6 — /admin premium (TwoPane + DataTable + forms)
- [ ] UI-ETAPA 7 — /calibracao premium (wizard + métricas)
- [ ] UI-ETAPA 8 — /dashboard CEO mode
- [ ] UI-ETAPA 9 — Debug UI Mode 2026 (grid + spacing inspector)
- [ ] UI-ETAPA 10 — ui-validate + docs + polishing final

### Prompt “Executor” (cole no Kilo Code antes de cada etapa)

“Você vai executar SOMENTE a etapa UI-ETAPA X do documento INOX-VAL — SUPER RAW UI/UX 2026.  
Não avance para a próxima etapa antes de concluir os gates e registrar o status.  
Ao final, entregue: arquivos alterados, comandos executados (com saída resumida), e marque a etapa como concluída no checklist.”

### Gates obrigatórios por etapa (mínimos)

ETAPA 1 Gate:
- ThemeProvider funcionando
- tokens acessíveis
- nenhuma cor hardcoded em componentes novos

ETAPA 2 Gate:
- componentes básicos compilando e documentados rapidamente (ex: uma página `/ui-preview`)

ETAPA 3 Gate:
- AppShell2026 aplicado em pelo menos 2 rotas

ETAPA 4 Gate:
- /orcamento-rapido com layout premium usando componentes DS

ETAPA 5 Gate:
- /orcamentos/:id com Tabs + Timeline + Certificado

ETAPA 6 Gate:
- /admin (Materiais/Processos/Templates/Settings) no padrão TwoPane

ETAPA 7 Gate:
- /calibracao com wizard e cards de completude

ETAPA 8 Gate:
- /dashboard com KPIs e tabelas

ETAPA 9 Gate:
- debugUI (grid overlay + overflow highlight)

ETAPA 10 Gate:
- `npm run ui-validate` PASS
- docs geradas
- UI_VALIDATION_REPORT.md

---

## 14) “Anti-esquecimento” — Ordem e disciplina

- Não criar novos estilos fora do DS.
- Se surgir necessidade, primeiro criar token/componente, depois usar.
- Qualquer exceção deve ser documentada em `docs/UI_GUIDELINES_2026.md`.

---

FIM.
