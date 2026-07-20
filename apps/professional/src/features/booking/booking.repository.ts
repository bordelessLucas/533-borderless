import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import {
  COLLECTIONS,
  WORKSPACE_SUBCOLLECTIONS,
  appointmentSchema,
  availabilitySchema,
  clientSchema,
  serviceSchema,
  timeBlockSchema,
  workspaceSchema,
  type Appointment,
  type Availability,
  type Service,
  type TimeBlock,
  type Workspace,
} from '@socio247/domain';
import { createConverter } from '@socio247/firebase/converter';
import { normalizePhoneToE164 } from '@/features/clients/phone';
import { tenantFirestoreFields } from '@/lib/tenantFirestore';

const workspaceConverter = createConverter(workspaceSchema);
const serviceConverter = createConverter(serviceSchema);
const availabilityConverter = createConverter(availabilitySchema);
const appointmentConverter = createConverter(appointmentSchema);
const timeBlockConverter = createConverter(timeBlockSchema);
const clientConverter = createConverter(clientSchema);

export interface PublicBookingInput {
  clientName: string;
  phoneNumber: string;
  serviceId: string;
  startAt: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function getDayRange(localDate: string): { start: Date; end: Date } {
  const [year, month, day] = localDate.split('-').map(Number);
  const start = new Date(year!, month! - 1, day!, 0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function getWorkspaceBySlug(db: Firestore, slug: string): Promise<Workspace | null> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.workspaces).withConverter(workspaceConverter),
      where('slug', '==', slug),
      where('status', '==', 'active'),
      limit(1),
    ),
  );

  if (snap.empty) return null;
  return snap.docs[0]!.data();
}

export async function listActiveServices(db: Firestore, workspaceId: string): Promise<Service[]> {
  const snap = await getDocs(
    query(
      collection(
        db,
        COLLECTIONS.workspaces,
        workspaceId,
        WORKSPACE_SUBCOLLECTIONS.services,
      ).withConverter(serviceConverter),
      where('workspaceStatus', '==', 'active'),
      where('active', '==', true),
    ),
  );
  return snap.docs
    .map((document) => document.data())
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function getProviderAvailability(
  db: Firestore,
  workspaceId: string,
  providerId: string,
): Promise<Availability | null> {
  const snap = await getDoc(
    doc(
      db,
      COLLECTIONS.workspaces,
      workspaceId,
      WORKSPACE_SUBCOLLECTIONS.availability,
      providerId,
    ).withConverter(availabilityConverter),
  );
  return snap.exists() ? snap.data() : null;
}

export async function listAppointmentsForDay(
  db: Firestore,
  workspaceId: string,
  localDate: string,
): Promise<Appointment[]> {
  const { start, end } = getDayRange(localDate);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const snap = await getDocs(
    query(
      collection(
        db,
        COLLECTIONS.workspaces,
        workspaceId,
        WORKSPACE_SUBCOLLECTIONS.appointments,
      ).withConverter(appointmentConverter),
      where('workspaceStatus', '==', 'active'),
    ),
  );

  return snap.docs
    .map((document) => document.data())
    .filter((apt) => apt.startAt >= startIso && apt.startAt < endIso)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export async function listTimeBlocksForDay(
  db: Firestore,
  workspaceId: string,
  localDate: string,
): Promise<TimeBlock[]> {
  const { start, end } = getDayRange(localDate);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const snap = await getDocs(
    query(
      collection(
        db,
        COLLECTIONS.workspaces,
        workspaceId,
        WORKSPACE_SUBCOLLECTIONS.timeBlocks,
      ).withConverter(timeBlockConverter),
      where('workspaceStatus', '==', 'active'),
    ),
  );

  const byRange = snap.docs
    .map((document) => document.data())
    .filter((block) => !block.allDayDate && block.startAt >= startIso && block.startAt < endIso);

  const byAllDay = snap.docs
    .map((document) => document.data())
    .filter((block) => block.allDayDate === localDate);

  const merged = new Map<string, TimeBlock>();
  for (const block of [...byRange, ...byAllDay]) {
    merged.set(block.id, block);
  }
  return [...merged.values()];
}

export async function createPublicBooking(
  db: Firestore,
  workspace: Workspace,
  input: PublicBookingInput,
): Promise<Appointment> {
  const serviceRef = doc(
    db,
    COLLECTIONS.workspaces,
    workspace.id,
    WORKSPACE_SUBCOLLECTIONS.services,
    input.serviceId,
  ).withConverter(serviceConverter);
  const serviceSnap = await getDoc(serviceRef);

  if (!serviceSnap.exists() || !serviceSnap.data().active) {
    throw new Error('Serviço indisponível');
  }

  const service = serviceSnap.data();
  const start = new Date(input.startAt);
  if (Number.isNaN(start.getTime())) {
    throw new Error('Horário inválido');
  }

  const end = new Date(start.getTime() + service.durationMinutes * 60_000);
  const iso = nowIso();
  const phoneNumber = normalizePhoneToE164(input.phoneNumber);
  const status = service.durationType === 'variable' ? 'pending' : 'confirmed';

  const clientRef = doc(
    collection(
      db,
      COLLECTIONS.workspaces,
      workspace.id,
      WORKSPACE_SUBCOLLECTIONS.clients,
    ).withConverter(clientConverter),
  );

  const client = clientSchema.parse({
    id: clientRef.id,
    workspaceId: workspace.id,
    name: input.clientName.trim(),
    phoneNumber,
    consentToContact: true,
    tags: ['booking_link'],
    active: true,
    createdAt: iso,
    updatedAt: iso,
  });

  await setDoc(clientRef, {
    ...client,
    ...tenantFirestoreFields(workspace.ownerId, workspace.id),
  });

  const appointmentRef = doc(
    collection(
      db,
      COLLECTIONS.workspaces,
      workspace.id,
      WORKSPACE_SUBCOLLECTIONS.appointments,
    ).withConverter(appointmentConverter),
  );

  const appointment = appointmentSchema.parse({
    id: appointmentRef.id,
    workspaceId: workspace.id,
    clientId: client.id,
    clientName: client.name,
    providerId: workspace.ownerId,
    services: [
      {
        serviceId: service.id,
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
      },
    ],
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    status,
    paymentStatus: 'pending',
    source: 'booking_link',
    totalPrice: service.price,
    createdAt: iso,
    updatedAt: iso,
  });

  await setDoc(appointmentRef, {
    ...appointment,
    ...tenantFirestoreFields(workspace.ownerId, workspace.id),
  });
  return appointment;
}
