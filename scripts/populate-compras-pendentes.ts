import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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
const empresaId = 'tenant-demo-001';
const now = new Date();

async function popularComprasPendentes() {
  const compras = [
    {
      empresaId,
      status: 'PENDENTE',
      descricao: 'Compra pendente teste',
      valor: 1234,
      isDeleted: false,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      data: Timestamp.fromDate(now),
    },
    {
      empresaId,
      status: 'AGUARDANDO_APROVACAO',
      descricao: 'Compra aguardando aprovação',
      valor: 5678,
      isDeleted: false,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      data: Timestamp.fromDate(now),
    },
  ];
  for (const compra of compras) {
    await db.collection('compras').add(compra);
    console.log('Compra inserida:', compra);
  }
  console.log('População de compras pendentes concluída!');
}

popularComprasPendentes().catch(console.error);
