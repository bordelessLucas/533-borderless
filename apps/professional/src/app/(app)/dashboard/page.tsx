import { AppShell } from '@/components/AppShell';
import { DailyChecklist } from '@/components/DailyChecklist';
import {
  bookingLink,
  formatBRL,
  statusLabel,
  todayAppointments,
  workspace,
} from '@/data/mock';

export default function DashboardPage() {
  const revenueCents = todayAppointments.reduce((sum, apt) => sum + apt.priceInCents, 0);

  return (
    <AppShell activeHref="/dashboard">
      <div className="space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Agenda de hoje
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink md:text-5xl text-balance">
              Mantenha a cadeira cheia.
            </h1>
            <p className="mt-3 max-w-lg text-base text-ink-muted">
              Lembretes, retornos e horários do dia — sem software complexo. Pagamento no local.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-paper-line pt-4 lg:border-t-0 lg:pt-0">
            <Metric label="Hoje" value={String(todayAppointments.length)} hint="atendimentos" />
            <Metric label="Previsto" value={formatBRL(revenueCents)} hint="no local" />
            <Metric label="Modo" value="Assistido" hint={`resumo ${workspace.dailySummaryTime}`} />
          </div>
        </section>

        <DailyChecklist />

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-bold tracking-tight">Horários de hoje</h2>
            <a
              href={bookingLink}
              className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
            >
              Link de agendamento
            </a>
          </div>
          <ul className="divide-y divide-paper-line border-y border-paper-line">
            {todayAppointments.map((apt) => (
              <li
                key={apt.id}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-baseline gap-4">
                  <span className="w-14 font-display text-xl font-bold text-ink">{apt.time}</span>
                  <div>
                    <p className="font-semibold text-ink">{apt.clientName}</p>
                    <p className="text-sm text-ink-muted">{apt.serviceName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-[3.5rem] sm:pl-0">
                  <span className="text-sm text-ink-soft">{statusLabel(apt.status)}</span>
                  <span className="text-sm font-semibold">{formatBRL(apt.priceInCents)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-bold tracking-tight text-ink md:text-2xl">
        {value}
      </p>
      <p className="text-xs text-ink-muted">{hint}</p>
    </div>
  );
}
