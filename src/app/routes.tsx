import { createBrowserRouter } from "react-router";
import Root from "./components/layout/Root";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import PopularBanco from "./pages/PopularBanco";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Orcamentos from "./pages/Orcamentos";
import Ordens from "./pages/Ordens";
import Compras from "./pages/Compras";
import Auditoria from "./pages/Auditoria";
import MinhasConfiguracoes from "@/domains/vendedores/pages/MinhasConfiguracoes";
import NotFound from "./pages/NotFound";
import Ajuda from "./pages/Ajuda";
import CalculadoraRapida from "./pages/CalculadoraRapida";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import ConfiguracaoCustos from "./pages/ConfiguracaoCustos";

// Importar páginas de Clientes e Produtos
import ClienteForm from "@/domains/clientes/pages/ClienteForm";
import ClienteDetail from "@/domains/clientes/pages/ClienteDetail";
import ProdutoForm from "@/domains/produtos/pages/ProdutoForm";
import ProdutoDetail from "@/domains/produtos/pages/ProdutoDetail";

// Importar páginas de Produção
import ControleProducao from "@/domains/producao/pages/ControleProducao";
import DashboardTV from "@/domains/producao/pages/DashboardTV";
import ApontamentoOP from "@/domains/producao/pages/ApontamentoOP";

// Importar páginas de Usuários
import { UsuariosList, UsuarioForm, UsuarioDetail } from "@/domains/usuarios";

// Importar páginas de Chat
import ChatPage from "@/domains/chat/pages/ChatPage";

// Importar páginas de Anúncios
import AnunciosList from "@/domains/anuncios/pages/AnunciosList";
import AnuncioForm from "@/domains/anuncios/pages/AnuncioForm";

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
    path: "/popular-banco",
    Component: PopularBanco,
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
        element: <ProtectedRoute><Auditoria /></ProtectedRoute>
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
        path: "calculadora-rapida", 
        element: <ProtectedRoute><CalculadoraRapida /></ProtectedRoute>
      },
      { 
        path: "perfil", 
        element: <ProtectedRoute><Perfil /></ProtectedRoute>
      },
      { 
        path: "configuracoes", 
        element: <ProtectedRoute><Configuracoes /></ProtectedRoute>
      },
      { 
        path: "configuracao-custos", 
        element: <ProtectedRoute><ConfiguracaoCustos /></ProtectedRoute>
      },
      { 
        path: "controle-producao", 
        element: <ProtectedRoute><ControleProducao /></ProtectedRoute>
      },
      { 
        path: "dashboard-tv", 
        element: <ProtectedRoute><DashboardTV /></ProtectedRoute>
      },
      { 
        path: "apontamento-op", 
        element: <ProtectedRoute><ApontamentoOP /></ProtectedRoute>
      },
      { 
        path: "usuarios", 
        element: <ProtectedRoute requiredModule="usuarios"><UsuariosList /></ProtectedRoute>
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
        element: <ProtectedRoute><ChatPage /></ProtectedRoute>
      },
      { 
        path: "anuncios", 
        element: <ProtectedRoute><AnunciosList /></ProtectedRoute>
      },
      { 
        path: "anuncios/novo", 
        element: <ProtectedRoute><AnuncioForm /></ProtectedRoute>
      },
      { 
        path: "anuncios/:id/editar", 
        element: <ProtectedRoute><AnuncioForm /></ProtectedRoute>
      },
      { path: "*", Component: NotFound },
    ],
  },
]);