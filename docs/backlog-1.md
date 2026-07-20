# O que falta implementar — Sócio247

Documento vivo do backlog pós-fundação e web mock (18/07/2026).  
Filtro de MVP: *ajuda a conseguir mais clientes?* ou *ajuda o cliente a voltar?* Se não, fica de fora.

---

## 1. Infra e ambiente

- [x] Conectar projeto Firebase (`denilsson-e11e7`) e `.env.local` no app profissional
- [ ] Completar `pnpm install` estável na raiz (linking + builds `sharp`)
- [ ] Emuladores Firebase (Auth, Firestore, Functions) no fluxo de desenvolvimento
- [ ] Deploy inicial de **firestore:rules** + **storage** (sem functions — ver `docs/firebase-setup.md`)
- [ ] Secrets Asaas (`ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`) no Firebase

## 2. Migração do app da Lovable (Supabase → Firebase)

- [ ] Receber link/acesso Lovable e inventariar telas/fluxos existentes
- [ ] Mapear tabelas/policies Supabase → coleções/rules Firestore
- [ ] Migrar auth (usuários profissionais) para Firebase Auth + custom claims
- [ ] Trazer UI/fluxos úteis para `apps/professional` (substituindo mocks gradualmente)
- [ ] Cadastro de **endereço/local** (obrigatório na confirmação de agendamento)

## 3. App web do profissional (além do mock)

- [x] Auth real (login / cadastro / logout) — Firebase Auth
- [x] Provisionamento de workspace no cadastro (client-side Firestore — sem Blaze/Functions)
- [ ] Cloud Functions (Blaze): claims, Asaas, resumo 08:00 automático
- [x] Configurações lendo workspace do Firestore (com fallback mock)
- [ ] CRUD de serviços, clientes, horários de disponibilidade
- [ ] Criar/editar/cancelar agendamentos com cálculo de slots
- [ ] Bloqueio de horários (folgas, almoço, imprevistos) persistido
- [ ] Link público de agendamento (cliente final sem app)
- [ ] Confirmação automática pós-agendamento: **local + dia + horário**
- [ ] Faturamento do dia/período (precisão com snapshot de preço)
- [ ] Checklist diário ligado a dados reais (não mock)
- [ ] Indicadores de recorrência / clientes “quase na hora de voltar”

## 4. Backoffice Sócio247 (`apps/backoffice`)

- [ ] Scaffold Next.js do painel admin
- [ ] Login apenas `platform_admin` / `platform_support`
- [ ] Listagem e gestão de workspaces / profissionais
- [ ] Visão de assinaturas e status de cobrança
- [ ] Configurações e avisos globais da plataforma
- [ ] Suporte operacional (suspender workspace, etc.)

## 5. Billing — Sócio247 ↔ profissional (Asaas)

- [ ] Catálogo de planos (~R$50/mês Starter; Pro se necessário)
- [ ] Criação de customer + subscription no Asaas ao provisionar workspace
- [ ] Webhook: mapear `PAYMENT_*` / `SUBSCRIPTION_*` → `subscriptions/{workspaceId}`
- [ ] Trial, past_due, suspended, cancelled
- [ ] Push/aviso no app quando assinatura atrasada ou pendente
- [ ] Fluxo de reativação / 2ª via (PIX/boleto/cartão)

## 6. Automation — profissional ↔ cliente final

### Modo assistido (MVP prioritário)

- [ ] Job Cloud Scheduler: gerar `dailySummaries/{YYYY-MM-DD}` no horário do workspace (default 08:00)
- [ ] Mensagens prontas (lembrete, confirmação, retorno de recorrência) com endereço
- [ ] Push FCM avisando que o resumo do dia está pronto
- [ ] Checklist no web/mobile: copiar, marcar avisado, persistir estado

### Modo automático (quando houver API WhatsApp)

- [ ] Integração API oficial WhatsApp
- [ ] Envio automático de lembretes/confirmações
- [ ] Opt-in / consentimento (LGPD) por cliente

## 7. App mobile (`apps/mobile` — Expo)

- [ ] Scaffold Expo + Firebase Auth + FCM
- [ ] Push: resumo diário, lembretes operacionais, billing em atraso
- [ ] Checklist assistido (paridade com o web)
- [ ] Visão rápida da agenda do dia
- [ ] **Não** distribuir para cliente final nesta fase

## 8. Fase 2 (explícita — fora do MVP atual)

- [ ] Gateway de pagamento do **cliente final** (serviço)
- [ ] Automação 100% do fluxo de cobrança do atendimento
- [ ] App para o cliente final (se ainda fizer sentido após o link)

## 9. Qualidade, produto e go-to-market

- [ ] Testes de Security Rules (isolamento de tenant)
- [ ] Testes de domínio (slots, conflitos, bloqueios)
- [ ] Observabilidade (logs de webhook, falhas de push)
- [ ] Onboarding do profissional em poucos passos (objetivo do produto)
- [ ] Página/landing e fluxo de contratação (~R$50)
- [ ] Comparativo de diferenciais vs AppBarber (simples, barato, assistido)

---

## Ordem sugerida (próximas sprints)

1. Firebase real + auth do profissional  
2. Substituir mocks do web por dados Firestore (agenda, clientes, serviços, endereço)  
3. Automation assistida (resumo 08:00 + checklist)  
4. Backoffice mínimo + Billing Asaas  
5. Mobile Expo (push)  
6. Fase 2 (gateway cliente final)

## Referências no repo

- Fundação: `packages/domain`, `packages/firebase`, `functions/`, `firestore.rules`
- Web mock: `apps/professional`
- Checklist do dia: `docs/checklist-1.md`
