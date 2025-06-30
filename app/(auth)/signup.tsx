import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signUp } = useAuthStore();
  const colors = useThemeColors();
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();

  const gradient = createGradient(theme, 'background');

  const handleEmailSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp({ email, password, name });
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Please check your email and click the link to verify your account.',
        [{ text: 'OK', onPress: () => router.push('/(auth)/signin') }]
      );
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/(auth)/welcome');
  };

  return (
    <LinearGradient
      colors={gradient.colors as any}
      start={gradient.start}
      end={gradient.end}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
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
            <View style={{
              width: '100%',
              maxWidth: wp(90),
              backgroundColor: colors.card,
              borderRadius: borderRadius.xxl,
              padding: spacing.lg,
              ...getElevation(3, theme),
              borderWidth: 1,
              borderColor: colors.borderLight,
              position: 'relative',
            }}>
              {/* Close Button */}
              <TouchableOpacity 
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
                onPress={handleClose}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Header */}
              <View style={{
                alignItems: 'center',
                marginBottom: spacing.lg,
                marginTop: spacing.sm,
              }}>
                <Image 
                  source={require('../../assets/images/interviewai-logo.png')}
                  style={{
                    width: 50,
                    height: 50,
                    marginBottom: spacing.md,
                  }}
                  resizeMode="contain"
                />
                <Text style={{
                  fontSize: typography.titleLarge,
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: spacing.xs,
                  textAlign: 'center',
                  letterSpacing: -0.3,
                }}>
                  Create your account
                </Text>
                <Text style={{
                  fontSize: typography.body,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: typography.body * 1.4,
                  fontWeight: '500',
                }}>
                  Sign up to start practicing interviews with AI
                </Text>
              </View>

              {/* Form */}
              <View style={{ gap: spacing.md }}>
                <View style={{ gap: spacing.xs }}>
                  <Text style={{
                    fontSize: typography.body,
                    fontWeight: '600',
                    color: colors.text,
                  }}>
                    Full Name
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: borderRadius.lg,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      fontSize: typography.body,
                      color: colors.text,
                      ...getElevation(1, theme),
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.placeholder}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View style={{ gap: spacing.xs }}>
                  <Text style={{
                    fontSize: typography.body,
                    fontWeight: '600',
                    color: colors.text,
                  }}>
                    Email
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: borderRadius.lg,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      fontSize: typography.body,
                      color: colors.text,
                      ...getElevation(1, theme),
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

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
                      style={{
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: borderRadius.lg,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        paddingRight: touchTarget.medium + spacing.lg,
                        fontSize: typography.body,
                        color: colors.text,
                        ...getElevation(1, theme),
                      }}
                      placeholder="Enter your password (min. 6 characters)"
                      placeholderTextColor={colors.placeholder}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
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
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: spacing.sm,
                    ...getElevation(2, theme),
                    opacity: loading ? 0.7 : 1,
                  }}
                  onPress={handleEmailSignUp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <Text style={{
                      color: colors.textInverse,
                      fontSize: typography.body,
                      fontWeight: '700',
                    }}>
                      Create Account
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={{
                marginTop: spacing.lg,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: typography.body,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}>
                  Already have an account?{' '}
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: '600',
                    }}
                    onPress={() => router.push('/(auth)/signin')}
                  >
                    Sign in
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SignUp; 