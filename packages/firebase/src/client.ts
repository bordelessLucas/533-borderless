import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import type { FirebaseConfig } from './config.js';

export interface FirebaseClient {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

/**
 * Inicializa (ou reaproveita) a app cliente do Firebase de forma idempotente —
 * seguro para Hot Reload do Next.js e para o runtime do Expo.
 */
export function initFirebaseClient(config: FirebaseConfig): FirebaseClient {
  const app = getApps().length ? getApp() : initializeApp(config);
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}
