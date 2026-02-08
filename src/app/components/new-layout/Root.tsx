import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
	LayoutDashboard,
	Users,
	Package,
	Archive,
	FileText,
	ClipboardList,
	ShoppingCart,
	Factory,
	Calculator,
	MessageCircle,
	Megaphone,
	UserCog,
	Settings,
	Shield,
	HelpCircle,
	ChevronLeft,
	ChevronRight,
	User,
	LogOut,
	} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { Button } from "../../components/ui/button";

const navigation = [
	{ name: "Dashboard", href: "/", icon: LayoutDashboard },
	{ name: "Clientes", href: "/clientes", icon: Users },
	{ name: "Produtos", href: "/produtos", icon: Package },
	{ name: "Estoque", href: "/estoque", icon: Archive },
	{ name: "OrÃ§amentos", href: "/orcamentos", icon: FileText },
	{ name: "Ordens", href: "/ordens", icon: ClipboardList },
	{ name: "Compras", href: "/compras", icon: ShoppingCart },
	{ name: "Controle de ProduÃ§Ã£o", href: "/controle-producao", icon: Factory },
	{ name: "Chat", href: "/chat", icon: MessageCircle },
	{ name: "AnÃºncios", href: "/anuncios", icon: Megaphone },
	{ name: "UsuÃ¡rios", href: "/usuarios", icon: UserCog },
	{ name: "ConfiguraÃ§Ã£o de Custos", href: "/configuracoes?tab=custos", icon: Settings },
	{ name: "Precificacao", href: "/precificacao", icon: Calculator },
	{ name: "Auditoria", href: "/auditoria", icon: Shield },
];

export default function Root() {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();

	// Mock user data - em produÃ§Ã£o virÃ¡ do AuthContext
	const user = {
		name: "Admin User",
		email: "admin@inoxval.com",
	};

	const handleLogout = () => {
		navigate("/login");
	};

	const getUserInitials = () => {
		return user.name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="flex h-screen bg-neutral-50">
			{/* Sidebar */}
			<aside
				className={cn(
					"bg-neutral-900 border-r border-neutral-800 transition-all duration-300 flex flex-col",
					sidebarOpen ? "w-64" : "w-20"
				)}
			>
				{/* Logo */}
				<div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
					{sidebarOpen ? (
						<div className="flex items-center gap-3">
							<div className="size-8 bg-primary-500 rounded-lg flex items-center justify-center">
								<LayoutDashboard className="size-5 text-white" />
							</div>
							<div>
								<h1 className="text-base font-semibold text-white">ERP Inox</h1>
								<p className="text-xs text-neutral-400">Sistema de GestÃ£o</p>
							</div>
						</div>
					) : (
						<div className="w-full flex justify-center">
							<div className="size-10 bg-primary-500 rounded-lg flex items-center justify-center">
								<LayoutDashboard className="size-6 text-white" />
							</div>
						</div>
					)}
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
					{navigation.map((item) => {
						const isActive = location.pathname === item.href || 
							(item.href !== "/" && location.pathname.startsWith(item.href));

						return (
							<Link
								key={item.name}
								to={item.href}
									className={cn(
										"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
										isActive
											? "bg-primary-500 text-white shadow-md"
											: "text-neutral-300 hover:bg-neutral-800 hover:text-white",
										!isActive && "border border-transparent"
									)}
								>
								<item.icon className="size-5 shrink-0" />
								{sidebarOpen && <span className="truncate text-sm font-medium">{item.name}</span>}
							</Link>
						);
					})}
				</nav>

				{/* Footer */}
				<div className="p-3 border-t border-neutral-800 space-y-2">
					{/* Ajuda */}
					<Link
						to="/ajuda"
						className={cn(
							"flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
							location.pathname === "/ajuda"
								? "bg-primary-500 text-white"
								: "text-neutral-300 hover:bg-neutral-800 hover:text-white"
						)}
					>
						<HelpCircle className="size-5 shrink-0" />
						{sidebarOpen && <span className="truncate text-sm">Ajuda</span>}
					</Link>

					{/* Toggle Sidebar */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800"
					>
						{sidebarOpen ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
					</Button>
				</div>
			</aside>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Header */}
				<header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
					<div className="flex items-center gap-4">
						<h2 className="text-lg font-semibold text-neutral-900">
							{navigation.find((item) => item.href === location.pathname)?.name || "ERP System"}
						</h2>
					</div>

					<div className="flex items-center gap-4">
						{/* User Menu */}
						<div className="flex items-center gap-3">
							<div className="hidden md:block text-right">
								<p className="text-sm font-medium text-neutral-900">{user.name}</p>
								<p className="text-xs text-neutral-500">{user.email}</p>
							</div>
							<div className="size-10 rounded-full bg-primary-100 flex items-center justify-center">
								<span className="text-sm font-semibold text-primary-700">{getUserInitials()}</span>
							</div>
						</div>

						<div className="h-8 w-px bg-neutral-200" />

						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => navigate("/perfil")}
								className="text-neutral-600 hover:text-neutral-900"
							>
								<User className="size-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleLogout}
								className="text-neutral-600 hover:text-danger-600"
							>
								<LogOut className="size-5" />
							</Button>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-auto p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
