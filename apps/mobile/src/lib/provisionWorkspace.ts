import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { tenantFirestoreFields } from '@/lib/tenantFirestore';

const SEED_MARKER_DOC_ID = 'svc_corte';

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function nowIso(): string {
  return new Date().toISOString();
}

function todayLocalDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildAddressLine(address: {
  street: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
}) {
  return `${address.street}, ${address.number ?? 's/n'} — ${address.neighborhood ?? ''}, ${address.city}/${address.state}`;
}

function isPermissionDenied(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const code = 'code' in err ? String(err.code) : '';
  const message = err instanceof Error ? err.message : String(err);
  return (
    code === 'permission-denied' ||
    message.includes('insufficient permissions') ||
    message.includes('PERMISSION_DENIED')
  );
}

async function docExists(db: Firestore, ...path: string[]): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, path[0]!, ...path.slice(1)));
    return snap.exists();
  } catch (err) {
    // Rules antigas negam get em doc inexistente — trata como ausente e tenta criar.
    if (isPermissionDenied(err)) return false;
    throw err;
  }
}

function buildTodayAppointments(startAtBase: Date, providerId: string) {
  const slots = [
    {
      id: 'apt_1',
      time: '09:00',
      clientId: 'cli_lucas',
      clientName: 'Lucas Almeida',
      serviceId: 'svc_corte',
      serviceName: 'Corte masculino',
      minutes: 40,
      cents: 5500,
      status: 'confirmed' as const,
    },
    {
      id: 'apt_2',
      time: '10:30',
      clientId: 'cli_rafa',
      clientName: 'Rafael Souza',
      serviceId: 'svc_combo',
      serviceName: 'Corte + barba',
      minutes: 60,
      cents: 8500,
      status: 'scheduled' as const,
    },
    {
      id: 'apt_3',
      time: '14:00',
      clientId: 'cli_pedro',
      clientName: 'Pedro Lima',
      serviceId: 'svc_barba',
      serviceName: 'Barba completa',
      minutes: 30,
      cents: 4000,
      status: 'scheduled' as const,
    },
    {
      id: 'apt_4',
      time: '16:30',
      clientId: 'cli_joao',
      clientName: 'João Ferreira',
      serviceId: 'svc_corte',
      serviceName: 'Corte masculino',
      minutes: 40,
      cents: 5500,
      status: 'scheduled' as const,
    },
  ];

  return slots.map((slot) => {
    const [h, m] = slot.time.split(':').map(Number);
    const start = new Date(startAtBase);
    start.setHours(h!, m!, 0, 0);
    const end = new Date(start.getTime() + slot.minutes * 60_000);
    return {
      id: slot.id,
      clientId: slot.clientId,
      clientName: slot.clientName,
      providerId,
      services: [
        {
          serviceId: slot.serviceId,
          name: slot.serviceName,
          durationMinutes: slot.minutes,
          price: { amountInCents: slot.cents, currency: 'BRL' as const },
        },
      ],
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      status: slot.status,
      paymentStatus: 'pending' as const,
      source: 'professional' as const,
      totalPrice: { amountInCents: slot.cents, currency: 'BRL' as const },
    };
  });
}

export interface ProvisionInput {
  businessName: string;
  ownerName: string;
}

async function writeWorkspaceShell(
  db: Firestore,
  workspaceId: string,
  uid: string,
  { businessName, ownerName }: ProvisionInput,
  email: string | undefined,
  iso: string,
): Promise<void> {
  const slug = `${slugify(businessName)}-${uid.slice(0, 4)}`;
  const address = {
    street: 'Rua das Palmeiras',
    number: '412',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '05433-000',
    country: 'BR',
  };

  await setDoc(doc(db, 'workspaces', workspaceId), {
    id: workspaceId,
    name: businessName,
    slug,
    segment: 'barbershop',
    ownerId: uid,
    phoneNumber: '+5511988882211',
    email,
    address,
    settings: {
      timezone: 'America/Sao_Paulo',
      communicationMode: 'assisted',
      dailySummaryTime: '08:00',
      reminderLeadHours: 24,
    },
    status: 'active',
    createdAt: iso,
    updatedAt: iso,
    createdBy: uid,
    updatedBy: uid,
  });

  await setDoc(doc(db, 'workspaces', workspaceId, 'members', uid), {
    uid,
    workspaceId,
    role: 'workspace_owner',
    displayName: ownerName,
    providesService: true,
    status: 'active',
    createdAt: iso,
    updatedAt: iso,
  });
}

async function writeWorkspaceSeed(
  db: Firestore,
  workspaceId: string,
  uid: string,
  businessName: string,
  iso: string,
): Promise<void> {
  const batch = writeBatch(db);
  const tenantFields = tenantFirestoreFields(uid, workspaceId);

  const services = [
    { id: 'svc_corte', name: 'Corte masculino', durationMinutes: 40, price: 5500, color: '#0F766E' },
    { id: 'svc_barba', name: 'Barba completa', durationMinutes: 30, price: 4000, color: '#B45309' },
    { id: 'svc_combo', name: 'Corte + barba', durationMinutes: 60, price: 8500, color: '#1D4ED8' },
  ];

  for (const svc of services) {
    batch.set(doc(db, 'workspaces', workspaceId, 'services', svc.id), {
      id: svc.id,
      name: svc.name,
      durationMinutes: svc.durationMinutes,
      price: { amountInCents: svc.price, currency: 'BRL' },
      bufferMinutes: 0,
      color: svc.color,
      active: true,
      createdAt: iso,
      updatedAt: iso,
      ...tenantFields,
    });
  }

  const clients = [
    { id: 'cli_joao', name: 'João Ferreira', phone: '+5511991112233', recurrence: 21 },
    { id: 'cli_rafa', name: 'Rafael Souza', phone: '+5511977774455', recurrence: 15 },
    { id: 'cli_pedro', name: 'Pedro Lima', phone: '+5511966667788' },
    { id: 'cli_andre', name: 'André Costa', phone: '+5511955559900', recurrence: 30 },
    { id: 'cli_lucas', name: 'Lucas Almeida', phone: '+5511944441122' },
  ];

  for (const client of clients) {
    batch.set(doc(db, 'workspaces', workspaceId, 'clients', client.id), {
      id: client.id,
      name: client.name,
      phoneNumber: client.phone,
      ...(client.recurrence !== undefined
        ? { recurrenceIntervalDays: client.recurrence }
        : {}),
      consentToContact: true,
      tags: client.recurrence ? ['recorrente'] : [],
      active: true,
      createdAt: iso,
      updatedAt: iso,
      ...tenantFields,
    });
  }

  const appointments = buildTodayAppointments(new Date(), uid);
  for (const apt of appointments) {
    batch.set(doc(db, 'workspaces', workspaceId, 'appointments', apt.id), {
      ...apt,
      createdAt: iso,
      updatedAt: iso,
      ...tenantFields,
    });
  }

  const addressLine = buildAddressLine({
    street: 'Rua das Palmeiras',
    number: '412',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
  });

  const checklistItems = [
    {
      appointmentId: 'apt_1',
      clientId: 'cli_lucas',
      clientName: 'Lucas Almeida',
      clientPhone: '+5511944441122',
      kind: 'confirmation',
      message: `Oi Lucas! Confirmando seu horário hoje às 09:00 no ${businessName}. Local: ${addressLine}. Te espero!`,
      done: true,
    },
    {
      appointmentId: 'apt_2',
      clientId: 'cli_rafa',
      clientName: 'Rafael Souza',
      clientPhone: '+5511977774455',
      kind: 'reminder',
      message: `Rafael, lembrete: hoje às 10:30 — Corte + barba no ${businessName}. Endereço: ${addressLine}.`,
      done: false,
    },
    {
      appointmentId: 'apt_3',
      clientId: 'cli_pedro',
      clientName: 'Pedro Lima',
      clientPhone: '+5511966667788',
      kind: 'reminder',
      message: `Pedro, seu horário é hoje às 14:00 (Barba completa). Local: ${addressLine}.`,
      done: false,
    },
    {
      appointmentId: 'apt_4',
      clientId: 'cli_joao',
      clientName: 'João Ferreira',
      clientPhone: '+5511991112233',
      kind: 'reminder',
      message: `João, lembrete: hoje às 16:30 no ${businessName}. Local: ${addressLine}.`,
      done: false,
    },
    {
      appointmentId: 'apt_return',
      clientId: 'cli_andre',
      clientName: 'André Costa',
      clientPhone: '+5511955559900',
      kind: 'recurrence_return',
      message: `André, faz quase 30 dias do seu último corte. Quer agendar de novo? Tenho horários amanhã e quarta.`,
      done: false,
    },
  ];

  batch.set(doc(db, 'workspaces', workspaceId, 'dailySummaries', todayLocalDate()), {
    date: todayLocalDate(),
    generatedAt: iso,
    appointmentsCount: appointments.length,
    items: checklistItems,
    createdAt: iso,
    updatedAt: iso,
    ...tenantFields,
  });

  await batch.commit();

  await setDoc(doc(db, 'workspaces', workspaceId, 'availability', uid), {
    providerId: uid,
    weeklyHours: {
      '1': [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '19:00' },
      ],
      '2': [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '19:00' },
      ],
      '3': [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '19:00' },
      ],
      '4': [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '19:00' },
      ],
      '5': [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '19:00' },
      ],
      '6': [{ start: '09:00', end: '14:00' }],
    },
    slotIntervalMinutes: 30,
    createdAt: iso,
    updatedAt: iso,
    ...tenantFields,
  });
}

async function writeUserAndSubscription(
  db: Firestore,
  workspaceId: string,
  uid: string,
  ownerName: string,
  email: string | undefined,
  iso: string,
): Promise<void> {
  const userExists = await docExists(db, 'users', uid);
  if (!userExists) {
    await setDoc(doc(db, 'users', uid), {
      uid,
      displayName: ownerName,
      email,
      workspaces: { [workspaceId]: 'workspace_owner' },
      disabled: false,
      createdAt: iso,
      updatedAt: iso,
    });
  }

  const subscriptionExists = await docExists(db, 'subscriptions', workspaceId);
  if (!subscriptionExists) {
    await setDoc(doc(db, 'subscriptions', workspaceId), {
      workspaceId,
      plan: 'starter',
      cycle: 'monthly',
      price: { amountInCents: 4990, currency: 'BRL' },
      status: 'trialing',
      asaas: {},
      createdAt: iso,
      updatedAt: iso,
    });
  }
}

/**
 * Provisiona workspace direto no Firestore (plano Spark — sem Cloud Functions).
 * Escritas em sequência para satisfazer as Security Rules.
 * Re-seed automático se o workspace existir mas as subcoleções estiverem vazias.
 */
export async function provisionWorkspaceClient(
  db: Firestore,
  user: User,
  input: ProvisionInput,
): Promise<{ workspaceId: string; alreadyProvisioned: boolean }> {
  const uid = user.uid;
  const workspaceId = `ws_${uid.slice(0, 8)}`;
  const iso = nowIso();
  const email = user.email ?? undefined;

  try {
    const workspaceExists = await docExists(db, 'workspaces', workspaceId);
    const seedMissing = workspaceExists
      ? !(await docExists(db, 'workspaces', workspaceId, 'services', SEED_MARKER_DOC_ID))
      : true;

    if (workspaceExists && !seedMissing) {
      await writeUserAndSubscription(db, workspaceId, uid, input.ownerName, email, iso);
      return { workspaceId, alreadyProvisioned: true };
    }

    if (!workspaceExists) {
      await writeWorkspaceShell(db, workspaceId, uid, input, email, iso);
    }

    if (seedMissing) {
      await writeWorkspaceSeed(db, workspaceId, uid, input.businessName, iso);
    }

    await writeUserAndSubscription(db, workspaceId, uid, input.ownerName, email, iso);

    return { workspaceId, alreadyProvisioned: workspaceExists && !seedMissing };
  } catch (err) {
    if (isPermissionDenied(err)) {
      throw new Error(
        'Sem permissão para criar o workspace no Firestore. Confirme o deploy das Security Rules e tente novamente.',
      );
    }
    throw err;
  }
}
