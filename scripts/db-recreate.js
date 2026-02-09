/**
 * Recria o banco (Firestore): reset total + seed de exemplos.
 * Sem prompt / sem confirmação interativa.
 */

import { spawnSync } from 'node:child_process';
import { loadEnv } from './lib/loadEnv.js';
import { resetFirestoreAll } from './db-reset.js';

loadEnv();

async function main() {
  const empresaId =
    process.env.SEED_EMPRESA_ID ||
    process.env.VITE_DEFAULT_EMPRESA_ID ||
    'tenant-demo-001';

  process.stdout.write(`DB RECREATE (empresaId=${empresaId})\n`);
  process.env.RESET_QUIET = process.env.RESET_QUIET ?? 'true';
  await resetFirestoreAll();

  // Seed em um processo separado para evitar conflito de initializeApp().
  process.stdout.write('SEED Firestore\n');
  const result = spawnSync(process.execPath, ['scripts/populate-firestore.js'], {
    env: {
      ...process.env,
      SEED_EMPRESA_ID: empresaId,
      SEED_QUIET: process.env.SEED_QUIET ?? 'true',
    },
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  process.stdout.write('DONE\n');
}

main().catch((err) => {
  process.stderr.write(`ERRO: ${err?.message || String(err)}\n`);
  process.exit(1);
});
