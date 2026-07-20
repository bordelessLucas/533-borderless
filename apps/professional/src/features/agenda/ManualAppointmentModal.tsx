'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Client, Service } from '@socio247/domain';
import { formatPhoneDisplay } from '@/features/clients/phone';
import {
  combineLocalDateAndTime,
  toLocalDateInputValue,
  toLocalTimeInputValue,
} from './datetime';
import type { ManualAppointmentInput } from './appointments.repository';

interface ManualAppointmentModalProps {
  isOpen: boolean;
  isSaving: boolean;
  clients: Client[];
  services: Service[];
  onClose: () => void;
  onSubmit: (input: ManualAppointmentInput) => Promise<void>;
}

export function ManualAppointmentModal({
  isOpen,
  isSaving,
  clients,
  services,
  onClose,
  onSubmit,
}: ManualAppointmentModalProps) {
  const now = new Date();
  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [dateValue, setDateValue] = useState(toLocalDateInputValue(now));
  const [timeValue, setTimeValue] = useState(toLocalTimeInputValue(now));
  const [notes, setNotes] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const resetNow = new Date();
    setClientId('');
    setServiceId('');
    setDateValue(toLocalDateInputValue(resetNow));
    setTimeValue(toLocalTimeInputValue(resetNow));
    setNotes('');
    setFieldError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    if (!clientId) {
      setFieldError('Selecione um cliente');
      return;
    }
    if (!serviceId) {
      setFieldError('Selecione um serviço');
      return;
    }

    try {
      const startAt = combineLocalDateAndTime(dateValue, timeValue).toISOString();
      const trimmedNotes = notes.trim();

      await onSubmit({
        clientId,
        serviceId,
        startAt,
        notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
      });
      onClose();
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : 'Falha ao salvar agendamento');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-appointment-title"
        className="w-full max-w-lg rounded-lg border border-paper-line bg-paper-raised p-6 shadow-soft"
      >
        <div className="mb-5">
          <h2 id="manual-appointment-title" className="font-display text-2xl font-bold">
            Novo agendamento manual
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Para clientes que marcaram pelo WhatsApp. O status será salvo como confirmado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Cliente</span>
            <select
              required
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            >
              <option value="">Selecione um cliente…</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} · {formatPhoneDisplay(client.phoneNumber)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Serviço</span>
            <select
              required
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            >
              <option value="">Selecione um serviço…</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {service.durationMinutes} min
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">Data</span>
              <input
                required
                type="date"
                value={dateValue}
                onChange={(event) => setDateValue(event.target.value)}
                className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">Horário</span>
              <input
                required
                type="time"
                value={timeValue}
                onChange={(event) => setTimeValue(event.target.value)}
                className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Observações (opcional)</span>
            <textarea
              maxLength={1000}
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              placeholder="Ex.: cliente pediu corte baixo nas laterais"
            />
          </label>

          {clients.length === 0 || services.length === 0 ? (
            <p className="text-sm text-warn">
              {clients.length === 0 && services.length === 0
                ? 'Cadastre clientes e serviços antes de criar um agendamento.'
                : clients.length === 0
                  ? 'Cadastre ao menos um cliente ativo.'
                  : 'Cadastre ao menos um serviço ativo.'}
            </p>
          ) : null}

          {fieldError ? <p className="text-sm text-warn">{fieldError}</p> : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-md px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-paper/70 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || clients.length === 0 || services.length === 0}
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper-raised transition hover:bg-ink-soft disabled:opacity-60"
            >
              {isSaving ? 'Salvando…' : 'Confirmar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
