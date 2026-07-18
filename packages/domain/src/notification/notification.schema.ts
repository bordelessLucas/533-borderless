import { z } from 'zod';
import { auditSchema, isoDateTimeSchema, localDateSchema } from '../shared/primitives.js';

/** Token de push do dispositivo do profissional/atendente (FCM). */
export const deviceTokenSchema = z
  .object({
    token: z.string().min(1),
    uid: z.string().min(1),
    workspaceId: z.string().min(1),
    platform: z.enum(['ios', 'android', 'web']),
    lastSeenAt: isoDateTimeSchema,
  })
  .merge(auditSchema);
export type DeviceToken = z.infer<typeof deviceTokenSchema>;

/**
 * Tipos de notificação enviadas ao PROFISSIONAL/atendente (não ao cliente final).
 * - daily_summary: resumo das 08:00 (modo assistido).
 * - appointment_reminder: lembrete operacional de próximo atendimento.
 * - billing_past_due / billing_pending: avisos de assinatura.
 */
export const notificationTypeSchema = z.enum([
  'daily_summary',
  'appointment_reminder',
  'billing_past_due',
  'billing_pending',
  'system',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z
  .object({
    id: z.string().min(1),
    workspaceId: z.string().min(1),
    recipientUid: z.string().min(1),
    type: notificationTypeSchema,
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(500),
    data: z.record(z.string(), z.string()).default({}),
    readAt: isoDateTimeSchema.optional(),
    sentAt: isoDateTimeSchema.optional(),
    deliveryStatus: z.enum(['queued', 'sent', 'failed']).default('queued'),
  })
  .merge(auditSchema);
export type Notification = z.infer<typeof notificationSchema>;

/**
 * Item do checklist de envio manual (modo assistido). Cada item corresponde a um
 * cliente que precisa receber lembrete/confirmação naquele dia.
 */
export const summaryChecklistItemSchema = z.object({
  appointmentId: z.string().min(1),
  clientId: z.string().min(1),
  clientName: z.string().min(1),
  clientPhone: z.string().min(1),
  /** Mensagem pronta para copiar/colar no WhatsApp. */
  message: z.string().min(1),
  kind: z.enum(['reminder', 'confirmation', 'recurrence_return']),
  done: z.boolean().default(false),
  doneAt: isoDateTimeSchema.optional(),
});
export type SummaryChecklistItem = z.infer<typeof summaryChecklistItemSchema>;

/**
 * Resumo diário do modo assistido (`workspaces/{id}/dailySummaries/{YYYY-MM-DD}`).
 * Gerado por Cloud Scheduler no horário configurado (default 08:00).
 */
export const dailySummarySchema = z
  .object({
    date: localDateSchema,
    workspaceId: z.string().min(1),
    generatedAt: isoDateTimeSchema,
    appointmentsCount: z.number().int().nonnegative(),
    items: z.array(summaryChecklistItemSchema).default([]),
    /** Notificação push que anuncia o resumo já foi disparada? */
    pushSentAt: isoDateTimeSchema.optional(),
    completedAt: isoDateTimeSchema.optional(),
  })
  .merge(auditSchema);
export type DailySummary = z.infer<typeof dailySummarySchema>;
