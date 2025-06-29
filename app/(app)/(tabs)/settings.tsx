import { router } from 'expo-router';
import {
    ArrowLeft,
    ChevronRight,
    CreditCard,
    Receipt,
    Settings as SettingsIcon,
    Star,
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

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
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
        <View style={styles.header}>
          <SettingsIcon size={28} color="#1a1a1a" />
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <User size={40} color="#6b7280" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.profileName}>
                  {user?.name || userProfile?.name || 'User'}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing</Text>
          
          <TouchableOpacity 
            style={styles.billingCard}
            onPress={() => setCurrentView('billing')}
          >
            <View style={styles.billingIconContainer}>
              <Receipt size={24} color="#007AFF" />
            </View>
            <View style={styles.billingInfo}>
              <Text style={styles.currentPlan}>
                {currentPlan.name}
              </Text>
              <Text style={styles.minutesRemaining}>
                {currentPlan.minutes}
              </Text>
            </View>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Change Password</Text>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Privacy Settings</Text>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Help & FAQ</Text>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Contact Support</Text>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Terms of Service</Text>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderBillingPlans = () => {
    const currentPlan = getCurrentPlanInfo();
    
    return (
      <>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setCurrentView('main')}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>Billing & Plans</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          
          <View style={styles.currentBillingCard}>
            <View style={styles.currentBillingInfo}>
              <Text style={styles.currentPlan}>
                {currentPlan.name}
              </Text>
              <Text style={styles.minutesRemaining}>
                {currentPlan.minutes}
              </Text>
              {userProfile?.subscription_status && userProfile.subscription_status !== 'inactive' && (
                <Text style={styles.subscriptionStatus}>
                  Status: {userProfile.subscription_status}
                </Text>
              )}
            </View>
          </View>
        </View>

        {subscriptionPlans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            
            {/* Billing Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !isAnnual && styles.toggleButtonActive]}
                onPress={() => setIsAnnual(false)}
              >
                <Text style={[styles.toggleText, !isAnnual && styles.toggleTextActive]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isAnnual && styles.toggleButtonActive]}
                onPress={() => setIsAnnual(true)}
              >
                <Text style={[styles.toggleText, isAnnual && styles.toggleTextActive]}>
                  Annual <Text style={styles.savingsText}>Save 20%</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pricing Cards */}
            {subscriptionPlans
              .filter(plan => plan.interval_type === (isAnnual ? 'year' : 'month'))
              .map((plan) => (
                <View
                  key={plan.id}
                  style={[
                    styles.pricingCard,
                    plan.name.toLowerCase().includes('professional') && styles.popularCard
                  ]}
                >
                  {plan.name.toLowerCase().includes('professional') && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>Most Popular</Text>
                    </View>
                  )}
                  
                  <View style={styles.cardHeader}>
                    <View style={styles.planRow}>
                      {getPlanIcon(plan.name)}
                      <Text style={styles.planName}>{plan.name}</Text>
                    </View>
                    
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>${getPrice(plan)}</Text>
                      <Text style={styles.pricePeriod}>/{plan.interval_type}</Text>
                    </View>
                    
                    <Text style={styles.minutes}>
                      {getMinutes(plan)} conversation minutes
                    </Text>
                    
                    {plan.description && (
                      <Text style={styles.planDescription}>
                        {plan.description}
                      </Text>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.subscribeButton,
                      plan.name.toLowerCase().includes('professional') && styles.subscribeButtonPopular,
                      isCreatingCheckout && checkoutPlanId === plan.id && styles.subscribeButtonLoading
                    ]}
                    onPress={() => handleSubscribe(plan)}
                    disabled={isCreatingCheckout}
                  >
                    {isCreatingCheckout && checkoutPlanId === plan.id ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={[styles.subscribeButtonText, plan.name.toLowerCase().includes('professional') && styles.subscribeButtonTextPopular]}>
                        Subscribe
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading plans...</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
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
  pricingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
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
  popularBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardHeader: {
    marginBottom: 16,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  savings: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 8,
  },
  minutes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
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
  subscribeButtonPopular: {
    backgroundColor: '#007AFF',
  },
  subscribeButtonLoading: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  subscribeButtonTextPopular: {
    color: 'white',
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
}); 