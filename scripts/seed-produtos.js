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

const tipos = ["Acabado", "Semiacabado", "Matéria-Prima", "Componente"];
const unidades = ["UN", "KG", "MT", "M2", "M3", "LT"];

function buildProdutos(count = 12) {
  return Array.from({ length: count }, (_, i) => ({
    empresaId: EMPRESA_ID,
    codigo: `PRD-${String(i + 1).padStart(3, "0")}`,
    nome: `Produto Seed ${i + 1}`,
    descricao: `Descrição do produto seed ${i + 1}`,
    tipo: tipos[i % tipos.length],
    unidade: unidades[i % unidades.length],
    preco: 100 + i * 25,
    custo: 60 + i * 15,
    estoque: 5 + i,
    estoqueMinimo: 5,
    ativo: i % 7 !== 0,
    observacoes: "",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: "seed-script",
    updatedBy: "seed-script",
    isDeleted: false,
  }));
}

async function seedProdutos() {
  const produtos = buildProdutos();
  for (const produto of produtos) {
    await db.collection("produtos").add(produto);
  }
  console.log(`OK: produtos -> ${produtos.length} docs (empresaId=${EMPRESA_ID})`);
}

seedProdutos().catch((err) => {
  console.error("Erro ao seedar produtos:", err);
  process.exit(1);
});
