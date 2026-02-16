// Auditoria de precificação: registra todas alterações e decisões de preço
export interface AuditoriaPrecificacao {
  produtoId: string;
  usuario: string;
  data: string;
  acao: 'atualizacao' | 'aprovacao' | 'rejeicao' | 'sugestao' | 'benchmark';
  valorAnterior?: number;
  valorNovo?: number;
  motivo?: string;
  detalhes?: any;
}

const auditoriaLog: AuditoriaPrecificacao[] = [];

export function registrarAuditoria(entry: AuditoriaPrecificacao) {
  auditoriaLog.push({ ...entry, data: new Date().toISOString() });
}

export function consultarAuditoria({ produtoId }: { produtoId: string }) {
  return auditoriaLog.filter((a) => a.produtoId === produtoId);
}

// Exemplo de uso:
// registrarAuditoria({ produtoId: 'A', usuario: 'admin', acao: 'atualizacao', valorAnterior: 100, valorNovo: 120, motivo: 'Atualização de custo' });
// consultarAuditoria({ produtoId: 'A' });
