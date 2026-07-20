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
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase';
import { ensureUserWorkspaceLink } from '@/lib/workspaceAccess';
import { provisionWorkspaceClient } from '@/lib/provisionWorkspace';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface SignUpInput {
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, db } = getFirebaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    [auth],
  );

  const signUp = useCallback(
    async ({ email, password, businessName, ownerName }: SignUpInput) => {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const { workspaceId } = await provisionWorkspaceClient(db, credential.user, {
        businessName,
        ownerName,
      });
      await ensureUserWorkspaceLink(db, credential.user.uid, workspaceId, credential.user);
    },
    [auth, db],
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, [auth]);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signUp, signOut }),
    [user, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

export { resolveWorkspaceId } from '@/lib/workspaceAccess';
