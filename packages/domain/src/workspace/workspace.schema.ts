import { z } from 'zod';
import { addressSchema, auditSchema, emailSchema, phoneNumberSchema } from '../shared/primitives.js';

/** Segmento do negócio — usado para métricas e defaults de UX. */
export const businessSegmentSchema = z.enum([
  'barbershop',
  'hair_salon',
  'nails',
  'aesthetics',
  'tattoo',
  'other',
]);
export type BusinessSegment = z.infer<typeof businessSegmentSchema>;

/**
 * Estratégia de comunicação com o cliente final.
 * - automated: envio 100% automático via API oficial de WhatsApp.
 * - assisted: Sócio247 gera resumo diário (08:00) para envio manual + checklist.
 */
export const communicationModeSchema = z.enum(['automated', 'assisted']);
export type CommunicationMode = z.infer<typeof communicationModeSchema>;

export const workspaceSettingsSchema = z.object({
  timezone: z.string().default('America/Sao_Paulo'),
  communicationMode: communicationModeSchema.default('assisted'),
  /** Horário do resumo diário no modo assistido (HH:mm no fuso do workspace). */
  dailySummaryTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .default('08:00'),
  /** Antecedência do lembrete de agendamento, em horas. */
  reminderLeadHours: z.number().int().min(1).max(168).default(24),
});
export type WorkspaceSettings = z.infer<typeof workspaceSettingsSchema>;

/**
 * Workspace = o negócio do profissional (tenant). Documento raiz do isolamento
 * multi-tenant (`workspaces/{workspaceId}`).
 */
export const workspaceSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1).max(120),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífen'),
    segment: businessSegmentSchema.default('barbershop'),
    ownerId: z.string().min(1),
    phoneNumber: phoneNumberSchema.optional(),
    email: emailSchema.optional(),
    /** Local de atendimento; entra na confirmação de agendamento. */
    address: addressSchema.optional(),
    logoUrl: z.string().url().optional(),
    settings: workspaceSettingsSchema.default({}),
    status: z.enum(['active', 'suspended', 'archived']).default('active'),
  })
  .merge(auditSchema);
export type Workspace = z.infer<typeof workspaceSchema>;

export const createWorkspaceInputSchema = workspaceSchema.pick({
  name: true,
  slug: true,
  segment: true,
  phoneNumber: true,
  email: true,
  address: true,
});
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceInputSchema>;
