export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'paid_on_site' | 'waived';
export type CommunicationMode = 'automated' | 'assisted';

export interface MockAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface MockWorkspace {
  id: string;
  name: string;
  slug: string;
  segment: string;
  phoneNumber: string;
  address: MockAddress;
  communicationMode: CommunicationMode;
  dailySummaryTime: string;
  ownerName: string;
}

export interface MockService {
  id: string;
  name: string;
  durationMinutes: number;
  priceInCents: number;
  active: boolean;
  color: string;
}

export interface MockClient {
  id: string;
  name: string;
  phoneNumber: string;
  recurrenceIntervalDays?: number;
  lastVisitLabel?: string;
  tags: string[];
}

export interface MockAppointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  startLabel: string;
  endLabel: string;
  time: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  priceInCents: number;
}

export interface MockChecklistItem {
  id: string;
  appointmentId: string;
  clientName: string;
  clientPhone: string;
  kind: 'reminder' | 'confirmation' | 'recurrence_return';
  message: string;
  done: boolean;
}

export interface MockTimeBlock {
  id: string;
  label: string;
  startLabel: string;
  endLabel: string;
}

export const workspace: MockWorkspace = {
  id: 'ws_barbado_norte',
  name: 'Barbado Norte',
  slug: 'barbado-norte',
  segment: 'Barbearia',
  phoneNumber: '+55 11 98888-2211',
  address: {
    street: 'Rua das Palmeiras',
    number: '412',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '05433-000',
  },
  communicationMode: 'assisted',
  dailySummaryTime: '08:00',
  ownerName: 'Carlos Mendes',
};

export const services: MockService[] = [
  {
    id: 'svc_corte',
    name: 'Corte masculino',
    durationMinutes: 40,
    priceInCents: 5500,
    active: true,
    color: '#0F766E',
  },
  {
    id: 'svc_barba',
    name: 'Barba completa',
    durationMinutes: 30,
    priceInCents: 4000,
    active: true,
    color: '#B45309',
  },
  {
    id: 'svc_combo',
    name: 'Corte + barba',
    durationMinutes: 60,
    priceInCents: 8500,
    active: true,
    color: '#1D4ED8',
  },
  {
    id: 'svc_pigmento',
    name: 'Pigmentação',
    durationMinutes: 50,
    priceInCents: 9000,
    active: false,
    color: '#6B7280',
  },
];

export const clients: MockClient[] = [
  {
    id: 'cli_joao',
    name: 'João Ferreira',
    phoneNumber: '+55 11 99111-2233',
    recurrenceIntervalDays: 21,
    lastVisitLabel: 'há 18 dias',
    tags: ['recorrente'],
  },
  {
    id: 'cli_rafa',
    name: 'Rafael Souza',
    phoneNumber: '+55 11 97777-4455',
    recurrenceIntervalDays: 15,
    lastVisitLabel: 'há 12 dias',
    tags: ['vip'],
  },
  {
    id: 'cli_pedro',
    name: 'Pedro Lima',
    phoneNumber: '+55 11 96666-7788',
    lastVisitLabel: 'há 3 dias',
    tags: ['novo'],
  },
  {
    id: 'cli_andre',
    name: 'André Costa',
    phoneNumber: '+55 11 95555-9900',
    recurrenceIntervalDays: 30,
    lastVisitLabel: 'há 27 dias',
    tags: ['retorno'],
  },
  {
    id: 'cli_lucas',
    name: 'Lucas Almeida',
    phoneNumber: '+55 11 94444-1122',
    lastVisitLabel: 'hoje',
    tags: [],
  },
];

export const todayAppointments: MockAppointment[] = [
  {
    id: 'apt_1',
    clientId: 'cli_lucas',
    clientName: 'Lucas Almeida',
    clientPhone: '+55 11 94444-1122',
    serviceName: 'Corte masculino',
    startLabel: 'Hoje',
    endLabel: '',
    time: '09:00',
    status: 'confirmed',
    paymentStatus: 'pending',
    priceInCents: 5500,
  },
  {
    id: 'apt_2',
    clientId: 'cli_rafa',
    clientName: 'Rafael Souza',
    clientPhone: '+55 11 97777-4455',
    serviceName: 'Corte + barba',
    startLabel: 'Hoje',
    endLabel: '',
    time: '10:30',
    status: 'scheduled',
    paymentStatus: 'pending',
    priceInCents: 8500,
  },
  {
    id: 'apt_3',
    clientId: 'cli_pedro',
    clientName: 'Pedro Lima',
    clientPhone: '+55 11 96666-7788',
    serviceName: 'Barba completa',
    startLabel: 'Hoje',
    endLabel: '',
    time: '14:00',
    status: 'scheduled',
    paymentStatus: 'pending',
    priceInCents: 4000,
  },
  {
    id: 'apt_4',
    clientId: 'cli_joao',
    clientName: 'João Ferreira',
    clientPhone: '+55 11 99111-2233',
    serviceName: 'Corte masculino',
    startLabel: 'Hoje',
    endLabel: '',
    time: '16:30',
    status: 'scheduled',
    paymentStatus: 'pending',
    priceInCents: 5500,
  },
];

export const weekAppointments: MockAppointment[] = [
  ...todayAppointments,
  {
    id: 'apt_5',
    clientId: 'cli_andre',
    clientName: 'André Costa',
    clientPhone: '+55 11 95555-9900',
    serviceName: 'Corte + barba',
    startLabel: 'Amanhã',
    endLabel: '',
    time: '11:00',
    status: 'scheduled',
    paymentStatus: 'pending',
    priceInCents: 8500,
  },
  {
    id: 'apt_6',
    clientId: 'cli_joao',
    clientName: 'João Ferreira',
    clientPhone: '+55 11 99111-2233',
    serviceName: 'Corte masculino',
    startLabel: 'Quarta',
    endLabel: '',
    time: '15:00',
    status: 'scheduled',
    paymentStatus: 'pending',
    priceInCents: 5500,
  },
];

export const timeBlocks: MockTimeBlock[] = [
  {
    id: 'blk_1',
    label: 'Almoço',
    startLabel: 'Hoje · 12:00',
    endLabel: '13:00',
  },
  {
    id: 'blk_2',
    label: 'Folga — consulta',
    startLabel: 'Sexta · 09:00',
    endLabel: '11:00',
  },
];

const addressLine = `${workspace.address.street}, ${workspace.address.number} — ${workspace.address.neighborhood}, ${workspace.address.city}/${workspace.address.state}`;

export const dailyChecklist: MockChecklistItem[] = [
  {
    id: 'chk_1',
    appointmentId: 'apt_1',
    clientName: 'Lucas Almeida',
    clientPhone: '+55 11 94444-1122',
    kind: 'confirmation',
    message: `Oi Lucas! Confirmando seu horário hoje às 09:00 no ${workspace.name}. Local: ${addressLine}. Te espero!`,
    done: true,
  },
  {
    id: 'chk_2',
    appointmentId: 'apt_2',
    clientName: 'Rafael Souza',
    clientPhone: '+55 11 97777-4455',
    kind: 'reminder',
    message: `Rafael, lembrete: hoje às 10:30 — Corte + barba no ${workspace.name}. Endereço: ${addressLine}.`,
    done: false,
  },
  {
    id: 'chk_3',
    appointmentId: 'apt_3',
    clientName: 'Pedro Lima',
    clientPhone: '+55 11 96666-7788',
    kind: 'reminder',
    message: `Pedro, seu horário é hoje às 14:00 (Barba completa). Local: ${addressLine}. Qualquer imprevisto, me avisa.`,
    done: false,
  },
  {
    id: 'chk_4',
    appointmentId: 'apt_4',
    clientName: 'João Ferreira',
    clientPhone: '+55 11 99111-2233',
    kind: 'reminder',
    message: `João, lembrete: hoje às 16:30 no ${workspace.name}. Local: ${addressLine}.`,
    done: false,
  },
  {
    id: 'chk_5',
    appointmentId: 'apt_return',
    clientName: 'André Costa',
    clientPhone: '+55 11 95555-9900',
    kind: 'recurrence_return',
    message: `André, faz quase 30 dias do seu último corte. Quer agendar de novo? Tenho horários amanhã e quarta. É só responder.`,
    done: false,
  },
];

export const bookingLink = `https://socio247.app/b/${workspace.slug}`;

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function statusLabel(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Não compareceu',
  };
  return map[status];
}

export function kindLabel(kind: MockChecklistItem['kind']): string {
  const map = {
    reminder: 'Lembrete',
    confirmation: 'Confirmação',
    recurrence_return: 'Retorno',
  } as const;
  return map[kind];
}
