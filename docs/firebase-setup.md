# Firebase — setup do projeto `denilsson-e11e7` (plano Spark)

Sem Cloud Functions por enquanto (exige plano **Blaze**). O cadastro provisiona o workspace **direto no Firestore** pelo app web.

## 1. Console Firebase (manual)

1. [Authentication](https://console.firebase.google.com/project/denilsson-e11e7/authentication) → **Sign-in method** → habilitar **E-mail/Senha**
2. [Firestore](https://console.firebase.google.com/project/denilsson-e11e7/firestore) → criar banco (modo produção)

## 2. Variáveis locais

Configurado em `apps/professional/.env.local` (gitignored).

## 3. Deploy (somente rules — sem functions)

```bash
npx firebase-tools login

npx firebase-tools deploy --only firestore:rules,storage --project denilsson-e11e7
```

## 4. Rodar o web

```bash
pnpm --filter @socio247/professional dev
```

Abra `/login` → **Criar conta**.

No cadastro o app:

- cria workspace + membro owner no Firestore
- popula serviços, clientes, agenda e checklist do dia (seed)
- grava `users/{uid}` e `subscriptions/{workspaceId}` (trial)

## 5. Fluxo (sem Functions)

```
Cadastro → Firebase Auth → provisionWorkspaceClient (Firestore) → /dashboard
Login    → Firebase Auth → lê users/{uid} ou workspace por ownerId → /dashboard
```

## Quando migrar para Blaze

A pasta `functions/` fica pronta para:

- `provisionWorkspace` com custom claims (mais seguro)
- webhooks Asaas
- resumo diário 08:00 (Cloud Scheduler)

Até lá, as Security Rules usam `ownerId` e `members/{uid}` — sem custom claims.
