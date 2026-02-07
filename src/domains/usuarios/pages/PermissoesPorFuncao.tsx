import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Save } from 'lucide-react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { usePermissions } from '@/app/hooks/usePermissions';
import {
  defaultPermissionsByRole,
  moduleLabels,
  permissionLabels,
  useRolePermissions,
  type Module,
  type PermissionsMap,
  type UserRole,
} from '@/domains/usuarios';
import { toast } from 'sonner';

const roles: UserRole[] = [
  'Administrador',
  'Dono',
  'Compras',
  'Gerencia',
  'Financeiro',
  'Producao',
  'Engenharia',
  'Orcamentista',
  'Vendedor',
];

const modules = Object.keys(moduleLabels) as Module[];

export default function PermissoesPorFuncao() {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const { rolePermissions, loading, saveRolePermissions } = useRolePermissions();
  const [role, setRole] = useState<UserRole>('Administrador');
  const [permissions, setPermissions] = useState<PermissionsMap>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const base = rolePermissions?.[role] || defaultPermissionsByRole[role];
    setPermissions(JSON.parse(JSON.stringify(base)));
  }, [role, rolePermissions]);

  const handleToggle = (module: Module, permission: 'view' | 'create' | 'edit' | 'delete') => {
    setPermissions((prev) => {
      const next = { ...prev };
      const current = next[module] || { view: false, create: false, edit: false, delete: false };
      const updated = { ...current, [permission]: !current[permission] };

      if (permission !== 'view' && updated[permission]) {
        updated.view = true;
      }
      if (permission === 'view' && !updated.view) {
        updated.create = false;
        updated.edit = false;
        updated.delete = false;
      }

      next[module] = updated;
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveRolePermissions(role, permissions);
      toast.success('Permissões atualizadas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      toast.error('Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  const tableRows = useMemo(() => modules.map((module) => ({
    module,
    label: moduleLabels[module],
    perms: permissions[module] || { view: false, create: false, edit: false, delete: false },
  })), [permissions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissões por Função"
        subtitle="Edite as permissões de cada função pela interface"
        icon={ShieldCheck}
      />

      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Função</span>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saving || loading}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Permissões'}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 px-3">Módulo</th>
                {(['view', 'create', 'edit', 'delete'] as const).map((perm) => (
                  <th key={perm} className="py-3 px-3 text-center">
                    {permissionLabels[perm]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.module} className="border-b">
                  <td className="py-3 px-3 font-medium text-slate-800">{row.label}</td>
                  {(['view', 'create', 'edit', 'delete'] as const).map((perm) => (
                    <td key={perm} className="py-3 px-3 text-center">
                      <Switch
                        checked={row.perms[perm]}
                        onCheckedChange={() => handleToggle(row.module, perm)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
