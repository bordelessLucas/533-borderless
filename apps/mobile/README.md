# apps/mobile

App mobile **para salões/profissionais** (fase 1 — sem gateway de pagamento).

- **Stack:** React Native (Expo Router, **SDK 54**) + TypeScript + Firebase (Auth + FCM).
- **Foco fase 1:**
  - Auth (mesmo projeto Firebase do web)
  - Checklist do resumo assistido (08:00)
  - Agenda do dia
  - Avisos in-app + registro de `deviceTokens` para push
- **Não** é baixado pelo cliente final nesta fase.

## Desenvolvimento

```bash
# na raiz do monorepo
npm install
npm run dev:mobile
```

Variáveis em `apps/mobile/.env.local` (`EXPO_PUBLIC_FIREBASE_*`).

Push nativo completo (FCM/APNs) exige build nativo / EAS e credenciais; no Expo Go o app registra o token disponível e persiste em Firestore.
