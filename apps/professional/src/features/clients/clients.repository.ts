import {
  collection,
  deleteField,
  doc,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import {
  COLLECTIONS,
  WORKSPACE_SUBCOLLECTIONS,
  clientSchema,
  createClientInputSchema,
  type Client,
  type CreateClientInput,
} from '@socio247/domain';
import { listTenantCollection } from '@/lib/tenantList';
import { tenantFirestoreFields } from '@/lib/tenantFirestore';

export type ClientFormInput = CreateClientInput & {
  active?: boolean;
};

const SEED_CLIENT_IDS = ['cli_joao', 'cli_rafa', 'cli_pedro', 'cli_andre', 'cli_lucas'] as const;

function clientsCollection(db: Firestore, workspaceId: string) {
  return collection(
    db,
    COLLECTIONS.workspaces,
    workspaceId,
    WORKSPACE_SUBCOLLECTIONS.clients,
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function listClients(
  db: Firestore,
  workspaceId: string,
  ownerId: string,
): Promise<Client[]> {
  return listTenantCollection(
    db,
    workspaceId,
    ownerId,
    WORKSPACE_SUBCOLLECTIONS.clients,
    clientSchema,
    SEED_CLIENT_IDS,
    (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
  );
}

export async function createClient(
  db: Firestore,
  workspaceId: string,
  uid: string,
  input: CreateClientInput,
): Promise<Client> {
  const parsed = createClientInputSchema.parse(input);
  const ref = doc(clientsCollection(db, workspaceId));
  const iso = nowIso();

  const client = clientSchema.parse({
    id: ref.id,
    workspaceId,
    ...parsed,
    active: true,
    createdAt: iso,
    updatedAt: iso,
    createdBy: uid,
    updatedBy: uid,
  });

  await setDoc(ref, {
    ...client,
    ...tenantFirestoreFields(uid, workspaceId),
  });
  return client;
}

export async function updateClient(
  db: Firestore,
  workspaceId: string,
  clientId: string,
  uid: string,
  input: ClientFormInput,
): Promise<void> {
  const parsed = createClientInputSchema.parse(input);
  const ref = doc(clientsCollection(db, workspaceId), clientId);
  const email = parsed.email && parsed.email.length > 0 ? parsed.email : deleteField();
  const notes = parsed.notes && parsed.notes.length > 0 ? parsed.notes : deleteField();
  const recurrenceIntervalDays =
    parsed.recurrenceIntervalDays !== undefined ? parsed.recurrenceIntervalDays : deleteField();

  await updateDoc(ref, {
    name: parsed.name,
    phoneNumber: parsed.phoneNumber,
    email,
    notes,
    recurrenceIntervalDays,
    consentToContact: parsed.consentToContact ?? true,
    tags: parsed.tags ?? [],
    active: input.active ?? true,
    updatedAt: nowIso(),
    updatedBy: uid,
  });
}

export async function setClientActive(
  db: Firestore,
  workspaceId: string,
  clientId: string,
  uid: string,
  active: boolean,
): Promise<void> {
  const ref = doc(clientsCollection(db, workspaceId), clientId);
  await updateDoc(ref, {
    active,
    updatedAt: nowIso(),
    updatedBy: uid,
  });
}
