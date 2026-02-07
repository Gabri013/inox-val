import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const serviceAccountRaw = await readFile('./.secrets/serviceAccountKey.json', 'utf8');
const serviceAccount = JSON.parse(serviceAccountRaw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://erp-industrial-inox.firebaseio.com',
  });
}

async function createAdminAuthUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'admin@empresa.com',
      password: 'admin123', // Defina a senha desejada
      displayName: 'Admin',
    });
    console.log('✅ Usuário admin criado no Auth com UID:', userRecord.uid);

    // (Opcional) Adicionar custom claim de admin
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'Admin' });
    console.log('✅ Custom claim "role: Admin" adicionada ao usuário');
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin no Auth:', error);
  }
}

createAdminAuthUser();
