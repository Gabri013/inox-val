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

const db = admin.firestore();

async function addAdminUser() {
  const empresaId = 'empresa-demo-001'; // Ajuste conforme necessário
  const newUserData = {
    nome: 'Admin',
    email: 'admin@empresa.com',
    senha_hash: '$2b$10$xxxxxxxxxxx', // Gere o hash real com bcrypt se necessário
    role: 'Admin',
    empresaId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection('usuarios').add(newUserData);
    console.log('✅ Usuário admin criado com ID:', docRef.id);
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
}

addAdminUser();
