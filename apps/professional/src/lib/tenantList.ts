import {
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';
import { COLLECTIONS } from '@socio247/domain';
import type { z } from 'zod';
import { parseFirestoreDoc } from '@/lib/firestoreParse';

/**
 * Lista subcoleção do tenant filtrando por ownerId (exigido pelas Security Rules).
 * seedIds prioriza/ordena docs de seed quando presentes.
 */
export async function listTenantCollection<TSchema extends z.ZodTypeAny>(
  db: Firestore,
  workspaceId: string,
  ownerId: string,
  subcollection: string,
  schema: TSchema,
  seedIds: readonly string[] = [],
  sortFn?: (a: z.infer<TSchema>, b: z.infer<TSchema>) => number,
): Promise<Array<z.infer<TSchema>>> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.workspaces, workspaceId, subcollection),
      where('ownerId', '==', ownerId),
    ),
  );

  const items: Array<z.infer<TSchema>> = [];
  for (const document of snap.docs) {
    const parsed = parseFirestoreDoc(schema, { id: document.id, ...document.data() });
    if (parsed) items.push(parsed);
  }

  if (seedIds.length > 0) {
    const order = new Map(seedIds.map((id, index) => [id, index]));
    items.sort((a, b) => {
      const aId = (a as { id?: string }).id;
      const bId = (b as { id?: string }).id;
      const aRank = aId !== undefined && order.has(aId) ? order.get(aId)! : Number.MAX_SAFE_INTEGER;
      const bRank = bId !== undefined && order.has(bId) ? order.get(bId)! : Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;
      return sortFn ? sortFn(a, b) : 0;
    });
    return items;
  }

  if (sortFn) items.sort(sortFn);
  return items;
}
