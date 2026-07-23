'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { CalendarDays, Check, Clock3, MapPin, ShieldCheck } from 'lucide-react';
import type { Workspace } from '@socio247/domain';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/features/services/money';
import { formatSlotLabel } from '@/features/booking/slots';
import { usePublicBooking } from '@/features/booking/usePublicBooking';

function resolveBookingSlug(
  paramsSlug: string | string[] | undefined,
  pathname: string | null,
): string {
  if (typeof paramsSlug === 'string' && paramsSlug && paramsSlug !== '_') {
    return paramsSlug;
  }
  const fromPath = pathname?.match(/^\/b\/([^/]+)/)?.[1];
  return fromPath && fromPath !== '_' ? fromPath : '';
}

function formatAddress(workspace: Workspace): string | null {
  const address = workspace.address;
  if (!address) return null;
  const neighborhood = address.neighborhood ? `${address.neighborhood}, ` : '';
  return `${neighborhood}${address.city}/${address.state}`;
}

function formatFullAddress(workspace: Workspace): string | null {
  const address = workspace.address;
  if (!address) return null;
  return `${address.street}, ${address.number ?? 's/n'} — ${address.neighborhood ?? ''}, ${address.city}/${address.state}`;
}

function formatDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(year, month - 1, day));
}

export function BookingPageClient() {
  const params = useParams<{ slug?: string }>();
  const pathname = usePathname();
  const slug = resolveBookingSlug(params.slug, pathname);

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

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const canSubmit = Boolean(selectedService && selectedSlot && !isSaving && slots.length > 0);
  const summaryReady = Boolean(selectedService && selectedSlot);

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
      <main className="booking-shell flex items-center justify-center px-4">
        <div className="booking-panel booking-fade-in rounded-card px-6 py-5 text-sm text-ink-muted">
          Preparando sua agenda…
        </div>
      </main>
    );
  }

  if (!workspace) {
    return (
      <main className="booking-shell flex items-center justify-center px-4">
        <div className="booking-panel booking-fade-in max-w-md rounded-card px-6 py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Sócio247
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Link indisponível
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Não encontramos um estabelecimento ativo para este endereço.
          </p>
        </div>
      </main>
    );
  }

  const shortAddress = formatAddress(workspace);
  const fullAddress = formatFullAddress(workspace);

  return (
    <main className="booking-shell pb-28 md:pb-10">
      <header className="booking-hero">
        <div className="relative z-[1] mx-auto max-w-xl px-4 pb-10 pt-12 md:px-6 md:pb-12 md:pt-16">
          <p className="booking-fade-in text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
            Agendar online
          </p>
          <h1 className="booking-fade-in booking-fade-in-delay-1 mt-3 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-white md:text-5xl">
            {workspace.name}
          </h1>
          {shortAddress ? (
            <p className="booking-fade-in booking-fade-in-delay-2 mt-4 inline-flex items-center gap-2 text-sm text-white/70">
              <MapPin className="size-4 shrink-0 text-white/55" aria-hidden />
              {shortAddress}
            </p>
          ) : null}
          <p className="booking-fade-in booking-fade-in-delay-3 mt-4 max-w-md text-sm leading-relaxed text-white/65">
            Escolha o serviço, o horário e confirme com seu WhatsApp. Pagamento no local.
          </p>
        </div>
      </header>

      <div className="relative z-[1] mx-auto -mt-6 max-w-xl px-4 md:-mt-8 md:px-6">
        {successMessage ? (
          <div
            role="status"
            className="booking-panel booking-fade-in mb-4 rounded-card border border-[var(--success)]/20 bg-[var(--success-subtle)] px-4 py-4 text-sm text-[var(--success)]"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/80">
                <Check className="size-4" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-ink">Agendamento registrado</p>
                <p className="mt-1 leading-relaxed text-ink-soft">{successMessage}</p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="booking-panel mb-4 rounded-card border border-[var(--danger)]/20 bg-[var(--danger-subtle)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <form
          id="public-booking-form"
          onSubmit={handleSubmit}
          className="booking-panel booking-fade-in booking-fade-in-delay-1 space-y-8 rounded-card px-4 py-6 md:px-6 md:py-8"
          noValidate
        >
          <section className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Passo 1
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">Serviço</h2>
            </div>

            <div className="grid gap-2.5">
              {services.map((service) => {
                const isSelected = service.id === selectedServiceId;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    data-selected={isSelected}
                    className={cn(
                      'booking-service rounded-card border border-paper-line bg-white px-4 py-3.5 text-left',
                      isSelected && 'ring-1 ring-[var(--booking-accent)]/25',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">{service.name}</p>
                          {isSelected ? (
                            <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--booking-accent)] text-white">
                              <Check className="size-3" aria-hidden />
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                          <Clock3 className="size-3.5" aria-hidden />
                          {service.durationMinutes} min
                          {service.durationType === 'variable'
                            ? ' · confirmação do profissional'
                            : ''}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums text-ink">
                        {formatBRL(service.price.amountInCents)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Passo 2
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">Data</h2>
            </div>
            <label className="block">
              <span className="sr-only">Escolher data</span>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
                  aria-hidden
                />
                <input
                  type="date"
                  required
                  value={selectedDate}
                  min={minDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full rounded-input border border-paper-line bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus-visible:border-brand focus-visible:shadow-[var(--focus-ring-shadow)]"
                />
              </div>
              <p className="mt-2 text-sm capitalize text-ink-muted">
                {formatDateLabel(selectedDate)}
              </p>
            </label>
          </section>

          <section className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Passo 3
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Horário livre
              </h2>
            </div>

            {isSlotsLoading ? (
              <p className="text-sm text-ink-muted">Calculando horários disponíveis…</p>
            ) : slots.length === 0 ? (
              <div className="rounded-card border border-dashed border-paper-line bg-surface-sunken/60 px-4 py-5 text-sm text-ink-muted">
                Nenhum horário livre nesta data. Tente outro dia ou serviço.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.getTime() === slot.getTime();
                  return (
                    <button
                      key={slot.toISOString()}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      data-selected={isSelected}
                      className={cn(
                        'booking-slot rounded-input border px-2 py-2.5 text-sm font-semibold tabular-nums',
                        isSelected
                          ? 'border-ink bg-ink text-white'
                          : 'border-paper-line bg-white text-ink-soft hover:border-ink/30',
                      )}
                    >
                      {formatSlotLabel(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4 border-t border-paper-line pt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Passo 4
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Seus dados
              </h2>
            </div>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink-soft">Nome</span>
              <input
                required
                maxLength={120}
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                className="w-full rounded-input border border-paper-line bg-white px-3 py-3 text-sm outline-none transition focus-visible:border-brand focus-visible:shadow-[var(--focus-ring-shadow)]"
                placeholder="Como devemos te chamar?"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink-soft">WhatsApp</span>
              <input
                required
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full rounded-input border border-paper-line bg-white px-3 py-3 text-sm outline-none transition focus-visible:border-brand focus-visible:shadow-[var(--focus-ring-shadow)]"
                placeholder="(11) 99999-8888"
              />
            </label>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Ao agendar, você autoriza contato por WhatsApp para confirmação e lembretes (LGPD).
            </p>

            {fullAddress ? (
              <p className="rounded-card bg-surface-sunken/70 px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
                <span className="font-medium text-ink-soft">Local: </span>
                {fullAddress}
              </p>
            ) : null}

            {fieldError ? <p className="text-sm text-warn">{fieldError}</p> : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-button bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-soft disabled:opacity-50"
            >
              {isSaving
                ? 'Confirmando…'
                : selectedService?.durationType === 'variable'
                  ? 'Solicitar agendamento'
                  : 'Confirmar agendamento'}
            </button>
          </section>
        </form>

        <p className="mt-6 pb-4 text-center text-xs text-ink-muted">
          Agendamento seguro via Sócio247
        </p>
      </div>

      {summaryReady ? (
        <div className="booking-sticky fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[var(--booking-ink)]/95 px-4 py-3 text-white backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{selectedService?.name}</p>
              <p className="truncate text-xs text-white/65">
                {formatSlotLabel(selectedSlot!)} · {formatDateLabel(selectedDate)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">
              {selectedService ? formatBRL(selectedService.price.amountInCents) : null}
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
