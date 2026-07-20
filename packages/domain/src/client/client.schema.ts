import { z } from 'zod';
import {
  auditSchema,
  emailSchema,
  isoDateTimeSchema,
  phoneNumberSchema,
} from '../shared/primitives';

/**
 * Cliente final do profissional (`workspaces/{id}/clients/{clientId}`).
 * O cliente NÃO acessa o app na fase 1 — é apenas um cadastro do profissional.
 */
export const clientSchema = z
  .object({
    id: z.string().min(1),
    workspaceId: z.string().min(1),
    name: z.string().trim().min(1).max(120),
    phoneNumber: phoneNumberSchema,
    email: emailSchema.optional(),
    notes: z.string().trim().max(1000).optional(),
    /**
     * Preferência de recorrência (dias) para alimentar automações de retorno.
     * Ex.: barbeiro que corta a cada 21 dias => recurrenceIntervalDays = 21.
     */
    recurrenceIntervalDays: z.number().int().min(1).max(365).optional(),
    lastVisitAt: isoDateTimeSchema.optional(),
    /** Consentimento para receber lembretes/comunicações (LGPD). */
    consentToContact: z.boolean().default(true),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    active: z.boolean().default(true),
  })
  .merge(auditSchema);
export type Client = z.infer<typeof clientSchema>;

export const createClientInputSchema = clientSchema.pick({
  name: true,
  phoneNumber: true,
  email: true,
  notes: true,
  recurrenceIntervalDays: true,
  consentToContact: true,
  tags: true,
});
export type CreateClientInput = z.infer<typeof createClientInputSchema>;
