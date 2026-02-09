# RELATORIO_FINAL — Reset/Seed Firestore

Data: 2026-02-08

## O que foi feito
- Criado reset total do Firestore (todas as coleções raiz) sem prompt.
- Criado fluxo único para recriar o banco: reset + seed.
- Seed ficou com modo silencioso (`SEED_QUIET=true`) para não poluir o terminal.

## Execução (validado)
- `DANGER_DELETE_ALL=true npm run db:recreate` (resetou 17 coleções + seed OK)

## Smoke (dados no Firestore)
- `npm run smoke:firestore` (contagens por coleção para `SEED_EMPRESA_ID`)

## Comandos
- Reset total: `DANGER_DELETE_ALL=true npm run db:reset` (produção)
- Recriar tudo (reset + seed): `DANGER_DELETE_ALL=true npm run db:recreate` (produção)
- (Emulador) Reset/Recreate: basta setar `FIRESTORE_EMULATOR_HOST`.
- Seed somente: `npm run seed`

## Variáveis importantes
- `SEED_EMPRESA_ID`: tenant/empresa usada nos exemplos (default: `tenant-demo-001`).
- `SEED_QUIET=true`: reduz logs do seed.
- `DANGER_DELETE_ALL=true`: obrigatório para reset em PRODUÇÃO (no emulador não precisa).
- Credenciais (produção): `.secrets/serviceAccountKey.json` (Firebase Admin SDK).
- Emulador (opcional): `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`

## Erros comuns
- `Credenciais não encontradas`: faltando `.secrets/serviceAccountKey.json` (ou `GOOGLE_APPLICATION_CREDENTIALS`).

## Observações
- O reset remove todas as coleções raiz do Firestore (via `db.listCollections()`). Se existirem coleções novas, elas também serão apagadas.
- Se faltar credencial, os scripts falham com mensagem clara (produção).
