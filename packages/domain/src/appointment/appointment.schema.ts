import { z } from 'zod';
import { auditSchema, isoDateTimeSchema, moneySchema } from '../shared/primitives';

/**
 * Ciclo de vida do agendamento.
 * Pagamento é registrado como presencial na fase 1 (sem gateway do cliente final).
 */
export const appointmentStatusSchema = z.enum([
  'scheduled',
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
]);
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export const paymentStatusSchema = z.enum(['pending', 'paid_on_site', 'waived']);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const appointmentSourceSchema = z.enum([
  'booking_link',
  'professional',
  'staff',
  'recurrence',
]);
export type AppointmentSource = z.infer<typeof appointmentSourceSchema>;

/** Serviço registrado no momento do agendamento (snapshot para faturamento preciso). */
export const appointmentServiceLineSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string().min(1),
  durationMinutes: z.number().int().min(1),
  price: moneySchema,
});
export type AppointmentServiceLine = z.infer<typeof appointmentServiceLineSchema>;

/**
 * Agendamento (`workspaces/{id}/appointments/{appointmentId}`).
 * `providerId` é o membro que atende; `clientId` o cliente final.
 */
export const appointmentSchema = z
  .object({
    id: z.string().min(1),
    workspaceId: z.string().min(1),
    clientId: z.string().min(1),
    clientName: z.string().min(1),
    providerId: z.string().min(1),
    services: z.array(appointmentServiceLineSchema).min(1),
    startAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
    status: appointmentStatusSchema.default('scheduled'),
    paymentStatus: paymentStatusSchema.default('pending'),
    source: appointmentSourceSchema.default('professional'),
    totalPrice: moneySchema,
    notes: z.string().trim().max(1000).optional(),
    /** Controle de idempotência dos lembretes já enviados para este agendamento. */
    reminderSentAt: isoDateTimeSchema.optional(),
    confirmationSentAt: isoDateTimeSchema.optional(),
    cancelledReason: z.string().trim().max(500).optional(),
  })
  .merge(auditSchema);
export type Appointment = z.infer<typeof appointmentSchema>;

export const createAppointmentInputSchema = z.object({
  clientId: z.string().min(1),
  providerId: z.string().min(1),
  serviceIds: z.array(z.string().min(1)).min(1),
  startAt: isoDateTimeSchema,
  source: appointmentSourceSchema.default('professional'),
  notes: z.string().trim().max(1000).optional(),
});
export type CreateAppointmentInput = z.infer<typeof createAppointmentInputSchema>;
