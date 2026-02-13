# INOX-VAL - Sistema Industrial B2B

Sistema profissional de cálculo e gestão de chapas de aço inox para engenheiros e gestores industriais.

## 🏭 Sobre o Projeto

INOX-VAL é uma plataforma SaaS B2B desenvolvida com tecnologias modernas de 2026, oferecendo:

- **Cálculo Preciso**: Sistema técnico para cálculo de peso e preço de chapas de aço inox
- **Gestão de Orçamentos**: Módulo completo para criação e acompanhamento de propostas
- **Controle de Produção**: Monitoramento em tempo real da produção industrial
- **Aprovações**: Fluxo estruturado de aprovação de pedidos
- **Relatórios**: Analytics detalhado com visualizações profissionais

## 🎨 Design System

### Paleta de Cores

```css
/* Cores Base */
--bg-primary: #0B0F14
--bg-secondary: #101722
--surface-1: #121826
--surface-2: #1A2233
--border-subtle: #2A3448

/* Cores Primárias */
--primary: #2962FF (Azul Elétrico)
--secondary: #FF6D00 (Laranja Industrial)
--accent-cyan: #00C8FF

/* Estados */
--success: #00C853
--error: #D32F2F
--warning: #F9A825

/* Texto */
--text-primary: #E6EDF7
--text-secondary: #A9B4C6
--text-disabled: #5F6C80
```

### Tipografia

- **Fonte Principal**: Space Grotesk / Inter
- **Escala**: 
  - H1: 40px / 600
  - H2: 28px / 600
  - H3: 20px / 600
  - Body: 14px / 400
  - Caption: 12px / 400

### Componentes

- Cards com glassmorphism técnico
- Inputs com bordas sutis e foco em glow
- Tabelas modernas com hover states
- Badges com status coloridos
- Botões com gradientes e elevação

## 🚀 Tecnologias

- **React 18.3** - Framework moderno
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização
- **Motion (Framer Motion)** - Animações
- **React Router v7** - Navegação
- **Recharts** - Gráficos profissionais
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

## 📐 Arquitetura

```
src/
├── app/
│   ├── components/
│   │   ├── layout.tsx          # Layout principal
│   │   └── ui/                 # Componentes reutilizáveis
│   ├── pages/
│   │   ├── dashboard.tsx       # Dashboard com KPIs
│   │   ├── calculator.tsx      # Calculadora de materiais
│   │   ├── budgets.tsx         # Gestão de orçamentos
│   │   ├── production.tsx      # Controle de produção
│   │   ├── approvals.tsx       # Sistema de aprovações
│   │   ├── analytics.tsx       # Relatórios e gráficos
│   │   └── settings.tsx        # Configurações
│   ├── routes.ts               # Configuração de rotas
│   └── App.tsx                 # Componente raiz
└── styles/
    ├── index.css               # Estilos globais + variáveis
    ├── theme.css               # Tema do sistema
    └── tailwind.css            # Configuração Tailwind
```

## ✨ Funcionalidades Principais

### Dashboard
- **KPIs em Tempo Real**: Cards elevados com micro gráficos
- **Tabela de Cálculos**: Lista completa com filtros e status
- **Gráficos Mensais**: Evolução de receita e produção
- **Distribuição de Materiais**: Análise por tipo de aço

### Calculadora
- **Formulário Técnico**: Campos estruturados para entrada de dados
- **Visualização 3D**: Representação isométrica da chapa
- **Cálculo em Tempo Real**: Peso e preço calculados automaticamente
- **Tabela de Referência**: Densidades e preços dos materiais

### Relatórios
- **Gráficos de Linha**: Evolução temporal
- **Gráficos de Barra**: Distribuição por categorias
- **Exportação**: PDF com dados consolidados

## 🎯 Diferenciais

1. **Visual Industrial Premium**: Design profissional adequado ao público B2B
2. **Dark-First Interface**: Otimizado para uso prolongado
3. **Glassmorphism Técnico**: Efeitos sutis e profissionais
4. **Animações Controladas**: Microinterações suaves sem excessos
5. **Dados Técnicos**: Foco em precisão e clareza de informações
6. **Responsivo**: Adaptável a diferentes resoluções
7. **Acessibilidade**: Componentes seguindo padrões WCAG

## 🔧 Grid System

- **Desktop**: 1440px com 12 colunas
- **Gutter**: 24px
- **Margins**: 120px laterais
- **Bordas**: Radius de 10-16px
- **Sombras**: Elevação controlada em 3 níveis

## 📊 Performance

- **Lazy Loading**: Rotas carregadas sob demanda
- **Code Splitting**: Otimização automática
- **Animações GPU**: Transições performáticas
- **Otimização de Renders**: React.memo onde necessário

## 🎨 Princípios de Design

1. **Clareza Técnica**: Informações apresentadas de forma direta
2. **Hierarquia Visual**: Estrutura clara de importância
3. **Consistência**: Design system uniforme
4. **Profissionalismo**: Sem elementos decorativos excessivos
5. **Confiabilidade**: Visual sólido e corporativo

## 📱 Responsividade

- Desktop: 1440px+ (experiência completa)
- Tablet: 1024px (adaptado)
- Mobile: 390px+ (otimizado)

## 🌐 Navegação

- **Sidebar Fixa**: Acesso rápido a todos os módulos
- **Search Global**: Busca em todo o sistema
- **Breadcrumbs**: Orientação de localização
- **Status Indicators**: Estado do sistema visível

---

**INOX-VAL** - Precisão Industrial. Tecnologia Avançada. Resultados Garantidos.

*Desenvolvido com as melhores práticas de 2026 para o mercado industrial B2B*
