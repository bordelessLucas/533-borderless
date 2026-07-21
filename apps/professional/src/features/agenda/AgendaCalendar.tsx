'use client';

import { useMemo } from 'react';
import type { Appointment } from '@socio247/domain';
import { formatBRL } from '@/features/services/money';
import { cn } from '@/lib/utils';
import {
  formatAppointmentTime,
  isSameLocalDay,
  startOfLocalDay,
} from './datetime';
import { statusLabel } from './status';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;
const PREVIEW_LIMIT = 2;

function appointmentsForDay(appointments: Appointment[], day: Date): Appointment[] {
  return appointments
    .filter((apt) => isSameLocalDay(new Date(apt.startAt), day))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

interface AgendaCalendarProps {
  month: Date;
  selectedDay: Date;
  appointments: Appointment[];
  onSelectDay: (day: Date) => void;
}

export function AgendaCalendar({
  month,
  selectedDay,
  appointments,
  onSelectDay,
}: AgendaCalendarProps) {
  const today = useMemo(() => startOfLocalDay(new Date()), []);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const weekday = firstOfMonth.getDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() + mondayOffset);
    gridStart.setHours(0, 0, 0, 0);

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return day;
    });
  }, [month]);

  return (
    <div className="rounded-card border border-[var(--border-subtle)] bg-white">
      <div className="grid grid-cols-7 rounded-t-[inherit] border-b border-[var(--border-subtle)] bg-slate-50">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          const dayAppointments = appointmentsForDay(appointments, day);
          const inCurrentMonth = day.getMonth() === month.getMonth();
          const isSelected = isSameLocalDay(day, selectedDay);
          const isToday = isSameLocalDay(day, today);
          const preview = dayAppointments.slice(0, PREVIEW_LIMIT);
          const overflow = dayAppointments.length - preview.length;
          const tooltipAbove = index >= 28;
          const col = index % 7;
          const tooltipAlign =
            col >= 5 ? 'right-0' : col === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2';

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(startOfLocalDay(day))}
              className={cn(
                'relative flex min-h-[7.5rem] flex-col gap-1 border-b border-r border-[var(--border-subtle)] p-1.5 text-left transition-colors',
                'hover:bg-slate-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
                !inCurrentMonth && 'bg-slate-50/60 text-[var(--text-muted)]',
                isSelected && 'bg-[var(--sidebar-active-bg)]/40',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                  isToday && 'bg-[var(--primary-default)] text-white',
                  !isToday && isSelected && 'text-[var(--sidebar-active-fg)]',
                )}
              >
                {day.getDate()}
              </span>

              <div className="flex min-h-0 flex-1 flex-col gap-0.5">
                {preview.map((appointment) => {
                  const serviceNames = appointment.services.map((s) => s.name).join(', ');
                  return (
                    <div key={appointment.id} className="group/apt relative z-0 hover:z-30">
                      <div
                        className={cn(
                          'truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight',
                          'bg-slate-100 text-[var(--text-secondary)]',
                          'group-hover/apt:bg-[var(--sidebar-active-bg)] group-hover/apt:text-[var(--sidebar-active-fg)]',
                        )}
                      >
                        <span className="font-semibold">
                          {formatAppointmentTime(appointment.startAt)}
                        </span>{' '}
                        {appointment.clientName}
                      </div>
                      <div
                        role="tooltip"
                        className={cn(
                          'pointer-events-none absolute z-40 w-56 rounded-md border border-[var(--border-subtle)] bg-white p-3 text-left shadow-lg',
                          'invisible opacity-0 transition group-hover/apt:visible group-hover/apt:opacity-100',
                          tooltipAlign,
                          tooltipAbove ? 'bottom-full mb-1' : 'top-full mt-1',
                        )}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          {formatAppointmentTime(appointment.startAt)}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                          {appointment.clientName}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{serviceNames}</p>
                        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                          <span>{statusLabel(appointment.status)}</span>
                          <span className="font-semibold text-[var(--text-primary)]">
                            {formatBRL(appointment.totalPrice.amountInCents)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {overflow > 0 ? (
                  <span className="px-1 text-[10px] font-semibold text-[var(--link)]">
                    +{overflow} mais — clique no dia
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
