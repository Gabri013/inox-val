/**
 * Service: Configurações do Vendedor (Firestore)
 */

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirestore } from '@/lib/firebase';
import { getCurrentUserId, getCurrentUserProfile, getEmpresaId } from '@/services/firestore/base';
import type {
  ConfiguracaoVendedor,
  CreateConfiguracaoVendedorDTO,
  UpdateConfiguracaoVendedorDTO,
} from './vendedor.types';

const COLLECTION = 'configuracoes_vendedores';

const db = getFirestore();

const mapDoc = (id: string, data: any): ConfiguracaoVendedor => ({
  ...(data as ConfiguracaoVendedor),
  id,
});

export const vendedorService = {
  /**
   * Buscar configuração do vendedor logado
   */
  async getMinhaConfiguracao(): Promise<ConfiguracaoVendedor | null> {
    const userId = await getCurrentUserId();
    const ref = doc(db, COLLECTION, userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return mapDoc(snap.id, snap.data());
  },

  /**
   * Buscar configuração por ID do vendedor
   */
  async getConfiguracaoPorUsuario(usuarioId: string): Promise<ConfiguracaoVendedor | null> {
    const ref = doc(db, COLLECTION, usuarioId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return mapDoc(snap.id, snap.data());
  },

  /**
   * Criar configuração inicial
   */
  async create(data: CreateConfiguracaoVendedorDTO): Promise<ConfiguracaoVendedor> {
    const userId = await getCurrentUserId();
    const empresaId = await getEmpresaId();
    const profile = await getCurrentUserProfile();

    const payload = {
      ...data,
      usuarioId: userId,
      nomeVendedor: data.nomeVendedor || profile?.nome || profile?.email || 'Vendedor',
      criadoEm: Date.now(),
      atualizadoEm: Date.now(),
      empresaId,
    } as Omit<ConfiguracaoVendedor, 'id'> & { empresaId: string };
    const ref = doc(db, COLLECTION, userId);
    await setDoc(
      ref,
      {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId,
        isDeleted: false,
      },
      { merge: true }
    );
    const snap = await getDoc(ref);
    return mapDoc(snap.id, snap.data());
  },

  /**
   * Atualizar configuração
   */
  async update(id: string, data: UpdateConfiguracaoVendedorDTO): Promise<ConfiguracaoVendedor> {
    const userId = await getCurrentUserId();
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      atualizadoEm: Date.now(),
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
    const snap = await getDoc(doc(db, COLLECTION, id));
    return mapDoc(snap.id, snap.data());
  },

  /**
   * Atualizar apenas preços de materiais
   */
  async updatePrecosMateriais(
    id: string,
    precos: ConfiguracaoVendedor['precosMateriais']
  ): Promise<ConfiguracaoVendedor> {
    return this.update(id, { precosMateriais: precos });
  },

  /**
   * Atualizar margem de lucro
   */
  async updateMargemLucro(id: string, margem: number): Promise<ConfiguracaoVendedor> {
    return this.update(id, { margemLucroPadrao: margem });
  },

  /**
   * Criar configuração padrão para novo vendedor
   */
  async criarConfiguracaoPadrao(usuarioId: string, nomeVendedor: string): Promise<ConfiguracaoVendedor> {
    const agora = Date.now();
    const configuracaoPadrao: CreateConfiguracaoVendedorDTO = {
      usuarioId,
      nomeVendedor,
      precosMateriais: {
        '201': { precoPorKg: 15.50, dataAtualizacao: agora },
        '304': { precoPorKg: 22.80, dataAtualizacao: agora },
        '316': { precoPorKg: 35.60, dataAtualizacao: agora },
        '430': { precoPorKg: 18.90, dataAtualizacao: agora },
      },
      margemLucroPadrao: 35,
      custoMaoDeObraPorHora: 45.00,
      tempoMedioBancada: 8,
      materialPadrao: '304',
      acabamentoPadrao: 'escovado',
      espessuraPadrao: 0.8,
      espessurasDisponiveis: [0.6, 0.8, 1.0, 1.2, 1.5, 2.0],
      embalagens: [
        {
          tipo: 'plastico-bolha',
          custoBase: 25.00,
          descricao: 'Proteção básica com plástico bolha',
          ativo: true,
        },
        {
          tipo: 'papelao',
          custoBase: 45.00,
          descricao: 'Caixa de papelão reforçado',
          ativo: true,
        },
        {
          tipo: 'madeira',
          custoBase: 180.00,
          descricao: 'Caixa de madeira para transporte pesado',
          ativo: true,
        },
        {
          tipo: 'stretch',
          custoBase: 15.00,
          descricao: 'Filme stretch industrial',
          ativo: true,
        },
        {
          tipo: 'sem-embalagem',
          custoBase: 0,
          descricao: 'Sem embalagem - retirada local',
          ativo: true,
        },
      ],
      embalagemPadrao: 'plastico-bolha',
      custosAdicionais: {
        transporte: 0,
        impostos: 0,
        outros: 0,
      },
    };

    return this.create(configuracaoPadrao);
  },
};
