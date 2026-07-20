import {
  collection,
  doc,
  getDoc,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import {
  COLLECTIONS,
  WORKSPACE_SUBCOLLECTIONS,
  appointmentSchema,
  clientSchema,
  serviceSchema,
  type Appointment,
} from '@socio247/domain';
import { parseFirestoreDoc } from '@/lib/firestoreParse';
import { listTenantCollection } from '@/lib/tenantList';
import { tenantFirestoreFields } from '@/lib/tenantFirestore';

export interface ManualAppointmentInput {
  clientId: string;
  serviceId: string;
  startAt: string;
  notes?: string;
}

const SEED_APPOINTMENT_IDS = ['apt_1', 'apt_2', 'apt_3', 'apt_4'] as const;

function appointmentsCollection(db: Firestore, workspaceId: string) {
  return collection(
    db,
    COLLECTIONS.workspaces,
    workspaceId,
    WORKSPACE_SUBCOLLECTIONS.appointments,
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function listAppointmentsInRange(
  db: Firestore,
  workspaceId: string,
  ownerId: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<Appointment[]> {
  const rangeStartIso = rangeStart.toISOString();
  const rangeEndIso = rangeEnd.toISOString();

  const appointments = await listTenantCollection(
    db,
    workspaceId,
    ownerId,
    WORKSPACE_SUBCOLLECTIONS.appointments,
    appointmentSchema,
    SEED_APPOINTMENT_IDS,
  );

  return appointments
    .filter((apt) => apt.startAt >= rangeStartIso && apt.startAt < rangeEndIso)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export async function createManualAppointment(
  db: Firestore,
  workspaceId: string,
  uid: string,
  input: ManualAppointmentInput,
): Promise<Appointment> {
  const clientRef = doc(db, COLLECTIONS.workspaces, workspaceId, WORKSPACE_SUBCOLLECTIONS.clients, input.clientId);
  const serviceRef = doc(db, COLLECTIONS.workspaces, workspaceId, WORKSPACE_SUBCOLLECTIONS.services, input.serviceId);

  const [clientSnap, serviceSnap] = await Promise.all([getDoc(clientRef), getDoc(serviceRef)]);

  if (!clientSnap.exists()) {
    throw new Error('Cliente não encontrado');
  }
  if (!serviceSnap.exists()) {
    throw new Error('Serviço não encontrado');
  }

  const client = parseFirestoreDoc(clientSchema, clientSnap.data());
  const service = parseFirestoreDoc(serviceSchema, serviceSnap.data());

  if (!client || !service) {
    throw new Error('Dados inválidos de cliente ou serviço');
  }

  if (!client.active) {
    throw new Error('Cliente inativo — reative antes de agendar');
  }
  if (!service.active) {
    throw new Error('Serviço inativo — reative antes de agendar');
  }

  const start = new Date(input.startAt);
  if (Number.isNaN(start.getTime())) {
    throw new Error('Data ou horário inválido');
  }

  const end = new Date(start.getTime() + service.durationMinutes * 60_000);
  const ref = doc(appointmentsCollection(db, workspaceId));
  const iso = nowIso();

  const appointment = appointmentSchema.parse({
    id: ref.id,
    workspaceId,
    clientId: client.id,
    clientName: client.name,
    providerId: uid,
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
    status: 'confirmed',
    paymentStatus: 'pending',
    source: 'professional',
    totalPrice: service.price,
    notes: input.notes,
    createdAt: iso,
    updatedAt: iso,
    createdBy: uid,
    updatedBy: uid,
  });

  await setDoc(ref, {
    ...appointment,
    ...tenantFirestoreFields(uid, workspaceId),
  });
  return appointment;
}
