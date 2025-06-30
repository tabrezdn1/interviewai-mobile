import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Lock, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../../src/config/supabase';
import { useThemeColors } from '../../../src/store/themeStore';

const ChangePasswordScreen: React.FC = () => {
  const colors = useThemeColors();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [saving, setSaving] = useState(false);

  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChar,
      errors: [
        ...(password.length < minLength ? [`At least ${minLength} characters`] : []),
        ...(!hasUppercase ? ['One uppercase letter'] : []),
        ...(!hasLowercase ? ['One lowercase letter'] : []),
        ...(!hasNumbers ? ['One number'] : []),
        ...(!hasSpecialChar ? ['One special character'] : [])
      ]
    };
  };

  const handleSave = async () => {
    if (!formData.currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!formData.confirmPassword.trim()) {
      Alert.alert('Error', 'Please confirm your new password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Invalid Password', `Password must contain:\n${passwordValidation.errors.join('\n')}`);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setSaving(true);
    try {
      // First verify the current password by trying to sign in with it
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('User not found');
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      // Navigate directly without Alert
      router.navigate('/(app)/(tabs)/settings');
      
      // Show a brief success message
      setTimeout(() => {
        Alert.alert('Success', 'Password updated successfully');
      }, 100);
    } catch (error: any) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message || 'Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderHeader = () => (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 24, 
      paddingHorizontal: 24,
      paddingTop: 12
    }}>
      <TouchableOpacity 
        onPress={handleBack} 
        style={{ 
          marginRight: 12,
          backgroundColor: colors.surface,
          padding: 10,
          borderRadius: 10,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 3,
          borderWidth: 1,
          borderColor: colors.borderLight,
        }}
      >
        <ArrowLeft size={18} color={colors.text} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: '800', 
          color: colors.text,
          letterSpacing: -0.5,
          marginBottom: 2
        }}>
          Change Password
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: colors.textSecondary,
          fontWeight: '500'
        }}>
          Update your account password
        </Text>
      </View>
    </View>
  );

  const renderPasswordField = (
    label: string,
    field: keyof typeof formData,
    showField: keyof typeof showPasswords,
    placeholder: string
  ) => (
    <View>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        color: colors.text,
        marginBottom: 8
      }}>
        {label} *
      </Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={{
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
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={formData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          secureTextEntry={!showPasswords[showField]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 16,
            top: 17,
          }}
          onPress={() => togglePasswordVisibility(showField)}
        >
          {showPasswords[showField] ? (
            <EyeOff size={20} color={colors.textSecondary} />
          ) : (
            <Eye size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const passwordValidation = validatePassword(formData.newPassword);

  return (
    <LinearGradient colors={gradientColors as any} style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, paddingTop: 32 }}>
          {renderHeader()}
          
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ paddingHorizontal: 24 }}>
              {/* Lock Icon */}
              <View style={{ 
                alignItems: 'center', 
                marginBottom: 32 
              }}>
                <View style={{
                  backgroundColor: colors.surface,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 8,
                  borderWidth: 3,
                  borderColor: colors.primary + '20',
                }}>
                  <Lock size={32} color={colors.primary} />
                </View>
              </View>

              {/* Form Fields */}
              <View style={{ gap: 20 }}>
                {renderPasswordField(
                  'Current Password',
                  'currentPassword',
                  'current',
                  'Enter your current password'
                )}

                {renderPasswordField(
                  'New Password',
                  'newPassword',
                  'new',
                  'Enter your new password'
                )}

                {/* Password Requirements */}
                {formData.newPassword && (
                  <View style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: passwordValidation.isValid ? colors.success + '40' : colors.border,
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: 8
                    }}>
                      Password Requirements:
                    </Text>
                    {['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number', 'One special character'].map((req, index) => {
                      const isMet = !passwordValidation.errors.includes(req);
                      return (
                        <Text
                          key={index}
                          style={{
                            fontSize: 13,
                            color: isMet ? colors.success : colors.textSecondary,
                            marginBottom: 2,
                            fontWeight: '500'
                          }}
                        >
                          {isMet ? '✓' : '○'} {req}
                        </Text>
                      );
                    })}
                  </View>
                )}

                {renderPasswordField(
                  'Confirm New Password',
                  'confirmPassword',
                  'confirm',
                  'Confirm your new password'
                )}

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <View style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: formData.newPassword === formData.confirmPassword ? colors.success + '10' : colors.error + '10',
                  }}>
                    <Text style={{
                      fontSize: 13,
                      color: formData.newPassword === formData.confirmPassword ? colors.success : colors.error,
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={{ 
            paddingHorizontal: 24, 
            paddingBottom: 32,
            paddingTop: 16,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                opacity: saving ? 0.6 : 1,
              }}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Save size={20} color={colors.textInverse} />
                  <Text style={{ 
                    color: colors.textInverse, 
                    fontSize: 16, 
                    fontWeight: '600',
                    marginLeft: 8
                  }}>
                    Update Password
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default ChangePasswordScreen; 