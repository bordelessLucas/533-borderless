import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { COLLECTIONS } from '@socio247/domain';
import { backfillTenantFields } from '@/lib/backfillTenantFields';
import { parseFirestoreDoc } from '@/lib/firestoreParse';

type SafeParseSchema<T> = {
  safeParse: (data: unknown) => { success: true; data: T } | { success: false };
};

function isPermissionError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes('insufficient permissions');
}

function parseDocs<T>(
  docs: QueryDocumentSnapshot[],
  schema: SafeParseSchema<T>,
): T[] {
  return docs
    .map((document) => parseFirestoreDoc(schema, document.data()))
    .filter((item): item is T => item !== null);
}

function sortItems<T>(items: T[], sortFn?: (a: T, b: T) => number): T[] {
  return sortFn ? [...items].sort(sortFn) : items;
}

async function readDocsByIds<T>(
  db: Firestore,
  workspaceId: string,
  subcollection: string,
  docIds: readonly string[],
  schema: SafeParseSchema<T>,
): Promise<T[]> {
  const items: T[] = [];

  for (const id of docIds) {
    try {
      const snap = await getDoc(
        doc(db, COLLECTIONS.workspaces, workspaceId, subcollection, id),
      );
      if (!snap.exists()) continue;

      const parsed = parseFirestoreDoc(schema, snap.data());
      if (parsed !== null) items.push(parsed);
    } catch {
      // doc inexistente ou sem permissão — tenta próximo id
    }
  }

  return items;
}

/**
 * Lista subcoleção do tenant com retry/backfill e fallback via getDoc (compatível com rules legacy).
 */
export async function listTenantCollection<T>(
  db: Firestore,
  workspaceId: string,
  ownerId: string,
  subcollection: string,
  schema: SafeParseSchema<T>,
  seedDocIds: readonly string[],
  sortFn?: (a: T, b: T) => number,
): Promise<T[]> {
  const col = collection(db, COLLECTIONS.workspaces, workspaceId, subcollection);

  const attemptQuery = async () => {
    const snap = await getDocs(query(col, where('ownerId', '==', ownerId)));
    return parseDocs(snap.docs, schema);
  };

  const attemptCollectionRead = async () => {
    const snap = await getDocs(col);
    return parseDocs(snap.docs, schema);
  };

  let items: T[] = [];

  try {
    items = await attemptQuery();
    if (items.length > 0) return sortItems(items, sortFn);
  } catch (err) {
    if (!isPermissionError(err)) throw err;
  }

  await backfillTenantFields(db, workspaceId, ownerId);

  try {
    items = await attemptQuery();
    if (items.length > 0) return sortItems(items, sortFn);
  } catch (err) {
    if (!isPermissionError(err)) throw err;
  }

  try {
    items = await attemptCollectionRead();
    if (items.length > 0) return sortItems(items, sortFn);
  } catch {
    // segue para fallback por id
  }

  items = await readDocsByIds(db, workspaceId, subcollection, seedDocIds, schema);
  return sortItems(items, sortFn);
}
