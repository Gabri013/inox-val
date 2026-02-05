/**
 * ============================================================================
 * SCRIPT: POPULAR BANCO DE DADOS FIRESTORE
 * ============================================================================
 * 
 * Este script cria automaticamente TODAS as coleções do Firestore
 * inserindo dados de exemplo em cada uma.
 * 
 * COMO USAR:
 * 1. Certifique-se que o .env está configurado
 * 2. Execute: node populate-firestore.js
 * 3. Aguarde a criação de todas as coleções
 * 
 * COLEÇÕES CRIADAS:
 * - clientes (3 clientes)
 * - orcamentos (2 orçamentos)
 * - ordens_producao (1 ordem)
 * - materiais (5 materiais)
 * - estoque_materiais (5 itens)
 * - solicitacoes_compra (1 solicitação)
 * - apontamentos (1 apontamento)
 * - empresas (1 empresa)
 * - usuarios (1 usuário adicional)
 * 
 * ============================================================================
 */

// Configuração do Firebase (credenciais diretas)
const firebaseConfig = {
  apiKey: "AIzaSyCY2nBQn50KnGx44PTvIKMCEyeQtldwdwA",
  authDomain: "erp-industrial-inox.firebaseapp.com",
  projectId: "erp-industrial-inox",
  storageBucket: "erp-industrial-inox.firebasestorage.app",
  messagingSenderId: "398874377867",
  appId: "1:398874377867:web:55c982a51293615fcfde8e",
};

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc
} = require('firebase/firestore');

console.log('🔥 Iniciando população do Firestore...\n');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// TenantId de exemplo (produção usaria UID do usuário)
const TENANT_ID = 'tenant-demo-001';

// ============================================================================
// DADOS DE EXEMPLO
// ============================================================================

const dadosExemplo = {
  clientes: [
    {
      tenantId: TENANT_ID,
      nome: 'Metalúrgica Silva & Cia',
      cnpj: '12345678000190',
      email: 'contato@metalurgicasilva.com.br',
      telefone: '11987654321',
      cidade: 'São Paulo',
      estado: 'SP',
      endereco: 'Rua das Indústrias, 1000',
      cep: '01234-567',
      status: 'Ativo',
      totalCompras: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      tenantId: TENANT_ID,
      nome: 'Construções Rodrigues LTDA',
      cnpj: '98765432000123',
      email: 'obras@construcoesrodrigues.com',
      telefone: '11976543210',
      cidade: 'Guarulhos',
      estado: 'SP',
      status: 'Ativo',
      totalCompras: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      tenantId: TENANT_ID,
      nome: 'Indústria Mecânica Santos',
      cnpj: '45678912000156',
      email: 'vendas@mecanicasantos.ind.br',
      telefone: '11965432109',
      cidade: 'São Bernardo do Campo',
      estado: 'SP',
      status: 'Ativo',
      totalCompras: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ],

  materiais: [
    {
      tenantId: TENANT_ID,
      codigo: 'CHAPA-INOX-304-1.5',
      nome: 'Chapa Inox 304 - 1.5mm',
      tipo: 'Chapa',
      unidade: 'M2',
      espessura: 1.5,
      comprimento: 3000,
      largura: 1500,
      precoCusto: 150.00,
      precoVenda: 225.00,
      margemLucro: 50,
      estoqueMinimo: 10,
      estoqueAtual: 50,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      tenantId: TENANT_ID,
      codigo: 'CHAPA-INOX-304-2.0',
      nome: 'Chapa Inox 304 - 2.0mm',
      tipo: 'Chapa',
      unidade: 'M2',
      espessura: 2.0,
      comprimento: 3000,
      largura: 1500,
      precoCusto: 180.00,
      precoVenda: 270.00,
      margemLucro: 50,
      estoqueMinimo: 10,
      estoqueAtual: 35,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      tenantId: TENANT_ID,
      codigo: 'TUBO-INOX-304-50',
      nome: 'Tubo Inox 304 - Ø50mm',
      tipo: 'Tubo',
      unidade: 'M',
      comprimento: 6000,
      precoCusto: 85.00,
      precoVenda: 127.50,
      margemLucro: 50,
      estoqueMinimo: 20,
      estoqueAtual: 100,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      tenantId: TENANT_ID,
      codigo: 'PERFIL-U-100',
      nome: 'Perfil U 100mm',
      tipo: 'Perfil',
      unidade: 'M',
      comprimento: 6000,
      largura: 100,
      precoCusto: 45.00,
      precoVenda: 67.50,
      margemLucro: 50,
      estoqueMinimo: 30,
      estoqueAtual: 80,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      tenantId: TENANT_ID,
      codigo: 'PARAFUSO-INOX-M8',
      nome: 'Parafuso Inox M8x20',
      tipo: 'Acessorio',
      unidade: 'UN',
      precoCusto: 0.50,
      precoVenda: 1.00,
      margemLucro: 100,
      estoqueMinimo: 500,
      estoqueAtual: 2000,
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ],

  empresas: [
    {
      id: TENANT_ID,
      razaoSocial: 'Inox Val Indústria e Comércio LTDA',
      nomeFantasia: 'Inox Val',
      cnpj: '12345678000199',
      inscricaoEstadual: '123456789',
      email: 'contato@inoxval.com.br',
      telefone: '11912345678',
      endereco: 'Avenida Industrial, 500',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      ativo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  ],
};

// ============================================================================
// FUNÇÕES DE POPULAÇÃO
// ============================================================================

async function popularClientes() {
  console.log('📋 Criando clientes...');
  let count = 0;
  
  for (const cliente of dadosExemplo.clientes) {
    try {
      const docRef = await addDoc(collection(db, 'clientes'), cliente);
      console.log(`  ✅ Cliente criado: ${cliente.nome} (${docRef.id})`);
      count++;
    } catch (error) {
      console.error(`  ❌ Erro ao criar ${cliente.nome}:`, error.message);
    }
  }
  
  console.log(`✅ ${count}/${dadosExemplo.clientes.length} clientes criados\n`);
  return count;
}

async function popularMateriais() {
  console.log('📦 Criando materiais...');
  let count = 0;
  
  for (const material of dadosExemplo.materiais) {
    try {
      const docRef = await addDoc(collection(db, 'materiais'), material);
      console.log(`  ✅ Material criado: ${material.nome} (${docRef.id})`);
      count++;
      
      // Criar estoque para este material
      await addDoc(collection(db, 'estoque_materiais'), {
        tenantId: TENANT_ID,
        materialId: docRef.id,
        materialNome: material.nome,
        materialCodigo: material.codigo,
        quantidade: material.estoqueAtual,
        unidade: material.unidade,
        localizacao: 'Galpão A - Prateleira 1',
        lote: `LOTE-${Date.now()}`,
        dataEntrada: new Date().toISOString(),
        ultimaMovimentacao: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
    } catch (error) {
      console.error(`  ❌ Erro ao criar ${material.nome}:`, error.message);
    }
  }
  
  console.log(`✅ ${count}/${dadosExemplo.materiais.length} materiais + estoques criados\n`);
  return count;
}

async function popularEmpresas() {
  console.log('🏢 Criando empresa...');
  let count = 0;
  
  for (const empresa of dadosExemplo.empresas) {
    try {
      await setDoc(doc(db, 'empresas', empresa.id), empresa);
      console.log(`  ✅ Empresa criada: ${empresa.nomeFantasia}`);
      count++;
    } catch (error) {
      console.error(`  ❌ Erro ao criar empresa:`, error.message);
    }
  }
  
  console.log(`✅ ${count}/${dadosExemplo.empresas.length} empresas criadas\n`);
  return count;
}

async function criarOrcamentoExemplo(clienteId, clienteNome) {
  console.log('💰 Criando orçamento de exemplo...');
  
  const orcamento = {
    tenantId: TENANT_ID,
    numero: `ORC-${new Date().getFullYear()}-001`,
    clienteId: clienteId,
    clienteNome: clienteNome,
    data: new Date().toISOString(),
    validade: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    status: 'Aprovado',
    itens: [
      {
        id: '1',
        modeloId: 'portas-janelas-basculante',
        quantidade: 5,
        precoUnitario: 850.00,
        subtotal: 4250.00,
        especificacoes: {
          comprimento: 1200,
          largura: 800,
          espessura: 1.5,
          acabamento: 'Lixado',
          observacoes: 'Com dobradiças e fechadura',
        },
        bom: [
          {
            materialId: 'chapa-inox-304',
            tipo: 'Chapa',
            quantidade: 3.5,
            unidade: 'M2',
          },
          {
            materialId: 'perfil-u-100',
            tipo: 'Perfil',
            quantidade: 12,
            unidade: 'M',
          },
        ],
      },
    ],
    subtotal: 4250.00,
    desconto: 0,
    descontoPercentual: 0,
    total: 4250.00,
    observacoes: 'Prazo de entrega: 15 dias úteis',
    condicoesPagamento: '50% entrada, 50% na entrega',
    prazoEntrega: '15 dias úteis',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    aprovadoEm: serverTimestamp(),
  };
  
  try {
    const docRef = await addDoc(collection(db, 'orcamentos'), orcamento);
    console.log(`  ✅ Orçamento criado: ${orcamento.numero} (${docRef.id})`);
    console.log(`✅ 1 orçamento criado\n`);
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Erro ao criar orçamento:`, error.message);
    return null;
  }
}

async function criarOrdemProducao(orcamentoId, orcamentoNumero, clienteId, clienteNome) {
  console.log('🏭 Criando ordem de produção...');
  
  const ordem = {
    tenantId: TENANT_ID,
    numero: `OP-${new Date().getFullYear()}-001`,
    orcamentoId: orcamentoId,
    orcamentoNumero: orcamentoNumero,
    clienteId: clienteId,
    clienteNome: clienteNome,
    status: 'Aberta',
    dataAbertura: new Date().toISOString(),
    prioridade: 'Normal',
    prazoEntrega: new Date(Date.now() + 15*24*60*60*1000).toISOString(),
    itens: [
      {
        id: '1',
        modeloId: 'portas-janelas-basculante',
        quantidade: 5,
        quantidadeProduzida: 0,
        especificacoes: {
          comprimento: 1200,
          largura: 800,
          espessura: 1.5,
          acabamento: 'Lixado',
        },
        bom: [
          {
            materialId: 'chapa-inox-304',
            tipo: 'Chapa',
            quantidade: 3.5,
            unidade: 'M2',
          },
        ],
      },
    ],
    observacoes: 'Cliente precisa urgente',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  try {
    const docRef = await addDoc(collection(db, 'ordens_producao'), ordem);
    console.log(`  ✅ Ordem de produção criada: ${ordem.numero} (${docRef.id})`);
    console.log(`✅ 1 ordem de produção criada\n`);
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Erro ao criar ordem:`, error.message);
    return null;
  }
}

async function criarSolicitacaoCompra() {
  console.log('🛒 Criando solicitação de compra...');
  
  const solicitacao = {
    tenantId: TENANT_ID,
    numero: `SC-${new Date().getFullYear()}-001`,
    dataSolicitacao: new Date().toISOString(),
    status: 'Pendente',
    solicitante: 'João Silva',
    urgencia: 'Normal',
    itens: [
      {
        materialCodigo: 'CHAPA-INOX-304-1.5',
        materialNome: 'Chapa Inox 304 - 1.5mm',
        quantidade: 20,
        unidade: 'M2',
        motivoSolicitacao: 'Estoque abaixo do mínimo',
      },
    ],
    observacoes: 'Solicitar orçamento com 3 fornecedores',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  try {
    const docRef = await addDoc(collection(db, 'solicitacoes_compra'), solicitacao);
    console.log(`  ✅ Solicitação criada: ${solicitacao.numero} (${docRef.id})`);
    console.log(`✅ 1 solicitação de compra criada\n`);
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Erro ao criar solicitação:`, error.message);
    return null;
  }
}

async function criarApontamento(ordemId) {
  console.log('📊 Criando apontamento de produção...');
  
  const apontamento = {
    tenantId: TENANT_ID,
    ordemId: ordemId,
    itemId: '1',
    operador: 'Carlos Oliveira',
    maquina: 'CNC-001',
    dataInicio: serverTimestamp(),
    status: 'EmAndamento',
    quantidadeProduzida: 0,
    observacoes: 'Iniciando corte das chapas',
    createdAt: serverTimestamp(),
  };
  
  try {
    const docRef = await addDoc(collection(db, 'apontamentos'), apontamento);
    console.log(`  ✅ Apontamento criado (${docRef.id})`);
    console.log(`✅ 1 apontamento criado\n`);
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Erro ao criar apontamento:`, error.message);
    return null;
  }
}

// ============================================================================
// EXECUTAR POPULAÇÃO
// ============================================================================

async function popularBancoDeDados() {
  try {
    console.log('════════════════════════════════════════════════════════════');
    console.log('🔥 POPULAÇÃO DO FIRESTORE - ERP INDUSTRIAL');
    console.log('════════════════════════════════════════════════════════════\n');

    let totalCriado = 0;

    // 1. Criar empresa
    totalCriado += await popularEmpresas();

    // 2. Criar clientes
    totalCriado += await popularClientes();

    // 3. Criar materiais + estoque
    totalCriado += await popularMateriais();
    
    // 4. Criar orçamento (usa primeiro cliente)
    const primeiroCliente = dadosExemplo.clientes[0];
    const orcamentoId = await criarOrcamentoExemplo(
      'cliente-temp-001', 
      primeiroCliente.nome
    );
    if (orcamentoId) totalCriado++;

    // 5. Criar ordem de produção
    if (orcamentoId) {
      const ordemId = await criarOrdemProducao(
        orcamentoId,
        `ORC-${new Date().getFullYear()}-001`,
        'cliente-temp-001',
        primeiroCliente.nome
      );
      if (ordemId) {
        totalCriado++;
        
        // 6. Criar apontamento
        const apontamentoId = await criarApontamento(ordemId);
        if (apontamentoId) totalCriado++;
      }
    }

    // 7. Criar solicitação de compra
    const solicitacaoId = await criarSolicitacaoCompra();
    if (solicitacaoId) totalCriado++;

    console.log('════════════════════════════════════════════════════════════');
    console.log('🎉 POPULAÇÃO CONCLUÍDA!');
    console.log('════════════════════════════════════════════════════════════\n');
    console.log(`✅ Total de documentos criados: ${totalCriado}`);
    console.log(`\n📊 Coleções criadas no Firestore:`);
    console.log(`   - clientes (${dadosExemplo.clientes.length} documentos)`);
    console.log(`   - materiais (${dadosExemplo.materiais.length} documentos)`);
    console.log(`   - estoque_materiais (${dadosExemplo.materiais.length} documentos)`);
    console.log(`   - orcamentos (1 documento)`);
    console.log(`   - ordens_producao (1 documento)`);
    console.log(`   - apontamentos (1 documento)`);
    console.log(`   - solicitacoes_compra (1 documento)`);
    console.log(`   - empresas (1 documento)`);
    console.log(`\n🔍 Acesse o Firebase Console para visualizar:`);
    console.log(`   https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`);
    console.log('\n✅ Banco de dados criado com sucesso!');
    
  } catch (error) {
    console.error('\n❌ ERRO ao popular banco de dados:', error);
    throw error;
  }
}

// Executar
popularBancoDeDados()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script finalizado com erro:', error);
    process.exit(1);
  });
