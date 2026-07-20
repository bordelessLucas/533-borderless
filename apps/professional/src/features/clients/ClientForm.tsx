'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createClientInputSchema, type Client } from '@socio247/domain';
import { formatPhoneDisplay, normalizePhoneToE164 } from './phone';
import type { ClientFormInput } from './clients.repository';
import { formatTagsInput, parseTagsInput } from './tags';

export interface ClientFormValues {
  name: string;
  phoneNumber: string;
  email: string;
  notes: string;
  recurrenceIntervalDays: string;
  consentToContact: boolean;
  tagsInput: string;
  active: boolean;
}

const EMPTY_VALUES: ClientFormValues = {
  name: '',
  phoneNumber: '',
  email: '',
  notes: '',
  recurrenceIntervalDays: '',
  consentToContact: true,
  tagsInput: '',
  active: true,
};

function valuesFromClient(client: Client): ClientFormValues {
  return {
    name: client.name,
    phoneNumber: formatPhoneDisplay(client.phoneNumber),
    email: client.email ?? '',
    notes: client.notes ?? '',
    recurrenceIntervalDays: client.recurrenceIntervalDays?.toString() ?? '',
    consentToContact: client.consentToContact,
    tagsInput: formatTagsInput(client.tags),
    active: client.active,
  };
}

function toFormInput(values: ClientFormValues): ClientFormInput {
  const email = values.email.trim();
  const notes = values.notes.trim();
  const recurrenceRaw = values.recurrenceIntervalDays.trim();

  return createClientInputSchema.parse({
    name: values.name,
    phoneNumber: normalizePhoneToE164(values.phoneNumber),
    email: email.length > 0 ? email : undefined,
    notes: notes.length > 0 ? notes : undefined,
    recurrenceIntervalDays:
      recurrenceRaw.length > 0 ? Number(recurrenceRaw) : undefined,
    consentToContact: values.consentToContact,
    tags: parseTagsInput(values.tagsInput),
  });
}

interface ClientFormProps {
  client?: Client | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: ClientFormInput) => Promise<void>;
}

export function ClientForm({ client, isSaving, onCancel, onSubmit }: ClientFormProps) {
  const isEditing = Boolean(client);
  const [values, setValues] = useState<ClientFormValues>(
    client ? valuesFromClient(client) : EMPTY_VALUES,
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    setValues(client ? valuesFromClient(client) : EMPTY_VALUES);
    setFieldError(null);
  }, [client]);

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
            {isEditing ? 'Editar cliente' : 'Novo cliente'}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Telefone e consentimento LGPD são usados nas mensagens assistidas.
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
            placeholder="Ex.: João Ferreira"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Telefone</span>
          <input
            required
            type="tel"
            value={values.phoneNumber}
            onChange={(event) =>
              setValues((current) => ({ ...current, phoneNumber: event.target.value }))
            }
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            placeholder="(11) 99999-8888"
          />
          <span className="text-xs text-ink-muted">Salvo no formato internacional E.164.</span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">E-mail (opcional)</span>
          <input
            type="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            placeholder="cliente@email.com"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Recorrência (dias, opcional)</span>
          <input
            type="number"
            min={1}
            max={365}
            value={values.recurrenceIntervalDays}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                recurrenceIntervalDays: event.target.value,
              }))
            }
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            placeholder="Ex.: 21"
          />
          <span className="text-xs text-ink-muted">Usado para sugerir retorno do cliente.</span>
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-semibold">Tags (opcional)</span>
          <input
            value={values.tagsInput}
            onChange={(event) =>
              setValues((current) => ({ ...current, tagsInput: event.target.value }))
            }
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            placeholder="recorrente, vip"
          />
          <span className="text-xs text-ink-muted">Separe por vírgula. Máximo de 20 tags.</span>
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-semibold">Observações (opcional)</span>
          <textarea
            maxLength={1000}
            rows={3}
            value={values.notes}
            onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
            className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
            placeholder="Preferências, alergias, histórico…"
          />
        </label>

        <label className="flex items-start gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={values.consentToContact}
            onChange={(event) =>
              setValues((current) => ({ ...current, consentToContact: event.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-paper-line text-brand focus:ring-brand"
          />
          <span className="text-sm">
            <span className="font-semibold">Consentimento LGPD para contato</span>
            <span className="mt-0.5 block text-ink-muted">
              Cliente autoriza receber lembretes e mensagens de retorno por WhatsApp ou SMS.
            </span>
          </span>
        </label>

        {isEditing ? (
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) =>
                setValues((current) => ({ ...current, active: event.target.checked }))
              }
              className="h-4 w-4 rounded border-paper-line text-brand focus:ring-brand"
            />
            <span className="text-sm font-semibold">Cliente ativo</span>
          </label>
        ) : null}
      </div>

      {fieldError ? <p className="text-sm text-warn">{fieldError}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper-raised transition hover:bg-ink-soft disabled:opacity-60"
        >
          {isSaving ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar cliente'}
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
