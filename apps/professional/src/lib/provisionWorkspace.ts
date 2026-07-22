import { doc, setDoc, writeBatch, type Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { COLLECTIONS, WORKSPACE_SUBCOLLECTIONS, tenantFirestoreFields } from '@socio247/domain';

export interface ProvisionInput {
  businessName: string;
  ownerName: string;
}

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

function buildTodayAppointments(startAtBase: Date, providerId: string) {
  const slots = [
    {
      time: '09:00',
      clientId: 'cli_lucas',
      clientName: 'Lucas Almeida',
      phone: '+5511944441122',
      serviceId: 'svc_corte',
      serviceName: 'Corte masculino',
      minutes: 40,
      cents: 5500,
    },
    {
      time: '10:30',
      clientId: 'cli_rafa',
      clientName: 'Rafael Souza',
      phone: '+5511977774455',
      serviceId: 'svc_combo',
      serviceName: 'Corte + barba',
      minutes: 60,
      cents: 8500,
    },
    {
      time: '14:00',
      clientId: 'cli_pedro',
      clientName: 'Pedro Lima',
      phone: '+5511966667788',
      serviceId: 'svc_barba',
      serviceName: 'Barba completa',
      minutes: 30,
      cents: 4000,
    },
    {
      time: '16:30',
      clientId: 'cli_joao',
      clientName: 'João Ferreira',
      phone: '+5511991112233',
      serviceId: 'svc_corte',
      serviceName: 'Corte masculino',
      minutes: 40,
      cents: 5500,
    },
  ];

  return slots.map((slot, index) => {
    const [h, m] = slot.time.split(':').map(Number);
    const start = new Date(startAtBase);
    start.setHours(h!, m!, 0, 0);
    const end = new Date(start.getTime() + slot.minutes * 60_000);
    return {
      id: `apt_${index + 1}`,
      clientId: slot.clientId,
      clientName: slot.clientName,
      clientPhone: slot.phone,
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
      status: index === 0 ? ('confirmed' as const) : ('scheduled' as const),
      paymentStatus: 'pending' as const,
      source: 'professional' as const,
      totalPrice: { amountInCents: slot.cents, currency: 'BRL' as const },
      timeLabel: slot.time,
    };
  });
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

/**
 * Provisiona workspace + seed no Firestore pelo client SDK (plano Spark).
 */
export async function provisionWorkspaceClient(
  db: Firestore,
  user: User,
  input: ProvisionInput,
): Promise<string> {
  const uid = user.uid;
  const { businessName, ownerName } = input;
  const workspaceId = `ws_${uid.slice(0, 8)}`;
  const slug = `${slugify(businessName)}-${uid.slice(0, 4)}`;
  const iso = nowIso();
  const email = user.email ?? undefined;

  const address = {
    street: 'Rua das Palmeiras',
    number: '412',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '05433-000',
    country: 'BR',
  };

  const workspace = {
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
  };

  // Workspace precisa existir ANTES do batch: Security Rules usam get() em
  // members/subscriptions e não enxergam writes do mesmo batch.
  const wsRef = doc(db, COLLECTIONS.workspaces, workspaceId);
  await setDoc(wsRef, workspace);

  const batch = writeBatch(db);

  batch.set(doc(db, COLLECTIONS.workspaces, workspaceId, WORKSPACE_SUBCOLLECTIONS.members, uid), {
    uid,
    workspaceId,
    role: 'workspace_owner',
    displayName: ownerName,
    providesService: true,
    status: 'active',
    createdAt: iso,
    updatedAt: iso,
  });

  const services = [
    { id: 'svc_corte', name: 'Corte masculino', durationMinutes: 40, price: 5500, color: '#0F766E' },
    { id: 'svc_barba', name: 'Barba completa', durationMinutes: 30, price: 4000, color: '#B45309' },
    { id: 'svc_combo', name: 'Corte + barba', durationMinutes: 60, price: 8500, color: '#1D4ED8' },
  ];

  const tenantFields = tenantFirestoreFields(uid, workspaceId);

  for (const svc of services) {
    batch.set(doc(db, COLLECTIONS.workspaces, workspaceId, WORKSPACE_SUBCOLLECTIONS.services, svc.id), {
      id: svc.id,
      name: svc.name,
      durationMinutes: svc.durationMinutes,
      price: { amountInCents: svc.price, currency: 'BRL' },
      bufferMinutes: 0,
      color: svc.color,
      active: true,
      createdAt: iso,
      updatedAt: iso,
      createdBy: uid,
      updatedBy: uid,
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
    batch.set(doc(db, COLLECTIONS.workspaces, workspaceId, WORKSPACE_SUBCOLLECTIONS.clients, client.id), {
      id: client.id,
      name: client.name,
      phoneNumber: client.phone,
      ...(client.recurrence !== undefined ? { recurrenceIntervalDays: client.recurrence } : {}),
      consentToContact: true,
      tags: client.recurrence ? ['recorrente'] : [],
      active: true,
      createdAt: iso,
      updatedAt: iso,
      createdBy: uid,
      updatedBy: uid,
      ...tenantFields,
    });
  }

  const appointments = buildTodayAppointments(new Date(), uid);
  for (const apt of appointments) {
    const { timeLabel: _t, clientPhone: _p, ...rest } = apt;
    batch.set(
      doc(db, COLLECTIONS.workspaces, workspaceId, WORKSPACE_SUBCOLLECTIONS.appointments, apt.id),
      {
        ...rest,
        createdAt: iso,
        updatedAt: iso,
        createdBy: uid,
        updatedBy: uid,
        ...tenantFields,
      },
    );
  }

  const addressLine = buildAddressLine(address);
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

  batch.set(
    doc(db, COLLECTIONS.workspaces, workspaceId, WORKSPACE_SUBCOLLECTIONS.dailySummaries, todayLocalDate()),
    {
      date: todayLocalDate(),
      generatedAt: iso,
      appointmentsCount: appointments.length,
      items: checklistItems,
      createdAt: iso,
      updatedAt: iso,
      ...tenantFields,
    },
  );

  batch.set(doc(db, COLLECTIONS.users, uid), {
    uid,
    displayName: ownerName,
    email,
    workspaces: { [workspaceId]: 'workspace_owner' },
    disabled: false,
    createdAt: iso,
    updatedAt: iso,
  });

  batch.set(doc(db, COLLECTIONS.subscriptions, workspaceId), {
    workspaceId,
    plan: 'starter',
    cycle: 'monthly',
    price: { amountInCents: 4990, currency: 'BRL' },
    status: 'trialing',
    asaas: {},
    createdAt: iso,
    updatedAt: iso,
  });

  await batch.commit();
  return workspaceId;
}
