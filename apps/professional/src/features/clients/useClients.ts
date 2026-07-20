'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Client, CreateClientInput } from '@socio247/domain';
import { getFirebaseClient } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  createClient,
  listClients,
  setClientActive,
  updateClient,
  type ClientFormInput,
} from './clients.repository';

export function useClients() {
  const { db } = getFirebaseClient();
  const { user } = useAuth();
  const { workspaceId, isLoading: isWorkspaceLoading } = useWorkspace();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!workspaceId || !user) {
      setClients([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setClients(await listClients(db, workspaceId, user.uid));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar clientes');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [db, user, workspaceId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (input: CreateClientInput) => {
      if (!workspaceId || !user) {
        throw new Error('Workspace ou usuário indisponível');
      }
      setIsSaving(true);
      setError(null);
      try {
        await createClient(db, workspaceId, user.uid, input);
        await reload();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao criar cliente';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [db, reload, user, workspaceId],
  );

  const update = useCallback(
    async (clientId: string, input: ClientFormInput) => {
      if (!workspaceId || !user) {
        throw new Error('Workspace ou usuário indisponível');
      }
      setIsSaving(true);
      setError(null);
      try {
        await updateClient(db, workspaceId, clientId, user.uid, input);
        await reload();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao atualizar cliente';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [db, reload, user, workspaceId],
  );

  const setActive = useCallback(
    async (clientId: string, active: boolean) => {
      if (!workspaceId || !user) {
        throw new Error('Workspace ou usuário indisponível');
      }
      setIsSaving(true);
      setError(null);
      try {
        await setClientActive(db, workspaceId, clientId, user.uid, active);
        await reload();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao alterar status do cliente';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [db, reload, user, workspaceId],
  );

  return {
    clients,
    isLoading: isLoading || isWorkspaceLoading,
    isSaving,
    error,
    workspaceId,
    reload,
    create,
    update,
    setActive,
  };
}
