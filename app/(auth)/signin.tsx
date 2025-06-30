import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { createGradient, getElevation, useThemeColors, useThemeStore } from '../../src/store/themeStore';
import {
  borderRadius,
  grid,
  spacing,
  touchTarget,
  typography,
  wp
} from '../../src/utils/responsive';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn } = useAuthStore();
  const colors = useThemeColors();
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();

  const gradient = createGradient(theme, 'background');
  const cardElevation = getElevation(3, theme);

  const handleClose = () => {
    router.push('/(auth)/welcome');
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient 
      colors={gradient.colors as any} 
      start={gradient.start} 
      end={gradient.end} 
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          paddingTop: Math.max(insets.top + spacing.lg, spacing.xl),
          paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xl),
          paddingHorizontal: grid.container,
        }}>
          <View style={{
            alignItems: 'center',
          }}>
            {/* Main Card */}
            <View style={{
              width: '100%',
              maxWidth: wp(90),
              backgroundColor: colors.card,
              borderRadius: borderRadius.xxl,
              padding: spacing.lg,
              ...cardElevation,
              borderWidth: 1,
              borderColor: colors.borderLight,
              position: 'relative',
            }}>
              {/* Close Button */}
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  position: 'absolute',
                  top: spacing.sm,
                  right: spacing.sm,
                  width: touchTarget.small,
                  height: touchTarget.small,
                  borderRadius: touchTarget.small / 2,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...getElevation(1, theme),
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  zIndex: 10,
                }}
                activeOpacity={0.7}
              >
                <X size={16} color={colors.textSecondary} strokeWidth={2.5} />
              </TouchableOpacity>
              {/* Header */}
              <View style={{
                alignItems: 'center',
                marginBottom: spacing.lg,
              }}>
                <View style={{
                  backgroundColor: colors.primary + '15',
                  borderRadius: borderRadius.xl,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                  ...getElevation(1, theme),
                }}>
                  <Text style={{
                    fontSize: typography.headline,
                    fontWeight: '800',
                    color: colors.primary,
                  }}>
                    🎯
                  </Text>
                </View>
                
                <Text style={{
                  fontSize: typography.titleLarge,
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: spacing.xs,
                  textAlign: 'center',
                  letterSpacing: -0.5,
                }}>
                  Welcome Back
                </Text>
                <Text style={{
                  fontSize: typography.body,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: typography.body * 1.4,
                  fontWeight: '500',
                }}>
                  Sign in to continue your interview journey
                </Text>
              </View>

              {/* Form */}
              <View style={{ gap: spacing.md }}>
                {/* Email Input */}
                <View style={{ gap: spacing.xs }}>
                  <Text style={{
                    fontSize: typography.body,
                    fontWeight: '600',
                    color: colors.text,
                  }}>
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={{
                      backgroundColor: colors.input,
                      borderWidth: 2,
                      borderColor: colors.inputBorder,
                      borderRadius: borderRadius.lg,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      fontSize: typography.body,
                      color: colors.text,
                      minHeight: touchTarget.medium,
                      ...getElevation(1, theme),
                    }}
                  />
                </View>

                {/* Password Input */}
                <View style={{ gap: spacing.xs }}>
                  <Text style={{
                    fontSize: typography.body,
                    fontWeight: '600',
                    color: colors.text,
                  }}>
                    Password
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.placeholder}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      style={{
                        backgroundColor: colors.input,
                        borderWidth: 2,
                        borderColor: colors.inputBorder,
                        borderRadius: borderRadius.lg,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        paddingRight: touchTarget.medium + spacing.lg,
                        fontSize: typography.body,
                        color: colors.text,
                        minHeight: touchTarget.medium,
                        ...getElevation(1, theme),
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: spacing.md,
                        top: 0,
                        bottom: 0,
                        width: touchTarget.medium,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: borderRadius.sm,
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleEmailSignIn}
                  disabled={loading}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: touchTarget.large,
                    marginTop: spacing.sm,
                    ...getElevation(2, theme),
                  }}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.textInverse} />
                  ) : (
                    <Text style={{
                      fontSize: typography.body,
                      fontWeight: '700',
                      color: colors.textInverse,
                    }}>
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Sign Up Link */}
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/signup')}
                  style={{
                    alignItems: 'center',
                    paddingVertical: spacing.sm,
                    marginTop: spacing.sm,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    fontSize: typography.body,
                    color: colors.textSecondary,
                    textAlign: 'center',
                  }}>
                    Don't have an account?{' '}
                    <Text style={{
                      color: colors.primary,
                      fontWeight: '600',
                    }}>
                      Sign up
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SignIn; 