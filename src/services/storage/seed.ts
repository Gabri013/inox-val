/**
 * Função para popular o banco de dados com dados iniciais (seed)
 */

import { Storage } from './db';
import { clientesSeed } from '@/domains/clientes';
import { produtosSeed } from '@/domains/produtos';
import { initChatMock } from '@/domains/chat';
import { initAnunciosMock } from '@/domains/anuncios';
import { ordensMock } from '@/domains/producao/producao.seed';
import type { Orcamento } from '@/app/types/workflow';

/**
 * Verifica se uma store precisa ser populada e popula se necessário
 */
async function seedStoreIfEmpty<T extends { id: string }>(
  storeName: any,
  seedData: T[]
): Promise<void> {
  const storage = new Storage<T>(storeName);
  const existing = await storage.getAll();
  
  if (existing.length === 0) {
    console.log(`Populando ${storeName} com ${seedData.length} registros...`);
    for (const item of seedData) {
      await storage.create(item);
    }
    console.log(`${storeName} populado com sucesso!`);
  }
}

/**
 * Popula todas as stores com dados iniciais
 */
export async function seedDatabase(): Promise<void> {
  try {
    // Seed de clientes
    await seedStoreIfEmpty('clientes', clientesSeed);
    
    // Seed de produtos
    await seedStoreIfEmpty('produtos', produtosSeed);

    // Seed de orçamentos (básico)
    const orcamentosSeed: Orcamento[] = [
      {
        id: 'orc-001',
        numero: 'ORC-2024-001',
        clienteId: clientesSeed[0]?.id || 'cliente-1',
        clienteNome: clientesSeed[0]?.nome || 'Cliente Demo',
        data: new Date('2024-02-01T00:00:00Z'),
        validade: new Date('2024-03-02T00:00:00Z'),
        status: 'Enviado',
        itens: [
          {
            id: 'item-001',
            modeloId: 'MPLC',
            modeloNome: 'MPLC - Mesa com Encosto Liso',
            descricao: 'Bancada 2000x700x850mm',
            quantidade: 1,
            precoUnitario: 4200,
            subtotal: 4200,
          },
        ],
        subtotal: 4200,
        desconto: 0,
        total: 4200,
      },
      {
        id: 'orc-002',
        numero: 'ORC-2024-002',
        clienteId: clientesSeed[1]?.id || 'cliente-2',
        clienteNome: clientesSeed[1]?.nome || 'Cliente Demo 2',
        data: new Date('2024-02-05T00:00:00Z'),
        validade: new Date('2024-03-06T00:00:00Z'),
        status: 'Aprovado',
        itens: [
          {
            id: 'item-002',
            modeloId: 'MPVE',
            modeloNome: 'MPVE - Mesa Central',
            descricao: 'Mesa Central 1500x800x900mm',
            quantidade: 2,
            precoUnitario: 3800,
            subtotal: 7600,
          },
        ],
        subtotal: 7600,
        desconto: 0,
        total: 7600,
      },
    ];
    await seedStoreIfEmpty('orcamentos', orcamentosSeed as any);

    // Seed de ordens de produção
    await seedStoreIfEmpty('ordens_producao', ordensMock as any);
    
    // Inicializar mock do chat
    await initChatMock();
    
    // Inicializar mock de anúncios
    await initAnunciosMock();
    
    // TODO: Adicionar seed de outros módulos conforme forem criados
    // await seedStoreIfEmpty('estoque', estoqueSeed);
    // etc...
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao popular banco de dados:', error);
    throw error;
  }
}

let seedPromise: Promise<void> | null = null;

/**
 * Garante que o seed rode apenas uma vez por ciclo de app.
 */
export function seedDatabaseOnce(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedDatabase();
  }
  return seedPromise;
}
