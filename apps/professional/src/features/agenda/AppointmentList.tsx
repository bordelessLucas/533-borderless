'use client';

import type { Appointment, AppointmentStatus } from '@socio247/domain';
import { Badge } from '@/components/ui/badge';
import { formatBRL } from '@/features/services/money';
import { cn } from '@/lib/utils';
import { formatAppointmentDayLabel, formatAppointmentTime, isSameLocalDay } from './datetime';
import { statusLabel } from './status';

interface AppointmentListProps {
  appointments: Appointment[];
  referenceDate?: Date;
  /** No dia selecionado, omite o rótulo "Hoje"/data repetido em cada linha. */
  compactDay?: boolean;
}

function statusVariant(
  status: AppointmentStatus,
): 'default' | 'subtle' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return 'success';
    case 'pending':
    case 'scheduled':
      return 'warning';
    case 'cancelled':
    case 'no_show':
      return 'danger';
    default:
      return 'subtle';
  }
}

export function AppointmentList({
  appointments,
  referenceDate = new Date(),
  compactDay = false,
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--border-subtle)] px-3 py-6 text-center text-xs text-[var(--text-muted)]">
        Nenhum horário neste período.
      </p>
    );
  }

  return (
    <ul className="overflow-hidden rounded-lg border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
      {appointments.map((appointment, index) => {
        const serviceNames = appointment.services.map((service) => service.name).join(', ');
        const start = new Date(appointment.startAt);
        const showDayLabel = !compactDay;
        const isToday = isSameLocalDay(start, new Date());
        const duration = appointment.services.reduce((sum, s) => sum + s.durationMinutes, 0);

        return (
          <li
            key={appointment.id}
            className={cn(
              'flex gap-3 bg-white px-3 py-2.5 transition-colors hover:bg-slate-50/80',
              index === 0 && compactDay && 'bg-[var(--sidebar-active-bg)]/20',
            )}
          >
            <div className="flex w-12 shrink-0 flex-col items-end pt-0.5 sm:w-14">
              {showDayLabel ? (
                <span
                  className={cn(
                    'mb-0.5 text-[9px] font-semibold uppercase tracking-wide',
                    isToday ? 'text-[var(--sidebar-active-fg)]' : 'text-[var(--text-muted)]',
                  )}
                >
                  {formatAppointmentDayLabel(appointment.startAt, referenceDate)}
                </span>
              ) : null}
              <span className="text-[13px] font-semibold tabular-nums leading-none text-[var(--text-primary)]">
                {formatAppointmentTime(appointment.startAt)}
              </span>
              {duration > 0 ? (
                <span className="mt-1 text-[10px] tabular-nums text-[var(--text-muted)]">
                  {duration} min
                </span>
              ) : null}
            </div>

            <div
              className="relative mt-1 w-px shrink-0 self-stretch bg-[var(--border-subtle)]"
              aria-hidden
            >
              <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-[var(--sidebar-active-bar)]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold leading-tight text-[var(--text-primary)]">
                    {appointment.clientName}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                    {serviceNames}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[var(--text-primary)]">
                  {formatBRL(appointment.totalPrice.amountInCents)}
                </span>
              </div>
              <div className="mt-1.5">
                <Badge
                  variant={statusVariant(appointment.status)}
                  className="px-1.5 py-0 text-[10px] font-medium"
                >
                  {statusLabel(appointment.status)}
                </Badge>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
