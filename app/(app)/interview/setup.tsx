import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Briefcase,
    Check,
    ChevronRight,
    Code,
    Laptop,
    Lightbulb,
    MessageSquare,
    Smartphone,
    User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DatabaseService, Interview } from '../../../src/services/DatabaseService';
import { InterviewFormData, InterviewService } from '../../../src/services/InterviewService';
import { useAuthStore } from '../../../src/store/authStore';
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
  const defaultDate = tomorrow.toISOString().split('T')[0];
  const defaultTime = '14:00';
  
  const [formData, setFormData] = useState<InterviewFormData>({
    interviewType: '',
    role: '',
    company: '',
    experience: '',
    difficulty: 'medium',
    duration: 20
  });

  const [jobSuggestions] = useState<JobSuggestion[]>([
    { 
      role: 'Frontend Developer', 
      company: 'Google',
      icon: <Code size={20} color="#3b82f6" />
    },
    { 
      role: 'Product Manager', 
      company: 'Amazon',
      icon: <Briefcase size={20} color="#10b981" />
    },
    { 
      role: 'Data Scientist', 
      company: 'Microsoft',
      icon: <Laptop size={20} color="#8b5cf6" />
    },
    { 
      role: 'UX Designer', 
      company: 'Apple',
      icon: <Smartphone size={20} color="#6b7280" />
    },
    { 
      role: 'Software Engineer', 
      company: 'Netflix',
      icon: <Code size={20} color="#ef4444" />
    },
    { 
      role: 'DevOps Engineer', 
      company: 'Spotify',
      icon: <Code size={20} color="#22c55e" />
    }
  ]);

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

  const isStepValid = () => {
    if (step === 1) return !!formData.interviewType;
    if (step === 2) return !!formData.role && !!formData.company && !!formData.experience;
    if (step === 3) return !!formData.difficulty;
    return true;
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Create/update interview and start it
      await handleCreateAndStart();
    }
  };

  const handleCreateAndStart = async () => {
    setSaving(true);
    try {
      if (user) {
        if (isEditing && existingInterview) {
          // Update existing interview
          await InterviewService.updateInterview(existingInterview.id, formData);
        } else {
          // Create new interview
          await InterviewService.createInterview(user.id, formData);
        }
        router.push('/(app)/(tabs)');
      }
    } catch (error: any) {
      console.error('Error saving interview:', error);
      Alert.alert('Error', error.message || `Failed to ${isEditing ? 'update' : 'create'} interview`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndSchedule = async () => {
    setSaving(true);
    try {
      if (user) {
        if (isEditing && existingInterview) {
          // Update existing interview
          await InterviewService.updateInterview(existingInterview.id, formData);
          Alert.alert('Success', 'Interview updated successfully', [
            { text: 'OK', onPress: () => router.push('/(app)/(tabs)/interviews') }
          ]);
        } else {
          // Create new interview
          await InterviewService.createInterview(user.id, formData);
          Alert.alert('Success', 'Interview scheduled successfully', [
            { text: 'OK', onPress: () => router.push('/(app)/(tabs)') }
          ]);
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
      router.push(isEditing ? '/(app)/(tabs)/interviews' : '/(app)/(tabs)');
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code size={24} color="#3b82f6" />;
      case 'MessageSquare':
        return <MessageSquare size={24} color="#10b981" />;
      case 'Lightbulb':
        return <Lightbulb size={24} color="#8b5cf6" />;
      case 'User':
        return <User size={24} color="#ef4444" />;
      default:
        return <Code size={24} color="#6b7280" />;
    }
  };

  const renderHeader = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, paddingHorizontal: 20 }}>
      <TouchableOpacity onPress={handleBack} style={{ marginRight: 16 }}>
        <ArrowLeft size={24} color="#1f2937" />
      </TouchableOpacity>
      <View>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937' }}>
          {isEditing ? 'Edit Interview' : 'Interview Setup'}
        </Text>
                 <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 4 }}>
           {isEditing ? 'Update your interview details' : 'Let&apos;s set up your practice session'}
         </Text>
      </View>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
      {[1, 2, 3].map((stepNumber) => (
        <View key={stepNumber} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: stepNumber <= step ? '#007AFF' : '#e5e7eb',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {stepNumber < step ? (
              <Check size={16} color="white" />
            ) : (
              <Text style={{ 
                color: stepNumber === step ? 'white' : '#6b7280',
                fontSize: 14,
                fontWeight: '600'
              }}>
                {stepNumber}
              </Text>
            )}
          </View>
          {stepNumber < 3 && (
            <View style={{
              width: 40,
              height: 2,
              backgroundColor: stepNumber < step ? '#007AFF' : '#e5e7eb',
              marginHorizontal: 8
            }} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>
        Choose Interview Type
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 32, textAlign: 'center' }}>
        What type of interview would you like to practice?
      </Text>
      
      <View style={{ gap: 16 }}>
        {interviewTypes.map((type) => (
          <TouchableOpacity
            key={type.type}
            style={{
              backgroundColor: formData.interviewType === type.type ? '#eff6ff' : 'white',
              padding: 20,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: formData.interviewType === type.type ? '#007AFF' : '#e5e7eb',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}
            onPress={() => handleTypeSelect(type.type)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {getIconComponent(type.icon)}
              <Text style={{ 
                marginLeft: 12, 
                fontSize: 18, 
                fontWeight: '600', 
                color: formData.interviewType === type.type ? '#007AFF' : '#1f2937'
              }}>
                {type.title}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>
              {type.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>
        Job Details
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 32, textAlign: 'center' }}>
        Tell us about the role you're interviewing for
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
          Quick Suggestions
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}>
            {jobSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  minWidth: 140,
                  alignItems: 'center'
                }}
                onPress={() => handleJobSuggestionSelect(suggestion)}
              >
                {suggestion.icon}
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginTop: 8, textAlign: 'center' }}>
                  {suggestion.role}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {suggestion.company}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={{ gap: 20 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            Job Role *
          </Text>
          <TextInput
            style={{
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              fontSize: 16,
              color: '#1f2937'
            }}
            placeholder="e.g., Software Engineer, Product Manager"
            value={formData.role}
            onChangeText={(text) => handleInputChange('role', text)}
          />
        </View>

        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            Company *
          </Text>
          <TextInput
            style={{
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              fontSize: 16,
              color: '#1f2937'
            }}
            placeholder="e.g., Google, Microsoft, Startup Inc."
            value={formData.company}
            onChangeText={(text) => handleInputChange('company', text)}
          />
        </View>

        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            Experience Level *
          </Text>
          <View style={{ gap: 8 }}>
            {experienceLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={{
                  backgroundColor: formData.experience === level.value ? '#eff6ff' : 'white',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: formData.experience === level.value ? '#007AFF' : '#e5e7eb'
                }}
                onPress={() => handleInputChange('experience', level.value)}
              >
                <Text style={{ 
                  fontSize: 16, 
                  color: formData.experience === level.value ? '#007AFF' : '#1f2937'
                }}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>
        Interview Settings
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 32, textAlign: 'center' }}>
        Configure your interview preferences
      </Text>

      <View style={{ gap: 24 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
            Difficulty Level
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {difficultyLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={{
                  flex: 1,
                  backgroundColor: formData.difficulty === level.value ? '#007AFF' : 'white',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: formData.difficulty === level.value ? '#007AFF' : '#e5e7eb',
                  alignItems: 'center'
                }}
                onPress={() => handleInputChange('difficulty', level.value)}
              >
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600',
                  color: formData.difficulty === level.value ? 'white' : '#1f2937'
                }}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
            Duration
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[15, 20, 30, 45].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={{
                  flex: 1,
                  backgroundColor: formData.duration === duration ? '#007AFF' : 'white',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: formData.duration === duration ? '#007AFF' : '#e5e7eb',
                  alignItems: 'center'
                }}
                onPress={() => handleInputChange('duration', duration)}
              >
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600',
                  color: formData.duration === duration ? 'white' : '#1f2937'
                }}>
                  {duration}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{
          backgroundColor: '#f0f9ff',
          padding: 20,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#0ea5e9'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Lightbulb size={20} color="#0ea5e9" />
            <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#0369a1' }}>
              Interview Summary
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: '#0369a1', lineHeight: 20 }}>
            {formData.interviewType} interview for {formData.role} at {formData.company}
            {'\n'}Level: {experienceLevels.find(l => l.value === formData.experience)?.label}
            {'\n'}Duration: {formData.duration} minutes • Difficulty: {formData.difficulty}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>Loading interview setup...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {renderHeader()}
        {renderStepIndicator()}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        {/* Navigation Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, gap: 16 }}>
          {step > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Previous
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={step === 3 ? handleCreateAndStart : handleNext}
            disabled={!isStepValid() || saving}
            style={{
              flex: step === 1 ? 1 : 2,
              backgroundColor: isStepValid() ? '#007AFF' : 'rgba(255, 255, 255, 0.3)',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center'
            }}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16, 
                  fontWeight: '600',
                  marginRight: 8 
                }}>
                  {step === 3 ? 'Start Interview' : 'Next Step'}
                </Text>
                {step < 3 && <ChevronRight size={20} color="white" />}
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {step === 3 && (
          <TouchableOpacity
            onPress={handleSaveAndSchedule}
            disabled={!isStepValid() || saving}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Save for Later
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default InterviewSetup; 