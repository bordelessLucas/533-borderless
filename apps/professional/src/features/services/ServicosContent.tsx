'use client';

import { useState } from 'react';
import type { Service } from '@socio247/domain';
import { AppShell } from '@/components/AppShell';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { ServiceForm } from './ServiceForm';
import { ServiceList } from './ServiceList';
import type { ServiceFormInput } from './services.repository';
import { useServices } from './useServices';

export function ServicosContent() {
  const { error: workspaceError, isLoading: isWorkspaceLoading } = useWorkspace();
  const {
    services,
    isLoading,
    isSaving,
    error,
    workspaceId,
    create,
    update,
    setActive,
  } = useServices();
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing] = useState<Service | null>(null);

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
        <p className="text-ink-muted">Carregando serviços…</p>
      </AppShell>
    );
  }

  if (!workspaceId) {
    return (
      <AppShell activeHref="/servicos">
        <p className="text-warn">
          {workspaceError ?? 'Workspace não encontrado para este usuário.'}
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell activeHref="/servicos">
      <div className="space-y-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">Serviços</h1>
            <p className="mt-2 max-w-xl text-ink-muted">
              Duração e preço certos alimentam a agenda e o faturamento previsto do dia.
            </p>
          </div>
          {mode === 'list' ? (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper-raised transition hover:bg-ink-soft"
            >
              Novo serviço
            </button>
          ) : null}
        </section>

        {error ? <p className="text-sm text-warn">{error}</p> : null}

        {mode !== 'list' ? (
          <ServiceForm
            service={mode === 'edit' ? editing : null}
            isSaving={isSaving}
            onCancel={closeForm}
            onSubmit={handleSubmit}
          />
        ) : null}

        <ServiceList
          services={services}
          isSaving={isSaving}
          onEdit={openEdit}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
        />
      </div>
    </AppShell>
  );
}
