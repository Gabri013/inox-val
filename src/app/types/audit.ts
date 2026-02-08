export type AuditActionType = 'create' | 'update' | 'delete' | 'view' | 'export' | 'import';

export type AuditModule =
  | 'clientes'
  | 'produtos'
  | 'estoque'
  | 'orcamentos'
  | 'ordens'
  | 'compras'
  | 'calculadora'
  | 'dashboard'
  | 'system';

export interface AuditLog {
  id: string;
  timestamp: Date | string;
  action: AuditActionType;
  module: AuditModule;
  description: string;
  recordId?: string;
  recordName?: string;
  userId: string;
  userName: string;
  userRole?: string;
  oldData?: unknown;
  newData?: unknown;
}

export type AuditLogInput = Omit<
  AuditLog,
  'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'
> & {
  timestamp?: Date | string;
};

export interface AuditLogFilter {
  action?: AuditActionType;
  module?: AuditModule;
  searchTerm?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  userId?: string;
  recordId?: string;
  recordName?: string;
  userName?: string;
}

export interface AuditContextType {
  logs: AuditLog[];
  addLog: (data: AuditLogInput) => AuditLog;
  getLogs: (filter?: AuditLogFilter) => AuditLog[];
  getLogsByRecord: (module: AuditModule, recordId: string) => AuditLog[];
  clearLogs: () => void;
}
