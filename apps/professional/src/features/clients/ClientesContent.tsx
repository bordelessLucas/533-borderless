'use client';

import { useState } from 'react';
import type { Client } from '@socio247/domain';
import { AppShell } from '@/components/AppShell';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { ClientForm } from './ClientForm';
import { ClientList } from './ClientList';
import type { ClientFormInput } from './clients.repository';
import { useClients } from './useClients';

export function ClientesContent() {
  const { error: workspaceError, isLoading: isWorkspaceLoading } = useWorkspace();
  const { clients, isLoading, isSaving, error, workspaceId, create, update, setActive } =
    useClients();
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing] = useState<Client | null>(null);

  function openCreate() {
    setEditing(null);
    setMode('create');
  }

  function openEdit(client: Client) {
    setEditing(client);
    setMode('edit');
  }

  function closeForm() {
    setEditing(null);
    setMode('list');
  }

  async function handleSubmit(input: ClientFormInput) {
    if (mode === 'edit' && editing) {
      await update(editing.id, input);
    } else {
      await create(input);
    }
    closeForm();
  }

  async function handleDeactivate(client: Client) {
    const confirmed = window.confirm(
      `Desativar "${client.name}"? Ele deixa de aparecer em novos agendamentos.`,
    );
    if (!confirmed) return;
    await setActive(client.id, false);
    if (editing?.id === client.id) closeForm();
  }

  async function handleReactivate(client: Client) {
    await setActive(client.id, true);
  }

  if (isLoading || isWorkspaceLoading) {
    return (
      <AppShell activeHref="/clientes">
        <p className="text-ink-muted">Carregando clientes…</p>
      </AppShell>
    );
  }

  if (!workspaceId) {
    return (
      <AppShell activeHref="/clientes">
        <p className="text-warn">
          {workspaceError ?? 'Workspace não encontrado para este usuário.'}
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell activeHref="/clientes">
      <div className="space-y-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">Clientes</h1>
            <p className="mt-2 max-w-xl text-ink-muted">
              Recorrência clara para você saber quem está perto de voltar — e avisar antes de
              esquecer.
            </p>
          </div>
          {mode === 'list' ? (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper-raised transition hover:bg-ink-soft"
            >
              Novo cliente
            </button>
          ) : null}
        </section>

        {error ? <p className="text-sm text-warn">{error}</p> : null}

        {mode !== 'list' ? (
          <ClientForm
            client={mode === 'edit' ? editing : null}
            isSaving={isSaving}
            onCancel={closeForm}
            onSubmit={handleSubmit}
          />
        ) : null}

        <ClientList
          clients={clients}
          isSaving={isSaving}
          onEdit={openEdit}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
        />
      </div>
    </AppShell>
  );
}
