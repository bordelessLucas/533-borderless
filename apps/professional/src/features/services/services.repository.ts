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
  createServiceInputSchema,
  serviceSchema,
  type CreateServiceInput,
  type Service,
} from '@socio247/domain';
import { listTenantCollection } from '@/lib/tenantList';
import { tenantFirestoreFields } from '@/lib/tenantFirestore';

export type ServiceFormInput = CreateServiceInput & {
  active?: boolean;
};

const SEED_SERVICE_IDS = ['svc_corte', 'svc_barba', 'svc_combo'] as const;

function servicesCollection(db: Firestore, workspaceId: string) {
  return collection(
    db,
    COLLECTIONS.workspaces,
    workspaceId,
    WORKSPACE_SUBCOLLECTIONS.services,
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function listServices(
  db: Firestore,
  workspaceId: string,
  ownerId: string,
): Promise<Service[]> {
  return listTenantCollection(
    db,
    workspaceId,
    ownerId,
    WORKSPACE_SUBCOLLECTIONS.services,
    serviceSchema,
    SEED_SERVICE_IDS,
    (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
  );
}

export async function createService(
  db: Firestore,
  workspaceId: string,
  uid: string,
  input: CreateServiceInput,
): Promise<Service> {
  const parsed = createServiceInputSchema.parse(input);
  const ref = doc(servicesCollection(db, workspaceId));
  const iso = nowIso();

  const service = serviceSchema.parse({
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
    ...service,
    ...tenantFirestoreFields(uid, workspaceId),
  });
  return service;
}

export async function updateService(
  db: Firestore,
  workspaceId: string,
  serviceId: string,
  uid: string,
  input: ServiceFormInput,
): Promise<void> {
  const parsed = createServiceInputSchema.parse(input);
  const ref = doc(servicesCollection(db, workspaceId), serviceId);
  const description =
    parsed.description && parsed.description.length > 0
      ? parsed.description
      : deleteField();
  const color = parsed.color ? parsed.color : deleteField();

  await updateDoc(ref, {
    name: parsed.name,
    description,
    durationMinutes: parsed.durationMinutes,
    price: parsed.price,
    bufferMinutes: parsed.bufferMinutes ?? 0,
    color,
    active: input.active ?? true,
    updatedAt: nowIso(),
    updatedBy: uid,
  });
}

export async function setServiceActive(
  db: Firestore,
  workspaceId: string,
  serviceId: string,
  uid: string,
  active: boolean,
): Promise<void> {
  const ref = doc(servicesCollection(db, workspaceId), serviceId);
  await updateDoc(ref, {
    active,
    updatedAt: nowIso(),
    updatedBy: uid,
  });
}
