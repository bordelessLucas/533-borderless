import { doc, setDoc, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  COLLECTIONS,
  WORKSPACE_SUBCOLLECTIONS,
  tenantFirestoreFields,
} from '@socio247/domain';

const isExpoGo = Constants.appOwnership === 'expo';

function resolvePlatform(): 'ios' | 'android' | 'web' {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

/**
 * Registra token FCM/APNs. No Expo Go (SDK 53+) não carrega expo-notifications —
 * evita o ERROR de push remoto removido do Expo Go.
 */
export async function registerDevicePushToken(
  db: Firestore,
  workspaceId: string,
  uid: string,
): Promise<string | null> {
  if (isExpoGo) return null;

  const Device = await import('expo-device');
  if (!Device.isDevice && Platform.OS !== 'web') return null;

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Sócio247',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  let token: string | null = null;

  try {
    const devicePush = await Notifications.getDevicePushTokenAsync();
    token = typeof devicePush.data === 'string' ? devicePush.data : null;
  } catch {
    try {
      const expoPush = await Notifications.getExpoPushTokenAsync();
      token = expoPush.data;
    } catch {
      return null;
    }
  }

  if (!token) return null;

  const platform = resolvePlatform();
  const iso = new Date().toISOString();
  const tokenId = `${uid}_${platform}`.replace(/[^a-zA-Z0-9_-]/g, '_');

  await setDoc(
    doc(
      db,
      COLLECTIONS.workspaces,
      workspaceId,
      WORKSPACE_SUBCOLLECTIONS.deviceTokens,
      tokenId,
    ),
    {
      ...tenantFirestoreFields(uid, workspaceId),
      token,
      uid,
      platform,
      lastSeenAt: iso,
      createdAt: iso,
      updatedAt: iso,
      createdBy: uid,
      updatedBy: uid,
    },
    { merge: true },
  );

  return token;
}
