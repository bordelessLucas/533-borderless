'use client';

import type { Appointment } from '@socio247/domain';
import { formatBRL } from '@/features/services/money';
import { formatAppointmentDayLabel, formatAppointmentTime } from './datetime';
import { statusLabel } from './status';

interface AppointmentListProps {
  appointments: Appointment[];
  referenceDate?: Date;
}

export function AppointmentList({ appointments, referenceDate = new Date() }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <p className="border-y border-[var(--border-subtle)] py-8 text-sm text-[var(--text-muted)]">
        Nenhum agendamento neste período. Registre um cliente que marcou pelo WhatsApp.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
      {appointments.map((appointment) => {
        const serviceNames = appointment.services.map((service) => service.name).join(', ');

        return (
          <li
            key={appointment.id}
            className="grid gap-2 py-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {formatAppointmentDayLabel(appointment.startAt, referenceDate)}
              </p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {formatAppointmentTime(appointment.startAt)}
              </p>
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{appointment.clientName}</p>
              <p className="text-sm text-[var(--text-muted)]">{serviceNames}</p>
            </div>
            <div className="flex items-center gap-4 sm:justify-end">
              <span className="text-sm text-[var(--text-secondary)]">
                {statusLabel(appointment.status)}
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {formatBRL(appointment.totalPrice.amountInCents)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
