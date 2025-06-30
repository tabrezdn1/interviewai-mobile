import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle, Clock, MessageSquare, Plus } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingComponent } from '../../../src/components';
import { DatabaseService, Interview } from '../../../src/services/DatabaseService';
import { useAuthStore } from '../../../src/store/authStore';
import { getElevation, useThemeColors, useThemeStore } from '../../../src/store/themeStore';
import { formatDate } from '../../../src/utils/helpers';
import {
  borderRadius,
  hp,
  spacing,
  touchTarget,
  typography
} from '../../../src/utils/responsive';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const colors = useThemeColors();
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  
  const [stats, setStats] = useState({
    upcomingInterviews: 0,
    completedInterviews: 0,
    totalMinutes: 300,
    usedMinutes: 0,
    remainingMinutes: 300
  });
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);

  // Animation for gradient border - moved to component level
  const borderAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(borderAnimation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();
    };
    startAnimation();
  }, [borderAnimation]);

  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const dashboardData = await DatabaseService.getDashboardStats(user.id);
      
      setStats({
        upcomingInterviews: dashboardData.recentInterviews.filter(interview => 
          interview.status === 'scheduled'
        ).length,
        completedInterviews: dashboardData.completedInterviews,
        totalMinutes: dashboardData.conversationMinutes.total,
        usedMinutes: dashboardData.conversationMinutes.used,
        remainingMinutes: dashboardData.conversationMinutes.remaining
      });
      
      setRecentInterviews(dashboardData.recentInterviews.slice(0, 5));
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

  const renderGreeting = () => (
    <View style={{ 
      marginBottom: spacing.lg,
      paddingTop: spacing.md,
    }}>
      <Text style={{ 
        fontSize: typography.headlineLarge, 
        fontWeight: '800', 
        color: colors.text, 
        lineHeight: typography.headlineLarge * 1.2,
      }}>
        Good {getTimeOfDay()},
      </Text>
      <Text style={{ 
        fontSize: typography.headlineLarge, 
        fontWeight: '800', 
        color: colors.text, 
        marginBottom: spacing.sm,
        lineHeight: typography.headlineLarge * 1.2,
      }}>
        {user?.name || 'John Doe'}! 👋
      </Text>
      <Text style={{ 
        fontSize: typography.body, 
        color: colors.textSecondary,
        lineHeight: typography.body * 1.4,
        fontWeight: '500',
      }}>
        Ready to ace your next interview?
      </Text>
    </View>
  );

  const renderQuickActions = () => {
    const buttonElevation = getElevation(4, theme);
    
    const borderColorInterpolation = borderAnimation.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [
        'rgba(139, 92, 246, 0.8)', // Purple
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(16, 185, 129, 0.8)',  // Green
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(139, 92, 246, 0.8)',  // Purple
      ],
    });
    
    return (
      <View style={{ marginBottom: spacing.lg }}>
        {/* Animated Gradient Border Container */}
        <Animated.View
          style={{
            borderRadius: borderRadius.xl,
            padding: 3,
            alignItems: 'center',
            ...buttonElevation,
            backgroundColor: borderColorInterpolation,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push('/(app)/interview/setup')}
            style={{
              width: '100%',
              borderRadius: borderRadius.lg,
              overflow: 'hidden',
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']} // Blue to Purple to Pink gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: '100%',
                padding: spacing.lg,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: touchTarget.large + 8,
                position: 'relative',
              }}
            >
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                zIndex: 3,
              }}>
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: borderRadius.md,
                  padding: spacing.sm + 2,
                  marginRight: spacing.md,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                  <Plus size={22} color="#ffffff" strokeWidth={3} />
                </View>
                <View>
                  <Text style={{
                    fontSize: typography.titleLarge,
                    fontWeight: '800',
                    color: '#ffffff',
                    textAlign: 'center',
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Schedule Now
                  </Text>
                  <Text style={{
                    fontSize: typography.body,
                    color: 'rgba(255, 255, 255, 0.95)',
                    textAlign: 'center',
                    marginTop: spacing.xs,
                    fontWeight: '500',
                  }}>
                    Start your practice interview
                  </Text>
                </View>
              </View>
              
              {/* Enhanced shine effect with multiple layers */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderTopLeftRadius: borderRadius.lg,
                borderTopRightRadius: borderRadius.lg,
              }} />
              
              {/* Subtle overlay for depth */}
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '20%',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderBottomLeftRadius: borderRadius.lg,
                borderBottomRightRadius: borderRadius.lg,
              }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderStatsCards = () => {
    const cardElevation = getElevation(2, theme);
    
    const statsData = [
      {
        icon: Clock,
        color: colors.info,
        label: 'Upcoming',
        value: stats.upcomingInterviews,
        subtitle: 'Scheduled',
      },
      {
        icon: CheckCircle,
        color: colors.success,
        label: 'Completed',
        value: stats.completedInterviews,
        subtitle: 'Interviews',
      },
      {
        icon: Clock,
        color: colors.warning,
        label: 'Remaining',
        value: stats.remainingMinutes,
        subtitle: 'Minutes',
      },
    ];

    return (
      <View style={{ marginBottom: spacing.xl }}>
        {/* All three cards in a single row for better alignment */}
        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.sm,
          justifyContent: 'space-between',
        }}>
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <View 
                key={index}
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  alignItems: 'center',
                  ...cardElevation,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  minHeight: hp(14), // More compact height
                  justifyContent: 'center',
                }}
              >
                <View style={{
                  backgroundColor: stat.color + '15',
                  borderRadius: borderRadius.md,
                  padding: spacing.sm,
                  marginBottom: spacing.sm,
                }}>
                  <IconComponent size={24} color={stat.color} strokeWidth={2} />
                </View>
                <Text style={{ 
                  fontSize: typography.caption, 
                  color: colors.textSecondary, 
                  marginBottom: spacing.xs, 
                  textAlign: 'center',
                  fontWeight: '600',
                }}>
                  {stat.label}
                </Text>
                <Text style={{ 
                  fontSize: typography.titleLarge, 
                  fontWeight: '800', 
                  color: colors.text, 
                  marginBottom: 2,
                }}>
                  {stat.value}
                </Text>
                <Text style={{ 
                  fontSize: typography.caption, 
                  color: colors.textTertiary, 
                  textAlign: 'center',
                  fontWeight: '500',
                }}>
                  {stat.subtitle}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRecentActivity = () => {
    const cardElevation = getElevation(1, theme);
    
    return (
      <View style={{ marginBottom: spacing.xl }}>
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{ 
            fontSize: typography.titleLarge, 
            fontWeight: '700', 
            color: colors.text,
          }}>
            Recent Activity
          </Text>
        </View>
        
        {recentInterviews.length === 0 ? (
          <View style={{
            backgroundColor: colors.card,
            padding: spacing.xl,
            borderRadius: borderRadius.xl,
            alignItems: 'center',
            ...cardElevation,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}>
            <View style={{
              backgroundColor: colors.textTertiary + '20',
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            }}>
              <MessageSquare size={32} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <Text style={{ 
              fontSize: typography.bodyLarge, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: spacing.sm,
              textAlign: 'center',
            }}>
              No recent interviews
            </Text>
            <Text style={{ 
              fontSize: typography.body, 
              color: colors.textSecondary, 
              textAlign: 'center',
              lineHeight: typography.body * 1.4,
            }}>
              Start your first interview to see activity here
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
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
                  backgroundColor: colors.card,
                  padding: spacing.lg,
                  borderRadius: borderRadius.xl,
                  ...cardElevation,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  minHeight: touchTarget.large,
                }}
                activeOpacity={0.7}
              >
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                }}>
                  <View style={{ flex: 1, marginRight: spacing.md }}>
                    <Text style={{ 
                      fontSize: typography.bodyLarge, 
                      fontWeight: '600', 
                      color: colors.text,
                      marginBottom: spacing.xs,
                    }}>
                      {interview.title || `${interview.interview_types?.title || 'Interview'}`}
                    </Text>
                    <Text style={{ 
                      fontSize: typography.body, 
                      color: colors.textSecondary,
                      lineHeight: typography.body * 1.3,
                    }}>
                      {interview.role} at {interview.company} • {formatDate(interview.created_at!)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    {interview.status === 'completed' ? (
                      <>
                        <Text style={{ 
                          fontSize: typography.subtitle, 
                          fontWeight: '700', 
                          color: interview.score && interview.score >= 70 ? colors.success : colors.warning,
                        }}>
                          {interview.score || '--'}%
                        </Text>
                        <Text style={{ 
                          fontSize: typography.caption, 
                          color: colors.textTertiary, 
                          textTransform: 'capitalize',
                          fontWeight: '500',
                        }}>
                          {interview.status}
                        </Text>
                      </>
                    ) : (
                      <View style={{
                        backgroundColor: interview.status === 'scheduled' ? colors.info + '20' : colors.textTertiary + '20',
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: borderRadius.sm,
                      }}>
                        <Text style={{ 
                          fontSize: typography.caption, 
                          color: interview.status === 'scheduled' ? colors.info : colors.textTertiary,
                          fontWeight: '600',
                          textTransform: 'capitalize',
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
  };

  if (loading || authLoading) {
    return (
      <LoadingComponent 
        message="Loading dashboard..."
        size="large"
      />
    );
  }

  return (
    <LinearGradient colors={gradientColors as any} style={{ flex: 1 }}>
      <View style={{ 
        flex: 1, 
        paddingTop: Math.max(insets.top + spacing.lg, spacing.xxl) 
      }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing.xxl,
            paddingHorizontal: spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />
          }
        >
          {renderGreeting()}
          {renderQuickActions()}
          {renderStatsCards()}
          {renderRecentActivity()}
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default Dashboard; 