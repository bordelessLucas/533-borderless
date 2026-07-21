import { collection, type Firestore } from 'firebase/firestore';
import {
  COLLECTIONS,
  WORKSPACE_SUBCOLLECTIONS,
  appointmentSchema,
  type Appointment,
} from '@socio247/domain';
import { listTenantCollection } from '@/lib/tenantList';
import { getDayRange } from '@/lib/datetime';

const SEED_APPOINTMENT_IDS = ['apt_1', 'apt_2', 'apt_3', 'apt_4'] as const;

export async function listTodayAppointments(
  db: Firestore,
  workspaceId: string,
  ownerId: string,
  referenceDate = new Date(),
): Promise<Appointment[]> {
  const { start, end } = getDayRange(referenceDate);
  const rangeStartIso = start.toISOString();
  const rangeEndIso = end.toISOString();

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
    .filter((apt) => apt.status !== 'cancelled')
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function appointmentsCollection(db: Firestore, workspaceId: string) {
  return collection(
    db,
    COLLECTIONS.workspaces,
    workspaceId,
    WORKSPACE_SUBCOLLECTIONS.appointments,
  );
}
