'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CreateServiceInput, Service } from '@socio247/domain';
import { getFirebaseClient } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  createService,
  listServices,
  setServiceActive,
  updateService,
  type ServiceFormInput,
} from './services.repository';

export function useServices() {
  const { db } = getFirebaseClient();
  const { user } = useAuth();
  const { workspaceId, isLoading: isWorkspaceLoading } = useWorkspace();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!workspaceId || !user) {
      setServices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setServices(await listServices(db, workspaceId, user.uid));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar serviços');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [db, user, workspaceId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (input: CreateServiceInput) => {
      if (!workspaceId || !user) {
        throw new Error('Workspace ou usuário indisponível');
      }
      setIsSaving(true);
      setError(null);
      try {
        await createService(db, workspaceId, user.uid, input);
        await reload();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao criar serviço';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [db, reload, user, workspaceId],
  );

  const update = useCallback(
    async (serviceId: string, input: ServiceFormInput) => {
      if (!workspaceId || !user) {
        throw new Error('Workspace ou usuário indisponível');
      }
      setIsSaving(true);
      setError(null);
      try {
        await updateService(db, workspaceId, serviceId, user.uid, input);
        await reload();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao atualizar serviço';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [db, reload, user, workspaceId],
  );

  const setActive = useCallback(
    async (serviceId: string, active: boolean) => {
      if (!workspaceId || !user) {
        throw new Error('Workspace ou usuário indisponível');
      }
      setIsSaving(true);
      setError(null);
      try {
        await setServiceActive(db, workspaceId, serviceId, user.uid, active);
        await reload();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao alterar status do serviço';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [db, reload, user, workspaceId],
  );

  return {
    services,
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
