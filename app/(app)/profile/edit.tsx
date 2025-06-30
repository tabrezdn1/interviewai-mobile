import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Save, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
import { GradientLoadingComponent } from '../../../src/components';
import { ProfileService } from '../../../src/services/ProfileService';
import { useAuthStore } from '../../../src/store/authStore';
import { useThemeColors } from '../../../src/store/themeStore';

const EditProfileScreen: React.FC = () => {
  const { user } = useAuthStore();
  const colors = useThemeColors();
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const profileSettings = await ProfileService.getProfileSettings(user.id);
      if (profileSettings) {
        setFormData({
          name: profileSettings.profile.name || '',
          email: profileSettings.profile.email || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setSaving(true);
    try {
      const success = await ProfileService.updateProfileSettings(user.id, {
        profile: {
          id: user.id,
          name: formData.name,
          email: formData.email
        }
      });

      if (success) {
        // Navigate directly without Alert
        router.navigate('/(app)/(tabs)/settings');
        
        // Show a brief success message
        setTimeout(() => {
          Alert.alert('Success', 'Profile updated successfully');
        }, 100);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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
          Edit Profile
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: colors.textSecondary,
          fontWeight: '500'
        }}>
          Update your personal information
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <GradientLoadingComponent 
        message="Loading profile..."
        size="large"
        gradientColors={gradientColors as any}
      />
    );
  }

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
              {/* Profile Icon */}
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
                  <User size={32} color={colors.primary} />
                </View>
              </View>

              {/* Form Fields */}
              <View style={{ gap: 20 }}>
                <View>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: colors.text,
                    marginBottom: 8
                  }}>
                    Full Name *
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: colors.text,
                      shadowColor: colors.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.placeholder}
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    autoCapitalize="words"
                  />
                </View>

                <View>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: colors.textSecondary,
                    marginBottom: 8
                  }}>
                    Email Address
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: colors.surface + '80',
                      borderWidth: 1,
                      borderColor: colors.border + '60',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: colors.textSecondary,
                      shadowColor: colors.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                      opacity: 0.7,
                    }}
                    placeholder="Email address (read-only)"
                    placeholderTextColor={colors.placeholder}
                    value={formData.email}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                  <Text style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    marginTop: 6,
                    fontWeight: '500'
                  }}>
                    Email address cannot be changed from the mobile app
                  </Text>
                </View>
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
                    Save Changes
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

export default EditProfileScreen; 