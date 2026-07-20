'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { workspaceSchema, type Workspace } from '@socio247/domain';
import { getFirebaseClient } from '@/lib/firebase';
import { parseFirestoreDoc } from '@/lib/firestoreParse';
import { ensureWorkspaceForUser } from '@/lib/workspaceAccess';
import { useAuth } from '@/providers/AuthProvider';

interface WorkspaceContextValue {
  workspace: Workspace | null;
  workspaceId: string | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { db } = getFirebaseClient();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(user));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) {
      setWorkspace(null);
      setWorkspaceId(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const id = await ensureWorkspaceForUser(db, user);
      setWorkspaceId(id);

      try {
        const snap = await getDoc(doc(db, 'workspaces', id));
        if (!snap.exists()) {
          setWorkspace(null);
          return;
        }

        const parsed = parseFirestoreDoc(workspaceSchema, snap.data());
        setWorkspace(parsed);
      } catch (readErr) {
        setWorkspace(null);
        setError(
          readErr instanceof Error
            ? readErr.message
            : 'Falha ao ler dados do workspace (metadados parciais)',
        );
      }
    } catch (err) {
      setWorkspace(null);
      setWorkspaceId(null);
      setError(err instanceof Error ? err.message : 'Falha ao carregar workspace');
    } finally {
      setIsLoading(false);
    }
  }, [user, db]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({ workspace, workspaceId, isLoading, error, reload }),
    [workspace, workspaceId, isLoading, error, reload],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace deve ser usado dentro de WorkspaceProvider');
  return ctx;
}
