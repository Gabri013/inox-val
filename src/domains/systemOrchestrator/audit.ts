import { AuditEvent, OrchestratorContext } from './types';

export class AuditService {
  private events: AuditEvent[] = [];

  createEvent(
    context: OrchestratorContext,
    eventType: string,
    before?: any,
    after?: any,
    details?: any
  ): AuditEvent {
    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      correlationId: context.quoteId,
      timestamp: new Date(),
      eventType,
      actor: context.user || 'system',
      before,
      after,
      details
    };

    this.events.push(event);
    this.persistEvent(event);
    return event;
  }

  private persistEvent(event: AuditEvent): void {
    console.log('Persisting audit event:', event);
  }

  getEvents(correlationId: string): AuditEvent[] {
    return this.events.filter(event => event.correlationId === correlationId);
  }

  getAllEvents(): AuditEvent[] {
    return this.events;
  }
}

export const auditService = new AuditService();
