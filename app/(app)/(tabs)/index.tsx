import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  Star,
  TrendingUp
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

// Interview tips data (same as web app)
const interviewTips = [
  {
    title: "STAR Method",
    description: "Structure your answers with Situation, Task, Action, Result for behavioral questions."
  },
  {
    title: "Research the Company",
    description: "Know the company's values, recent news, and how you can contribute to their goals."
  },
  {
    title: "Practice Common Questions",
    description: "Prepare for frequently asked questions about strengths, weaknesses, and motivations."
  }
];

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  link?: string;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  color: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [conversationMinutes, setConversationMinutes] = useState<{total: number, used: number, remaining: number} | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const hasFetchedData = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    improvementRate: 0
  });

  // Fetch dashboard data using the new DatabaseService
  const fetchDashboardData = useCallback(async (showLoadingState = false) => {
    if (!user?.id) return;
    
    console.log('📊 Dashboard: fetchDashboardData called', { showLoadingState, userId: user.id });
    setFetchError(null);
    if (showLoadingState) setIsRefreshing(true);
    setDataLoading(true);
    
    try {
      const dashboardStats = await DatabaseService.getDashboardStats(user.id);
      
      setInterviews(dashboardStats.recentInterviews);
      setConversationMinutes(dashboardStats.conversationMinutes);
      setStats({
        totalInterviews: dashboardStats.totalInterviews,
        completedInterviews: dashboardStats.completedInterviews,
        averageScore: dashboardStats.averageScore,
        improvementRate: 0 // Will be calculated from real data
      });
      
      generateRecentActivities(dashboardStats.recentInterviews);
      console.log('📊 Dashboard: Data loaded successfully');
      
    } catch (error) {
      console.error('📊 Dashboard: Error loading dashboard data', error);
      setFetchError('Failed to load dashboard data.');
      setInterviews([]);
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);
  
  // Initial data fetch
  useEffect(() => {
    console.log('📊 Dashboard: Initial useEffect for data fetch', { 
      hasUser: !!user,
      userId: user?.id,
      authLoading,
      dataLoading,
      hasFetchedData: hasFetchedData.current,
      lastUserId: lastUserIdRef.current
    });
    
    if (user?.id !== lastUserIdRef.current) {
      console.log('📊 Dashboard: User changed, resetting fetch state');
      hasFetchedData.current = false;
      lastUserIdRef.current = user?.id || null;
    }
    
    if (user?.id && !authLoading && !hasFetchedData.current) {
      console.log('📊 Dashboard: Fetching data - user available, auth not loading, and data not yet fetched');
      hasFetchedData.current = true;
      setDataLoading(true);
      fetchDashboardData(true);
    } else if (!authLoading && !user) {
      console.log('📊 Dashboard: No user after auth loaded, showing empty state');
      setInterviews([]);
      setDataLoading(false);
      hasFetchedData.current = false;
      lastUserIdRef.current = null;
    }
  }, [user?.id, authLoading, fetchDashboardData]);
  
  // Function to generate recent activities
  const generateRecentActivities = (interviewsData: Interview[]) => {
    const sortedInterviews = [...interviewsData].sort((a, b) => {
      if (a.status === 'completed' && b.status === 'completed' && a.completed_at && b.completed_at) {
        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
      }
      const aDate = a.created_at || a.scheduled_at;
      const bDate = b.created_at || b.scheduled_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    const recentInterviews = sortedInterviews.slice(0, 3);
    const activities: RecentActivity[] = recentInterviews.map(interview => {
      let activity: RecentActivity = {
        id: interview.id,
        type: '',
        title: '',
        description: '',
        date: '',
        link: ''
      };

      if (interview.status === 'completed') {
        activity = {
          id: interview.id,
          type: 'completion',
          title: `Completed ${interview.interview_types?.title || 'Interview'}`,
          description: `${interview.role} at ${interview.company || 'Company'}`,
          date: interview.completed_at || interview.created_at || '',
          link: `/feedback/${interview.id}`
        };
      } else if (interview.status === 'scheduled') {
        activity = {
          id: interview.id,
          type: 'scheduled',
          title: `Scheduled ${interview.interview_types?.title || 'Interview'}`,
          description: `${interview.role} at ${interview.company || 'Company'}`,
          date: interview.scheduled_at || interview.created_at || '',
          link: `/interview/${interview.id}`
        };
      }

      return activity;
    });

    setRecentActivities(activities);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <TrendingUp size={20} color="#10b981" />;
      case 'scheduled':
        return <Calendar size={20} color="#3b82f6" />;
      default:
        return <MessageSquare size={20} color="#6b7280" />;
    }
  };

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'morning';
    } else if (hour < 17) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  };

  const onRefresh = () => {
    fetchDashboardData(true);
  };

  const renderQuickActions = () => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
        Quick Actions
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.push('/(app)/interview/setup')}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={{
              padding: 20,
              borderRadius: 16,
              alignItems: 'center'
            }}
          >
            <Plus size={28} color="white" />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginTop: 8 }}>
              Schedule Interview
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.push('/(app)/(tabs)/feedback')}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={['#ffecd2', '#fcb69f']}
            style={{
              padding: 20,
              borderRadius: 16,
              alignItems: 'center'
            }}
          >
            <BarChart3 size={28} color="#d97706" />
            <Text style={{ color: '#d97706', fontSize: 16, fontWeight: '600', marginTop: 8 }}>
              View Feedback
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
        Your Progress
      </Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <View style={{
          flex: 1,
          backgroundColor: 'white',
          padding: 16,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2
        }}>
          <Activity size={20} color="#10b981" />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
            {stats.totalInterviews}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>Total Interviews</Text>
        </View>
        
        <View style={{
          flex: 1,
          backgroundColor: 'white',
          padding: 16,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2
        }}>
          <Star size={20} color="#f59e0b" />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
            {stats.averageScore}%
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>Average Score</Text>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{
          flex: 1,
          backgroundColor: 'white',
          padding: 16,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2
        }}>
          <TrendingUp size={20} color="#3b82f6" />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
            {stats.completedInterviews}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>Completed</Text>
        </View>
        
        <View style={{
          flex: 1,
          backgroundColor: 'white',
          padding: 16,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2
        }}>
          <Clock size={20} color="#8b5cf6" />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 8 }}>
            {conversationMinutes?.remaining || 0}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>Minutes Left</Text>
        </View>
      </View>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>
          Recent Activity
        </Text>
        {interviews.length > 0 && (
          <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/feedback')}>
            <Text style={{ color: '#007AFF', fontSize: 14, fontWeight: '500' }}>
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {interviews.length === 0 ? (
        <View style={{
          backgroundColor: 'white',
          padding: 24,
          borderRadius: 12,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2
        }}>
          <MessageSquare size={32} color="#6b7280" />
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#1f2937', marginTop: 12 }}>
            No recent interviews
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4, textAlign: 'center' }}>
            Start your first interview to see activity here
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {interviews.map((interview) => (
            <View key={interview.id} style={{
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
                    {interview.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                    {interview.company} • {formatDate(interview.created_at!)}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: interview.score && interview.score >= 70 ? '#10b981' : '#f59e0b' }}>
                    {interview.score || '--'}%
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>
                    {interview.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (dataLoading && !isRefreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16 }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Header */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1f2937' }}>
          Good {getTimeOfDay()}, {user?.name?.split(' ')[0] || 'there'}! 👋
        </Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 8 }}>
          Ready to ace your next interview?
        </Text>
      </View>

      {renderQuickActions()}
      {renderStatsCards()}
      {renderRecentActivity()}
    </ScrollView>
  );
};

export default Dashboard; 