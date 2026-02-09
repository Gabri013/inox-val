/**
 * Apaga TODO o Firestore (todas as coleções raiz), sem prompt.
 *
 * Requer credenciais (prod) via `.secrets/serviceAccountKey.json` OU ADC.
 * Para emulador, basta setar `FIRESTORE_EMULATOR_HOST`.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './lib/loadEnv.js';
import { initFirebaseAdmin } from './lib/firebaseAdmin.js';

loadEnv();

function isMainModule(importMetaUrl) {
  const thisFile = path.resolve(fileURLToPath(importMetaUrl));
  const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return thisFile === entryFile;
}

async function deleteCollectionAllDocs(db, colRef) {
  // Prefer: recursiveDelete se disponível (também apaga subcoleções).
  if (typeof db.recursiveDelete === 'function') {
    await db.recursiveDelete(colRef);
    return;
  }

  // Fallback: apaga docs em batches (não garante subcoleções em versões antigas).
  // Ainda assim, cobre a maioria dos casos deste projeto.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await colRef.limit(500).get();
    if (snap.empty) break;
    const batch = db.batch();
    for (const doc of snap.docs) batch.delete(doc.ref);
    await batch.commit();
  }
}

export async function resetFirestoreAll() {
  const { db, hasServiceAccount, serviceAccountPath } = initFirebaseAdmin();
  const quiet = process.env.RESET_QUIET === 'true';

  const hasEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

  if (!hasEmulator && !hasServiceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      `Credenciais não encontradas. Crie ${serviceAccountPath} ou defina GOOGLE_APPLICATION_CREDENTIALS.`
    );
  }

  // Guard rail: nunca apagar produção sem um "sinal" explícito.
  const dangerOk = process.env.DANGER_DELETE_ALL === 'true';
  if (!hasEmulator && !dangerOk) {
    throw new Error(
      'Para apagar em PRODUÇÃO, defina DANGER_DELETE_ALL=true. (No emulador não precisa.)'
    );
  }

  const cols = await db.listCollections();
  process.stdout.write(`RESET Firestore: ${cols.length} coleções\n`);
  if (cols.length === 0) {
    process.stdout.write('OK\n');
    return;
  }

  for (const col of cols) {
    await deleteCollectionAllDocs(db, col);
    if (!quiet) process.stdout.write(`- deleted: ${col.id}\n`);
  }

  process.stdout.write('OK\n');
}

if (isMainModule(import.meta.url)) {
  resetFirestoreAll().catch((err) => {
    process.stderr.write(`ERRO: ${err?.message || String(err)}\n`);
    process.exit(1);
  });
}
