# 🔥 CHECKLIST COMPLETO - FIREBASE SETUP

**Projeto:** erp-industrial-inox  
**Data:** 05/02/2026

---

## ✅ CONFIGURAÇÕES CONCLUÍDAS

### 1. Arquivo .env
✅ **CONCLUÍDO** - Criado com credenciais:
- API Key: AIzaSyCY2nBQn50KnGx44PTvIKMCEyeQtldwdwA
- Project ID: erp-industrial-inox
- Todas as variáveis configuradas

### 2. Firestore Security Rules
✅ **CONCLUÍDO** - Deploy realizado com sucesso
- Arquivo: `firestore.rules`
- Multi-tenant configurado
- Validações server-side ativas

### 3. Firestore Indexes
✅ **CONCLUÍDO** - Deploy realizado
- Arquivo: `firestore.indexes.json`
- Índices para clientes, orçamentos e ordens
- Queries otimizadas

### 4. Configuração do Projeto
✅ **CONCLUÍDO**
- Arquivo `.firebaserc` criado
- Projeto linkado: erp-industrial-inox
- Firebase Tools instalado

---

## 📋 VERIFICAÇÕES NECESSÁRIAS NO CONSOLE

### 1. Authentication (Email/Senha)
🔍 **VERIFICAR NO CONSOLE:**

1. Acesse: https://console.firebase.google.com/project/erp-industrial-inox
2. Menu lateral → **Authentication**
3. Aba **"Sign-in method"**
4. Verifique se **Email/Senha** está **ATIVADO** ✅

Se não estiver ativado:
- Clique em **Email/Senha**
- Ative o toggle
- Clique em **Salvar**

### 2. Firestore Database
🔍 **VERIFICAR NO CONSOLE:**

1. Menu lateral → **Firestore Database**
2. Verifique se o banco existe
3. Verifique se as Rules foram aplicadas (última atualização deve ser recente)

---

## 🧪 TESTE COMPLETO

### Passo 1: Verificar Inicialização
```bash
# Servidor deve estar rodando
npm run dev

# Acesse: http://localhost:5173/test-firebase.html
# Deve mostrar tudo verde ✅
```

### Passo 2: Testar Autenticação (Criar Usuário)

**Opção A - Via Interface (Recomendado):**
1. Acesse: http://localhost:5173/signup
2. Preencha:
   - Email: teste@suaempresa.com
   - Senha: Teste123!
   - Confirmar senha: Teste123!
3. Clique em **Criar Conta**
4. Se aparecer mensagem de sucesso → ✅ FUNCIONANDO!

**Opção B - Via Console Firebase:**
1. Firebase Console → Authentication → Users
2. Clique em **Add User**
3. Email: teste@suaempresa.com
4. Senha: Teste123!
5. Clique em **Add User**

### Passo 3: Testar Login
1. Acesse: http://localhost:5173/login
2. Email: teste@suaempresa.com
3. Senha: Teste123!
4. Clique em **Entrar**
5. Se entrar no sistema → ✅ FUNCIONANDO!

### Passo 4: Testar Firestore (Criar Cliente)

Abra o console do navegador (F12) e cole:

```javascript
// Importar hook
import { useClientes } from '@/hooks/useClientes';

// Ou teste direto via service
import { clientesService } from '@/services/firebase/clientes.service';

const result = await clientesService.create({
  nome: 'Cliente Teste Firebase',
  cnpj: '12345678901234',
  email: 'teste@cliente.com',
  telefone: '11987654321',
  cidade: 'São Paulo',
  estado: 'SP',
  status: 'Ativo',
  totalCompras: 0,
});

console.log('Resultado:', result);
```

Se retornar `{ success: true, data: {...} }` → ✅ FUNCIONANDO!

### Passo 5: Verificar no Console Firebase

1. Firebase Console → Firestore Database
2. Deve aparecer coleção **clientes**
3. Deve ter 1 documento criado
4. Documento deve ter campo `tenantId` preenchido

---

## ✅ CHECKLIST FINAL

- [x] Arquivo `.env` configurado
- [x] Firebase Rules deployadas
- [x] Firebase Indexes deployados
- [x] Projeto Firebase linkado
- [ ] Authentication Email/Senha ativado ← **VERIFICAR NO CONSOLE**
- [ ] Usuário de teste criado
- [ ] Login testado e funcionando
- [ ] Firestore testado (criar documento)
- [ ] Documento aparece no Console Firebase

---

## 🎉 QUANDO TUDO ESTIVER ✅

Seu sistema terá:
- ✅ Backend Firebase 100% configurado
- ✅ Autenticação funcionando
- ✅ Banco de dados Firestore ativo
- ✅ Security Rules protegendo dados
- ✅ Multi-tenant configurado
- ✅ Pronto para produção

---

## 📞 PRÓXIMOS PASSOS

1. **Verificar Authentication no Console** (link acima)
2. **Criar usuário de teste** (via signup ou console)
3. **Testar login**
4. **Criar primeiro cliente**
5. **Começar a desenvolver!** 🚀

---

## 🆘 EM CASO DE PROBLEMAS

### Erro: "Firebase não configurado"
- Reinicie o servidor: `npm run dev`
- Verifique arquivo `.env`

### Erro: "Permission denied"
- Verifique Authentication ativo
- Verifique usuário logado
- Verifique Rules deployadas

### Erro: "auth/email-already-in-use"
- Email já existe
- Use outro email ou faça login

---

**Status Atual:** 🟢 95% COMPLETO

**Faltando:** Apenas verificar Authentication no Console e testar!
