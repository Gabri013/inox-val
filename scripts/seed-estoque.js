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

const serverTimestamp = () => FieldValue.serverTimestamp();

async function getProdutos() {
  const snap = await db.collection("produtos").where("empresaId", "==", EMPRESA_ID).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function hasEstoqueItem(produtoId) {
  const snap = await db
    .collection("estoque_itens")
    .where("empresaId", "==", EMPRESA_ID)
    .where("produtoId", "==", produtoId)
    .limit(1)
    .get();
  return !snap.empty;
}

async function seedEstoque() {
  const produtos = await getProdutos();
  if (produtos.length === 0) {
    console.log("Nenhum produto encontrado. Rode o seed de produtos primeiro.");
    return;
  }

  let created = 0;
  let movimentos = 0;

  for (let i = 0; i < produtos.length; i += 1) {
    const produto = produtos[i];
    const exists = await hasEstoqueItem(produto.id);
    if (exists) continue;

    const saldo = Number.isFinite(produto.estoque) ? produto.estoque : 5 + i;
    const estoqueMinimo = Number.isFinite(produto.estoqueMinimo) ? produto.estoqueMinimo : 5;

    await db.collection("estoque_itens").add({
      empresaId: EMPRESA_ID,
      produtoId: produto.id,
      produtoNome: produto.nome,
      produtoCodigo: produto.codigo,
      saldo,
      saldoDisponivel: saldo,
      saldoReservado: 0,
      estoqueMinimo,
      unidade: produto.unidade || "UN",
      ultimaMovimentacao: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: "seed-script",
      updatedBy: "seed-script",
      isDeleted: false,
    });
    created += 1;

    await db.collection("estoque_movimentos").add({
      empresaId: EMPRESA_ID,
      produtoId: produto.id,
      produtoNome: produto.nome,
      produtoCodigo: produto.codigo,
      tipo: "ENTRADA",
      quantidade: saldo,
      saldoAnterior: 0,
      saldoNovo: saldo,
      origem: "Seed inicial",
      observacoes: "Seed estoque",
      usuario: "seed-script",
      data: new Date().toISOString(),
      criadoEm: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: "seed-script",
      updatedBy: "seed-script",
      isDeleted: false,
    });
    movimentos += 1;
  }

  console.log(
    `OK: estoque_itens -> ${created} novos docs, estoque_movimentos -> ${movimentos} docs (empresaId=${EMPRESA_ID})`
  );
}

seedEstoque().catch((err) => {
  console.error("Erro ao seedar estoque:", err);
  process.exit(1);
});
