import { z } from 'zod';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { auth, db } from '../admin.js';

const inputSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  ownerName: z.string().trim().min(1).max(120),
});

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

function buildTodayAppointments(startAtBase: Date) {
  const slots = [
    { time: '09:00', clientId: 'cli_lucas', clientName: 'Lucas Almeida', phone: '+5511944441122', serviceId: 'svc_corte', serviceName: 'Corte masculino', minutes: 40, cents: 5500 },
    { time: '10:30', clientId: 'cli_rafa', clientName: 'Rafael Souza', phone: '+5511977774455', serviceId: 'svc_combo', serviceName: 'Corte + barba', minutes: 60, cents: 8500 },
    { time: '14:00', clientId: 'cli_pedro', clientName: 'Pedro Lima', phone: '+5511966667788', serviceId: 'svc_barba', serviceName: 'Barba completa', minutes: 30, cents: 4000 },
    { time: '16:30', clientId: 'cli_joao', clientName: 'João Ferreira', phone: '+5511991112233', serviceId: 'svc_corte', serviceName: 'Corte masculino', minutes: 40, cents: 5500 },
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
      providerId: 'owner',
      services: [{
        serviceId: slot.serviceId,
        name: slot.serviceName,
        durationMinutes: slot.minutes,
        price: { amountInCents: slot.cents, currency: 'BRL' as const },
      }],
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      status: index === 0 ? 'confirmed' : 'scheduled',
      paymentStatus: 'pending',
      source: 'professional',
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
 * Provisiona workspace do profissional no primeiro cadastro:
 * - custom claims (workspace_owner)
 * - documentos Firestore com dados de exemplo
 */
export const provisionWorkspace = onCall({ region: 'southamerica-east1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Usuário não autenticado.');
  }

  const uid = request.auth.uid;
  const parsed = inputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Dados inválidos.');
  }

  const { businessName, ownerName } = parsed.data;
  const existingClaims = request.auth.token.workspaces as Record<string, string> | undefined;
  if (existingClaims && Object.keys(existingClaims).length > 0) {
    const workspaceId = Object.keys(existingClaims)[0]!;
    return { workspaceId, alreadyProvisioned: true };
  }

  const workspaceId = `ws_${uid.slice(0, 8)}`;
  const slug = `${slugify(businessName)}-${uid.slice(0, 4)}`;
  const iso = nowIso();
  const email = request.auth.token.email as string | undefined;

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

  const batch = db.batch();
  const wsRef = db.collection('workspaces').doc(workspaceId);
  batch.set(wsRef, workspace);

  batch.set(wsRef.collection('members').doc(uid), {
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

  for (const svc of services) {
    batch.set(wsRef.collection('services').doc(svc.id), {
      id: svc.id,
      workspaceId,
      name: svc.name,
      durationMinutes: svc.durationMinutes,
      price: { amountInCents: svc.price, currency: 'BRL' },
      bufferMinutes: 0,
      color: svc.color,
      active: true,
      createdAt: iso,
      updatedAt: iso,
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
    batch.set(wsRef.collection('clients').doc(client.id), {
      id: client.id,
      workspaceId,
      name: client.name,
      phoneNumber: client.phone,
      recurrenceIntervalDays: client.recurrence,
      consentToContact: true,
      tags: client.recurrence ? ['recorrente'] : [],
      active: true,
      createdAt: iso,
      updatedAt: iso,
    });
  }

  const today = new Date();
  const appointments = buildTodayAppointments(today);
  for (const apt of appointments) {
    const { timeLabel: _t, clientPhone: _p, ...doc } = apt;
    batch.set(wsRef.collection('appointments').doc(apt.id), {
      ...doc,
      workspaceId,
      clientId: apt.clientId,
      providerId: uid,
      notes: undefined,
      createdAt: iso,
      updatedAt: iso,
    });
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

  batch.set(wsRef.collection('dailySummaries').doc(todayLocalDate()), {
    date: todayLocalDate(),
    workspaceId,
    generatedAt: iso,
    appointmentsCount: appointments.length,
    items: checklistItems,
    createdAt: iso,
    updatedAt: iso,
  });

  batch.set(db.collection('users').doc(uid), {
    uid,
    displayName: ownerName,
    email,
    workspaces: { [workspaceId]: 'workspace_owner' },
    disabled: false,
    createdAt: iso,
    updatedAt: iso,
  });

  batch.set(db.collection('subscriptions').doc(workspaceId), {
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

  await auth.setCustomUserClaims(uid, {
    workspaces: { [workspaceId]: 'workspace_owner' },
  });

  return { workspaceId, alreadyProvisioned: false };
});
