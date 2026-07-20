import type { Appointment, Availability, Service, TimeBlock } from '@socio247/domain';

const BLOCKING_STATUSES = new Set<Appointment['status']>([
  'scheduled',
  'pending',
  'confirmed',
]);

function parseLocalDateTime(localDate: string, localTime: string): Date {
  const [year, month, day] = localDate.split('-').map(Number);
  const [hours, minutes] = localTime.split(':').map(Number);
  return new Date(year!, month! - 1, day!, hours!, minutes!, 0, 0);
}

function isSameLocalDate(iso: string, localDate: string): boolean {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` === localDate;
}

function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}

function getWeekdayFromLocalDate(localDate: string): number {
  const [year, month, day] = localDate.split('-').map(Number);
  return new Date(year!, month! - 1, day!, 12, 0, 0, 0).getDay();
}

function getTimeBlockRange(block: TimeBlock, localDate: string): { start: Date; end: Date } | null {
  if (block.allDayDate) {
    if (block.allDayDate !== localDate) return null;
    const start = parseLocalDateTime(localDate, '00:00');
    const end = parseLocalDateTime(localDate, '23:59');
    end.setSeconds(59, 999);
    return { start, end };
  }

  if (!isSameLocalDate(block.startAt, localDate)) return null;
  return {
    start: new Date(block.startAt),
    end: new Date(block.endAt),
  };
}

export interface ComputeSlotsInput {
  localDate: string;
  service: Service;
  availability: Availability;
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  now?: Date;
}

export function computeAvailableSlots({
  localDate,
  service,
  availability,
  appointments,
  timeBlocks,
  now = new Date(),
}: ComputeSlotsInput): Date[] {
  const weekday = getWeekdayFromLocalDate(localDate);
  const windows = availability.weeklyHours[String(weekday)] ?? [];
  if (windows.length === 0) return [];

  const slotIntervalMinutes = availability.slotIntervalMinutes;
  const occupiedMinutes = service.durationMinutes + (service.bufferMinutes ?? 0);

  const dayAppointments = appointments.filter(
    (appointment) =>
      isSameLocalDate(appointment.startAt, localDate) &&
      BLOCKING_STATUSES.has(appointment.status),
  );

  const dayBlockRanges = timeBlocks
    .map((block) => getTimeBlockRange(block, localDate))
    .filter((range): range is { start: Date; end: Date } => range !== null);

  const slots: Date[] = [];

  for (const window of windows) {
    let cursor = parseLocalDateTime(localDate, window.start);
    const windowEnd = parseLocalDateTime(localDate, window.end);

    while (cursor < windowEnd) {
      const slotEnd = new Date(cursor.getTime() + occupiedMinutes * 60_000);
      if (slotEnd > windowEnd) break;

      const overlapsAppointment = dayAppointments.some((appointment) =>
        intervalsOverlap(cursor, slotEnd, new Date(appointment.startAt), new Date(appointment.endAt)),
      );

      const overlapsBlock = dayBlockRanges.some((block) =>
        intervalsOverlap(cursor, slotEnd, block.start, block.end),
      );

      if (!overlapsAppointment && !overlapsBlock && cursor > now) {
        slots.push(new Date(cursor));
      }

      cursor = new Date(cursor.getTime() + slotIntervalMinutes * 60_000);
    }
  }

  return slots;
}

export function formatSlotLabel(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
