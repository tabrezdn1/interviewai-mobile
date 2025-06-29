import { useRouter } from 'expo-router';
import {
    BarChart3,
    Calendar,
    Clock,
    Eye,
    Star,
    Trash2,
    TrendingUp
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
import { formatDate, getScoreColor } from '../../../src/utils/helpers';

const FeedbackScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
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
    // Navigate to detailed feedback view (will create this route later)
    Alert.alert('View Feedback', `Detailed feedback for ${interview.title || interview.role} will be available soon.`);
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

  const renderHeader = () => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
        Interview Feedback
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280' }}>
        Review your completed interviews and performance insights
      </Text>
    </View>
  );

  const renderStatsCard = () => {
    if (interviews.length === 0) return null;

    const totalScore = interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
    const averageScore = Math.round(totalScore / interviews.length);
    const recentImprovement = interviews.length >= 2 
      ? (interviews[0].score || 0) - (interviews[interviews.length - 1].score || 0)
      : 0;

    return (
      <View style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>
          Performance Overview
        </Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: getScoreColor(averageScore) }}>
              {averageScore}%
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Average Score</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>
              {interviews.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Completed</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: recentImprovement >= 0 ? '#10b981' : '#ef4444' 
            }}>
              {recentImprovement > 0 ? '+' : ''}{Math.round(recentImprovement)}%
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Improvement</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={{
      backgroundColor: 'white',
      padding: 32,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    }}>
      <BarChart3 size={48} color="#6b7280" />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginTop: 16, marginBottom: 8 }}>
        No Completed Interviews
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
        Complete your first interview to see detailed feedback and analytics
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(app)/interview/setup')}
        style={{
          backgroundColor: '#007AFF',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Start Interview
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInterviewCard = (interview: Interview) => (
    <View
      key={interview.id}
      style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      }}
    >
      {/* Header Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
            {interview.title || `${interview.interview_types?.title || 'Interview'}`}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
            {interview.role} at {interview.company}
          </Text>
        </View>
        
        {/* Score Badge */}
        <View style={{
          backgroundColor: getScoreColor(interview.score || 0) + '20',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          alignItems: 'center'
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: getScoreColor(interview.score || 0)
          }}>
            {interview.score || '--'}%
          </Text>
          <Text style={{ 
            fontSize: 10, 
            color: getScoreColor(interview.score || 0),
            textTransform: 'uppercase',
            fontWeight: '500'
          }}>
            {getScoreRating(interview.score || 0)}
          </Text>
        </View>
      </View>

      {/* Interview Details */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Star size={14} color="#f59e0b" />
        <Text style={{ marginLeft: 4, fontSize: 14, color: '#6b7280' }}>
          {interview.interview_types?.title || 'Technical Interview'}
        </Text>
        <Clock size={14} color="#6b7280" style={{ marginLeft: 16 }} />
        <Text style={{ marginLeft: 4, fontSize: 14, color: '#6b7280' }}>
          {interview.duration || 30} minutes
        </Text>
      </View>

      {/* Completion Date */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Calendar size={14} color="#6b7280" />
        <Text style={{ marginLeft: 4, fontSize: 14, color: '#6b7280' }}>
          Completed {formatDate(interview.completed_at || interview.created_at!)}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => handleViewFeedback(interview)}
          style={{
            flex: 1,
            backgroundColor: '#007AFF',
            padding: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Eye size={16} color="white" />
          <Text style={{ marginLeft: 6, color: 'white', fontSize: 14, fontWeight: '500' }}>
            View Feedback
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteInterview(interview)}
          style={{
            backgroundColor: '#fef2f2',
            padding: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 60
          }}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>Loading feedback...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderHeader()}
      {renderStatsCard()}

      {/* Feedback List */}
      {interviews.length === 0 ? (
        renderEmptyState()
      ) : (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>
              {interviews.length} Completed Interview{interviews.length > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/interview/setup')}
              style={{
                backgroundColor: '#f3f4f6',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <TrendingUp size={14} color="#6b7280" />
              <Text style={{ marginLeft: 4, color: '#6b7280', fontSize: 12, fontWeight: '500' }}>
                Practice More
              </Text>
            </TouchableOpacity>
          </View>
          {interviews.map(renderInterviewCard)}
        </View>
      )}
    </ScrollView>
  );
};

export default FeedbackScreen; 