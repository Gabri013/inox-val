# 📦 Firebase Services - Guia de Uso

Este diretório contém todos os services para interação com o Firebase Firestore do ERP Industrial.

---

## 📁 Estrutura

```
src/services/firebase/
├── base.service.ts          # Service genérico com CRUD base
├── orcamentos.service.ts    # Gestão de orçamentos
├── clientes.service.ts      # Gestão de clientes
├── ordens.service.ts        # Gestão de ordens de produção
└── README.md               # Este arquivo
```

---

## 🚀 Como Usar

### Importar Service

```typescript
import { orcamentosService } from '@/services/firebase/orcamentos.service';
import { clientesService } from '@/services/firebase/clientes.service';
import { ordensService } from '@/services/firebase/ordens.service';
```

### Padrão de Resposta

Todos os services retornam um `ServiceResult<T>`:

```typescript
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Exemplo:**

```typescript
const result = await clientesService.getById('cliente-123');

if (result.success && result.data) {
  console.log('Cliente:', result.data);
} else {
  console.error('Erro:', result.error);
}
```

---

## 📘 CLIENTES SERVICE

### Criar Cliente

```typescript
const result = await clientesService.create({
  nome: 'Empresa XYZ Ltda',
  cnpj: '12345678901234',
  email: 'contato@empresaxyz.com',
  telefone: '11987654321',
  cidade: 'São Paulo',
  estado: 'SP',
  status: 'Ativo',
  totalCompras: 0,
  criadoEm: new Date().toISOString(),
  atualizadoEm: new Date().toISOString(),
});
```

### Buscar por CNPJ

```typescript
const result = await clientesService.findByCNPJ('12345678901234');

if (result.success && result.data) {
  console.log('Cliente encontrado:', result.data.nome);
} else {
  console.log('Cliente não encontrado');
}
```

### Listar Clientes Ativos

```typescript
const result = await clientesService.listAtivos();

if (result.success && result.data) {
  result.data.forEach(cliente => {
    console.log(cliente.nome);
  });
}
```

### Bloquear Cliente

```typescript
await clientesService.bloquear('cliente-123', 'Inadimplência');
```

### Pesquisar Clientes

```typescript
const result = await clientesService.search('São Paulo');
// Busca por nome, CNPJ ou email
```

---

## 📄 ORÇAMENTOS SERVICE

### Criar Orçamento

```typescript
const result = await orcamentosService.create({
  numero: 'ORC-000123',
  clienteId: 'cliente-123',
  clienteNome: 'Empresa XYZ',
  data: new Date(),
  validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
  status: 'Rascunho',
  itens: [
    {
      id: 'item-1',
      modeloId: 'MPLC',
      modeloNome: 'MPLC - Mesa de Centro',
      descricao: 'Bancada 2000×800×850mm',
      quantidade: 2,
      calculoSnapshot: { /* ResultadoCalculadora completo */ },
      precoUnitario: 5000,
      subtotal: 10000,
    },
  ],
  subtotal: 10000,
  desconto: 0,
  total: 10000,
});
```

### Listar por Status

```typescript
const result = await orcamentosService.listByStatus('Aprovado');
```

### Aprovar Orçamento

```typescript
const result = await orcamentosService.aprovar('orcamento-123');

if (result.success) {
  console.log('Orçamento aprovado!');
}
```

### Rejeitar Orçamento

```typescript
await orcamentosService.rejeitar('orcamento-123', 'Preço muito alto');
```

### Estatísticas

```typescript
const result = await orcamentosService.getEstatisticas();

if (result.success && result.data) {
  console.log('Total de orçamentos:', result.data.total);
  console.log('Aprovados:', result.data.aprovados);
  console.log('Valor total:', result.data.valorTotal);
}
```

---

## 🏭 ORDENS DE PRODUÇÃO SERVICE

### Criar OP de Orçamento Aprovado

```typescript
const result = await ordensService.criarDeOrcamento('orcamento-123');

if (result.success && result.data) {
  console.log('OP criada:', result.data.numero);
}
```

### Listar por Status

```typescript
const result = await ordensService.listByStatus('Em Produção');
```

### Iniciar Produção

```typescript
await ordensService.iniciarProducao('ordem-123', 'João Silva');
```

### Pausar Produção

```typescript
await ordensService.pausarProducao('ordem-123', 'Quebra de máquina');
```

### Retomar Produção

```typescript
await ordensService.retomarProducao('ordem-123');
```

### Concluir Produção

```typescript
await ordensService.concluirProducao('ordem-123');
```

### Cancelar Ordem

```typescript
await ordensService.cancelar('ordem-123', 'Cliente cancelou o pedido');
```

---

## 🔍 OPERAÇÕES COMUNS

### Paginação

```typescript
const result = await clientesService.list({
  limit: 20,
  orderBy: [{ field: 'nome', direction: 'asc' }],
});

if (result.success && result.data) {
  console.log('Clientes:', result.data.items);
  console.log('Tem mais?', result.data.hasMore);
  
  // Próxima página
  if (result.data.hasMore) {
    const nextPage = await clientesService.list({
      limit: 20,
      startAfter: result.data.lastDoc,
      orderBy: [{ field: 'nome', direction: 'asc' }],
    });
  }
}
```

### Filtros Complexos

```typescript
const result = await orcamentosService.list({
  where: [
    { field: 'status', operator: '==', value: 'Enviado' },
    { field: 'total', operator: '>', value: 10000 },
  ],
  orderBy: [{ field: 'data', direction: 'desc' }],
  limit: 50,
});
```

### Atualizar Documento

```typescript
await clientesService.update('cliente-123', {
  telefone: '11999998888',
  cidade: 'Campinas',
});
```

### Deletar Documento

```typescript
await clientesService.delete('cliente-123');
```

---

## ⚠️ VALIDAÇÕES AUTOMÁTICAS

Todos os services têm validações automáticas:

### Orçamentos

- ✅ Máximo de 200 itens por orçamento
- ✅ ModeloId deve existir no MODELOS_REGISTRY
- ✅ Transições de status válidas (Rascunho → Enviado → Aprovado)
- ✅ Campos obrigatórios

### Clientes

- ✅ CNPJ único por empresa
- ✅ Email único por empresa
- ✅ CNPJ com 14 dígitos
- ✅ Email válido

### Ordens

- ✅ OP só pode nascer de orçamento APROVADO
- ✅ Transições de status válidas
- ✅ Apontamento de produção correto

---

## 🔒 SEGURANÇA (MULTI-EMPRESA)

Todos os services automaticamente:

✅ Adicionam `empresaId` ao criar documentos  
✅ Filtram documentos por `empresaId` ao listar  
✅ Validam `empresaId` ao buscar/atualizar/deletar  
✅ Adicionam timestamps (`createdAt`, `updatedAt`)

**Você não precisa se preocupar com multi-empresa - é automático!**

---

## 🛠️ CRIAR NOVO SERVICE

Para criar um novo service:

```typescript
import { BaseFirestoreService, type ServiceResult } from './base.service';
import { COLLECTIONS } from '@/types/firebase';
import type { MeuTipo } from '@/types/meu-tipo';

export class MeuService extends BaseFirestoreService<MeuTipo> {
  constructor() {
    super(COLLECTIONS.minha_colecao);
  }

  // Sobrescrever validação
  protected async validate(data: Partial<MeuTipo>, id?: string): Promise<ServiceResult<void>> {
    const errors: string[] = [];

    // Suas validações aqui
    if (!data.campoObrigatorio) {
      errors.push('Campo obrigatório não pode ser vazio');
    }

    if (errors.length > 0) {
      return { success: false, error: errors.join('; ') };
    }

    return { success: true };
  }

  // Métodos customizados
  async meuMetodoCustomizado(param: string): Promise<ServiceResult<MeuTipo[]>> {
    return this.list({
      where: [{ field: 'meuCampo', operator: '==', value: param }],
    });
  }
}

export const meuService = new MeuService();
```

---

## 📊 PERFORMANCE

### Dicas de Performance

1. **Use paginação** - Não busque todos os documentos de uma vez
2. **Crie índices** - Queries complexos precisam de índices no Firestore
3. **Cache local** - O Firestore já faz cache automático
4. **Evite N+1** - Busque dados relacionados de uma vez

### Exemplo de Query Otimizado

```typescript
// ❌ RUIM - N+1 queries
const orcamentos = await orcamentosService.list();
for (const orc of orcamentos.data.items) {
  const cliente = await clientesService.getById(orc.clienteId); // N queries!
}

// ✅ BOM - Buscar clientes uma vez
const orcamentos = await orcamentosService.list();
const clienteIds = [...new Set(orcamentos.data.items.map(o => o.clienteId))];
const clientes = await Promise.all(
  clienteIds.map(id => clientesService.getById(id))
);
```

---

## 🧪 TESTES

### Testar Service Localmente

```typescript
// Usar emuladores do Firebase
// firebase emulators:start

import { clientesService } from '@/services/firebase/clientes.service';

async function testar() {
  const result = await clientesService.create({
    nome: 'Teste',
    cnpj: '12345678901234',
    email: 'teste@test.com',
    telefone: '11999999999',
    cidade: 'São Paulo',
    estado: 'SP',
    status: 'Ativo',
    totalCompras: 0,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  });

  console.log('Resultado:', result);
}

testar();
```

---

## 📚 RECURSOS

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Última Atualização:** 05/02/2026
