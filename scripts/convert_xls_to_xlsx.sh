#!/usr/bin/env bash
set -euo pipefail

INPUT_PATH=${1:-data/planilha_preco.xls}
OUTPUT_PATH=${2:-data/planilha_preco.xlsx}

if ! command -v soffice >/dev/null 2>&1; then
  echo "LibreOffice (soffice) nao encontrado. Instale o LibreOffice." >&2
  exit 1
fi

INPUT_FULL=$(readlink -f "$INPUT_PATH")
OUTPUT_DIR=$(dirname "$OUTPUT_PATH")

mkdir -p "$OUTPUT_DIR"
soffice --headless --convert-to xlsx --outdir "$OUTPUT_DIR" "$INPUT_FULL" >/dev/null

EXPECTED="$OUTPUT_DIR/$(basename "${INPUT_FULL%.*}").xlsx"
if [ ! -f "$EXPECTED" ]; then
  echo "Falha ao gerar XLSX. Verifique se o LibreOffice concluiu a conversao." >&2
  exit 1
fi

cp "$EXPECTED" "$OUTPUT_PATH"
echo "XLSX gerado em: $OUTPUT_PATH"
