/**
 * ============================================================================
 * PROTECTED ROUTE
 * ============================================================================
 * 
 * Componente que protege rotas que requerem autenticação.
 * 
 * Se o usuário não estiver autenticado, redireciona para /login.
 * Enquanto verifica autenticação, mostra loading.
 * 
 * ============================================================================
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/app/hooks/usePermissions';
import type { Module } from '@/domains/usuarios';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: string;
}

export function ProtectedRoute({ children, requiredModule }: ProtectedRouteProps) {
  const { user, loading, hasPermission } = useAuth();
  const { canAccess } = usePermissions();
  const location = useLocation();

  // Só bloqueia se loading=false e user=null
  if (!loading && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (requiredModule && !(canAccess(requiredModule as Module) || hasPermission(requiredModule))) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-2xl font-bold">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar este módulo.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
