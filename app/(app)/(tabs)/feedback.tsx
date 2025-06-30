import { useRouter } from 'expo-router';
import {
  BarChart3,
  Calendar,
  Clock,
  Eye,
  Trash2
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { DatabaseService, Interview } from '../../../src/services/DatabaseService';
import { useAuthStore } from '../../../src/store/authStore';
import { useThemeColors } from '../../../src/store/themeStore';
import { formatDate } from '../../../src/utils/helpers';

const FeedbackScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const colors = useThemeColors();
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompletedInterviews = useCallback(async (showRefresh = false) => {
    if (!user?.id) return;
    
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const allInterviews = await DatabaseService.getInterviews(user.id);
      // Filter for completed interviews only
      const completedInterviews = allInterviews.filter(interview => 
        interview.status === 'completed'
      );
      setInterviews(completedInterviews);
    } catch (error) {
      console.error('Error fetching completed interviews:', error);
      Alert.alert('Error', 'Failed to load feedback data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCompletedInterviews();
  }, [fetchCompletedInterviews]);

  const handleViewFeedback = (interview: Interview) => {
    // Navigate to detailed feedback view
    router.push({
      pathname: '/(app)/feedback/[id]',
      params: { id: interview.id }
    });
  };

  const handleDeleteInterview = (interview: Interview) => {
    Alert.alert(
      'Delete Interview',
      `Are you sure you want to delete the feedback for ${interview.role} at ${interview.company}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteInterview(interview.id);
              setInterviews(prev => prev.filter(i => i.id !== interview.id));
            } catch (error) {
              console.error('Error deleting interview:', error);
              Alert.alert('Error', 'Failed to delete interview');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    fetchCompletedInterviews(true);
  };

  const getScoreRating = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  const getThemeScoreColor = (score: number) => {
    if (score >= 85) return colors.success;
    if (score >= 70) return colors.info;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const renderHeader = () => (
    <View style={{
      marginBottom: 32,
      paddingHorizontal: 24,
      paddingTop: 8,
    }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ 
          fontSize: 32, 
          fontWeight: '800', 
          color: colors.text, 
          marginBottom: 4,
          letterSpacing: -0.5
        }}>
          Feedback
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: colors.textSecondary,
          fontWeight: '500'
        }}>
          Review your interview performance and insights
        </Text>
      </View>
      
      {interviews.length > 0 && (
        <View style={{
          backgroundColor: colors.success + '10',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: colors.success,
        }}>
          <Text style={{ 
            fontSize: 14, 
            color: colors.success, 
            fontWeight: '600' 
          }}>
            {interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'} completed
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingVertical: 64,
    }}>
      <View style={{
        backgroundColor: colors.surface,
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: colors.borderLight,
        borderStyle: 'dashed',
      }}>
        <BarChart3 size={48} color={colors.textTertiary} />
      </View>
      
      <Text style={{ 
        fontSize: 24, 
        fontWeight: '700', 
        color: colors.text, 
        marginBottom: 8,
        textAlign: 'center'
      }}>
        No Completed Interviews
      </Text>
      
      <Text style={{ 
        fontSize: 16, 
        color: colors.textSecondary, 
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        maxWidth: 280
      }}>
        Complete your first interview to see detailed feedback and performance analytics
      </Text>
      
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => router.push('/(app)/interview/setup')}
      >
        <BarChart3 size={20} color={colors.textInverse} style={{ marginRight: 8 }} />
        <Text style={{ 
          color: colors.textInverse, 
          fontSize: 16, 
          fontWeight: '600' 
        }}>
          Start Interview
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInterviewCard = (interview: Interview) => (
    <View
      key={interview.id}
      style={{
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 12,
        padding: 14,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.borderLight,
      }}
    >
      {/* Header Row */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 12 
      }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{
              backgroundColor: colors.primary + '20',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}>
              <Text style={{ 
                fontSize: 9, 
                color: colors.primary, 
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                {interview.interview_types?.title || 'Interview'}
              </Text>
            </View>
          </View>
          
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '700', 
            color: colors.text, 
            marginBottom: 2,
            lineHeight: 20
          }}>
            {interview.role}
          </Text>
          
          <Text style={{ 
            fontSize: 13, 
            color: colors.textSecondary,
            fontWeight: '500'
          }}>
            {interview.company}
          </Text>
        </View>
        
        {/* Enhanced Score Badge */}
        <View style={{
          alignItems: 'center',
          backgroundColor: colors.surface,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: getThemeScoreColor(interview.score || 0) + '40',
          minWidth: 60,
        }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '800', 
            color: getThemeScoreColor(interview.score || 0),
            lineHeight: 22
          }}>
            {interview.score || '--'}
          </Text>
          <Text style={{ 
            fontSize: 9, 
            color: getThemeScoreColor(interview.score || 0),
            textTransform: 'uppercase',
            fontWeight: '600',
            letterSpacing: 0.5
          }}>
            {getScoreRating(interview.score || 0)}
          </Text>
        </View>
      </View>

      {/* Date & Duration Row */}
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={14} color={colors.primary} />
            <Text style={{ 
              fontSize: 13, 
              color: colors.text, 
              fontWeight: '600',
              marginLeft: 6
            }}>
              {formatDate(interview.completed_at || interview.created_at)}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Clock size={14} color={colors.primary} />
            <Text style={{ 
              fontSize: 13, 
              color: colors.text, 
              fontWeight: '600',
              marginLeft: 6
            }}>
              {interview.duration || 30} min
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        gap: 8
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 3,
          }}
          onPress={() => handleViewFeedback(interview)}
        >
          <Eye size={16} color={colors.textInverse} />
          <Text style={{ 
            color: colors.textInverse, 
            fontSize: 13, 
            fontWeight: '600',
            marginLeft: 6
          }}>
            View Feedback
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={() => handleDeleteInterview(interview)}
        >
          <Trash2 size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary, fontSize: 16 }}>Loading feedback...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {renderHeader()}

      {/* Feedback List */}
      {interviews.length === 0 ? (
        renderEmptyState()
      ) : (
        <View>
          {interviews.map(renderInterviewCard)}
        </View>
      )}
    </ScrollView>
  );
};

export default FeedbackScreen; 