# Checklist — o que fizemos hoje (18/07/2026)

## Análise e alinhamento

- [x] Analisar o briefing do cliente (Sócio247™ vs AppBarber, preço ~R$50/mês, missão MVP)
- [x] Mapear os 4 domínios: Backoffice · Billing · App do profissional · Automation
- [x] Definir fase 1: pagamento no local, comunicação assistida (08:00) + push; app só para salões
- [x] Decidir stack: monorepo pnpm + Turborepo · TypeScript + Firebase · Expo (mobile depois)
- [x] Registrar que o app da Lovable hoje usa Supabase e será migrado para Firebase

## Fundação do repositório

- [x] Criar monorepo (`pnpm-workspace`, Turborepo, `tsconfig.base`, Prettier, `.gitignore`)
- [x] Criar `packages/domain` — schemas Zod (workspace, membros, serviços, clientes, agenda, disponibilidade/bloqueios, billing Asaas, notificações, resumo diário)
- [x] Criar `packages/firebase` — config, client SDK, converter Timestamp ↔ ISO + Zod
- [x] Criar `firestore.rules` + `storage.rules` + índices (isolamento multi-tenant via custom claims)
- [x] Criar `firebase.json` / `.firebaserc` / `.env.example`
- [x] Scaffold de Cloud Functions: webhook Asaas (stub) + job resumo diário 08:00 (stub)
- [x] Placeholders + README para `apps/backoffice`, `apps/professional`, `apps/mobile`
- [x] README raiz com arquitetura e roadmap
- [x] Gerar `pnpm-lock.yaml` e validar typecheck de domain / firebase / functions

## Web do profissional (mock)

- [x] Scaffold Next.js 15 + Tailwind em `apps/professional`
- [x] Design system leve (tokens Sócio247, tipografia Syne + Figtree, atmosfera)
- [x] Dados mockados: Barbado Norte, agenda, clientes, serviços, bloqueios, checklist WhatsApp
- [x] Página `/dashboard` — métricas do dia + checklist assistido (copiar/marcar) + horários
- [x] Página `/agenda` — atendimentos + bloqueios
- [x] Página `/clientes` — recorrência e tags
- [x] Página `/servicos` — catálogo com duração/preço
- [x] Página `/configuracoes` — endereço, modo assistido, link de agendamento, assinatura mock
- [x] App rodando localmente (dev server em `http://localhost:3001`)

## Observações do dia

- Install completo do monorepo teve atritos de rede / scripts do pnpm (`sharp`); o web profissional instalou e subiu via binário local do Next
- Ainda **não** há app mobile nem backoffice admin usável
- Ainda **não** há Firebase real conectado nem migração da Lovable
