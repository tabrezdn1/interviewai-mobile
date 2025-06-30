import { supabase } from '../config/supabase';

// Types based on the schema
export interface Profile {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  email_confirmed: boolean;
  last_login_at?: string;
  subscription_tier: 'free' | 'intro' | 'professional' | 'executive';
  subscription_expires_at?: string;
  total_conversation_minutes: number;
  used_conversation_minutes: number;
  stripe_customer_id?: string;
  current_subscription_id?: string;
  subscription_status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid';
  subscription_current_period_start?: string;
  subscription_current_period_end?: string;
  subscription_cancel_at_period_end: boolean;
}

export interface Interview {
  id: string;
  user_id: string;
  title: string;
  company?: string;
  role: string;
  interview_type_id: number;
  experience_level_id?: number;
  difficulty_level_id: number;
  status: 'scheduled' | 'completed' | 'canceled';
  score?: number;
  scheduled_at: string;
  completed_at?: string;
  duration: number;
  created_at: string;
  feedback_processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  tavus_conversation_id?: string;
  feedback_requested_at?: string;
  prompt_status: 'pending' | 'generating' | 'ready' | 'failed';
  llm_generated_context?: string;
  llm_generated_greeting?: string;
  prompt_error?: string;
  tavus_persona_id?: string;
  tavus_conversation_url?: string;
  // Joined data
  interview_types?: { type: string; title: string; description: string; icon: string };
  experience_levels?: { value: string; label: string };
  difficulty_levels?: { value: string; label: string };
}

export interface Feedback {
  id: number;
  interview_id: string;
  overall_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  technical_score?: number;
  communication_score?: number;
  problem_solving_score?: number;
  experience_score?: number;
  technical_feedback?: string;
  communication_feedback?: string;
  problem_solving_feedback?: string;
  experience_feedback?: string;
  created_at: string;
  tavus_conversation_id?: string;
  transcript?: string;
  tavus_analysis?: any;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval_type: 'month' | 'year';
  conversation_minutes: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  subscription_plans?: SubscriptionPlan;
}

export interface Invoice {
  id: string;
  user_id: string;
  subscription_id?: string;
  stripe_customer_id: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  description?: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  period_start?: string;
  period_end?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  type: string;
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default: boolean;
  created_at: string;
}

export interface InterviewType {
  id: number;
  type: string;
  title: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface ExperienceLevel {
  id: number;
  value: string;
  label: string;
  created_at: string;
}

export interface DifficultyLevel {
  id: number;
  value: string;
  label: string;
  created_at: string;
}

export class DatabaseService {
  // Profile Management
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // Interview Management
  static async getInterviews(userId: string): Promise<Interview[]> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          interview_types (id, type, title, description, icon),
          experience_levels (id, value, label),
          difficulty_levels (id, value, label)
        `)
        .eq('user_id', userId)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching interviews:', error);
      return [];
    }
  }

  static async createInterview(userId: string, interviewData: {
    title: string;
    company?: string;
    role: string;
    interview_type_id: number;
    experience_level_id?: number;
    difficulty_level_id: number;
    scheduled_at: string;
    duration?: number;
  }): Promise<Interview | null> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          user_id: userId,
          status: 'scheduled',
          duration: 20,
          ...interviewData
        })
        .select(`
          *,
          interview_types (id, type, title, description, icon),
          experience_levels (id, value, label),
          difficulty_levels (id, value, label)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating interview:', error);
      return null;
    }
  }

  static async updateInterview(interviewId: string, updates: Partial<Interview>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', interviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating interview:', error);
      return false;
    }
  }

  static async deleteInterview(interviewId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', interviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting interview:', error);
      return false;
    }
  }

  // Feedback Management
  static async getFeedback(interviewId: string): Promise<Feedback | null> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('interview_id', interviewId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return null;
    }
  }

  static async getAllFeedback(userId: string): Promise<Feedback[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          interviews!inner (
            id,
            user_id,
            title,
            company,
            role,
            scheduled_at,
            completed_at
          )
        `)
        .eq('interviews.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      return [];
    }
  }

  // Subscription Management
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('amount');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }

  static async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      return null;
    }
  }

  static async getSubscriptionHistory(userId: string): Promise<Subscription[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      return [];
    }
  }

  // Billing Management
  static async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  // Reference Data
  static async getInterviewTypes(): Promise<InterviewType[]> {
    try {
      const { data, error } = await supabase
        .from('interview_types')
        .select('*')
        .order('id');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching interview types:', error);
      return [];
    }
  }

  static async getExperienceLevels(): Promise<ExperienceLevel[]> {
    try {
      const { data, error } = await supabase
        .from('experience_levels')
        .select('*')
        .order('id');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching experience levels:', error);
      return [];
    }
  }

  static async getDifficultyLevels(): Promise<DifficultyLevel[]> {
    try {
      const { data, error } = await supabase
        .from('difficulty_levels')
        .select('*')
        .order('id');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching difficulty levels:', error);
      return [];
    }
  }

  // Dashboard Statistics
  static async getDashboardStats(userId: string): Promise<{
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    conversationMinutes: { total: number; used: number; remaining: number };
    recentInterviews: Interview[];
  }> {
    try {
      const [interviews, profile] = await Promise.all([
        this.getInterviews(userId),
        this.getProfile(userId)
      ]);

      const completedInterviews = interviews.filter(i => i.status === 'completed');
      const totalScore = completedInterviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
      const averageScore = completedInterviews.length > 0 ? Math.round(totalScore / completedInterviews.length) : 0;

      const conversationMinutes = {
        total: profile?.total_conversation_minutes || 0,
        used: profile?.used_conversation_minutes || 0,
        remaining: (profile?.total_conversation_minutes || 0) - (profile?.used_conversation_minutes || 0)
      };

      return {
        totalInterviews: interviews.length,
        completedInterviews: completedInterviews.length,
        averageScore,
        conversationMinutes,
        recentInterviews: interviews.slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalInterviews: 0,
        completedInterviews: 0,
        averageScore: 0,
        conversationMinutes: { total: 0, used: 0, remaining: 0 },
        recentInterviews: []
      };
    }
  }
} 