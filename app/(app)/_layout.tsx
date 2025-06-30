import { Redirect, Stack } from 'expo-router';
import { GradientLoadingComponent } from '../../src/components';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeColors } from '../../src/store/themeStore';

export default function AppLayout() {
  return (
    <AuthProvider>
      <AppLayoutContent />
    </AuthProvider>
  );
}

function AppLayoutContent() {
  const { user, loading, isAuthenticated } = useAuthStore();
  const colors = useThemeColors();

  // Get gradient colors from theme or fallback
  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  if (loading) {
    return (
      <GradientLoadingComponent 
        message="Loading app..."
        size="large"
        gradientColors={gradientColors as any}
      />
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