/**
 * ============================================================================
 * AUTH CONTEXT
 * ============================================================================
 * 
 * Contexto de autenticação usando Firebase Auth.
 * 
 * Funcionalidades:
 * - Login com email/senha
 * - Logout
 * - Signup (registro)
 * - Reset de senha
 * - Persistência de sessão
 * - Estado do usuário em tempo real
 * 
 * ============================================================================
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirestore, isFirebaseConfigured, setEmpresaContext } from '@/lib/firebase';
import { COLLECTIONS } from '@/types/firebase';
import { toast } from 'sonner';
import { defaultPermissionsByRole, type PermissionsMap } from '@/domains/usuarios';

interface AuthContextData {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nome: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface UserProfile {
  id: string;
  empresaId?: string;
  email?: string;
  nome?: string;
  role?: string;
  ativo?: boolean;
  permissoesCustomizadas?: PermissionsMap;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const defaultEmpresaId = import.meta.env.VITE_DEFAULT_EMPRESA_ID || 'default';
  const pendingApprovalPath = '/aguardando-liberacao';
  const mockEnabled = import.meta.env.VITE_USE_MOCK === 'true';
  const mockStorageKey = 'inoxval_mock_auth';

  const buildMockProfile = (email: string, nome?: string) => {
    const displayName = nome || email?.split('@')[0] || 'Admin Demo';
    return {
      id: 'mock-user',
      empresaId: defaultEmpresaId,
      email,
      nome: displayName,
      role: 'Administrador',
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user',
      updatedBy: 'mock-user',
      isDeleted: false,
    };
  };

  const buildMockUser = (email: string, nome?: string) =>
    ({
      uid: 'mock-user',
      email,
      displayName: nome || email?.split('@')[0] || 'Admin Demo',
      getIdToken: async () => 'mock-token',
    } as User);

  const markPendingApproval = (email?: string | null) => {
    localStorage.setItem('inoxval_pending_approval', 'true');
    if (email) {
      localStorage.setItem('inoxval_pending_email', email);
    }
  };

  // Monitorar estado de autenticação (persistência configurada no firebase.ts)
  useEffect(() => {
    if (mockEnabled) {
      const stored = localStorage.getItem(mockStorageKey);
      if (stored) {
        try {
          const saved = JSON.parse(stored);
          const email = saved.email || 'demo@inox.local';
          const nome = saved.nome || saved.displayName;
          const mockProfile = saved.profile || saved;
          setUser(buildMockUser(email, nome));
          setProfile(mockProfile);
          setEmpresaContext(mockProfile?.empresaId || defaultEmpresaId);
        } catch {
          localStorage.removeItem(mockStorageKey);
        }
      }
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setEmpresaContext(null);
        setLoading(false);
        return;
      }

      try {
        await currentUser.getIdToken(true);
        const db = getFirestore();
        const userRef = doc(db, COLLECTIONS.users, currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          markPendingApproval(currentUser.email);
          await setDoc(
            userRef,
            {
              id: currentUser.uid,
              empresaId: defaultEmpresaId,
              email: currentUser.email,
              nome: currentUser.displayName || currentUser.email || 'Usuário',
              role: 'Vendedor',
              ativo: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: currentUser.uid,
              updatedBy: currentUser.uid,
              isDeleted: false,
            },
            { merge: true }
          );
          await signOut(auth);
          setUser(null);
          setProfile(null);
          setEmpresaContext(null);
          window.location.assign(pendingApprovalPath);
          toast.error('Conta criada. Aguarde liberação do administrador.');
          setLoading(false);
          return;
        }

        const profile = userSnap.data() as { ativo?: boolean };
        if (!profile?.ativo) {
          markPendingApproval(currentUser.email);
          await signOut(auth);
          setUser(null);
          setProfile(null);
          setEmpresaContext(null);
          window.location.assign(pendingApprovalPath);
          toast.error('Conta aguardando liberação do administrador.');
          setLoading(false);
          return;
        }

        setUser(currentUser);
        const userProfile = { id: currentUser.uid, ...(userSnap.data() as Partial<UserProfile>) };
        setProfile(userProfile as UserProfile);
        const empresaId = userProfile?.empresaId || currentUser.uid;
        setEmpresaContext(empresaId);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao validar usuário:', error);
        setUser(null);
        setProfile(null);
        setEmpresaContext(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    if (mockEnabled) {
      const mockProfile = buildMockProfile(email);
      setUser(buildMockUser(email, mockProfile.nome));
      setProfile(mockProfile);
      setEmpresaContext(mockProfile.empresaId);
      localStorage.setItem(mockStorageKey, JSON.stringify(mockProfile));
      toast.success('Login realizado (demo mode)');
      return;
    }

    if (!isFirebaseConfigured()) {
      toast.error('Firebase não configurado. Configure as variáveis de ambiente.');
      throw new Error('Firebase não configurado');
    }

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth não disponível');
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);
      const db = getFirestore();
      const userRef = doc(db, COLLECTIONS.users, result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        markPendingApproval(result.user.email);
        await setDoc(
          userRef,
          {
            id: result.user.uid,
            empresaId: defaultEmpresaId,
            email: result.user.email,
            nome: result.user.displayName || result.user.email || 'Usuário',
            role: 'Vendedor',
            ativo: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: result.user.uid,
            updatedBy: result.user.uid,
            isDeleted: false,
          },
          { merge: true }
        );
        await signOut(auth);
        setProfile(null);
        setEmpresaContext(null);
        window.location.assign(pendingApprovalPath);
        throw new Error('Conta criada. Aguarde liberação do administrador.');
      }

      const profile = userSnap.data() as { ativo?: boolean, empresaId?: string };
      if (!profile?.ativo) {
        markPendingApproval(result.user.email);
        await signOut(auth);
        setProfile(null);
        setEmpresaContext(null);
        window.location.assign(pendingApprovalPath);
        throw new Error('Conta aguardando liberação do administrador.');
      }

      setUser(result.user);
      const userProfile = { id: result.user.uid, ...(userSnap.data() as Partial<UserProfile>) } as UserProfile;
      setProfile(userProfile);
      setEmpresaContext(userProfile.empresaId || defaultEmpresaId);
      toast.success('Login realizado com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao fazer login:', error);

      const err = error as { code?: string; message?: string };
      
      // Mensagens de erro amigáveis
      let errorMessage = 'Erro ao fazer login';

      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Email ou senha inválidos';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuário desativado';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        default:
          errorMessage = err.message || 'Erro ao fazer login';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Signup
  const signup = async (email: string, password: string, nome: string) => {
    if (mockEnabled) {
      const mockProfile = buildMockProfile(email, nome);
      setUser(buildMockUser(email, nome));
      setProfile(mockProfile);
      setEmpresaContext(mockProfile.empresaId);
      localStorage.setItem(mockStorageKey, JSON.stringify(mockProfile));
      toast.success('Conta criada (demo mode)');
      return;
    }

    if (!isFirebaseConfigured()) {
      toast.error('Firebase não configurado. Configure as variáveis de ambiente.');
      throw new Error('Firebase não configurado');
    }

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth não disponível');
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);
      
      // Atualizar perfil com nome
      await updateProfile(result.user, { displayName: nome });
      
      const db = getFirestore();
      await setDoc(
        doc(db, COLLECTIONS.users, result.user.uid),
        {
          id: result.user.uid,
          empresaId: defaultEmpresaId,
          email: result.user.email,
          nome,
          role: 'Vendedor',
          ativo: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: result.user.uid,
          updatedBy: result.user.uid,
          isDeleted: false,
        },
        { merge: true }
      );

      markPendingApproval(result.user.email);
      await signOut(auth);
      setUser(null);
      setProfile(null);
      window.location.assign(pendingApprovalPath);
      toast.success('Conta criada. Aguarde liberação do administrador.');
    } catch (error: unknown) {
      console.error('Erro ao criar conta:', error);
      
      let errorMessage = 'Erro ao criar conta';
      
      const err = error as { code?: string; message?: string };

      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email já cadastrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca (mínimo 6 caracteres)';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Cadastro não permitido';
          break;
        default:
          errorMessage = err.message || 'Erro ao criar conta';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout
  const logout = async () => {
    if (mockEnabled) {
      localStorage.removeItem(mockStorageKey);
      setUser(null);
      setProfile(null);
      setEmpresaContext(null);
      toast.success('Logout realizado (demo mode)');
      return;
    }

    if (!isFirebaseConfigured()) {
      // Se Firebase não configurado, apenas limpar estado local
      setUser(null);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setUser(null);
        return;
      }
      
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setEmpresaContext(null);
      toast.success('Logout realizado com sucesso');
    } catch (error: unknown) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
      throw error;
    }
  };

  // Reset de senha
  const resetPassword = async (email: string) => {
    if (mockEnabled) {
      toast.success('Demo mode: password reset not required.');
      return;
    }

    if (!isFirebaseConfigured()) {
      toast.error('Firebase não configurado. Configure as variáveis de ambiente.');
      throw new Error('Firebase não configurado');
    }

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth não disponível');
      }
      
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de recuperação enviado!');
    } catch (error: unknown) {
      console.error('Erro ao enviar email de recuperação:', error);
      
      let errorMessage = 'Erro ao enviar email';
      
      const err = error as { code?: string; message?: string };

      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        default:
          errorMessage = err.message || 'Erro ao enviar email';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const normalizeRole = (role?: string) => {
    if (!role) return undefined;
    const lower = role.toLowerCase();
    if (lower === 'admin' || lower === 'administrador') return 'Administrador';
    if (lower === 'dono') return 'Dono';
    if (lower === 'financeiro') return 'Financeiro';
    if (lower === 'engenharia') return 'Engenharia';
    if (lower === 'producao') return 'Producao';
    if (lower === 'orcamentista') return 'Orcamentista';
    if (lower === 'vendedor') return 'Vendedor';
    return role;
  };

  const mergePermissions = (base: PermissionsMap, override?: PermissionsMap): PermissionsMap => {
    if (!override) return base;
    const merged: PermissionsMap = { ...base };
    Object.entries(override).forEach(([module, perms]) => {
      if (!perms) return;
      const key = module as keyof PermissionsMap;
      merged[key] = {
        ...(base[key] || { view: false, create: false, edit: false, delete: false }),
        ...perms,
      };
    });
    return merged;
  };

  const getEffectivePermissions = (): PermissionsMap | null => {
    if (!profile?.role) return null;
    const role = normalizeRole(profile.role) as keyof typeof defaultPermissionsByRole;
    const base = defaultPermissionsByRole[role];
    const custom = profile.permissoesCustomizadas;
    const hasCustom = !!custom && Object.keys(custom).length > 0;
    if (!base) return null;
    return hasCustom ? mergePermissions(base, custom) : base;
  };

  // Verificar permissão de acesso ao módulo (view)
  const hasPermission = (module: string) => {
    const permissions = getEffectivePermissions();
    if (!permissions) return false;
    return permissions[module as keyof PermissionsMap]?.view === true;
  };

  const value: AuthContextData = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    resetPassword,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
