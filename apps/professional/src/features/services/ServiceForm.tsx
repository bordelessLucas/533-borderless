'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createServiceInputSchema, type Service } from '@socio247/domain';
import { centsToReais, reaisToCents } from './money';
import type { ServiceFormInput } from './services.repository';

const COLOR_PRESETS = ['#0F766E', '#B45309', '#1D4ED8', '#BE123C', '#7C3AED', '#6B7280'] as const;

export interface ServiceFormValues {
  name: string;
  description: string;
  durationMinutes: number;
  priceReais: number;
  bufferMinutes: number;
  color: string;
  active: boolean;
}

const EMPTY_VALUES: ServiceFormValues = {
  name: '',
  description: '',
  durationMinutes: 30,
  priceReais: 0,
  bufferMinutes: 0,
  color: COLOR_PRESETS[0],
  active: true,
};

function valuesFromService(service: Service): ServiceFormValues {
  return {
    name: service.name,
    description: service.description ?? '',
    durationMinutes: service.durationMinutes,
    priceReais: centsToReais(service.price.amountInCents),
    bufferMinutes: service.bufferMinutes,
    color: service.color ?? COLOR_PRESETS[0],
    active: service.active,
  };
}

function toFormInput(values: ServiceFormValues): ServiceFormInput {
  const description = values.description.trim();
  return createServiceInputSchema.parse({
    name: values.name,
    description: description.length > 0 ? description : undefined,
    durationMinutes: values.durationMinutes,
    price: {
      amountInCents: reaisToCents(values.priceReais),
      currency: 'BRL',
    },
    bufferMinutes: values.bufferMinutes,
    color: values.color || undefined,
  });
}

interface ServiceFormProps {
  service?: Service | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: ServiceFormInput) => Promise<void>;
}

export function ServiceForm({ service, isSaving, onCancel, onSubmit }: ServiceFormProps) {
  const isEditing = Boolean(service);
  const [values, setValues] = useState<ServiceFormValues>(
    service ? valuesFromService(service) : EMPTY_VALUES,
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    setValues(service ? valuesFromService(service) : EMPTY_VALUES);
    setFieldError(null);
  }, [service]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    try {
      const input = toFormInput(values);
      await onSubmit(isEditing ? { ...input, active: values.active } : input);
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : 'Dados inválidos');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 border-y border-paper-line bg-paper-raised/50 py-6"
      noValidate
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">
            {isEditing ? 'Editar serviço' : 'Novo serviço'}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Duração e preço alimentam a agenda e o faturamento previsto.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-ink-muted hover:text-ink"
        >
          Cancelar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-semibold">Nome</span>
          <input
            required
            maxLength={120}
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            placeholder="Ex.: Corte masculino"
          />
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-semibold">Descrição (opcional)</span>
          <textarea
            maxLength={500}
            rows={2}
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            placeholder="Detalhes do serviço"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Duração (min)</span>
          <input
            type="number"
            required
            min={5}
            max={600}
            step={5}
            value={values.durationMinutes}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                durationMinutes: Number(event.target.value),
              }))
            }
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Preço (R$)</span>
          <input
            type="number"
            required
            min={0}
            step={0.01}
            value={values.priceReais}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                priceReais: Number(event.target.value),
              }))
            }
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Buffer (min)</span>
          <input
            type="number"
            min={0}
            max={120}
            step={5}
            value={values.bufferMinutes}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                bufferMinutes: Number(event.target.value),
              }))
            }
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
          <span className="text-xs text-ink-muted">Intervalo de limpeza/preparo após o serviço.</span>
        </label>

        {isEditing ? (
          <label className="flex items-center gap-2 self-end pb-2">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) =>
                setValues((current) => ({ ...current, active: event.target.checked }))
              }
              className="h-4 w-4 rounded border-paper-line text-brand focus:ring-brand"
            />
            <span className="text-sm font-semibold">Serviço ativo</span>
          </label>
        ) : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Cor na agenda</legend>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((color) => {
            const isSelected = values.color.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                aria-label={`Cor ${color}`}
                aria-pressed={isSelected}
                onClick={() => setValues((current) => ({ ...current, color }))}
                className={`h-8 w-8 rounded-full transition ${
                  isSelected ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
      </fieldset>

      {fieldError ? <p className="text-sm text-warn">{fieldError}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper-raised transition hover:bg-ink-soft disabled:opacity-60"
        >
          {isSaving ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar serviço'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-md px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-paper-raised/70 disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
