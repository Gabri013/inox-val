import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  ProcessRepository, 
  ProcessFilters 
} from '../../domains/processes/types';
import { Process, ProcessKey } from '../../domains/engine/types';
import { DEFAULT_RULESET } from '../../domains/engine/ruleset';

const COLLECTION_NAME = 'processes';

export class ProcessRepositoryFirestore implements ProcessRepository {
  
  async getProcess(key: ProcessKey): Promise<Process | undefined> {
    const docRef = doc(db, COLLECTION_NAME, key);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) return undefined;
    
    return this.docToProcess(snapshot.id, snapshot.data());
  }
  
  async listProcesses(filters?: ProcessFilters): Promise<Process[]> {
    let q = query(collection(db, COLLECTION_NAME));
    
    if (filters?.active !== undefined) {
      q = query(q, where('active', '==', filters.active));
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => 
      this.docToProcess(doc.id, doc.data())
    );
  }
  
  async createProcess(process: Omit<Process, 'key'> & { key?: ProcessKey }): Promise<Process> {
    if (!process.key) {
      throw new Error('Process key is required');
    }
    
    const docRef = doc(db, COLLECTION_NAME, process.key);
    
    const data = this.processToDoc(process);
    await setDoc(docRef, data);
    
    return { ...process, key: process.key };
  }
  
  async updateProcess(key: ProcessKey, updates: Partial<Process>): Promise<Process> {
    const existing = await this.getProcess(key);
    if (!existing) {
      throw new Error(`Processo não encontrado: ${key}`);
    }
    
    const docRef = doc(db, COLLECTION_NAME, key);
    const data = this.processToDoc({ ...existing, ...updates });
    await setDoc(docRef, data, { merge: true });
    
    return { ...existing, ...updates };
  }
  
  async deleteProcess(key: ProcessKey): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, key);
    await deleteDoc(docRef);
  }
  
  async processKeyExists(key: ProcessKey): Promise<boolean> {
    const process = await this.getProcess(key);
    return process !== undefined;
  }
  
  async getRequiredProcessesForBOM(bomType: 'sheet' | 'tube' | 'accessory'): Promise<ProcessKey[]> {
    return DEFAULT_RULESET.requiredProcesses[bomType] || [];
  }
  
  // Helpers
  private docToProcess(id: string, data: Record<string, unknown>): Process {
    return {
      key: id as ProcessKey,
      label: data.label as string,
      active: data.active as boolean,
      costModel: {
        setupMinutes: (data.costModel as Record<string, unknown>)?.setupMinutes as number || 0,
        costPerHour: (data.costModel as Record<string, unknown>)?.costPerHour as number || 0,
        costPerUnit: (data.costModel as Record<string, unknown>)?.costPerUnit as number | undefined,
        costPerMeter: (data.costModel as Record<string, unknown>)?.costPerMeter as number | undefined,
        costPerBend: (data.costModel as Record<string, unknown>)?.costPerBend as number | undefined,
        costPerM2: (data.costModel as Record<string, unknown>)?.costPerM2 as number | undefined
      },
      capacityModel: data.capacityModel as Process['capacityModel']
    };
  }
  
  private processToDoc(process: Partial<Process>): Record<string, unknown> {
    return {
      label: process.label,
      active: process.active,
      costModel: process.costModel,
      capacityModel: process.capacityModel
    };
  }
}

// Singleton
export const processRepository = new ProcessRepositoryFirestore();
