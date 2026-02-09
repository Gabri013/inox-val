/**
 * Smoke test do Firestore (Admin SDK): valida se o seed criou dados básicos.
 * Saída curta (1 linha por coleção).
 */

import { loadEnv } from './lib/loadEnv.js';
import { initFirebaseAdmin } from './lib/firebaseAdmin.js';

loadEnv();

const empresaId =
  process.env.SEED_EMPRESA_ID ||
  process.env.VITE_DEFAULT_EMPRESA_ID ||
  'tenant-demo-001';

const { db } = initFirebaseAdmin();

async function safeCount(query) {
  // Prefer aggregator count (mais barato).
  if (typeof query.count === 'function') {
    const snap = await query.count().get();
    return snap.data().count;
  }

  // Fallback: contar lendo (limite 2000 pra não explodir output/custo).
  const snap = await query.limit(2000).get();
  return snap.size;
}

async function main() {
  process.stdout.write(`SMOKE Firestore (empresaId=${empresaId})\n`);

  const checks = [
    { name: 'empresas', query: db.collection('empresas').doc(empresaId) },
    { name: 'configuracoes:CUSTOS', query: db.collection('configuracoes').where('empresaId', '==', empresaId).where('tipo', '==', 'CUSTOS') },
    { name: 'configuracoes:CALCULADORA', query: db.collection('configuracoes').where('empresaId', '==', empresaId).where('tipo', '==', 'CALCULADORA') },
    { name: 'clientes', query: db.collection('clientes').where('empresaId', '==', empresaId) },
    { name: 'materiais', query: db.collection('materiais').where('empresaId', '==', empresaId) },
    { name: 'produtos', query: db.collection('produtos').where('empresaId', '==', empresaId) },
    { name: 'estoque_itens', query: db.collection('estoque_itens').where('empresaId', '==', empresaId) },
    { name: 'orcamentos', query: db.collection('orcamentos').where('empresaId', '==', empresaId) },
    { name: 'ordens_producao', query: db.collection('ordens_producao').where('empresaId', '==', empresaId) },
    { name: 'apontamentos', query: db.collection('apontamentos').where('empresaId', '==', empresaId) },
    { name: 'calculos', query: db.collection('calculos').where('empresaId', '==', empresaId) },
  ];

  for (const c of checks) {
    if ('get' in c.query && typeof c.query.get === 'function' && c.query.path?.startsWith('empresas/')) {
      const snap = await c.query.get();
      process.stdout.write(`${c.name}: ${snap.exists ? 'OK' : 'MISSING'}\n`);
      continue;
    }

    const count = await safeCount(c.query);
    process.stdout.write(`${c.name}: ${count}\n`);
  }

  process.stdout.write('OK\n');
}

main().catch((err) => {
  process.stderr.write(`ERRO: ${err?.message || String(err)}\n`);
  process.exit(1);
});

