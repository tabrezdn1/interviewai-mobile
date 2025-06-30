import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeColors } from '../../src/store/themeStore';

export default function AuthLayout() {
  return (
    <AuthProvider>
      <AuthLayoutContent />
    </AuthProvider>
  );
}

function AuthLayoutContent() {
  const { user, loading, isAuthenticated } = useAuthStore();
  const colors = useThemeColors();

  // Get gradient colors from theme or fallback
  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  if (loading) {
    return (
      <LinearGradient colors={gradientColors as any} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </LinearGradient>
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