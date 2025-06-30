import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { BarChart3, Calendar, Home, Settings } from 'lucide-react-native';
import React from 'react';
import { Platform, View } from 'react-native';
import { useThemeColors } from '../../../src/store/themeStore';

export default function TabLayout() {
  const colors = useThemeColors();
  
  // Get gradient colors from theme or fallback
  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);
  
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={gradientColors as any} style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textTertiary,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              ...Platform.select({
                ios: {
                  position: 'absolute',
                },
                default: {},
              }),
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color }) => <Home size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="interviews"
            options={{
              title: 'Interviews',
              tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="feedback"
            options={{
              title: 'Feedback',
              tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
            }}
          />
        </Tabs>
      </LinearGradient>
    </View>
  );
} 