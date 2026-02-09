/**
 * Hook para verificação granular de permissões (RBAC)
 */

import { useAuth } from '@/contexts/AuthContext';
import type { Module, Permission } from '@/domains/usuarios';
import { defaultPermissionsByRole, type PermissionsMap, useRolePermissions } from '@/domains/usuarios';

export function usePermissions() {
  const { profile } = useAuth();
  const { rolePermissions } = useRolePermissions();

  const normalizeRole = (role?: string) => {
    if (!role) return undefined;
    const lower = role.toLowerCase();
    const map: Record<string, keyof typeof defaultPermissionsByRole> = {
      admin: 'Administrador',
      administrador: 'Administrador',
      adminstrador: 'Administrador',
      dono: 'Dono',
      owner: 'Dono',
      financeiro: 'Financeiro',
      engenharia: 'Engenharia',
      engineering: 'Engenharia',
      producao: 'Producao',
      production: 'Producao',
      orcamentista: 'Orcamentista',
      vendedor: 'Vendedor',
      compras: 'Compras',
      gerencia: 'Gerencia',
      'gerência': 'Gerencia',
      manager: 'Gerencia',
    };
    if (map[lower]) return map[lower];
    const knownRoles = Object.keys(defaultPermissionsByRole) as Array<
      keyof typeof defaultPermissionsByRole
    >;
    if (knownRoles.includes(role as keyof typeof defaultPermissionsByRole)) {
      return role as keyof typeof defaultPermissionsByRole;
    }
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

  const getProfileForPermissions = () => {
    if (!profile) return null;
    return {
      ...profile,
      role: normalizeRole(profile.role),
      status: profile.ativo ? 'ativo' : 'inativo',
    } as any;
  };

  const getEffectivePermissions = (): PermissionsMap | null => {
    const userProfile = getProfileForPermissions();
    if (!userProfile?.role) return null;
    const role = userProfile.role as keyof typeof defaultPermissionsByRole;
    const base = rolePermissions?.[role] || defaultPermissionsByRole[role];
    const custom = userProfile.permissoesCustomizadas;
    const hasCustom = !!custom && Object.keys(custom).length > 0;
    return hasCustom ? mergePermissions(base, custom) : base;
  };

  /**
   * Verifica se usuário tem permissão específica em um módulo
   */
  const can = (module: Module, permission: Permission): boolean => {
    const permissions = getEffectivePermissions();
    if (!permissions) return false;
    return permissions[module]?.[permission] === true;
  };

  /**
   * Verifica se usuário tem acesso ao módulo (pelo menos view)
   */
  const canAccess = (module: Module): boolean => {
    const permissions = getEffectivePermissions();
    if (!permissions) return false;
    return permissions[module]?.view === true;
  };

  /**
   * Verifica se usuário é Admin
   */
  const isAdmin = (): boolean => {
    const role = normalizeRole(profile?.role);
    return role === 'Administrador' || role === 'Dono';
  };

  /**
   * Verifica se usuário tem uma das roles especificadas
   */
  const hasRole = (...roles: string[]): boolean => {
    const role = normalizeRole(profile?.role);
    if (!role) return false;
    return roles.includes(role);
  };

  return {
    can,
    canAccess,
    isAdmin,
    hasRole,
    user: profile,
  };
}
