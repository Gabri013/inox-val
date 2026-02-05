# 🗄️ ESTRUTURA DO BANCO DE DADOS FIREBASE - ERP INDUSTRIAL

**Projeto:** erp-industrial-inox  
**Database:** Cloud Firestore  
**Data:** 05/02/2026

---

## 📊 VISÃO GERAL

O banco de dados Firestore está organizado em **coleções** (como tabelas SQL) e cada coleção contém **documentos** (como registros).

### 🎯 Coleções Principais:

1. **`clientes`** - Gestão de clientes
2. **`orcamentos`** - Orçamentos e propostas
3. **`ordens_producao`** - Ordens de produção (OPs)
4. **`materiais`** - Catálogo de materiais
5. **`estoque_materiais`** - Controle de estoque
6. **`solicitacoes_compra`** - Solicitações de compra
7. **`movimentacoes_estoque`** - Histórico de movimentações
8. **`apontamentos`** - Apontamentos de produção
9. **`usuarios`** - Dados adicionais dos usuários
10. **`empresas`** - Dados das empresas (multi-tenant)

---

## 1️⃣ COLEÇÃO: `clientes`

### Estrutura do Documento:

```typescript
{
  id: string,                    // ID único (auto-gerado)
  tenantId: string,              // Isolamento multi-tenant
  
  // Dados básicos
  nome: string,                  // Nome/Razão Social
  cnpj: string,                  // CNPJ (14 dígitos)
  email: string,                 // Email de contato
  telefone: string,              // Telefone
  
  // Endereço
  cidade: string,                // Cidade
  estado: string,                // Estado (UF)
  endereco?: string,             // Endereço completo (opcional)
  cep?: string,                  // CEP (opcional)
  
  // Status e gestão
  status: 'Ativo' | 'Inativo' | 'Bloqueado',
  motivoBloqueio?: string,       // Se bloqueado
  totalCompras: number,          // Total em compras (R$)
  
  // Auditoria
  createdAt: Timestamp,          // Data de criação
  updatedAt: Timestamp,          // Última atualização
  criadoPor?: string,            // ID do usuário criador
}
```

### Validações (Firestore Rules):
- ✅ CNPJ único por tenant
- ✅ Email único por tenant
- ✅ CNPJ deve ter 14 dígitos
- ✅ Status só pode ser: Ativo, Inativo ou Bloqueado

### Índices:
```json
{
  "fields": [
    { "fieldPath": "tenantId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "nome", "order": "ASCENDING" }
  ]
}
```

---

## 2️⃣ COLEÇÃO: `orcamentos`

### Estrutura do Documento:

```typescript
{
  id: string,                    // ID único
  tenantId: string,              // Multi-tenant
  numero: string,                // ORÇ-2024-001
  
  // Cliente
  clienteId: string,             // Referência ao cliente
  clienteNome: string,           // Nome do cliente (desnormalizado)
  
  // Dados do orçamento
  data: string,                  // Data (ISO 8601)
  validade: string,              // Data de validade
  status: 'Rascunho' | 'Enviado' | 'Aprovado' | 'Rejeitado' | 'Convertido',
  
  // Itens
  itens: Array<{
    id: string,
    modeloId: string,            // ID do modelo (MODELOS_REGISTRY)
    quantidade: number,
    precoUnitario: number,
    subtotal: number,
    
    // Especificações técnicas
    especificacoes: {
      comprimento: number,
      largura: number,
      espessura: number,
      acabamento: string,
      observacoes?: string,
    },
    
    // BOM (Bill of Materials) - Lista de materiais
    bom: Array<{
      materialId: string,
      tipo: 'Chapa' | 'Perfil' | 'Tubo' | 'Acessorio' | 'Consumivel',
      quantidade: number,
      unidade: string,
    }>,
    
    // Nesting 2D (Aproveitamento de chapas)
    nesting?: {
      chapaId: string,
      aproveitamento: number,
      pecas: Array<{
        x: number,
        y: number,
        rotacao: number,
      }>,
    },
  }>,
  
  // Totais
  subtotal: number,
  desconto: number,
  descontoPercentual: number,
  total: number,
  
  // Observações
  observacoes?: string,
  condicoesPagamento?: string,
  prazoEntrega?: string,
  
  // Auditoria
  createdAt: Timestamp,
  updatedAt: Timestamp,
  criadoPor?: string,
  aprovadoEm?: Timestamp,
  aprovadoPor?: string,
}
```

### Validações:
- ✅ Máximo 200 itens por orçamento
- ✅ ModeloId deve existir no MODELOS_REGISTRY
- ✅ BOM só pode ter tipos: Chapa, Perfil, Tubo, Acessorio, Consumivel
- ✅ Status só pode transicionar: Rascunho → Enviado → Aprovado/Rejeitado → Convertido

### Índices:
```json
[
  {
    "fields": [
      { "fieldPath": "tenantId", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "data", "order": "DESCENDING" }
    ]
  },
  {
    "fields": [
      { "fieldPath": "tenantId", "order": "ASCENDING" },
      { "fieldPath": "clienteId", "order": "ASCENDING" },
      { "fieldPath": "data", "order": "DESCENDING" }
    ]
  }
]
```

---

## 3️⃣ COLEÇÃO: `ordens_producao`

### Estrutura do Documento:

```typescript
{
  id: string,                    // ID único
  tenantId: string,              // Multi-tenant
  numero: string,                // OP-2024-001
  
  // Origem
  orcamentoId: string,           // Referência ao orçamento
  orcamentoNumero: string,       // Número do orçamento (desnormalizado)
  
  // Cliente
  clienteId: string,
  clienteNome: string,
  
  // Status e datas
  status: 'Aberta' | 'EmProducao' | 'Pausada' | 'Concluida' | 'Cancelada',
  dataAbertura: string,          // ISO 8601
  dataInicio?: string,           // Quando iniciou produção
  dataConclusao?: string,        // Quando concluiu
  
  // Produção
  operadorAtual?: string,        // Nome do operador
  prioridade: 'Baixa' | 'Normal' | 'Alta' | 'Urgente',
  prazoEntrega: string,
  
  // Itens (mesma estrutura do orçamento)
  itens: Array<{
    id: string,
    modeloId: string,
    quantidade: number,
    quantidadeProduzida: number,
    especificacoes: { /*...*/ },
    bom: Array<{ /*...*/ }>,
    nesting?: { /*...*/ },
  }>,
  
  // Observações
  observacoes?: string,
  motivoCancelamento?: string,
  motivoPausa?: string,
  
  // Auditoria
  createdAt: Timestamp,
  updatedAt: Timestamp,
  criadoPor?: string,
}
```

### Validações:
- ✅ Só pode ser criada de orçamento APROVADO
- ✅ Status válidos: Aberta, EmProducao, Pausada, Concluida, Cancelada
- ✅ Transições válidas:
  - Aberta → EmProducao
  - EmProducao → Pausada
  - Pausada → EmProducao
  - EmProducao → Concluida
  - Qualquer → Cancelada

### Índices:
```json
[
  {
    "fields": [
      { "fieldPath": "tenantId", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "dataAbertura", "order": "DESCENDING" }
    ]
  },
  {
    "fields": [
      { "fieldPath": "tenantId", "order": "ASCENDING" },
      { "fieldPath": "clienteId", "order": "ASCENDING" },
      { "fieldPath": "dataAbertura", "order": "DESCENDING" }
    ]
  }
]
```

---

## 4️⃣ COLEÇÃO: `materiais`

### Estrutura do Documento:

```typescript
{
  id: string,
  tenantId: string,
  
  // Dados básicos
  codigo: string,                // Código único
  nome: string,                  // Nome do material
  tipo: 'Chapa' | 'Perfil' | 'Tubo' | 'Acessorio' | 'Consumivel',
  
  // Especificações
  unidade: 'M' | 'M2' | 'M3' | 'KG' | 'UN',
  espessura?: number,            // Se chapa
  comprimento?: number,
  largura?: number,
  
  // Preços
  precoCusto: number,
  precoVenda: number,
  margemLucro: number,
  
  // Estoque
  estoqueMinimo: number,
  estoqueAtual: number,
  
  // Status
  ativo: boolean,
  
  // Auditoria
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

---

## 5️⃣ COLEÇÃO: `apontamentos`

### Estrutura do Documento:

```typescript
{
  id: string,
  tenantId: string,
  
  // Referências
  ordemId: string,               // Referência à OP
  itemId: string,                // Item específico da OP
  
  // Produção
  operador: string,              // Nome do operador
  maquina?: string,              // Máquina utilizada
  
  // Tempo
  dataInicio: Timestamp,
  dataFim?: Timestamp,
  tempoDecorrido?: number,       // em minutos
  
  // Quantidade
  quantidadeProduzida: number,
  quantidadeRejeitada?: number,
  motivoRejeicao?: string,
  
  // Status
  status: 'EmAndamento' | 'Concluido' | 'Pausado',
  
  // Observações
  observacoes?: string,
  
  // Auditoria
  createdAt: Timestamp,
}
```

---

## 6️⃣ COLEÇÃO: `movimentacoes_estoque`

### Estrutura do Documento:

```typescript
{
  id: string,
  tenantId: string,
  
  // Referências
  materialId: string,
  
  // Movimentação
  tipo: 'Entrada' | 'Saida' | 'Ajuste' | 'Transferencia',
  quantidade: number,
  saldoAnterior: number,
  saldoNovo: number,
  
  // Motivo
  motivo: string,                // Compra, Produção, Venda, etc
  documentoReferencia?: string,  // Número da NF, OP, etc
  
  // Responsável
  responsavel: string,
  
  // Data
  data: Timestamp,
  
  // Auditoria (IMUTÁVEL)
  createdAt: Timestamp,
}
```

**IMPORTANTE:** Movimentações são IMUTÁVEIS (não podem ser editadas ou deletadas - auditoria)

---

## 🔒 SEGURANÇA MULTI-TENANT

Todas as coleções têm **isolamento automático por `tenantId`**:

```javascript
// Firestore Rules
function getTenantId() {
  return request.auth.uid;  // Por enquanto usa UID
  // Futuramente: request.auth.token.tenantId
}

function belongsToTenant(docData) {
  return docData.tenantId == getTenantId();
}
```

### Regras aplicadas:
- ✅ **Read**: Só documentos do próprio tenant
- ✅ **Create**: `tenantId` é adicionado automaticamente
- ✅ **Update**: Só documentos do próprio tenant
- ✅ **Delete**: Apenas admin e do próprio tenant

---

## 📊 CAMPOS AUTOMÁTICOS

Todos os documentos têm automaticamente:

```typescript
{
  tenantId: string,              // Adicionado automaticamente
  createdAt: Timestamp,          // Adicionado na criação
  updatedAt: Timestamp,          // Atualizado sempre
}
```

Você **NÃO PRECISA** adicionar esses campos manualmente! Os services fazem isso automaticamente.

---

## 🎯 COMO USAR

### Criar Cliente:
```typescript
import { clientesService } from '@/services/firebase/clientes.service';

const result = await clientesService.create({
  nome: 'Empresa ABC',
  cnpj: '12345678901234',
  email: 'contato@abc.com',
  telefone: '11999999999',
  cidade: 'São Paulo',
  estado: 'SP',
  status: 'Ativo',
  totalCompras: 0,
});
```

### Criar Orçamento:
```typescript
import { orcamentosService } from '@/services/firebase/orcamentos.service';

const result = await orcamentosService.create({
  clienteId: 'cliente-id',
  clienteNome: 'Empresa ABC',
  data: new Date().toISOString(),
  validade: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
  status: 'Rascunho',
  itens: [
    {
      id: '1',
      modeloId: 'portas-janelas-basculante',
      quantidade: 10,
      precoUnitario: 500,
      subtotal: 5000,
      especificacoes: {
        comprimento: 1000,
        largura: 600,
        espessura: 1.5,
        acabamento: 'Lixado',
      },
      bom: [
        {
          materialId: 'chapa-inox-304',
          tipo: 'Chapa',
          quantidade: 2.5,
          unidade: 'M2',
        }
      ]
    }
  ],
  subtotal: 5000,
  desconto: 0,
  descontoPercentual: 0,
  total: 5000,
});
```

### Criar OP de Orçamento:
```typescript
import { ordensService } from '@/services/firebase/ordens.service';

const result = await ordensService.criarDeOrcamento('orcamento-id');
```

---

## ✅ RESUMO

✅ **10 coleções** principais configuradas  
✅ **Multi-tenant** automático em todas  
✅ **Validações** server-side (Firestore Rules)  
✅ **Índices** otimizados para queries  
✅ **Timestamps** automáticos  
✅ **Auditoria** em movimentações (imutável)  
✅ **Services prontos** para usar  

**Você não precisa criar tabelas manualmente!** O Firestore cria automaticamente quando você insere o primeiro documento.

---

**Próximo passo:** Testar criando um cliente! 🚀
