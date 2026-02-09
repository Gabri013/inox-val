import fs from "fs";
import path from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Resolve __dirname for ESM on Windows
let __filename = new URL(import.meta.url).pathname;
if (process.platform === "win32" && __filename.startsWith("/")) {
  __filename = __filename.slice(1);
}
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, "../.secrets/serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error("Service account not found at .secrets/serviceAccountKey.json");
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const EMPRESA_ID =
  process.env.SEED_EMPRESA_ID ||
  process.env.VITE_DEFAULT_EMPRESA_ID ||
  "tenant-demo-001";

const now = new Date();
const serverTimestamp = () => FieldValue.serverTimestamp();

function monthsAgo(date, months) {
  return new Date(date.getFullYear(), date.getMonth() - months, date.getDate());
}

function buildOrdens() {
  const base = [
    { status: "Em Produção", progresso: 35 },
    { status: "Em Produção", progresso: 62 },
    { status: "Pendente", progresso: 0 },
    { status: "Pausada", progresso: 40 },
  ];

  const concluidas = Array.from({ length: 6 }, (_, i) => {
    const dataConclusao = monthsAgo(now, i);
    return {
      status: "Concluída",
      progresso: 100,
      dataConclusao: dataConclusao.toISOString(),
      total: 2500 + i * 400,
    };
  });

  return [...base, ...concluidas].map((o, i) => ({
    empresaId: EMPRESA_ID,
    numero: `OP-DASH-${now.getFullYear()}-${String(i + 1).padStart(3, "0")}`,
    clienteId: `cliente-${i + 1}`,
    clienteNome: `Cliente ${i + 1}`,
    status: o.status,
    dataAbertura: monthsAgo(now, Math.min(i, 3)).toISOString(),
    dataPrevisao: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    dataConclusao: o.dataConclusao ?? null,
    total: o.total ?? 1200 + i * 150,
    prioridade: "Normal",
    itens: [],
    materiaisReservados: false,
    materiaisConsumidos: false,
    progresso: o.progresso,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

function buildEstoqueItens() {
  return [
    {
      produtoId: "prod-1",
      produtoNome: "Chapa Inox 304",
      produtoCodigo: "INOX-304-1.5",
      saldo: 5,
      saldoDisponivel: 2,
      saldoReservado: 3,
      estoqueMinimo: 5,
      unidade: "m2",
    },
    {
      produtoId: "prod-2",
      produtoNome: "Tubo Inox 1\"",
      produtoCodigo: "TUBO-1",
      saldo: 12,
      saldoDisponivel: 12,
      saldoReservado: 0,
      estoqueMinimo: 8,
      unidade: "m",
    },
    {
      produtoId: "prod-3",
      produtoNome: "Parafuso Inox M8",
      produtoCodigo: "PAR-M8",
      saldo: 0,
      saldoDisponivel: 0,
      saldoReservado: 0,
      estoqueMinimo: 50,
      unidade: "un",
    },
  ].map((item) => ({
    ...item,
    empresaId: EMPRESA_ID,
    ultimaMovimentacao: now.toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

function buildCompras() {
  const statuses = ["Solicitada", "Cotação", "Aprovada", "Pedido Enviado", "Recebida"];
  return statuses.map((status, i) => ({
    empresaId: EMPRESA_ID,
    numero: `CMP-DASH-${now.getFullYear()}-${String(i + 1).padStart(3, "0")}`,
    data: now.toISOString(),
    status,
    fornecedorNome: `Fornecedor ${i + 1}`,
    itens: [],
    total: 400 + i * 120,
    justificativa: "Seed dashboard",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  }));
}

async function addMany(collectionName, docs) {
  for (const doc of docs) {
    await db.collection(collectionName).add(doc);
  }
  console.log(`OK: ${collectionName} -> ${docs.length} docs`);
}

async function seedDashboard() {
  console.log(`Seeding dashboard data for empresaId=${EMPRESA_ID}`);
  await addMany("ordens_producao", buildOrdens());
  await addMany("estoque_itens", buildEstoqueItens());
  await addMany("compras", buildCompras());
  console.log("Seed finalizado.");
}

seedDashboard().catch((err) => {
  console.error("Erro ao seedar dashboard:", err);
  process.exit(1);
});
