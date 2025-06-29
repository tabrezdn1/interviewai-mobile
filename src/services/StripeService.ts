import { supabase } from '../config/supabase';

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  minutes: number;
  features: string[];
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

export interface StripeSubscription {
  id: string;
  status: string;
  current_period_end: number;
  product_id: string;
  cancel_at_period_end: boolean;
}

// Pricing plans configuration (exact copy from web app)
export const PRICING_PLANS = {
  intro: {
    id: 'intro',
    name: 'Intro',
    description: 'Perfect for getting started',
    icon: 'Zap',
    color: 'blue',
    popular: false,
    monthly: {
      price: 3900, // in cents
      minutes: 60,
      stripe_price_id: 'price_1ReU7NGAHtqBz61ItNOTT7IA',
      features: [
        "60 conversation minutes/month",
        "Basic feedback analysis",
        "Standard question library",
        "Email support",
        "Progress tracking"
      ]
    },
    yearly: {
      price: 44500, // in cents
      minutes: 720, // 60 * 12
      stripe_price_id: 'price_1ReVdYGAHtqBz61IKmbslk04',
      originalPrice: 46800, // 3900 * 12
      features: [
        "720 conversation minutes/year",
        "Basic feedback analysis",
        "Standard question library",
        "Email support",
        "Progress tracking"
      ]
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Most popular for job seekers',
    icon: 'Star',
    color: 'primary',
    popular: true,
    monthly: {
      price: 19900, // in cents
      minutes: 330,
      stripe_price_id: 'price_1ReVewGAHtqBz61IJaedyXwa',
      features: [
        "330 conversation minutes/month",
        "Advanced feedback & coaching",
        "Industry-specific questions",
        "Video analysis & tips",
        "Priority support",
        "Performance analytics"
      ]
    },
    yearly: {
      price: 226800, // in cents
      minutes: 3960, // 330 * 12
      stripe_price_id: 'price_1ReVgAGAHtqBz61IoR5OLXVL',
      originalPrice: 238800, // 19900 * 12
      features: [
        "3960 conversation minutes/year",
        "Advanced feedback & coaching",
        "Industry-specific questions",
        "Video analysis & tips",
        "Priority support",
        "Performance analytics"
      ]
    }
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    description: 'For senior-level positions',
    icon: 'Crown',
    color: 'purple',
    popular: false,
    monthly: {
      price: 49900, // in cents
      minutes: 900,
      stripe_price_id: 'price_1ReVfkGAHtqBz61IZvGYezkS',
      features: [
        "900 conversation minutes/month",
        "Executive-level scenarios",
        "Custom interview prep",
        "1-on-1 coaching calls",
        "White-glove support",
        "Advanced analytics"
      ]
    },
    yearly: {
      price: 539100, // in cents
      minutes: 10800, // 900 * 12
      stripe_price_id: 'price_1ReVgeGAHtqBz61Ij9vN90jN',
      originalPrice: 598800, // 49900 * 12
      features: [
        "10800 conversation minutes/year",
        "Executive-level scenarios",
        "Custom interview prep",
        "1-on-1 coaching calls",
        "White-glove support",
        "Advanced analytics"
      ]
    }
  }
};

class StripeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;
  }

  async createCheckoutSession(
    priceId: string,
    userId: string,
    successUrl: string = 'interviewai://billing?success=true',
    cancelUrl: string = 'interviewai://pricing?canceled=true'
  ): Promise<StripeCheckoutSession> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          user_id: userId,
          success_url: successUrl,
          cancel_url: cancelUrl
        }
      });

      if (error) {
        console.error('Supabase Functions error:', error);
        
        if (error.name === 'FunctionsHttpError' && error.context) {
          try {
            const errorDetails = JSON.parse(error.context);
            throw new Error(errorDetails.error || 'Failed to create checkout session');
          } catch (parseError) {
            throw new Error(`Edge Function error: ${error.message}`);
          }
        }
        
        throw error;
      }
      
      if (!data || !data.url) {
        throw new Error('Invalid response from checkout service');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async createPortalSession(customerId: string, returnUrl: string = 'interviewai://billing'): Promise<{ url: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal', {
        body: {
          customer_id: customerId,
          return_url: returnUrl
        }
      });

      if (error) {
        console.error('Supabase Functions error:', error);
        
        if (error.name === 'FunctionsHttpError' && error.context) {
          try {
            const errorDetails = JSON.parse(error.context);
            throw new Error(errorDetails.error || 'Failed to create portal session');
          } catch (parseError) {
            throw new Error(`Edge Function error: ${error.message}`);
          }
        }
        
        throw error;
      }
      
      if (!data || !data.url) {
        throw new Error('Invalid response from portal service');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  async getSubscription(userId: string): Promise<StripeSubscription | null> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: { user_id: userId }
      });

      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error('Failed to get subscription details');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-cancel', {
        body: { subscription_id: subscriptionId }
      });

      if (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  getPlanDetails(planId: string, interval: 'monthly' | 'yearly') {
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan) return null;
    
    return interval === 'yearly' ? plan.yearly : plan.monthly;
  }

  getMinutesForPlan(planId: string, interval: 'monthly' | 'yearly'): number {
    const details = this.getPlanDetails(planId, interval);
    return details?.minutes || 0;
  }

  async getBillingHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-invoices', {
        body: { user_id: userId }
      });

      if (error) {
        console.error('Error fetching billing history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting billing history:', error);
      return [];
    }
  }

  formatPrice(amount: number): string {
    return `$${(amount / 100).toFixed(2)}`;
  }

  getPlanFeatures(planId: string, interval: 'monthly' | 'yearly' = 'monthly'): string[] {
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan) return [];
    
    return interval === 'yearly' ? plan.yearly.features : plan.monthly.features;
  }

  calculateSavings(planId: string): number {
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan || !plan.yearly.originalPrice) return 0;
    
    return (plan.yearly.originalPrice - plan.yearly.price) / 100;
  }

  calculateSavingsPercentage(planId: string): number {
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan || !plan.yearly.originalPrice) return 0;
    
    return Math.round(((plan.yearly.originalPrice - plan.yearly.price) / plan.yearly.originalPrice) * 100);
  }
}

export const stripeService = new StripeService();
export default stripeService; 