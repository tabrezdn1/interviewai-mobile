import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Github,
  Globe,
  Info,
  Linkedin,
  Mail,
  Moon,
  Receipt,
  Star,
  Sun,
  User,
  Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatabaseService, Profile, Subscription, SubscriptionPlan } from '../../../src/services/DatabaseService';
import { useAuthStore } from '../../../src/store/authStore';
import { useThemeColors, useThemeStore } from '../../../src/store/themeStore';
import {
  spacing,
  typography
} from '../../../src/utils/responsive';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [isAnnual, setIsAnnual] = useState(false);

  const [currentView, setCurrentView] = useState<'main' | 'billing' | 'faq' | 'contact'>('main');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [plans, subscription, profile] = await Promise.all([
        DatabaseService.getSubscriptionPlans(),
        DatabaseService.getCurrentSubscription(user.id),
        DatabaseService.getProfile(user.id)
      ]);
      
      setSubscriptionPlans(plans);
      setCurrentSubscription(subscription);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    console.log('[Settings] BUTTON PRESSED - handleSignOut called!');
    
    // Direct signout for testing - bypassing alert
    console.log('[Settings] Executing direct signout...');
    executeSignOut();
  };

  const executeSignOut = async () => {
    console.log('[Settings] Starting signout execution');
    
    try {
      // Step 1: Clear auth state
      console.log('[Settings] Clearing auth state...');
      await signOut();
      console.log('[Settings] Auth state cleared successfully');
      
      // Step 2: Clear any stored data
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        console.log('[Settings] localStorage cleared');
      }
      
      // Step 3: Multiple navigation attempts
      console.log('[Settings] Attempting navigation...');
      
      // Attempt 1: Router replace
      try {
        router.replace('/(auth)/welcome');
        console.log('[Settings] Router navigation initiated');
        
        // Give it a moment, then check if we're still here
        setTimeout(() => {
          console.log('[Settings] Checking if navigation completed...');
          // If we're still in the settings, try alternative methods
          
          // Attempt 2: Router push
          try {
            router.push('/(auth)/welcome');
            console.log('[Settings] Router push attempted');
          } catch (pushError) {
            console.error('[Settings] Router push failed:', pushError);
            
            // Attempt 3: Direct URL change (web)
            if (typeof window !== 'undefined' && window.location) {
              console.log('[Settings] Attempting direct URL change');
              window.location.href = '/welcome';
            }
          }
        }, 500);
        
      } catch (routerError) {
        console.error('[Settings] Router navigation failed:', routerError);
        
        // Fallback: Force page reload
        if (typeof window !== 'undefined' && window.location) {
          console.log('[Settings] Forcing page reload');
          window.location.reload();
        }
      }
      
    } catch (signoutError) {
      console.error('[Settings] Signout failed:', signoutError);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (!plan) return 0;
    
    // Convert cents to dollars if needed
    const amount = plan.amount < 100 ? plan.amount : plan.amount / 100;
    return amount;
  };

  const getMinutes = (plan: SubscriptionPlan) => {
    return plan?.conversation_minutes || 0;
  };

  const getPlanIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'zap':
        return <Zap size={20} color="#3B82F6" />;
      case 'star':
        return <Star size={20} color="#059669" />;
      case 'crown':
      case 'creditcard':
        return <CreditCard size={20} color="#7C3AED" />;
      default:
        return <Star size={20} color="#3B82F6" />;
    }
  };

  const getCurrentPlanInfo = () => {
    if (!userProfile) return { name: 'Free Plan', minutes: '0 minutes remaining' };
    
    const tierMap = {
      'free': 'Free Plan',
      'intro': 'Intro Plan',
      'professional': 'Professional Plan',
      'executive': 'Executive Plan'
    };
    
    const planName = tierMap[userProfile.subscription_tier] || 'Free Plan';
    const remainingMinutes = userProfile.total_conversation_minutes - userProfile.used_conversation_minutes;
    
    return {
      name: planName,
      minutes: `${remainingMinutes} minutes remaining`
    };
  };

  const handleSubscribe = async (plan?: SubscriptionPlan | any) => {
    try {
      // Open the InterviewAI pricing page for subscription management
      await Linking.openURL('https://interviewai.us/#pricing');
    } catch (error) {
      console.error('Error opening pricing page:', error);
      Alert.alert('Error', 'Could not open the pricing page. Please try again.');
    }
  };

  const handleEditProfile = () => {
    router.push('/(app)/profile/edit');
  };

  const handleFAQ = () => {
    setCurrentView('faq');
  };

  const handleContactSupport = () => {
    setCurrentView('contact');
  };

  const renderMainSettings = () => {
    const currentPlan = getCurrentPlanInfo();
    
    return (
      <>
        {/* Modern Header */}
        <View style={{
          marginBottom: spacing.xl,
          paddingTop: spacing.lg, // Increased to match other screens
        }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: typography.headlineLarge, 
              fontWeight: '800', 
              color: colors.text, 
              marginBottom: spacing.md,
              lineHeight: typography.headlineLarge * 1.2,
            }}>
              Settings
            </Text>
            <Text style={{ 
              fontSize: typography.bodyLarge, 
              color: colors.textSecondary,
              lineHeight: typography.bodyLarge * 1.4,
              fontWeight: '500',
            }}>
              Manage your account and preferences
            </Text>
          </View>
        </View>

        {/* Enhanced Profile Section */}
        <View style={{
          marginBottom: spacing.xl,
        }}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginBottom: 16 }]}>
            Profile
          </Text>
          
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <User size={28} color={colors.primary} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: '700', 
                  color: colors.text, 
                  marginBottom: 4,
                  lineHeight: 24
                }}>
                  {user?.name || userProfile?.name || 'User'}
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.textSecondary,
                  fontWeight: '500',
                  marginBottom: 8
                }}>
                  {user?.email}
                </Text>
                
                {/* Plan Badge */}
                <View style={{
                  backgroundColor: colors.primary + '20',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{ 
                    fontSize: 12, 
                    color: colors.primary, 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    {currentPlan.name}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={{
          marginBottom: spacing.xl,
        }}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginBottom: 16 }]}>
            Preferences
          </Text>
          
          {/* Theme Toggle */}
          <TouchableOpacity 
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              borderWidth: 1,
              borderColor: colors.borderLight,
              marginBottom: 12,
            }}
            onPress={toggleTheme}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                backgroundColor: colors.surface,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                {theme === 'dark' ? 
                  <Moon size={20} color={colors.text} /> : 
                  <Sun size={20} color={colors.text} />
                }
              </View>
              <View>
                <Text style={{ 
                  fontSize: 16, 
                  color: colors.text, 
                  fontWeight: '600',
                  marginBottom: 2
                }}>
                  Theme
                </Text>
                <Text style={{ 
                  fontSize: 13, 
                  color: colors.textSecondary,
                  fontWeight: '500'
                }}>
                  Toggle between light and dark
                </Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 14, 
                color: colors.primary, 
                fontWeight: '600',
                marginRight: 8
              }}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </Text>
              <ChevronRight size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Billing Section */}
        <View style={{
          marginBottom: spacing.xl,
        }}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginBottom: 16 }]}>
            Billing & Subscription
          </Text>
          
          <TouchableOpacity 
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
            onPress={() => setCurrentView('billing')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                backgroundColor: colors.primary + '20',
                width: 50,
                height: 50,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Receipt size={24} color={colors.primary} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 18, 
                  color: colors.primary, 
                  fontWeight: '700',
                  marginBottom: 4
                }}>
                  {currentPlan.name}
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.textSecondary,
                  fontWeight: '500'
                }}>
                  {currentPlan.minutes}
                </Text>
              </View>
            </View>
            
            <ChevronRight size={24} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={{
          marginBottom: spacing.xl,
        }}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginBottom: 16 }]}>
            Account
          </Text>
          
          {[
            { 
              title: 'Edit Profile', 
              icon: User, 
              description: 'Update your personal information',
              onPress: handleEditProfile
            },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 2,
                elevation: 1,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
              onPress={item.onPress}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  backgroundColor: colors.surface,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <item.icon size={20} color={colors.textSecondary} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    color: colors.text, 
                    fontWeight: '600',
                    marginBottom: 2
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{ 
                    fontSize: 13, 
                    color: colors.textSecondary,
                    fontWeight: '500'
                  }}>
                    {item.description}
                  </Text>
                </View>
              </View>
              
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info Section */}
        <View style={{
          marginBottom: spacing.xl,
        }}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginBottom: 16 }]}>
            About This App
          </Text>
          
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.borderLight,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
                         <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
               <Info size={20} color={colors.primary} style={{ marginTop: 2 }} />
               <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.textSecondary,
                  lineHeight: 20,
                  fontWeight: '500'
                }}>
                  This mobile app helps you schedule interviews, view feedback, and manage your account. 
                  Live AI interviews are conducted on{' '}
                  <Text style={{ 
                    color: colors.primary, 
                    fontWeight: '600'
                  }}>
                    interviewai.us
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={{
          marginBottom: spacing.xl,
        }}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginBottom: 16 }]}>
            Support
          </Text>
          
          {[
            { title: 'Help & FAQ', description: 'Get answers to common questions', onPress: handleFAQ },
            { title: 'Contact Support', description: 'Reach out to our support team', onPress: handleContactSupport },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 2,
                elevation: 1,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
              onPress={item.onPress}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 16, 
                  color: colors.text, 
                  fontWeight: '600',
                  marginBottom: 2
                }}>
                  {item.title}
                </Text>
                <Text style={{ 
                  fontSize: 13, 
                  color: colors.textSecondary,
                  fontWeight: '500'
                }}>
                  {item.description}
                </Text>
              </View>
              
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View style={{ paddingBottom: spacing.xl }}>
          {(() => {
            console.log('[Settings] Rendering Sign Out button');
            return (
              <TouchableOpacity 
                style={{
                  backgroundColor: colors.error + '10',
                  borderRadius: 12,
                  padding: 20,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.error + '30',
                }}
                onPress={handleSignOut}
              >
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: colors.error 
                }}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            );
          })()}
        </View>
      </>
    );
  };

  const renderBillingPlans = () => {
    const currentPlan = getCurrentPlanInfo();
    
    // Define preset plans with actual pricing
    const presetPlans = [
      {
        name: 'Intro',
        description: 'Perfect for getting started',
        monthly: {
          price: 39, // $39/month
          minutes: 60
        },
        yearly: {
          price: 445, // $445/year (discounted from $468)
          minutes: 720,
          originalPrice: 468
        },
        isPopular: false,
        icon: 'zap'
      },
      {
        name: 'Professional',
        description: 'Most popular for job seekers',
        monthly: {
          price: 199, // $199/month
          minutes: 330
        },
        yearly: {
          price: 2268, // $2268/year (discounted from $2388)
          minutes: 3960,
          originalPrice: 2388
        },
        isPopular: true,
        icon: 'star'
      },
      {
        name: 'Executive',
        description: 'For senior-level positions',
        monthly: {
          price: 499, // $499/month
          minutes: 900
        },
        yearly: {
          price: 5391, // $5391/year (discounted from $5988)
          minutes: 10800,
          originalPrice: 5988
        },
        isPopular: false,
        icon: 'crown'
      }
    ];
    
    return (
      <>
        {/* Updated Header with modern back button */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 24, 
          paddingHorizontal: spacing.lg,
          paddingTop: 12
        }}>
          <TouchableOpacity 
            onPress={() => setCurrentView('main')}
            style={{ 
              marginRight: 12,
              backgroundColor: colors.surface,
              padding: 10,
              borderRadius: 10,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 3,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          >
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '800', 
              color: colors.text,
              letterSpacing: -0.5,
              marginBottom: 2
            }}>
              Billing & Plans
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.textSecondary,
              fontWeight: '500'
            }}>
              Manage your subscription and billing
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Current Plan - Compact Version */}
          <View style={{ 
            paddingTop: spacing.sm,
            paddingBottom: spacing.lg 
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '700', 
              color: colors.text, 
              marginBottom: 12 
            }}>
              Current Plan
            </Text>
            
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.borderLight,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Star size={24} color={colors.primary} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: '700', 
                    color: colors.text,
                    marginBottom: 4 
                  }}>
                    {currentPlan.name}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: colors.textSecondary,
                    fontWeight: '500' 
                  }}>
                    {currentPlan.minutes}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Billing Notice */}
          <View style={{ 
            marginBottom: spacing.lg 
          }}>
            <View style={{
              backgroundColor: colors.primary + '08',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.primary + '20',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <ExternalLink size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: colors.text,
                    fontWeight: '600',
                    marginBottom: 4
                  }}>
                    Manage Subscription
                  </Text>
                  <Text style={{ 
                    fontSize: 13, 
                    color: colors.textSecondary,
                    lineHeight: 18,
                    fontWeight: '500'
                  }}>
                    Billing is handled on interviewai.us for secure payments
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Available Plans */}
          <View style={{ 
            paddingBottom: spacing.xl 
          }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 16 
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '700', 
                color: colors.text 
              }}>
                Available Plans
              </Text>
              
              {/* Compact Toggle */}
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 2,
                flexDirection: 'row',
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: !isAnnual ? colors.primary : 'transparent',
                  }}
                  onPress={() => setIsAnnual(false)}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: !isAnnual ? colors.textInverse : colors.textSecondary,
                  }}>
                    Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: isAnnual ? colors.primary : 'transparent',
                  }}
                  onPress={() => setIsAnnual(true)}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: isAnnual ? colors.textInverse : colors.textSecondary,
                  }}>
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Plans */}
            <View style={{ gap: 16 }}>
              {presetPlans.map((plan, index) => {
                const pricing = isAnnual ? plan.yearly : plan.monthly;
                
                return (
                  <View 
                    key={index}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      padding: 20,
                      borderWidth: plan.isPopular ? 2 : 1,
                      borderColor: plan.isPopular ? colors.primary : colors.borderLight,
                      shadowColor: colors.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: plan.isPopular ? 0.12 : 0.06,
                      shadowRadius: 8,
                      elevation: plan.isPopular ? 6 : 3,
                    }}
                  >
                    {plan.isPopular && (
                      <View style={{
                        position: 'absolute',
                        top: -10,
                        left: 20,
                        backgroundColor: colors.primary,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: colors.textInverse,
                        }}>
                          Most Popular
                        </Text>
                      </View>
                    )}
                    
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          {getPlanIcon(plan.icon)}
                          <Text style={{ 
                            fontSize: 20, 
                            fontWeight: '700', 
                            color: colors.text,
                            marginLeft: 12
                          }}>
                            {plan.name}
                          </Text>
                        </View>
                        
                        <Text style={{ 
                          fontSize: 14, 
                          color: colors.textSecondary,
                          marginBottom: 12,
                          fontWeight: '500'
                        }}>
                          {plan.description}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 }}>
                          <Text style={{ 
                            fontSize: 24, 
                            fontWeight: '800', 
                            color: colors.text 
                          }}>
                            ${pricing.price}
                          </Text>
                          <Text style={{ 
                            fontSize: 14, 
                            color: colors.textSecondary,
                            marginLeft: 4,
                            fontWeight: '500'
                          }}>
                            /{isAnnual ? 'year' : 'month'}
                          </Text>
                                                     {isAnnual && plan.yearly.originalPrice && (
                             <View style={{
                               backgroundColor: colors.success + '20',
                               paddingHorizontal: 8,
                               paddingVertical: 2,
                               borderRadius: 4,
                               marginLeft: 12,
                             }}>
                               <Text style={{
                                 fontSize: 11,
                                 fontWeight: '600',
                                 color: colors.success,
                               }}>
                                 Save ${plan.yearly.originalPrice - pricing.price}
                               </Text>
                             </View>
                           )}
                        </View>
                        
                        <Text style={{ 
                          fontSize: 14, 
                          color: colors.textSecondary,
                          fontWeight: '500'
                        }}>
                          {pricing.minutes} conversation minutes {isAnnual ? 'per year' : 'per month'}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        style={{
                          backgroundColor: plan.isPopular ? colors.primary : colors.surface,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          borderRadius: 8,
                          borderWidth: plan.isPopular ? 0 : 1,
                          borderColor: colors.border,
                        }}
                        onPress={() => handleSubscribe(plan)}
                      >
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: plan.isPopular ? colors.textInverse : colors.text,
                        }}>
                          Choose Plan
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </>
    );
  };

  const renderFAQ = () => {
    const faqs = [
      {
        question: 'How do the AI interview sessions work?',
        answer: 'Our AI interviewer conducts realistic video interviews tailored to your role and industry. You\'ll receive real-time feedback on your responses, body language, and overall performance.'
      },
      {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to your plan features until the end of your billing period.'
      },
      {
        question: 'Do you offer refunds?',
        answer: 'We offer a 7-day money-back guarantee for all plans. If you\'re not satisfied within the first week, we\'ll provide a full refund.'
      },
      {
        question: 'What types of interviews can I practice?',
        answer: 'You can practice technical interviews, behavioral interviews, case studies, and industry-specific scenarios across various fields including tech, finance, consulting, and more.'
      }
    ];

    return (
      <>
        {/* Updated Header with modern back button */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 24, 
          paddingHorizontal: spacing.lg,
          paddingTop: 12
        }}>
          <TouchableOpacity 
            onPress={() => setCurrentView('main')}
            style={{ 
              marginRight: 12,
              backgroundColor: colors.surface,
              padding: 10,
              borderRadius: 10,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 3,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          >
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '800', 
              color: colors.text,
              letterSpacing: -0.5,
              marginBottom: 2
            }}>
              Help & FAQ
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.textSecondary,
              fontWeight: '500'
            }}>
              Find answers to common questions
            </Text>
          </View>
        </View>

        <View style={{ paddingBottom: spacing.xl }}>
          <Text style={{ 
            fontSize: typography.bodyLarge, 
            color: colors.textSecondary, 
            marginBottom: spacing.lg,
            lineHeight: typography.bodyLarge * 1.4,
            fontWeight: '500',
          }}>
            Find answers to commonly asked questions about our AI interview platform.
          </Text>

          {faqs.map((faq, index) => (
            <View 
              key={index}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: colors.text,
                marginBottom: 12,
                lineHeight: 22
              }}>
                {faq.question}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: colors.textSecondary,
                lineHeight: 20
              }}>
                {faq.answer}
              </Text>
            </View>
          ))}

          <View style={{
            backgroundColor: colors.primary + '10',
            borderRadius: 12,
            padding: 20,
            marginTop: 16,
            borderWidth: 1,
            borderColor: colors.primary + '20',
          }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: colors.primary,
              marginBottom: 8
            }}>
              Still have questions?
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.textSecondary,
              lineHeight: 20
            }}>
              Contact our support team for personalized assistance with your account or technical issues.
            </Text>
          </View>
        </View>
      </>
    );
  };

  const renderContactSupport = () => {
    const socialLinks = [
      {
        name: 'GitHub',
        url: 'https://github.com/tabrezdn1',
        icon: Github,
        description: 'View source code and projects'
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/shaik-tabrez/',
        icon: Linkedin,
        description: 'Professional profile and network'
      },
      {
        name: 'Website',
        url: 'https://shaiktabrez.com',
        icon: Globe,
        description: 'Personal portfolio and blog'
      },
      {
        name: 'Email',
        url: 'mailto:tabrezdn1@gmail.com',
        icon: Mail,
        description: 'Direct email communication'
      }
    ];

    const skills = ['Full-Stack', 'Machine Learning', 'Cloud Solutions', 'DevOps', 'Microservices', 'Generative AI'];

    const handleLinkPress = async (url: string) => {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    };

    return (
      <>
        {/* Updated Header with modern back button */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 24, 
          paddingHorizontal: spacing.lg,
          paddingTop: 12
        }}>
          <TouchableOpacity 
            onPress={() => setCurrentView('main')}
            style={{ 
              marginRight: 12,
              backgroundColor: colors.surface,
              padding: 10,
              borderRadius: 10,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 3,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          >
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '800', 
              color: colors.text,
              letterSpacing: -0.5,
              marginBottom: 2
            }}>
              Contact Support
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.textSecondary,
              fontWeight: '500'
            }}>
              Get help and connect with us
            </Text>
          </View>
        </View>

        <View style={{ paddingBottom: spacing.xl }}>
          <Text style={{ 
            fontSize: typography.bodyLarge, 
            color: colors.textSecondary, 
            marginBottom: spacing.xl,
            lineHeight: typography.bodyLarge * 1.4,
            fontWeight: '500',
            textAlign: 'center'
          }}>
            Meet the Creator of InterviewAI
          </Text>

          {/* Creator Profile Card */}
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}>
            {/* Profile Image */}
            <Image 
              source={require('../../../assets/images/tabrezavatar.png')}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                alignSelf: 'center',
                marginBottom: 20,
                borderWidth: 3,
                borderColor: colors.primary + '30',
              }}
              resizeMode="cover"
            />

            {/* Name and Title */}
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '700', 
              color: colors.text,
              textAlign: 'center',
              marginBottom: 8
            }}>
              Shaik Tabrez
            </Text>
            
            <Text style={{ 
              fontSize: 14, 
              color: colors.primary,
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: 16,
              lineHeight: 20
            }}>
              Software Engineer · Full-Stack · Machine Learning · Cloud Solutions · Generative AI
            </Text>

            {/* Bio */}
            <Text style={{ 
              fontSize: 14, 
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 20
            }}>
              Tabrez is a Software Engineer with 5 years of experience in full-stack development, Generative AI, and cloud-native solutions. He&apos;s worked with startups and enterprises, building scalable apps using JavaScript, Python, Node.js, FastAPI, React, Next.js, and more. Tabrez is passionate about Machine Learning, Generative AI, Cloud Automation, and delivering real impactful results fast.
            </Text>

            {/* Skills */}
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 24
            }}>
              {skills.map((skill, index) => (
                <View 
                  key={index}
                  style={{
                    backgroundColor: colors.primary + '15',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    margin: 4,
                  }}
                >
                  <Text style={{ 
                    fontSize: 12, 
                    color: colors.primary, 
                    fontWeight: '600'
                  }}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>

            {/* Contact Email */}
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}>
              <Mail size={20} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={{ 
                fontSize: 16, 
                color: colors.text, 
                fontWeight: '600',
                marginBottom: 4
              }}>
                Direct Contact
              </Text>
              <TouchableOpacity onPress={() => handleLinkPress('mailto:tabrezdn1@gmail.com')}>
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.primary,
                  textDecorationLine: 'underline'
                }}>
                  tabrezdn1@gmail.com
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Social Links */}
          <View>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: colors.text,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              Connect & Learn More
            </Text>
            
            {socialLinks.map((link, index) => (
              <TouchableOpacity 
                key={index}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
                onPress={() => handleLinkPress(link.url)}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: colors.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <link.icon size={20} color={colors.primary} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: colors.text,
                    marginBottom: 2
                  }}>
                    {link.name}
                  </Text>
                  <Text style={{ 
                    fontSize: 13, 
                    color: colors.textSecondary,
                    fontWeight: '500'
                  }}>
                    {link.description}
                  </Text>
                </View>
                
                <ChevronRight size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </>
    );
  };

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
        >
          {(() => {
            console.log('[Settings] Current view:', currentView);
            if (currentView === 'main') {
              console.log('[Settings] Rendering main settings with sign out button');
              return renderMainSettings();
            } else if (currentView === 'billing') {
              console.log('[Settings] Rendering billing view');
              return renderBillingPlans();
            } else if (currentView === 'faq') {
              console.log('[Settings] Rendering FAQ view');
              return renderFAQ();
            } else {
              console.log('[Settings] Rendering contact support view');
              return renderContactSupport();
            }
          })()}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  billingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billingIconContainer: {
    marginRight: 12,
  },
  billingInfo: {
    flex: 1,
    alignItems: 'center',
  },
  currentBillingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentBillingInfo: {
    alignItems: 'center',
  },
  currentPlan: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  minutesRemaining: {
    fontSize: 14,
    color: '#666',
  },
  subscriptionStatus: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  menuItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  toggleContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: 'white',
  },
  savingsText: {
    fontSize: 12,
    color: '#10b981',
  },
  savingsBadge: {
    backgroundColor: '#007AFF20',
    padding: 4,
    borderRadius: 4,
    marginBottom: 16,
  },
  savingsBadgeText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  plansContainer: {
    marginHorizontal: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    marginBottom: 16,
  },
  planIconContainer: {
    marginRight: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  planDescription: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  planPeriod: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  planMinutes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  themeLabel: {
    fontSize: 14,
    color: '#666',
  },
}); 