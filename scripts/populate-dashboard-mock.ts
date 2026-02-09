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

async function popularDashboardMock() {

  // Ordens de produção
  const ordens = [
    { status: 'Em Produção', empresaId, descricao: 'Ordem produção teste', dataCriacao: new Date(), total: 1000 },
    { status: 'Pendente', empresaId, descricao: 'Ordem pendente', dataCriacao: new Date(), total: 500 },
    { status: 'Pausada', empresaId, descricao: 'Ordem pausada', dataCriacao: new Date(), total: 300 },
    { status: 'Concluída', empresaId, descricao: 'Ordem concluída', dataCriacao: new Date(), total: 2000 },
  ];
  for (const ordem of ordens) {
    await db.collection('ordens_producao').add(ordem);
  }

  // Orçamentos faturados (para receita)
  const now = new Date();
  const orcamentos = [
    // Timestamp
    {
      empresaId,
      status: 'FATURADO',
      valorTotal: 5000,
      dataFaturamento: Timestamp.fromDate(now),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    },
    // Date puro
    {
      empresaId,
      status: 'FATURADO',
      valorTotal: 3000,
      dataFaturamento: now,
      createdAt: now,
      updatedAt: now,
    },
    // String ISO
    {
      empresaId,
      status: 'FATURADO',
      valorTotal: 2000,
      dataFaturamento: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    // Mês anterior (para variação)
    {
      empresaId,
      status: 'FATURADO',
      valorTotal: 1000,
      dataFaturamento: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() - 1, 10)),
      createdAt: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() - 1, 10)),
      updatedAt: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() - 1, 10)),
    },
    // Em aberto
    {
      empresaId,
      status: 'EM_ABERTO',
      valorTotal: 1000,
      dataFaturamento: null,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    },
  ];
  for (const orc of orcamentos) {
    await db.collection('orcamentos').add(orc);
  }
  // Compras pendentes também em solicitacoes_compra
  const solicitacoesCompra = [
    { empresaId, status: 'PENDENTE', descricao: 'Solicitação aço', valor: 800, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), isDeleted: false, data: Timestamp.fromDate(now) },
    { empresaId, status: 'AGUARDANDO_APROVACAO', descricao: 'Solicitação alumínio', valor: 1200, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), isDeleted: false, data: Timestamp.fromDate(now) },
  ];
  for (const sc of solicitacoesCompra) {
    await db.collection('solicitacoes_compra').add(sc);
  }

  // Materiais críticos (movimentacoes_estoque e estoque_movimentos)
  const materiais = [
    { empresaId, nome: 'Aço Inox', saldoDisponivel: 2, minimo: 5, isDeleted: false },
    { empresaId, nome: 'Alumínio', saldoDisponivel: 10, minimo: 5, isDeleted: false },
    { empresaId, nome: 'Parafuso', saldoDisponivel: 0, minimo: 1, isDeleted: false },
  ];
  for (const mat of materiais) {
    await db.collection('movimentacoes_estoque').add(mat);
    await db.collection('estoque_movimentos').add(mat);
  }

  // Compras pendentes (coleção correta)
  const compras = [
    { empresaId, status: 'PENDENTE', descricao: 'Compra aço', valor: 800, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), isDeleted: false, data: Timestamp.fromDate(now) },
    { empresaId, status: 'AGUARDANDO_APROVACAO', descricao: 'Compra alumínio', valor: 1200, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), isDeleted: false, data: Timestamp.fromDate(now) },
    { empresaId, status: 'CONCLUIDA', descricao: 'Compra concluída', valor: 500, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), isDeleted: false, data: Timestamp.fromDate(now) },
  ];
  for (const compra of compras) {
    await db.collection('compras').add(compra);
  }

  console.log('População de dados de teste do dashboard concluída!');
}

popularDashboardMock().catch(console.error);
