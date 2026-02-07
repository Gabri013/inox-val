/**
 * Seed: limpa usuários (Auth + Firestore) e cria 1 usuário por setor/role
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const envFile = new URL('../.env', import.meta.url);
const serviceAccountFile = new URL('../.secrets/serviceAccountKey.json', import.meta.url);

function parseEnvFile(filePath) {
  try {
    const raw = readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const env = {};
    for (const line of lines) {
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

const env = parseEnvFile(envFile);
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD || env.SEED_ADMIN_PASSWORD;
const EMPRESA_ID = process.env.SEED_EMPRESA_ID || env.SEED_EMPRESA_ID || 'tenant-demo-001';
const EMAIL_DOMAIN = process.env.SEED_EMAIL_DOMAIN || env.SEED_EMAIL_DOMAIN || 'inoxval.com';

if (!SEED_PASSWORD || SEED_PASSWORD.length < 6) {
  console.error('❌ SEED_ADMIN_PASSWORD inválida ou ausente. Defina no .env (mín. 6 caracteres).');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountFile, 'utf8'));

if (!admin.apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
const serverTimestamp = () => FieldValue.serverTimestamp();

const roles = [
  { role: 'Administrador', slug: 'administrador' },
  { role: 'Dono', slug: 'dono' },
  { role: 'Financeiro', slug: 'financeiro' },
  { role: 'Producao', slug: 'producao' },
  { role: 'Engenharia', slug: 'engenharia' },
  { role: 'Orcamentista', slug: 'orcamentista' },
  { role: 'Vendedor', slug: 'vendedor' },
];

async function deleteAllAuthUsers() {
  console.log('🧹 Removendo usuários do Firebase Auth...');
  let nextPageToken;
  let total = 0;

  do {
    const list = await admin.auth().listUsers(1000, nextPageToken);
    const uids = list.users.map((u) => u.uid);

    if (uids.length > 0) {
      // deleteUsers aceita até 1000 uids
      await admin.auth().deleteUsers(uids);
      total += uids.length;
    }

    nextPageToken = list.pageToken;
  } while (nextPageToken);

  console.log(`✅ ${total} usuário(s) removido(s) do Auth.`);
}

async function deleteCollection(name, batchSize = 400) {
  console.log(`🧹 Limpando coleção ${name}...`);
  let total = 0;

  while (true) {
    const snap = await db.collection(name).limit(batchSize).get();
    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    total += snap.size;
  }

  console.log(`✅ ${total} documento(s) removido(s) de ${name}.`);
}

async function createSectorUsers() {
  console.log('👥 Criando usuários por setor...');

  for (const { role, slug } of roles) {
    const email = `${slug}@${EMAIL_DOMAIN}`;
    const displayName = `${role} Seed`;

    const userRecord = await admin.auth().createUser({
      email,
      password: SEED_PASSWORD,
      displayName,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    const profile = {
      id: userRecord.uid,
      empresaId: EMPRESA_ID,
      email,
      nome: displayName,
      role,
      departamento: role,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userRecord.uid,
      updatedBy: userRecord.uid,
      isDeleted: false,
    };

    await db.collection('users').doc(userRecord.uid).set(profile, { merge: true });
    await db.collection('usuarios').doc(userRecord.uid).set(profile, { merge: true });

    console.log(`  ✅ ${role} criado (${email})`);
  }
}

async function run() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('🔧 LIMPEZA + SEED DE USUÁRIOS POR SETOR');
  console.log('════════════════════════════════════════════════════════════\n');

  await deleteAllAuthUsers();
  await deleteCollection('users');
  await deleteCollection('usuarios');

  await createSectorUsers();

  console.log('\n🎉 Concluído! Usuários por setor criados com sucesso.');
}

run().catch((error) => {
  console.error('\n❌ Erro ao executar seed:', error);
  process.exit(1);
});
