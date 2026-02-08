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
import CalculadoraMesasWizard from "./pages/CalculadoraMesasWizard";
import SemAcesso from "./pages/SemAcesso";
import PrecificacaoPage from "@/domains/precificacao/pages/Precificacao";

// Importar pÃ¡ginas de Clientes e Produtos
import { ClienteDetail, ClienteForm } from "@/domains/clientes";
import { ProdutoDetail, ProdutoForm } from "@/domains/produtos";

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
        path: "orcamentos", 
        element: <ProtectedRoute requiredModule="orcamentos"><Orcamentos /></ProtectedRoute>
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
        path: "calculadora", 
        element: <ProtectedRoute requiredModule="calculadora"><CalculadoraMesasWizard /></ProtectedRoute>
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
      { path: "*", Component: NotFound },
    ],
  },
]);
