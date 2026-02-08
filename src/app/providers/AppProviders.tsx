/**
 * Provider centralizado da aplicação
 * Integra Auth, React Query, Theme e outros providers
 */

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext'; // Novo Firebase AuthContext
import { AuditProvider } from '../contexts/AuditContext';
import { WorkflowProvider } from '../contexts/WorkflowContext';
import { PermissionsProvider } from '@/domains/usuarios';

import { Toaster } from 'sonner';
/**
 * Configuração do React Query
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antigo cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Provider de inicialização
 */
function InitializationProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Provider principal que combina todos os providers necessários
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <InitializationProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PermissionsProvider>
              <AuditProvider>
                <WorkflowProvider>
                  {children}
                  <Toaster />
                </WorkflowProvider>
              </AuditProvider>
            </PermissionsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </InitializationProvider>
    </ThemeProvider>
  );
}
