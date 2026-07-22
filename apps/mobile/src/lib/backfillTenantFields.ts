import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { COLLECTIONS, WORKSPACE_SUBCOLLECTIONS } from '@socio247/domain';
import { tenantFirestoreFields } from '@/lib/tenantFirestore';

const SEED_SERVICE_IDS = ['svc_corte', 'svc_barba', 'svc_combo'] as const;
const SEED_CLIENT_IDS = ['cli_joao', 'cli_rafa', 'cli_pedro', 'cli_andre', 'cli_lucas'] as const;
const SEED_APPOINTMENT_IDS = ['apt_1', 'apt_2', 'apt_3', 'apt_4'] as const;

async function backfillDocOwner(
  db: Firestore,
  workspaceId: string,
  subcollection: string,
  docId: string,
  ownerId: string,
): Promise<void> {
  const ref = doc(db, COLLECTIONS.workspaces, workspaceId, subcollection, docId);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    if (data.ownerId === ownerId && data.workspaceId === workspaceId) return;

    await updateDoc(ref, tenantFirestoreFields(ownerId, workspaceId));
  } catch {
    // Doc inexistente, sem permissão ou já atualizado
  }
}

/**
 * Preenche ownerId/workspaceId/workspaceStatus em docs seed criados antes da denormalização.
 * Usa getDoc por id (compatível com rules legacy); list queries exigem ownerId no documento.
 */
export async function backfillTenantFields(
  db: Firestore,
  workspaceId: string,
  ownerId: string,
): Promise<void> {
  try {
    const workspaceSnap = await getDoc(doc(db, COLLECTIONS.workspaces, workspaceId));
    if (workspaceSnap.exists() && workspaceSnap.data().ownerId !== ownerId) return;
  } catch {
    // Continua tentando backfill nos ids conhecidos
  }

  await Promise.all([
    ...SEED_SERVICE_IDS.map((id) =>
      backfillDocOwner(db, workspaceId, WORKSPACE_SUBCOLLECTIONS.services, id, ownerId),
    ),
    ...SEED_CLIENT_IDS.map((id) =>
      backfillDocOwner(db, workspaceId, WORKSPACE_SUBCOLLECTIONS.clients, id, ownerId),
    ),
    ...SEED_APPOINTMENT_IDS.map((id) =>
      backfillDocOwner(
        db,
        workspaceId,
        WORKSPACE_SUBCOLLECTIONS.appointments,
        id,
        ownerId,
      ),
    ),
  ]);

  const availabilityRef = doc(
    db,
    COLLECTIONS.workspaces,
    workspaceId,
    WORKSPACE_SUBCOLLECTIONS.availability,
    ownerId,
  );
  try {
    const snap = await getDoc(availabilityRef);
    if (snap.exists()) {
      await updateDoc(availabilityRef, tenantFirestoreFields(ownerId, workspaceId));
    }
  } catch {
    // availability opcional
  }

  const summaryRef = doc(
    db,
    COLLECTIONS.workspaces,
    workspaceId,
    WORKSPACE_SUBCOLLECTIONS.dailySummaries,
    new Date().toISOString().slice(0, 10),
  );
  try {
    const snap = await getDoc(summaryRef);
    if (snap.exists()) {
      await updateDoc(summaryRef, tenantFirestoreFields(ownerId, workspaceId));
    }
  } catch {
    // resumo opcional
  }
}

/** Atualiza campos de tenant em lote para docs criados sem denormalização. */
export async function backfillCollectionOwnerIds(
  db: Firestore,
  workspaceId: string,
  subcollection: string,
  docIds: string[],
  ownerId: string,
): Promise<void> {
  if (docIds.length === 0) return;

  const batch = writeBatch(db);
  let pending = 0;

  for (const docId of docIds) {
    const ref = doc(db, COLLECTIONS.workspaces, workspaceId, subcollection, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) continue;

    const data = snap.data();
    if (data.ownerId === ownerId && data.workspaceId === workspaceId) continue;

    batch.update(ref, tenantFirestoreFields(ownerId, workspaceId));
    pending += 1;

    if (pending >= 400) {
      await batch.commit();
      pending = 0;
    }
  }

  if (pending > 0) {
    await batch.commit();
  }
}

/** Varre subcoleção via getDoc nos ids retornados por uma listagem parcial (fallback). */
export async function discoverSubcollectionDocIds(
  db: Firestore,
  workspaceId: string,
  subcollection: string,
): Promise<string[]> {
  try {
    const snap = await getDocs(
      collection(db, COLLECTIONS.workspaces, workspaceId, subcollection),
    );
    return snap.docs.map((document) => document.id);
  } catch {
    return [];
  }
}
