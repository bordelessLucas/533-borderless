'use client';

import { useMemo } from 'react';
import { AlarmClock, CalendarClock, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState, MetricCard } from '@/components/ui/patterns';
import { useClients } from '@/features/clients/useClients';

export default function RecorrenciaPage() {
  const { clients, isLoading } = useClients();

  const summary = useMemo(() => {
    const withRecurrence = clients.filter((c) => c.active && c.recurrenceIntervalDays);
    const without = clients.filter((c) => c.active && !c.recurrenceIntervalDays);
    return {
      onTrack: withRecurrence.length,
      upcoming: 0,
      overdue: 0,
      without: without.length,
    };
  }, [clients]);

  return (
    <AppShell activeHref="/recorrencia">
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Resumo</h2>
          {isLoading ? (
            <p className="text-sm text-[var(--text-muted)]">Carregando…</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard value={summary.onTrack} label="Clientes em dia" />
              <MetricCard value={summary.upcoming} label="Próximos retornos" />
              <MetricCard value={summary.overdue} label="Em atraso" />
              <MetricCard value={summary.without} label="Sem recorrência" />
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Clientes em atraso</h2>
          <EmptyState icon={AlarmClock} title="Nenhum cliente em atraso." />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Próximos retornos</h2>
          <EmptyState icon={CalendarClock} title="Nenhum retorno próximo." />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Regras de recorrência</h2>
          <EmptyState icon={RefreshCw} title="Nenhuma regra configurada" />
        </section>
      </div>
    </AppShell>
  );
}
