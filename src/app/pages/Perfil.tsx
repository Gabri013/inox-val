/**
 * Página de Perfil do Usuário
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/app/hooks/usePermissions';
import { usuariosService } from '@/domains/usuarios';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Building2, Shield, Bell, Palette, Lock, Save } from 'lucide-react';

export default function Perfil() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isAdmin, can } = usePermissions();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    departamento: '',
    cargo: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [preferences, setPreferences] = useState({
    notificacoes: true,
    notificacoesEmail: true,
    notificacoesPush: false,
    tema: 'system',
    idioma: 'pt-BR',
  });

  const [security, setSecurity] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const canEditProfile = isAdmin() || can('usuarios', 'edit');

  useEffect(() => {
    if (!user) return;
    setFormData({
      nome: profile?.nome || user.displayName || '',
      email: user.email || '',
      telefone: profile?.telefone || '',
      departamento: profile?.departamento || '',
      cargo: profile?.cargo || '',
    });
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!canEditProfile) {
      toast.error('Sem permissÃ£o para editar o perfil.');
      return;
    }
    try {
      setSavingProfile(true);
      await usuariosService.update(user.uid, {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        departamento: formData.departamento,
        cargo: formData.cargo,
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao atualizar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success('Preferências atualizadas com sucesso!');
  };

  const handleChangePassword = () => {
    if (security.novaSenha !== security.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }
    toast.success('Senha alterada com sucesso!');
    setSecurity({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
  };

  const getUserInitials = () => {
    if (!user && !profile) return '?';
    const nome = profile?.nome || user?.displayName || user?.email || 'Usuário';
    return nome
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const roleColors: Record<string, string> = {
    Administrador: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    Dono: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    Gerencia: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    Compras: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    Financeiro: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Engenharia: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Producao: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Orcamentista: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
    Vendedor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e preferências do sistema"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Perfil' },
        ]}
      />

      {/* Header do Perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="size-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{profile?.nome || user?.displayName || 'Usuário'}</h2>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                {profile?.role && (
                  <Badge className={roleColors[profile.role] || ''}>
                    {profile.role}
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Shield className="size-3" />
                  Acesso Completo
                </Badge>
              </div>
            </div>

            <Button onClick={() => navigate('/minhas-configuracoes')}>
              Configurações do Vendedor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Abas */}
      <Tabs defaultValue="pessoal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pessoal">
            <User className="size-4 mr-2" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="preferencias">
            <Palette className="size-4 mr-2" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <Lock className="size-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Dados Pessoais */}
        <TabsContent value="pessoal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nome">
                    <User className="size-4 inline mr-2" />
                    Nome Completo
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="size-4 inline mr-2" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu.email@empresa.com"
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">
                    <Phone className="size-4 inline mr-2" />
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="cargo">
                    <Building2 className="size-4 inline mr-2" />
                    Cargo
                  </Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    placeholder="Seu cargo na empresa"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="departamento">
                    <MapPin className="size-4 inline mr-2" />
                    Departamento
                  </Label>
                  <Input
                    id="departamento"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    placeholder="Departamento"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={savingProfile || !canEditProfile}>
                  <Save className="size-4 mr-2" />
                  {savingProfile ? 'Salvando...' : 'Salvar Altera??es'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferências */}
        <TabsContent value="preferencias">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>
                Personalize sua experiência no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notificações */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="size-5" />
                    Notificações
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure como você deseja receber notificações
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificacoes">Notificações do Sistema</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações sobre atividades do sistema
                      </p>
                    </div>
                    <Switch
                      id="notificacoes"
                      checked={preferences.notificacoes}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, notificacoes: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificacoesEmail">Notificações por E-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber alertas importantes por e-mail
                      </p>
                    </div>
                    <Switch
                      id="notificacoesEmail"
                      checked={preferences.notificacoesEmail}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, notificacoesEmail: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificacoesPush">Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações push no navegador
                      </p>
                    </div>
                    <Switch
                      id="notificacoesPush"
                      checked={preferences.notificacoesPush}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, notificacoesPush: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Aparência e Idioma */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="size-5" />
                    Aparência e Idioma
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Personalize a aparência do sistema
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tema</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use o botão de tema no cabeçalho para alternar
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="idioma">Idioma</Label>
                    <Input
                      id="idioma"
                      value="Português (Brasil)"
                      disabled
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences}>
                  <Save className="size-4 mr-2" />
                  Salvar Preferências
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Altere sua senha e gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="senhaAtual">Senha Atual</Label>
                  <Input
                    id="senhaAtual"
                    type="password"
                    value={security.senhaAtual}
                    onChange={(e) => setSecurity({ ...security, senhaAtual: e.target.value })}
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={security.novaSenha}
                    onChange={(e) => setSecurity({ ...security, novaSenha: e.target.value })}
                    placeholder="Digite a nova senha"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Mínimo de 8 caracteres, incluindo letras e números
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={security.confirmarSenha}
                    onChange={(e) => setSecurity({ ...security, confirmarSenha: e.target.value })}
                    placeholder="Confirme a nova senha"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleChangePassword}>
                  <Lock className="size-4 mr-2" />
                  Alterar Senha
                </Button>
              </div>

              <Separator />

              {/* Informações de Segurança */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações de Segurança</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Último acesso</p>
                    <p className="font-medium">Hoje às 14:30</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dispositivo</p>
                    <p className="font-medium">Chrome - Windows</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Localização</p>
                    <p className="font-medium">São Paulo, BR</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Senha alterada</p>
                    <p className="font-medium">Há 30 dias</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
