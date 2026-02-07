import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { PermissionsMap, UserRole } from './usuarios.types';
import { defaultPermissionsByRole } from './usuarios.types';

interface PermissionsContextValue {
  rolePermissions: Record<UserRole, PermissionsMap>;
  loading: boolean;
  saveRolePermissions: (role: UserRole, permissions: PermissionsMap) => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, PermissionsMap>>(
    defaultPermissionsByRole
  );
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const mockEnabled = import.meta.env.VITE_USE_MOCK === 'true';

  useEffect(() => {
    if (mockEnabled || !isFirebaseConfigured()) {
      setRolePermissions(defaultPermissionsByRole);
      setLoading(false);
      return;
    }

    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setRolePermissions(defaultPermissionsByRole);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirestore();
    const ref = collection(db, 'permissoes_roles');

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const base = { ...defaultPermissionsByRole } as Record<UserRole, PermissionsMap>;
        snap.docs.forEach((docSnap) => {
          const role = docSnap.id as UserRole;
          const data = docSnap.data() as { permissions?: PermissionsMap };
          if (data?.permissions) {
            base[role] = data.permissions;
          }
        });
        setRolePermissions(base);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [authLoading, isAuthenticated]);

  const saveRolePermissions = async (role: UserRole, permissions: PermissionsMap) => {
    if (mockEnabled || !isFirebaseConfigured()) {
      setRolePermissions((prev) => ({ ...prev, [role]: permissions }));
      return;
    }

    const db = getFirestore();
    await setDoc(
      doc(db, 'permissoes_roles', role),
      {
        role,
        permissions,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const value = useMemo(
    () => ({ rolePermissions, loading, saveRolePermissions }),
    [rolePermissions, loading]
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function useRolePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('useRolePermissions deve ser usado dentro de PermissionsProvider');
  }
  return context;
}
