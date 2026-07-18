import { z } from 'zod';
import {
  auditSchema,
  isoDateTimeSchema,
  localDateSchema,
  localTimeSchema,
} from '../shared/primitives.js';

/** 0 = domingo ... 6 = sábado (compatível com Date.getDay). */
export const weekdaySchema = z.number().int().min(0).max(6);
export type Weekday = z.infer<typeof weekdaySchema>;

export const timeWindowSchema = z
  .object({
    start: localTimeSchema,
    end: localTimeSchema,
  })
  .refine((w) => w.start < w.end, { message: 'Início deve ser antes do fim' });
export type TimeWindow = z.infer<typeof timeWindowSchema>;

/**
 * Horário de trabalho recorrente por dia da semana
 * (`workspaces/{id}/availability/{providerId}`). Um doc por membro que atende.
 */
export const availabilitySchema = z
  .object({
    providerId: z.string().min(1),
    workspaceId: z.string().min(1),
    /** Janelas de atendimento por dia da semana (permite intervalos, ex.: almoço). */
    weeklyHours: z.record(z.string(), z.array(timeWindowSchema)).default({}),
    /** Granularidade dos slots ofertados no link de agendamento, em minutos. */
    slotIntervalMinutes: z.number().int().min(5).max(120).default(30),
  })
  .merge(auditSchema);
export type Availability = z.infer<typeof availabilitySchema>;

/**
 * Bloqueio de horário (`workspaces/{id}/timeBlocks/{blockId}`).
 * Cobre folgas, feriados e imprevistos — bloqueio fácil pelo profissional.
 */
export const timeBlockSchema = z
  .object({
    id: z.string().min(1),
    workspaceId: z.string().min(1),
    /** Ausente => bloqueio vale para todos os profissionais do workspace. */
    providerId: z.string().min(1).optional(),
    startAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
    reason: z.string().trim().max(200).optional(),
    /** Dia inteiro (folga/feriado) usa a data local para evitar ambiguidade de fuso. */
    allDayDate: localDateSchema.optional(),
  })
  .merge(auditSchema);
export type TimeBlock = z.infer<typeof timeBlockSchema>;

export const createTimeBlockInputSchema = timeBlockSchema.pick({
  providerId: true,
  startAt: true,
  endAt: true,
  reason: true,
  allDayDate: true,
});
export type CreateTimeBlockInput = z.infer<typeof createTimeBlockInputSchema>;
