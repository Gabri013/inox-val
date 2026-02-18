export interface VersionedItem {
  id: string;
  type: 'TEMPLATE' | 'PROCESS' | 'MATERIAL' | 'SETTING' | 'CALIBRATION_FACTOR';
  version: string;
  name: string;
}

export interface ChangelogEntry {
  id: string;
  itemId: string;
  itemType: VersionedItem['type'];
  versionBefore: string;
  versionAfter: string;
  changeReason: string;
  userId: string;
  timestamp: string;
  details: string;
}

export interface TraceabilityResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  versionedItems: VersionedItem[];
  changelog: ChangelogEntry[];
  allItemsVersioned: boolean;
  hasCompleteChangelog: boolean;
}

export interface TraceabilityConfig {
  requiredVersions: {
    templates: boolean;
    processes: boolean;
    materials: boolean;
    settings: boolean;
    calibrationFactors: boolean;
  };
  requireChangelog: boolean;
}
