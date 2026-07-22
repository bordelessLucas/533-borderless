import { z } from 'zod';

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'app',
  'b',
  'login',
  'logout',
  'meu-link',
  'socio247',
  'www',
]);

export const slugInputSchema = z
  .string()
  .trim()
  .min(3, 'Use pelo menos 3 caracteres')
  .max(48, 'Use no máximo 48 caracteres')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use apenas letras minúsculas, números e hífen (sem hífen no início/fim)',
  )
  .refine((value) => !RESERVED_SLUGS.has(value), 'Este endereço não está disponível');

/** Sanitiza enquanto digita: mantém hífen no final para permitir "meu-salao". */
export function sanitizeSlugDraft(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-/, '')
    .slice(0, 48);
}

/** Normaliza no save: remove hífens nas pontas. */
export function normalizeSlugInput(raw: string): string {
  return sanitizeSlugDraft(raw).replace(/-$/g, '');
}

export function parseSlugInput(raw: string): string {
  const result = slugInputSchema.safeParse(normalizeSlugInput(raw));
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? 'Endereço inválido');
  }
  return result.data;
}
