'use client';

import { useMemo, useState } from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import type { Client } from '@socio247/domain';
import { AppShell } from '@/components/AppShell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState, MetricCard } from '@/components/ui/patterns';
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

  const summary = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.active).length;
    return { total, active, inactive: total - active };
  }, [clients]);

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
        <p className="text-sm text-[var(--text-muted)]">Carregando clientes…</p>
      </AppShell>
    );
  }

  if (!workspaceId) {
    return (
      <AppShell activeHref="/clientes">
        <Alert variant="warning" description={workspaceError ?? 'Workspace não encontrado.'} />
      </AppShell>
    );
  }

  return (
    <AppShell activeHref="/clientes">
      <div className="space-y-5">
        <div className="flex items-center justify-end">
          {mode === 'list' ? (
            <Button type="button" variant="ghost" size="sm" onClick={openCreate}>
              <Plus className="size-3.5" aria-hidden />
              Novo cliente
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard value={summary.total} label="Total" />
          <MetricCard value={summary.active} label="Ativos" />
          <MetricCard value={summary.inactive} label="Inativos" />
        </div>

        {error ? <Alert variant="warning" description={error} /> : null}

        {mode !== 'list' ? (
          <ClientForm
            client={mode === 'edit' ? editing : null}
            isSaving={isSaving}
            onCancel={closeForm}
            onSubmit={handleSubmit}
          />
        ) : null}

        {clients.length === 0 && mode === 'list' ? (
          <EmptyState
            icon={FolderOpen}
            title="Nenhum cliente cadastrado"
            description="Adicione seu primeiro cliente para acompanhar recorrência e retornos."
            action={
              <Button type="button" size="sm" onClick={openCreate}>
                <Plus className="size-3.5" aria-hidden />
                Novo cliente
              </Button>
            }
          />
        ) : mode === 'list' ? (
          <ClientList
            clients={clients}
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
