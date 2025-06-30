import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { BarChart3, Calendar, Home, Settings } from 'lucide-react-native';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createGradient, getElevation, useThemeColors, useThemeStore } from '../../../src/store/themeStore';
import { spacing, touchTarget } from '../../../src/utils/responsive';

export default function TabLayout() {
  const colors = useThemeColors();
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  
  const gradient = createGradient(theme, 'background');
  const tabBarElevation = getElevation(2, theme);
  
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient 
        colors={gradient.colors as any} 
        start={gradient.start} 
        end={gradient.end} 
        style={{ flex: 1 }}
      >
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textTertiary,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.borderLight,
              borderTopWidth: 1,
              paddingBottom: Math.max(insets.bottom, spacing.sm),
              paddingTop: spacing.sm,
              height: Platform.select({
                ios: 80 + Math.max(insets.bottom - 10, 0),
                android: 65,
                default: 65,
              }),
              ...tabBarElevation,
              ...Platform.select({
                ios: {
                  position: 'absolute',
                },
                default: {},
              }),
            },
            tabBarIconStyle: {
              marginBottom: Platform.select({
                ios: 0,
                android: spacing.xs,
                default: spacing.xs,
              }),
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginBottom: Platform.select({
                ios: 0,
                android: spacing.xs,
                default: spacing.xs,
              }),
            },
            tabBarItemStyle: {
              paddingVertical: spacing.xs,
              minHeight: touchTarget.small,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  padding: spacing.xs,
                  borderRadius: 12,
                  backgroundColor: focused ? colors.primary + '15' : 'transparent',
                }}>
                  <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="interviews"
            options={{
              title: 'Interviews',
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  padding: spacing.xs,
                  borderRadius: 12,
                  backgroundColor: focused ? colors.primary + '15' : 'transparent',
                }}>
                  <Calendar size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="feedback"
            options={{
              title: 'Feedback',
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  padding: spacing.xs,
                  borderRadius: 12,
                  backgroundColor: focused ? colors.primary + '15' : 'transparent',
                }}>
                  <BarChart3 size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  padding: spacing.xs,
                  borderRadius: 12,
                  backgroundColor: focused ? colors.primary + '15' : 'transparent',
                }}>
                  <Settings size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                </View>
              ),
            }}
          />
        </Tabs>
      </LinearGradient>
    </View>
  );
} 