'use client';

import { useState, type FormEvent } from 'react';
import type { Workspace } from '@socio247/domain';
import { formatBRL } from '@/features/services/money';
import { formatSlotLabel } from '@/features/booking/slots';
import { usePublicBooking } from '@/features/booking/usePublicBooking';

function formatAddress(workspace: Workspace): string | null {
  const address = workspace.address;
  if (!address) return null;
  return `${address.street}, ${address.number ?? 's/n'} — ${address.neighborhood ?? ''}, ${address.city}/${address.state}`;
}

interface BookingPageClientProps {
  slug: string;
}

export function BookingPageClient({ slug }: BookingPageClientProps) {
  const {
    workspace,
    services,
    selectedServiceId,
    setSelectedServiceId,
    selectedService,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    slots,
    isLoading,
    isSlotsLoading,
    isSaving,
    error,
    successMessage,
    submitBooking,
  } = usePublicBooking(slug);

  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    if (!selectedSlot) {
      setFieldError('Selecione um horário livre');
      return;
    }

    try {
      await submitBooking({ clientName, phoneNumber });
      setClientName('');
      setPhoneNumber('');
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : 'Falha ao agendar');
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
        <p className="text-ink-muted">Carregando agendamento…</p>
      </main>
    );
  }

  if (!workspace) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Link indisponível</h1>
          <p className="mt-2 text-ink-muted">
            Não encontramos um estabelecimento ativo para este endereço.
          </p>
        </div>
      </main>
    );
  }

  const addressLine = formatAddress(workspace);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 md:px-6">
      <header className="mb-8 border-b border-paper-line pb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Agendar online</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">{workspace.name}</h1>
        {addressLine ? <p className="mt-2 text-sm text-ink-muted">{addressLine}</p> : null}
        <p className="mt-3 text-sm text-ink-soft">
          Escolha o serviço, horário e confirme seu WhatsApp. Pagamento no local.
        </p>
      </header>

      {successMessage ? (
        <div className="mb-6 rounded-md border border-brand/20 bg-brand-soft px-4 py-3 text-sm text-brand-deep">
          {successMessage}
        </div>
      ) : null}

      {error ? <p className="mb-4 text-sm text-warn">{error}</p> : null}

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Serviço</h2>
          <div className="grid gap-2">
            {services.map((service) => {
              const isSelected = service.id === selectedServiceId;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`rounded-md border px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-brand bg-brand-soft'
                      : 'border-paper-line bg-paper-raised hover:bg-paper-raised/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-ink-muted">
                        {service.durationMinutes} min
                        {service.durationType === 'variable' ? ' · confirmação do profissional' : ''}
                      </p>
                    </div>
                    <span className="font-semibold">{formatBRL(service.price.amountInCents)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Data</h2>
          <input
            type="date"
            required
            value={selectedDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">Horário livre</h2>
          {isSlotsLoading ? (
            <p className="text-sm text-ink-muted">Calculando horários…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Nenhum horário livre nesta data. Tente outro dia ou serviço.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.getTime() === slot.getTime();
                return (
                  <button
                    key={slot.toISOString()}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                      isSelected
                        ? 'border-ink bg-ink text-paper-raised'
                        : 'border-paper-line bg-paper-raised text-ink-soft hover:bg-paper-raised/80'
                    }`}
                  >
                    {formatSlotLabel(slot)}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4 border-t border-paper-line pt-6">
          <h2 className="font-display text-2xl font-bold">Seus dados</h2>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Nome</span>
            <input
              required
              maxLength={120}
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              placeholder="Seu nome completo"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">WhatsApp</span>
            <input
              required
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              placeholder="(11) 99999-8888"
            />
          </label>

          <p className="text-xs text-ink-muted">
            Ao agendar, você autoriza contato por WhatsApp para confirmação e lembretes (LGPD).
          </p>

          {fieldError ? <p className="text-sm text-warn">{fieldError}</p> : null}

          <button
            type="submit"
            disabled={isSaving || !selectedService || !selectedSlot || services.length === 0}
            className="w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper-raised transition hover:bg-ink-soft disabled:opacity-60"
          >
            {isSaving
              ? 'Agendando…'
              : selectedService?.durationType === 'variable'
                ? 'Solicitar agendamento'
                : 'Confirmar agendamento'}
          </button>
        </section>
      </form>
    </main>
  );
}
