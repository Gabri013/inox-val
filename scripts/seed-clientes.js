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

function buildClientes(count = 12) {
  return Array.from({ length: count }, (_, i) => ({
    empresaId: EMPRESA_ID,
    nome: `Cliente Seed ${i + 1}`,
    cnpj: `${10000000000000 + i}`,
    email: `cliente${i + 1}@seed.com`,
    telefone: `1199${String(1000000 + i).slice(1)}`,
    endereco: `Rua Seed, ${i + 1}`,
    cidade: "São Paulo",
    estado: "SP",
    cep: "01000-000",
    status: i % 5 === 0 ? "Inativo" : "Ativo",
    totalCompras: (i + 1) * 1500,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: "seed-script",
    updatedBy: "seed-script",
    isDeleted: false,
  }));
}

async function seedClientes() {
  const clientes = buildClientes();
  for (const cliente of clientes) {
    await db.collection("clientes").add(cliente);
  }
  console.log(`OK: clientes -> ${clientes.length} docs (empresaId=${EMPRESA_ID})`);
}

seedClientes().catch((err) => {
  console.error("Erro ao seedar clientes:", err);
  process.exit(1);
});
