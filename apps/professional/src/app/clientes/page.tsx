import { AppShell } from '@/components/AppShell';
import { clients } from '@/data/mock';

export default function ClientesPage() {
  return (
    <AppShell activeHref="/clientes">
      <div className="space-y-8">
        <section>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Clientes</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Recorrência clara para você saber quem está perto de voltar — e avisar antes de
            esquecer.
          </p>
        </section>

        <ul className="divide-y divide-paper-line border-y border-paper-line">
          {clients.map((client) => (
            <li
              key={client.id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-ink">{client.name}</p>
                <p className="text-sm text-ink-muted">{client.phoneNumber}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {client.recurrenceIntervalDays ? (
                  <span className="text-sm text-ink-soft">
                    a cada {client.recurrenceIntervalDays} dias
                  </span>
                ) : null}
                {client.lastVisitLabel ? (
                  <span className="text-sm text-ink-muted">última visita {client.lastVisitLabel}</span>
                ) : null}
                {client.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-deep"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
