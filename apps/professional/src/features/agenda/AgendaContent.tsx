'use client';

import { useEffect, useState } from 'react';
import type { Client, Service } from '@socio247/domain';
import { AppShell } from '@/components/AppShell';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { timeBlocks } from '@/data/mock';
import { AgendaView, useAgenda } from './useAgenda';
import { AppointmentList } from './AppointmentList';
import { ManualAppointmentModal } from './ManualAppointmentModal';
import { formatWeekRangeLabel } from './datetime';

export function AgendaContent() {
  const { error: workspaceError, isLoading: isWorkspaceLoading } = useWorkspace();
  const [view, setView] = useState<AgendaView>('week');
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const { appointments, range, isLoading, isSaving, error, workspaceId, loadOptions, createManual } =
    useAgenda(view, referenceDate);

  useEffect(() => {
    if (!isModalOpen) return;

    void loadOptions()
      .then(({ clients: nextClients, services: nextServices }) => {
        setClients(nextClients);
        setServices(nextServices);
        setOptionsError(null);
      })
      .catch((err) => {
        setOptionsError(err instanceof Error ? err.message : 'Falha ao carregar opções');
      });
  }, [isModalOpen, loadOptions]);

  function shiftReference(days: number) {
    setReferenceDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + days);
      return next;
    });
  }

  function goToToday() {
    setReferenceDate(new Date());
  }

  const periodLabel =
    view === 'day'
      ? referenceDate.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : formatWeekRangeLabel(range.start, range.end);

  if (isLoading || isWorkspaceLoading) {
    return (
      <AppShell activeHref="/agenda">
        <p className="text-ink-muted">Carregando agenda…</p>
      </AppShell>
    );
  }

  if (!workspaceId) {
    return (
      <AppShell activeHref="/agenda">
        <p className="text-warn">
          {workspaceError ?? 'Workspace não encontrado para este usuário.'}
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell activeHref="/agenda">
      <div className="space-y-10">
        <section>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Agenda</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Veja horários, registre marcações do WhatsApp e mantenha o dia organizado — pagamento
            continua no local.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-bold">Atendimentos</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setView('day')}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                    view === 'day'
                      ? 'bg-ink text-paper-raised'
                      : 'bg-paper-raised text-ink-soft hover:bg-paper-raised/70'
                  }`}
                >
                  Dia
                </button>
                <button
                  type="button"
                  onClick={() => setView('week')}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                    view === 'week'
                      ? 'bg-ink text-paper-raised'
                      : 'bg-paper-raised text-ink-soft hover:bg-paper-raised/70'
                  }`}
                >
                  Semana
                </button>
              </div>
              <p className="text-sm capitalize text-ink-muted">{periodLabel}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => shiftReference(view === 'day' ? -1 : -7)}
                className="rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm font-semibold text-ink-soft"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm font-semibold text-ink-soft"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => shiftReference(view === 'day' ? 1 : 7)}
                className="rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm font-semibold text-ink-soft"
              >
                Próximo
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-paper-raised"
              >
                Novo agendamento manual
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-warn">{error}</p> : null}
          {optionsError ? <p className="text-sm text-warn">{optionsError}</p> : null}

          <AppointmentList appointments={appointments} referenceDate={referenceDate} />
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Bloqueios</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Folgas, almoço e imprevistos — em breve persistidos no Firestore.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm font-semibold text-ink-muted opacity-60"
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

      <ManualAppointmentModal
        isOpen={isModalOpen}
        isSaving={isSaving}
        clients={clients}
        services={services}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createManual}
      />
    </AppShell>
  );
}
