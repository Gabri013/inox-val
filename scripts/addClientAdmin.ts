

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

async function addSampleClientAdmin() {
  const empresaId = 'empresa-demo-001'; // Ajuste conforme sua empresa
  const newClientData = {
    nome: 'Empresa Admin Script',
    cnpj: '11223344556677',
    email: 'admin.script@teste.com',
    telefone: '11987654321',
    cidade: 'São Paulo',
    estado: 'SP',
    status: 'Ativo',
    totalCompras: 0,
    empresaId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection('clientes').add(newClientData);
    console.log('✅ Cliente criado com ID:', docRef.id);
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
  }
}

addSampleClientAdmin();
