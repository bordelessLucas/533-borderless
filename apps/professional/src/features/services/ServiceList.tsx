'use client';

import type { Service } from '@socio247/domain';
import { formatBRL } from './money';

interface ServiceListProps {
  services: Service[];
  isSaving: boolean;
  onEdit: (service: Service) => void;
  onDeactivate: (service: Service) => void;
  onReactivate: (service: Service) => void;
}

export function ServiceList({
  services,
  isSaving,
  onEdit,
  onDeactivate,
  onReactivate,
}: ServiceListProps) {
  if (services.length === 0) {
    return (
      <p className="border-y border-paper-line py-8 text-sm text-ink-muted">
        Nenhum serviço cadastrado. Crie o primeiro para alimentar a agenda.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-paper-line border-y border-paper-line">
      {services.map((service) => (
        <li
          key={service.id}
          className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: service.color ?? '#6B7280' }}
              aria-hidden
            />
            <div>
              <p className="font-semibold">{service.name}</p>
              <p className="text-sm text-ink-muted">
                {service.durationMinutes} min
                {service.bufferMinutes > 0 ? ` · +${service.bufferMinutes} min buffer` : ''}
              </p>
              {service.description ? (
                <p className="mt-1 max-w-xl text-sm text-ink-soft">{service.description}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pl-6 sm:pl-0">
            <span className="font-semibold">{formatBRL(service.price.amountInCents)}</span>
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                service.active ? 'text-ok' : 'text-ink-muted'
              }`}
            >
              {service.active ? 'Ativo' : 'Inativo'}
            </span>
            <button
              type="button"
              onClick={() => onEdit(service)}
              disabled={isSaving}
              className="text-sm font-semibold text-brand-deep hover:underline disabled:opacity-60"
            >
              Editar
            </button>
            {service.active ? (
              <button
                type="button"
                onClick={() => onDeactivate(service)}
                disabled={isSaving}
                className="text-sm font-semibold text-warn hover:underline disabled:opacity-60"
              >
                Desativar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReactivate(service)}
                disabled={isSaving}
                className="text-sm font-semibold text-ok hover:underline disabled:opacity-60"
              >
                Reativar
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
