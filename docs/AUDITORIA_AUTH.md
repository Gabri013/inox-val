# Auditoria de Auth

## Checklist
- [ ] Verificar login/signup/reset/logout.
- [ ] Corrigir erros de auth e mensagens.

## Resultado
- Status: OK (login/signup/reset/logout e guards revisados).
- Notas: AuthContext usa onAuthStateChanged, valida perfil ativo, seta empresaId e aplica redirect para /aguardando-liberacao. Mensagens de liberacao normalizadas em ASCII.
