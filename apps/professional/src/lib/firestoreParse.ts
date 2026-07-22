import { Timestamp } from 'firebase/firestore';
import type { z } from 'zod';

function timestampsToIso(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(timestampsToIso);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        timestampsToIso(val),
      ]),
    );
  }
  return value;
}

/** Valida documento do Firestore com Zod; retorna null se inválido. */
export function parseFirestoreDoc<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown,
): z.infer<TSchema> | null {
  const result = schema.safeParse(timestampsToIso(data));
  return result.success ? result.data : null;
}
