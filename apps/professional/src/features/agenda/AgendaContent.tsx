'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Lock, Plus, Users } from 'lucide-react';
import type { Appointment, Client, Service } from '@socio247/domain';
import { AppShell } from '@/components/AppShell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/patterns';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { cn } from '@/lib/utils';
import { AgendaCalendar } from './AgendaCalendar';
import { AppointmentList } from './AppointmentList';
import {
  formatMonthLabel,
  formatWeekRangeLabel,
  isSameLocalDay,
  startOfLocalDay,
} from './datetime';
import { ManualAppointmentModal } from './ManualAppointmentModal';
import { AgendaView, useAgenda } from './useAgenda';

function filterAppointmentsForDay(appointments: Appointment[], day: Date): Appointment[] {
  return appointments
    .filter((apt) => isSameLocalDay(new Date(apt.startAt), day))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function AgendaContent() {
  const { error: workspaceError, isLoading: isWorkspaceLoading } = useWorkspace();
  const [view, setView] = useState<AgendaView>('calendar');
  const [referenceDate, setReferenceDate] = useState(() => startOfLocalDay(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => startOfLocalDay(new Date()));
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

  const dayAppointments = useMemo(
    () => filterAppointmentsForDay(appointments, selectedDay),
    [appointments, selectedDay],
  );

  const listAppointments = view === 'calendar' ? dayAppointments : appointments;

  const periodLabel =
    view === 'day'
      ? referenceDate.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : view === 'week'
        ? formatWeekRangeLabel(range.start, range.end)
        : formatMonthLabel(referenceDate);

  const selectedDayLabel = selectedDay.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  function shiftPeriod(direction: -1 | 1) {
    setReferenceDate((current) => {
      const next = new Date(current);
      if (view === 'day') {
        next.setDate(next.getDate() + direction);
        setSelectedDay(startOfLocalDay(next));
      } else if (view === 'week') {
        next.setDate(next.getDate() + direction * 7);
      } else {
        next.setMonth(next.getMonth() + direction);
      }
      return startOfLocalDay(next);
    });
  }

  function handleSelectDay(day: Date) {
    const next = startOfLocalDay(day);
    setSelectedDay(next);
    if (view === 'day') {
      setReferenceDate(next);
    }
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches) {
      window.requestAnimationFrame(() => {
        document.getElementById('agenda-day-panel')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }

  if (isLoading || isWorkspaceLoading) {
    return (
      <AppShell activeHref="/agenda">
        <p className="text-sm text-[var(--text-muted)]">Carregando agenda…</p>
      </AppShell>
    );
  }

  if (!workspaceId) {
    return (
      <AppShell activeHref="/agenda">
        <Alert variant="warning" description={workspaceError ?? 'Workspace não encontrado.'} />
      </AppShell>
    );
  }

  return (
    <AppShell activeHref="/agenda">
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-[var(--text-muted)]" strokeWidth={1.75} />
            <h1 className="text-base font-semibold text-[var(--text-primary)]">Agenda</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="hidden shadow-none sm:inline-flex"
            >
              <Users className="size-3.5" aria-hidden />
              Todos os profissionais
            </Button>
            <Button type="button" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="size-3.5" aria-hidden />
              Novo
            </Button>
            <Button type="button" variant="secondary" size="sm" className="hidden sm:inline-flex" disabled>
              <Lock className="size-3.5" aria-hidden />
              Bloquear
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-1 overflow-x-auto rounded-lg bg-slate-50 p-1 sm:w-auto sm:overflow-visible sm:bg-transparent sm:p-0 sm:gap-2">
            {(
              [
                { id: 'calendar', label: 'Mês' },
                { id: 'day', label: 'Dia' },
                { id: 'week', label: 'Semana' },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setView(option.id);
                  if (option.id === 'day') {
                    setReferenceDate(selectedDay);
                  }
                }}
                className={cn(
                  'flex-1 rounded-md px-3 py-2 text-xs font-medium sm:flex-none sm:py-1.5',
                  view === option.id
                    ? 'bg-white text-[var(--text-primary)] shadow-sm sm:bg-slate-100 sm:shadow-none'
                    : 'text-[var(--text-muted)] hover:bg-slate-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => shiftPeriod(-1)}
              className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-slate-50 sm:size-8"
              aria-label="Período anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-0 flex-1 truncate text-center text-xs font-medium capitalize text-[var(--text-secondary)] sm:min-w-[10rem] sm:flex-none">
              {periodLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftPeriod(1)}
              className="inline-flex size-9 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-slate-50 sm:size-8"
              aria-label="Próximo período"
            >
              <ChevronRight className="size-4" />
            </button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 shadow-none"
              onClick={() => {
                const today = startOfLocalDay(new Date());
                setSelectedDay(today);
                setReferenceDate(today);
              }}
            >
              Hoje
            </Button>
          </div>
        </div>

        {error ? <Alert variant="warning" description={error} /> : null}
        {optionsError ? <Alert variant="warning" description={optionsError} /> : null}

        {view === 'calendar' ? (
          <div className="space-y-3 sm:space-y-4">
            <AgendaCalendar
              month={referenceDate}
              selectedDay={selectedDay}
              appointments={appointments}
              onSelectDay={handleSelectDay}
            />

            <section
              id="agenda-day-panel"
              className="scroll-mt-16 space-y-2 rounded-lg border border-[var(--border-subtle)] bg-white p-3 sm:space-y-3 sm:p-4"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Dia selecionado
                  </p>
                  <h2 className="truncate text-[13px] font-semibold capitalize text-[var(--text-primary)]">
                    {selectedDayLabel}
                  </h2>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium tabular-nums text-[var(--text-secondary)]">
                  {dayAppointments.length}
                </span>
              </div>

              {dayAppointments.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Sem horários neste dia"
                  description="Escolha outro dia ou crie um agendamento."
                  action={
                    <Button type="button" size="sm" onClick={() => setIsModalOpen(true)}>
                      <Plus className="size-3.5" aria-hidden />
                      Novo
                    </Button>
                  }
                />
              ) : (
                <AppointmentList
                  appointments={dayAppointments}
                  referenceDate={selectedDay}
                  compactDay
                />
              )}
            </section>
          </div>
        ) : listAppointments.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum agendamento neste período"
            description="Crie um agendamento manual ou aguarde reservas pelo link."
            action={
              <Button type="button" size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="size-3.5" aria-hidden />
                Novo agendamento
              </Button>
            }
          />
        ) : (
          <AppointmentList appointments={listAppointments} referenceDate={referenceDate} />
        )}
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
