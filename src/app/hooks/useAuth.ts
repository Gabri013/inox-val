import { useContext, createContext, ReactNode, createElement } from 'react';

interface AuthContextType {
  user: any;
  company: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = null;
  const company = null;
  const isLoading = false;
  
  const hasPermission = (permission: string): boolean => {
    return false;
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return false;
  };
  
  const hasRole = (role: string): boolean => {
    return false;
  };
  
  const isAdmin = (): boolean => false;
  const isManager = (): boolean => false;
  
  return createElement(AuthContext.Provider, {
    value: {
      user,
      company,
      isAuthenticated: false,
      isLoading,
      hasPermission,
      hasAnyPermission,
      hasRole,
      isAdmin,
      isManager
    }
  }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
