import { useRouter } from 'expo-router';
import {
    Calendar,
    Clock,
    Edit,
    MapPin,
    Save,
    Trash2,
    User,
    X
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { DatabaseService, Interview } from '../../../src/services/DatabaseService';
import { InterviewService } from '../../../src/services/InterviewService';
import { useAuthStore } from '../../../src/store/authStore';
import { formatDate } from '../../../src/utils/helpers';

const InterviewsScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [saving, setSaving] = useState(false);

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
    setSelectedInterview(interview);
    
    // Parse current scheduled date and time
    const scheduledDate = new Date(interview.scheduled_at || interview.created_at!);
    const dateStr = scheduledDate.toISOString().split('T')[0];
    const timeStr = scheduledDate.toTimeString().slice(0, 5);
    
    setEditDate(dateStr);
    setEditTime(timeStr);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedInterview || !editDate || !editTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    setSaving(true);
    try {
      const newScheduledAt = new Date(`${editDate}T${editTime}:00.000Z`).toISOString();
      
      const success = await InterviewService.updateInterview(selectedInterview.id, {
        scheduled_at: newScheduledAt
      });

      if (success) {
        // Update local state
        setInterviews(prev => prev.map(interview => 
          interview.id === selectedInterview.id 
            ? { ...interview, scheduled_at: newScheduledAt }
            : interview
        ));
        
        setEditModalVisible(false);
        Alert.alert('Success', 'Interview date and time updated successfully');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating interview:', error);
      Alert.alert('Error', 'Failed to update interview. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedInterview) return;

    setDeletingId(selectedInterview.id);
    setDeleteModalVisible(false);
    
    try {
      const success = await DatabaseService.deleteInterview(selectedInterview.id);
      if (success) {
        setInterviews(prev => prev.filter(i => i.id !== selectedInterview.id));
        Alert.alert('Success', 'Interview deleted successfully');
      } else {
        throw new Error('Failed to delete interview');
      }
    } catch (error) {
      console.error('Error deleting interview:', error);
      Alert.alert('Error', 'Failed to delete interview. Please try again.');
    } finally {
      setDeletingId(null);
      setSelectedInterview(null);
    }
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

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          margin: 20,
          width: '90%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>
              Edit Interview Time
            </Text>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={{ padding: 4 }}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 16, color: '#374151', marginBottom: 16 }}>
            {selectedInterview?.role} at {selectedInterview?.company}
          </Text>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Date
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#f9fafb'
              }}
              value={editDate}
              onChangeText={setEditDate}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Time
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#f9fafb'
              }}
              value={editTime}
              onChangeText={setEditTime}
              placeholder="HH:MM"
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={saving}
              style={{
                flex: 1,
                backgroundColor: '#007AFF',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Save size={16} color="white" />
                  <Text style={{ marginLeft: 6, color: 'white', fontSize: 16, fontWeight: '600' }}>
                    Save
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal
      visible={deleteModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setDeleteModalVisible(false)}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          margin: 20,
          width: '90%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5
        }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#fef2f2',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Trash2 size={32} color="#ef4444" />
            </View>
            
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
              Delete Interview
            </Text>
            
            <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
              Are you sure you want to delete the interview for{'\n'}
              <Text style={{ fontWeight: '600' }}>
                {selectedInterview?.role} at {selectedInterview?.company}
              </Text>
              ?{'\n\n'}This action cannot be undone.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={confirmDelete}
              style={{
                flex: 1,
                backgroundColor: '#ef4444',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
      <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
        Your scheduled interviews will appear here
      </Text>
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
              Edit Time
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
    <>
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

      {/* Modals */}
      {renderEditModal()}
      {renderDeleteModal()}
    </>
  );
};

export default InterviewsScreen; 