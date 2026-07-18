import { z } from 'zod';

/**
 * Configuração pública do Firebase (client SDK). Preenchida via variáveis de
 * ambiente do app consumidor (Next.js usa prefixo NEXT_PUBLIC_, Expo usa EXPO_PUBLIC_).
 */
export const firebaseConfigSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  storageBucket: z.string().min(1),
  messagingSenderId: z.string().min(1),
  appId: z.string().min(1),
  measurementId: z.string().optional(),
});
export type FirebaseConfig = z.infer<typeof firebaseConfigSchema>;

/**
 * Valida e retorna a configuração a partir de um objeto de env já normalizado.
 * Falha cedo (fail-fast) com mensagem clara se algo estiver faltando.
 */
export function parseFirebaseConfig(raw: Record<string, string | undefined>): FirebaseConfig {
  const result = firebaseConfigSchema.safeParse({
    apiKey: raw.apiKey,
    authDomain: raw.authDomain,
    projectId: raw.projectId,
    storageBucket: raw.storageBucket,
    messagingSenderId: raw.messagingSenderId,
    appId: raw.appId,
    measurementId: raw.measurementId,
  });

  if (!result.success) {
    throw new Error(
      `Configuração do Firebase inválida/ausente: ${result.error.issues
        .map((issue) => issue.path.join('.'))
        .join(', ')}`,
    );
  }

  return result.data;
}
