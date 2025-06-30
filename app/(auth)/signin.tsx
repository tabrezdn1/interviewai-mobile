import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeColors } from '../../src/store/themeStore';

const { width, height } = Dimensions.get('window');

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, signInWithOAuth } = useAuthStore();
  const colors = useThemeColors();

  // Get gradient colors from theme or fallback
  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation will be handled by auth state change
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      await signInWithOAuth(provider);
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    glassContainer: {
      position: 'relative',
      alignItems: 'center',
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 32,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 20,
      },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoContainer: {
      marginBottom: 16,
    },
    logo: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    logoText: {
      fontSize: 28,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    form: {
      gap: 20,
    },
    inputContainer: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    passwordContainer: {
      position: 'relative',
    },
    passwordInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      paddingRight: 50,
      fontSize: 16,
      color: colors.text,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    passwordToggle: {
      position: 'absolute',
      right: 16,
      top: 17,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      marginTop: 8,
    },
    disabledButton: {
      opacity: 0.7,
    },
    primaryButtonText: {
      color: colors.textInverse,
      fontSize: 18,
      fontWeight: 'bold',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
      gap: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 14,
      color: colors.textTertiary,
      fontWeight: '500',
    },
    oauthContainer: {
      gap: 12,
    },
    oauthButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    oauthButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    footer: {
      marginTop: 32,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    footerLink: {
      color: colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <LinearGradient
      colors={gradientColors as any}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Glassmorphism Background */}
          <View style={styles.glassContainer}>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>🎯</Text>
                  </View>
                </View>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to continue your interview practice</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.placeholder}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.disabledButton]}
                  onPress={handleEmailSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* OAuth Buttons */}
                <View style={styles.oauthContainer}>
                  <TouchableOpacity
                    style={styles.oauthButton}
                    onPress={() => handleOAuthSignIn('google')}
                    disabled={loading}
                  >
                    <Ionicons name="logo-google" size={20} color="#EA4335" />
                    <Text style={styles.oauthButtonText}>Continue with Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.oauthButton}
                    onPress={() => handleOAuthSignIn('github')}
                    disabled={loading}
                  >
                    <Ionicons name="logo-github" size={20} color={colors.text} />
                    <Text style={styles.oauthButtonText}>Continue with GitHub</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don&apos;t have an account?{' '}
                  <Text
                    style={styles.footerLink}
                    onPress={() => router.push('/(auth)/signup')}
                  >
                    Sign up
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SignIn; 