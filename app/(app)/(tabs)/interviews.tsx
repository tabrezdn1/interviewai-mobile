import { useRouter } from 'expo-router';
import {
    Calendar,
    Clock,
    Edit,
    MapPin,
    Plus,
    Trash2,
    User
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
import { formatDate } from '../../../src/utils/helpers';

const InterviewsScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInterviews = useCallback(async (showRefresh = false) => {
    if (!user?.id) return;
    
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const allInterviews = await DatabaseService.getInterviews(user.id);
      // Filter for upcoming/scheduled interviews
      const upcomingInterviews = allInterviews.filter(interview => 
        interview.status === 'scheduled' ||
        (interview.status !== 'completed' && interview.status !== 'canceled')
      );
      setInterviews(upcomingInterviews);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      Alert.alert('Error', 'Failed to load interviews. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleEditInterview = (interview: Interview) => {
    // Navigate to edit interview with proper parameters
    router.push({
      pathname: '/(app)/interview/setup',
      params: { id: interview.id }
    });
  };

  const handleDeleteInterview = (interview: Interview) => {
    Alert.alert(
      'Delete Interview',
      `Are you sure you want to delete the interview for ${interview.role} at ${interview.company}?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(interview.id);
            try {
              const success = await DatabaseService.deleteInterview(interview.id);
              if (success) {
                setInterviews(prev => prev.filter(i => i.id !== interview.id));
                Alert.alert('Success', 'Interview deleted successfully');
              } else {
                throw new Error('Failed to delete interview');
              }
            } catch (error) {
              console.error('Error deleting interview:', error);
              Alert.alert('Error', 'Failed to delete interview. Please try again.');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    fetchInterviews(true);
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'technical':
        return <User size={16} color="#3b82f6" />;
      case 'behavioral':
        return <User size={16} color="#10b981" />;
      case 'mixed':
        return <User size={16} color="#8b5cf6" />;
      default:
        return <User size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return '#10b981';
      case 'draft':
        return '#f59e0b';
      case 'pending':
        return '#3b82f6';
      case 'ready':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'Scheduled';
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      default:
        return status || 'Unknown';
    }
  };

  const renderHeader = () => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
        Upcoming Interviews
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280' }}>
        Manage your scheduled interview sessions
      </Text>
    </View>
  );

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
      <Calendar size={48} color="#6b7280" />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginTop: 16, marginBottom: 8 }}>
        No Upcoming Interviews
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
        Schedule your first interview to start practicing for your next opportunity
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/(app)/interview/setup')}
        style={{
          backgroundColor: '#007AFF',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Plus size={20} color="white" />
        <Text style={{ marginLeft: 8, color: 'white', fontSize: 16, fontWeight: '600' }}>
          Schedule Interview
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInterviewCard = (interview: Interview) => {
    const isDeleting = deletingId === interview.id;
    
    return (
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
          elevation: 2,
          opacity: isDeleting ? 0.5 : 1
        }}
      >
        {/* Header Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
              {interview.title || `${interview.interview_types?.title || 'Interview'}`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MapPin size={14} color="#6b7280" />
              <Text style={{ marginLeft: 4, fontSize: 14, color: '#6b7280' }}>
                {interview.role} at {interview.company}
              </Text>
            </View>
          </View>
          
          {/* Status Badge */}
          <View style={{
            backgroundColor: getStatusColor(interview.status) + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6
          }}>
            <Text style={{ 
              fontSize: 12, 
              fontWeight: '500', 
              color: getStatusColor(interview.status),
              textTransform: 'capitalize'
            }}>
              {getStatusText(interview.status)}
            </Text>
          </View>
        </View>

        {/* Interview Details */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          {getInterviewTypeIcon(interview.interview_types?.type || 'technical')}
          <Text style={{ marginLeft: 8, fontSize: 14, color: '#6b7280' }}>
            {interview.interview_types?.title || 'Technical Interview'}
          </Text>
          <Text style={{ marginLeft: 16, fontSize: 14, color: '#6b7280' }}>
            •
          </Text>
          <Clock size={14} color="#6b7280" style={{ marginLeft: 16 }} />
          <Text style={{ marginLeft: 4, fontSize: 14, color: '#6b7280' }}>
            {interview.duration || 30} minutes
          </Text>
        </View>

        {/* Date */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Calendar size={14} color="#6b7280" />
          <Text style={{ marginLeft: 4, fontSize: 14, color: '#6b7280' }}>
            {interview.scheduled_at 
              ? `Scheduled for ${formatDate(interview.scheduled_at)}`
              : `Created ${formatDate(interview.created_at!)}`
            }
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => handleEditInterview(interview)}
            disabled={isDeleting}
            style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              padding: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isDeleting ? 0.5 : 1
            }}
          >
            <Edit size={16} color="#6b7280" />
            <Text style={{ marginLeft: 6, color: '#6b7280', fontSize: 14, fontWeight: '500' }}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeleteInterview(interview)}
            disabled={isDeleting}
            style={{
              flex: 1,
              backgroundColor: '#fef2f2',
              padding: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isDeleting ? 0.5 : 1
            }}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Trash2 size={16} color="#ef4444" />
            )}
            <Text style={{ marginLeft: 6, color: '#ef4444', fontSize: 14, fontWeight: '500' }}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>Loading interviews...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
      {renderHeader()}

      {/* Quick Action */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/interview/setup')}
        style={{
          backgroundColor: '#007AFF',
          padding: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          shadowColor: '#007AFF',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4
        }}
      >
        <Plus size={20} color="white" />
        <Text style={{ marginLeft: 8, color: 'white', fontSize: 16, fontWeight: '600' }}>
          Schedule New Interview
        </Text>
      </TouchableOpacity>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        renderEmptyState()
      ) : (
        <View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>
            {interviews.length} Upcoming Interview{interviews.length > 1 ? 's' : ''}
          </Text>
          {interviews.map(renderInterviewCard)}
        </View>
      )}
    </ScrollView>
  );
};

export default InterviewsScreen; 