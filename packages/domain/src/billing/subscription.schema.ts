import { z } from 'zod';
import { auditSchema, isoDateTimeSchema, moneySchema } from '../shared/primitives.js';

/**
 * Planos da Sócio247. Preço-alvo do MVP ~R$50/mês (vs. concorrentes ~R$200).
 * Valores concretos ficam no catálogo de planos; aqui só o identificador.
 */
export const planTierSchema = z.enum(['starter', 'pro']);
export type PlanTier = z.infer<typeof planTierSchema>;

export const billingCycleSchema = z.enum(['monthly', 'yearly']);
export type BillingCycle = z.infer<typeof billingCycleSchema>;

/** Status espelhado do Asaas (subscription + últimas cobranças). */
export const subscriptionStatusSchema = z.enum([
  'trialing',
  'active',
  'past_due',
  'suspended',
  'cancelled',
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const paymentMethodSchema = z.enum(['pix', 'boleto', 'credit_card']);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

/**
 * Assinatura Sócio247 ↔ profissional (`subscriptions/{workspaceId}`).
 * Doc-id = workspaceId para garantir 1 assinatura por tenant.
 */
export const subscriptionSchema = z
  .object({
    workspaceId: z.string().min(1),
    plan: planTierSchema,
    cycle: billingCycleSchema.default('monthly'),
    price: moneySchema,
    status: subscriptionStatusSchema.default('trialing'),
    paymentMethod: paymentMethodSchema.optional(),
    trialEndsAt: isoDateTimeSchema.optional(),
    currentPeriodEndsAt: isoDateTimeSchema.optional(),
    /** Referências no provedor de pagamento (Asaas). */
    asaas: z
      .object({
        customerId: z.string().min(1).optional(),
        subscriptionId: z.string().min(1).optional(),
      })
      .default({}),
    cancelledAt: isoDateTimeSchema.optional(),
  })
  .merge(auditSchema);
export type Subscription = z.infer<typeof subscriptionSchema>;

/**
 * Evento de webhook recebido do Asaas (`webhookEvents/{eventId}`).
 * Persistido para idempotência e auditoria.
 */
export const webhookEventSchema = z
  .object({
    id: z.string().min(1),
    provider: z.literal('asaas'),
    event: z.string().min(1),
    payload: z.record(z.string(), z.unknown()),
    processedAt: isoDateTimeSchema.optional(),
    status: z.enum(['received', 'processed', 'failed']).default('received'),
    error: z.string().optional(),
  })
  .merge(auditSchema);
export type WebhookEvent = z.infer<typeof webhookEventSchema>;
