# App do profissional (web)

Next.js + TypeScript + Tailwind — UI com **dados mockados** alinhada à proposta Sócio247.

## Rodar

Na raiz do monorepo:

```bash
pnpm install
pnpm --filter @socio247/professional dev
```

Abre em [http://localhost:3000](http://localhost:3000) (ou a porta livre que o Next indicar).

Se o `pnpm --filter` falhar no install de scripts, rode direto:

```bash
cd apps/professional
./node_modules/.bin/next dev --port 3000
```

## Telas

| Rota | Conteúdo |
| --- | --- |
| `/dashboard` | Resumo 08:00 (checklist WhatsApp) + agenda do dia |
| `/agenda` | Atendimentos + bloqueios de horário |
| `/clientes` | Base com recorrência |
| `/servicos` | Catálogo com duração/preço |
| `/configuracoes` | Endereço, modo assistido, link de agendamento, assinatura |

Pagamento do cliente final: **no local**. Billing da plataforma: mock R$ 49,90/mês.
