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
import { ensureWorkspaceForUser } from '@/lib/workspaceAccess';

export interface SignUpInput {
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
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
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await ensureWorkspaceForUser(db, credential.user);
      await credential.user.getIdToken(true);
    },
    [auth, db],
  );

  const signUp = useCallback(
    async ({ email, password, businessName, ownerName }: SignUpInput) => {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await ensureWorkspaceForUser(db, credential.user, { businessName, ownerName });
      await credential.user.getIdToken(true);
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
