import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({ credential: applicationDefault() });
const auth = getAuth(app);
const db = getFirestore(app);

const rolesPermissions = {
  Administrador: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: true, edit: true, delete: true },
    produtos: { view: true, create: true, edit: true, delete: true },
    catalogo: { view: true, create: true, edit: true, delete: true },
    estoque: { view: true, create: true, edit: true, delete: true },
    orcamentos: { view: true, create: true, edit: true, delete: true },
    ordens: { view: true, create: true, edit: true, delete: true },
    compras: { view: true, create: true, edit: true, delete: true },
    producao: { view: true, create: true, edit: true, delete: true },
    calculadora: { view: true, create: true, edit: true, delete: true },
    auditoria: { view: true, create: false, edit: false, delete: true },
    usuarios: { view: true, create: true, edit: true, delete: true },
    configuracoes: { view: true, create: false, edit: true, delete: false },
    chat: { view: true, create: true, edit: true, delete: true },
    anuncios: { view: true, create: true, edit: true, delete: true },
  },
  Dono: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: true, edit: true, delete: true },
    produtos: { view: true, create: true, edit: true, delete: true },
    catalogo: { view: true, create: true, edit: true, delete: true },
    estoque: { view: true, create: true, edit: true, delete: true },
    orcamentos: { view: true, create: true, edit: true, delete: true },
    ordens: { view: true, create: true, edit: true, delete: true },
    compras: { view: true, create: true, edit: true, delete: true },
    producao: { view: true, create: true, edit: true, delete: true },
    calculadora: { view: true, create: true, edit: true, delete: true },
    auditoria: { view: true, create: false, edit: false, delete: true },
    usuarios: { view: true, create: true, edit: true, delete: true },
    configuracoes: { view: true, create: true, edit: true, delete: true },
    chat: { view: true, create: true, edit: true, delete: true },
    anuncios: { view: true, create: true, edit: true, delete: true },
  },
  Vendedor: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: true, edit: true, delete: false },
    produtos: { view: true, create: false, edit: false, delete: false },
    catalogo: { view: true, create: false, edit: false, delete: false },
    estoque: { view: true, create: false, edit: false, delete: false },
    orcamentos: { view: true, create: true, edit: true, delete: false },
    ordens: { view: true, create: false, edit: false, delete: false },
    compras: { view: false, create: false, edit: false, delete: false },
    producao: { view: true, create: false, edit: false, delete: false },
    calculadora: { view: true, create: true, edit: true, delete: false },
    auditoria: { view: false, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    configuracoes: { view: false, create: false, edit: false, delete: false },
    chat: { view: true, create: true, edit: true, delete: false },
    anuncios: { view: false, create: false, edit: false, delete: false },
  },
  Producao: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: false, edit: false, delete: false },
    produtos: { view: true, create: false, edit: false, delete: false },
    catalogo: { view: true, create: false, edit: false, delete: false },
    estoque: { view: true, create: true, edit: true, delete: false },
    orcamentos: { view: false, create: false, edit: false, delete: false },
    ordens: { view: true, create: false, edit: true, delete: false },
    compras: { view: true, create: true, edit: false, delete: false },
    producao: { view: true, create: true, edit: true, delete: false },
    calculadora: { view: false, create: false, edit: false, delete: false },
    auditoria: { view: false, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    configuracoes: { view: true, create: false, edit: false, delete: false },
    chat: { view: true, create: true, edit: true, delete: false },
    anuncios: { view: true, create: false, edit: false, delete: false },
  },
  Compras: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: false, edit: false, delete: false },
    produtos: { view: true, create: false, edit: false, delete: false },
    catalogo: { view: true, create: false, edit: false, delete: false },
    estoque: { view: true, create: true, edit: true, delete: false },
    orcamentos: { view: false, create: false, edit: false, delete: false },
    ordens: { view: true, create: false, edit: false, delete: false },
    compras: { view: true, create: true, edit: true, delete: false },
    producao: { view: true, create: false, edit: false, delete: false },
    calculadora: { view: false, create: false, edit: false, delete: false },
    auditoria: { view: true, create: false, edit: false, delete: false },
    usuarios: { view: false, create: false, edit: false, delete: false },
    configuracoes: { view: false, create: false, edit: false, delete: false },
    chat: { view: false, create: false, edit: false, delete: false },
    anuncios: { view: false, create: false, edit: false, delete: false },
  },
  Gerencia: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    clientes: { view: true, create: false, edit: false, delete: false },
    produtos: { view: true, create: false, edit: false, delete: false },
    catalogo: { view: true, create: false, edit: false, delete: false },
    estoque: { view: true, create: false, edit: false, delete: false },
    orcamentos: { view: true, create: false, edit: true, delete: false },
    ordens: { view: true, create: false, edit: true, delete: false },
    compras: { view: true, create: false, edit: true, delete: false },
    producao: { view: true, create: false, edit: true, delete: false },
    calculadora: { view: true, create: false, edit: false, delete: false },
    auditoria: { view: true, create: false, edit: false, delete: false },
    usuarios: { view: true, create: false, edit: false, delete: false },
    configuracoes: { view: true, create: false, edit: false, delete: false },
    chat: { view: false, create: false, edit: false, delete: false },
    anuncios: { view: false, create: false, edit: false, delete: false },
  },
} as const;

const usersToCreate = [
  { email: 'admin@inoxval.com', nome: 'Admin Inox', role: 'Administrador' },
  { email: 'dono@inoxval.com', nome: 'Dono Inox', role: 'Dono' },
  { email: 'vendedor@inoxval.com', nome: 'Vendedor Inox', role: 'Vendedor' },
  { email: 'producao@inoxval.com', nome: 'Produ????o Inox', role: 'Producao' },
  { email: 'compras@inoxval.com', nome: 'Compras Inox', role: 'Compras' },
  { email: 'gerencia@inoxval.com', nome: 'Ger??ncia Inox', role: 'Gerencia' },
];

async function ensureAuthUser(email: string, nome: string, password: string) {
  try {
    return await auth.getUserByEmail(email);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return await auth.createUser({ email, password, displayName: nome });
    }
    throw error;
  }
}

async function seed() {
  const seedPassword = process.env.SEED_DEFAULT_PASSWORD || 'Inox123!';

  const adminAuthUser = await ensureAuthUser(
    usersToCreate[0].email,
    usersToCreate[0].nome,
    seedPassword
  );

  const empresaId =
    process.env.SEED_EMPRESA_ID ||
    process.env.VITE_DEFAULT_EMPRESA_ID ||
    adminAuthUser.uid;

  // Permiss??es por fun????o
  for (const [role, permissions] of Object.entries(rolesPermissions)) {
    await db.collection('permissoes_roles').doc(role).set(
      {
        role,
        permissions,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  // Usu??rios
  for (const user of usersToCreate) {
    const authUser = await ensureAuthUser(user.email, user.nome, seedPassword);
    await db.collection('users').doc(authUser.uid).set(
      {
        id: authUser.uid,
        empresaId,
        email: user.email,
        nome: user.nome,
        role: user.role,
        ativo: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: adminAuthUser.uid,
        updatedBy: adminAuthUser.uid,
        isDeleted: false,
      },
      { merge: true }
    );
  }

  // Clientes
  const clientesSeed = Array.from({ length: 5 }).map((_, index) => ({
    nome: `Cliente Exemplo ${index + 1}`,
    cnpj: `00000000000${index + 1}`.padEnd(14, '0'),
    email: `cliente${index + 1}@exemplo.com`,
    telefone: `1190000000${index + 1}`,
    endereco: `Rua ${index + 1}, 100`,
    cidade: 'S??o Paulo',
    estado: 'SP',
    cep: '01000-000',
    status: 'Ativo',
    totalCompras: 0,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    empresaId,
  }));

  for (const cliente of clientesSeed) {
    await db.collection('clientes').add({
      ...cliente,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: adminAuthUser.uid,
      updatedBy: adminAuthUser.uid,
      isDeleted: false,
    });
  }

  // Produtos
  const produtosSeed = Array.from({ length: 5 }).map((_, index) => ({
    codigo: `PRD-${index + 1}`,
    nome: `Produto Exemplo ${index + 1}`,
    descricao: 'Produto de exemplo',
    tipo: 'Acabado',
    unidade: 'UN',
    preco: 100 + index * 10,
    custo: 70 + index * 5,
    estoque: 0,
    estoqueMinimo: 5,
    ativo: true,
    observacoes: '',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  }));

  for (const produto of produtosSeed) {
    await db.collection('produtos').add({
      ...produto,
      empresaId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: adminAuthUser.uid,
      updatedBy: adminAuthUser.uid,
      isDeleted: false,
    });
  }

  console.log('Seed conclu??do com sucesso.');
  console.log(`Empresa ID: ${empresaId}`);
  console.log(`Senha padr??o: ${seedPassword}`);
}

seed().catch((error) => {
  console.error('Erro ao executar seed:', error);
  process.exit(1);
});
