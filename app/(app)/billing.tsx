import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Calendar, CreditCard, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LoadingComponent } from '../../src/components';
import { getConversationMinutes, getProfile } from '../../src/services/ProfileService';
import { PRICING_PLANS, stripeService } from '../../src/services/StripeService';
import { useAuthStore } from '../../src/store/authStore';

const Billing: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [conversationMinutes, setConversationMinutes] = useState<any>(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Add colors and gradient configuration
  const colors = {
    background: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    primary: '#3b82f6',
    surface: '#ffffff',
    gradientBackground: null
  };

  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  useEffect(() => {
    const loadBillingData = async () => {
      if (user) {
        try {
          setLoading(true);
          setStripeError(null);
          
          const [minutes, profile] = await Promise.all([
            getConversationMinutes(user.id),
            getProfile(user.id)
          ]);
          
          setConversationMinutes(minutes);
          setUserProfile(profile);
          
          try {
            const subscription = await stripeService.getSubscription(user.id);
            setSubscription(subscription);
          } catch (subscriptionError) {
            console.error('Failed to load subscription data:', subscriptionError);
            setStripeError('Unable to load subscription information.');
            setSubscription(null);
          }
        } catch (error) {
          console.error('Error loading billing data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadBillingData();
  }, [user]);

  const handleManageBilling = async () => {
    if (stripeError) {
      Alert.alert('Error', 'Billing management is currently unavailable. Please try again later.');
      return;
    }
    
    if (!userProfile?.stripe_customer_id) {
      Alert.alert('Error', 'No billing information found. Please contact support.');
      return;
    }
    
    setIsLoadingPortal(true);
    try {
      const { url } = await stripeService.createPortalSession(
        userProfile.stripe_customer_id
      );
      
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error creating portal session:', error);
      Alert.alert('Error', 'Failed to open billing portal. Please try again.');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const currentSubscription = {
    plan: userProfile?.subscription_tier || 'free',
    status: userProfile?.subscription_status || 'inactive',
    price: userProfile?.subscription_tier === 'professional' ? '$199' : 
           userProfile?.subscription_tier === 'executive' ? '$499' : 
           userProfile?.subscription_tier === 'intro' ? '$39' : 'Free',
    period: subscription?.cancel_at_period_end ? 'until period end' : 'month',
    nextBilling: subscription?.current_period_end ? 
      new Date(subscription.current_period_end * 1000).toISOString().split('T')[0] : 
      '2025-02-15',
    minutesUsed: conversationMinutes?.used || 0,
    minutesTotal: conversationMinutes?.total || 60,
    daysLeft: subscription?.current_period_end ? 
      Math.max(0, Math.floor((subscription.current_period_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24))) : 
      0
  };

  if (loading) {
    return (
      <LoadingComponent 
        message="Loading billing information..."
        size="large"
      />
    );
  }

  return (
    <LinearGradient colors={gradientColors as any} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 32 }}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <CreditCard size={16} color="#3B82F6" />
              <Text style={styles.badgeText}>Billing & Subscription</Text>
            </View>
            <Text style={styles.title}>Manage Your Plan</Text>
            <Text style={styles.subtitle}>
              View your subscription details and manage your billing information
            </Text>
          </View>

          {/* Current Plan */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Current Plan</Text>
              <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push('/(app)/(tabs)/pricing')}>
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.planInfo}>
              <View style={styles.planDetails}>
                <Text style={styles.planName}>{currentSubscription.plan.charAt(0).toUpperCase() + currentSubscription.plan.slice(1)} Plan</Text>
                <Text style={styles.planPrice}>{currentSubscription.price}/{currentSubscription.period}</Text>
                {currentSubscription.nextBilling && (
                  <Text style={styles.nextBilling}>
                    Next billing: {new Date(currentSubscription.nextBilling).toLocaleDateString()}
                  </Text>
                )}
              </View>
              
              <View style={styles.usageInfo}>
                <Text style={styles.usageTitle}>Conversation Minutes</Text>
                <View style={styles.usageBar}>
                  <View style={[styles.usageProgress, { 
                    width: `${(currentSubscription.minutesUsed / currentSubscription.minutesTotal) * 100}%` 
                  }]} />
                </View>
                <Text style={styles.usageText}>
                  {currentSubscription.minutesUsed} / {currentSubscription.minutesTotal} minutes used
                </Text>
              </View>
            </View>
          </View>

          {/* Billing Management */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Billing Management</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleManageBilling}
              disabled={isLoadingPortal}
            >
              <View style={styles.actionButtonContent}>
                <Settings size={20} color="#374151" />
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>Manage Billing</Text>
                  <Text style={styles.actionButtonSubtitle}>Update payment methods, view invoices</Text>
                </View>
              </View>
              {isLoadingPortal && <ActivityIndicator size="small" color="#6B7280" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(app)/(tabs)/pricing')}
            >
              <View style={styles.actionButtonContent}>
                <Calendar size={20} color="#374151" />
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>Change Plan</Text>
                  <Text style={styles.actionButtonSubtitle}>Upgrade or downgrade your subscription</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Plan Comparison */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Available Plans</Text>
            
            {PRICING_PLANS.map((plan) => (
              <View key={plan.name} style={styles.planOption}>
                <View style={styles.planOptionContent}>
                  <Text style={styles.planOptionName}>{plan.name}</Text>
                  <Text style={styles.planOptionPrice}>${plan.price}/{plan.billing}</Text>
                  <Text style={styles.planOptionFeatures}>{plan.features}</Text>
                </View>
                <TouchableOpacity style={styles.selectPlanButton}>
                  <Text style={styles.selectPlanButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  planInfo: {
    gap: 20,
  },
  planDetails: {
    gap: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  planPrice: {
    fontSize: 16,
    color: '#6B7280',
  },
  nextBilling: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  usageInfo: {
    gap: 8,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  usageBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  usageProgress: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  usageText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonText: {
    marginLeft: 16,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  planOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
  },
  currentPlanOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },
  planOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  currentBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planOptionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  planOptionMinutes: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  planOptionDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  planOptionContent: {
    flex: 1,
  },
  selectPlanButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectPlanButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  planOptionFeatures: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default Billing; 