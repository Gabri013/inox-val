/**
 * Página: Chat Interno
 * Sistema de mensagens em tempo real entre colaboradores
 */

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Search, MoreVertical, Plus, Paperclip, Image as ImageIcon } from 'lucide-react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  useConversas,
  useMensagens,
  useSendMensagem,
  useMarcarTodasLidas,
  useChatUsuarios,
  useCreateConversa,
  useDeleteConversa,
  useUpdateStatus,
} from '../chat.hooks';
import { useAuth } from '@/contexts/AuthContext';
import { statusColors, statusLabels } from '../chat.types';
import type { ConversaDetalhada } from '../chat.types';
import { formatTime } from '@/shared/lib/format';

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedConversa, setSelectedConversa] = useState<ConversaDetalhada | null>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [showNovaConversa, setShowNovaConversa] = useState(false);
  const [pendingConversaId, setPendingConversaId] = useState<string | null>(null);
  const [anexoFile, setAnexoFile] = useState<File | null>(null);
  const [anexoPreview, setAnexoPreview] = useState<string | null>(null);
  const [anexoError, setAnexoError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<Record<string, string>>({});
  const idleTimerRef = useRef<number | null>(null);
  const statusRef = useRef<'online' | 'ausente' | 'offline'>('online');

  const { data: conversas = [], isLoading: loadingConversas } = useConversas();
  const { data: mensagens = [], isLoading: loadingMensagens } = useMensagens({
    conversaId: selectedConversa?.id || '',
  });
  const { data: usuarios = [] } = useChatUsuarios({
    search: searchUsuarios,
  });

  const sendMutation = useSendMensagem();
  const marcarLidasMutation = useMarcarTodasLidas();
  const createConversaMutation = useCreateConversa();
  const deleteConversaMutation = useDeleteConversa();
  const updateStatusMutation = useUpdateStatus();

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Status automático (online/ausente/offline)
  useEffect(() => {
    const setStatus = (status: 'online' | 'ausente' | 'offline') => {
      if (statusRef.current === status) return;
      statusRef.current = status;
      updateStatusMutation.mutate({ status });
    };

    const markOnline = () => {
      setStatus('online');
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => setStatus('ausente'), 5 * 60 * 1000);
    };

    markOnline();

    const onVisibility = () => {
      if (document.hidden) {
        setStatus('ausente');
      } else {
        markOnline();
      }
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, markOnline));
    document.addEventListener('visibilitychange', onVisibility);

    const onBeforeUnload = () => {
      setStatus('offline');
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, markOnline));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Marcar mensagens como lidas ao abrir conversa
  useEffect(() => {
    if (selectedConversa && selectedConversa.mensagensNaoLidas > 0) {
      marcarLidasMutation.mutate(selectedConversa.id);
    }
  }, [selectedConversa?.id]);

  const handleSendMensagem = () => {
    if (!selectedConversa) return;
    if (!novaMensagem.trim() && !anexoFile) return;

    const send = async () => {
      let anexoUrl: string | undefined;
      let anexoNome: string | undefined;
      let tipo: 'text' | 'image' | 'file' = 'text';

      if (anexoFile) {
        anexoNome = anexoFile.name;
        tipo = anexoFile.type.startsWith('image/') ? 'image' : 'file';
        anexoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Erro ao ler anexo'));
          reader.readAsDataURL(anexoFile);
        });
      }

      sendMutation.mutate(
        {
          conversaId: selectedConversa.id,
          conteudo: novaMensagem.trim() || (anexoNome ? `Arquivo: ${anexoNome}` : ''),
          tipo,
          anexoUrl,
          anexoNome,
        },
        {
          onSuccess: () => {
            setNovaMensagem('');
            setAnexoFile(null);
            setAnexoPreview(null);
            setAnexoError(null);
          },
        }
      );
    };

    void send();
  };

  const handleIniciarConversa = (participanteId: string) => {
    createConversaMutation.mutate(
      { participanteId },
      {
        onSuccess: (conversa) => {
          if (!conversa) {
            return;
          }
          setShowNovaConversa(false);
          setPendingConversaId(conversa.id);
        },
      }
    );
  };

  const handleDeleteConversa = (conversaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conversa?')) {
      deleteConversaMutation.mutate(conversaId, {
        onSuccess: () => {
          if (selectedConversa?.id === conversaId) {
            setSelectedConversa(null);
          }
        },
      });
    }
  };

  const getParticipante = (conversa: ConversaDetalhada) => {
    return conversa.participantesDetalhes[0] || {
      id: 'unknown',
      nome: 'Participante',
      email: '',
      departamento: '',
      status: 'offline',
      ultimaAtividade: '',
    };
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const totalNaoLidas = conversas.reduce((acc, c) => acc + c.mensagensNaoLidas, 0);

  // Notificações de nova mensagem
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!pendingConversaId) return;
    const conversaDetalhada = conversas.find((c) => c.id === pendingConversaId);
    if (conversaDetalhada) {
      setSelectedConversa(conversaDetalhada as ConversaDetalhada);
      setPendingConversaId(null);
    }
  }, [conversas, pendingConversaId]);

  useEffect(() => {
    if (!user) return;
    conversas.forEach((conversa) => {
      const ultima = conversa.ultimaMensagem;
      if (!ultima) return;
      const lastId = lastMessageRef.current[conversa.id];
      if (lastId && lastId === ultima.id) return;
      lastMessageRef.current[conversa.id] = ultima.id;

      if (ultima.remetenteId === user.uid) return;
      if (selectedConversa?.id === conversa.id) return;

      if (Notification.permission === 'granted') {
        new Notification('Nova mensagem', {
          body: ultima.conteudo,
        });
      }
    });
  }, [conversas, selectedConversa?.id, user?.uid]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <PageHeader
        title="Chat Interno"
        subtitle="Comunicação em tempo real com a equipe"
        icon={MessageCircle}
        actions={
          <Dialog open={showNovaConversa} onOpenChange={setShowNovaConversa}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Conversa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Iniciar Nova Conversa</DialogTitle>
                <DialogDescription>
                  Selecione um colaborador para iniciar uma conversa.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar colaborador..."
                    value={searchUsuarios}
                    onChange={(e) => setSearchUsuarios(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {usuarios
                      .filter((u) => u.id !== user?.uid)
                      .map((usuario) => (
                        <button
                          key={usuario.id}
                          onClick={() => handleIniciarConversa(usuario.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getIniciais(usuario.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                                statusColors[usuario.status]
                              }`}
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{usuario.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {usuario.departamento}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {statusLabels[usuario.status]}
                          </Badge>
                        </button>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Lista de Conversas */}
        <div className="w-80 border rounded-lg flex flex-col bg-card">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              Conversas
              {totalNaoLidas > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {totalNaoLidas}
                </Badge>
              )}
            </h3>
          </div>
          <ScrollArea className="flex-1">
            {loadingConversas ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : conversas.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma conversa ainda
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em "Nova Conversa" para começar
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {conversas.map((conversa) => {
                  const conversaDetalhada = conversa as ConversaDetalhada;
                  const participante = getParticipante(conversaDetalhada);
                  const isSelected = selectedConversa?.id === conversa.id;

                  return (
                    <button
                      key={conversa.id}
                      onClick={() => setSelectedConversa(conversaDetalhada)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getIniciais(participante.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                            statusColors[participante.status]
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">
                            {participante.nome}
                          </span>
                          {conversa.ultimaMensagem && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatTime(conversa.ultimaMensagem.criadoEm)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversa.ultimaMensagem?.conteudo || 'Sem mensagens'}
                          </p>
                          {conversa.mensagensNaoLidas > 0 && (
                            <Badge
                              variant="destructive"
                              className="text-xs h-5 min-w-[20px] flex items-center justify-center"
                            >
                              {conversa.mensagensNaoLidas}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 border rounded-lg flex flex-col bg-card">
          {selectedConversa ? (
            <>
              {/* Header da Conversa */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getIniciais(getParticipante(selectedConversa).nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                        statusColors[getParticipante(selectedConversa).status]
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {getParticipante(selectedConversa).nome}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getParticipante(selectedConversa).departamento} •{' '}
                      {statusLabels[getParticipante(selectedConversa).status]}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDeleteConversa(selectedConversa.id)}
                      className="text-destructive"
                    >
                      Excluir Conversa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4">
                {loadingMensagens ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mensagens.map((mensagem) => {
                      const isMine = mensagem.remetenteId === user?.uid;
                      const isImage = mensagem.tipo === 'image' && mensagem.anexoUrl;
                      return (
                        <div
                          key={mensagem.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isMine
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {isImage ? (
                              <img
                                src={mensagem.anexoUrl}
                                alt={mensagem.anexoNome || 'Imagem'}
                                className="rounded-md max-h-64 mb-2"
                              />
                            ) : mensagem.anexoUrl ? (
                              <a
                                href={mensagem.anexoUrl}
                                download={mensagem.anexoNome || 'anexo'}
                                className="text-sm underline"
                              >
                                {mensagem.anexoNome || 'Anexo'}
                              </a>
                            ) : null}
                            {mensagem.conteudo && (
                              <p className="text-sm mt-1">{mensagem.conteudo}</p>
                            )}
                            <p
                              className={`text-xs mt-1 ${
                                isMine
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {formatTime(mensagem.criadoEm)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input de Mensagem */}
              <div className="p-4 border-t">
                {anexoPreview && (
                  <div className="mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <img src={anexoPreview} alt="Prévia" className="h-16 rounded-md" />
                    <Button variant="ghost" size="sm" onClick={() => { setAnexoFile(null); setAnexoPreview(null); }}>
                      Remover
                    </Button>
                  </div>
                )}
                {anexoError && (
                  <p className="text-xs text-destructive mb-2">{anexoError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('chat-anexo')?.click()}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <input
                    id="chat-anexo"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        setAnexoError('Anexo muito grande. Máximo 2MB.');
                        return;
                      }
                      setAnexoError(null);
                      setAnexoFile(file);
                      if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = () => setAnexoPreview(String(reader.result));
                        reader.readAsDataURL(file);
                      } else {
                        setAnexoPreview(null);
                      }
                    }}
                  />
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMensagem();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMensagem}
                    disabled={(!novaMensagem.trim() && !anexoFile) || sendMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Selecione uma conversa para começar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
