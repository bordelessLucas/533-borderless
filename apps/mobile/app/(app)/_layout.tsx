import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { usePushRegistration } from '@/features/push/usePushRegistration';
import { colors } from '@/lib/theme';

export default function AppLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: workspaceLoading } = useWorkspace();
  usePushRegistration();

  if (authLoading || (user && workspaceLoading)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
