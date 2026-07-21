import { useEffect, useRef } from 'react';
import { getFirebaseClient } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { registerDevicePushToken } from '@/features/push/registerDeviceToken';

/** Registra/atualiza o token FCM quando o usuário entra no workspace. */
export function usePushRegistration() {
  const { user } = useAuth();
  const { workspaceId, isLoading } = useWorkspace();
  const { db } = getFirebaseClient();
  const registeredKey = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !workspaceId || isLoading) return;

    const key = `${workspaceId}:${user.uid}`;
    if (registeredKey.current === key) return;
    registeredKey.current = key;

    void registerDevicePushToken(db, workspaceId, user.uid).catch(() => {
      registeredKey.current = null;
    });
  }, [user, workspaceId, isLoading, db]);
}
