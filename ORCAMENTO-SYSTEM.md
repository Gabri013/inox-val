# Sistema de Orçamento Completo - INOX-VAL

## 📋 Visão Geral

Sistema profissional de orçamento para produtos em aço inoxidável com:

- ✅ **Banco de dados de materiais** com preços reais
- ✅ **Engine BOM** (Bill of Materials) profissional
- ✅ **Nesting 2D** com algoritmo Guillotine Best-Fit
- ✅ **Cálculo de custos** completo (materiais + processos + overhead)
- ✅ **Workflow de produção** end-to-end

## 🏗️ Estrutura

```
src/domains/
├── materiais/
│   ├── types.ts           # Definições de tipos
│   ├── repository.ts      # Acesso ao Firestore
│   └── service.ts         # Lógica de negócio
│
└── orcamento/
    └── engine.ts          # Engine de orçamento completo

scripts/
└── populate-materiais.ts  # Popular banco de dados
```

## 🚀 Como Usar

### 1. Popular o Banco de Dados

```bash
# Configure suas credenciais Firebase em scripts/populate-materiais.ts
npm run populate-materiais
```

Isso irá cadastrar:
- 2 chapas padrão (2000×1250, 3000×1250)
- 18 preços de chapas (304, 316, 430)
- 10 tubos (redondo, quadrado, retangular)
- 5 cantoneiras
- 13 acessórios
- 6 processos de fabricação

### 2. Criar um BOM (Bill of Materials)

```typescript
import type { BOM } from '@/domains/orcamento/engine';

const bom: BOM = {
  pecasChapa: [
    {
      id: 'tampo',
      descricao: 'Tampo da bancada',
      largura: 2000,        // mm
      altura: 800,          // mm
      quantidade: 1,
      espessuraMm: 1.2,
      tipoInox: '304',
      familia: 'tampo',
      podeRotacionar: true,
    },
    {
      id: 'prateleira',
      descricao: 'Prateleira inferior',
      largura: 1900,
      altura: 700,
      quantidade: 1,
      espessuraMm: 1.0,
      tipoInox: '304',
      familia: 'prateleira',
      podeRotacionar: true,
    },
  ],
  
  pecasTubo: [
    {
      id: 'estrutura',
      descricao: 'Pés e travessas',
      tuboId: 'TUBO_ID_DO_FIRESTORE',  // Obter via materiaisService.obterTubos()
      metros: 8.5,
      tipoInox: '304',
    },
  ],
  
  pecasCantoneira: [],
  
  pecasAcessorio: [
    {
      id: 'pes',
      sku: 'PE-REGULAVEL-304',
      descricao: 'Pés reguláveis',
      quantidade: 4,
    },
  ],
  
  processos: [
    {
      id: 'corte',
      tipo: 'corte',
      descricao: 'Corte a laser',
      minutos: 30,
    },
    {
      id: 'dobra',
      tipo: 'dobra',
      descricao: 'Dobras no tampo',
      minutos: 15,
    },
    {
      id: 'solda',
      tipo: 'solda',
      descricao: 'Solda TIG',
      minutos: 60,
    },
    {
      id: 'acabamento',
      tipo: 'acabamento',
      descricao: 'Polimento',
      minutos: 45,
    },
    {
      id: 'montagem',
      tipo: 'montagem',
      descricao: 'Montagem final',
      minutos: 30,
    },
  ],
};
```

### 3. Calcular Orçamento

```typescript
import { calcularOrcamento } from '@/domains/orcamento/engine';

try {
  const resultado = await calcularOrcamento(bom);
  
  console.log('NESTING:');
  resultado.nesting.forEach(n => {
    console.log(`- ${n.familia} ${n.espessuraMm}mm ${n.tipoInox}`);
    console.log(`  Chapas: ${n.totalChapas}`);
    console.log(`  Aproveitamento: ${n.aproveitamentoMedio.toFixed(1)}%`);
    console.log(`  Kg: ${n.kgTotal.toFixed(2)}`);
    console.log(`  Custo: R$ ${n.custoTotal.toFixed(2)}`);
  });
  
  console.log('\nCUSTOS:');
  resultado.categorias.forEach(cat => {
    console.log(`\n${cat.nome}:`);
    cat.itens.forEach(item => {
      console.log(`  - ${item.descricao}`);
      console.log(`    ${item.quantidade} ${item.unidade} × R$ ${item.valorUnitario.toFixed(2)}`);
      console.log(`    = R$ ${item.valorTotal.toFixed(2)}`);
      if (item.detalhes) console.log(`    (${item.detalhes})`);
    });
    console.log(`  Subtotal: R$ ${cat.subtotal.toFixed(2)}`);
  });
  
  console.log('\nRESUMO FINANCEIRO:');
  console.log(`Custo Materiais:  R$ ${resultado.resumo.custoMateriais.toFixed(2)}`);
  console.log(`Custo Processos:  R$ ${resultado.resumo.custoProcessos.toFixed(2)}`);
  console.log(`Custo Acessórios: R$ ${resultado.resumo.custoAcessorios.toFixed(2)}`);
  console.log(`Subtotal Direto:  R$ ${resultado.resumo.subtotalDireto.toFixed(2)}`);
  console.log(`Overhead (20%):   R$ ${resultado.resumo.overhead.toFixed(2)}`);
  console.log(`CUSTO TOTAL:      R$ ${resultado.resumo.custoTotal.toFixed(2)}`);
  console.log(`-`.repeat(50));
  console.log(`Preço Mínimo:     R$ ${resultado.resumo.precoMinimo.toFixed(2)}`);
  console.log(`PREÇO SUGERIDO:   R$ ${resultado.resumo.precoSugerido.toFixed(2)}`);
  
  if (resultado.avisos.length > 0) {
    console.log('\nAVISOS:');
    resultado.avisos.forEach(aviso => console.log(`⚠️  ${aviso}`));
  }
  
} catch (error) {
  console.error('Erro ao calcular orçamento:', error);
}
```

## 📊 Saída do Sistema

### Exemplo de Resultado:

```
NESTING:
- tampo 1.2mm 304
  Chapas: 1
  Aproveitamento: 64.0%
  Kg: 18.96
  Custo: R$ 787.32

- prateleira 1.0mm 304
  Chapas: 1
  Aproveitamento: 60.8%
  Kg: 14.82
  Custo: R$ 622.44

CUSTOS:

Chapas:
  - Chapa 304 1.2mm - tampo
    1 chapa(s) × R$ 787.32
    = R$ 787.32
    (18.96kg, 64.0% aproveitamento)
  - Chapa 304 1.0mm - prateleira
    1 chapa(s) × R$ 622.44
    = R$ 622.44
    (14.82kg, 60.8% aproveitamento)
  Subtotal: R$ 1409.76

Tubos:
  - Pés e travessas
    8.5 m × R$ 47.30
    = R$ 402.05
    (9.35kg)
  Subtotal: R$ 402.05

Acessórios:
  - Pé Regulável Inox 304
    4 un × R$ 15.00
    = R$ 60.00
  Subtotal: R$ 60.00

Processos:
  - Corte a Laser / Plasma
    0.5 h × R$ 150.00
    = R$ 75.00
    (30min)
  - Dobra em Prensa
    0.25 h × R$ 120.00
    = R$ 30.00
    (15min)
  - Solda TIG
    1.0 h × R$ 180.00
    = R$ 180.00
    (60min)
  - Polimento e Escovamento
    0.75 h × R$ 100.00
    = R$ 75.00
    (45min)
  - Montagem Final
    0.5 h × R$ 90.00
    = R$ 45.00
    (30min)
  Subtotal: R$ 405.00

RESUMO FINANCEIRO:
Custo Materiais:  R$ 1811.81
Custo Processos:  R$ 405.00
Custo Acessórios: R$ 60.00
Subtotal Direto:  R$ 2276.81
Overhead (20%):   R$ 455.36
CUSTO TOTAL:      R$ 2732.17
--------------------------------------------------
Preço Mínimo:     R$ 3642.89  (margem 25%)
PREÇO SUGERIDO:   R$ 6830.43  (markup 2.5×)

AVISOS:
⚠️  Baixo aproveitamento (60.8%) para prateleira 1.0mm
```

## 🔧 Configurações

As configurações são armazenadas no Firestore em `configuracoes/materiais`:

```typescript
{
  densidadeInoxKgM3: 7900,      // Densidade do inox
  margemPerdaMaterial: 15,       // % de perda no corte
  overheadPercent: 20,           // % de custos fixos
  margemLucroMinima: 25,         // % de margem mínima
  markupPadrao: 2.5,             // Multiplicador de preço
}
```

Para atualizar:

```typescript
import { atualizarConfiguracoesMateriais } from '@/domains/materiais/repository';

await atualizarConfiguracoesMateriais({
  margemLucroMinima: 30,  // Aumentar margem para 30%
  markupPadrao: 3.0,      // Aumentar markup para 3.0×
});
```

## 📈 Atualizar Preços

### Atualizar Preço de Chapa:

```typescript
import { atualizarPrecoChapa } from '@/domains/materiais/repository';

await atualizarPrecoChapa(
  '304',     // Tipo de inox
  1.2,       // Espessura em mm
  45.00,     // Novo preço R$/kg
  'Fornecedor XYZ'
);
```

### Atualizar Preço de Tubo:

```typescript
import { atualizarPrecoTubo } from '@/domains/materiais/repository';

await atualizarPrecoTubo(
  'TUBO_ID',  // ID do tubo no Firestore
  '304',      // Tipo de inox
  44.00,      // Novo preço R$/kg
  'Fornecedor ABC'
);
```

### Atualizar Preço de Acessório:

```typescript
import { atualizarPrecoAcessorio } from '@/domains/materiais/repository';

await atualizarPrecoAcessorio(
  'ACESSORIO_ID',  // ID do acessório
  18.00,           // Novo preço unitário
  'Fornecedor 123'
);
```

## 🎨 Visualização de Nesting

O resultado do nesting inclui as coordenadas exatas de cada peça:

```typescript
resultado.nesting.forEach(n => {
  n.chapas.forEach(chapa => {
    console.log(`\nChapa ${chapa.numero} (${chapa.chapa.label}):`);
    chapa.itens.forEach(item => {
      console.log(`  - ${item.descricao}`);
      console.log(`    Posição: (${item.x}, ${item.y})`);
      console.log(`    Tamanho: ${item.largura}×${item.altura}mm`);
      console.log(`    Rotacionada: ${item.rotacionada ? 'Sim' : 'Não'}`);
    });
    console.log(`  Aproveitamento: ${chapa.aproveitamento.toFixed(1)}%`);
  });
});
```

Você pode usar essas coordenadas para:
- Gerar desenhos CAD/DXF
- Visualizar graficamente no navegador
- Enviar para máquinas CNC

## 🔐 Segurança

- Todos os preços são armazenados com timestamp
- Histórico de alterações de preços mantido
- Validações em todas as etapas do cálculo
- Erros detalhados para debugging

## 📱 Integração com Interface

O sistema está pronto para ser integrado com interfaces React/Vue:

```tsx
import { calcularOrcamento, type BOM } from '@/domains/orcamento/engine';
import { useState } from 'react';

function OrcamentoPage() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  
  async function calcular(bom: BOM) {
    setLoading(true);
    try {
      const res = await calcularOrcamento(bom);
      setResultado(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div>
      {/* Formulário para criar BOM */}
      {/* Exibir resultado */}
    </div>
  );
}
```

## 🎯 Próximos Passos

1. ✅ Banco de dados de materiais
2. ✅ Engine BOM
3. ✅ Nesting 2D
4. ✅ Cálculo de custos
5. 🔲 Interface de gestão de materiais
6. 🔲 Interface de criação de orçamentos
7. 🔲 Visualizador gráfico de nesting
8. 🔲 Exportação PDF/Excel
9. 🔲 Histórico de orçamentos
10. 🔲 Integração com produção

## 📚 Referências

- **Nesting 2D**: Algoritmo Guillotine Best-Fit Decreasing Height (BFDH)
- **Cálculo de peso**: Volume (m³) × Densidade (kg/m³)
- **Preços**: Valores de mercado brasileiro (2024)
