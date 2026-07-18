import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from 'firebase/firestore';
import type { z } from 'zod';

/** Converte Timestamp do Firestore em ISO string recursivamente (para o domínio). */
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

/**
 * Cria um FirestoreDataConverter que valida leitura/escrita com um schema Zod.
 * Normaliza Timestamp -> ISO na leitura e valida antes de retornar ao app,
 * garantindo que a camada de dados nunca entregue documentos inválidos.
 */
export function createConverter<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
): FirestoreDataConverter<z.infer<TSchema>> {
  return {
    toFirestore(data: WithFieldValue<z.infer<TSchema>>): DocumentData {
      return data as DocumentData;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions,
    ): z.infer<TSchema> {
      const raw = timestampsToIso(snapshot.data(options));
      return schema.parse(raw) as z.infer<TSchema>;
    },
  };
}
