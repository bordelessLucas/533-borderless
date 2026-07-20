import { z } from 'zod';
import { auditSchema, moneySchema } from '../shared/primitives';

/** Duração fixa (ex.: corte) vs variável (ex.: mechas — exige confirmação do profissional). */
export const serviceDurationTypeSchema = z.enum(['fixed', 'variable']);
export type ServiceDurationType = z.infer<typeof serviceDurationTypeSchema>;

/**
 * Serviço oferecido pelo workspace (`workspaces/{id}/services/{serviceId}`).
 * Duração é usada para calcular slots disponíveis na agenda.
 */
export const serviceSchema = z
  .object({
    id: z.string().min(1),
    workspaceId: z.string().min(1),
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional(),
    durationType: serviceDurationTypeSchema.default('fixed'),
    durationMinutes: z.number().int().min(5).max(600),
    price: moneySchema,
    /** Intervalo de limpeza/preparo após o serviço, em minutos. */
    bufferMinutes: z.number().int().min(0).max(120).default(0),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    active: z.boolean().default(true),
  })
  .merge(auditSchema);
export type Service = z.infer<typeof serviceSchema>;

export const createServiceInputSchema = serviceSchema.pick({
  name: true,
  description: true,
  durationMinutes: true,
  price: true,
  bufferMinutes: true,
  color: true,
});
export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;
