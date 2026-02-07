/**
 * Provider centralizado da aplicação
 * Integra Auth, React Query, Theme e outros providers
 */

import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext'; // Novo Firebase AuthContext
import { AuditProvider } from '../contexts/AuditContext';
import { WorkflowProvider } from '../contexts/WorkflowContext';
import { PermissionsProvider } from '@/domains/usuarios';
import { seedDatabaseOnce } from '@/services/storage/seed';

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const isDev = import.meta.env.DEV;
        const shouldSeed = isDev && import.meta.env.VITE_USE_MOCK === 'true';

        if (shouldSeed) {
          await seedDatabaseOnce();
        }
      } catch (error) {
        console.error('Erro ao inicializar dados locais:', error);
      } finally {
        if (active) {
          setIsInitialized(true);
        }
      }
    };

    init();
    return () => {
      active = false;
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

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
