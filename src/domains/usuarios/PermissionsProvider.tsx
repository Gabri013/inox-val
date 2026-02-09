import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, doc, getDoc, onSnapshot, query, setDoc, serverTimestamp, where } from 'firebase/firestore';
import { getFirestore, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { PermissionsMap, UserRole } from './usuarios.types';
import { defaultPermissionsByRole } from './usuarios.types';
import { getEmpresaId } from '@/services/firestore/base';

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
  const mockEnabled = import.meta.env.VITE_USE_MOCK === 'true' && import.meta.env.DEV;

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

    let unsub: (() => void) | null = null;
    let canceled = false;

    const load = async () => {
      try {
        const empresaId = await getEmpresaId();
        if (canceled) return;

        setLoading(true);
        const db = getFirestore();
        const ref = query(collection(db, 'permissoes_roles'), where('empresaId', '==', empresaId));

        unsub = onSnapshot(
          ref,
          async (snap) => {
            const base = { ...defaultPermissionsByRole } as Record<UserRole, PermissionsMap>;

            snap.docs.forEach((docSnap) => {
              const data = docSnap.data() as { role?: UserRole; permissions?: PermissionsMap };
              const role = data?.role || (docSnap.id as UserRole);
              if (data?.permissions && role) {
                base[role] = mergePermissions(base[role], data.permissions);
              }
            });

            if (snap.empty) {
              const legacy = await Promise.all(
                Object.keys(base).map(async (role) => {
                  const legacySnap = await getDoc(doc(db, 'permissoes_roles', role));
                  if (!legacySnap.exists()) return null;
                  const legacyData = legacySnap.data() as { permissions?: PermissionsMap };
                  return legacyData?.permissions
                    ? { role: role as UserRole, permissions: legacyData.permissions }
                    : null;
                })
              );

              legacy.forEach((entry) => {
                if (entry) {
                  base[entry.role] = mergePermissions(base[entry.role], entry.permissions);
                }
              });
            }

            setRolePermissions(base);
            setLoading(false);
          },
          () => setLoading(false)
        );
      } catch {
        setRolePermissions(defaultPermissionsByRole);
        setLoading(false);
      }
    };

    void load();
    return () => {
      canceled = true;
      if (unsub) unsub();
    };
  }, [authLoading, isAuthenticated]);

  const saveRolePermissions = async (role: UserRole, permissions: PermissionsMap) => {
    if (mockEnabled || !isFirebaseConfigured()) {
      setRolePermissions((prev) => ({ ...prev, [role]: permissions }));
      return;
    }

    const empresaId = await getEmpresaId();
    const db = getFirestore();
    await setDoc(
      doc(db, 'permissoes_roles', `${empresaId}_${role}`),
      {
        role,
        empresaId,
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
