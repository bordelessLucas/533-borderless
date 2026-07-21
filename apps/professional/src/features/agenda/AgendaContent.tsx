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
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[var(--text-muted)]" strokeWidth={1.75} />
            <h1 className="text-base font-semibold text-[var(--text-primary)]">Agenda</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="sm" className="shadow-none">
              <Users className="size-3.5" aria-hidden />
              Todos os profissionais
            </Button>
            <Button type="button" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="size-3.5" aria-hidden />
              Novo
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled>
              <Lock className="size-3.5" aria-hidden />
              Bloquear
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'calendar', label: 'Calendário' },
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
                  'rounded-md px-3 py-1.5 text-xs font-medium',
                  view === option.id
                    ? 'bg-slate-100 text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-slate-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftPeriod(-1)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-slate-50"
              aria-label="Período anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[10rem] text-center text-xs font-medium capitalize text-[var(--text-secondary)]">
              {periodLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftPeriod(1)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-slate-50"
              aria-label="Próximo período"
            >
              <ChevronRight className="size-4" />
            </button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shadow-none"
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
          <div className="space-y-5">
            <AgendaCalendar
              month={referenceDate}
              selectedDay={selectedDay}
              appointments={appointments}
              onSelectDay={handleSelectDay}
            />

            <section className="space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold capitalize text-[var(--text-primary)]">
                  {selectedDayLabel}
                </h2>
                <span className="text-xs text-[var(--text-muted)]">
                  {dayAppointments.length === 0
                    ? 'Sem agendamentos'
                    : `${dayAppointments.length} agendamento${dayAppointments.length === 1 ? '' : 's'}`}
                </span>
              </div>

              {dayAppointments.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Nenhum agendamento neste dia"
                  description="Clique em outro dia no calendário ou crie um novo agendamento."
                  action={
                    <Button type="button" size="sm" onClick={() => setIsModalOpen(true)}>
                      <Plus className="size-3.5" aria-hidden />
                      Novo agendamento
                    </Button>
                  }
                />
              ) : (
                <AppointmentList appointments={dayAppointments} referenceDate={selectedDay} />
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
