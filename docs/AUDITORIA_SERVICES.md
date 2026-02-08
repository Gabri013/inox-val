# Auditoria de Services e Firestore

## Checklist
- [x] Auditar services/hooks de escrita.
- [x] Garantir empresaId/tenant em tudo.
- [x] Corrigir problemas sem mudar rules.

## Resultado
- Status: OK.
- Notas: Revisao de services/hooks de escrita e base Firestore confirmou uso de empresaId via `getEmpresaContext` e validacao de tenant. Nao foram encontrados problemas adicionais nesta rodada.
