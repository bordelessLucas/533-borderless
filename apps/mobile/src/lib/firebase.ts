import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { parseFirebaseConfig, type FirebaseClient } from '@socio247/firebase';

type AuthModule = typeof import('firebase/auth') & {
  getReactNativePersistence?: (storage: typeof ReactNativeAsyncStorage) => Persistence;
};

let client: FirebaseClient | null = null;

function createAuth(app: ReturnType<typeof initializeApp>): Auth {
  // No Metro (condition react-native), firebase/auth exporta getReactNativePersistence.
  // No Node/tsc o export não aparece nos types web — acessamos via cast.
  const authModule = require('firebase/auth') as AuthModule;
  const getReactNativePersistence = authModule.getReactNativePersistence;

  if (typeof getReactNativePersistence === 'function') {
    try {
      return initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
    } catch {
      // Auth já inicializado (Fast Refresh)
      return getAuth(app);
    }
  }

  return getAuth(app);
}

export function getFirebaseClient(): FirebaseClient {
  if (client) return client;

  const config = parseFirebaseConfig({
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  });

  const app = getApps().length ? getApp() : initializeApp(config);
  client = {
    app,
    auth: createAuth(app),
    db: getFirestore(app) as Firestore,
  };
  return client;
}
