import { useCallback, useEffect, useState } from 'react';
import type { DailySummary } from '@socio247/domain';
import { getFirebaseClient } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  getTodayDailySummary,
  toggleChecklistItemDone,
} from '@/features/checklist/dailySummary.repository';

export function useDailyChecklist() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const { db } = getFirebaseClient();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user || !workspaceId) {
      setSummary(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const next = await getTodayDailySummary(db, workspaceId);
      setSummary(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar checklist');
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, workspaceId, db]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggleDone = useCallback(
    async (appointmentId: string, done: boolean) => {
      if (!workspaceId) return;
      const next = await toggleChecklistItemDone(db, workspaceId, appointmentId, done);
      if (next) setSummary(next);
    },
    [db, workspaceId],
  );

  return { summary, isLoading, error, reload, toggleDone };
}
