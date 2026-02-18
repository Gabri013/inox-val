import { createBrowserRouter } from "react-router-dom";
import Root from "./components/layout/Root";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import AguardandoLiberacao from "./pages/AguardandoLiberacao";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Orcamentos from "./pages/Orcamentos";
import Ordens from "./pages/Ordens";
import Compras from "./pages/Compras";
import Auditoria from "./pages/Auditoria";
import { MinhasConfiguracoes } from "@/domains/vendedores";
import NotFound from "./pages/NotFound";
import Ajuda from "./pages/Ajuda";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import PrecificacaoPublic from "./pages/PrecificacaoPublic";
import SemAcesso from "./pages/SemAcesso";
import PrecificacaoPage from "@/domains/precificacao/pages/Precificacao";
import QuoteWizardPage from "./pages/QuoteWizardPage";
import AutoQuotePage from "./pages/AutoQuotePage";
import GestaoMateriaisPage from "./pages/GestaoMateriaisPage";
import ConfiguracaoCustos from "./pages/ConfiguracaoCustos";
import CatalogoInsumos from "./pages/CatalogoInsumos";
import PopularBanco from "./pages/PopularBanco";
import CriacaoOrcamentoPage from "./pages/CriacaoOrcamentoPage";
import CorporateValidationPage from "./pages/CorporateValidationPage";

// Importar páginas de Calibração
import { 
  CalibrationDashboard, 
  BaselineEditor, 
  CalibrationRunPage, 
  FactorsEditor, 
  CalibrationReportPage 
} from "@/domains/calibration";

// Importar pÃ¡ginas de Clientes e Produtos
import { ClienteDetail, ClienteForm } from "@/domains/clientes";
import { ProdutoDetail, ProdutoForm } from "@/domains/produtos";
import { EstoqueMovimentos, EstoqueMovimentoForm, EstoqueProdutoDetail } from "@/domains/estoque";

// Importar pÃ¡ginas de ProduÃ§Ã£o
import { ApontamentoOP, ControleProducao, DashboardTV } from "@/domains/producao";

// Importar pÃ¡ginas de UsuÃ¡rios
import { UsuariosList, UsuarioForm, UsuarioDetail, UsuariosApproval, PermissoesPorFuncao } from "@/domains/usuarios";

// Importar pÃ¡ginas de Chat
import { ChatPage } from "@/domains/chat";

// Importar pÃ¡ginas de AnÃºncios
import { AnuncioForm, AnunciosList } from "@/domains/anuncios";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/precificacao-teste",
    Component: PrecificacaoPublic,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/aguardando-liberacao",
    Component: AguardandoLiberacao,
  },
  {
    path: "/sem-acesso",
    Component: SemAcesso,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { 
        index: true, 
        element: <ProtectedRoute requiredModule="dashboard"><Dashboard /></ProtectedRoute>
      },
      { 
        path: "catalogo-insumos", 
        element: <ProtectedRoute><CatalogoInsumos /></ProtectedRoute>
      },
      { 
        path: "gestao-materiais", 
        element: <ProtectedRoute><GestaoMateriaisPage /></ProtectedRoute>
      },
      { 
        path: "configuracao-custos", 
        element: <ProtectedRoute><ConfiguracaoCustos /></ProtectedRoute>
      },
      { 
        path: "validacao-corporativa", 
        element: <ProtectedRoute requiredModule="configuracoes"><CorporateValidationPage /></ProtectedRoute>
      },
      { 
        path: "popular-banco", 
        element: <ProtectedRoute><PopularBanco /></ProtectedRoute>
      },
      { 
        path: "criacao-orcamento", 
        element: <ProtectedRoute><CriacaoOrcamentoPage /></ProtectedRoute>
      },
      { 
        path: "clientes", 
        element: <ProtectedRoute requiredModule="clientes"><Clientes /></ProtectedRoute>
      },
      { 
        path: "clientes/novo", 
        element: <ProtectedRoute requiredModule="clientes"><ClienteForm /></ProtectedRoute>
      },
      { 
        path: "clientes/:id", 
        element: <ProtectedRoute requiredModule="clientes"><ClienteDetail /></ProtectedRoute>
      },
      { 
        path: "clientes/:id/editar", 
        element: <ProtectedRoute requiredModule="clientes"><ClienteForm /></ProtectedRoute>
      },
      { 
        path: "produtos", 
        element: <ProtectedRoute requiredModule="produtos"><Produtos /></ProtectedRoute>
      },
      { 
        path: "produtos/novo", 
        element: <ProtectedRoute requiredModule="produtos"><ProdutoForm /></ProtectedRoute>
      },
      { 
        path: "produtos/:id", 
        element: <ProtectedRoute requiredModule="produtos"><ProdutoDetail /></ProtectedRoute>
      },
      { 
        path: "produtos/:id/editar", 
        element: <ProtectedRoute requiredModule="produtos"><ProdutoForm /></ProtectedRoute>
      },
      { 
        path: "estoque", 
        element: <ProtectedRoute requiredModule="estoque"><Estoque /></ProtectedRoute>
      },
      {
        path: "estoque/produto/:id",
        element: <ProtectedRoute requiredModule="estoque"><EstoqueProdutoDetail /></ProtectedRoute>
      },
      {
        path: "estoque/movimentos",
        element: <ProtectedRoute requiredModule="estoque"><EstoqueMovimentos /></ProtectedRoute>
      },
      {
        path: "estoque/movimento/novo",
        element: <ProtectedRoute requiredModule="estoque"><EstoqueMovimentoForm /></ProtectedRoute>
      },
      { 
        path: "orcamentos", 
        element: <ProtectedRoute requiredModule="orcamentos"><Orcamentos /></ProtectedRoute>
      },
      { 
        path: "quotes/wizard", 
        element: <ProtectedRoute requiredModule="orcamentos"><QuoteWizardPage /></ProtectedRoute>
      },
      { 
        path: "orcamento-automatico", 
        element: <ProtectedRoute requiredModule="orcamentos"><AutoQuotePage /></ProtectedRoute>
      },
      { 
        path: "ordens", 
        element: <ProtectedRoute requiredModule="ordens"><Ordens /></ProtectedRoute>
      },
      { 
        path: "compras", 
        element: <ProtectedRoute requiredModule="compras"><Compras /></ProtectedRoute>
      },
      { 
        path: "auditoria", 
        element: <ProtectedRoute requiredModule="auditoria"><Auditoria /></ProtectedRoute>
      },
      { 
        path: "minhas-configuracoes", 
        element: <ProtectedRoute><MinhasConfiguracoes /></ProtectedRoute>
      },
      { 
        path: "ajuda", 
        element: <ProtectedRoute><Ajuda /></ProtectedRoute>
      },
      { 
        path: "perfil", 
        element: <ProtectedRoute><Perfil /></ProtectedRoute>
      },
      { 
        path: "configuracoes", 
        element: <ProtectedRoute requiredModule="configuracoes"><Configuracoes /></ProtectedRoute>
      },
      { 
        path: "precificacao", 
        element: <ProtectedRoute requiredModule="precificacao"><PrecificacaoPage /></ProtectedRoute>
      },
      { 
        path: "controle-producao", 
        element: <ProtectedRoute requiredModule="producao"><ControleProducao /></ProtectedRoute>
      },
      { 
        path: "dashboard-tv", 
        element: <ProtectedRoute requiredModule="producao"><DashboardTV /></ProtectedRoute>
      },
      { 
        path: "apontamento-op", 
        element: <ProtectedRoute requiredModule="producao"><ApontamentoOP /></ProtectedRoute>
      },
      { 
        path: "usuarios", 
        element: <ProtectedRoute requiredModule="usuarios"><UsuariosList /></ProtectedRoute>
      },
      { 
        path: "usuarios/aprovacoes", 
        element: <ProtectedRoute requiredModule="usuarios"><UsuariosApproval /></ProtectedRoute>
      },
      { 
        path: "usuarios/permissoes", 
        element: <ProtectedRoute requiredModule="usuarios"><PermissoesPorFuncao /></ProtectedRoute>
      },
      { 
        path: "usuarios/novo", 
        element: <ProtectedRoute requiredModule="usuarios"><UsuarioForm /></ProtectedRoute>
      },
      { 
        path: "usuarios/:id", 
        element: <ProtectedRoute requiredModule="usuarios"><UsuarioDetail /></ProtectedRoute>
      },
      { 
        path: "usuarios/:id/editar", 
        element: <ProtectedRoute requiredModule="usuarios"><UsuarioForm /></ProtectedRoute>
      },
      { 
        path: "chat", 
        element: <ProtectedRoute requiredModule="chat"><ChatPage /></ProtectedRoute>
      },
      { 
        path: "anuncios", 
        element: <ProtectedRoute requiredModule="anuncios"><AnunciosList /></ProtectedRoute>
      },
      { 
        path: "anuncios/novo", 
        element: <ProtectedRoute requiredModule="anuncios"><AnuncioForm /></ProtectedRoute>
      },
      { 
        path: "anuncios/:id/editar", 
        element: <ProtectedRoute requiredModule="anuncios"><AnuncioForm /></ProtectedRoute>
      },
      // Rotas de Calibração
      { 
        path: "calibracao", 
        element: <ProtectedRoute requiredModule="configuracoes"><CalibrationDashboard /></ProtectedRoute>
      },
      { 
        path: "calibracao/materiais", 
        element: <ProtectedRoute requiredModule="configuracoes"><div>Materiais</div></ProtectedRoute>
      },
      { 
        path: "calibracao/processos", 
        element: <ProtectedRoute requiredModule="configuracoes"><div>Processos</div></ProtectedRoute>
      },
      { 
        path: "calibracao/perdas", 
        element: <ProtectedRoute requiredModule="configuracoes"><div>Perdas</div></ProtectedRoute>
      },
      { 
        path: "calibracao/metricas", 
        element: <ProtectedRoute requiredModule="configuracoes"><div>Métricas</div></ProtectedRoute>
      },
      { 
        path: "calibracao/overhead-margem", 
        element: <ProtectedRoute requiredModule="configuracoes"><div>Overhead e Margem</div></ProtectedRoute>
      },
      { 
        path: "calibracao/validacao", 
        element: <ProtectedRoute requiredModule="configuracoes"><div>Validação</div></ProtectedRoute>
      },
      { 
        path: "calibracao/relatorio", 
        element: <ProtectedRoute requiredModule="configuracoes"><CalibrationReportPage reportId="1" /></ProtectedRoute>
      },
      { 
        path: "calibracao/baselines/novo", 
        element: <ProtectedRoute requiredModule="configuracoes"><BaselineEditor onSave={() => {}} onCancel={() => {}} /></ProtectedRoute>
      },
      { 
        path: "calibracao/baselines/:id/editar", 
        element: <ProtectedRoute requiredModule="configuracoes"><BaselineEditor onSave={() => {}} onCancel={() => {}} /></ProtectedRoute>
      },
      { 
        path: "calibracao/fatores", 
        element: <ProtectedRoute requiredModule="configuracoes"><FactorsEditor /></ProtectedRoute>
      },
      { 
        path: "calibracao/runs/:id", 
        element: <ProtectedRoute requiredModule="configuracoes"><CalibrationRunPage runId="1" /></ProtectedRoute>
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
