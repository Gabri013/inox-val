import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "./components/layout/Root";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AguardandoLiberacao = lazy(() => import("./pages/AguardandoLiberacao"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Produtos = lazy(() => import("./pages/Produtos"));
const Estoque = lazy(() => import("./pages/Estoque"));
const Orcamentos = lazy(() => import("./pages/Orcamentos"));
const Ordens = lazy(() => import("./pages/Ordens"));
const Compras = lazy(() => import("./pages/Compras"));
const Auditoria = lazy(() => import("./pages/Auditoria"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Ajuda = lazy(() => import("./pages/Ajuda"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const PrecificacaoPublic = lazy(() => import("./pages/PrecificacaoPublic"));
const SemAcesso = lazy(() => import("./pages/SemAcesso"));

const MinhasConfiguracoes = lazy(async () => {
  const mod = await import("@/domains/vendedores");
  return { default: mod.MinhasConfiguracoes };
});
const PrecificacaoPage = lazy(() => import("@/domains/precificacao/pages/Precificacao"));

const ClienteDetail = lazy(async () => {
  const mod = await import("@/domains/clientes");
  return { default: mod.ClienteDetail };
});
const ClienteForm = lazy(async () => {
  const mod = await import("@/domains/clientes");
  return { default: mod.ClienteForm };
});
const ProdutoDetail = lazy(async () => {
  const mod = await import("@/domains/produtos");
  return { default: mod.ProdutoDetail };
});
const ProdutoForm = lazy(async () => {
  const mod = await import("@/domains/produtos");
  return { default: mod.ProdutoForm };
});
const EstoqueMovimentos = lazy(async () => {
  const mod = await import("@/domains/estoque");
  return { default: mod.EstoqueMovimentos };
});
const EstoqueMovimentoForm = lazy(async () => {
  const mod = await import("@/domains/estoque");
  return { default: mod.EstoqueMovimentoForm };
});
const EstoqueProdutoDetail = lazy(async () => {
  const mod = await import("@/domains/estoque");
  return { default: mod.EstoqueProdutoDetail };
});

const ApontamentoOP = lazy(async () => {
  const mod = await import("@/domains/producao");
  return { default: mod.ApontamentoOP };
});
const ControleProducao = lazy(async () => {
  const mod = await import("@/domains/producao");
  return { default: mod.ControleProducao };
});
const DashboardTV = lazy(async () => {
  const mod = await import("@/domains/producao");
  return { default: mod.DashboardTV };
});

const UsuariosList = lazy(async () => {
  const mod = await import("@/domains/usuarios");
  return { default: mod.UsuariosList };
});
const UsuarioForm = lazy(async () => {
  const mod = await import("@/domains/usuarios");
  return { default: mod.UsuarioForm };
});
const UsuarioDetail = lazy(async () => {
  const mod = await import("@/domains/usuarios");
  return { default: mod.UsuarioDetail };
});
const UsuariosApproval = lazy(async () => {
  const mod = await import("@/domains/usuarios");
  return { default: mod.UsuariosApproval };
});
const PermissoesPorFuncao = lazy(async () => {
  const mod = await import("@/domains/usuarios");
  return { default: mod.PermissoesPorFuncao };
});

const ChatPage = lazy(async () => {
  const mod = await import("@/domains/chat");
  return { default: mod.ChatPage };
});

const AnuncioForm = lazy(async () => {
  const mod = await import("@/domains/anuncios");
  return { default: mod.AnuncioForm };
});
const AnunciosList = lazy(async () => {
  const mod = await import("@/domains/anuncios");
  return { default: mod.AnunciosList };
});

function PageLoader() {
  return <div style={{ padding: "1rem", color: "#6B7280" }}>Carregando...</div>;
}

function withSuspense(component: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{component}</Suspense>;
}

function withProtected(Component: ComponentType, requiredModule?: string) {
  return withSuspense(
    <ProtectedRoute requiredModule={requiredModule}>
      <Component />
    </ProtectedRoute>,
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withSuspense(<Login />),
  },
  {
    path: "/precificacao-teste",
    element: withSuspense(<PrecificacaoPublic />),
  },
  {
    path: "/signup",
    element: withSuspense(<Signup />),
  },
  {
    path: "/reset-password",
    element: withSuspense(<ResetPassword />),
  },
  {
    path: "/aguardando-liberacao",
    element: withSuspense(<AguardandoLiberacao />),
  },
  {
    path: "/sem-acesso",
    element: withSuspense(<SemAcesso />),
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, element: withProtected(Dashboard, "dashboard") },
      { path: "clientes", element: withProtected(Clientes, "clientes") },
      { path: "clientes/novo", element: withProtected(ClienteForm, "clientes") },
      { path: "clientes/:id", element: withProtected(ClienteDetail, "clientes") },
      { path: "clientes/:id/editar", element: withProtected(ClienteForm, "clientes") },
      { path: "produtos", element: withProtected(Produtos, "produtos") },
      { path: "produtos/novo", element: withProtected(ProdutoForm, "produtos") },
      { path: "produtos/:id", element: withProtected(ProdutoDetail, "produtos") },
      { path: "produtos/:id/editar", element: withProtected(ProdutoForm, "produtos") },
      { path: "estoque", element: withProtected(Estoque, "estoque") },
      { path: "estoque/produto/:id", element: withProtected(EstoqueProdutoDetail, "estoque") },
      { path: "estoque/movimentos", element: withProtected(EstoqueMovimentos, "estoque") },
      { path: "estoque/movimento/novo", element: withProtected(EstoqueMovimentoForm, "estoque") },
      { path: "orcamentos", element: withProtected(Orcamentos, "orcamentos") },
      { path: "ordens", element: withProtected(Ordens, "ordens") },
      { path: "compras", element: withProtected(Compras, "compras") },
      { path: "auditoria", element: withProtected(Auditoria, "auditoria") },
      { path: "minhas-configuracoes", element: withProtected(MinhasConfiguracoes) },
      { path: "ajuda", element: withProtected(Ajuda) },
      { path: "perfil", element: withProtected(Perfil) },
      { path: "configuracoes", element: withProtected(Configuracoes, "configuracoes") },
      { path: "precificacao", element: withProtected(PrecificacaoPage, "precificacao") },
      { path: "controle-producao", element: withProtected(ControleProducao, "producao") },
      { path: "dashboard-tv", element: withProtected(DashboardTV, "producao") },
      { path: "apontamento-op", element: withProtected(ApontamentoOP, "producao") },
      { path: "usuarios", element: withProtected(UsuariosList, "usuarios") },
      { path: "usuarios/aprovacoes", element: withProtected(UsuariosApproval, "usuarios") },
      { path: "usuarios/permissoes", element: withProtected(PermissoesPorFuncao, "usuarios") },
      { path: "usuarios/novo", element: withProtected(UsuarioForm, "usuarios") },
      { path: "usuarios/:id", element: withProtected(UsuarioDetail, "usuarios") },
      { path: "usuarios/:id/editar", element: withProtected(UsuarioForm, "usuarios") },
      { path: "chat", element: withProtected(ChatPage, "chat") },
      { path: "anuncios", element: withProtected(AnunciosList, "anuncios") },
      { path: "anuncios/novo", element: withProtected(AnuncioForm, "anuncios") },
      { path: "anuncios/:id/editar", element: withProtected(AnuncioForm, "anuncios") },
      { path: "*", element: withSuspense(<NotFound />) },
    ],
  },
]);
