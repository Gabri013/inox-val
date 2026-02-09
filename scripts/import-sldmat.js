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

const args = process.argv.slice(2);
const options = {
  file: "",
  dryRun: false,
  createEstoque: false,
  target: "produtos",
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--file" && args[i + 1]) {
    options.file = args[i + 1];
    i += 1;
  } else if (arg === "--dry-run") {
    options.dryRun = true;
  } else if (arg === "--estoque") {
    options.createEstoque = true;
  } else if (arg === "--target" && args[i + 1]) {
    options.target = args[i + 1];
    i += 1;
  } else if (arg === "--materiais") {
    options.target = "materiais";
  } else if (arg === "--produtos") {
    options.target = "produtos";
  } else if (arg === "--help" || arg === "-h") {
    console.log("Uso: node scripts/import-sldmat.js [--file caminho] [--dry-run] [--estoque] [--target materiais|produtos]");
    process.exit(0);
  }
}

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

const SOURCE_PATH =
  options.file ||
  path.resolve(__dirname, "../LISTA DE MATERIAL.sldmat");

const serverTimestamp = () => FieldValue.serverTimestamp();

const TIPO_MATERIA_PRIMA = "Mat\u00e9ria-Prima";
const TIPO_COMPONENTE = "Componente";
const TARGETS = new Set(["produtos", "materiais"]);

if (!TARGETS.has(options.target)) {
  throw new Error(`Target invalido: ${options.target}. Use 'produtos' ou 'materiais'.`);
}

const TARGET_COLLECTION = options.target;
const TARGET_LABEL = TARGET_COLLECTION === "materiais" ? "Materiais" : "Produtos";

const COMPONENTE_CLASSIFICACOES = new Set([
  "DIVERSOS",
  "PLASTICOS",
  "PERFIL PLASTICO",
  "FIBRA",
]);

function decodeXml(value) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function normalizeSpaces(value) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeKey(value) {
  return normalizeSpaces(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function parseAttributes(raw) {
  const attrs = {};
  raw.replace(/([A-Za-z_:\-][A-Za-z0-9_:\-\.]*)="([^"]*)"/g, (_m, key, val) => {
    attrs[key] = val;
    return "";
  });
  return attrs;
}

function resolveTipo(classificacao) {
  const key = normalizeKey(classificacao);
  if (COMPONENTE_CLASSIFICACOES.has(key)) return TIPO_COMPONENTE;
  return TIPO_MATERIA_PRIMA;
}

function resolveUnidade(classificacao) {
  const key = normalizeKey(classificacao);
  if (/(TUBO|BARRA|CANTONEIRA|PERFIL|TARUGO)/.test(key)) return "MT";
  if (/(CHAPA|INOX|ACO|ALUMINIO|LATAO|COBRE)/.test(key)) return "KG";
  return "UN";
}

function extractMaterials(xml) {
  const results = [];
  const classificationRegex = /<classification\s+name="([^"]+)">([\s\S]*?)<\/classification>/gi;
  let match;
  while ((match = classificationRegex.exec(xml))) {
    const classificacao = normalizeSpaces(decodeXml(match[1] || ""));
    if (!classificacao) continue;
    const block = match[2] || "";
    const materialRegex = /<material\b([^>]*)>/gi;
    let mat;
    while ((mat = materialRegex.exec(block))) {
      const attrs = parseAttributes(mat[1] || "");
      const materialName = normalizeSpaces(decodeXml(attrs.name || ""));
      if (!materialName) continue;
      const description = attrs.description ? normalizeSpaces(decodeXml(attrs.description)) : "";
      results.push({ classificacao, material: materialName, description });
    }
  }
  return results;
}

function buildProdutoDoc({ classificacao, material, description }) {
  const nome = normalizeSpaces(`${classificacao} - ${material}`);
  const codigo = nome;
  const tipo = resolveTipo(classificacao);
  const unidade = resolveUnidade(classificacao);
  const nowIso = new Date().toISOString();
  const descricao = description || classificacao;
  const observacoes = description
    ? `SW: ${description} | Importado do SolidWorks (.sldmat)`
    : "Importado do SolidWorks (.sldmat)";

  return {
    empresaId: EMPRESA_ID,
    codigo,
    nome,
    descricao,
    tipo,
    unidade,
    preco: 0,
    custo: 0,
    estoque: 0,
    estoqueMinimo: 0,
    ativo: true,
    observacoes,
    criadoEm: nowIso,
    atualizadoEm: nowIso,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: "import-sldmat",
    updatedBy: "import-sldmat",
    isDeleted: false,
  };
}

function buildMaterialDoc({ classificacao, material, description }) {
  const nome = normalizeSpaces(`${classificacao} - ${material}`);
  const codigo = nome;
  const tipo = resolveTipo(classificacao);
  const unidade = resolveUnidade(classificacao);
  const nowIso = new Date().toISOString();
  const descricao = description || classificacao;
  const observacoes = description
    ? `SW: ${description} | Importado do SolidWorks (.sldmat)`
    : "Importado do SolidWorks (.sldmat)";

  return {
    empresaId: EMPRESA_ID,
    codigo,
    nome,
    descricao,
    classificacao,
    tipo,
    unidade,
    custoUnitario: 0,
    estoqueMinimo: 0,
    ativo: true,
    origem: "SolidWorks",
    observacoes,
    criadoEm: nowIso,
    atualizadoEm: nowIso,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: "import-sldmat",
    updatedBy: "import-sldmat",
    isDeleted: false,
  };
}

function buildDoc(item) {
  return TARGET_COLLECTION === "materiais" ? buildMaterialDoc(item) : buildProdutoDoc(item);
}

async function loadExistingDocs() {
  const snap = await db.collection(TARGET_COLLECTION).where("empresaId", "==", EMPRESA_ID).get();
  const map = new Map();
  snap.docs.forEach((doc) => {
    const data = doc.data();
    const codigo = (data.codigo || "").toString();
    if (!codigo) return;
    map.set(codigo, { id: doc.id, ...data });
  });
  return map;
}

async function loadExistingEstoqueIds() {
  const snap = await db.collection("estoque_itens").where("empresaId", "==", EMPRESA_ID).get();
  const ids = new Set();
  snap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.produtoId) ids.add(data.produtoId);
    if (data.materialId) ids.add(data.materialId);
  });
  return ids;
}

async function commitBatches(items, buildDoc, collectionName) {
  const BATCH_LIMIT = 450;
  let batch = db.batch();
  let opCount = 0;
  let committed = 0;
  const createdRefs = [];

  for (const item of items) {
    const docRef = db.collection(collectionName).doc();
    const payload = buildDoc(item, docRef.id);
    batch.set(docRef, payload);
    createdRefs.push({ id: docRef.id, data: payload });
    opCount += 1;
    if (opCount >= BATCH_LIMIT) {
      await batch.commit();
      committed += opCount;
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
    committed += opCount;
  }

  return { committed, createdRefs };
}

async function run() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Arquivo nao encontrado: ${SOURCE_PATH}`);
  }

  const xmlRaw = fs.readFileSync(SOURCE_PATH, "utf16le");
  const xml = xmlRaw.replace(/^\uFEFF/, "");
  const materials = extractMaterials(xml);

  if (materials.length === 0) {
    console.log("Nenhum material encontrado no .sldmat.");
    return;
  }

  const seen = new Set();
  const duplicates = [];
  const desired = [];

  for (const item of materials) {
    const doc = buildDoc(item);
    if (seen.has(doc.codigo)) {
      duplicates.push(doc.codigo);
      continue;
    }
    seen.add(doc.codigo);
    desired.push(doc);
  }

  const existingMap = await loadExistingDocs();
  const toCreate = [];
  const alreadyExists = [];

  desired.forEach((doc) => {
    if (existingMap.has(doc.codigo)) {
      alreadyExists.push(doc.codigo);
      return;
    }
    toCreate.push(doc);
  });

  console.log(`Materiais no arquivo: ${materials.length}`);
  console.log(`${TARGET_LABEL} unicos: ${desired.length}`);
  console.log(`Duplicados no arquivo: ${duplicates.length}`);
  console.log(`Ja existentes no Firestore: ${alreadyExists.length}`);
  console.log(`Novos para criar: ${toCreate.length}`);

  if (options.dryRun) {
    console.log("Dry-run ativo. Nenhuma gravacao realizada.");
    console.log("Exemplos:");
    desired.slice(0, 5).forEach((p) => {
      console.log(`- ${p.codigo} (${p.tipo}, ${p.unidade})`);
    });
    return;
  }

  if (toCreate.length === 0) {
    console.log("Nada novo para criar.");
    return;
  }

  console.log(`Criando ${TARGET_LABEL.toLowerCase()}...`);
  const { committed, createdRefs } = await commitBatches(
    toCreate,
    (item) => item,
    TARGET_COLLECTION
  );
  console.log(`${TARGET_LABEL} criados: ${committed}`);

  if (options.createEstoque) {
    const estoqueExistente = await loadExistingEstoqueIds();
    const docsParaEstoque = [];

    // Mapear criados + existentes no arquivo
    const createdByCodigo = new Map();
    createdRefs.forEach((entry) => {
      createdByCodigo.set(entry.data.codigo, entry);
    });

    desired.forEach((doc) => {
      const created = createdByCodigo.get(doc.codigo);
      if (created) {
        docsParaEstoque.push({
          id: created.id,
          data: doc,
        });
        return;
      }
      const existing = existingMap.get(doc.codigo);
      if (existing) {
        docsParaEstoque.push({
          id: existing.id,
          data: existing,
        });
      }
    });

    const estoquePayloads = docsParaEstoque
      .filter((p) => !estoqueExistente.has(p.id))
      .map((p) => {
        const estoqueMinimo = Number.isFinite(p.data.estoqueMinimo) ? p.data.estoqueMinimo : 0;
        const payload = {
          empresaId: EMPRESA_ID,
          produtoId: p.id,
          produtoNome: p.data.nome,
          produtoCodigo: p.data.codigo,
          saldo: 0,
          saldoDisponivel: 0,
          saldoReservado: 0,
          estoqueMinimo,
          unidade: p.data.unidade || "UN",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: "import-sldmat",
          updatedBy: "import-sldmat",
          isDeleted: false,
        };

        if (TARGET_COLLECTION === "materiais") {
          return {
            ...payload,
            materialId: p.id,
            materialNome: p.data.nome,
            materialCodigo: p.data.codigo,
          };
        }

        return payload;
      });

    if (estoquePayloads.length > 0) {
      console.log(`Criando estoque_itens: ${estoquePayloads.length}...`);
      const estoqueResult = await commitBatches(
        estoquePayloads,
        (item) => item,
        "estoque_itens"
      );
      console.log(`Estoque_itens criados: ${estoqueResult.committed}`);
    } else {
      console.log("Nenhum estoque_item novo para criar.");
    }
  }
}

run().catch((err) => {
  console.error("Erro ao importar .sldmat:", err);
  process.exit(1);
});
