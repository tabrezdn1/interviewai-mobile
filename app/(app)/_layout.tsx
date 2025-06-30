import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientLoadingComponent } from '../../src/components';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { useAuthStore } from '../../src/store/authStore';
import { createGradient, useThemeColors, useThemeStore } from '../../src/store/themeStore';
import { spacing } from '../../src/utils/responsive';

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
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();

  const gradient = createGradient(theme, 'background');

  if (loading) {
    return (
      <GradientLoadingComponent 
        message="Loading app..."
        size="large"
        gradientColors={gradient.colors as any}
      />
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background,
      paddingTop: Math.max(insets.top + spacing.lg, spacing.xxl), // Increased padding significantly
    }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="interview" />
        <Stack.Screen name="billing" />
        <Stack.Screen name="feedback" />
        <Stack.Screen name="profile" />
      </Stack>
    </View>
  );
} 