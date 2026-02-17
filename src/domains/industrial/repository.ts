/**
 * ============================================================================
 * REPOSITÓRIO FIRESTORE — ENTIDADES INDUSTRIAIS
 * ============================================================================
 * Gerenciamento de chaves únicas no Firestore
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  MaterialKey,
  TubeKey,
  AngleKey,
  AccessorySKU,
  ProcessKey,
  ConfiguracoesSistema,
  MaterialRegistry,
  TipoInox,
  FormatoTubo,
  TipoProcesso,
  CategoriaAcessorio,
} from '../industrial/entities';

// ============================================================================
// COLEÇÕES
// ============================================================================

const COLLECTIONS = {
  MATERIALS: 'industrial_materials',
  TUBES: 'industrial_tubes',
  ANGLES: 'industrial_angles',
  ACCESSORIES: 'industrial_accessories',
  PROCESSES: 'industrial_processes',
  CONFIG: 'industrial_config',
  REGISTRY: 'industrial_registry',
} as const;

// ============================================================================
// MATERIALS — MATERIALKEY
// ============================================================================

export async function listarMateriais(ativo?: boolean): Promise<MaterialKey[]> {
  let q = query(collection(db, COLLECTIONS.MATERIALS));
  
  if (ativo !== undefined) {
    q = query(q, where('ativo', '==', ativo));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data() } as MaterialKey));
}

export async function obterMaterial(materialKey: string): Promise<MaterialKey | null> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.MATERIALS),
      where('materialKey', '==', materialKey)
    )
  );
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as MaterialKey;
}

export async function criarMaterial(material: MaterialKey): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.MATERIALS), {
    ...material,
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function atualizarMaterial(
  materialKey: string,
  updates: Partial<MaterialKey>
): Promise<void> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.MATERIALS),
      where('materialKey', '==', materialKey)
    )
  );
  
  if (snapshot.empty) {
    throw new Error(`Material não encontrado: ${materialKey}`);
  }
  
  const docRef = snapshot.docs[0].ref;
  await updateDoc(docRef, {
    ...updates,
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function atualizarPrecoMaterial(
  materialKey: string,
  precoPorKg: number,
  fornecedor?: string
): Promise<void> {
  await atualizarMaterial(materialKey, {
    precoPorKg,
    fornecedor,
    dataAtualizacao: new Date().toISOString(),
  } as Partial<MaterialKey>);
}

// ============================================================================
// TUBES — TUBEKEY
// ============================================================================

export async function listarTubos(ativo?: boolean): Promise<TubeKey[]> {
  let q = query(collection(db, COLLECTIONS.TUBES));
  
  if (ativo !== undefined) {
    q = query(q, where('ativo', '==', ativo));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data() } as TubeKey));
}

export async function obterTubo(tubeKey: string): Promise<TubeKey | null> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.TUBES),
      where('tubeKey', '==', tubeKey)
    )
  );
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as TubeKey;
}

export async function criarTubo(tube: TubeKey): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.TUBES), {
    ...tube,
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function atualizarPrecoTubo(
  tubeKey: string,
  precoPorKg: number,
  fornecedor?: string
): Promise<void> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.TUBES),
      where('tubeKey', '==', tubeKey)
    )
  );
  
  if (snapshot.empty) {
    throw new Error(`Tubo não encontrado: ${tubeKey}`);
  }
  
  const tube = snapshot.docs[0].data() as TubeKey;
  const precoPorMetro = tube.kgPorMetro * precoPorKg;
  
  const docRef = snapshot.docs[0].ref;
  await updateDoc(docRef, {
    precoPorKg,
    precoPorMetro,
    fornecedor,
    dataAtualizacao: new Date().toISOString(),
  });
}

// ============================================================================
// ANGLES — ANGLEKEY
// ============================================================================

export async function listarCantoneiras(ativo?: boolean): Promise<AngleKey[]> {
  let q = query(collection(db, COLLECTIONS.ANGLES));
  
  if (ativo !== undefined) {
    q = query(q, where('ativo', '==', ativo));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data() } as AngleKey));
}

export async function obterCantoneira(angleKey: string): Promise<AngleKey | null> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.ANGLES),
      where('angleKey', '==', angleKey)
    )
  );
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as AngleKey;
}

export async function criarCantoneira(angle: AngleKey): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.ANGLES), {
    ...angle,
    dataAtualizacao: new Date().toISOString(),
  });
}

// ============================================================================
// ACCESSORIES — ACCESSORY_SKU
// ============================================================================

export async function listarAcessorios(ativo?: boolean): Promise<AccessorySKU[]> {
  let q = query(collection(db, COLLECTIONS.ACCESSORIES));
  
  if (ativo !== undefined) {
    q = query(q, where('ativo', '==', ativo));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data() } as AccessorySKU));
}

export async function obterAcessorio(sku: string): Promise<AccessorySKU | null> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.ACCESSORIES),
      where('sku', '==', sku)
    )
  );
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as AccessorySKU;
}

export async function criarAcessorio(accessory: AccessorySKU): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.ACCESSORIES), {
    ...accessory,
    dataAtualizacao: new Date().toISOString(),
  });
}

export async function atualizarPrecoAcessorio(
  sku: string,
  precoUnitario: number,
  fornecedor?: string
): Promise<void> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.ACCESSORIES),
      where('sku', '==', sku)
    )
  );
  
  if (snapshot.empty) {
    throw new Error(`Acessório não encontrado: ${sku}`);
  }
  
  const docRef = snapshot.docs[0].ref;
  await updateDoc(docRef, {
    precoUnitario,
    fornecedor,
    dataAtualizacao: new Date().toISOString(),
  });
}

// ============================================================================
// PROCESSES — PROCESSKEY
// ============================================================================

export async function listarProcessos(ativo?: boolean): Promise<ProcessKey[]> {
  let q = query(collection(db, COLLECTIONS.PROCESSES));
  
  if (ativo !== undefined) {
    q = query(q, where('ativo', '==', ativo));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data() } as ProcessKey));
}

export async function obterProcesso(processKey: string): Promise<ProcessKey | null> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.PROCESSES),
      where('processKey', '==', processKey)
    )
  );
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as ProcessKey;
}

export async function criarProcesso(process: ProcessKey): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.PROCESSES), {
    ...process,
    dataAtualizacao: new Date().toISOString(),
  });
}

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

export async function obterConfiguracoes(): Promise<ConfiguracoesSistema> {
  const docRef = doc(db, COLLECTIONS.CONFIG, 'sistema');
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    // Retornar configurações padrão
    return {
      kerfMm: 0.2,
      margemMinimaEntrePecasMm: 5,
      margemBordaMm: 10,
      perdaMinimaOperacional: 5,
      perdaSetup: 2,
      retrabalhoEstimado: 3,
      overheadPercent: 20,
      overheadIncideEmAcessorios: false,
      margemMinima: 25,
      margemAlvo: 35,
      markup: 2.5,
      diasValidadePreco: 30,
      aproveitamentoMinimoAceitavel: 60,
      perdaMaximaAceitavel: 20,
      dataAtualizacao: new Date().toISOString(),
    };
  }
  
  return snapshot.data() as ConfiguracoesSistema;
}

export async function atualizarConfiguracoes(
  config: Partial<ConfiguracoesSistema>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CONFIG, 'sistema');
  
  await setDoc(docRef, {
    ...config,
    dataAtualizacao: new Date().toISOString(),
  }, { merge: true });
}

// ============================================================================
// REGISTRY — Carregar todas as chaves ativas
// ============================================================================

export async function carregarRegistry(): Promise<MaterialRegistry> {
  const [materials, tubes, angles, accessories, processes] = await Promise.all([
    listarMateriais(true),
    listarTubos(true),
    listarCantoneiras(true),
    listarAcessorios(true),
    listarProcessos(true),
  ]);
  
  // Construir índices
  const materialsByTipo: Record<TipoInox, string[]> = {
    '304': [],
    '316': [],
    '316L': [],
    '430': [],
  };
  
  const tubesByFormato: Record<FormatoTubo, string[]> = {
    'REDONDO': [],
    'QUADRADO': [],
    'RETANGULAR': [],
  };
  
  const accessoriesByCategoria: Record<CategoriaAcessorio, string[]> = {
    'fixacao': [],
    'hidraulico': [],
    'estrutural': [],
    'acabamento': [],
    'eletrico': [],
    'outro': [],
  };
  
  const processesByTipo: Record<TipoProcesso, string[]> = {
    'CORTE': [],
    'DOBRA': [],
    'SOLDA': [],
    'ACABAMENTO': [],
    'MONTAGEM': [],
    'INSTALACAO': [],
  };
  
  // Indexar materiais
  const materialsMap: Record<string, MaterialKey> = {};
  for (const material of materials) {
    materialsMap[material.materialKey] = material;
    materialsByTipo[material.tipoInox].push(material.materialKey);
  }
  
  // Indexar tubos
  const tubesMap: Record<string, TubeKey> = {};
  for (const tube of tubes) {
    tubesMap[tube.tubeKey] = tube;
    tubesByFormato[tube.formato].push(tube.tubeKey);
  }
  
  // Indexar cantoneiras
  const anglesMap: Record<string, AngleKey> = {};
  for (const angle of angles) {
    anglesMap[angle.angleKey] = angle;
  }
  
  // Indexar acessórios
  const accessoriesMap: Record<string, AccessorySKU> = {};
  for (const accessory of accessories) {
    accessoriesMap[accessory.sku] = accessory;
    accessoriesByCategoria[accessory.categoria].push(accessory.sku);
  }
  
  // Indexar processos
  const processesMap: Record<string, ProcessKey> = {};
  for (const process of processes) {
    processesMap[process.processKey] = process;
    processesByTipo[process.tipo].push(process.processKey);
  }
  
  return {
    materials: materialsMap,
    tubes: tubesMap,
    angles: anglesMap,
    accessories: accessoriesMap,
    processes: processesMap,
    materialsByTipo,
    tubesByFormato,
    accessoriesByCategoria,
    processesByTipo,
    dataAtualizacao: new Date().toISOString(),
  };
}

export async function salvarRegistry(registry: MaterialRegistry): Promise<void> {
  const docRef = doc(db, COLLECTIONS.REGISTRY, 'current');
  await setDoc(docRef, registry);
}
