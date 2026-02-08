$ErrorActionPreference = 'Stop'

Write-Host "[validar_sistema] npm run typecheck"
npm run typecheck

Write-Host "[validar_sistema] npm run build"
npm run build

