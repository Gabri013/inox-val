param(
  [switch]$VerboseLog
)

$ErrorActionPreference = 'Stop'

Write-Host "== INOX-VAL validate ==" -ForegroundColor Cyan
Write-Host "Node: $(node -v)" -ForegroundColor DarkGray
Write-Host "NPM:  $(npm -v)" -ForegroundColor DarkGray

Write-Host "\n== npm run check ==" -ForegroundColor Cyan

if ($VerboseLog) {
  npm run check --loglevel verbose
} else {
  npm run check
}

Write-Host "\nOK" -ForegroundColor Green

