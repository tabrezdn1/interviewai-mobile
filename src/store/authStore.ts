import { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { create } from 'zustand';
import { supabase } from '../config/supabase';

WebBrowser.maybeCompleteAuthSession();

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription_tier?: string;
  total_conversation_minutes?: number;
  used_conversation_minutes?: number;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  currentSessionId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signUp: (credentials: { email: string; password: string; name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
  handleSession: (session: Session) => Promise<void>;
  initialize: () => Promise<void>;
}

function generateGravatarUrl(email: string): string {
  // Simple gravatar URL generation - you can implement crypto hash if needed
  const hash = email.toLowerCase().trim();
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,
  currentSessionId: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        get().handleSession(session);
      }
      
      // Set up auth state listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          set({ 
            currentSessionId: null, 
            user: null, 
            isAuthenticated: false,
            loading: false
          });
          return;
        }
        
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const currentState = get();
          
          if (currentState.currentSessionId !== session.access_token) {
            set({ currentSessionId: session.access_token });
            await get().handleSession(session);
          }
        }
      });
      
      set({ loading: false });
    } catch (error) {
      console.error('[AuthStore] Error initializing auth:', error);
      set({ user: null, loading: false, isAuthenticated: false });
    }
  },

  handleSession: async (session: Session) => {
    const supabaseUser = session.user;
    
    if (!supabaseUser) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    
    try {
      // Get profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      let userProfile;
      
      // If profile doesn't exist, create it
      if (error || !profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.full_name || 
                  supabaseUser.user_metadata?.name || 
                  supabaseUser.email?.split('@')[0] || 'User',
            subscription_tier: 'free',
            total_conversation_minutes: 25,
            used_conversation_minutes: 0
          })
          .select('*')
          .single();
        
        if (createError) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        
        userProfile = {
          id: newProfile.id,
          name: newProfile.name,
          email: supabaseUser.email || '',
          avatar: supabaseUser.user_metadata?.avatar_url || 
                  generateGravatarUrl(supabaseUser.email || ''),
          subscription_tier: newProfile.subscription_tier || 'free',
          total_conversation_minutes: newProfile.total_conversation_minutes || 25,
          used_conversation_minutes: newProfile.used_conversation_minutes || 0
        };
      } else {
        // Use existing profile
        userProfile = {
          id: profile.id,
          name: profile.name,
          email: supabaseUser.email || '',
          avatar: supabaseUser.user_metadata?.avatar_url || 
                  generateGravatarUrl(supabaseUser.email || ''),
          subscription_tier: profile.subscription_tier || 'free',
          total_conversation_minutes: profile.total_conversation_minutes || 25,
          used_conversation_minutes: profile.used_conversation_minutes || 0
        };
      }
      
      set({ user: userProfile, isAuthenticated: true, loading: false });
    } catch (error) {
      console.error('[AuthStore] Error handling session:', error);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Auth state listener will handle the session
    } catch (error) {
      console.error('[AuthStore] Sign in error:', error);
      set({ loading: false });
      throw error;
    }
  },

  signInWithOAuth: async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'interviewai://auth/callback',
          queryParams: {
            prompt: 'select_account',
          }
        }
      });

      if (error) throw error;

      // For React Native, we open the OAuth URL in the browser
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'interviewai://auth/callback'
        );

        if (result.type === 'success' && result.url) {
          // Parse the URL to extract tokens
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) throw sessionError;
            if (sessionData.session) {
              await get().handleSession(sessionData.session);
            }
          }
        } else if (result.type === 'cancel') {
          throw new Error('Authentication was cancelled');
        }
      }
    } catch (error) {
      console.error('[AuthStore] OAuth error:', error);
      throw error;
    }
  },

  signUp: async (credentials: { email: string; password: string; name: string }) => {
    set({ loading: true });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name,
          },
        }
      });
      
      if (error) throw error;
      
      if (data.user && data.session) {
        // Auth state listener will handle the session
      } else if (data.user && !data.session) {
        // Email confirmation required
        set({ loading: false });
        throw new Error('Please check your email and click the confirmation link to complete your registration.');
      }
    } catch (error) {
      console.error('[AuthStore] Signup error:', error);
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    // Clear local state immediately
    set({ 
      user: null, 
      isAuthenticated: false, 
      currentSessionId: null,
      loading: false
    });
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthStore] Supabase signOut error:', error);
      }
      
      // Force a session refresh to reset Supabase's internal state
      await supabase.auth.getSession();
    } catch (error) {
      console.error('[AuthStore] Sign out error:', error);
    }
  },

  updateUser: (updates: Partial<UserProfile>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ 
        user: { ...currentUser, ...updates } 
      });
    }
  },
})); 