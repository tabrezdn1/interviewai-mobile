import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { useAuthStore } from '../../src/store/authStore';

export default function AuthLayout() {
  return (
    <AuthProvider>
      <AuthLayoutContent />
    </AuthProvider>
  );
}

function AuthLayoutContent() {
  const { user, loading, isAuthenticated } = useAuthStore();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
} 