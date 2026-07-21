'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Appointment } from '@socio247/domain';
import { getFirebaseClient } from '@/lib/firebase';
import { listClients } from '@/features/clients/clients.repository';
import { listServices } from '@/features/services/services.repository';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  createManualAppointment,
  listAppointmentsInRange,
  type ManualAppointmentInput,
} from './appointments.repository';
import { getDayRange, getMonthRange, getWeekRange } from './datetime';

export type AgendaView = 'calendar' | 'day' | 'week';

function rangeForView(view: AgendaView, referenceDate: Date) {
  if (view === 'day') return getDayRange(referenceDate);
  if (view === 'week') return getWeekRange(referenceDate);
  return getMonthRange(referenceDate);
}

export function useAgenda(view: AgendaView, referenceDate: Date) {
  const { db } = getFirebaseClient();
  const { user } = useAuth();
  const { workspaceId, isLoading: isWorkspaceLoading } = useWorkspace();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => rangeForView(view, referenceDate), [view, referenceDate]);

  const reload = useCallback(async () => {
    if (!workspaceId || !user) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setAppointments(
        await listAppointmentsInRange(db, workspaceId, user.uid, range.start, range.end),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar agenda');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [db, range.end, range.start, user, workspaceId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadOptions = useCallback(async () => {
    if (!workspaceId || !user) {
      return { clients: [], services: [] };
    }

    const [clients, services] = await Promise.all([
      listClients(db, workspaceId, user.uid),
      listServices(db, workspaceId, user.uid),
    ]);

    return {
      clients: clients.filter((client) => client.active),
      services: services.filter((service) => service.active),
    };
  }, [db, user, workspaceId]);

  const createManual = useCallback(
    async (input: ManualAppointmentInput) => {
      if (!workspaceId || !user) {
        throw new Error('Workspace ou usuário indisponível');
      }

      setIsSaving(true);
      setError(null);
      try {
        await createManualAppointment(db, workspaceId, user.uid, input);
        await reload();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao criar agendamento';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [db, reload, user, workspaceId],
  );

  return {
    appointments,
    range,
    isLoading: isLoading || isWorkspaceLoading,
    isSaving,
    error,
    workspaceId,
    reload,
    loadOptions,
    createManual,
  };
}
