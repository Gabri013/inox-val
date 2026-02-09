import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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
const EMPRESA_ID = 'empresa-demo-001';
const serverTimestamp = () => FieldValue.serverTimestamp();

function gerarArray(qtd, fn) {
  return Array.from({ length: qtd }, (_, i) => fn(i));
}

async function popularColecao(nome, arr) {
  for (const doc of arr) {
    await db.collection(nome).add(doc);
  }
  console.log(`Coleção ${nome} populada com ${arr.length} docs.`);
}

async function main() {
    // Movimentações de Estoque (para dashboard de materiais críticos)

    async function main() {
      // Clientes
      const clientes = gerarArray(50, i => ({
        empresaId: EMPRESA_ID,
        nome: `Cliente Teste ${i+1}`,
        cnpj: `${10000000000000 + i}`,
        email: `cliente${i+1}@teste.com`,
        telefone: `1199${String(1000000 + i).slice(1)}`,
        cidade: 'São Paulo',
        estado: 'SP',
        endereco: `Rua Teste, ${i+1}`,
        cep: '01234-567',
        status: 'Ativo',
        totalCompras: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }));
      await popularColecao('clientes', clientes);

      // Materiais reais (chapas, tubos, parafusos...)
      const materiais = [
        {
          empresaId: EMPRESA_ID,
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
          estoqueAtual: 2,
          ativo: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          empresaId: EMPRESA_ID,
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
          estoqueAtual: 3,
          ativo: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          empresaId: EMPRESA_ID,
          codigo: 'PARAFUSO-INOX-M8',
          nome: 'Parafuso Inox M8x20',
          tipo: 'Acessorio',
          unidade: 'UN',
          precoCusto: 0.50,
          precoVenda: 1.00,
          margemLucro: 100,
          estoqueMinimo: 500,
          estoqueAtual: 0,
          ativo: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        // Adicione mais materiais reais se quiser...
      ];
      await popularColecao('materiais', materiais);

      // Movimentações de Estoque (para dashboard de materiais críticos)
      const movimentacoesEstoque = [
        {
          empresaId: EMPRESA_ID,
          materialCodigo: 'CHAPA-INOX-304-1.5',
          nome: 'Chapa Inox 304 - 1.5mm',
          tipo: 'Chapa',
          saldoDisponivel: 2,
          minimo: 5,
          unidade: 'M2',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          empresaId: EMPRESA_ID,
          materialCodigo: 'CHAPA-INOX-304-2.0',
          nome: 'Chapa Inox 304 - 2.0mm',
          tipo: 'Chapa',
          saldoDisponivel: 3,
          minimo: 5,
          unidade: 'M2',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          empresaId: EMPRESA_ID,
          materialCodigo: 'PARAFUSO-INOX-M8',
          nome: 'Parafuso Inox M8x20',
          tipo: 'Acessorio',
          saldoDisponivel: 0,
          minimo: 1,
          unidade: 'UN',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      ];
      await popularColecao('movimentacoes_estoque', movimentacoesEstoque);

      // Produtos
      const produtos = gerarArray(50, i => ({
        empresaId: EMPRESA_ID,
        codigo: `PRD-${i+1}`,
        nome: `Produto Teste ${i+1}`,
        descricao: `Descrição do produto teste ${i+1}`,
        tipo: 'Produto',
        unidade: 'UN',
        preco: 1000 + i * 10,
        custo: 700 + i * 10,
        estoque: 5 + i,
        estoqueMinimo: 2,
        ativo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }));
      await popularColecao('produtos', produtos);

      // Orçamentos
      const orcamentos = gerarArray(50, i => ({
        empresaId: EMPRESA_ID,
        numero: `ORC-2026-${i+1}`,
        clienteId: clientes[i % clientes.length]?.id || 'cliente-temp',
        clienteNome: clientes[i % clientes.length]?.nome || 'Cliente Seed',
        data: new Date().toISOString(),
        validade: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        status: 'Aprovado',
        itens: [],
        subtotal: 1000 + i * 10,
        desconto: 0,
        descontoPercentual: 0,
        total: 1000 + i * 10,
        observacoes: 'Orçamento mock',
        condicoesPagamento: '50% entrada, 50% na entrega',
        prazoEntrega: '15 dias úteis',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        aprovadoEm: serverTimestamp(),
      }));
      await popularColecao('orcamentos', orcamentos);

      // Compras
      const compras = gerarArray(50, i => ({
        empresaId: EMPRESA_ID,
        numero: `CMP-2026-${i+1}`,
        data: new Date().toISOString(),
        status: i % 3 === 0 ? 'PENDENTE' : (i % 3 === 1 ? 'AGUARDANDO_APROVACAO' : 'CONCLUIDA'),
        fornecedorNome: `Fornecedor ${i+1}`,
        itens: [],
        total: 500 + i * 10,
        justificativa: 'Compra mock',
        observacoes: 'Compra criada pelo seed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isDeleted: false,
      }));
      await popularColecao('compras', compras);

      // Ordens de produção
      const ordens = gerarArray(50, i => ({
        empresaId: EMPRESA_ID,
        numero: `OP-2026-${i+1}`,
        orcamentoId: orcamentos[i % orcamentos.length]?.id || 'orcamento-temp',
        orcamentoNumero: orcamentos[i % orcamentos.length]?.numero || 'ORC-temp',
        clienteId: clientes[i % clientes.length]?.id || 'cliente-temp',
        clienteNome: clientes[i % clientes.length]?.nome || 'Cliente Seed',
        status: i % 4 === 0 ? 'Aberta' : (i % 4 === 1 ? 'Em Produção' : (i % 4 === 2 ? 'Pausada' : 'Concluída')),
        dataAbertura: new Date().toISOString(),
        prioridade: 'Normal',
        prazoEntrega: new Date(Date.now() + 15*24*60*60*1000).toISOString(),
        itens: [],
        observacoes: 'Ordem mock',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }));
      await popularColecao('ordens_producao', ordens);

      console.log('População massiva concluída!');
    }
    }
