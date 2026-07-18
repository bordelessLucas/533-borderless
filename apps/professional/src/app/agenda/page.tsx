import { AppShell } from '@/components/AppShell';
import {
  formatBRL,
  statusLabel,
  timeBlocks,
  weekAppointments,
} from '@/data/mock';

export default function AgendaPage() {
  return (
    <AppShell activeHref="/agenda">
      <div className="space-y-10">
        <section>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Agenda</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Veja horários, bloqueie folgas com precisão e mantenha o dia organizado — pagamento
            continua no local.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">Próximos atendimentos</h2>
            <button
              type="button"
              className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-paper-raised"
            >
              Novo agendamento
            </button>
          </div>
          <ul className="divide-y divide-paper-line border-y border-paper-line">
            {weekAppointments.map((apt) => (
              <li
                key={apt.id}
                className="grid gap-2 py-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {apt.startLabel}
                  </p>
                  <p className="font-display text-xl font-bold">{apt.time}</p>
                </div>
                <div>
                  <p className="font-semibold">{apt.clientName}</p>
                  <p className="text-sm text-ink-muted">{apt.serviceName}</p>
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                  <span className="text-sm text-ink-soft">{statusLabel(apt.status)}</span>
                  <span className="text-sm font-semibold">{formatBRL(apt.priceInCents)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Bloqueios</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Folgas, almoço e imprevistos — um toque para fechar a agenda.
              </p>
            </div>
            <button
              type="button"
              className="rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm font-semibold text-ink-soft"
            >
              Bloquear horário
            </button>
          </div>
          <ul className="divide-y divide-paper-line border-y border-paper-line">
            {timeBlocks.map((block) => (
              <li key={block.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{block.label}</p>
                  <p className="text-sm text-ink-muted">
                    {block.startLabel} → {block.endLabel}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-warn">
                  Bloqueado
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
