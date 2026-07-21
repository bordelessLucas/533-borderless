# App do profissional (web)

Next.js + TypeScript + Tailwind + **Firebase** (Auth + Firestore).

## Rodar

```bash
npm install
npm run dev:professional
```

Abre [http://localhost:3000/login](http://localhost:3000/login).

**Antes do primeiro cadastro:** siga `docs/firebase-setup.md` (Auth e-mail/senha, Firestore, deploy das **rules** — sem Functions no plano Spark).

## Telas

| Rota | Conteúdo |
| --- | --- |
| `/login` | Entrar ou criar conta (provisiona workspace) |
| `/dashboard` | Resumo 08:00 + agenda do dia (mock até ligar Firestore na agenda) |
| `/agenda` | Atendimentos + bloqueios |
| `/clientes` | Base com recorrência |
| `/servicos` | Catálogo |
| `/configuracoes` | Endereço, modo assistido, link — **lê Firestore quando logado** |
