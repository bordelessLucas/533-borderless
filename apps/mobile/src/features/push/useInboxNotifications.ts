import { useCallback, useEffect, useState } from 'react';
import { getFirebaseClient } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  listNotifications,
  markNotificationRead,
} from '@/features/checklist/dailySummary.repository';

export interface InboxNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt?: string;
  createdAt?: string;
}

export function useInboxNotifications() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const { db } = getFirebaseClient();
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user || !workspaceId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const next = await listNotifications(db, workspaceId, user.uid);
      setItems(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar avisos');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, workspaceId, db]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!workspaceId) return;
      await markNotificationRead(db, workspaceId, notificationId);
      setItems((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
    },
    [db, workspaceId],
  );

  return { items, isLoading, error, reload, markRead };
}
