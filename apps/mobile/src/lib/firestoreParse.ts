import { Timestamp } from 'firebase/firestore';

export function timestampsToIso(value: unknown): unknown {
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

type SafeParseSchema<T> = {
  safeParse: (data: unknown) => { success: true; data: T } | { success: false };
};

export function parseFirestoreDoc<T>(schema: SafeParseSchema<T>, raw: unknown): T | null {
  const normalized = timestampsToIso(raw);
  const parsed = schema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}
