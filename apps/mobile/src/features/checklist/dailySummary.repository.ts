import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import {
  COLLECTIONS,
  WORKSPACE_SUBCOLLECTIONS,
  dailySummarySchema,
  type DailySummary,
  type SummaryChecklistItem,
} from '@socio247/domain';
import { parseFirestoreDoc } from '@/lib/firestoreParse';

function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function summaryRef(db: Firestore, workspaceId: string, date = todayLocalDate()) {
  return doc(
    db,
    COLLECTIONS.workspaces,
    workspaceId,
    WORKSPACE_SUBCOLLECTIONS.dailySummaries,
    date,
  );
}

export async function getTodayDailySummary(
  db: Firestore,
  workspaceId: string,
): Promise<DailySummary | null> {
  const date = todayLocalDate();
  const snap = await getDoc(summaryRef(db, workspaceId, date));
  if (!snap.exists()) return null;
  return parseFirestoreDoc(dailySummarySchema, { ...snap.data(), date: snap.id });
}

export async function toggleChecklistItemDone(
  db: Firestore,
  workspaceId: string,
  appointmentId: string,
  done: boolean,
): Promise<DailySummary | null> {
  const date = todayLocalDate();
  const ref = summaryRef(db, workspaceId, date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const current = parseFirestoreDoc(dailySummarySchema, { ...snap.data(), date: snap.id });
  if (!current) return null;

  const iso = new Date().toISOString();
  const items: SummaryChecklistItem[] = current.items.map((item) => {
    if (item.appointmentId !== appointmentId) return item;
    return {
      ...item,
      done,
      doneAt: done ? iso : undefined,
    };
  });

  const allDone = items.every((item) => item.done);

  await updateDoc(ref, {
    items,
    updatedAt: iso,
    completedAt: allDone ? iso : deleteField(),
  });

  return {
    ...current,
    items,
    updatedAt: iso,
    completedAt: allDone ? iso : undefined,
  };
}

export async function listNotifications(
  db: Firestore,
  workspaceId: string,
  recipientUid: string,
): Promise<
  Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    readAt?: string;
    createdAt?: string;
  }>
> {
  const col = collection(
    db,
    COLLECTIONS.workspaces,
    workspaceId,
    WORKSPACE_SUBCOLLECTIONS.notifications,
  );

  try {
    const snap = await getDocs(
      query(
        col,
        where('recipientUid', '==', recipientUid),
        orderBy('createdAt', 'desc'),
        limit(30),
      ),
    );
    return snap.docs.map((document) => {
      const data = document.data();
      return {
        id: document.id,
        type: String(data.type ?? 'system'),
        title: String(data.title ?? 'Aviso'),
        body: String(data.body ?? ''),
        readAt: data.readAt as string | undefined,
        createdAt: data.createdAt as string | undefined,
      };
    });
  } catch {
    try {
      const snap = await getDocs(query(col, limit(30)));
      return snap.docs
        .map((document) => {
          const data = document.data();
          return {
            id: document.id,
            type: String(data.type ?? 'system'),
            title: String(data.title ?? 'Aviso'),
            body: String(data.body ?? ''),
            readAt: data.readAt as string | undefined,
            createdAt: data.createdAt as string | undefined,
            recipientUid: data.recipientUid as string | undefined,
          };
        })
        .filter((item) => !item.recipientUid || item.recipientUid === recipientUid)
        .map(({ recipientUid: _uid, ...rest }) => rest);
    } catch {
      return [];
    }
  }
}

export async function markNotificationRead(
  db: Firestore,
  workspaceId: string,
  notificationId: string,
): Promise<void> {
  const ref = doc(
    db,
    COLLECTIONS.workspaces,
    workspaceId,
    WORKSPACE_SUBCOLLECTIONS.notifications,
    notificationId,
  );
  await updateDoc(ref, {
    readAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
