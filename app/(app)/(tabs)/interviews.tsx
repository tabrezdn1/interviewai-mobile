import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Calendar,
    ChevronRight,
    Clock,
    Edit,
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
    TouchableOpacity,
    View
} from 'react-native';
import { LoadingComponent } from '../../../src/components';
import { DatabaseService, Interview } from '../../../src/services/DatabaseService';
import { InterviewService } from '../../../src/services/InterviewService';
import { useAuthStore } from '../../../src/store/authStore';
import { useThemeColors } from '../../../src/store/themeStore';

const InterviewsScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const colors = useThemeColors();
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [editDateTime, setEditDateTime] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

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
    
    // Set current scheduled date and time
    const scheduledDate = new Date(interview.scheduled_at || interview.created_at!);
    setEditDateTime(scheduledDate);
    setEditModalVisible(true);
  };

  const handleDateSelect = (selectedDate: Date) => {
    const newDateTime = new Date(editDateTime);
    newDateTime.setFullYear(selectedDate.getFullYear());
    newDateTime.setMonth(selectedDate.getMonth());
    newDateTime.setDate(selectedDate.getDate());
    setEditDateTime(newDateTime);
    setShowDateModal(false);
  };

  const handleTimeSelect = (selectedTime: Date) => {
    const newDateTime = new Date(editDateTime);
    newDateTime.setHours(selectedTime.getHours());
    newDateTime.setMinutes(selectedTime.getMinutes());
    setEditDateTime(newDateTime);
    setShowTimeModal(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedInterview) return;

    setSaving(true);
    try {
      const success = await InterviewService.updateInterview(selectedInterview.id, {
        scheduled_at: editDateTime.toISOString()
      });

      if (success) {
        // Update local state
        setInterviews(prev => prev.map(interview => 
          interview.id === selectedInterview.id 
            ? { ...interview, scheduled_at: editDateTime.toISOString() }
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
        return <User size={16} color={colors.info} />;
      case 'behavioral':
        return <User size={16} color={colors.success} />;
      case 'mixed':
        return <User size={16} color={colors.accent} />;
      default:
        return <User size={16} color={colors.textSecondary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return colors.success;
      case 'draft':
        return colors.warning;
      case 'pending':
        return colors.info;
      case 'ready':
        return colors.success;
      default:
        return colors.textSecondary;
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

  // Format date for scheduled interviews (show actual date, not relative)
  const formatScheduledDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      // Show actual date for other days
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

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
                const isSelected = date.toDateString() === editDateTime.toDateString();
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
                const isSelected = time.getHours() === editDateTime.getHours() && 
                                 time.getMinutes() === editDateTime.getMinutes();
                
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

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 20
      }}>
        <View style={{
          backgroundColor: colors.background,
          borderRadius: 20,
          padding: 24,
          maxHeight: '80%'
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.text
            }}>
              Edit Interview
            </Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {selectedInterview && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.textSecondary,
                marginBottom: 4
              }}>
                {selectedInterview.role} at {selectedInterview.company}
              </Text>
            </View>
          )}

          <View style={{ gap: 16, marginBottom: 24 }}>
            {/* Date Picker */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.borderLight,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() => setShowDateModal(true)}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
              }}>
                <Calendar size={20} color={colors.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>
                    Interview Date
                  </Text>
                  <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600', marginTop: 2 }}>
                    {editDateTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Time Picker */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: colors.borderLight,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() => setShowTimeModal(true)}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
              }}>
                <Clock size={20} color={colors.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>
                    Interview Time
                  </Text>
                  <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600', marginTop: 2 }}>
                    {editDateTime.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={{
            flexDirection: 'row',
            gap: 12
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '600'
              }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                opacity: saving ? 0.7 : 1
              }}
              onPress={handleSaveEdit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={{
                  color: colors.textInverse,
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {renderDateModal()}
      {renderTimeModal()}
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
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 12,
            textAlign: 'center'
          }}>
            Delete Interview
          </Text>

          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 22
          }}>
            Are you sure you want to delete this interview? This action cannot be undone.
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              style={{
                flex: 1,
                backgroundColor: colors.buttonSecondary,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: colors.buttonSecondaryText, fontSize: 16, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmDelete}
              style={{
                flex: 1,
                backgroundColor: colors.error,
                padding: 14,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: colors.textInverse, fontSize: 16, fontWeight: '600' }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
          Interviews
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: colors.textSecondary,
          fontWeight: '500'
        }}>
          Manage your upcoming interview sessions
        </Text>
      </View>
      
      {interviews.length > 0 && (
        <View style={{
          backgroundColor: colors.primary + '10',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        }}>
          <Text style={{ 
            fontSize: 14, 
            color: colors.primary, 
            fontWeight: '600' 
          }}>
            {interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'} scheduled
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
        <Calendar size={48} color={colors.textTertiary} />
      </View>
      
      <Text style={{ 
        fontSize: 24, 
        fontWeight: '700', 
        color: colors.text, 
        marginBottom: 8,
        textAlign: 'center'
      }}>
        No Upcoming Interviews
      </Text>
      
      <Text style={{ 
        fontSize: 16, 
        color: colors.textSecondary, 
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        maxWidth: 280
      }}>
        Schedule your first interview to start practicing and improving your skills
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
        <Calendar size={20} color={colors.textInverse} style={{ marginRight: 8 }} />
        <Text style={{ 
          color: colors.textInverse, 
          fontSize: 16, 
          fontWeight: '600' 
        }}>
          Schedule Interview
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInterviewCard = (interview: Interview) => {
    const isDeleting = deletingId === interview.id;
    const scheduledDate = new Date(interview.scheduled_at || interview.created_at!);
    
    return (
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
          opacity: isDeleting ? 0.5 : 1,
        }}
      >
        {/* Header Row */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 12 
        }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              {getInterviewTypeIcon(interview.interview_types?.title || '')}
              <Text style={{ 
                fontSize: 11, 
                color: colors.textSecondary, 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginLeft: 5
              }}>
                {interview.interview_types?.title || 'Interview'}
              </Text>
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
          
          {/* Status Badge */}
          <View style={{
            backgroundColor: getStatusColor(interview.status || '') + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: getStatusColor(interview.status || '') + '40',
          }}>
            <Text style={{ 
              fontSize: 10, 
              fontWeight: '700', 
              color: getStatusColor(interview.status || ''),
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              {getStatusText(interview.status || '')}
            </Text>
          </View>
        </View>

        {/* Date & Time Row */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.borderLight,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Calendar size={14} color={colors.primary} />
            <Text style={{ 
              fontSize: 13, 
              color: colors.text, 
              fontWeight: '600',
              marginLeft: 6
            }}>
              {formatScheduledDate(scheduledDate.toISOString())}
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
              {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Duration & Level */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingHorizontal: 0
        }}>
          <View style={{ flex: 0.4 }}>
            <Text style={{ 
              fontSize: 11, 
              color: colors.textSecondary, 
              fontWeight: '500',
              marginBottom: 1
            }}>
              Duration
            </Text>
            <Text style={{ 
              fontSize: 13, 
              color: colors.text, 
              fontWeight: '600' 
            }}>
              {interview.duration || 30} min
            </Text>
          </View>
          
          <View style={{ flex: 0.6 }}>
            <Text style={{ 
              fontSize: 11, 
              color: colors.textSecondary, 
              fontWeight: '500',
              marginBottom: 1
            }}>
              Level
            </Text>
            <Text 
              numberOfLines={2}
              style={{ 
                fontSize: 13, 
                color: colors.text, 
                fontWeight: '600',
                lineHeight: 16
              }}
            >
              {interview.experience_levels?.label || 'Not specified'}
            </Text>
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
              backgroundColor: colors.surface,
              paddingVertical: 10,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => handleEditInterview(interview)}
            disabled={isDeleting}
          >
            <Edit size={16} color={colors.primary} />
            <Text style={{ 
              color: colors.primary, 
              fontSize: 13, 
              fontWeight: '600',
              marginLeft: 4
            }}>
              Edit
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.error + '10',
              paddingVertical: 10,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.error + '30',
            }}
            onPress={() => handleDeleteInterview(interview)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Trash2 size={16} color={colors.error} />
                <Text style={{ 
                  color: colors.error, 
                  fontSize: 13, 
                  fontWeight: '600',
                  marginLeft: 4
                }}>
                  Delete
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LoadingComponent 
        message="Loading interviews..."
        size="large"
      />
    );
  }

  return (
    <LinearGradient colors={gradientColors as any} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 32 }}>
        {renderHeader()}
        
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: 24,
            paddingBottom: 100,
            flexGrow: 1
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {interviews.length === 0 ? renderEmptyState() : (
            <View style={{ gap: 16 }}>
              {interviews.map(renderInterviewCard)}
            </View>
          )}
        </ScrollView>
        
        {renderEditModal()}
        {renderDeleteModal()}
      </View>
    </LinearGradient>
  );
};

export default InterviewsScreen; 