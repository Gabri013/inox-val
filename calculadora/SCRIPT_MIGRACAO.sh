#!/bin/bash

# 🚀 SCRIPT DE MIGRAÇÃO AUTOMÁTICA
# Sistema de Precificação V2 para INOX-VAL
# ========================================

set -e  # Para no primeiro erro

echo "🚀 Iniciando migração do Sistema de Precificação V2..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis de caminho
REPO_INOX_VAL="$1"  # Caminho do repositório inox-val
REPO_PROTOTIPO="$2" # Caminho do protótipo Figma Make

# Validação de argumentos
if [ -z "$REPO_INOX_VAL" ] || [ -z "$REPO_PROTOTIPO" ]; then
    echo -e "${RED}❌ Erro: Forneça os caminhos dos repositórios${NC}"
    echo ""
    echo "Uso:"
    echo "  ./SCRIPT_MIGRACAO.sh <caminho-inox-val> <caminho-prototipo>"
    echo ""
    echo "Exemplo:"
    echo "  ./SCRIPT_MIGRACAO.sh ~/projetos/inox-val ~/projetos/figma-make-prototipo"
    exit 1
fi

# Verificar se os diretórios existem
if [ ! -d "$REPO_INOX_VAL" ]; then
    echo -e "${RED}❌ Diretório inox-val não encontrado: $REPO_INOX_VAL${NC}"
    exit 1
fi

if [ ! -d "$REPO_PROTOTIPO" ]; then
    echo -e "${RED}❌ Diretório protótipo não encontrado: $REPO_PROTOTIPO${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Diretórios validados${NC}"
echo ""

# ========================================
# FASE 1: BACKUP
# ========================================

echo "📦 FASE 1: Criando backup..."
cd "$REPO_INOX_VAL"

# Criar branch de migração
echo "  → Criando branch feat/precificacao-v2..."
git checkout -b feat/precificacao-v2 2>/dev/null || git checkout feat/precificacao-v2

# Backup
echo "  → Fazendo backup dos arquivos antigos..."
mkdir -p backup_calculadoras_antigas

if [ -f "src/app/pages/CalculadoraMesasWizard.tsx" ]; then
    cp src/app/pages/CalculadoraMesasWizard.tsx backup_calculadoras_antigas/
    echo -e "    ${GREEN}✅${NC} CalculadoraMesasWizard.tsx"
fi

if [ -f "src/app/pages/CalculadoraRapida.tsx" ]; then
    cp src/app/pages/CalculadoraRapida.tsx backup_calculadoras_antigas/
    echo -e "    ${GREEN}✅${NC} CalculadoraRapida.tsx"
fi

if [ -f "src/app/pages/Calculadoras.tsx" ]; then
    cp src/app/pages/Calculadoras.tsx backup_calculadoras_antigas/
    echo -e "    ${GREEN}✅${NC} Calculadoras.tsx"
fi

echo -e "${GREEN}✅ Backup concluído${NC}"
echo ""

# ========================================
# FASE 2: CRIAR ESTRUTURA DE PASTAS
# ========================================

echo "📁 FASE 2: Criando estrutura de pastas..."

mkdir -p src/domains/precificacao/engine
echo -e "  ${GREEN}✅${NC} src/domains/precificacao/engine"

mkdir -p src/app/components/precificacao
echo -e "  ${GREEN}✅${NC} src/app/components/precificacao"

mkdir -p src/app/components/precificacao/forms
echo -e "  ${GREEN}✅${NC} src/app/components/precificacao/forms"

echo -e "${GREEN}✅ Estrutura criada${NC}"
echo ""

# ========================================
# FASE 3: COPIAR ARQUIVOS DO ENGINE
# ========================================

echo "⚙️  FASE 3: Copiando arquivos do Engine..."

cp "$REPO_PROTOTIPO/domains/precificacao/engine/quoteV2.ts" src/domains/precificacao/engine/
echo -e "  ${GREEN}✅${NC} quoteV2.ts (400 linhas)"

cp "$REPO_PROTOTIPO/domains/precificacao/engine/bomBuilder.ts" src/domains/precificacao/engine/
echo -e "  ${GREEN}✅${NC} bomBuilder.ts (~1200 linhas)"

cp "$REPO_PROTOTIPO/domains/precificacao/engine/defaultTables.ts" src/domains/precificacao/engine/
echo -e "  ${GREEN}✅${NC} defaultTables.ts (~150 linhas)"

echo -e "${GREEN}✅ Engine copiado${NC}"
echo ""

# ========================================
# FASE 4: COPIAR COMPONENTES PRINCIPAIS
# ========================================

echo "🎨 FASE 4: Copiando componentes principais..."

# PrecificacaoPage → PrecificacaoV2
cp "$REPO_PROTOTIPO/components/PrecificacaoPage.tsx" src/app/pages/PrecificacaoV2.tsx
echo -e "  ${GREEN}✅${NC} PrecificacaoV2.tsx (~260 linhas)"

# ConfigPanel
cp "$REPO_PROTOTIPO/components/ConfigPanel.tsx" src/app/components/precificacao/
echo -e "  ${GREEN}✅${NC} ConfigPanel.tsx (~120 linhas)"

# QuoteResults
cp "$REPO_PROTOTIPO/components/QuoteResults.tsx" src/app/components/precificacao/
echo -e "  ${GREEN}✅${NC} QuoteResults.tsx (~150 linhas)"

echo -e "${GREEN}✅ Componentes principais copiados${NC}"
echo ""

# ========================================
# FASE 5: COPIAR FORMULÁRIOS
# ========================================

echo "📝 FASE 5: Copiando formulários de produtos..."

FORMS=(
    "BancadasForm.tsx"
    "LavatoriosForm.tsx"
    "PrateleirasForm.tsx"
    "MesasForm.tsx"
    "EstanteCantoneiraForm.tsx"
    "EstanteTuboForm.tsx"
    "CoifasForm.tsx"
    "ChapaPlanaForm.tsx"
    "MaterialRedondoForm.tsx"
    "CantoneiraForm.tsx"
    "PortasBatentesForm.tsx"
    "FormField.tsx"
)

for form in "${FORMS[@]}"; do
    cp "$REPO_PROTOTIPO/components/forms/$form" src/app/components/precificacao/forms/
    echo -e "  ${GREEN}✅${NC} $form"
done

echo -e "${GREEN}✅ Formulários copiados (12 arquivos)${NC}"
echo ""

# ========================================
# FASE 6: COPIAR UI COMPONENTS (SE NECESSÁRIO)
# ========================================

echo "🎭 FASE 6: Verificando componentes UI..."

# Verificar se já existem
if [ ! -f "src/app/components/ui/toaster.tsx" ]; then
    echo "  → Copiando toaster.tsx..."
    cp "$REPO_PROTOTIPO/components/ui/toaster.tsx" src/app/components/ui/
    echo -e "    ${GREEN}✅${NC} toaster.tsx"
else
    echo -e "  ${YELLOW}⚠️${NC}  toaster.tsx já existe (pulando)"
fi

if [ ! -f "src/app/components/ui/use-toast.ts" ]; then
    echo "  → Copiando use-toast.ts..."
    cp "$REPO_PROTOTIPO/components/ui/use-toast.ts" src/app/components/ui/
    echo -e "    ${GREEN}✅${NC} use-toast.ts"
else
    echo -e "  ${YELLOW}⚠️${NC}  use-toast.ts já existe (pulando)"
fi

if [ ! -f "src/app/components/ui/sonner.tsx" ]; then
    echo "  → Copiando sonner.tsx..."
    cp "$REPO_PROTOTIPO/components/ui/sonner.tsx" src/app/components/ui/
    echo -e "    ${GREEN}✅${NC} sonner.tsx"
else
    echo -e "  ${YELLOW}⚠️${NC}  sonner.tsx já existe (pulando)"
fi

echo -e "${GREEN}✅ Componentes UI verificados${NC}"
echo ""

# ========================================
# FASE 7: AJUSTAR IMPORTS
# ========================================

echo "🔧 FASE 7: Ajustando imports..."

# Ajustar PrecificacaoV2.tsx
echo "  → Ajustando imports em PrecificacaoV2.tsx..."

# Substituir imports relativos por caminhos do inox-val
sed -i.bak 's|from "\./ConfigPanel"|from "../components/precificacao/ConfigPanel"|g' src/app/pages/PrecificacaoV2.tsx
sed -i.bak 's|from "\./QuoteResults"|from "../components/precificacao/QuoteResults"|g' src/app/pages/PrecificacaoV2.tsx
sed -i.bak 's|from "\./forms/|from "../components/precificacao/forms/|g' src/app/pages/PrecificacaoV2.tsx
sed -i.bak 's|from "\.\./domains/precificacao/engine/|from "../../domains/precificacao/engine/|g' src/app/pages/PrecificacaoV2.tsx

# Ajustar ConfigPanel.tsx
echo "  → Ajustando imports em ConfigPanel.tsx..."
sed -i.bak 's|from "\.\./domains/|from "../../domains/|g' src/app/components/precificacao/ConfigPanel.tsx

# Ajustar QuoteResults.tsx
echo "  → Ajustando imports em QuoteResults.tsx..."
sed -i.bak 's|from "\.\./domains/|from "../../domains/|g' src/app/components/precificacao/QuoteResults.tsx

# Remover arquivos .bak
rm -f src/app/pages/PrecificacaoV2.tsx.bak
rm -f src/app/components/precificacao/ConfigPanel.tsx.bak
rm -f src/app/components/precificacao/QuoteResults.tsx.bak

echo -e "${GREEN}✅ Imports ajustados${NC}"
echo ""

# ========================================
# FASE 8: INSTALAR DEPENDÊNCIAS
# ========================================

echo "📦 FASE 8: Instalando dependências..."

# Verificar se package.json existe
if [ -f "package.json" ]; then
    # Detectar se usa npm ou yarn
    if [ -f "yarn.lock" ]; then
        echo "  → Usando Yarn..."
        yarn add lucide-react sonner@2.0.3
    else
        echo "  → Usando NPM..."
        npm install lucide-react sonner@2.0.3
    fi
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
    echo -e "${RED}❌ package.json não encontrado${NC}"
    exit 1
fi

echo ""

# ========================================
# FASE 9: REMOVER ARQUIVOS ANTIGOS
# ========================================

echo "🗑️  FASE 9: Removendo arquivos antigos..."

if [ -f "src/app/pages/CalculadoraMesasWizard.tsx" ]; then
    rm src/app/pages/CalculadoraMesasWizard.tsx
    echo -e "  ${GREEN}✅${NC} Removido CalculadoraMesasWizard.tsx"
fi

if [ -f "src/app/pages/CalculadoraRapida.tsx" ]; then
    rm src/app/pages/CalculadoraRapida.tsx
    echo -e "  ${GREEN}✅${NC} Removido CalculadoraRapida.tsx"
fi

if [ -f "src/app/pages/Calculadoras.tsx" ]; then
    rm src/app/pages/Calculadoras.tsx
    echo -e "  ${GREEN}✅${NC} Removido Calculadoras.tsx"
fi

echo -e "${GREEN}✅ Arquivos antigos removidos${NC}"
echo ""

# ========================================
# FASE 10: INSTRUÇÕES FINAIS
# ========================================

echo ""
echo "========================================"
echo "✨ MIGRAÇÃO AUTOMÁTICA CONCLUÍDA! ✨"
echo "========================================"
echo ""
echo -e "${GREEN}O que foi feito:${NC}"
echo "  ✅ Backup dos arquivos antigos → backup_calculadoras_antigas/"
echo "  ✅ Engine copiado → src/domains/precificacao/engine/"
echo "  ✅ Componentes principais copiados → src/app/pages/ e src/app/components/precificacao/"
echo "  ✅ 12 formulários copiados → src/app/components/precificacao/forms/"
echo "  ✅ Imports ajustados automaticamente"
echo "  ✅ Dependências instaladas (lucide-react, sonner)"
echo "  ✅ Arquivos antigos removidos"
echo ""
echo -e "${YELLOW}⚠️  AÇÕES MANUAIS NECESSÁRIAS:${NC}"
echo ""
echo "1. Atualizar rotas em src/app/routes.tsx:"
echo "   import PrecificacaoV2 from './pages/PrecificacaoV2';"
echo "   { path: '/precificacao', element: <PrecificacaoV2 /> }"
echo ""
echo "2. Atualizar menu/navegação para apontar para /precificacao"
echo ""
echo "3. Adicionar <Toaster /> no root da aplicação (src/app/App.tsx ou main.tsx)"
echo ""
echo "4. Compilar e testar:"
echo "   npm run build"
echo "   npm run dev"
echo ""
echo "5. Testar funcionalmente:"
echo "   - Acessar /precificacao"
echo "   - Calcular cuba 500×500×200mm"
echo "   - Validar preço: ~R\$ 650 (modo used)"
echo ""
echo -e "${GREEN}Próximos passos:${NC}"
echo "  git status"
echo "  git add ."
echo "  git commit -m 'feat: implementar sistema de precificação V2'"
echo "  git push origin feat/precificacao-v2"
echo ""
echo "📚 Documentação completa: PLANO_MIGRACAO_INOX_VAL.md"
echo ""
echo "🎉 Boa sorte com a migração!"
echo ""
