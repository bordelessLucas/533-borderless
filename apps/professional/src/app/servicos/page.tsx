import { AppShell } from '@/components/AppShell';
import { formatBRL, services } from '@/data/mock';

export default function ServicosPage() {
  return (
    <AppShell activeHref="/servicos">
      <div className="space-y-8">
        <section>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Serviços</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Duração e preço certos alimentam a agenda e o faturamento previsto do dia.
          </p>
        </section>

        <ul className="divide-y divide-paper-line border-y border-paper-line">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: service.color }}
                  aria-hidden
                />
                <div>
                  <p className="font-semibold">{service.name}</p>
                  <p className="text-sm text-ink-muted">{service.durationMinutes} min</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-6 sm:pl-0">
                <span className="font-semibold">{formatBRL(service.priceInCents)}</span>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    service.active ? 'text-ok' : 'text-ink-muted'
                  }`}
                >
                  {service.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
