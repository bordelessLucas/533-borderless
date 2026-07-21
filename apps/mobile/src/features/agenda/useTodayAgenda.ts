import { useCallback, useEffect, useState } from 'react';
import type { Appointment } from '@socio247/domain';
import { getFirebaseClient } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { listTodayAppointments } from '@/features/agenda/appointments.repository';

export function useTodayAgenda() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const { db } = getFirebaseClient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user || !workspaceId) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const items = await listTodayAppointments(db, workspaceId, user.uid);
      setAppointments(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar agenda');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, workspaceId, db]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { appointments, isLoading, error, reload };
}
