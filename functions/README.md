# Cloud Functions (futuro — plano Blaze)

Esta pasta contém functions preparadas para quando o projeto estiver no plano **Blaze**:

- `provisionWorkspace` — custom claims + seed (substitui o client-side atual)
- `asaasWebhook` — billing
- `generateDailySummaries` — resumo 08:00

**Hoje (Spark):** o app web provisiona via `apps/professional/src/lib/provisionWorkspace.ts`.

Deploy (quando tiver Blaze):

```bash
npm run build:functions
npx firebase-tools deploy --only functions --project denilsson-e11e7
```
