// ============================================================
// AUDIT ENGINE TESTS
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  addAuditEvent,
  verifySnapshotIntegrity,
  rebuildFromSnapshot,
  generateAuditReport,
  formatAuditEvent,
  filterAuditEvents,
  getLastEvent,
  validateAuditSequence,
  exportAuditEventsToCSV
} from './index';
import { QuoteSnapshot, AuditEvent } from '../types';

describe('Audit Engine', () => {
  let snapshot: QuoteSnapshot;

  beforeEach(() => {
    snapshot = {
      id: 'quote-123',
      version: '1.0.0',
      createdAt: '2024-06-15T10:00:00.000Z',
      createdBy: 'user-1',
      companyId: 'company-1',
      customerId: 'customer-1',
      customerName: 'Cliente Teste',
      quoteNumber: 'ORC-202406-0001',
      validUntil: '2024-07-15T10:00:00.000Z',
      bom: {
        sheets: [{
          id: 'part-1',
          materialKey: 'CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X',
          quantity: 2,
          blank: { widthMm: 500, heightMm: 300 },
          allowRotate: true,
          grainDirection: null,
          features: [],
          bends: []
        }],
        tubes: [],
        accessories: [],
        processes: ['CORTE_LASER', 'MONTAGEM']
      },
      materialPrices: [{
        key: 'CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X',
        price: 25,
        currency: 'BRL',
        supplierId: 'FORN_X',
        validFrom: '2024-01-01',
        validTo: '2024-12-31'
      }],
      rulesetVersion: '1.0.0',
      nesting: {
        sheets: [{
          materialKey: 'CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X',
          quantity: 1,
          layout: [],
          utilization: 85,
          wasteKg: 2.5,
          wasteValue: 62.5
        }],
        totalUtilization: 85,
        totalWasteKg: 2.5,
        totalWasteValue: 62.5
      },
      costs: {
        materialUsed: 100,
        materialLost: 20,
        materialTotal: 120,
        processTotal: 50,
        overhead: 17,
        total: 187
      },
      pricing: {
        method: 'target-margin',
        margin: 25,
        discount: 0,
        finalPrice: 249.33
      },
      hash: 'valid-hash-will-be-recalculated',
      auditEvents: [{
        timestamp: '2024-06-15T10:00:00.000Z',
        action: 'QUOTE_CREATED',
        userId: 'user-1',
        details: { draftValid: true }
      }]
    };
  });

  describe('addAuditEvent', () => {
    it('should add audit event to snapshot', () => {
      const updated = addAuditEvent(snapshot, 'QUOTE_UPDATED', 'user-2', { field: 'pricing.margin' });

      expect(updated.auditEvents).toHaveLength(2);
      expect(updated.auditEvents[1].action).toBe('QUOTE_UPDATED');
      expect(updated.auditEvents[1].userId).toBe('user-2');
    });

    it('should preserve existing events', () => {
      const updated = addAuditEvent(snapshot, 'QUOTE_UPDATED', 'user-2', {});

      expect(updated.auditEvents[0]).toEqual(snapshot.auditEvents[0]);
    });

    it('should add timestamp automatically', () => {
      const beforeAdd = new Date().toISOString();
      const updated = addAuditEvent(snapshot, 'QUOTE_FINALIZED', 'user-1', {});

      const eventTimestamp = updated.auditEvents[1].timestamp;
      expect(new Date(eventTimestamp).toISOString()).toBeDefined();
      expect(eventTimestamp >= beforeAdd).toBe(true);
    });
  });

  describe('verifySnapshotIntegrity', () => {
    it('should return valid for correct snapshot', () => {
      // Recalculate hash for the test snapshot
      const content = JSON.stringify({
        bom: snapshot.bom,
        materialPrices: snapshot.materialPrices,
        rulesetVersion: snapshot.rulesetVersion,
        nesting: snapshot.nesting,
        costs: snapshot.costs,
        pricing: snapshot.pricing
      });
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      snapshot.hash = Math.abs(hash).toString(16).padStart(16, '0');

      const result = verifySnapshotIntegrity(snapshot);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing ID', () => {
      const invalidSnapshot = { ...snapshot, id: '' };
      const result = verifySnapshotIntegrity(invalidSnapshot);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ID ausente');
    });

    it('should detect missing companyId', () => {
      const invalidSnapshot = { ...snapshot, companyId: '' };
      const result = verifySnapshotIntegrity(invalidSnapshot);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('ID da empresa ausente');
    });

    it('should detect missing BOM', () => {
      const invalidSnapshot = { ...snapshot, bom: null as unknown as QuoteSnapshot['bom'] };
      const result = verifySnapshotIntegrity(invalidSnapshot);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BOM ausente');
    });

    it('should detect empty material prices', () => {
      const invalidSnapshot = { ...snapshot, materialPrices: [] };
      const result = verifySnapshotIntegrity(invalidSnapshot);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nenhum preço de material registrado');
    });

    it('should detect hash mismatch', () => {
      const invalidSnapshot = { ...snapshot, hash: 'invalid-hash' };
      const result = verifySnapshotIntegrity(invalidSnapshot);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Hash do snapshot não confere');
    });
  });

  describe('rebuildFromSnapshot', () => {
    it('should rebuild costs from snapshot', () => {
      const materials = new Map();
      materials.set('CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X', {
        key: 'CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X',
        pricePerKg: 25
      });

      const processes = new Map();
      processes.set('CORTE_LASER', {
        key: 'CORTE_LASER',
        costPerHour: 180
      });
      processes.set('MONTAGEM', {
        key: 'MONTAGEM',
        costPerHour: 80
      });

      const result = rebuildFromSnapshot(snapshot, materials, processes);

      expect(result.success).toBeDefined();
      expect(result.originalCosts).toEqual({
        material: snapshot.costs.materialTotal,
        process: snapshot.costs.processTotal,
        total: snapshot.costs.total
      });
    });

    it('should detect cost differences', () => {
      const materials = new Map();
      materials.set('CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X', {
        key: 'CHAPA#SS304#1.2#POLIDO#3000x1250#FORN_X',
        pricePerKg: 50 // Different price
      });

      const processes = new Map();
      processes.set('CORTE_LASER', {
        key: 'CORTE_LASER',
        costPerHour: 200 // Different cost
      });

      const result = rebuildFromSnapshot(snapshot, materials, processes);

      expect(result.differences.length).toBeGreaterThan(0);
    });
  });

  describe('generateAuditReport', () => {
    it('should generate complete audit report', () => {
      const report = generateAuditReport(snapshot);

      expect(report.summary.quoteId).toBe('quote-123');
      expect(report.summary.createdBy).toBe('user-1');
      expect(report.summary.status).toBe('FINALIZED');
      expect(report.summary.totalValue).toBe(249.33);
    });

    it('should include timeline of events', () => {
      const updatedSnapshot = addAuditEvent(snapshot, 'QUOTE_UPDATED', 'user-2', { field: 'margin' });
      const report = generateAuditReport(updatedSnapshot);

      expect(report.timeline).toHaveLength(2);
      expect(report.timeline[0].action).toBe('QUOTE_CREATED');
      expect(report.timeline[1].action).toBe('QUOTE_UPDATED');
    });

    it('should include integrity check', () => {
      const report = generateAuditReport(snapshot);

      expect(report.integrity).toBeDefined();
      expect(report.integrity.valid).toBeDefined();
      expect(Array.isArray(report.integrity.errors)).toBe(true);
    });

    it('should show DRAFT status for zero price', () => {
      const draftSnapshot = { ...snapshot, pricing: { ...snapshot.pricing, finalPrice: 0 } };
      const report = generateAuditReport(draftSnapshot);

      expect(report.summary.status).toBe('DRAFT');
    });
  });

  describe('formatAuditEvent', () => {
    it('should format event for display', () => {
      const event: AuditEvent = {
        timestamp: '2024-06-15T10:00:00.000Z',
        action: 'QUOTE_CREATED',
        userId: 'user-1',
        details: { draftValid: true }
      };

      const formatted = formatAuditEvent(event);

      expect(formatted).toContain('QUOTE_CREATED');
      expect(formatted).toContain('user-1');
      expect(formatted).toContain('draftValid');
    });
  });

  describe('filterAuditEvents', () => {
    it('should filter events by action', () => {
      const events: AuditEvent[] = [
        { timestamp: '2024-06-15T10:00:00.000Z', action: 'QUOTE_CREATED', userId: 'user-1', details: {} },
        { timestamp: '2024-06-15T11:00:00.000Z', action: 'QUOTE_UPDATED', userId: 'user-2', details: {} },
        { timestamp: '2024-06-15T12:00:00.000Z', action: 'QUOTE_UPDATED', userId: 'user-1', details: {} }
      ];

      const filtered = filterAuditEvents(events, 'QUOTE_UPDATED');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.action === 'QUOTE_UPDATED')).toBe(true);
    });

    it('should return empty array when no match', () => {
      const events: AuditEvent[] = [
        { timestamp: '2024-06-15T10:00:00.000Z', action: 'QUOTE_CREATED', userId: 'user-1', details: {} }
      ];

      const filtered = filterAuditEvents(events, 'QUOTE_DELETED');

      expect(filtered).toHaveLength(0);
    });
  });

  describe('getLastEvent', () => {
    it('should return last event of specified action', () => {
      const events: AuditEvent[] = [
        { timestamp: '2024-06-15T10:00:00.000Z', action: 'QUOTE_CREATED', userId: 'user-1', details: {} },
        { timestamp: '2024-06-15T11:00:00.000Z', action: 'QUOTE_UPDATED', userId: 'user-2', details: {} },
        { timestamp: '2024-06-15T12:00:00.000Z', action: 'QUOTE_UPDATED', userId: 'user-3', details: {} }
      ];

      const lastUpdate = getLastEvent(events, 'QUOTE_UPDATED');

      expect(lastUpdate).toBeDefined();
      expect(lastUpdate!.userId).toBe('user-3');
    });

    it('should return undefined when no matching event', () => {
      const events: AuditEvent[] = [
        { timestamp: '2024-06-15T10:00:00.000Z', action: 'QUOTE_CREATED', userId: 'user-1', details: {} }
      ];

      const lastDelete = getLastEvent(events, 'QUOTE_DELETED');

      expect(lastDelete).toBeUndefined();
    });
  });

  describe('validateAuditSequence', () => {
    it('should validate correct sequence', () => {
      const events: AuditEvent[] = [
        { timestamp: '2024-06-15T10:00:00.000Z', action: 'QUOTE_CREATED', userId: 'user-1', details: {} },
        { timestamp: '2024-06-15T11:00:00.000Z', action: 'QUOTE_UPDATED', userId: 'user-2', details: {} },
        { timestamp: '2024-06-15T12:00:00.000Z', action: 'QUOTE_FINALIZED', userId: 'user-1', details: {} }
      ];

      const result = validateAuditSequence(events);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing creation event', () => {
      const events: AuditEvent[] = [
        { timestamp: '2024-06-15T11:00:00.000Z', action: 'QUOTE_UPDATED', userId: 'user-2', details: {} }
      ];

      const result = validateAuditSequence(events);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Snapshot sem evento de criação');
    });

    it('should detect out-of-order events', () => {
      const events: AuditEvent[] = [
        { timestamp: '2024-06-15T10:00:00.000Z', action: 'QUOTE_CREATED', userId: 'user-1', details: {} },
        { timestamp: '2024-06-15T09:00:00.000Z', action: 'QUOTE_UPDATED', userId: 'user-2', details: {} } // Earlier timestamp
      ];

      const result = validateAuditSequence(events);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('fora de ordem'))).toBe(true);
    });
  });

  describe('exportAuditEventsToCSV', () => {
    it('should export events to CSV format', () => {
      const events: AuditEvent[] = [
        { timestamp: '2024-06-15T10:00:00.000Z', action: 'QUOTE_CREATED', userId: 'user-1', details: { draftValid: true } }
      ];

      const csv = exportAuditEventsToCSV(events);

      expect(csv).toContain('timestamp,action,userId,details');
      expect(csv).toContain('QUOTE_CREATED');
      expect(csv).toContain('user-1');
    });

    it('should handle multiple events', () => {
      const events: AuditEvent[] = [
        { timestamp: '2024-06-15T10:00:00.000Z', action: 'QUOTE_CREATED', userId: 'user-1', details: {} },
        { timestamp: '2024-06-15T11:00:00.000Z', action: 'QUOTE_UPDATED', userId: 'user-2', details: {} }
      ];

      const csv = exportAuditEventsToCSV(events);
      const lines = csv.split('\n');

      expect(lines).toHaveLength(3); // header + 2 events
    });
  });
});