param(
  [string]$InputPath = "data/planilha_preco.xls",
  [string]$OutputPath = "data/planilha_preco.xlsx"
)

$libreOffice = $env:LIBREOFFICE_PATH
if (-not $libreOffice) {
  $candidates = @(
    "C:/Program Files/LibreOffice/program/soffice.exe",
    "C:/Program Files (x86)/LibreOffice/program/soffice.exe"
  )
  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      $libreOffice = $candidate
      break
    }
  }
}

if (-not $libreOffice) {
  throw "LibreOffice nao encontrado. Defina LIBREOFFICE_PATH ou instale o LibreOffice."
}

$inputFull = Resolve-Path $InputPath
$outputDir = Split-Path (Resolve-Path $OutputPath -ErrorAction SilentlyContinue) -Parent
if (-not $outputDir) {
  $outputDir = Split-Path (Resolve-Path (Split-Path $OutputPath -Parent) -ErrorAction SilentlyContinue) -Parent
}
if (-not $outputDir) {
  $outputDir = (Resolve-Path (Split-Path $InputPath -Parent)).Path
}

& $libreOffice --headless --convert-to xlsx --outdir $outputDir $inputFull | Out-Null

$expected = Join-Path $outputDir ((Split-Path $inputFull -LeafBase) + ".xlsx")
if (-not (Test-Path $expected)) {
  throw "Falha ao gerar XLSX. Verifique se o LibreOffice concluiu a conversao."
}

Copy-Item -Path $expected -Destination $OutputPath -Force
Write-Output "XLSX gerado em: $OutputPath"
