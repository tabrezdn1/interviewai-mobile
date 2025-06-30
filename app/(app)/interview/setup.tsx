import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Code,
  Laptop,
  Lightbulb,
  MessageSquare,
  Smartphone,
  User,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DatabaseService, Interview } from '../../../src/services/DatabaseService';
import { InterviewFormData, InterviewService } from '../../../src/services/InterviewService';
import { useAuthStore } from '../../../src/store/authStore';
import { useThemeColors } from '../../../src/store/themeStore';
import { fetchDifficultyLevels, fetchExperienceLevels, fetchInterviewTypes } from '../../../src/utils/helpers';

interface InterviewType {
  id?: number;
  type: string;
  title: string;
  description: string;
  icon: string;
}

interface LevelOption {
  id?: number;
  value: string;
  label: string;
}

interface JobSuggestion {
  role: string;
  company?: string;
  icon: React.ReactNode;
}

const InterviewSetup: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuthStore();
  const colors = useThemeColors();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingInterview, setExistingInterview] = useState<Interview | null>(null);
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<LevelOption[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<LevelOption[]>([]);
  
  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0); // 2 PM
  
  const [formData, setFormData] = useState<InterviewFormData>({
    interviewType: '',
    role: '',
    company: '',
    experience: '',
    difficulty: 'medium',
    duration: 20
  });

  const [scheduledDateTime, setScheduledDateTime] = useState(tomorrow);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const [jobSuggestions] = useState<JobSuggestion[]>([
    { 
      role: 'Frontend Developer', 
      company: 'Google',
      icon: <Code size={20} color={colors.info} />
    },
    { 
      role: 'Product Manager', 
      company: 'Amazon',
      icon: <Briefcase size={20} color={colors.success} />
    },
    { 
      role: 'Data Scientist', 
      company: 'Microsoft',
      icon: <Laptop size={20} color={colors.accent} />
    },
    { 
      role: 'UX Designer', 
      company: 'Apple',
      icon: <Smartphone size={20} color={colors.textSecondary} />
    },
    { 
      role: 'Software Engineer', 
      company: 'Netflix',
      icon: <Code size={20} color={colors.error} />
    },
    { 
      role: 'DevOps Engineer', 
      company: 'Spotify',
      icon: <Code size={20} color={colors.success} />
    }
  ]);

  // Generate date options (next 30 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        times.push(time);
      }
    }
    return times;
  };

  // Load dynamic data from Supabase and existing interview if editing
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [types, experienceLevelsData, difficultyLevelsData] = await Promise.all([
          fetchInterviewTypes(),
          fetchExperienceLevels(),
          fetchDifficultyLevels()
        ]);
        
        setInterviewTypes(types);
        setExperienceLevels(experienceLevelsData);
        setDifficultyLevels(difficultyLevelsData);

        // If we have an ID, we're editing an existing interview
        if (id && user) {
          setIsEditing(true);
          const interviews = await DatabaseService.getInterviews(user.id);
          const interview = interviews.find(i => i.id === id);
          
          if (interview) {
            setExistingInterview(interview);
            
            // Map interview data to form data
            const interviewTypeMap: { [key: number]: string } = {
              1: 'technical',
              2: 'behavioral', 
              3: 'mixed'
            };
            
            setFormData({
              interviewType: interviewTypeMap[interview.interview_type_id] || 'technical',
              role: interview.role,
              company: interview.company || '',
              experience: interview.experience_levels?.value || '',
              difficulty: interview.difficulty_levels?.value || 'medium',
              duration: interview.duration || 20
            });

            // Set scheduled date and time
            if (interview.scheduled_at) {
              setScheduledDateTime(new Date(interview.scheduled_at));
            }
          } else {
            Alert.alert('Error', 'Interview not found', [
              { text: 'OK', onPress: () => router.push('/(app)/(tabs)/interviews') }
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load interview data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  const handleInputChange = (field: keyof InterviewFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, interviewType: type }));
  };

  const handleJobSuggestionSelect = (suggestion: JobSuggestion) => {
    setFormData(prev => ({
      ...prev,
      role: suggestion.role,
      company: suggestion.company || prev.company
    }));
  };

  const handleDateSelect = (selectedDate: Date) => {
    const newDateTime = new Date(scheduledDateTime);
    newDateTime.setFullYear(selectedDate.getFullYear());
    newDateTime.setMonth(selectedDate.getMonth());
    newDateTime.setDate(selectedDate.getDate());
    setScheduledDateTime(newDateTime);
    setShowDateModal(false);
  };

  const handleTimeSelect = (selectedTime: Date) => {
    const newDateTime = new Date(scheduledDateTime);
    newDateTime.setHours(selectedTime.getHours());
    newDateTime.setMinutes(selectedTime.getMinutes());
    setScheduledDateTime(newDateTime);
    setShowTimeModal(false);
  };

  const isStepValid = () => {
    if (step === 1) return !!formData.interviewType;
    if (step === 2) return !!formData.role && !!formData.company && !!formData.experience;
    if (step === 3) return !!formData.difficulty && !!scheduledDateTime;
    if (step === 4) return true; // Review step
    return true;
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save and schedule interview
      await handleSaveAndSchedule();
    }
  };

  const handleSaveAndSchedule = async () => {
    setSaving(true);
    try {
      if (user) {
        const interviewData = {
          ...formData,
          scheduled_at: scheduledDateTime.toISOString()
        };

        if (isEditing && existingInterview) {
          // Update existing interview
          await InterviewService.updateInterview(existingInterview.id, interviewData);
          router.push('/(app)/(tabs)/interviews' as any);
          Alert.alert('Success', 'Interview updated successfully');
        } else {
          // Create new interview
          await InterviewService.createInterview(user.id, interviewData);
          router.replace('/(app)/(tabs)/' as any);
          Alert.alert('Success', 'Interview scheduled successfully');
        }
      }
    } catch (error: any) {
      console.error('Error saving interview:', error);
      Alert.alert('Error', error.message || `Failed to ${isEditing ? 'update' : 'schedule'} interview`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // Go back to interviews tab if editing, otherwise dashboard
      router.push(isEditing ? '/(app)/(tabs)/interviews' : '/(app)/(tabs)' as any);
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'code':
      case 'technical':
        return <Code size={24} color={colors.info} />;
      case 'user':
      case 'behavioral':
        return <User size={24} color={colors.success} />;
      case 'lightbulb':
      case 'mixed':
        return <Lightbulb size={24} color={colors.accent} />;
      case 'messagesquare':
      case 'general':
        return <MessageSquare size={24} color={colors.warning} />;
      default:
        return <Code size={24} color={colors.textSecondary} />;
    }
  };

  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

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
          {isEditing ? 'Edit Interview' : 'Interview Setup'}
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: colors.textSecondary,
          fontWeight: '500'
        }}>
          {isEditing ? 'Update your interview details' : 'Configure your practice session'}
        </Text>
      </View>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'center', 
      marginBottom: 24,
      paddingHorizontal: 24
    }}>
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: colors.borderLight,
      }}>
        {[1, 2, 3, 4].map((stepNumber) => (
          <View key={stepNumber} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: stepNumber <= step ? colors.primary : colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: stepNumber <= step ? colors.primary : colors.border,
              shadowColor: stepNumber <= step ? colors.primary : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: stepNumber <= step ? 3 : 0,
            }}>
              {stepNumber < step ? (
                <Check size={16} color={colors.textInverse} />
              ) : (
                <Text style={{ 
                  color: stepNumber === step ? colors.textInverse : colors.textTertiary,
                  fontSize: 13,
                  fontWeight: '700'
                }}>
                  {stepNumber}
                </Text>
              )}
            </View>
            {stepNumber < 4 && (
              <View style={{
                width: 24,
                height: 2,
                backgroundColor: stepNumber < step ? colors.primary : colors.border,
                marginHorizontal: 6,
                borderRadius: 1
              }} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  // Date Selection Modal
  const renderDateModal = () => (
    <Modal
      visible={showDateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDateModal(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
      }}>
        <View style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 20,
          paddingBottom: 40,
          paddingHorizontal: 20,
          maxHeight: '70%'
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.text
            }}>
              Select Date
            </Text>
            <TouchableOpacity onPress={() => setShowDateModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 8 }}>
              {generateDateOptions().map((date, index) => {
                const isSelected = date.toDateString() === scheduledDateTime.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
                
                let displayText = date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                });
                
                if (isToday) displayText = `Today, ${displayText}`;
                if (isTomorrow) displayText = `Tomorrow, ${displayText}`;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={{
                      backgroundColor: isSelected ? colors.primary + '20' : colors.card,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.borderLight,
                    }}
                    onPress={() => handleDateSelect(date)}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: isSelected ? colors.primary : colors.text
                    }}>
                      {displayText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Time Selection Modal
  const renderTimeModal = () => (
    <Modal
      visible={showTimeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTimeModal(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
      }}>
        <View style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 20,
          paddingBottom: 40,
          paddingHorizontal: 20,
          maxHeight: '70%'
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.text
            }}>
              Select Time
            </Text>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 8 }}>
              {generateTimeOptions().map((time, index) => {
                const timeString = time.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                });
                const isSelected = time.getHours() === scheduledDateTime.getHours() && 
                                 time.getMinutes() === scheduledDateTime.getMinutes();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={{
                      backgroundColor: isSelected ? colors.primary + '20' : colors.card,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.borderLight,
                    }}
                    onPress={() => handleTimeSelect(time)}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: isSelected ? colors.primary : colors.text
                    }}>
                      {timeString}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderStep1 = () => (
    <View style={{ flex: 1, paddingHorizontal: 24 }}>
      <View style={{ marginBottom: 20, alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 22, 
          fontWeight: '800', 
          color: colors.text, 
          marginBottom: 6, 
          textAlign: 'center',
          letterSpacing: -0.5
        }}>
          Choose Interview Type
        </Text>
        <Text style={{ 
          fontSize: 15, 
          color: colors.textSecondary, 
          textAlign: 'center',
          fontWeight: '500',
          lineHeight: 20
        }}>
          What type of interview would you like to practice?
        </Text>
      </View>
      
      <View style={{ gap: 12 }}>
        {interviewTypes.map((type) => (
          <TouchableOpacity
            key={type.type}
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: formData.interviewType === type.type ? colors.primary : colors.borderLight,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: formData.interviewType === type.type ? 0.12 : 0.06,
              shadowRadius: 8,
              elevation: formData.interviewType === type.type ? 6 : 3,
            }}
            onPress={() => handleTypeSelect(type.type)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                backgroundColor: formData.interviewType === type.type ? colors.primary + '20' : colors.surface,
                padding: 10,
                borderRadius: 10,
                marginRight: 12,
                borderWidth: 1,
                borderColor: formData.interviewType === type.type ? colors.primary + '40' : colors.border,
              }}>
                {getIconComponent(type.icon)}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '700', 
                    color: formData.interviewType === type.type ? colors.primary : colors.text,
                  }}>
                    {type.title}
                  </Text>
                  {formData.interviewType === type.type && (
                    <Check size={18} color={colors.primary} />
                  )}
                </View>
                <Text style={{ 
                  fontSize: 13, 
                  color: colors.textSecondary, 
                  lineHeight: 16,
                  fontWeight: '500',
                  marginTop: 2
                }}>
                  {type.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ flex: 1, paddingHorizontal: 24 }}>
      <View style={{ marginBottom: 20, alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 22, 
          fontWeight: '800', 
          color: colors.text, 
          marginBottom: 6, 
          textAlign: 'center',
          letterSpacing: -0.5
        }}>
          Job Details
        </Text>
        <Text style={{ 
          fontSize: 15, 
          color: colors.textSecondary, 
          textAlign: 'center',
          fontWeight: '500',
          lineHeight: 20
        }}>
          Tell us about the role you&apos;re interviewing for
        </Text>
      </View>

      {/* Quick Suggestions */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '700', 
          color: colors.text, 
          marginBottom: 12 
        }}>
          Popular Roles
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 10, paddingRight: 24 }}>
            {jobSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: colors.card,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  minWidth: 140,
                  alignItems: 'center',
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 3
                }}
                onPress={() => handleJobSuggestionSelect(suggestion)}
              >
                <View style={{
                  backgroundColor: colors.surface,
                  padding: 8,
                  borderRadius: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}>
                  {suggestion.icon}
                </View>
                <Text style={{ 
                  fontSize: 13, 
                  fontWeight: '600', 
                  color: colors.text, 
                  textAlign: 'center',
                  marginBottom: 2
                }}>
                  {suggestion.role}
                </Text>
                <Text style={{ 
                  fontSize: 11, 
                  color: colors.textSecondary,
                  fontWeight: '500'
                }}>
                  {suggestion.company}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Form Fields */}
      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ 
            fontSize: 15, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 8 
          }}>
            Job Role *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 15,
              color: colors.text,
              fontWeight: '500',
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 2,
              elevation: 2,
            }}
            placeholder="e.g., Software Engineer, Product Manager"
            placeholderTextColor={colors.placeholder}
            value={formData.role}
            onChangeText={(text) => handleInputChange('role', text)}
          />
        </View>

        <View>
          <Text style={{ 
            fontSize: 15, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 8 
          }}>
            Company *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.surface,
              padding: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 15,
              color: colors.text,
              fontWeight: '500',
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 2,
              elevation: 2,
            }}
            placeholder="e.g., Google, Microsoft, Startup Inc."
            placeholderTextColor={colors.placeholder}
            value={formData.company}
            onChangeText={(text) => handleInputChange('company', text)}
          />
        </View>

        <View>
          <Text style={{ 
            fontSize: 15, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 8 
          }}>
            Experience Level *
          </Text>
          <View style={{ gap: 8 }}>
            {experienceLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={{
                  backgroundColor: formData.experience === level.value ? colors.primary + '10' : colors.card,
                  padding: 14,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: formData.experience === level.value ? colors.primary : colors.borderLight,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => handleInputChange('experience', level.value)}
              >
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: '600',
                  color: formData.experience === level.value ? colors.primary : colors.text
                }}>
                  {level.label}
                </Text>
                {formData.experience === level.value && (
                  <Check size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  // Step 3: Settings + Date/Time (moved from step 4)
  const renderStep3 = () => (
    <View style={{ flex: 1, paddingHorizontal: 24 }}>
      <View style={{ marginBottom: 20, alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 22, 
          fontWeight: '800', 
          color: colors.text, 
          marginBottom: 6, 
          textAlign: 'center',
          letterSpacing: -0.5
        }}>
          Interview Settings
        </Text>
        <Text style={{ 
          fontSize: 15, 
          color: colors.textSecondary, 
          textAlign: 'center',
          fontWeight: '500',
          lineHeight: 20
        }}>
          Configure your interview experience
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 20 }}>
          {/* Difficulty Level */}
          <View>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '700', 
              color: colors.text, 
              marginBottom: 12 
            }}>
              Difficulty Level
            </Text>
            <View style={{ gap: 8 }}>
              {difficultyLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={{
                    backgroundColor: formData.difficulty === level.value ? colors.primary + '10' : colors.card,
                    padding: 14,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: formData.difficulty === level.value ? colors.primary : colors.borderLight,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => handleInputChange('difficulty', level.value)}
                >
                  <Text style={{ 
                    fontSize: 15, 
                    fontWeight: '600',
                    color: formData.difficulty === level.value ? colors.primary : colors.text
                  }}>
                    {level.label}
                  </Text>
                  {formData.difficulty === level.value && (
                    <Check size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '700', 
              color: colors.text, 
              marginBottom: 12 
            }}>
              Duration
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[10, 20, 30, 40].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={{
                    flex: 1,
                    backgroundColor: formData.duration === duration ? colors.primary + '10' : colors.card,
                    padding: 14,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: formData.duration === duration ? colors.primary : colors.borderLight,
                    alignItems: 'center',
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => handleInputChange('duration', duration)}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '700',
                    color: formData.duration === duration ? colors.primary : colors.text,
                    marginBottom: 2
                  }}>
                    {duration}
                  </Text>
                  <Text style={{ 
                    fontSize: 11, 
                    color: colors.textSecondary,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    minutes
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date & Time Selection */}
          <View>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '700', 
              color: colors.text, 
              marginBottom: 12 
            }}>
              Schedule Date & Time
            </Text>
            
            {/* Date Picker */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: colors.borderLight,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 3,
                marginBottom: 12,
              }}
              onPress={() => setShowDateModal(true)}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
              }}>
                <Calendar size={18} color={colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>
                    Interview Date
                  </Text>
                  <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', marginTop: 1 }}>
                    {scheduledDateTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Time Picker */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: colors.borderLight,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => setShowTimeModal(true)}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
              }}>
                <Clock size={18} color={colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>
                    Interview Time
                  </Text>
                  <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', marginTop: 1 }}>
                    {scheduledDateTime.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Popular Time Slots */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: colors.text, 
                marginBottom: 8 
              }}>
                Popular Times
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {['09:00', '10:00', '14:00', '15:00', '16:00', '17:00'].map((timeStr) => {
                  const [hour, minute] = timeStr.split(':');
                  const currentTime = scheduledDateTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  });
                  const isSelected = currentTime === timeStr;
                  
                  return (
                    <TouchableOpacity
                      key={timeStr}
                      style={{
                        backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }}
                      onPress={() => {
                        const newDateTime = new Date(scheduledDateTime);
                        newDateTime.setHours(parseInt(hour), parseInt(minute));
                        setScheduledDateTime(newDateTime);
                      }}
                    >
                      <Text style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: isSelected ? colors.primary : colors.text,
                      }}>
                        {new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Modals */}
      {renderDateModal()}
      {renderTimeModal()}
    </View>
  );

  // Step 4: Review/Summary (new)
  const renderStep4 = () => {
    const selectedInterviewType = interviewTypes.find(type => type.type === formData.interviewType);
    const selectedExperience = experienceLevels.find(level => level.value === formData.experience);
    const selectedDifficulty = difficultyLevels.find(level => level.value === formData.difficulty);

    return (
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 20, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 22, 
            fontWeight: '800', 
            color: colors.text, 
            marginBottom: 6, 
            textAlign: 'center',
            letterSpacing: -0.5
          }}>
            Review Interview
          </Text>
          <Text style={{ 
            fontSize: 15, 
            color: colors.textSecondary, 
            textAlign: 'center',
            fontWeight: '500',
            lineHeight: 20
          }}>
            Please review your interview configuration
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ gap: 16 }}>
            {/* Interview Type */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 10,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.borderLight,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                {selectedInterviewType && getIconComponent(selectedInterviewType.icon)}
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '700', 
                  color: colors.text,
                  marginLeft: 10
                }}>
                  {selectedInterviewType?.title}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                {selectedInterviewType?.description}
              </Text>
            </View>

            {/* Job Details */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 10,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.borderLight,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '700', 
                color: colors.text,
                marginBottom: 12
              }}>
                Job Details
              </Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>
                    Role:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>
                    {formData.role}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>
                    Company:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>
                    {formData.company}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>
                    Experience:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>
                    {selectedExperience?.label}
                  </Text>
                </View>
              </View>
            </View>

            {/* Interview Settings */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 10,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.borderLight,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '700', 
                color: colors.text,
                marginBottom: 12
              }}>
                Interview Settings
              </Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>
                    Difficulty:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>
                    {selectedDifficulty?.label}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>
                    Duration:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>
                    {formData.duration} minutes
                  </Text>
                </View>
              </View>
            </View>

            {/* Schedule */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 10,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.borderLight,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '700', 
                color: colors.text,
                marginBottom: 12
              }}>
                Scheduled Time
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Calendar size={18} color={colors.primary} />
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.text, 
                  fontWeight: '600',
                  marginLeft: 10
                }}>
                  {scheduledDateTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={18} color={colors.primary} />
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.text, 
                  fontWeight: '600',
                  marginLeft: 10
                }}>
                  {scheduledDateTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={gradientColors as any} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary, fontSize: 16 }}>
            Loading interview setup...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradientColors as any} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 32 }}>
        {renderHeader()}
        {renderStepIndicator()}
        
        {/* Content Area */}
        {step === 1 ? (
          // Step 1: No scroll, fit to screen
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              {renderStep1()}
            </View>
            {/* Bottom Actions */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  opacity: !isStepValid() || saving ? 0.6 : 1,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 6,
                }}
                onPress={handleNext}
                disabled={!isStepValid() || saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: colors.textInverse, fontSize: 16, fontWeight: '600', marginRight: 8 }}>
                      Continue
                    </Text>
                    <ChevronRight size={20} color={colors.textInverse} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Other steps: Allow scrolling
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1, marginBottom: 20 }}>
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </View>
            
            {/* Bottom Actions */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  opacity: !isStepValid() || saving ? 0.6 : 1,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 6,
                }}
                onPress={handleNext}
                disabled={!isStepValid() || saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: colors.textInverse, fontSize: 16, fontWeight: '600', marginRight: 8 }}>
                      {step === 4 ? 'Schedule Interview' : 'Continue'}
                    </Text>
                    <ChevronRight size={20} color={colors.textInverse} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
      {renderDateModal()}
      {renderTimeModal()}
    </LinearGradient>
  );
};

export default InterviewSetup; 