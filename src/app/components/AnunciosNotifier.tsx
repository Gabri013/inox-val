/**
 * Componente: AnunciosNotifier
 * Exibe notificações toast para novos anúncios
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAnunciosAtivos, useMarcarAnuncioLido } from '@/domains/anuncios';
import { AlertCircle, Info, AlertTriangle, Settings } from 'lucide-react';

const tipoIcons = {
  info: Info,
  alerta: AlertTriangle,
  urgente: AlertCircle,
  manutencao: Settings,
};

export function AnunciosNotifier() {
  const { data: anuncios = [] } = useAnunciosAtivos();
  const marcarLidoMutation = useMarcarAnuncioLido();
  const anunciosExibidosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!anuncios || anuncios.length === 0) return;

    anuncios.forEach((anuncio) => {
      // Não exibir novamente se já foi exibido nesta sessão
      if (anunciosExibidosRef.current.has(anuncio.id)) return;

      const Icon = tipoIcons[anuncio.tipo];

      // Marcar como exibido
      anunciosExibidosRef.current.add(anuncio.id);

      // Exibir notificação toast
      const toastId = toast(anuncio.titulo, {
        description: anuncio.mensagem,
        icon: <Icon className="w-5 h-5" />,
        duration: anuncio.tipo === 'urgente' ? Infinity : 10000,
        action: {
          label: 'Marcar como lido',
          onClick: () => {
            marcarLidoMutation.mutate(anuncio.id);
            toast.dismiss(toastId);
          },
        },
        onDismiss: () => {
          // Marcar como lido ao fechar
          if (!marcarLidoMutation.isPending) {
            marcarLidoMutation.mutate(anuncio.id);
          }
        },
        className: anuncio.tipo === 'urgente' ? 'border-red-500' : undefined,
      });
    });
  }, [anuncios, marcarLidoMutation]);

  // Componente não renderiza nada visualmente
  return null;
}
