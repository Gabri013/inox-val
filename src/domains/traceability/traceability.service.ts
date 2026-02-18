import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { TraceabilityConfig, TraceabilityResult, VersionedItem, ChangelogEntry } from './types';

export class TraceabilityService {
  private config: TraceabilityConfig;

  constructor(config: TraceabilityConfig) {
    this.config = config;
  }

  validateQuote(versionedItems: VersionedItem[], changelog: ChangelogEntry[]): TraceabilityResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check all required items are versioned
    const allItemsVersioned = this.checkAllItemsVersioned(versionedItems);
    if (!allItemsVersioned) {
      errors.push('Not all required items are properly versioned');
    }

    // Check changelog completeness
    const hasCompleteChangelog = this.checkChangelogCompleteness(changelog);
    if (!hasCompleteChangelog) {
      errors.push('Changelog entries missing or incomplete');
    }

    // Check each item has valid version format
    versionedItems.forEach(item => {
      if (!this.isValidVersion(item.version)) {
        errors.push(`Invalid version format for ${item.type} ${item.name}: ${item.version}`);
      }
    });

    // Check changelog entries have valid data
    changelog.forEach(entry => {
      if (!entry.userId) {
        errors.push(`Changelog entry missing user ID for item ${entry.itemId}`);
      }
      if (!entry.timestamp) {
        errors.push(`Changelog entry missing timestamp for item ${entry.itemId}`);
      }
      if (!entry.changeReason) {
        warnings.push(`Changelog entry missing change reason for item ${entry.itemId}`);
      }
    });

    const result: TraceabilityResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      versionedItems,
      changelog,
      allItemsVersioned,
      hasCompleteChangelog
    };

    return result;
  }

  generateISOTraceReport(
    quoteId: string,
    result: TraceabilityResult
  ): string {
    const report: string[] = [];
    report.push('# ISO Traceability Report');
    report.push(`## Quote ID: ${quoteId}`);
    report.push(`## Generated: ${new Date().toISOString()}`);
    report.push('');
    report.push('## Status');
    report.push(`- **Validation Result**: ${result.isValid ? 'PASS' : 'FAIL'}`);
    report.push(`- **All Items Versioned**: ${result.allItemsVersioned ? 'Yes' : 'No'}`);
    report.push(`- **Complete Changelog**: ${result.hasCompleteChangelog ? 'Yes' : 'No'}`);
    report.push('');
    report.push('## Versioned Items');
    report.push('| Type | Name | ID | Version |');
    report.push('|------|------|----|---------|');
    result.versionedItems.forEach(item => {
      report.push(`| ${item.type} | ${item.name} | ${item.id} | ${item.version} |`);
    });
    report.push('');
    report.push('## Changelog');
    report.push('| Item Type | Item ID | Version Before | Version After | User ID | Timestamp | Reason | Details |');
    report.push('|-----------|---------|----------------|---------------|---------|-----------|--------|---------|');
    result.changelog.forEach(entry => {
      report.push(`| ${entry.itemType} | ${entry.itemId} | ${entry.versionBefore} | ${entry.versionAfter} | ${entry.userId} | ${entry.timestamp} | ${entry.changeReason} | ${entry.details} |`);
    });
    report.push('');

    if (result.errors.length > 0) {
      report.push('## Errors');
      result.errors.forEach(error => {
        report.push(`- ${error}`);
      });
      report.push('');
    }

    if (result.warnings.length > 0) {
      report.push('## Warnings');
      result.warnings.forEach(warning => {
        report.push(`- ${warning}`);
      });
      report.push('');
    }

    const reportContent = report.join('\n');
    const reportPath = path.join(process.cwd(), 'ISO_TRACE_REPORT.md');
    fs.writeFileSync(reportPath, reportContent);

    return reportPath;
  }

  createChangelogEntry(
    itemId: string,
    itemType: VersionedItem['type'],
    versionBefore: string,
    versionAfter: string,
    changeReason: string,
    userId: string,
    details: string
  ): ChangelogEntry {
    return {
      id: crypto.randomUUID(),
      itemId,
      itemType,
      versionBefore,
      versionAfter,
      changeReason,
      userId,
      timestamp: new Date().toISOString(),
      details
    };
  }

  private checkAllItemsVersioned(items: VersionedItem[]): boolean {
    const requiredTypes = Object.keys(this.config.requiredVersions).filter(
      type => this.config.requiredVersions[type as keyof typeof this.config.requiredVersions]
    );

    const itemTypes = items.map(item => item.type);
    return requiredTypes.every(type => 
      itemTypes.includes(type as VersionedItem['type'])
    );
  }

  private checkChangelogCompleteness(changelog: ChangelogEntry[]): boolean {
    if (!this.config.requireChangelog) {
      return true;
    }

    return changelog.length > 0 && 
      changelog.every(entry => entry.versionBefore && entry.versionAfter && entry.userId && entry.timestamp);
  }

  private isValidVersion(version: string): boolean {
    // Semantic versioning validation: major.minor.patch or similar
    const semVerPattern = /^\d+\.\d+\.\d+(\-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?(\+[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$/;
    return semVerPattern.test(version);
  }
}

// Default configuration
export const defaultTraceabilityConfig: TraceabilityConfig = {
  requiredVersions: {
    templates: true,
    processes: true,
    materials: true,
    settings: true,
    calibrationFactors: true
  },
  requireChangelog: true
};

// Singleton instance
let instance: TraceabilityService | null = null;
export function getTraceabilityService(): TraceabilityService {
  if (!instance) {
    instance = new TraceabilityService(defaultTraceabilityConfig);
  }
  return instance;
}
