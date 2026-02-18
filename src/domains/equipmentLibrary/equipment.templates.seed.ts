// ============================================================
// EQUIPMENT TEMPLATES SEED - Firestore seed function
// ============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import {

  TemplateDocument,
  PresetDocument,
  SeedResult,
} from './equipment.dsl.schema';
import { ALL_TEMPLATES } from './equipment.templates';
import { ALL_PRESETS } from './equipment.presets';
import { validateTemplate, validatePreset } from './equipment.validator';

// Collection paths
const TEMPLATES_COLLECTION = 'templates';
const PRESETS_SUBCOLLECTION = 'presets';

/**
 * Seed equipment templates and presets to Firestore
 * 
 * @param db - Firestore instance
 * @param companyId - Company ID for multi-tenant isolation
 * @param options - Seed options
 * @returns Seed result with counts and any errors
 */
export async function seedEquipmentTemplates(
  db: Firestore,
  companyId: string,
  options: {
    overwrite?: boolean;
    validateBeforeSeed?: boolean;
  } = {}
): Promise<SeedResult> {
  const { overwrite = false, validateBeforeSeed = true } = options;

  const result: SeedResult = {
    success: false,
    templatesCreated: 0,
    presetsCreated: 0,
    templatesSkipped: 0,
    presetsSkipped: 0,
    errors: [],
  };

  try {
    // Validate all templates before seeding
    if (validateBeforeSeed) {
      for (const template of ALL_TEMPLATES) {
        const validation = validateTemplate(template);
        if (!validation.valid) {
          const errors = validation.errors.map(e => e.message).join('; ');
          result.errors.push(`Template '${template.key}' validation failed: ${errors}`);
        }
      }

      if (result.errors.length > 0) {
        return result;
      }
    }

    // Get company templates collection reference
    const companyTemplatesRef = collection(db, TEMPLATES_COLLECTION, companyId, 'items');

    // Seed templates
    for (const template of ALL_TEMPLATES) {
      try {
        const docRef = doc(companyTemplatesRef, template.key);
        const existing = await getDoc(docRef);

        if (existing.exists() && !overwrite) {
          result.templatesSkipped++;
          continue;
        }

        const templateDoc: TemplateDocument = {
          ...template,
          id: template.key,
          companyId,
          active: true,
          createdAt: existing.exists() ? (existing.data() as TemplateDocument).createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(docRef, templateDoc, { merge: overwrite });
        result.templatesCreated++;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        result.errors.push(`Failed to seed template '${template.key}': ${message}`);
      }
    }

    // Seed presets
    const companyPresetsRef = collection(db, TEMPLATES_COLLECTION, companyId, PRESETS_SUBCOLLECTION);

    for (const preset of ALL_PRESETS) {
      try {
        // Validate preset
        if (validateBeforeSeed) {
          const template = ALL_TEMPLATES.find(t => t.key === preset.templateKey);
          const validation = validatePreset(preset, template || null);
          if (!validation.valid) {
            const errors = validation.errors.map(e => e.message).join('; ');
            result.errors.push(`Preset '${preset.id}' validation failed: ${errors}`);
            continue;
          }
        }

        const docRef = doc(companyPresetsRef, preset.id);
        const existing = await getDoc(docRef);

        if (existing.exists() && !overwrite) {
          result.presetsSkipped++;
          continue;
        }

        const presetDoc: PresetDocument = {
          ...preset,
          id: preset.id,
          companyId,
          active: true,
          createdAt: existing.exists() ? (existing.data() as PresetDocument).createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(docRef, presetDoc, { merge: overwrite });
        result.presetsCreated++;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        result.errors.push(`Failed to seed preset '${preset.id}': ${message}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    result.errors.push(`Seed failed: ${message}`);
    return result;
  }
}

/**
 * Seed templates in batch for better performance
 */
export async function seedEquipmentTemplatesBatch(
  db: Firestore,
  companyId: string,
  options: {
    overwrite?: boolean;
    validateBeforeSeed?: boolean;
  } = {}
): Promise<SeedResult> {
  const { overwrite = false, validateBeforeSeed = true } = options;

  const result: SeedResult = {
    success: false,
    templatesCreated: 0,
    presetsCreated: 0,
    templatesSkipped: 0,
    presetsSkipped: 0,
    errors: [],
  };

  try {
    // Validate all templates before seeding
    if (validateBeforeSeed) {
      for (const template of ALL_TEMPLATES) {
        const validation = validateTemplate(template);
        if (!validation.valid) {
          const errors = validation.errors.map(e => e.message).join('; ');
          result.errors.push(`Template '${template.key}' validation failed: ${errors}`);
        }
      }

      if (result.errors.length > 0) {
        return result;
      }
    }

    const batch = writeBatch(db);
    const timestamp = new Date().toISOString();

    // Get company templates collection reference
    const companyTemplatesRef = collection(db, TEMPLATES_COLLECTION, companyId, 'items');

    // Check existing templates
    const existingTemplateKeys = new Set<string>();
    if (!overwrite) {
      for (const template of ALL_TEMPLATES) {
        const docRef = doc(companyTemplatesRef, template.key);
        const existing = await getDoc(docRef);
        if (existing.exists()) {
          existingTemplateKeys.add(template.key);
        }
      }
    }

    // Add templates to batch
    for (const template of ALL_TEMPLATES) {
      if (existingTemplateKeys.has(template.key)) {
        result.templatesSkipped++;
        continue;
      }

      const docRef = doc(companyTemplatesRef, template.key);
      const templateDoc: TemplateDocument = {
        ...template,
        id: template.key,
        companyId,
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      batch.set(docRef, templateDoc);
      result.templatesCreated++;
    }

    // Add presets to batch
    const companyPresetsRef = collection(db, TEMPLATES_COLLECTION, companyId, PRESETS_SUBCOLLECTION);

    // Check existing presets
    const existingPresetIds = new Set<string>();
    if (!overwrite) {
      for (const preset of ALL_PRESETS) {
        const docRef = doc(companyPresetsRef, preset.id);
        const existing = await getDoc(docRef);
        if (existing.exists()) {
          existingPresetIds.add(preset.id);
        }
      }
    }

    for (const preset of ALL_PRESETS) {
      if (existingPresetIds.has(preset.id)) {
        result.presetsSkipped++;
        continue;
      }

      const docRef = doc(companyPresetsRef, preset.id);
      const presetDoc: PresetDocument = {
        ...preset,
        id: preset.id,
        companyId,
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      batch.set(docRef, presetDoc);
      result.presetsCreated++;
    }

    // Commit batch
    await batch.commit();

    result.success = true;
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    result.errors.push(`Batch seed failed: ${message}`);
    return result;
  }
}

/**
 * Clear all templates and presets for a company
 */
export async function clearEquipmentTemplates(
  db: Firestore,
  companyId: string
): Promise<{ success: boolean; templatesDeleted: number; presetsDeleted: number; errors: string[] }> {
  const result = {
    success: false,
    templatesDeleted: 0,
    presetsDeleted: 0,
    errors: [] as string[],
  };

  try {
    const batch = writeBatch(db);

    // Delete templates
    const companyTemplatesRef = collection(db, TEMPLATES_COLLECTION, companyId, 'items');
    const templatesSnapshot = await getDocs(companyTemplatesRef);
    templatesSnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      result.templatesDeleted++;
    });

    // Delete presets
    const companyPresetsRef = collection(db, TEMPLATES_COLLECTION, companyId, PRESETS_SUBCOLLECTION);
    const presetsSnapshot = await getDocs(companyPresetsRef);
    presetsSnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
      result.presetsDeleted++;
    });

    await batch.commit();
    result.success = true;
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    result.errors.push(`Clear failed: ${message}`);
    return result;
  }
}

/**
 * Get seed statistics
 */
export function getSeedStats(): {
  templateCount: number;
  presetCount: number;
  templatesByCategory: Record<string, number>;
  presetsByTemplate: Record<string, number>;
} {
  const templatesByCategory: Record<string, number> = {};
  const presetsByTemplate: Record<string, number> = {};

  for (const template of ALL_TEMPLATES) {
    templatesByCategory[template.category] = (templatesByCategory[template.category] || 0) + 1;
  }

  for (const preset of ALL_PRESETS) {
    presetsByTemplate[preset.templateKey] = (presetsByTemplate[preset.templateKey] || 0) + 1;
  }

  return {
    templateCount: ALL_TEMPLATES.length,
    presetCount: ALL_PRESETS.length,
    templatesByCategory,
    presetsByTemplate,
  };
}

/**
 * Verify seed integrity
 */
export async function verifySeed(
  db: Firestore,
  companyId: string
): Promise<{
  valid: boolean;
  missingTemplates: string[];
  missingPresets: string[];
  errors: string[];
}> {
  const result = {
    valid: true,
    missingTemplates: [] as string[],
    missingPresets: [] as string[],
    errors: [] as string[],
  };

  try {
    // Check templates
    const companyTemplatesRef = collection(db, TEMPLATES_COLLECTION, companyId, 'items');
    const templatesSnapshot = await getDocs(companyTemplatesRef);
    const existingTemplateKeys = new Set(templatesSnapshot.docs.map(d => d.id));

    for (const template of ALL_TEMPLATES) {
      if (!existingTemplateKeys.has(template.key)) {
        result.missingTemplates.push(template.key);
      }
    }

    // Check presets
    const companyPresetsRef = collection(db, TEMPLATES_COLLECTION, companyId, PRESETS_SUBCOLLECTION);
    const presetsSnapshot = await getDocs(companyPresetsRef);
    const existingPresetIds = new Set(presetsSnapshot.docs.map(d => d.id));

    for (const preset of ALL_PRESETS) {
      if (!existingPresetIds.has(preset.id)) {
        result.missingPresets.push(preset.id);
      }
    }

    result.valid = result.missingTemplates.length === 0 && result.missingPresets.length === 0;
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    result.errors.push(`Verification failed: ${message}`);
    result.valid = false;
    return result;
  }
}