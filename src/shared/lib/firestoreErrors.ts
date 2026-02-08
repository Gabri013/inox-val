export type FirestoreErrorView = {
  title: string;
  description: string;
};

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  if (!('code' in error)) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido';
}

export function toFirestoreErrorView(error: unknown): FirestoreErrorView {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  if (code === 'permission-denied' || /permission[- ]denied/i.test(message)) {
    return {
      title: 'Acesso negado',
      description:
        'Você não tem permissão para acessar estes dados. Se isso estiver incorreto, peça ao administrador para revisar suas permissões.',
    };
  }

  if (/empresa/i.test(message) || /empresaId/i.test(message)) {
    return {
      title: 'Empresa não definida',
      description:
        'Não foi possível identificar sua empresa (empresaId). Verifique se seu usuário está liberado e vinculado a uma empresa.',
    };
  }

  return {
    title: 'Erro ao carregar dados',
    description: message,
  };
}

