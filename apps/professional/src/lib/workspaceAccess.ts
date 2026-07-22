import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { COLLECTIONS } from '@socio247/domain';
import { provisionWorkspaceClient } from '@/lib/provisionWorkspace';

export interface EnsureWorkspaceOptions {
  businessName: string;
  ownerName: string;
}

/**
 * Resolve o workspaceId do usuário autenticado.
 * Ordem: users/{uid}.workspaces → query workspaces.ownerId → null.
 */
export async function resolveWorkspaceId(
  db: Firestore,
  user: User,
): Promise<string | null> {
  const userSnap = await getDoc(doc(db, COLLECTIONS.users, user.uid));
  if (userSnap.exists()) {
    const workspaces = userSnap.data().workspaces as Record<string, string> | undefined;
    if (workspaces) {
      const first = Object.keys(workspaces)[0];
      if (first) return first;
    }
  }

  const owned = await getDocs(
    query(
      collection(db, COLLECTIONS.workspaces),
      where('ownerId', '==', user.uid),
      limit(1),
    ),
  );
  if (!owned.empty) {
    return owned.docs[0]!.id;
  }

  return null;
}

/**
 * Garante workspace. No cadastro, passa businessName/ownerName.
 * Se o Auth existir sem Firestore (provision falhou antes), recria com defaults.
 */
export async function ensureWorkspaceForUser(
  db: Firestore,
  user: User,
  opts?: EnsureWorkspaceOptions,
): Promise<string> {
  const existing = await resolveWorkspaceId(db, user);
  if (existing) return existing;

  const ownerName =
    opts?.ownerName?.trim() ||
    user.displayName?.trim() ||
    user.email?.split('@')[0] ||
    'Profissional';
  const businessName = opts?.businessName?.trim() || `${ownerName} — negócio`;

  return provisionWorkspaceClient(db, user, { businessName, ownerName });
}
