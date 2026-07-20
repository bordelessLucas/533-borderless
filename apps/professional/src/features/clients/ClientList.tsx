'use client';

import { useMemo, useState } from 'react';
import type { Client } from '@socio247/domain';
import { formatPhoneDisplay, phoneMatchesQuery } from './phone';

function formatLastVisit(lastVisitAt?: string): string | null {
  if (!lastVisitAt) return null;
  const date = new Date(lastVisitAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function filterClients(clients: Client[], query: string): Client[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return clients;

  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(normalizedQuery) ||
      phoneMatchesQuery(client.phoneNumber, normalizedQuery),
  );
}

interface ClientListProps {
  clients: Client[];
  isSaving: boolean;
  onEdit: (client: Client) => void;
  onDeactivate: (client: Client) => void;
  onReactivate: (client: Client) => void;
}

export function ClientList({
  clients,
  isSaving,
  onEdit,
  onDeactivate,
  onReactivate,
}: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredClients = useMemo(
    () => filterClients(clients, searchQuery),
    [clients, searchQuery],
  );

  return (
    <div className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Buscar cliente</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-md border border-paper-line bg-paper-raised px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          placeholder="Nome ou telefone…"
        />
      </label>

      {clients.length === 0 ? (
        <p className="border-y border-paper-line py-8 text-sm text-ink-muted">
          Nenhum cliente cadastrado. Adicione o primeiro para montar recorrência e avisos.
        </p>
      ) : filteredClients.length === 0 ? (
        <p className="border-y border-paper-line py-8 text-sm text-ink-muted">
          Nenhum cliente encontrado para &quot;{searchQuery.trim()}&quot;.
        </p>
      ) : (
        <ul className="divide-y divide-paper-line border-y border-paper-line">
          {filteredClients.map((client) => {
            const lastVisitLabel = formatLastVisit(client.lastVisitAt);

            return (
              <li
                key={client.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink">{client.name}</p>
                  <p className="text-sm text-ink-muted">
                    {formatPhoneDisplay(client.phoneNumber)}
                  </p>
                  {!client.consentToContact ? (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-warn">
                      Sem consentimento LGPD
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {client.recurrenceIntervalDays ? (
                    <span className="text-sm text-ink-soft">
                      a cada {client.recurrenceIntervalDays} dias
                    </span>
                  ) : null}
                  {lastVisitLabel ? (
                    <span className="text-sm text-ink-muted">
                      última visita {lastVisitLabel}
                    </span>
                  ) : null}
                  {client.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-deep"
                    >
                      {tag}
                    </span>
                  ))}
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      client.active ? 'text-ok' : 'text-ink-muted'
                    }`}
                  >
                    {client.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEdit(client)}
                    disabled={isSaving}
                    className="text-sm font-semibold text-brand-deep hover:underline disabled:opacity-60"
                  >
                    Editar
                  </button>
                  {client.active ? (
                    <button
                      type="button"
                      onClick={() => onDeactivate(client)}
                      disabled={isSaving}
                      className="text-sm font-semibold text-warn hover:underline disabled:opacity-60"
                    >
                      Desativar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onReactivate(client)}
                      disabled={isSaving}
                      className="text-sm font-semibold text-ok hover:underline disabled:opacity-60"
                    >
                      Reativar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
