import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
// Removido getEmpresaContext para evitar dependência de import.meta.env


// ATENÇÃO: Preencha suas credenciais do Firebase abaixo
const firebaseConfig = {
  apiKey: 'SUA_API_KEY',
  authDomain: 'SEU_AUTH_DOMAIN',
  projectId: 'SEU_PROJECT_ID',
  storageBucket: 'SEU_STORAGE_BUCKET',
  messagingSenderId: 'SEU_MESSAGING_SENDER_ID',
  appId: 'SEU_APP_ID',
};

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import path from 'path';
import fs from 'fs';

// Corrigir __dirname para ES modules
let __filename = new URL(import.meta.url).pathname;
if (process.platform === 'win32' && __filename.startsWith('/')) {
  __filename = __filename.slice(1);
}
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.resolve(__dirname, '../.secrets/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function popularOrdensProducao() {
  // Defina o mesmo empresaId usado no seu sistema
  const empresaId = 'tenant-demo-001';
  const ordens = [
    {
      status: 'Em Produção',
      empresaId,
      descricao: 'Ordem de produção teste 1',
      dataCriacao: new Date(),
      total: 1000,
    },
    {
      status: 'Pendente',
      empresaId,
      descricao: 'Ordem de produção teste 2',
      dataCriacao: new Date(),
      total: 500,
    },
    {
      status: 'Concluída',
      empresaId,
      descricao: 'Ordem de produção teste 3',
      dataCriacao: new Date(),
      total: 2000,
    },
  ];

  for (const ordem of ordens) {
    await db.collection('ordens_producao').add(ordem);
    console.log('Ordem inserida:', ordem);
  }
  console.log('População concluída!');
}

popularOrdensProducao().catch(console.error);
