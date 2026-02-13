import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Calculator as CalcIcon, 
  FileText, 
  Factory, 
  CheckCircle, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  User
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Novo Cálculo', href: '/calculator', icon: CalcIcon },
  { name: 'Orçamentos', href: '/products', icon: FileText },
  { name: 'Produção', href: '/production', icon: Factory },
  { name: 'Aprovações', href: '/approvals', icon: CheckCircle },
  { name: 'Relatórios', href: '/analytics', icon: BarChart3 },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen" style={{ background: '#0B0F14' }}>
      {/* Sidebar Technical */}
      <aside className="fixed top-0 left-0 z-50 h-full w-72">
        <div 
          className="h-full border-r"
          style={{ 
            background: 'rgba(18, 24, 38, 0.7)',
            backdropFilter: 'blur(20px)',
            borderColor: '#2A3448'
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-8 border-b" style={{ borderColor: '#2A3448' }}>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
                boxShadow: '0 0 20px rgba(41, 98, 255, 0.35)',
              }}
            >
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: '#E6EDF7' }}>INOX-VAL</h1>
              <p className="text-xs" style={{ color: '#A9B4C6' }}>Industrial System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                    style={{
                      background: isActive ? 'rgba(41, 98, 255, 0.15)' : 'transparent',
                      color: isActive ? '#2962FF' : '#A9B4C6',
                      borderLeft: isActive ? '3px solid #2962FF' : '3px solid transparent',
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div 
            className="absolute bottom-0 left-0 right-0 p-6 border-t"
            style={{ borderColor: '#2A3448' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
                }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#E6EDF7' }}>Engenheiro Admin</p>
                <p className="text-xs" style={{ color: '#A9B4C6' }}>admin@inoxval.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-72">
        {/* Header */}
        <header 
          className="sticky top-0 z-30 border-b"
          style={{
            background: 'rgba(16, 23, 34, 0.8)',
            backdropFilter: 'blur(20px)',
            borderColor: '#2A3448',
          }}
        >
          <div className="flex items-center gap-6 px-8 py-5">
            {/* Search */}
            <div className="flex-1 max-w-xl relative">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: '#5F6C80' }}
              />
              <Input
                placeholder="Buscar orçamentos, clientes..."
                className="w-full pl-12 h-12 rounded-lg border"
                style={{
                  background: '#121826',
                  borderColor: '#2A3448',
                  color: '#E6EDF7',
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Status Chip */}
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{ background: 'rgba(0, 200, 67, 0.15)', border: '1px solid rgba(0, 200, 67, 0.3)' }}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: '#00C853' }}
                />
                <span className="text-sm font-medium" style={{ color: '#00C853' }}>Sistema Online</span>
              </div>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: '#121826', border: '1px solid #2A3448' }}
              >
                <Bell className="w-5 h-5" style={{ color: '#A9B4C6' }} />
                <div 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#FF6D00', color: 'white' }}
                >
                  3
                </div>
              </motion.button>

              {/* Avatar */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
                  boxShadow: '0 0 15px rgba(41, 98, 255, 0.3)',
                }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
