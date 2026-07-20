import type { AppointmentStatus } from '@socio247/domain';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
};

export function statusLabel(status: AppointmentStatus): string {
  return STATUS_LABELS[status];
}
