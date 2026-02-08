/**
 * Página: Aprovação de Usuários (Admin)
 * Permite liberar usuários cadastrados (ativo=false)
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Users, ShieldCheck } from 'lucide-react';
import { getEmpresaContext } from '@/lib/firebase';
import { PageHeader } from '@/shared/components';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { usePermissions } from '@/app/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime } from '@/shared/lib/format';
import {
  usuariosApprovalService,
  type ApprovalHistory,
  type ApprovalStatus,
  type PendingUser,
} from '@/domains/usuarios/usuarios.approval.service';

export default function UsuariosApproval() {
  const navigate = useNavigate();
  const { isAdmin, can } = usePermissions();
  const { user, profile } = useAuth();
  const empresaInfo = getEmpresaContext();
  const empresaId = empresaInfo.empresaId || profile?.empresaId || user?.uid || null;
  const [usuarios, setUsuarios] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleUpdates, setRoleUpdates] = useState<Record<string, string>>({});
  const [statusFiltro, setStatusFiltro] = useState<ApprovalStatus>('pendente');
  const [historico, setHistorico] = useState<ApprovalHistory[]>([]);

  const canApprove = isAdmin() || can('usuarios', 'edit');

  useEffect(() => {
    if (!canApprove) {
      navigate('/');
      return;
    }

    setLoading(true);
    const unsub = usuariosApprovalService.subscribeUsuarios(
      empresaId,
      statusFiltro,
      (list) => {
        setUsuarios(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [canApprove, navigate, statusFiltro, empresaId]);

  useEffect(() => {
    const unsub = usuariosApprovalService.subscribeHistorico(empresaId, (list) => {
      setHistorico(list);
    });

    return () => unsub();
  }, [empresaId]);

  const pendingCount = useMemo(() => usuarios.length, [usuarios]);

  const normalizeRoleValue = (role?: string) => {
    if (!role) return 'Orcamentista';
    const lower = role.toLowerCase();
    if (lower === 'admin' || lower === 'administrador') return 'Administrador';
    if (lower === 'dono' || lower === 'owner') return 'Dono';
    if (lower === 'financeiro') return 'Financeiro';
    if (lower === 'engenharia' || lower === 'engineering') return 'Engenharia';
    if (lower === 'producao' || lower === 'produção' || lower === 'production') return 'Producao';
    if (lower === 'orcamentista') return 'Orcamentista';
    if (lower === 'vendedor') return 'Vendedor';
    if (lower === 'compras') return 'Compras';
    if (lower === 'gerencia' || lower === 'gerência' || lower === 'manager') return 'Gerencia';
    return role;
  };

  const handleApprove = async (id: string) => {
    const usuario = usuarios.find((u) => u.id === id);
    const selectedRole = normalizeRoleValue(roleUpdates[id] || usuario?.role);
    await usuariosApprovalService.approveUser(
      empresaId,
      id,
      selectedRole,
      { uid: user?.uid, email: user?.email },
      { nome: usuario?.nome, email: usuario?.email }
    );
  };

  const handleToggleActive = async (id: string, ativo: boolean) => {
    await usuariosApprovalService.setActive(empresaId, id, ativo, { uid: user?.uid, email: user?.email });
  };

  const handleRoleChange = (id: string, role: string) => {
    setRoleUpdates((prev) => ({ ...prev, [id]: role }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aprovação de Usuários"
        subtitle="Liberar acesso ao sistema"
        icon={ShieldCheck}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge className="bg-blue-100 text-blue-700">
          {pendingCount} pendente(s)
        </Badge>
        <Select value={statusFiltro} onValueChange={(value) => setStatusFiltro(value as any)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="aprovado">Aprovados</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Carregando usuários pendentes...</div>
      ) : usuarios.length === 0 ? (
        <div className="text-muted-foreground">Nenhum usuário encontrado.</div>
      ) : (
        <div className="space-y-4">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{usuario.nome || 'Usuário'}</div>
                  <div className="text-sm text-muted-foreground">{usuario.email}</div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <Select
                  value={normalizeRoleValue(roleUpdates[usuario.id] || usuario.role)}
                  onValueChange={(value) => handleRoleChange(usuario.id, value)}
                  disabled={statusFiltro !== 'pendente'}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecionar função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dono">Dono</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Producao">Produ??o</SelectItem>
                    <SelectItem value="Engenharia">Engenharia</SelectItem>
                    <SelectItem value="Orcamentista">Or?amentista</SelectItem>
                    <SelectItem value="Vendedor">Vendedor</SelectItem>
                    <SelectItem value="Compras">Compras</SelectItem>
                    <SelectItem value="Gerencia">Ger?ncia</SelectItem>
                  </SelectContent>
                </Select>

                {statusFiltro === 'pendente' ? (
                  <Button onClick={() => handleApprove(usuario.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                ) : usuario.ativo ? (
                  <Button variant="outline" onClick={() => handleToggleActive(usuario.id, false)}>
                    Desativar
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => handleToggleActive(usuario.id, true)}>
                    Ativar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-6 border-t space-y-3">
        <h3 className="text-lg font-semibold">Histórico de aprovação</h3>
        {historico.length === 0 ? (
          <div className="text-muted-foreground">Nenhum registro ainda.</div>
        ) : (
          <div className="space-y-2">
            {historico.map((item) => {
              const data = item.createdAt?.toDate?.() || item.createdAt;
              return (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 border rounded-lg bg-white">
                  <div>
                    <div className="font-medium">
                      {item.nome} — {item.role}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.email || '-'}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Aprovado por {item.approvedByEmail || '—'} em {formatDateTime(data)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
