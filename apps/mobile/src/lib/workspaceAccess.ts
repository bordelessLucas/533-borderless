import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  provisionWorkspaceClient,
  type ProvisionInput,
} from '@/lib/provisionWorkspace';
import { backfillTenantFields } from '@/lib/backfillTenantFields';

export function buildDeterministicWorkspaceId(uid: string): string {
  return `ws_${uid.slice(0, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function defaultProvisionInput(user: User): ProvisionInput {
  return {
    businessName:
      user.displayName?.trim() || user.email?.split('@')[0]?.trim() || 'Meu negócio',
    ownerName: user.displayName?.trim() || 'Profissional',
  };
}

async function readOwnedWorkspaceId(
  db: Firestore,
  uid: string,
  workspaceId: string,
): Promise<string | null> {
  try {
    const workspaceSnap = await getDoc(doc(db, 'workspaces', workspaceId));
    if (workspaceSnap.exists() && workspaceSnap.data().ownerId === uid) {
      return workspaceId;
    }
  } catch {
    // Sem permissão ou indisponível — tenta outros caminhos
  }
  return null;
}

async function readMemberWorkspaceId(
  db: Firestore,
  uid: string,
  workspaceId: string,
): Promise<string | null> {
  try {
    const memberSnap = await getDoc(doc(db, 'workspaces', workspaceId, 'members', uid));
    if (memberSnap.exists()) {
      const data = memberSnap.data();
      return (data.workspaceId as string | undefined) ?? workspaceId;
    }
  } catch {
    // membro inexistente ou sem permissão
  }
  return null;
}

async function queryOwnedWorkspaceId(db: Firestore, uid: string): Promise<string | null> {
  try {
    const owned = await getDocs(
      query(collection(db, 'workspaces'), where('ownerId', '==', uid), limit(1)),
    );
    return owned.docs[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function resolveWorkspaceId(db: Firestore, uid: string): Promise<string | null> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      const workspaces = userSnap.data().workspaces as Record<string, string> | undefined;
      const ids = workspaces ? Object.keys(workspaces) : [];
      if (ids.length > 0) return ids[0]!;
    }
  } catch {
    // users/{uid} opcional para resolver workspace
  }

  const deterministicId = buildDeterministicWorkspaceId(uid);

  const ownedId = await readOwnedWorkspaceId(db, uid, deterministicId);
  if (ownedId) return ownedId;

  const memberId = await readMemberWorkspaceId(db, uid, deterministicId);
  if (memberId) return memberId;

  return queryOwnedWorkspaceId(db, uid);
}

export async function ensureUserWorkspaceLink(
  db: Firestore,
  uid: string,
  workspaceId: string,
  user: User,
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const iso = nowIso();
  const displayName =
    user.displayName?.trim() ||
    user.email?.split('@')[0]?.trim() ||
    'Profissional';

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      displayName,
      email: user.email ?? undefined,
      workspaces: { [workspaceId]: 'workspace_owner' },
      disabled: false,
      createdAt: iso,
      updatedAt: iso,
    });
    return;
  }

  const workspaces = (userSnap.data().workspaces as Record<string, string> | undefined) ?? {};
  if (workspaces[workspaceId]) return;

  await setDoc(
    userRef,
    {
      workspaces: { ...workspaces, [workspaceId]: 'workspace_owner' },
      updatedAt: iso,
    },
    { merge: true },
  );
}

/**
 * Garante workspace + seed no Firestore. Único ponto de provisionamento (cadastro e login).
 */
export async function ensureWorkspaceForUser(
  db: Firestore,
  user: User,
  input?: ProvisionInput,
): Promise<string> {
  const provisionInput = input ?? defaultProvisionInput(user);

  const { workspaceId } = await provisionWorkspaceClient(db, user, provisionInput);

  try {
    await backfillTenantFields(db, workspaceId, user.uid);
  } catch {
    // Backfill não deve bloquear o carregamento do workspace
  }

  try {
    await ensureUserWorkspaceLink(db, user.uid, workspaceId, user);
  } catch {
    // Link em users/{uid} é auxiliar; não bloqueia operação do workspace
  }

  return workspaceId;
}
