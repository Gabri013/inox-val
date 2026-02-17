/**
 * ============================================================================
 * REPOSITÓRIO DE MATERIAIS - FIRESTORE
 * ============================================================================
 * Gerenciamento de matéria-prima com preços reais
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type {
  ChapaPadrao,
  PrecoChapa,
  TuboDefinicao,
  PrecoTubo,
  CantoneiraDefinicao,
  PrecoCantoneira,
  AcessorioDefinicao,
  ProcessoDefinicao,
  ConfiguracoesMateriais,
  HistoricoPreco,
  TipoInox,
} from './types';

// ============================================================================
// CHAPAS
// ============================================================================

export async function listarChapasPadrao(): Promise<ChapaPadrao[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_chapas_padrao'),
      where('ativo', '==', true)
    )
  );
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ChapaPadrao[];
}

export async function obterPrecosChapa(
  tipoInox: TipoInox,
  espessuraMm: number
): Promise<PrecoChapa | null> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_precos_chapas'),
      where('tipoInox', '==', tipoInox),
      where('espessuraMm', '==', espessuraMm),
      orderBy('dataAtualizacao', 'desc')
    )
  );
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as unknown as PrecoChapa;
}

export async function atualizarPrecoChapa(
  tipoInox: TipoInox,
  espessuraMm: number,
  precoKg: number,
  fornecedor?: string
): Promise<void> {
  const preco: Omit<PrecoChapa, 'id'> = {
    tipoInox,
    espessuraMm,
    precoKg,
    dataAtualizacao: new Date().toISOString(),
    fornecedor,
  };
  
  await addDoc(collection(db, 'materiais_precos_chapas'), preco);
  
  // Registrar no histórico
  await registrarHistoricoPreco({
    tipoMaterial: 'chapa',
    materialId: `${tipoInox}_${espessuraMm}mm`,
    tipoInox,
    preco: precoKg,
    data: new Date().toISOString(),
  });
}

// ============================================================================
// TUBOS
// ============================================================================

export async function listarTubos(): Promise<TuboDefinicao[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_tubos'),
      where('ativo', '==', true)
    )
  );
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as TuboDefinicao[];
}

export async function obterPrecoTubo(
  tuboId: string,
  tipoInox: TipoInox
): Promise<PrecoTubo | null> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_precos_tubos'),
      where('tuboId', '==', tuboId),
      where('tipoInox', '==', tipoInox),
      orderBy('dataAtualizacao', 'desc')
    )
  );
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as unknown as PrecoTubo;
}

export async function atualizarPrecoTubo(
  tuboId: string,
  tipoInox: TipoInox,
  precoKg: number,
  fornecedor?: string
): Promise<void> {
  const preco: Omit<PrecoTubo, 'id'> = {
    tuboId,
    tipoInox,
    precoKg,
    dataAtualizacao: new Date().toISOString(),
    fornecedor,
  };
  
  await addDoc(collection(db, 'materiais_precos_tubos'), preco);
  
  await registrarHistoricoPreco({
    tipoMaterial: 'tubo',
    materialId: tuboId,
    tipoInox,
    preco: precoKg,
    data: new Date().toISOString(),
  });
}

// ============================================================================
// CANTONEIRAS
// ============================================================================

export async function listarCantoneiras(): Promise<CantoneiraDefinicao[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_cantoneiras'),
      where('ativo', '==', true)
    )
  );
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as CantoneiraDefinicao[];
}

export async function obterPrecoCantoneira(
  cantoneiraId: string,
  tipoInox: TipoInox
): Promise<PrecoCantoneira | null> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_precos_cantoneiras'),
      where('cantoneiraId', '==', cantoneiraId),
      where('tipoInox', '==', tipoInox),
      orderBy('dataAtualizacao', 'desc')
    )
  );
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as unknown as PrecoCantoneira;
}

// ============================================================================
// ACESSÓRIOS
// ============================================================================

export async function listarAcessorios(): Promise<AcessorioDefinicao[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_acessorios'),
      where('ativo', '==', true)
    )
  );
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as AcessorioDefinicao[];
}

export async function obterAcessorio(sku: string): Promise<AcessorioDefinicao | null> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_acessorios'),
      where('sku', '==', sku),
      where('ativo', '==', true)
    )
  );
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as AcessorioDefinicao;
}

export async function atualizarPrecoAcessorio(
  id: string,
  precoUnitario: number,
  fornecedor?: string
): Promise<void> {
  const docRef = doc(db, 'materiais_acessorios', id);
  
  await updateDoc(docRef, {
    precoUnitario,
    fornecedor,
    dataAtualizacao: new Date().toISOString(),
  });
  
  await registrarHistoricoPreco({
    tipoMaterial: 'acessorio',
    materialId: id,
    preco: precoUnitario,
    data: new Date().toISOString(),
  });
}

// ============================================================================
// PROCESSOS
// ============================================================================

export async function listarProcessos(): Promise<ProcessoDefinicao[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_processos'),
      where('ativo', '==', true)
    )
  );
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ProcessoDefinicao[];
}

export async function obterProcesso(tipo: string): Promise<ProcessoDefinicao | null> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_processos'),
      where('tipo', '==', tipo),
      where('ativo', '==', true)
    )
  );
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as ProcessoDefinicao;
}

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

export async function obterConfiguracoesMateriais(): Promise<ConfiguracoesMateriais> {
  const docRef = doc(db, 'configuracoes', 'materiais');
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    // Retornar valores padrão
    return {
      densidadeInoxKgM3: 7900,
      margemPerdaMaterial: 15,
      overheadPercent: 20,
      margemLucroMinima: 25,
      markupPadrao: 2.5,
      dataAtualizacao: new Date().toISOString(),
    };
  }
  
  return snapshot.data() as ConfiguracoesMateriais;
}

export async function atualizarConfiguracoesMateriais(
  config: Partial<ConfiguracoesMateriais>
): Promise<void> {
  const docRef = doc(db, 'configuracoes', 'materiais');
  
  await updateDoc(docRef, {
    ...config,
    dataAtualizacao: new Date().toISOString(),
  });
}

// ============================================================================
// HISTÓRICO DE PREÇOS
// ============================================================================

async function registrarHistoricoPreco(
  registro: Omit<HistoricoPreco, 'id'>
): Promise<void> {
  await addDoc(collection(db, 'materiais_historico_precos'), registro);
}

export async function obterHistoricoPrecos(
  materialId: string,
  limite: number = 10
): Promise<HistoricoPreco[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'materiais_historico_precos'),
      where('materialId', '==', materialId),
      orderBy('data', 'desc')
    )
  );
  
  return snapshot.docs
    .slice(0, limite)
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as HistoricoPreco[];
}
