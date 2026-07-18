import { z } from 'zod';

/**
 * Valores monetários são sempre armazenados em centavos (inteiro) para evitar
 * erros de ponto flutuante. Ex.: R$ 50,00 => { amountInCents: 5000 }.
 */
export const moneySchema = z.object({
  amountInCents: z.number().int().nonnegative(),
  currency: z.literal('BRL').default('BRL'),
});
export type Money = z.infer<typeof moneySchema>;

/** Telefone no padrão E.164 (ex.: +5511999998888). */
export const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, 'Telefone deve estar no formato E.164 (ex.: +5511999998888)');
export type PhoneNumber = z.infer<typeof phoneNumberSchema>;

export const emailSchema = z.string().trim().toLowerCase().email();
export type Email = z.infer<typeof emailSchema>;

/** Timestamps trafegam como ISO 8601 no domínio; a camada Firebase converte de/para Timestamp. */
export const isoDateTimeSchema = z.string().datetime({ offset: true });
export type IsoDateTime = z.infer<typeof isoDateTimeSchema>;

/** Data local no formato YYYY-MM-DD (sem fuso), usada para dias de agenda. */
export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser YYYY-MM-DD');
export type LocalDate = z.infer<typeof localDateSchema>;

/** Horário local no formato HH:mm (24h), usado para janelas de disponibilidade. */
export const localTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário deve ser HH:mm');
export type LocalTime = z.infer<typeof localTimeSchema>;

export const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof geoPointSchema>;

/** Endereço do local de atendimento (usado na confirmação de agendamento). */
export const addressSchema = z.object({
  label: z.string().trim().min(1).max(120).optional(),
  street: z.string().trim().min(1).max(180),
  number: z.string().trim().max(20).optional(),
  complement: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().max(120).optional(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().length(2, 'UF deve ter 2 letras'),
  postalCode: z.string().trim().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  country: z.string().trim().default('BR'),
  geo: geoPointSchema.optional(),
});
export type Address = z.infer<typeof addressSchema>;

/** Metadados de auditoria presentes em todo documento persistido. */
export const auditSchema = z.object({
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  createdBy: z.string().min(1).optional(),
  updatedBy: z.string().min(1).optional(),
});
export type Audit = z.infer<typeof auditSchema>;
