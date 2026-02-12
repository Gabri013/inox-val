import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { AuditLog, AuditContextType } from "../types/audit";
import { useAuth } from "@/contexts/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getFirestore } from "@/lib/firebase";
import { COLLECTIONS } from "@/types/firebase";
import { getCurrentUserId, getEmpresaId, getCurrentUserProfile } from "@/services/firestore/base";

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const db = getFirestore();

// Função para gerar ID único
const generateId = () => `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const collectionToModule: Record<string, AuditLog["module"]> = {
  [COLLECTIONS.clientes]: "clientes",
  [COLLECTIONS.produtos]: "produtos",
  [COLLECTIONS.estoque_itens]: "estoque",
  [COLLECTIONS.estoque_movimentos]: "estoque",
  [COLLECTIONS.estoque_materiais]: "estoque",
  [COLLECTIONS.movimentacoes_estoque]: "estoque",
  [COLLECTIONS.orcamentos]: "orcamentos",
  [COLLECTIONS.ordens_producao]: "ordens",
  [COLLECTIONS.compras]: "compras",
  [COLLECTIONS.solicitacoes_compra]: "compras",
  [COLLECTIONS.calculos]: "calculadora",
  [COLLECTIONS.calculadora_historico]: "calculadora",
  [COLLECTIONS.pricing_runs]: "calculadora",
};

const moduleToCollection: Record<AuditLog["module"], string> = {
  clientes: COLLECTIONS.clientes,
  produtos: COLLECTIONS.produtos,
  estoque: COLLECTIONS.estoque_itens,
  orcamentos: COLLECTIONS.orcamentos,
  ordens: COLLECTIONS.ordens_producao,
  compras: COLLECTIONS.compras,
  calculadora: COLLECTIONS.calculos,
  dashboard: COLLECTIONS.logs,
  system: COLLECTIONS.logs,
};

const actionLabels: Record<AuditLog["action"], string> = {
  create: "Criou",
  update: "Atualizou",
  delete: "Excluiu",
  view: "Visualizou",
  export: "Exportou",
  import: "Importou",
};

const moduleLabels: Record<AuditLog["module"], string> = {
  clientes: "cliente",
  produtos: "produto",
  estoque: "estoque",
  orcamentos: "orçamento",
  ordens: "ordem",
  compras: "compra",
  calculadora: "cálculo",
  dashboard: "dashboard",
  system: "sistema",
};

function normalizeTimestamp(value: any): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }
  if (typeof value === "object" && typeof value.toDate === "function") {
    const parsed = value.toDate();
    return parsed instanceof Date ? parsed : new Date(0);
  }
  return new Date(0);
}

function resolveRecordName(data?: Record<string, any> | null) {
  if (!data) return undefined;
  return (
    data.nome ||
    data.titulo ||
    data.descricao ||
    data.numero ||
    data.codigo ||
    data.name ||
    data.id
  );
}

export function AuditProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const auth = useAuth();
  const userCache = useRef<Record<string, { name: string; role?: string }>>({});

  useEffect(() => {
    if (!auth?.user) {
      setLogs([]);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let canceled = false;

    const setup = async () => {
      try {
        const empresaId = await getEmpresaId();
        if (canceled) return;

        const ref = query(
          collection(db, COLLECTIONS.audit_logs),
          where("empresaId", "==", empresaId)
        );

        unsubscribe = onSnapshot(ref, (snap) => {
          void (async () => {
            try {
              const rawLogs: Array<Record<string, any>> = snap.docs.map((docSnap) => ({
                id: docSnap.id,
                ...(docSnap.data() as Record<string, any>),
              }));

              const missingUsers = Array.from(
                new Set(
                  rawLogs
                    .map((log) => log.userId)
                    .filter((userId) => userId && !userCache.current[userId])
                )
              );

              await Promise.all(
                missingUsers.map(async (userId) => {
                  try {
                    const primary = doc(db, COLLECTIONS.users, userId);
                    const primarySnap = await getDoc(primary);
                    if (primarySnap.exists()) {
                      const data = primarySnap.data() as Record<string, any>;
                      userCache.current[userId] = {
                        name: data.nome || data.name || data.displayName || data.email || "Usuário",
                        role: data.role,
                      };
                      return;
                    }
                    const legacy = doc(db, COLLECTIONS.usuarios, userId);
                    const legacySnap = await getDoc(legacy);
                    if (legacySnap.exists()) {
                      const data = legacySnap.data() as Record<string, any>;
                      userCache.current[userId] = {
                        name: data.nome || data.name || data.displayName || data.email || "Usuário",
                        role: data.role,
                      };
                    }
                  } catch (error) {
                    console.error("Erro ao carregar usuário da auditoria", error);
                  }
                })
              );

              if (canceled) return;

              const normalized = rawLogs.map((log) => {
                const action = (["create", "update", "delete", "view", "export", "import"] as const).includes(
                  log.action
                )
                  ? (log.action as AuditLog["action"])
                  : "update";
                const module =
                  (log.module as AuditLog["module"]) ||
                  collectionToModule[log.collection] ||
                  "system";
                const recordName = log.recordName || resolveRecordName(log.after || log.before);
                const description =
                  log.description ||
                  `${actionLabels[action]} ${recordName || moduleLabels[module] || "registro"}`;
                const userInfo = log.userId ? userCache.current[log.userId] : undefined;
                return {
                  id: log.id,
                  timestamp: normalizeTimestamp(log.timestamp),
                  action,
                  module,
                  description,
                  recordId: log.documentId || log.recordId,
                  recordName,
                  userId: log.userId || "system",
                  userName: log.userName || userInfo?.name || "Sistema",
                  userRole: log.userRole || userInfo?.role,
                  oldData: log.before || log.oldData,
                  newData: log.after || log.newData,
                } as AuditLog;
              });

              normalized.sort((a, b) => normalizeTimestamp(b.timestamp).getTime() - normalizeTimestamp(a.timestamp).getTime());
              setLogs(normalized);
            } catch (error) {
              console.error("Erro ao processar logs de auditoria", error);
            }
          })();
        });
      } catch (error) {
        console.error("Erro ao carregar logs de auditoria", error);
      }
    };

    void setup();

    return () => {
      canceled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [auth?.user]);

  // Adicionar novo log de auditoria
  const addLog = useCallback<AuditContextType["addLog"]>((logData) => {
    // Obter usuário do contexto de autenticação ou usar padrão
    const currentUser = auth?.user
      ? {
          userId: auth.user.uid,
          userName: auth.user.displayName || auth.user.email || "Usuário",
          userRole: "Usuário",
        }
      : {
          userId: "system",
          userName: "Sistema",
          userRole: "Sistema",
        };

    const newLog: AuditLog = {
      ...logData,
      id: generateId(),
      timestamp: logData.timestamp || new Date(),
      userId: currentUser.userId,
      userName: currentUser.userName,
      userRole: currentUser.userRole,
    };

    setLogs((prevLogs) => [newLog, ...prevLogs]);

    if (!auth?.user) {
      return newLog;
    }

    void (async () => {
      try {
        const empresaId = await getEmpresaId();
        const userId = await getCurrentUserId();
        const profile = await getCurrentUserProfile();
        const userName =
          profile?.nome ||
          profile?.name ||
          profile?.displayName ||
          auth?.user?.displayName ||
          auth?.user?.email ||
          "Usuário";
        const userRole = profile?.role || newLog.userRole;

        await addDoc(collection(db, COLLECTIONS.audit_logs), {
          action: logData.action,
          collection: moduleToCollection[logData.module] || COLLECTIONS.logs,
          documentId: logData.recordId || newLog.id,
          before: logData.oldData || null,
          after: logData.newData || null,
          empresaId,
          userId,
          description: logData.description,
          recordName: logData.recordName || null,
          module: logData.module,
          userName,
          userRole,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Erro ao registrar auditoria", error);
      }
    })();

    return newLog;
  }, [auth?.user]);

  // Obter logs com filtro
  const getLogs = useCallback<AuditContextType["getLogs"]>((filter) => {
    if (!filter) return logs;

    const toDate = (value?: Date | string) => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      if (typeof value === "string") return new Date(value);
      if (
        typeof value === "object" &&
        value !== null &&
        "toDate" in value &&
        typeof (value as { toDate?: unknown }).toDate === "function"
      ) {
        return (value as { toDate: () => Date }).toDate();
      }
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
          log.description?.toLowerCase().includes(term) ||
          log.recordName?.toLowerCase().includes(term) ||
          log.userName?.toLowerCase().includes(term)
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
      newData: data,
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
      newData,
    });
  }, [addLog, module]);

  const logDelete = useCallback((recordId: string, recordName: string, data: any) => {
    addLog({
      action: "delete",
      module,
      recordId,
      recordName,
      description: `Excluiu ${recordName}`,
      oldData: data,
    });
  }, [addLog, module]);

  const logView = useCallback((recordId: string, recordName: string) => {
    addLog({
      action: "view",
      module,
      recordId,
      recordName,
      description: `Visualizou ${recordName}`,
    });
  }, [addLog, module]);

  return { logCreate, logUpdate, logDelete, logView, getLogsByRecord };
}
