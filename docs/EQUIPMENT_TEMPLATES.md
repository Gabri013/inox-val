# Biblioteca de Equipamentos DSL

## Visão Geral

A biblioteca de equipamentos DSL (Domain-Specific Language) é um sistema modular para definição, validação, avaliação e persistência de templates de equipamentos em aço inox para automatização de orçamentos.

## Arquitetura

O sistema é composto por 8 componentes principais:

```
src/domains/equipmentLibrary/
├── equipment.dsl.schema.ts       # Definição do schema DSL
├── equipment.expression.ts       # Avaliador de expressões seguras
├── equipment.validator.ts        # Validador de templates
├── equipment.registry.ts         # Registro e avaliador de templates
├── equipment.templates.ts        # 16 templates pré-definidos
├── equipment.presets.ts          # 40 presets de configurações comuns
├── equipment.templates.seed.ts   # Funções de seed para Firestore
├── equipment.tests.spec.ts       # Testes de sanidade
└── index.ts                      # Ponto de entrada do módulo
```

## DSL Schema

O schema DSL define a estrutura serializável para templates de equipamentos:

```typescript
interface EquipmentTemplateDSL {
  // Identificação
  key: string;                    // ex: "MESA_LISA"
  label: string;                  // ex: "Mesa Lisa"
  category: EquipmentCategory;
  description: string;
  
  // Inputs do usuário
  inputs: InputFieldDSL[];
  
  // Campos derivados (expressões)
  derived: DerivedFieldDSL[];
  
  // BOM
  bom: {
    sheetParts: SheetPartDSL[];
    tubes: TubePartDSL[];
    accessories: AccessoryPartDSL[];
  };
  
  // Regras estruturais
  structuralRules: StructuralRuleDSL[];
  
  // Regras de processo
  processRules: ProcessRuleDSL[];
  
  // Validações
  validations: ValidationDSL[];
  
  // Modelo de métricas
  metricsModel: MetricsModelDSL;
}
```

## Categorias

| Categoria | Templates | Descrição |
|---|---|---|
| MESA | 5 | Mesas simples, com prateleira, contraventadas, de parede e com rodízios |
| BANCADA | 5 | Bancadas centrais, de parede, estreitas e com 1 ou 2 cubas |
| ARMARIO | 3 | Armários abertos, com 2 portas e gabinetes para pia |
| ESTANTE | 2 | Estantes fixas com 4 níveis e configuráveis |
| CARRINHO | 1 | Carrinhos com número variável de bandejas |

## Funcionalidades Principais

### 1. Avaliador de Expressões

O evaluator suporta:
- **Aritmética**: +, -, *, /, %, ()
- **Booleanos**: &&, ||, !, ==, !=, <, >, <=, >=
- **Ternário**: `condition ? valueIfTrue : valueIfFalse`
- **Funções**: min(), max(), round(), ceil(), floor(), abs()
- **Strings**: Concatenação com +, literais em quotes

**Bloqueia execução de código arbitrário** (eval, Function, etc.).

### 2. Validação de Templates

O validator verifica:
- Integridade estrutural
- Validade de expressões
- Tipos e restrições de inputs
- Presença de campos obrigatórios
- IDs únicos

### 3. Registro e Avaliação

O registry:
- Armazena e recupera templates
- Avalia templates com inputs do usuário
- Aplica regras estruturais
- Valida configurações
- Calcula métricas

### 4. Seed para Firestore

Funções para:
- Seed idempotente de templates e presets
- Clear completo do banco
- Verificação de seed
- Estatísticas

## Uso Básico

```typescript
import { 
  equipmentRegistry, 
  ALL_TEMPLATES, 
  ALL_PRESETS, 
  evaluateTemplate 
} from './src/domains/equipmentLibrary';

// Registrar templates
ALL_TEMPLATES.forEach(template => {
  equipmentRegistry.registerTemplate(template);
});

// Obter template
const template = equipmentRegistry.getTemplate('MESA_LISA');

// Evaluar template com inputs
const result = evaluateTemplate(template, {
  width: 1000,
  depth: 600,
  height: 850,
  thickness: 1.2,
  finish: 'POLIDO',
  hasCasters: false
});

console.log('BOM:', result.bom);
console.log('Validação:', result.validation);
console.log('Métricas:', result.metrics);
```

## Script de Seed

Executar o script de seed:

```bash
# Seed com configuração padrão (companyId: 'default')
npx tsx scripts/seed-equipment.ts

# Seed para empresa específica
npx tsx scripts/seed-equipment.ts company-123

# Seed com overwrite de templates existentes
npx tsx scripts/seed-equipment.ts company-123 --overwrite

# Verificar seed
npx tsx scripts/seed-equipment.ts company-123 --verify

# Limpar dados
npx tsx scripts/seed-equipment.ts company-123 --clear

# Ver estatísticas
npx tsx scripts/seed-equipment.ts --stats
```

## Testes

Executar os testes:

```bash
npm run test
```

Testes implementados:
- Validade de templates
- Validade de presets
- Segurança do evaluator
- Geração de BOM
- Regras estruturais
- Funcionamento do registry

## Templates Disponíveis

### MESAS (5 templates)
1. **MESA_LISA** - Mesa simples com 4 pés
2. **MESA_COM_PRATELEIRA** - Mesa com prateleira inferior
3. **MESA_CONTRAVENTADA_U** - Mesa contraventada em U
4. **MESA_PAREDE_COM_ESPELHO** - Mesa de parede com espelho
5. **MESA_COM_RODIZIOS** - Mesa com rodízios

### BANCADAS (5 templates)
6. **BANCADA_CENTRAL** - Bancada central ilha
7. **BANCADA_PAREDE_COM_ESPELHO** - Bancada de parede com espelho
8. **BANCADA_ESTREITA** - Bancada estreita (500mm)
9. **BANCADA_COM_CUBA_1** - Bancada com 1 cuba
10. **BANCADA_COM_CUBAS_2** - Bancada com 2 cubas

### ARMÁRIOS (3 templates)
11. **ARMARIO_ABERTO** - Armário sem portas
12. **ARMARIO_2_PORTAS** - Armário com 2 portas
13. **GABINETE_PIA_2_PORTAS** - Gabinete para pia com 2 portas

### ESTANTES (2 templates)
14. **ESTANTE_4_NIVEIS** - Estante fixa com 4 níveis
15. **ESTANTE_N_NIVEIS** - Estante com n níveis configurável

### CARRINHOS (1 template)
16. **CARRINHO_N_BANDEJAS** - Carrinho com n bandejas

## Presets

Cada template tem presets padrão:

```typescript
const PRESETS = [
  { templateKey: 'MESA_LISA', label: 'Mesa 700x600', width: 700, depth: 600, height: 850, thickness: 1.2 },
  { templateKey: 'MESA_LISA', label: 'Mesa 1000x600', width: 1000, depth: 600, height: 850, thickness: 1.2 },
  // ... 38 mais presets
];
```

## Regras Estruturais

| ID | Condição | Ação | Mensagem |
|---|---|---|---|
| DEPTH_REINFORCEMENT | depth > 700 | ADD_TUBE | Profundidade > 700mm requer reforço central |
| WIDTH_THICKNESS | width > 2000 | REQUIRE_MIN_THICKNESS | Largura > 2000mm requer espessura mínima 1.5mm |
| MAX_WIDTH | width > 3000 | BLOCK | Largura máxima permitida: 3000mm |
| SHELF_SUPPORTS | hasShelf == true | ADD_ACCESSORY | Prateleira requer suportes |
| TALL_CABINET_BRACE | height > 1600 && category == "ARMARIO" | ADD_TUBE | Armários altos requerem travessa extra |

## Armazenamento no Firestore

Estrutura de dados:

```
/templates/
├── {companyId}/
│   ├── items/
│   │   ├── {templateKey}/
│   │   │   ├── key: "MESA_LISA"
│   │   │   ├── label: "Mesa Lisa"
│   │   │   ├── category: "MESA"
│   │   │   └── ...
│   │   └── ...
│   └── presets/
│       ├── {presetId}/
│       │   ├── id: "MESA_LISA_1000x600"
│       │   ├── templateKey: "MESA_LISA"
│       │   ├── label: "Mesa 1000x600"
│       │   └── ...
│       └── ...
```

## Tecnologias

- **TypeScript** - Linguagem de programação
- **Vitest** - Testes unitários
- **Firebase Firestore** - Persistência
- **DSL (Domain-Specific Language)** - Linguagem específica do domínio para definição de templates

## Extensão

### Adicionar Novo Template

1. Crie um novo arquivo ou adicione ao `equipment.templates.ts`
2. Defina o schema do template
3. Implemente as regras estruturais e de processo
4. Adicione presets no `equipment.presets.ts`
5. Atualize a documentação

### Modificar Schema

1. Atualize `equipment.dsl.schema.ts`
2. Atualize `equipment.validator.ts` para validação
3. Atualize `equipment.registry.ts` para avaliação
4. Atualize os templates existentes

### Adicionar Funções ao Evaluator

1. Modifique `ALLOWED_FUNCTIONS` em `equipment.expression.ts`
2. Implemente a função
3. Adicione testes

## Contribuição

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Execute os testes
5. Faça um pull request
