export enum WorkflowState {
  DRAFT = "DRAFT",
  CALCULATED = "CALCULATED",
  VALIDATED = "VALIDATED",
  CORPORATE_OK = "CORPORATE_OK",
  APPROVED = "APPROVED",
  FINALIZED = "FINALIZED",
  DELIVERED = "DELIVERED",
  IN_PRODUCTION = "IN_PRODUCTION",
  CLOSED = "CLOSED"
}

export interface TransitionGuard {
  name: string;
  description: string;
  check: (context: OrchestratorContext) => Promise<GuardResult>;
  severity: "block" | "warning" | "info";
}

export interface GuardResult {
  passed: boolean;
  message?: string;
  details?: any;
}

export interface AuditEvent {
  id: string;
  correlationId: string;
  timestamp: Date;
  eventType: string;
  actor: string;
  before?: any;
  after?: any;
  details?: any;
}

export interface OrchestratorContext {
  quoteId: string;
  snapshot?: any;
  state: WorkflowState;
  user?: string;
  [key: string]: any;
}

export interface TransitionResult {
  success: boolean;
  newState?: WorkflowState;
  guards: GuardResult[];
  events: AuditEvent[];
  error?: string;
}

export interface HealthCheckResult {
  healthy: boolean;
  checks: HealthCheckItem[];
  timestamp: Date;
}

export interface HealthCheckItem {
  name: string;
  passed: boolean;
  message?: string;
  details?: any;
}

export interface Snapshot {
  id: string;
  content: any;
  sha256: string;
  hmac?: string;
  timestamp: Date;
}
