# apps/backoffice

Painel administrativo da **Sócio247** (uso interno da empresa).

- **Stack alvo:** Next.js (App Router) + TypeScript + Tailwind + Firebase Admin.
- **Responsabilidades:** gestão de workspaces/profissionais, visão de billing (assinaturas Asaas), suporte, configurações globais e avisos.
- **Acesso:** apenas usuários com `platformRole` (`platform_admin` / `platform_support`).

> Scaffolding do app será criado na fase "Backoffice". A fundação (domínio + regras) já está pronta em `packages/domain` e `firestore.rules`.
