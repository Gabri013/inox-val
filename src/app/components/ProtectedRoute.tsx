/**
 * ============================================================================
 * PROTECTED ROUTE
 * ============================================================================
 *
 * Componente que protege rotas que requerem autenticacao.
 *
 * Se o usuario nao estiver autenticado, redireciona para /login.
 * Enquanto verifica autenticacao, mostra loading.
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

  // So bloqueia se loading=false e user=null
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
    return <Navigate to="/sem-acesso" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
