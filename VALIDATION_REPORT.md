# Relatório de Validação - INOX-VAL
**Data/Hora:** 18/02/2026, 11:27:18
**Resultado Geral:** ❌ FAIL
**Total de Validadores:** 16
**Passados:** 14
**Falhos:** 2
**Avisos:** 0

## Resultados Detalhados

### validateEnvironment
- Status: ❌ Falhou
- Duração: 0ms

- Erro: Variáveis de ambiente faltando: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID, NODE_ENV


### validateBuild
- Status: ✅ Passou
- Duração: 1ms


- Detalhes: {
  "buildDirSize": "0 Bytes",
  "assetsCount": 7
}

### validateFirestore
- Status: ✅ Passou
- Duração: 0ms


- Detalhes: {
  "connected": true,
  "collections": 7,
  "securityRules": "loaded"
}

### validateMaterials
- Status: ✅ Passou
- Duração: 1ms


- Detalhes: {
  "count": 15,
  "activePrices": 15,
  "averageDensity": 8.6
}

### validateProcesses
- Status: ✅ Passou
- Duração: 0ms


- Detalhes: {
  "count": 20,
  "averageCostPerHour": 81.5,
  "types": [
    "PINTAR",
    "POLIR",
    "ESCOVAR",
    "DOBRAR",
    "SOBRERROTAR",
    "CORTAR",
    "PUNCHAR"
  ]
}

### validateSettings
- Status: ✅ Passou
- Duração: 0ms


- Detalhes: {
  "companyName": "INOX-VAL Industria e Comercio",
  "currency": "BRL",
  "taxRatesCount": 4,
  "unitsCount": 5
}

### validateTemplates
- Status: ✅ Passou
- Duração: 0ms


- Detalhes: {
  "count": 16,
  "validBOMs": 16,
  "categories": [
    "MESA",
    "BANCADA",
    "ARMARIO",
    "CARRINHO"
  ]
}

### validatePresets
- Status: ✅ Passou
- Duração: 1ms


- Detalhes: {
  "count": 50,
  "templatesWithPresets": 16,
  "averagePresetsPerTemplate": 3.13,
  "validBOMs": 50
}

### validateE2EFlow
- Status: ❌ Falhou
- Duração: 2622ms

- Erro: Teste "Bancada com 2 Cubas" falhou: Falha ao calcular BOM para o template


### validateSnapshots
- Status: ✅ Passou
- Duração: 2887ms


- Detalhes: {
  "testCases": 3,
  "passed": 3,
  "failed": 0,
  "averageTimePerTest": 962.33
}

### validatePDF
- Status: ✅ Passou
- Duração: 1390ms


- Detalhes: {
  "tests": 3,
  "passed": 3,
  "failed": 0
}

### validatePurchasing
- Status: ✅ Passou
- Duração: 1294ms


- Detalhes: {
  "tests": 4,
  "passed": 4,
  "failed": 0
}

### validateProduction
- Status: ✅ Passou
- Duração: 1560ms


- Detalhes: {
  "tests": 4,
  "passed": 4,
  "failed": 0
}

### validateSecurity
- Status: ✅ Passou
- Duração: 623ms


- Detalhes: {
  "tests": 3,
  "passed": 3,
  "failed": 0
}

### validatePerformance
- Status: ✅ Passou
- Duração: 11353ms


- Detalhes: {
  "averageTime": 567.65,
  "p95Time": 762,
  "memoryUsage": 380.43,
  "testCount": 20
}

### validateMemoization
- Status: ✅ Passou
- Duração: 28ms


- Detalhes: {
  "reportGenerated": true,
  "reportPath": "c:\\Users\\gabri\\Documents\\GitHub\\INOX-VAL\\MEMOIZATION_REPORT.md"
}


## Erros Críticos

### validateEnvironment
Variáveis de ambiente faltando: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID, NODE_ENV

### validateE2EFlow
Teste "Bancada com 2 Cubas" falhou: Falha ao calcular BOM para o template

