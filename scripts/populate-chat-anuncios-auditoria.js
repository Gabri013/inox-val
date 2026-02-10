/**
 * Seed específico: Chat, Anúncios, Usuários e Auditoria
 *
 * Uso:
 *   SEED_EMPRESA_ID=tenant-demo-001 node scripts/populate-chat-anuncios-auditoria.js
 */

import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const QUIET = process.env.SEED_QUIET === "true";
const log = (...args) => {
  if (!QUIET) console.log(...args);
};
const info = (...args) => {
  if (!QUIET) console.info(...args);
};
const warn = (...args) => console.warn(...args);
const logError = (...args) => console.error(...args);

const serviceAccount = JSON.parse(
  readFileSync(new URL("../.secrets/serviceAccountKey.json", import.meta.url))
);

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const EMPRESA_ID = process.env.SEED_EMPRESA_ID || "tenant-demo-001";
const TARGET_USER_ID = process.env.SEED_USER_ID || "";
const serverTimestamp = () => FieldValue.serverTimestamp();

const usersSeed = [
  {
    id: "seed-admin",
    nome: "Administrador Geral",
    email: "admin.seed@inoxval.com.br",
    role: "ADMIN",
    departamento: "Administração",
    ativo: true,
    status: "ativo",
  },
  {
    id: "seed-engenharia",
    nome: "João Engenharia",
    email: "engenharia.seed@inoxval.com.br",
    role: "ENGENHEIRO",
    departamento: "Engenharia",
    ativo: true,
    status: "ativo",
  },
  {
    id: "seed-producao",
    nome: "Maria Produção",
    email: "producao.seed@inoxval.com.br",
    role: "OPERADOR",
    departamento: "Produção",
    ativo: true,
    status: "ativo",
  },
  {
    id: "seed-comercial",
    nome: "Carlos Comercial",
    email: "comercial.seed@inoxval.com.br",
    role: "VENDEDOR",
    departamento: "Comercial",
    ativo: true,
    status: "ativo",
  },
  {
    id: "seed-compras",
    nome: "Ana Compras",
    email: "compras.seed@inoxval.com.br",
    role: "COMPRADOR",
    departamento: "Compras",
    ativo: true,
    status: "ativo",
  },
];

const anunciosSeed = (autorId, autorNome) => [
  {
    titulo: "Manutenção Programada do Sistema",
    mensagem:
      "O sistema passará por manutenção no próximo sábado (15/02) das 8h às 12h. Durante este período, o acesso ao ERP estará indisponível.",
    tipo: "manutencao",
    status: "ativo",
    autorId,
    autorNome,
    destinatarios: "todos",
    dataInicio: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    dataFim: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
    criadoEm: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  },
  {
    titulo: "Nova Funcionalidade: Chat Interno",
    mensagem:
      "Agora você pode se comunicar em tempo real com seus colegas através do Chat Interno! Acesse o menu lateral e clique em “Chat”.",
    tipo: "info",
    status: "ativo",
    autorId,
    autorNome,
    destinatarios: "todos",
    criadoEm: new Date(Date.now() - 24 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    titulo: "Atualização de Preços de Matéria-Prima",
    mensagem:
      "Equipe Comercial: os preços de tubos e chapas de inox foram atualizados. Revisem os orçamentos pendentes antes de enviar aos clientes.",
    tipo: "alerta",
    status: "ativo",
    autorId,
    autorNome,
    destinatarios: "role",
    roleAlvo: "Comercial",
    criadoEm: new Date(Date.now() - 6 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    titulo: "URGENTE: Falta de Material no Estoque",
    mensagem:
      "Produção está parada por falta de tubo 25x25mm. Compras, priorizar pedido imediato. Prazo máximo: hoje às 17h.",
    tipo: "urgente",
    status: "ativo",
    autorId,
    autorNome,
    destinatarios: "departamento",
    departamentoAlvo: "Compras",
    criadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
    atualizadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

async function getUsersByEmpresa() {
  const snap = await db
    .collection("users")
    .where("empresaId", "==", EMPRESA_ID)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function ensureSeedUsers() {
  const existing = await getUsersByEmpresa();
  if (existing.length > 0) {
    info(`✅ Usuários existentes encontrados: ${existing.length}`);
    await Promise.all(
      existing.map((user) =>
        db.collection("users").doc(user.id).set(
          {
            isDeleted: user.isDeleted ?? false,
            ativo: user.ativo ?? true,
            status: user.status ?? "ativo",
            updatedAt: serverTimestamp(),
            updatedBy: "seed-script",
          },
          { merge: true }
        )
      )
    );
    if (existing.length >= 2) {
      return existing;
    }
  }

  info("👥 Nenhum usuário encontrado. Criando usuários seed...");
  const created = [...existing];
  for (const user of usersSeed) {
    const payload = {
      nome: user.nome,
      email: user.email.toLowerCase(),
      role: user.role,
      departamento: user.departamento,
      ativo: user.ativo,
      status: user.status,
      empresaId: EMPRESA_ID,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: "seed-script",
      updatedBy: "seed-script",
    };
    if (created.find((u) => u.id === user.id)) {
      continue;
    }
    await db.collection("users").doc(user.id).set({ ...payload, isDeleted: false });
    await db.collection("usuarios").doc(user.id).set({ ...payload, isDeleted: false });
    created.push({ id: user.id, ...payload });
    if (created.length >= 2) break;
  }
  info(`✅ ${created.length} usuários seed criados`);
  return created;
}

async function ensureChatUsuarios(users) {
  const snap = await db
    .collection("chat_usuarios")
    .where("empresaId", "==", EMPRESA_ID)
    .get();
  const existing = new Set(snap.docs.map((d) => d.id));

  info("💬 Garantindo chat_usuarios...");
  await Promise.all(
    users.map((user, index) => {
      if (existing.has(user.id)) {
        return db.collection("chat_usuarios").doc(user.id).set(
          {
            updatedAt: serverTimestamp(),
            updatedBy: "seed-script",
          },
          { merge: true }
        );
      }
      const status = index === 0 ? "online" : index % 3 === 0 ? "ausente" : "offline";
      const ultimaAtividade =
        status === "offline"
          ? new Date(Date.now() - 2 * 3600000).toISOString()
          : new Date().toISOString();

      return db.collection("chat_usuarios").doc(user.id).set({
        nome: user.nome || user.displayName || "Usuário",
        email: user.email || "",
        departamento: user.departamento || user.role || "Geral",
        status,
        ultimaAtividade,
        empresaId: EMPRESA_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: "seed-script",
        updatedBy: "seed-script",
      });
    })
  );
  info(`✅ chat_usuarios garantido para ${users.length} usuários`);
}

async function ensureConversasEMensagens(users) {
  const snap = await db
    .collection("conversas")
    .where("empresaId", "==", EMPRESA_ID)
    .get();
  if (!snap.empty) {
    info(`✅ conversas já possui ${snap.size} registros`);
    return;
  }

  if (users.length < 2) {
    warn("⚠️ Poucos usuários para criar conversas.");
    return;
  }

  info("💬 Criando conversas e mensagens...");
  const baseUser =
    (TARGET_USER_ID && users.find((u) => u.id === TARGET_USER_ID)) || users[0];
  const outros = users
    .filter((u) => u.id !== baseUser.id)
    .slice(0, Math.min(users.length - 1, 3));
  const conversasCriadas = [];

  for (const user of outros) {
    const conversaRef = await db.collection("conversas").add({
      empresaId: EMPRESA_ID,
      participantes: [baseUser.id, user.id],
      mensagensNaoLidas: 1,
      criadoEm: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
      atualizadoEm: new Date(Date.now() - 30 * 60000).toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: "seed-script",
      updatedBy: "seed-script",
    });
    conversasCriadas.push({ id: conversaRef.id, participante: user });

    const mensagens = [
      {
        remetenteId: user.id,
        conteudo: `Olá ${baseUser.nome || "admin"}, preciso de ajuda em ${user.departamento || "setor"}.`,
        tipo: "text",
        lida: true,
        criadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        remetenteId: baseUser.id,
        conteudo: "Claro! Me traga os detalhes que eu ajudo.",
        tipo: "text",
        lida: true,
        criadoEm: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        remetenteId: user.id,
        conteudo: "Vou enviar agora. Obrigado!",
        tipo: "text",
        lida: false,
        criadoEm: new Date(Date.now() - 15 * 60000).toISOString(),
      },
    ];

    for (const msg of mensagens) {
      await db.collection("mensagens").add({
        empresaId: EMPRESA_ID,
        conversaId: conversaRef.id,
        ...msg,
        atualizadoEm: msg.criadoEm,
        createdAt: serverTimestamp(),
        createdBy: msg.remetenteId,
      });
    }
  }

  info(`✅ ${conversasCriadas.length} conversas criadas`);
}

async function ensureAnuncios(users) {
  const snap = await db
    .collection("anuncios")
    .where("empresaId", "==", EMPRESA_ID)
    .get();
  if (!snap.empty) {
    info(`✅ anúncios já possui ${snap.size} registros`);
    await Promise.all(
      snap.docs.map((docSnap) =>
        docSnap.ref.set(
          {
            isDeleted: docSnap.data().isDeleted ?? false,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      )
    );
    return;
  }

  const autor = users[0] || { id: "seed-admin", nome: "Administrador" };
  const payloads = anunciosSeed(autor.id, autor.nome || "Administrador");

  info("📣 Criando anúncios...");
  for (const anuncio of payloads) {
    await db.collection("anuncios").add({
      ...anuncio,
      empresaId: EMPRESA_ID,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: autor.id,
      updatedBy: autor.id,
    });
  }
  info(`✅ ${payloads.length} anúncios criados`);
}

async function ensureAuditLogs(users) {
  const snap = await db
    .collection("audit_logs")
    .where("empresaId", "==", EMPRESA_ID)
    .get();
  if (!snap.empty) {
    info(`✅ audit_logs já possui ${snap.size} registros`);
    return;
  }

  const user = users[0] || { id: "seed-admin", nome: "Administrador", role: "ADMIN" };
  const now = Date.now();

  const logs = [
    {
      action: "create",
      collection: "clientes",
      documentId: "CLI-001",
      before: null,
      after: { nome: "Cliente Demo" },
    },
    {
      action: "update",
      collection: "produtos",
      documentId: "PROD-001",
      before: { nome: "Bancada Inox" },
      after: { nome: "Bancada Inox 304" },
    },
    {
      action: "create",
      collection: "estoque_itens",
      documentId: "EST-001",
      before: null,
      after: { materialNome: "Chapa Inox 1.5mm", saldo: 20 },
    },
    {
      action: "update",
      collection: "orcamentos",
      documentId: "ORC-2026-001",
      before: { status: "Rascunho" },
      after: { status: "Aprovado" },
    },
    {
      action: "create",
      collection: "ordens_producao",
      documentId: "OP-2026-001",
      before: null,
      after: { status: "Em Produção" },
    },
    {
      action: "update",
      collection: "compras",
      documentId: "CMP-2026-003",
      before: { status: "Solicitada" },
      after: { status: "Aprovada" },
    },
  ];

  info("🛡️ Criando logs de auditoria...");
  for (let i = 0; i < logs.length; i += 1) {
    const logItem = logs[i];
    const statusBefore = logItem.before?.status ?? null;
    const statusAfter = logItem.after?.status ?? null;
    const changes = statusBefore !== null || statusAfter !== null ? { status: { before: statusBefore, after: statusAfter } } : {};
    await db.collection("audit_logs").add({
      ...logItem,
      empresaId: EMPRESA_ID,
      userId: user.id,
      userName: user.nome || "Administrador",
      userRole: user.role || "ADMIN",
      timestamp: FieldValue.serverTimestamp(),
      changes,
      createdAt: new Date(now - i * 60000).toISOString(),
    });
  }

  info(`✅ ${logs.length} logs de auditoria criados`);
}

async function run() {
  try {
    log("╔══════════════════════════════════════════════╗");
    log("║  Seed: Chat, Anúncios, Usuários e Auditoria  ║");
    log("╚══════════════════════════════════════════════╝");

    const users = await ensureSeedUsers();
    await ensureChatUsuarios(users);
    await ensureConversasEMensagens(users);
    await ensureAnuncios(users);
    await ensureAuditLogs(users);

    info("✅ Seed concluído com sucesso.");
  } catch (error) {
    logError("❌ Erro no seed:", error);
    process.exitCode = 1;
  }
}

run();
