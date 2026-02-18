# Relatório de Validação - INOX-VAL
**Data/Hora:** 18/02/2026, 12:21:56
**Resultado Geral:** ❌ FAIL
**Total de Validadores:** 16
**Passados:** 15
**Falhos:** 1
**Avisos:** 0

## Resultados Detalhados

### validateEnvironment
- Status: ❌ Falhou
- Duração: 1ms

- Erro: Variáveis de ambiente faltando: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID, NODE_ENV


### validateBuild
- Status: ✅ Passou
- Duração: 0ms


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
- Duração: 1ms


- Detalhes: {
  "count": 20,
  "averageCostPerHour": 81.5,
  "types": [
    "PUNCHAR",
    "PINTAR",
    "SOBRERROTAR",
    "DOBRAR",
    "ESCOVAR",
    "POLIR",
    "CORTAR"
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
- Duração: 0ms


- Detalhes: {
  "count": 50,
  "templatesWithPresets": 16,
  "averagePresetsPerTemplate": 3.13,
  "validBOMs": 50
}

### validateE2EFlow
- Status: ✅ Passou
- Duração: 3102ms


- Detalhes: {
  "testCases": 10,
  "passed": 10,
  "failed": 0,
  "averageTimePerTest": 310.2
}

### validateSnapshots
- Status: ✅ Passou
- Duração: 2883ms


- Detalhes: {
  "testCases": 3,
  "passed": 3,
  "failed": 0,
  "averageTimePerTest": 961
}

### validatePDF
- Status: ✅ Passou
- Duração: 1557ms


- Detalhes: {
  "tests": 3,
  "passed": 3,
  "failed": 0
}

### validatePurchasing
- Status: ✅ Passou
- Duração: 1541ms


- Detalhes: {
  "tests": 4,
  "passed": 4,
  "failed": 0
}

### validateProduction
- Status: ✅ Passou
- Duração: 1432ms


- Detalhes: {
  "tests": 4,
  "passed": 4,
  "failed": 0
}

### validateSecurity
- Status: ✅ Passou
- Duração: 979ms


- Detalhes: {
  "tests": 3,
  "passed": 3,
  "failed": 0
}

### validatePerformance
- Status: ✅ Passou
- Duração: 10986ms


- Detalhes: {
  "averageTime": 549.3,
  "p95Time": 779,
  "memoryUsage": 301.03,
  "testCount": 20
}

### validateMemoization
- Status: ✅ Passou
- Duração: 20ms


- Detalhes: {
  "reportGenerated": true,
  "reportPath": "C:\\Users\\gabri\\Documents\\GitHub\\INOX-VAL\\MEMOIZATION_REPORT.md"
}


## Erros Críticos

### validateEnvironment
Variáveis de ambiente faltando: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID, NODE_ENV

