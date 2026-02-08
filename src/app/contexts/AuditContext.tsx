import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AuditLog, AuditContextType } from "../types/audit";
import { useAuth } from "@/contexts/AuthContext";

const AuditContext = createContext<AuditContextType | undefined>(undefined);

// Função para gerar ID único
const generateId = () => `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function AuditProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const auth = useAuth();

  // Adicionar novo log de auditoria
  const addLog = useCallback<AuditContextType["addLog"]>((logData) => {
    // Obter usuário do contexto de autenticação ou usar padrão
    const currentUser = auth?.user ? {
      userId: auth.user.uid,
      userName: auth.user.displayName || auth.user.email || "Usuário",
      userRole: "Usuário"
    } : {
      userId: "system",
      userName: "Sistema",
      userRole: "Sistema"
    };

    const newLog: AuditLog = {
      ...logData,
      id: generateId(),
      timestamp: logData.timestamp || new Date(),
      userId: currentUser.userId,
      userName: currentUser.userName,
      userRole: currentUser.userRole
    };

    setLogs((prevLogs) => [newLog, ...prevLogs]);

    // Em produção, aqui enviaria para o backend
    console.log("[AUDIT LOG]", newLog);
    return newLog;
  }, [auth?.user]);

  // Obter logs com filtro
  const getLogs = useCallback<AuditContextType["getLogs"]>((filter) => {
    if (!filter) return logs;

    const toDate = (value?: Date | string) => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      if (typeof value === "string") return new Date(value);
      return undefined;
    };

    const startDate = toDate(filter.startDate);
    const endDate = toDate(filter.endDate);

    return logs.filter((log) => {
      // Filtro por data
      const logDate = toDate(log.timestamp);
      if (startDate && logDate && logDate < startDate) return false;
      if (endDate && logDate && logDate > endDate) return false;

      // Filtro por usuário
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.userName && log.userName !== filter.userName) return false;

      // Filtro por registro
      if (filter.recordId && log.recordId !== filter.recordId) return false;
      if (filter.recordName && log.recordName !== filter.recordName) return false;

      // Filtro por ação
      if (filter.action && log.action !== filter.action) return false;

      // Filtro por módulo
      if (filter.module && log.module !== filter.module) return false;

      // Filtro por termo de busca
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        return (
          log.description.toLowerCase().includes(term) ||
          log.recordName?.toLowerCase().includes(term) ||
          log.userName.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [logs]);

  // Obter logs de um registro específico
  const getLogsByRecord = useCallback<AuditContextType["getLogsByRecord"]>((module, recordId) => {
    return logs.filter((log) => log.module === module && log.recordId === recordId);
  }, [logs]);

  // Limpar logs (apenas para desenvolvimento/testes)
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <AuditContext.Provider value={{ logs, addLog, getLogs, getLogsByRecord, clearLogs }}>
      {children}
    </AuditContext.Provider>
  );
}

// Hook customizado para usar auditoria
export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit deve ser usado dentro de um AuditProvider");
  }
  return context;
}

// Hook customizado para auditoria de um módulo específico
export function useModuleAudit(module: AuditLog["module"]) {
  const { addLog, getLogsByRecord } = useAudit();

  const logCreate = useCallback((recordId: string, recordName: string, data: any) => {
    addLog({
      action: "create",
      module,
      recordId,
      recordName,
      description: `Criou ${recordName}`,
      newData: data
    });
  }, [addLog, module]);

  const logUpdate = useCallback((recordId: string, recordName: string, oldData: any, newData: any) => {
    addLog({
      action: "update",
      module,
      recordId,
      recordName,
      description: `Atualizou ${recordName}`,
      oldData,
      newData
    });
  }, [addLog, module]);

  const logDelete = useCallback((recordId: string, recordName: string, data: any) => {
    addLog({
      action: "delete",
      module,
      recordId,
      recordName,
      description: `Excluiu ${recordName}`,
      oldData: data
    });
  }, [addLog, module]);

  const logView = useCallback((recordId: string, recordName: string) => {
    addLog({
      action: "view",
      module,
      recordId,
      recordName,
      description: `Visualizou ${recordName}`
    });
  }, [addLog, module]);

  return { logCreate, logUpdate, logDelete, logView, getLogsByRecord };
}
