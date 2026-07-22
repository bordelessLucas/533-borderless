import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { COLLECTIONS, workspaceSchema } from '@socio247/domain';
import { createConverter } from '@socio247/firebase/converter';
import { parseSlugInput } from './slug';

const workspaceConverter = createConverter(workspaceSchema);

function nowIso(): string {
  return new Date().toISOString();
}

export async function getWorkspaceSlug(
  db: Firestore,
  workspaceId: string,
): Promise<string | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.workspaces, workspaceId));
  if (!snap.exists()) return null;
  const slug = snap.data().slug;
  return typeof slug === 'string' && slug.trim().length > 0 ? slug.trim() : null;
}

export async function isSlugAvailable(
  db: Firestore,
  slug: string,
  currentWorkspaceId?: string | null,
): Promise<boolean> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.workspaces).withConverter(workspaceConverter),
      where('slug', '==', slug),
      where('status', '==', 'active'),
      limit(1),
    ),
  );

  if (snap.empty) return true;
  return snap.docs[0]!.id === currentWorkspaceId;
}

export async function updateWorkspaceSlug(
  db: Firestore,
  workspaceId: string,
  uid: string,
  rawSlug: string,
): Promise<string> {
  const slug = parseSlugInput(rawSlug);
  const available = await isSlugAvailable(db, slug, workspaceId);
  if (!available) {
    throw new Error('Este endereço já está em uso. Escolha outro.');
  }

  await updateDoc(doc(db, COLLECTIONS.workspaces, workspaceId), {
    slug,
    updatedAt: nowIso(),
    updatedBy: uid,
  });

  return slug;
}
