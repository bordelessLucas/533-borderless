# Sócio247™

Plataforma para profissionais e pequenos negócios (barbearias, salões) manterem a
**agenda cheia**, aumentarem a **recorrência** dos clientes e **faturarem mais** —
sem software complexo e a um custo acessível (alvo ~R$50/mês).

> **Filtro de MVP:** todo recurso novo deve responder "sim" a uma das perguntas —
> _isso ajuda o profissional a conseguir mais clientes?_ ou
> _isso ajuda o profissional a fazer o cliente voltar?_ Se não, fica fora do MVP.

## Os 4 domínios

| Domínio            | Descrição                                                        | Onde                       |
| ------------------ | ---------------------------------------------------------------- | -------------------------- |
| **Backoffice**     | Administração da plataforma Sócio247                             | `apps/backoffice`          |
| **Billing**        | Relação comercial Sócio247 ↔ profissional (Asaas)               | `functions/src/billing`    |
| **App profissional** | Agenda, clientes, serviços, horários, bloqueios, faturamento   | `apps/professional`        |
| **Automation**     | Comunicação profissional ↔ cliente final (automática/assistida) | `functions/src/automation` |

## Comunicação com o cliente final

- **Automática (100%):** via API oficial de WhatsApp (quem integra).
- **Assistida:** resumo diário às **08:00** com mensagens prontas para copiar/colar +
  checklist de confirmação. Push avisa que o resumo está pronto.

## Estrutura (monorepo pnpm + Turborepo)

```
apps/
  backoffice/     # Next.js — admin Sócio247
  professional/   # App do profissional (migrado da Lovable: Supabase → Firebase)
  mobile/         # Expo — push para salões/profissionais
packages/
  domain/         # Tipos + schemas Zod (fonte de verdade do modelo de dados)
  firebase/       # Config + client SDK + conversores Firestore (Timestamp↔ISO + Zod)
functions/        # Cloud Functions (billing/Asaas, automation/resumo diário)
firestore.rules   # Isolamento multi-tenant via custom claims
```

## Modelo de dados (Firestore)

Multi-tenant: quase tudo vive sob `workspaces/{workspaceId}`.

```
platformAdmins/{uid}
users/{uid}
workspaces/{workspaceId}
  ├─ members/{uid}
  ├─ services/{serviceId}
  ├─ clients/{clientId}
  ├─ appointments/{appointmentId}
  ├─ availability/{providerId}
  ├─ timeBlocks/{blockId}
  ├─ dailySummaries/{YYYY-MM-DD}
  ├─ notifications/{id}
  └─ deviceTokens/{id}
subscriptions/{workspaceId}   # billing (Asaas)
webhookEvents/{eventId}       # idempotência de webhooks
```

Autorização por **custom claims**: `{ platformRole?, workspaces: { [id]: role } }`.

## Desenvolvimento

```bash
corepack enable pnpm      # habilita o pnpm
pnpm install              # instala dependências do monorepo
pnpm typecheck            # checa tipos de todos os pacotes
pnpm dev                  # sobe os apps em modo dev
```

Emuladores do Firebase:

```bash
npx firebase-tools emulators:start
```

## Roadmap

- **Fase 1 (atual):** fundação (domínio + regras), backoffice, billing (Asaas), app do
  profissional migrado, automação (resumo assistido + push). Pagamento presencial.
- **Fase 2:** gateway de pagamento para o cliente final → automação 100%; app para o
  cliente final.
