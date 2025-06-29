import { useRouter } from 'expo-router';
import { CheckCircle, Clock, MessageSquare, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { DatabaseService, Interview } from '../../../src/services/DatabaseService';
import { useAuthStore } from '../../../src/store/authStore';
import { formatDate } from '../../../src/utils/helpers';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  
  const [stats, setStats] = useState({
    upcomingInterviews: 0,
    completedInterviews: 0,
    totalMinutes: 300,
    usedMinutes: 0,
    remainingMinutes: 300
  });
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const dashboardData = await DatabaseService.getDashboardStats(user.id);
      
      // Map the dashboard data to match our stats structure
      setStats({
        upcomingInterviews: dashboardData.recentInterviews.filter(interview => 
          interview.status === 'scheduled'
        ).length,
        completedInterviews: dashboardData.completedInterviews,
        totalMinutes: dashboardData.conversationMinutes.total,
        usedMinutes: dashboardData.conversationMinutes.used,
        remainingMinutes: dashboardData.conversationMinutes.remaining
      });
      
      // Get recent interviews for activity feed
      setRecentInterviews(dashboardData.recentInterviews.slice(0, 5)); // Show last 5
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const renderQuickActions = () => (
    <View style={{ marginBottom: 32 }}>
      {/* Single compelling Schedule Now button */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/interview/setup')}
        style={{
          borderRadius: 16,
          padding: 4,
          alignItems: 'center',
          shadowColor: '#007AFF',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View style={{
          width: '100%',
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 70,
          backgroundColor: '#007AFF',
          // Gradient effect using multiple layers
          shadowColor: '#5856D6',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 20,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: 12,
              padding: 8,
              marginRight: 12,
            }}>
              <Plus size={24} color="white" />
            </View>
            <View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
              }}>
                Schedule Now
              </Text>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                marginTop: 2,
              }}>
                Start your practice interview
              </Text>
            </View>
          </View>
          
          {/* Subtle shine effect */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderMainCards = () => (
    <View style={{ marginBottom: 32 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Upcoming Card */}
        <View style={{
          flex: 1,
          backgroundColor: '#1e293b',
          borderRadius: 20,
          padding: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <View style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}>
            <Clock size={24} color="#3b82f6" />
          </View>
          <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4, textAlign: 'center' }}>
            Upcoming
          </Text>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 2 }}>
            {stats.upcomingInterviews}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
            Scheduled
          </Text>
        </View>

        {/* Completed Card */}
        <View style={{
          flex: 1,
          backgroundColor: '#1e293b',
          borderRadius: 20,
          padding: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <View style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}>
            <CheckCircle size={24} color="#10b981" />
          </View>
          <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4, textAlign: 'center' }}>
            Completed
          </Text>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 2 }}>
            {stats.completedInterviews}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
            Interviews
          </Text>
        </View>

        {/* Remaining Minutes Card */}
        <View style={{
          flex: 1,
          backgroundColor: '#1e293b',
          borderRadius: 20,
          padding: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <View style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}>
            <Clock size={24} color="#f59e0b" />
          </View>
          <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4, textAlign: 'center' }}>
            Remaining
          </Text>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 2 }}>
            {stats.remainingMinutes}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
            Minutes
          </Text>
        </View>
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={{ marginBottom: 24 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
          Recent Activity
        </Text>
      </View>
      
      {recentInterviews.length === 0 ? (
        <View style={{
          backgroundColor: '#1e293b',
          padding: 24,
          borderRadius: 16,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4
        }}>
          <MessageSquare size={32} color="#64748b" />
          <Text style={{ fontSize: 16, fontWeight: '500', color: 'white', marginTop: 12 }}>
            No recent interviews
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4, textAlign: 'center' }}>
            Start your first interview to see activity here
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {recentInterviews.slice(0, 3).map((interview) => (
            <TouchableOpacity 
              key={interview.id} 
              onPress={() => {
                if (interview.status === 'completed') {
                  router.push({
                    pathname: '/(app)/feedback/[id]',
                    params: { id: interview.id }
                  });
                } else {
                  router.push('/(app)/(tabs)/interviews');
                }
              }}
              style={{
                backgroundColor: '#1e293b',
                padding: 16,
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                    {interview.title || `${interview.interview_types?.title || 'Interview'}`}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#94a3b8', marginTop: 2 }}>
                    {interview.role} at {interview.company} • {formatDate(interview.created_at!)}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  {interview.status === 'completed' ? (
                    <>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: interview.score && interview.score >= 70 ? '#10b981' : '#f59e0b' }}>
                        {interview.score || '--'}%
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
                        {interview.status}
                      </Text>
                    </>
                  ) : (
                    <View style={{
                      backgroundColor: interview.status === 'scheduled' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8
                    }}>
                      <Text style={{ 
                        fontSize: 12, 
                        color: interview.status === 'scheduled' ? '#3b82f6' : '#64748b',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {interview.status}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#64748b', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={fetchDashboardData}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
      <View style={{ padding: 24, paddingTop: 40 }}>
        {/* Greeting */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
            Good {getTimeOfDay()}, {user?.name || 'TestUser1'}! 
            <Text style={{ fontSize: 32 }}>👋</Text>
          </Text>
          <Text style={{ fontSize: 16, color: '#64748b' }}>
            Ready to ace your next interview?
          </Text>
        </View>

        {/* Main Cards - moved to second position */}
        {renderMainCards()}

        {/* Schedule Now Button - moved to third position */}
        {renderQuickActions()}

        {/* Recent Activity - kept at bottom */}
        {renderRecentActivity()}
      </View>
    </ScrollView>
  );
};

export default Dashboard; 