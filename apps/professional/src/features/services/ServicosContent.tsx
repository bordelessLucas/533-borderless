'use client';

import { useMemo, useState } from 'react';
import { Plus, Scissors } from 'lucide-react';
import type { Service } from '@socio247/domain';
import { AppShell } from '@/components/AppShell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/patterns';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { cn } from '@/lib/utils';
import { ServiceForm } from './ServiceForm';
import { ServiceList } from './ServiceList';
import type { ServiceFormInput } from './services.repository';
import { useServices } from './useServices';

type Filter = 'all' | 'active' | 'inactive';

export function ServicosContent() {
  const { error: workspaceError, isLoading: isWorkspaceLoading } = useWorkspace();
  const { services, isLoading, isSaving, error, workspaceId, create, update, setActive } =
    useServices();
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing] = useState<Service | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const active = services.filter((s) => s.active).length;
    return { all: services.length, active, inactive: services.length - active };
  }, [services]);

  const filtered = useMemo(() => {
    if (filter === 'active') return services.filter((s) => s.active);
    if (filter === 'inactive') return services.filter((s) => !s.active);
    return services;
  }, [filter, services]);

  function openCreate() {
    setEditing(null);
    setMode('create');
  }

  function openEdit(service: Service) {
    setEditing(service);
    setMode('edit');
  }

  function closeForm() {
    setEditing(null);
    setMode('list');
  }

  async function handleSubmit(input: ServiceFormInput) {
    if (mode === 'edit' && editing) {
      await update(editing.id, input);
    } else {
      await create(input);
    }
    closeForm();
  }

  async function handleDeactivate(service: Service) {
    const confirmed = window.confirm(
      `Desativar "${service.name}"? Ele deixa de aparecer para novos agendamentos.`,
    );
    if (!confirmed) return;
    await setActive(service.id, false);
    if (editing?.id === service.id) closeForm();
  }

  async function handleReactivate(service: Service) {
    await setActive(service.id, true);
  }

  if (isLoading || isWorkspaceLoading) {
    return (
      <AppShell activeHref="/servicos">
        <p className="text-sm text-[var(--text-muted)]">Carregando serviços…</p>
      </AppShell>
    );
  }

  if (!workspaceId) {
    return (
      <AppShell activeHref="/servicos">
        <Alert variant="warning" description={workspaceError ?? 'Workspace não encontrado.'} />
      </AppShell>
    );
  }

  return (
    <AppShell activeHref="/servicos">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                ['all', 'Todos', counts.all],
                ['active', 'Ativos', counts.active],
                ['inactive', 'Inativos', counts.inactive],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium',
                  filter === key
                    ? 'bg-white text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)]',
                )}
              >
                {label} {count}
              </button>
            ))}
          </div>
          {mode === 'list' ? (
            <Button type="button" variant="ghost" size="sm" onClick={openCreate}>
              <Plus className="size-3.5" aria-hidden />
              Novo serviço
            </Button>
          ) : null}
        </div>

        {error ? <Alert variant="warning" description={error} /> : null}

        {mode !== 'list' ? (
          <ServiceForm
            service={mode === 'edit' ? editing : null}
            isSaving={isSaving}
            onCancel={closeForm}
            onSubmit={handleSubmit}
          />
        ) : null}

        {filtered.length === 0 && mode === 'list' ? (
          <EmptyState
            icon={Scissors}
            title="Nenhum serviço cadastrado"
            description="Adicione seu primeiro serviço para começar a receber agendamentos"
            action={
              <Button type="button" size="sm" onClick={openCreate}>
                <Plus className="size-3.5" aria-hidden />
                Novo serviço
              </Button>
            }
          />
        ) : mode === 'list' ? (
          <ServiceList
            services={filtered}
            isSaving={isSaving}
            onEdit={openEdit}
            onDeactivate={handleDeactivate}
            onReactivate={handleReactivate}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
