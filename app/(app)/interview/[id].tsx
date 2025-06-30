import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Clock,
    Mic, MicOff,
    MoreVertical,
    PhoneOff,
    Users,
    Video, VideoOff
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { LoadingComponent } from '../../../src/components';
import { InterviewService } from '../../../src/services/InterviewService';
import { useAuthStore } from '../../../src/store/authStore';


const InterviewSession: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(5);
  
  const intervalRef = useRef<any>(null);

  // Add colors and gradient configuration
  const colors = {
    background: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    primary: '#3b82f6',
    surface: '#ffffff',
    textInverse: '#ffffff',
    gradientBackground: null
  };

  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  // Mock AI interviewer responses
  const mockQuestions = [
    "Tell me about yourself and your background.",
    "What interests you most about this role?",
    "Can you walk me through a challenging project you've worked on?",
    "How do you handle working under pressure?",
    "Where do you see yourself in the next 5 years?"
  ];

  useEffect(() => {
    loadInterview();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  const loadInterview = async () => {
    try {
      if (typeof id === 'string') {
        const interviewData = await InterviewService.getInterview(id);
        setInterview(interviewData);
        setCurrentQuestion(mockQuestions[0]);
      }
    } catch (error) {
      console.error('Error loading interview:', error);
      Alert.alert('Error', 'Failed to load interview details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    // Start timer
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    Alert.alert(
      'Interview Started',
      'Your AI interview session has begun. Speak clearly and take your time to answer each question.',
      [{ text: 'Got it!' }]
    );
  };

  const endSession = () => {
    Alert.alert(
      'End Interview',
      'Are you sure you want to end this interview session?',
      [
        { text: 'Continue', style: 'cancel' },
        { 
          text: 'End Interview', 
          style: 'destructive',
          onPress: () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            // In a real app, this would save the session and process feedback
            router.push('/(app)/(tabs)/feedback');
          }
        }
      ]
    );
  };

  const nextQuestion = () => {
    if (questionNumber < totalQuestions) {
      setQuestionNumber(prev => prev + 1);
      setCurrentQuestion(mockQuestions[questionNumber]);
    } else {
      // Interview complete
      Alert.alert(
        'Interview Complete',
        'Congratulations! You\'ve completed all questions. Your responses are being analyzed.',
        [
          { text: 'View Feedback', onPress: () => router.push('/(app)/(tabs)/feedback') }
        ]
      );
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
  };

  if (loading) {
    return (
      <LoadingComponent 
        message="Loading interview..."
        size="large"
        showBackground={false}
      />
    );
  }

  return (
    <LinearGradient colors={gradientColors as any} style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <StatusBar barStyle="light-content" />
        
        {/* Video Area */}
        <View style={{ flex: 1, position: 'relative' }}>
          {/* AI Interviewer Video (Mock) */}
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(26, 26, 26, 0.8)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Users size={80} color="#6b7280" />
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginTop: 16 }}>
              AI Interviewer
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
              {sessionStarted ? 'Listening...' : 'Waiting to start'}
            </Text>
          </View>

          {/* User Video (Mock) */}
          <View style={{
            position: 'absolute',
            top: 60,
            right: 20,
            width: 120,
            height: 160,
            backgroundColor: '#2d2d2d',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isVideoOn ? '#22c55e' : '#ef4444',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {isVideoOn ? (
              <>
                <Video size={32} color="white" />
                <Text style={{ color: 'white', fontSize: 12, marginTop: 8 }}>You</Text>
              </>
            ) : (
              <>
                <VideoOff size={32} color="#9ca3af" />
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>Video Off</Text>
              </>
            )}
          </View>

          {/* Session Info */}
          <View style={{
            position: 'absolute',
            top: 60,
            left: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: 12,
            borderRadius: 8
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Clock size={16} color="white" />
              <Text style={{ color: 'white', fontSize: 14, marginLeft: 8 }}>
                {formatTime(elapsedTime)}
              </Text>
            </View>
            <Text style={{ color: '#9ca3af', fontSize: 12 }}>
              Question {questionNumber} of {totalQuestions}
            </Text>
          </View>
        </View>

        {/* Question Display */}
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: 20,
          margin: 20,
          borderRadius: 16,
          marginTop: 'auto',
          marginBottom: 140
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: colors.text,
            textAlign: 'center',
            lineHeight: 24
          }}>
            {currentQuestion}
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          paddingVertical: 24,
          paddingHorizontal: 20,
          paddingBottom: 40,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Video Toggle */}
          <TouchableOpacity 
            onPress={toggleVideo}
            style={{
              backgroundColor: isVideoOn ? '#22c55e' : '#ef4444',
              padding: 16,
              borderRadius: 50,
              marginHorizontal: 8
            }}
          >
            {isVideoOn ? <Video size={24} color="white" /> : <VideoOff size={24} color="white" />}
          </TouchableOpacity>

          {/* Audio Toggle */}
          <TouchableOpacity 
            onPress={toggleAudio}
            style={{
              backgroundColor: isAudioOn ? '#22c55e' : '#ef4444',
              padding: 16,
              borderRadius: 50,
              marginHorizontal: 8
            }}
          >
            {isAudioOn ? <Mic size={24} color="white" /> : <MicOff size={24} color="white" />}
          </TouchableOpacity>

          {/* Start/Next Button */}
          <TouchableOpacity 
            onPress={sessionStarted ? nextQuestion : startSession}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 25,
              marginHorizontal: 8,
              minWidth: 120
            }}
          >
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {sessionStarted ? 'Next' : 'Start'}
            </Text>
          </TouchableOpacity>

          {/* End Call */}
          <TouchableOpacity 
            onPress={endSession}
            style={{
              backgroundColor: '#ef4444',
              padding: 16,
              borderRadius: 50,
              marginHorizontal: 8
            }}
          >
            <PhoneOff size={24} color="white" />
          </TouchableOpacity>

          {/* More Options */}
          <TouchableOpacity 
            style={{
              backgroundColor: '#374151',
              padding: 16,
              borderRadius: 50,
              marginHorizontal: 8
            }}
          >
            <MoreVertical size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

// Helper function to format elapsed time
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default InterviewSession; 