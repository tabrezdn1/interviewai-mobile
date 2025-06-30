import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Moon,
  Receipt,
  Settings as SettingsIcon,
  Star,
  Sun,
  User,
  Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { DatabaseService, Profile, Subscription, SubscriptionPlan } from '../../../src/services/DatabaseService';
import { stripeService } from '../../../src/services/StripeService';
import { useAuthStore } from '../../../src/store/authStore';
import { useThemeColors, useThemeStore } from '../../../src/store/themeStore';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const colors = useThemeColors();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'billing'>('main');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: signOut 
        },
      ]
    );
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

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe to a plan', [
        { text: 'OK', onPress: () => router.push('/(auth)/signin') }
      ]);
      return;
    }
    
    setIsCreatingCheckout(true);
    setCheckoutPlanId(plan.id);
    
    try {
      // For now, we'll use a placeholder price ID. In a real app, you'd have this in your plan data
      const priceId = `price_${plan.id}_${isAnnual ? 'yearly' : 'monthly'}`;
      
      const session = await stripeService.createCheckoutSession(
        priceId,
        user.id
      );
      
      // Open Stripe checkout in external browser
      await Linking.openURL(session.url);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      Alert.alert('Error', 'Failed to create checkout session. Please try again.');
    } finally {
      setIsCreatingCheckout(false);
      setCheckoutPlanId(null);
    }
  };

  const renderMainSettings = () => {
    const currentPlan = getCurrentPlanInfo();
    
    return (
      <>
        {/* Modern Header */}
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
              Settings
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: colors.textSecondary,
              fontWeight: '500'
            }}>
              Manage your account, preferences and billing
            </Text>
          </View>
        </View>

        {/* Enhanced Profile Section */}
        <View style={{
          marginBottom: 32,
          paddingHorizontal: 24,
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
          marginBottom: 32,
          paddingHorizontal: 24,
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
          marginBottom: 32,
          paddingHorizontal: 24,
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
          marginBottom: 32,
          paddingHorizontal: 24,
        }}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginBottom: 16 }]}>
            Account
          </Text>
          
          {[
            { title: 'Edit Profile', icon: User, description: 'Update your personal information' },
            { title: 'Change Password', icon: User, description: 'Update your account password' },
            { title: 'Privacy Settings', icon: SettingsIcon, description: 'Manage your privacy preferences' },
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

        {/* Support Section */}
        <View style={{
          marginBottom: 32,
          paddingHorizontal: 24,
        }}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 0, marginBottom: 16 }]}>
            Support
          </Text>
          
          {[
            { title: 'Help & FAQ', description: 'Get answers to common questions' },
            { title: 'Contact Support', description: 'Reach out to our support team' },
            { title: 'Terms of Service', description: 'Review our terms and conditions' },
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
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
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
        </View>
      </>
    );
  };

  const renderBillingPlans = () => {
    const currentPlan = getCurrentPlanInfo();
    
    return (
      <>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={() => setCurrentView('main')}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Billing & Plans</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Plan</Text>
          
          <View style={[styles.currentBillingCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.currentBillingInfo}>
              <Text style={[styles.currentPlan, { color: colors.primary }]}>
                {currentPlan.name}
              </Text>
              <Text style={[styles.minutesRemaining, { color: colors.textSecondary }]}>
                {currentPlan.minutes}
              </Text>
              {userProfile?.subscription_status && userProfile.subscription_status !== 'inactive' && (
                <Text style={[styles.subscriptionStatus, { color: colors.textTertiary }]}>
                  Status: {userProfile.subscription_status}
                </Text>
              )}
            </View>
          </View>
        </View>

        {subscriptionPlans.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Plans</Text>
            
            {/* Billing Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.toggleButton, !isAnnual && styles.toggleButtonActive, { backgroundColor: !isAnnual ? colors.primary : 'transparent' }]}
                onPress={() => setIsAnnual(false)}
              >
                <Text style={[styles.toggleText, !isAnnual && styles.toggleTextActive, { color: !isAnnual ? colors.textInverse : colors.textSecondary }]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isAnnual && styles.toggleButtonActive, { backgroundColor: isAnnual ? colors.primary : 'transparent' }]}
                onPress={() => setIsAnnual(true)}
              >
                <Text style={[styles.toggleText, isAnnual && styles.toggleTextActive, { color: isAnnual ? colors.textInverse : colors.textSecondary }]}>
                  Annual
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Show savings badge for annual */}
            {isAnnual && (
              <View style={[styles.savingsBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.savingsText, { color: colors.success }]}>
                  💰 Save up to 20% with annual billing
                </Text>
              </View>
            )}

            {/* Plan Cards */}
            <View style={styles.plansContainer}>
              {subscriptionPlans
                .filter(plan => plan.interval_type === (isAnnual ? 'year' : 'month'))
                .map((plan) => (
                  <View 
                    key={plan.id} 
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: plan.name?.toLowerCase().includes('professional') ? colors.primary : colors.border,
                        borderWidth: plan.name?.toLowerCase().includes('professional') ? 2 : 1,
                      }
                    ]}
                  >
                    {plan.name?.toLowerCase().includes('professional') && (
                      <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.popularText, { color: colors.textInverse }]}>Most Popular</Text>
                      </View>
                    )}
                    
                    <View style={styles.planHeader}>
                      <View style={styles.planIconContainer}>
                        {getPlanIcon('star')}
                      </View>
                      <Text style={[styles.planTitle, { color: colors.text }]}>{plan.name}</Text>
                      <Text style={[styles.planDescription, { color: colors.textSecondary }]}>{plan.description}</Text>
                    </View>
                    
                    <View style={styles.planPricing}>
                      <Text style={[styles.planPrice, { color: colors.text }]}>
                        ${getPrice(plan)}<Text style={[styles.planPeriod, { color: colors.textTertiary }]}>/{isAnnual ? 'year' : 'month'}</Text>
                      </Text>
                      <Text style={[styles.planMinutes, { color: colors.textSecondary }]}>
                        {getMinutes(plan)} conversation minutes
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.subscribeButton,
                        {
                          backgroundColor: plan.name?.toLowerCase().includes('professional') ? colors.primary : colors.buttonSecondary,
                        }
                      ]}
                      onPress={() => handleSubscribe(plan)}
                      disabled={isCreatingCheckout && checkoutPlanId === plan.id}
                    >
                      {isCreatingCheckout && checkoutPlanId === plan.id ? (
                        <ActivityIndicator 
                          size="small" 
                          color={plan.name?.toLowerCase().includes('professional') ? colors.textInverse : colors.buttonSecondaryText} 
                        />
                      ) : (
                        <Text style={[
                          styles.subscribeButtonText,
                          {
                            color: plan.name?.toLowerCase().includes('professional') ? colors.textInverse : colors.buttonSecondaryText,
                          }
                        ]}>
                          Subscribe
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          </View>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        style={{ flex: 1, backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {currentView === 'main' ? renderMainSettings() : renderBillingPlans()}
      </ScrollView>
    </SafeAreaView>
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