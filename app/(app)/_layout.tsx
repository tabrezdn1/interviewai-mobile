import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { useAuthStore } from '../../src/store/authStore';

export default function AppLayout() {
  return (
    <AuthProvider>
      <AppLayoutContent />
    </AuthProvider>
  );
}

function AppLayoutContent() {
  const { user, loading, isAuthenticated } = useAuthStore();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="interview" />
    </Stack>
  );
} 